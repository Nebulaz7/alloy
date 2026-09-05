// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockMemeToken} from "../src/mocks/MockMemeToken.sol";

contract MockMemeTokenTest is Test {
    MockMemeToken public clanker;
    MockMemeToken public higher;
    MockMemeToken public degen;

    address public user = address(0x123);

    function setUp() public {
        clanker = new MockMemeToken("Clanker Token", "CLANKER");
        higher = new MockMemeToken("Higher", "HIGHER");
        degen = new MockMemeToken("Degen", "DEGEN");
    }

    function test_MetadataAndDecimals() public view {
        assertEq(clanker.name(), "Clanker Token");
        assertEq(clanker.symbol(), "CLANKER");
        assertEq(clanker.decimals(), 18);

        assertEq(higher.symbol(), "HIGHER");
        assertEq(degen.symbol(), "DEGEN");
    }

    function test_MintAndTransfer() public {
        clanker.mint(user, 500e18);
        assertEq(clanker.balanceOf(user), 500e18);

        vm.prank(user);
        clanker.transfer(address(0x456), 200e18);
        assertEq(clanker.balanceOf(address(0x456)), 200e18);
        assertEq(clanker.balanceOf(user), 300e18);
    }
}
