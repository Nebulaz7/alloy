// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IB20Asset} from "../interfaces/IB20Asset.sol";

/**
 * @title MockB20TokenizedStock
 * @notice Simulation contract for Base B20 Native Token Standard (Asset Variant).
 * Implements an on-chain multiplier that tracks corporate dividend distributions
 * and stock splits without rebasing nominal holder balances.
 */
contract MockB20TokenizedStock is ERC20, ERC20Permit, AccessControl, IB20Asset {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    /// @notice Multiplier scale: 1e18 = 1.000000000000000000
    uint256 public constant MULTIPLIER_BASE = 1e18;

    /// @notice Current multiplier (scaled by 1e18)
    uint256 public override multiplier;

    /// @notice Timestamp of the last corporate dividend event
    uint256 public lastDividendTime;

    error MultiplierCannotDecrease();
    error InvalidMultiplier();
    error InvalidSharePrice();

    constructor(
        string memory name,
        string memory symbol,
        address initialOperator
    ) ERC20(name, symbol) ERC20Permit(name) {
        multiplier = MULTIPLIER_BASE; // starts at 1.0x
        _grantRole(DEFAULT_ADMIN_ROLE, initialOperator);
        _grantRole(OPERATOR_ROLE, initialOperator);
    }

    /**
     * @notice Returns the effective share entitlement of an account, factoring in the multiplier.
     */
    function effectiveBalanceOf(address account) external view override returns (uint256) {
        return (balanceOf(account) * multiplier) / MULTIPLIER_BASE;
    }

    /**
     * @notice Directly updates the multiplier.
     * @dev Restricted to OPERATOR_ROLE. Multiplier cannot decrease under dividend actions.
     */
    function updateMultiplier(uint256 newMultiplier) external override onlyRole(OPERATOR_ROLE) {
        if (newMultiplier < multiplier) revert MultiplierCannotDecrease();
        uint256 oldMultiplier = multiplier;
        multiplier = newMultiplier;
        emit MultiplierUpdated(oldMultiplier, newMultiplier);
    }

    /**
     * @notice Helper to simulate a real-world dividend distribution event.
     * @param dividendPerShareWei Cash dividend amount per share (scaled to 1e18 USD)
     * @param sharePriceWei Current market share price before dividend (scaled to 1e18 USD)
     *
     * Example:
     * If Apple share price = $200 (200e18) and dividend = $2.50 (2.5e18):
     * increaseFactor = 1e18 + (2.5e18 * 1e18 / 200e18) = 1.0125e18 (+1.25%).
     * newMultiplier = (1.000e18 * 1.0125e18) / 1e18 = 1.0125e18.
     */
    function distributeDividend(uint256 dividendPerShareWei, uint256 sharePriceWei)
        external
        onlyRole(OPERATOR_ROLE)
    {
        if (sharePriceWei == 0) revert InvalidSharePrice();

        uint256 increaseFactor = MULTIPLIER_BASE + ((dividendPerShareWei * MULTIPLIER_BASE) / sharePriceWei);
        uint256 newMultiplier = (multiplier * increaseFactor) / MULTIPLIER_BASE;

        uint256 oldMultiplier = multiplier;
        multiplier = newMultiplier;
        lastDividendTime = block.timestamp;

        emit MultiplierUpdated(oldMultiplier, newMultiplier);
        emit DividendDistributed(dividendPerShareWei, newMultiplier);
    }

    /**
     * @notice Faucet function for testing.
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
