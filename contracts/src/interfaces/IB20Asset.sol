// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/**
 * @title IB20Asset
 * @notice Interface for Base B20 Native Token Standard (Asset Variant).
 * Represents real-world equities (e.g. AAPLc, NVDAc) where dividends and corporate
 * actions adjust an on-chain multiplier rather than rebasing user balances.
 */
interface IB20Asset is IERC20, IERC20Metadata {
    /**
     * @notice Emitted when the asset multiplier is updated.
     * @param oldMultiplier The previous multiplier value (scaled by 1e18)
     * @param newMultiplier The new multiplier value (scaled by 1e18)
     */
    event MultiplierUpdated(uint256 oldMultiplier, uint256 newMultiplier);

    /**
     * @notice Emitted when a simulated or real dividend distribution triggers a multiplier change.
     * @param dividendPerShareWei Dividend cash value per share in 18-decimal fixed point
     * @param newMultiplier The updated multiplier following the dividend event
     */
    event DividendDistributed(uint256 dividendPerShareWei, uint256 newMultiplier);

    /**
     * @notice Returns the current asset multiplier scaled by 1e18.
     * Starts at 1e18 (1.0x).
     */
    function multiplier() external view returns (uint256);

    /**
     * @notice Returns the effective share claim of an account accounting for the multiplier.
     * Effective Balance = (balanceOf(account) * multiplier) / 1e18.
     * @param account The address of the holder
     */
    function effectiveBalanceOf(address account) external view returns (uint256);

    /**
     * @notice Updates the multiplier (restricted to OPERATOR_ROLE in production).
     * @param newMultiplier The new multiplier value (must be >= current multiplier for dividends)
     */
    function updateMultiplier(uint256 newMultiplier) external;
}
