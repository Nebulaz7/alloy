// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC6538Registry} from "../interfaces/IERC6538Registry.sol";

/**
 * @title ERC6538Registry
 * @notice Standard ERC-6538 registry for stealth meta-addresses.
 * Allows accounts to publish their spending and viewing public keys, directly or via gasless EIP-712 signatures.
 */
contract ERC6538Registry is IERC6538Registry, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant ERC6538_REGISTRATION_TYPEHASH = keccak256(
        "Erc6538Registry(uint256 schemeId,bytes stealthMetaAddress,uint256 nonce)"
    );

    /// @notice registrant => schemeId => stealthMetaAddress
    mapping(address => mapping(uint256 => bytes)) internal _stealthMetaAddresses;

    /// @notice Nonce tracking for EIP-712 registrations
    mapping(address => uint256) public override nonceOf;

    error InvalidSignature();
    error InvalidLength();

    constructor() EIP712("ERC6538Registry", "1.0") {}

    /**
     * @notice Registers or updates a stealth meta-address for msg.sender.
     */
    function registerKeys(uint256 schemeId, bytes calldata stealthMetaAddress) external override {
        _registerKeys(msg.sender, schemeId, stealthMetaAddress);
    }

    /**
     * @notice Registers keys on behalf of an account using an EIP-712 signature.
     */
    function registerKeysOnBehalf(
        address registrant,
        uint256 schemeId,
        bytes calldata signature,
        bytes calldata stealthMetaAddress
    ) external override {
        uint256 currentNonce = nonceOf[registrant];

        bytes32 structHash = keccak256(
            abi.encode(
                ERC6538_REGISTRATION_TYPEHASH,
                schemeId,
                keccak256(stealthMetaAddress),
                currentNonce
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);

        if (signer != registrant) revert InvalidSignature();

        unchecked {
            nonceOf[registrant] = currentNonce + 1;
        }

        _registerKeys(registrant, schemeId, stealthMetaAddress);
    }

    /**
     * @notice Internal helper to set stealth meta-address and emit event.
     */
    function _registerKeys(
        address registrant,
        uint256 schemeId,
        bytes calldata stealthMetaAddress
    ) internal {
        // Scheme 1 (secp256k1) requires 66 bytes (two 33-byte compressed keys)
        if (schemeId == 1 && stealthMetaAddress.length != 66) {
            revert InvalidLength();
        }

        _stealthMetaAddresses[registrant][schemeId] = stealthMetaAddress;
        emit StealthMetaAddressSet(registrant, schemeId, stealthMetaAddress);
    }

    /**
     * @notice Returns the registered stealth meta-address for a registrant and scheme.
     */
    function stealthMetaAddressOf(address registrant, uint256 schemeId)
        external
        view
        override
        returns (bytes memory)
    {
        return _stealthMetaAddresses[registrant][schemeId];
    }

    /**
     * @notice Returns the EIP-712 domain separator.
     */
    function DOMAIN_SEPARATOR() external view override returns (bytes32) {
        return _domainSeparatorV4();
    }
}
