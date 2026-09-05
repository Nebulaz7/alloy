// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IL2Resolver
 * @notice Standard interface for ENS / Basenames L2Resolver on Base.
 * Implements address and text record resolution for .base.eth domains.
 */
interface IL2Resolver {
    event AddrChanged(bytes32 indexed node, address a);
    event TextChanged(
        bytes32 indexed node,
        string indexed indexedKey,
        string key,
        string value
    );

    /**
     * @notice Returns the address associated with an ENS node.
     * @param node The ENS namehash node
     */
    function addr(bytes32 node) external view returns (address);

    /**
     * @notice Returns the text record associated with an ENS node and key.
     * @param node The ENS namehash node
     * @param key The text record key (e.g., "stealth", "avatar", "url")
     */
    function text(bytes32 node, string calldata key)
        external
        view
        returns (string memory);

    /**
     * @notice Sets the address associated with an ENS node.
     * @param node The ENS namehash node
     * @param a The address to set
     */
    function setAddr(bytes32 node, address a) external;

    /**
     * @notice Sets the text record associated with an ENS node and key.
     * @param node The ENS namehash node
     * @param key The text record key
     * @param value The text record value
     */
    function setText(
        bytes32 node,
        string calldata key,
        string calldata value
    ) external;
}
