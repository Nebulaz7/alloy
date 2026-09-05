// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockB20TokenizedStock} from "../src/mocks/MockB20TokenizedStock.sol";
import {MockStablecoin} from "../src/mocks/MockStablecoin.sol";
import {MockDEX} from "../src/mocks/MockDEX.sol";
import {AlloyHarvestRouter} from "../src/AlloyHarvestRouter.sol";

contract AlloyHarvestRouterTest is Test {
    MockB20TokenizedStock public aapl;
    MockStablecoin public usdc;
    MockStablecoin public cngn;
    MockDEX public dex;
    AlloyHarvestRouter public router;

    address public operator = address(0x1);
    address public alice = address(0x2);
    address public bob = address(0x3);

    uint256 internal alicePrivateKey = 0xA11CE;

    function setUp() public {
        alice = vm.addr(alicePrivateKey);

        // 1. Deploy B20 Stock (AAPL: $200 initial spot)
        aapl = new MockB20TokenizedStock("Apple Tokenized Stock", "AAPLc", operator);

        // 2. Deploy Stablecoins (USDC = 6 decimals, cNGN = 6 decimals)
        usdc = new MockStablecoin("USD Coin", "USDC", 6);
        cngn = new MockStablecoin("Compliant NGN", "cNGN", 6);

        // 3. Deploy DEX and register oracle prices
        dex = new MockDEX();
        dex.setPrice(address(aapl), 200e18); // $200.00
        dex.setPrice(address(usdc), 1e18);   // $1.00
        // 1 USD = 1,600 NGN -> 1 NGN = $0.000625 -> 6.25e14 in 18 decimals
        dex.setPrice(address(cngn), 625000000000000);

        // 4. Fund DEX with liquidity
        usdc.mint(address(dex), 1_000_000 * 1e6); // 1M USDC
        cngn.mint(address(dex), 1_000_000_000 * 1e6); // 1B cNGN

        // 5. Deploy Router
        router = new AlloyHarvestRouter(address(dex));

        // 6. Fund Alice with 100 shares of AAPLc
        aapl.mint(alice, 100e18);
    }

    function test_NoDividendInitially() public view {
        (uint256 surplus, uint256 usdVal) = router.getPendingDividend(alice, address(aapl));
        assertEq(surplus, 0);
        assertEq(usdVal, 0);
    }

    function test_DividendAccrualAndPendingCalculation() public {
        // Operator distributes $2.50 dividend on $200 AAPL (+1.25%)
        // Multiplier: 1.0e18 -> 1.0125e18 (10125e14)
        vm.prank(operator);
        aapl.distributeDividend(25e17, 200e18);

        assertEq(aapl.multiplier(), 10125e14);

        // Expected surplus calculation:
        // surplus = 100e18 * (10125e14 - 1e18) / 10125e14
        // surplus = 100e18 * 125e14 / 10125e14 = 1.234567901234567901e18
        (uint256 surplus, uint256 usdVal) = router.getPendingDividend(alice, address(aapl));

        uint256 expectedSurplus = (uint256(100e18) * 125e14) / 10125e14;
        assertEq(surplus, expectedSurplus);

        // Estimated USD: surplus * $200 / 1e18 = ~ $246.91
        uint256 expectedUsd = (expectedSurplus * uint256(200e18)) / 1e18;
        assertEq(usdVal, expectedUsd);
    }

    function test_HarvestAndSwapToUSDC_PreservesPrincipal() public {
        // 1. Distribute dividend
        vm.prank(operator);
        aapl.distributeDividend(25e17, 200e18);

        (uint256 surplus, ) = router.getPendingDividend(alice, address(aapl));

        // 2. Alice approves router
        vm.startPrank(alice);
        aapl.approve(address(router), surplus);

        // 3. Harvest and route USDC to Bob
        uint256 usdcOut = router.harvestToTarget(
            address(aapl),
            address(usdc),
            0, // minAmountOut
            bob
        );
        vm.stopPrank();

        // 4. Verify Bob received the USDC payout (~$246.91)
        assertTrue(usdcOut > 0);
        assertEq(usdc.balanceOf(bob), usdcOut);

        // 5. PRINCIPAL CONSERVATION INVARIANT:
        // Alice started with 100 shares at multiplier 1.0 -> Effective claim was 100 shares.
        // After harvest, her raw balance is reduced by surplus shares.
        uint256 aliceRawRemaining = aapl.balanceOf(alice);
        assertEq(aliceRawRemaining, 100e18 - surplus);

        // Her new effective balance at the new multiplier (1.0125):
        uint256 aliceEffectiveRemaining = aapl.effectiveBalanceOf(alice);

        // Invariant: effective claim must match the original 100 shares within 1 wei rounding!
        assertApproxEqAbs(aliceEffectiveRemaining, 100e18, 1);

        // 6. Verify subsequent harvest has 0 pending
        (uint256 newSurplus, ) = router.getPendingDividend(alice, address(aapl));
        assertEq(newSurplus, 0);
    }

    function test_HarvestToLocalCurrency_cNGN() public {
        vm.prank(operator);
        aapl.distributeDividend(25e17, 200e18);

        (uint256 surplus, ) = router.getPendingDividend(alice, address(aapl));

        vm.startPrank(alice);
        aapl.approve(address(router), surplus);
        uint256 cngnOut = router.harvestToTarget(address(aapl), address(cngn), 0, bob);
        vm.stopPrank();

        // Bob receives Nigerian Naira stablecoin
        assertTrue(cngnOut > 0);
        assertEq(cngn.balanceOf(bob), cngnOut);
    }

    function test_DoubleHarvestReverts() public {
        vm.prank(operator);
        aapl.distributeDividend(25e17, 200e18);

        (uint256 surplus, ) = router.getPendingDividend(alice, address(aapl));

        vm.startPrank(alice);
        aapl.approve(address(router), surplus * 2);
        router.harvestToTarget(address(aapl), address(usdc), 0, bob);

        // Immediate second harvest without a new dividend distribution must revert
        vm.expectRevert(AlloyHarvestRouter.NoPendingDividend.selector);
        router.harvestToTarget(address(aapl), address(usdc), 0, bob);
        vm.stopPrank();
    }

    function test_HarvestWithPermit_Gasless() public {
        vm.prank(operator);
        aapl.distributeDividend(25e17, 200e18);

        (uint256 surplus, ) = router.getPendingDividend(alice, address(aapl));

        // Sign EIP-2612 permit
        uint256 deadline = block.timestamp + 1 hours;
        bytes32 digest = _getPermitDigest(
            address(aapl),
            alice,
            address(router),
            surplus,
            aapl.nonces(alice),
            deadline
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(alicePrivateKey, digest);

        // Relayer or Alice calls harvestWithPermit
        vm.prank(alice);
        uint256 usdcOut = router.harvestWithPermit(
            address(aapl),
            address(usdc),
            0,
            bob,
            deadline,
            v,
            r,
            s
        );

        assertTrue(usdcOut > 0);
        assertEq(usdc.balanceOf(bob), usdcOut);
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
                MockB20TokenizedStock(token).DOMAIN_SEPARATOR(),
                structHash
            )
        );
    }
}
