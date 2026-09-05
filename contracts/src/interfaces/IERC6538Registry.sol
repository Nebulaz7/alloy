// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IERC6538Registry
 * @notice Standard interface for the ERC-6538 stealth meta-address registry.
 * Maps an account to their registered stealth meta-address (K_spend || K_view).
 */
interface IERC6538Registry {
    /**
     * @notice Emitted when a registrant updates their stealth meta-address for a scheme.
     * @param registrant The address of the user registering the keys
     * @param schemeId The stealth address scheme (1 = secp256k1)
     * @param stealthMetaAddress The 66-byte encoded meta-address
     */
    event StealthMetaAddressSet(
        address indexed registrant,
        uint256 indexed schemeId,
        bytes stealthMetaAddress
    );

    /**
     * @notice Registers or updates a stealth meta-address for msg.sender.
     * @param schemeId The scheme identifier
     * @param stealthMetaAddress The encoded stealth meta-address
     */
    function registerKeys(uint256 schemeId, bytes calldata stealthMetaAddress) external;

    /**
     * @notice Registers or updates a stealth meta-address on behalf of an account using an EIP-712 signature.
     * @param registrant The account owning the stealth meta-address
     * @param schemeId The scheme identifier
     * @param signature The EIP-712 signature over the registration request
     * @param stealthMetaAddress The encoded stealth meta-address
     */
    function registerKeysOnBehalf(
        address registrant,
        uint256 schemeId,
        bytes calldata signature,
        bytes calldata stealthMetaAddress
    ) external;

    /**
     * @notice Returns the stealth meta-address registered for an account under a scheme.
     * @param registrant Address to look up
     * @param schemeId Scheme identifier
     */
    function stealthMetaAddressOf(address registrant, uint256 schemeId)
        external
        view
        returns (bytes memory);

    /**
     * @notice Returns the registration nonce for an account (used in EIP-712 signatures).
     */
    function nonceOf(address registrant) external view returns (uint256);

    /**
     * @notice Returns the EIP-712 domain separator.
     */
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}
