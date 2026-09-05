// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAlloyBasenameResolver
 * @notice Interface for Alloy's dual-tier Basename resolution engine.
 * Resolves human-readable Basenames (.base.eth) to ERC-5564 stealth meta-addresses.
 */
interface IAlloyBasenameResolver {
    /**
     * @notice Resolves an ENS namehash node to an ERC-5564 stealth meta-address using dual-tier lookup.
     * @param node The ENS namehash node
     * @return stealthMetaAddress 66-byte encoded stealth meta-address (K_spend || K_view)
     * @return fallbackAddress The registrant's public wallet address from addr(node)
     */
    function resolveStealthMetaAddress(bytes32 node)
        external
        view
        returns (bytes memory stealthMetaAddress, address fallbackAddress);

    /**
     * @notice Convenience method to resolve a full domain string (e.g. "bob.base.eth" or "bob").
     * @param name The Basename string
     * @return stealthMetaAddress 66-byte encoded stealth meta-address
     * @return fallbackAddress The registrant's public wallet address
     */
    function resolveBasename(string calldata name)
        external
        view
        returns (bytes memory stealthMetaAddress, address fallbackAddress);

    /**
     * @notice Calculates the ENS namehash for any dot-separated domain name.
     */
    function namehash(string memory name) external pure returns (bytes32);

    /**
     * @notice Calculates the ENS namehash for a subdomain directly under .base.eth (e.g. "bob" -> "bob.base.eth").
     */
    function namehashBaseSubdomain(string memory label) external view returns (bytes32);
}
