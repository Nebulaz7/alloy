// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IL2Resolver} from "../interfaces/IL2Resolver.sol";
import {IERC6538Registry} from "../interfaces/IERC6538Registry.sol";
import {IAlloyBasenameResolver} from "../interfaces/IAlloyBasenameResolver.sol";

/**
 * @title AlloyBasenameResolver
 * @notice Dual-tier identity resolution contract for Base Basenames (.base.eth).
 * Seamlessly resolves human-readable names to ERC-5564 stealth meta-addresses.
 */
contract AlloyBasenameResolver is IAlloyBasenameResolver {
    /// @notice Scheme ID for secp256k1 with view tag
    uint256 public constant SCHEME_ID_SECP256K1 = 1;

    /// @notice Address of the Base L2Resolver
    address public immutable l2Resolver;

    /// @notice Address of the canonical ERC-6538 Registry
    address public immutable erc6538Registry;

    /// @notice Precomputed ENS namehash of "eth"
    bytes32 public constant ETH_NODE =
        0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae;

    /// @notice Precomputed ENS namehash of "base.eth"
    /// keccak256(abi.encodePacked(ETH_NODE, keccak256("base")))
    bytes32 public immutable BASE_ETH_NODE;

    error BasenameNotFound(string name);
    error NoStealthKeysFound(string name, address fallbackAddress);
    error InvalidStealthFormat(string record);

    constructor(address _l2Resolver, address _erc6538Registry) {
        l2Resolver = _l2Resolver;
        erc6538Registry = _erc6538Registry;

        // Compute namehash("base.eth")
        BASE_ETH_NODE = keccak256(
            abi.encodePacked(ETH_NODE, keccak256(bytes("base")))
        );
    }

    /**
     * @notice Resolves a Basename node using the dual-tier lookup pipeline.
     */
    function resolveStealthMetaAddress(bytes32 node)
        public
        view
        override
        returns (bytes memory stealthMetaAddress, address fallbackAddress)
    {
        fallbackAddress = IL2Resolver(l2Resolver).addr(node);

        // --- TIER 1: Check direct "stealth" text record on L2Resolver ---
        string memory record = IL2Resolver(l2Resolver).text(node, "stealth");
        if (bytes(record).length > 0) {
            stealthMetaAddress = _parseStealthRecord(record);
            if (stealthMetaAddress.length == 66) {
                return (stealthMetaAddress, fallbackAddress);
            }
        }

        // --- TIER 2: Fallback to ERC-6538 registry lookup by resolved address ---
        if (fallbackAddress != address(0) && erc6538Registry != address(0)) {
            stealthMetaAddress = IERC6538Registry(erc6538Registry).stealthMetaAddressOf(
                fallbackAddress,
                SCHEME_ID_SECP256K1
            );
            if (stealthMetaAddress.length == 66) {
                return (stealthMetaAddress, fallbackAddress);
            }
        }

        return (stealthMetaAddress, fallbackAddress);
    }

    /**
     * @notice Resolves a string Basename (e.g. "bob" or "bob.base.eth").
     */
    function resolveBasename(string calldata name)
        external
        view
        override
        returns (bytes memory stealthMetaAddress, address fallbackAddress)
    {
        bytes32 node;

        // If the name does not contain dots, assume it is a direct subdomain under .base.eth
        if (!_containsDot(name)) {
            node = namehashBaseSubdomain(name);
        } else {
            node = namehash(name);
        }

        (stealthMetaAddress, fallbackAddress) = resolveStealthMetaAddress(node);

        if (fallbackAddress == address(0) && stealthMetaAddress.length == 0) {
            revert BasenameNotFound(name);
        }

        if (stealthMetaAddress.length != 66) {
            revert NoStealthKeysFound(name, fallbackAddress);
        }
    }

    /**
     * @notice Computes the namehash for a subdomain directly under .base.eth (e.g. "bob" -> "bob.base.eth").
     */
    function namehashBaseSubdomain(string memory label)
        public
        view
        override
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(BASE_ETH_NODE, keccak256(bytes(label)))
        );
    }

    /**
     * @notice Computes standard ENS namehash for any domain string.
     */
    function namehash(string memory name)
        public
        pure
        override
        returns (bytes32)
    {
        bytes memory nameBytes = bytes(name);
        if (nameBytes.length == 0) {
            return bytes32(0);
        }

        // Split by dots and compute namehash from right to left
        return _namehashRecursion(nameBytes, 0);
    }

    function _namehashRecursion(bytes memory nameBytes, uint256 start)
        internal
        pure
        returns (bytes32)
    {
        if (start >= nameBytes.length) {
            return bytes32(0);
        }

        // Find next dot
        uint256 dotIndex = nameBytes.length;
        for (uint256 i = start; i < nameBytes.length; i++) {
            if (nameBytes[i] == ".") {
                dotIndex = i;
                break;
            }
        }

        // Label is from start to dotIndex
        bytes memory label = new bytes(dotIndex - start);
        for (uint256 j = 0; j < label.length; j++) {
            label[j] = nameBytes[start + j];
        }

        bytes32 remainderNode = bytes32(0);
        if (dotIndex < nameBytes.length) {
            remainderNode = _namehashRecursion(nameBytes, dotIndex + 1);
        }

        return keccak256(abi.encodePacked(remainderNode, keccak256(label)));
    }

    /**
     * @notice Parses a stealth meta-address text record string into 66 bytes.
     * Accepts:
     *   - "st:eth:0x<132 hex chars>" (139 chars)
     *   - "0x<132 hex chars>" (134 chars)
     *   - "<132 hex chars>" (132 chars)
     */
    function _parseStealthRecord(string memory record)
        internal
        pure
        returns (bytes memory)
    {
        bytes memory recBytes = bytes(record);
        uint256 hexStart = 0;

        // Check for "st:eth:0x" prefix (7 chars)
        if (
            recBytes.length >= 7 &&
            recBytes[0] == "s" &&
            recBytes[1] == "t" &&
            recBytes[2] == ":" &&
            recBytes[3] == "e" &&
            recBytes[4] == "t" &&
            recBytes[5] == "h" &&
            recBytes[6] == ":"
        ) {
            hexStart = 7;
            if (
                recBytes.length >= 9 &&
                recBytes[7] == "0" &&
                (recBytes[8] == "x" || recBytes[8] == "X")
            ) {
                hexStart = 9;
            }
        } else if (
            recBytes.length >= 2 &&
            recBytes[0] == "0" &&
            (recBytes[1] == "x" || recBytes[1] == "X")
        ) {
            hexStart = 2;
        }

        uint256 hexLen = recBytes.length - hexStart;
        // 66 bytes = 132 hex characters
        if (hexLen != 132) {
            return new bytes(0);
        }

        bytes memory result = new bytes(66);
        for (uint256 i = 0; i < 66; i++) {
            uint8 high = _fromHexChar(uint8(recBytes[hexStart + i * 2]));
            uint8 low = _fromHexChar(uint8(recBytes[hexStart + i * 2 + 1]));
            if (high == 255 || low == 255) {
                return new bytes(0);
            }
            result[i] = bytes1((high << 4) | low);
        }

        return result;
    }

    function _fromHexChar(uint8 c) internal pure returns (uint8) {
        if (c >= 48 && c <= 57) {
            return c - 48; // '0'-'9'
        }
        if (c >= 65 && c <= 70) {
            return c - 55; // 'A'-'F'
        }
        if (c >= 97 && c <= 102) {
            return c - 87; // 'a'-'f'
        }
        return 255; // Invalid
    }

    function _containsDot(string memory s) internal pure returns (bool) {
        bytes memory b = bytes(s);
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] == ".") return true;
        }
        return false;
    }
}
