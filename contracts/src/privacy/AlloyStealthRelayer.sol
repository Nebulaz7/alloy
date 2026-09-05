// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AlloyStealthRelayer
 * @notice Solves the "Gas Funding" dilemma for newly created stealth addresses.
 * Allows recipients to sweep tokens from a 0-ETH stealth address using an EIP-2612 permit signature.
 * The relayer broadcasts the transaction, pays the Base gas, and collects a small fee from the swept token.
 */
contract AlloyStealthRelayer is ReentrancyGuard {
    using SafeERC20 for IERC20;

    event StealthFundsSwept(
        address indexed token,
        address indexed stealthAddress,
        address indexed destination,
        uint256 amount,
        uint256 feePaid,
        address relayer
    );

    error InvalidFee(uint256 fee, uint256 totalAmount);
    error ZeroAddressDestination();

    /**
     * @notice Sweeps ERC-20 tokens from a stealth address using permit.
     * @param token Address of the token to sweep (e.g. USDC, cNGN)
     * @param stealthAddress The one-time address holding the tokens
     * @param destination The clean recipient address or off-ramp
     * @param amount Total amount to transfer from the stealth address
     * @param relayerFee Compensation fee for the relayer who sponsors gas
     * @param deadline Permit expiration timestamp
     * @param v ECDSA signature v
     * @param r ECDSA signature r
     * @param s ECDSA signature s
     */
    function sweepWithPermit(
        address token,
        address stealthAddress,
        address destination,
        uint256 amount,
        uint256 relayerFee,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant {
        if (destination == address(0)) revert ZeroAddressDestination();
        if (relayerFee >= amount) revert InvalidFee(relayerFee, amount);

        // 1. Consume permit signed by stealth private key
        IERC20Permit(token).permit(
            stealthAddress,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );

        // 2. Transfer amount from stealth address to this contract
        IERC20(token).safeTransferFrom(stealthAddress, address(this), amount);

        // 3. Deliver net funds to destination
        uint256 netAmount = amount - relayerFee;
        IERC20(token).safeTransfer(destination, netAmount);

        // 4. Pay fee to relayer (msg.sender)
        if (relayerFee > 0) {
            IERC20(token).safeTransfer(msg.sender, relayerFee);
        }

        emit StealthFundsSwept(token, stealthAddress, destination, amount, relayerFee, msg.sender);
    }
}
