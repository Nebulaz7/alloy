// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockB20TokenizedStock} from "../src/mocks/MockB20TokenizedStock.sol";
import {MockMemeToken} from "../src/mocks/MockMemeToken.sol";
import {MockDEX} from "../src/mocks/MockDEX.sol";
import {AlloyHarvestRouter} from "../src/AlloyHarvestRouter.sol";
import {ERC5564Announcer} from "../src/privacy/ERC5564Announcer.sol";
import {AlloyStealthRelayer} from "../src/privacy/AlloyStealthRelayer.sol";

contract AlloyMemeHarvestTest is Test {
    MockB20TokenizedStock public aapl;
    MockMemeToken public clanker;
    MockMemeToken public higher;
    MockMemeToken public degen;
    MockDEX public dex;
    ERC5564Announcer public announcer;
    AlloyStealthRelayer public relayer;
    AlloyHarvestRouter public router;

    address public operator = address(0x1);
    address public alice = address(0x2);
    address public bob = address(0x3);

    uint256 internal constant SECP256K1_N =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;

    uint256 internal bobSpendPrivKey = 0xB0B01;
    uint256 internal bobViewPrivKey = 0xB0B02;

    function setUp() public {
        // 1. Deploy Stock (AAPL = $200.00)
        aapl = new MockB20TokenizedStock("Apple Tokenized Stock", "AAPLc", operator);

        // 2. Deploy Meme Tokens
        clanker = new MockMemeToken("Clanker Token", "CLANKER"); // $5.00
        higher = new MockMemeToken("Higher", "HIGHER");           // $0.10
        degen = new MockMemeToken("Degen", "DEGEN");             // $0.02

        // 3. Deploy DEX and register prices
        dex = new MockDEX();
        dex.setPrice(address(aapl), 200e18);     // $200.00
        dex.setPrice(address(clanker), 5e18);    // $5.00
        dex.setPrice(address(higher), 1e17);     // $0.10 (1e17)
        dex.setPrice(address(degen), 2e16);      // $0.02 (2e16)

        // 4. Fund DEX with meme liquidity
        clanker.mint(address(dex), 1_000_000 * 1e18);
        higher.mint(address(dex), 10_000_000 * 1e18);
        degen.mint(address(dex), 50_000_000 * 1e18);

        // 5. Deploy Privacy & Router
        announcer = new ERC5564Announcer();
        relayer = new AlloyStealthRelayer();
        router = new AlloyHarvestRouter(address(dex), address(announcer));

        // 6. Fund Alice with 100 shares of AAPLc
        aapl.mint(alice, 100e18);
    }

    function test_DirectMemeHarvest_Clanker() public {
        // Operator distributes $2.50 dividend on $200 AAPL (+1.25%)
        vm.prank(operator);
        aapl.distributeDividend(25e17, 200e18);

        (uint256 surplus, uint256 usdVal) = router.getPendingDividend(alice, address(aapl));
        assertTrue(surplus > 0);

        // Alice harvests directly into $CLANKER
        vm.startPrank(alice);
        aapl.approve(address(router), surplus);

        uint256 clankerOut = router.harvestToMeme(
            address(aapl),
            address(clanker),
            0,
            alice
        );
        vm.stopPrank();

        // Check expected output: usdVal / $5.00 = clankerOut
        uint256 expectedClanker = (usdVal * 1e18) / 5e18;
        assertEq(clankerOut, expectedClanker);
        assertEq(clanker.balanceOf(alice), clankerOut);

        // Principal conservation invariant: Alice still has 100 shares effective claim
        assertApproxEqAbs(aapl.effectiveBalanceOf(alice), 100e18, 1);
    }

    function test_MemeGift_Higher() public {
        vm.prank(operator);
        aapl.distributeDividend(25e17, 200e18);

        (uint256 surplus, ) = router.getPendingDividend(alice, address(aapl));

        // Alice gifts dividend yield as $HIGHER to Bob
        vm.startPrank(alice);
        aapl.approve(address(router), surplus);

        uint256 higherOut = router.harvestToMeme(
            address(aapl),
            address(higher),
            0,
            bob
        );
        vm.stopPrank();

        assertTrue(higherOut > 0);
        assertEq(higher.balanceOf(bob), higherOut);
    }

    function test_StealthMemeHarvest_Degen() public {
        vm.prank(operator);
        aapl.distributeDividend(25e17, 200e18);

        // Derive Bob's stealth address
        uint256 r = 0x5555;
        uint256 sharedSecret = mulmod(r, bobViewPrivKey, SECP256K1_N);
        bytes32 sharedSecretHash = keccak256(abi.encodePacked(sharedSecret));
        uint256 h = uint256(sharedSecretHash) % SECP256K1_N;
        uint256 k_stealth = addmod(bobSpendPrivKey, h, SECP256K1_N);
        address stealthAddress = vm.addr(k_stealth);

        bytes memory ephemeralPubKey = abi.encodePacked(vm.addr(r));
        bytes memory metadata = abi.encodePacked(sharedSecretHash[0]);

        (uint256 surplus, ) = router.getPendingDividend(alice, address(aapl));

        // Alice harvests to Bob's one-time stealth address in $DEGEN
        vm.startPrank(alice);
        aapl.approve(address(router), surplus);

        uint256 degenOut = router.harvestToStealthMeme(
            address(aapl),
            address(degen),
            0,
            stealthAddress,
            ephemeralPubKey,
            metadata
        );
        vm.stopPrank();

        assertTrue(degenOut > 0);
        assertEq(degen.balanceOf(stealthAddress), degenOut);

        // Bob sweeps $DEGEN from 0-ETH stealth address via relayer
        uint256 relayerFee = 50e18; // 50 $DEGEN fee
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 digest = _getPermitDigest(
            address(degen),
            stealthAddress,
            address(relayer),
            degenOut,
            degen.nonces(stealthAddress),
            deadline
        );

        (uint8 v, bytes32 rSig, bytes32 sSig) = vm.sign(k_stealth, digest);

        address independentRelayer = address(0x888);
        vm.prank(independentRelayer);
        relayer.sweepWithPermit(
            address(degen),
            stealthAddress,
            bob,
            degenOut,
            relayerFee,
            deadline,
            v,
            rSig,
            sSig
        );

        // Bob receives net meme tokens on his main wallet
        assertEq(degen.balanceOf(bob), degenOut - relayerFee);
        assertEq(degen.balanceOf(stealthAddress), 0);
        assertEq(degen.balanceOf(independentRelayer), relayerFee);
    }

    function test_SlippageProtection_Reverts() public {
        vm.prank(operator);
        aapl.distributeDividend(25e17, 200e18);

        (uint256 surplus, ) = router.getPendingDividend(alice, address(aapl));

        vm.startPrank(alice);
        aapl.approve(address(router), surplus);

        // Set minMemeAmount impossibly high (e.g. 1,000,000 $CLANKER)
        vm.expectRevert();
        router.harvestToMeme(
            address(aapl),
            address(clanker),
            1_000_000e18,
            alice
        );
        vm.stopPrank();
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
                MockMemeToken(token).DOMAIN_SEPARATOR(),
                structHash
            )
        );
    }
}
