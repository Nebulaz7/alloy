// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC6538Registry} from "../src/privacy/ERC6538Registry.sol";
import {IERC6538Registry} from "../src/interfaces/IERC6538Registry.sol";

contract ERC6538RegistryTest is Test {
    ERC6538Registry public registry;

    uint256 internal bobPrivateKey = 0xB0B;
    address public bob;

    bytes internal validMetaAddress =
        hex"0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
        hex"02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5";

    event StealthMetaAddressSet(
        address indexed registrant,
        uint256 indexed schemeId,
        bytes stealthMetaAddress
    );

    function setUp() public {
        bob = vm.addr(bobPrivateKey);
        registry = new ERC6538Registry();
    }

    function test_RegisterKeysDirectly() public {
        vm.expectEmit(true, true, false, true);
        emit StealthMetaAddressSet(bob, 1, validMetaAddress);

        vm.prank(bob);
        registry.registerKeys(1, validMetaAddress);

        bytes memory retrieved = registry.stealthMetaAddressOf(bob, 1);
        assertEq(retrieved, validMetaAddress);
    }

    function test_RegisterKeysOnBehalf_EIP712() public {
        uint256 nonce = registry.nonceOf(bob);
        assertEq(nonce, 0);

        bytes32 structHash = keccak256(
            abi.encode(
                registry.ERC6538_REGISTRATION_TYPEHASH(),
                1,
                keccak256(validMetaAddress),
                nonce
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                registry.DOMAIN_SEPARATOR(),
                structHash
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(bobPrivateKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Relayer submits on Bob's behalf
        address relayer = address(0x999);
        vm.prank(relayer);
        registry.registerKeysOnBehalf(bob, 1, signature, validMetaAddress);

        assertEq(registry.stealthMetaAddressOf(bob, 1), validMetaAddress);
        assertEq(registry.nonceOf(bob), 1);
    }

    function test_RevertOnInvalidSignature() public {
        uint256 nonce = registry.nonceOf(bob);
        bytes32 structHash = keccak256(
            abi.encode(
                registry.ERC6538_REGISTRATION_TYPEHASH(),
                1,
                keccak256(validMetaAddress),
                nonce
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                registry.DOMAIN_SEPARATOR(),
                structHash
            )
        );

        // Signed by someone else (not Bob)
        uint256 eveKey = 0xEEE;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(eveKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.expectRevert(ERC6538Registry.InvalidSignature.selector);
        registry.registerKeysOnBehalf(bob, 1, signature, validMetaAddress);
    }

    function test_RevertOnInvalidLengthForScheme1() public {
        bytes memory shortKey = hex"123456";

        vm.prank(bob);
        vm.expectRevert(ERC6538Registry.InvalidLength.selector);
        registry.registerKeys(1, shortKey);
    }
}
