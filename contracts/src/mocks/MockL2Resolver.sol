// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IL2Resolver} from "../interfaces/IL2Resolver.sol";

/**
 * @title MockL2Resolver
 * @notice Simulation contract for Base's L2Resolver (0x426fA03fB86E510d0Dd9F70335Cf102a98b10875).
 * Used for local testing and Base Sepolia testnet deployment.
 */
contract MockL2Resolver is IL2Resolver {
    mapping(bytes32 => address) private _addresses;
    mapping(bytes32 => mapping(string => string)) private _texts;

    /**
     * @notice Returns the address associated with an ENS node.
     */
    function addr(bytes32 node) external view override returns (address) {
        return _addresses[node];
    }

    /**
     * @notice Returns the text record associated with an ENS node and key.
     */
    function text(bytes32 node, string calldata key)
        external
        view
        override
        returns (string memory)
    {
        return _texts[node][key];
    }

    /**
     * @notice Sets the address associated with an ENS node.
     */
    function setAddr(bytes32 node, address a) external override {
        _addresses[node] = a;
        emit AddrChanged(node, a);
    }

    /**
     * @notice Sets the text record associated with an ENS node and key.
     */
    function setText(
        bytes32 node,
        string calldata key,
        string calldata value
    ) external override {
        _texts[node][key] = value;
        emit TextChanged(node, key, key, value);
    }
}
