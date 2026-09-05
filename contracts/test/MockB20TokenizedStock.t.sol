// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockB20TokenizedStock} from "../src/mocks/MockB20TokenizedStock.sol";

contract MockB20TokenizedStockTest is Test {
    MockB20TokenizedStock public stock;
    address public operator = address(0x1);
    address public alice = address(0x2);
    address public bob = address(0x3);

    function setUp() public {
        stock = new MockB20TokenizedStock("Apple Tokenized Stock", "AAPLc", operator);
    }

    function test_InitialState() public view {
        assertEq(stock.multiplier(), 1e18);
        assertEq(stock.name(), "Apple Tokenized Stock");
        assertEq(stock.symbol(), "AAPLc");
        assertTrue(stock.hasRole(stock.OPERATOR_ROLE(), operator));
    }

    function test_EffectiveBalanceEqualsRawInitially() public {
        stock.mint(alice, 100e18);
        assertEq(stock.balanceOf(alice), 100e18);
        assertEq(stock.effectiveBalanceOf(alice), 100e18);
    }

    function test_UpdateMultiplier() public {
        vm.prank(operator);
        stock.updateMultiplier(105e16); // +5% (1.05e18)

        assertEq(stock.multiplier(), 105e16);

        stock.mint(alice, 100e18);
        assertEq(stock.balanceOf(alice), 100e18);
        // Effective balance should be 105 shares
        assertEq(stock.effectiveBalanceOf(alice), 105e18);
    }

    function test_DistributeDividend() public {
        // Share price: $200.00 (200e18)
        // Dividend: $2.50 per share (25e17) -> +1.25%
        vm.prank(operator);
        stock.distributeDividend(25e17, 200e18);

        // Expected multiplier: 1e18 + (25e17 * 1e18 / 200e18) = 1.0125e18 (10125e14)
        assertEq(stock.multiplier(), 10125e14);
    }

    function test_RevertWhenNonOperatorUpdates() public {
        vm.prank(alice);
        vm.expectRevert();
        stock.updateMultiplier(11e17);
    }

    function test_RevertWhenMultiplierDecreases() public {
        vm.startPrank(operator);
        stock.updateMultiplier(11e17);
        vm.expectRevert(MockB20TokenizedStock.MultiplierCannotDecrease.selector);
        stock.updateMultiplier(105e16);
        vm.stopPrank();
    }
}
