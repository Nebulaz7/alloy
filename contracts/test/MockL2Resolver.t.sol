// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockL2Resolver} from "../src/mocks/MockL2Resolver.sol";
import {IL2Resolver} from "../src/interfaces/IL2Resolver.sol";

contract MockL2ResolverTest is Test {
    MockL2Resolver public resolver;
    bytes32 public testNode = keccak256("test.base.eth");

    function setUp() public {
        resolver = new MockL2Resolver();
    }

    function test_SetAndGetAddr() public {
        address user = address(0x123);

        vm.expectEmit(true, false, false, true);
        emit IL2Resolver.AddrChanged(testNode, user);

        resolver.setAddr(testNode, user);
        assertEq(resolver.addr(testNode), user);
    }

    function test_SetAndGetText() public {
        string memory key = "stealth";
        string memory value = "st:eth:0x123456";

        vm.expectEmit(true, true, false, true);
        emit IL2Resolver.TextChanged(testNode, key, key, value);

        resolver.setText(testNode, key, value);
        assertEq(resolver.text(testNode, key), value);
    }
}
