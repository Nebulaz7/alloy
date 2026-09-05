// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockB20TokenizedStock} from "../src/mocks/MockB20TokenizedStock.sol";
import {MockStablecoin} from "../src/mocks/MockStablecoin.sol";
import {MockDEX} from "../src/mocks/MockDEX.sol";
import {AlloyHarvestRouter} from "../src/AlloyHarvestRouter.sol";
import {ERC5564Announcer} from "../src/privacy/ERC5564Announcer.sol";
import {ERC6538Registry} from "../src/privacy/ERC6538Registry.sol";
import {AlloyStealthRelayer} from "../src/privacy/AlloyStealthRelayer.sol";

contract AlloyStealthHarvestTest is Test {
    MockB20TokenizedStock public aapl;
    MockStablecoin public usdc;
    MockDEX public dex;
    ERC5564Announcer public announcer;
    ERC6538Registry public registry;
    AlloyStealthRelayer public relayer;
    AlloyHarvestRouter public router;

    address public operator = address(0x1);
    address public alice = address(0x2);

    // Secp256k1 Curve Order
    uint256 internal constant SECP256K1_N =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;

    // Bob's Keys
    uint256 internal bobSpendPrivKey = 0xB0B01;
    uint256 internal bobViewPrivKey = 0xB0B02;
    address public bobPublicWallet;
    address public bobColdWallet = address(0xC01D);

    function setUp() public {
        bobPublicWallet = vm.addr(bobSpendPrivKey);

        // 1. Deploy Stocks & Stablecoins
        aapl = new MockB20TokenizedStock("Apple Tokenized Stock", "AAPLc", operator);
        usdc = new MockStablecoin("USD Coin", "USDC", 6);

        // 2. Deploy DEX & set liquidity
        dex = new MockDEX();
        dex.setPrice(address(aapl), 200e18); // $200.00
        dex.setPrice(address(usdc), 1e18);   // $1.00
        usdc.mint(address(dex), 1_000_000 * 1e6);

        // 3. Deploy Privacy Infrastructure
        announcer = new ERC5564Announcer();
        registry = new ERC6538Registry();
        relayer = new AlloyStealthRelayer();

        // 4. Deploy Router
        router = new AlloyHarvestRouter(address(dex), address(announcer));

        // 5. Fund Alice with 100 shares of AAPLc
        aapl.mint(alice, 100e18);
    }

    function _deriveStealth(uint256 r)
        internal
        view
        returns (
            uint256 k_stealth,
            address stealthAddress,
            bytes memory ephemeralPubKey,
            bytes memory metadata
        )
    {
        uint256 sharedSecret = mulmod(r, bobViewPrivKey, SECP256K1_N);
        bytes32 sharedSecretHash = keccak256(abi.encodePacked(sharedSecret));
        uint256 h = uint256(sharedSecretHash) % SECP256K1_N;

        k_stealth = addmod(bobSpendPrivKey, h, SECP256K1_N);
        stealthAddress = vm.addr(k_stealth);

        ephemeralPubKey = abi.encodePacked(vm.addr(r));
        metadata = abi.encodePacked(sharedSecretHash[0]);
    }

    function _sweepViaRelayer(
        uint256 k_stealth,
        address stealthAddress,
        uint256 amount,
        uint256 fee
    ) internal returns (address independentRelayer) {
        independentRelayer = address(0x777);
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 digest = _getPermitDigest(
            address(usdc),
            stealthAddress,
            address(relayer),
            amount,
            usdc.nonces(stealthAddress),
            deadline
        );

        (uint8 v, bytes32 rSig, bytes32 sSig) = vm.sign(k_stealth, digest);

        vm.prank(independentRelayer);
        relayer.sweepWithPermit(
            address(usdc),
            stealthAddress,
            bobColdWallet,
            amount,
            fee,
            deadline,
            v,
            rSig,
            sSig
        );
    }

    function test_EndToEnd_HarvestToStealth_And_GaslessSweep() public {
        // --- STEP 1: BOB REGISTERS STEALTH META-ADDRESS ---
        bytes memory bobMetaAddress = new bytes(66);
        for (uint256 i = 0; i < 66; i++) {
            bobMetaAddress[i] = bytes1(uint8(i + 1));
        }

        vm.prank(bobPublicWallet);
        registry.registerKeys(1, bobMetaAddress);
        assertEq(registry.stealthMetaAddressOf(bobPublicWallet, 1), bobMetaAddress);

        // --- STEP 2: CORPORATE ACTION (DIVIDEND DISTRIBUTION) ---
        vm.prank(operator);
        aapl.distributeDividend(25e17, 200e18);
        assertEq(aapl.multiplier(), 10125e14);

        // --- STEP 3: SENDER DERIVES STEALTH ADDRESS ---
        (
            uint256 k_stealth,
            address stealthAddress,
            bytes memory ephemeralPubKey,
            bytes memory metadata
        ) = _deriveStealth(0xAAAA);

        // --- STEP 4: ALICE HARVESTS DIRECTLY TO STEALTH ADDRESS ---
        (uint256 surplus, ) = router.getPendingDividend(alice, address(aapl));
        assertTrue(surplus > 0);

        vm.startPrank(alice);
        aapl.approve(address(router), surplus);

        uint256 usdcOut = router.harvestToStealth(
            address(aapl),
            address(usdc),
            0,
            stealthAddress,
            ephemeralPubKey,
            metadata
        );
        vm.stopPrank();

        assertTrue(usdcOut > 0);
        assertEq(usdc.balanceOf(stealthAddress), usdcOut);
        assertApproxEqAbs(aapl.effectiveBalanceOf(alice), 100e18, 1);

        // --- STEP 5 & 6: BOB SWEEPS VIA RELAYER (0 ETH USED) ---
        uint256 relayerFee = 1e6; // $1.00 USDC
        address independentRelayer = _sweepViaRelayer(
            k_stealth,
            stealthAddress,
            usdcOut,
            relayerFee
        );

        // Verify settlement
        assertEq(usdc.balanceOf(stealthAddress), 0);
        assertEq(stealthAddress.balance, 0);
        assertEq(usdc.balanceOf(bobColdWallet), usdcOut - relayerFee);
        assertEq(usdc.balanceOf(independentRelayer), relayerFee);
        assertEq(usdc.balanceOf(bobPublicWallet), 0);
    }

    function _getPermitDigest(
        address token,
        address owner,
        address spender,
        uint256 value,
        uint256 nonce,
        uint256 deadline
    ) internal view returns (bytes32) {
        bytes32 PERMIT_TYPEHASH = keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );
        bytes32 structHash = keccak256(
            abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonce, deadline)
        );
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                MockStablecoin(token).DOMAIN_SEPARATOR(),
                structHash
            )
        );
    }
}
