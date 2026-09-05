// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockL2Resolver} from "../src/mocks/MockL2Resolver.sol";
import {ERC6538Registry} from "../src/privacy/ERC6538Registry.sol";
import {AlloyBasenameResolver} from "../src/identity/AlloyBasenameResolver.sol";
import {MockB20TokenizedStock} from "../src/mocks/MockB20TokenizedStock.sol";
import {MockStablecoin} from "../src/mocks/MockStablecoin.sol";
import {MockDEX} from "../src/mocks/MockDEX.sol";
import {AlloyHarvestRouter} from "../src/AlloyHarvestRouter.sol";
import {ERC5564Announcer} from "../src/privacy/ERC5564Announcer.sol";

contract AlloyBasenameResolverTest is Test {
    MockL2Resolver public l2Resolver;
    ERC6538Registry public registry;
    AlloyBasenameResolver public basenameResolver;

    // Bob's Identity
    address public bobPublicWallet = address(0xB0B);
    bytes internal sampleMetaAddress =
        hex"0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
        hex"02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5";

    // "st:eth:0x" + 132 hex characters
    string internal sampleMetaAddressString =
        "st:eth:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f8179802c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5";

    function setUp() public {
        l2Resolver = new MockL2Resolver();
        registry = new ERC6538Registry();
        basenameResolver = new AlloyBasenameResolver(
            address(l2Resolver),
            address(registry)
        );
    }

    function test_NamehashConsistency() public view {
        bytes32 nodeFull = basenameResolver.namehash("bob.base.eth");
        bytes32 nodeSub = basenameResolver.namehashBaseSubdomain("bob");
        assertEq(nodeFull, nodeSub);
    }

    function test_Tier1_DirectTextRecordResolution() public {
        bytes32 node = basenameResolver.namehashBaseSubdomain("bob");
        l2Resolver.setAddr(node, bobPublicWallet);
        l2Resolver.setText(node, "stealth", sampleMetaAddressString);

        // Resolve via full name
        (bytes memory metaAddress, address fallbackAddr) =
            basenameResolver.resolveBasename("bob.base.eth");

        assertEq(fallbackAddr, bobPublicWallet);
        assertEq(metaAddress, sampleMetaAddress);

        // Resolve via short name
        (bytes memory metaAddressShort, ) =
            basenameResolver.resolveBasename("bob");
        assertEq(metaAddressShort, sampleMetaAddress);
    }

    function test_Tier2_FallbackViaERC6538Registry() public {
        bytes32 node = basenameResolver.namehashBaseSubdomain("alice");
        address alicePublic = address(0xA11CE);

        // Set address on L2Resolver, but NO text record
        l2Resolver.setAddr(node, alicePublic);

        // Alice registers keys in ERC-6538 Registry
        vm.prank(alicePublic);
        registry.registerKeys(1, sampleMetaAddress);

        // Fallback resolution should pick it up
        (bytes memory metaAddress, address fallbackAddr) =
            basenameResolver.resolveBasename("alice");

        assertEq(fallbackAddr, alicePublic);
        assertEq(metaAddress, sampleMetaAddress);
    }

    function test_RevertWhenBasenameNotFound() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                AlloyBasenameResolver.BasenameNotFound.selector,
                "unknown.base.eth"
            )
        );
        basenameResolver.resolveBasename("unknown.base.eth");
    }

    function test_RevertWhenNoStealthKeysFound() public {
        bytes32 node = basenameResolver.namehashBaseSubdomain("charlie");
        address charlie = address(0xC4A);

        // Charlie has a Basename address, but never set stealth keys in either tier
        l2Resolver.setAddr(node, charlie);

        vm.expectRevert(
            abi.encodeWithSelector(
                AlloyBasenameResolver.NoStealthKeysFound.selector,
                "charlie",
                charlie
            )
        );
        basenameResolver.resolveBasename("charlie");
    }
}
