// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAlloyHarvestRouter
 * @notice Core interface for the non-custodial Alloy Harvest Router.
 * Detects multiplier accrual, calculates surplus shares, pulls surplus, and swaps to destination currency.
 */
interface IAlloyHarvestRouter {
    struct UserCheckpoint {
        uint256 lastMultiplier;
        uint256 lastTimestamp;
    }

    /**
     * @notice Emitted when a user harvests dividend surplus.
     * @param user The holder address whose shares were harvested
     * @param stockToken Address of the tokenized stock (e.g. AAPLc)
     * @param targetToken Address of the converted currency (e.g. USDC, cNGN)
     * @param surplusShares Amount of raw stock shares trimmed
     * @param targetAmountOut Amount of target tokens sent to recipient
     * @param recipient The destination address (standard or stealth address)
     */
    event Harvested(
        address indexed user,
        address indexed stockToken,
        address indexed targetToken,
        uint256 surplusShares,
        uint256 targetAmountOut,
        address recipient
    );

    /**
     * @notice Emitted when a user's checkpoint is initialized or updated.
     */
    event UserCheckpointed(
        address indexed user,
        address indexed stockToken,
        uint256 multiplier
    );

    /**
     * @notice Returns the checkpoint details for a user and stock token.
     */
    function getCheckpoint(address user, address stockToken)
        external
        view
        returns (uint256 lastMultiplier, uint256 lastTimestamp);

    /**
     * @notice Computes unharvested dividend surplus shares and estimated USD value for a user.
     * @param user Holder address
     * @param stockToken Tokenized stock address
     * @return surplusShares Amount of raw shares that represent accrued dividend
     * @return estimatedUsdValue Approximate USD value (scaled by 1e18)
     */
    function getPendingDividend(address user, address stockToken)
        external
        view
        returns (uint256 surplusShares, uint256 estimatedUsdValue);

    /**
     * @notice Explicitly checkpoints a user's position at the current multiplier.
     * Useful when a user acquires new shares.
     */
    function checkpoint(address user, address stockToken) external;

    /**
     * @notice Harvests dividend surplus, swaps for target token, and routes to recipient.
     * @param stockToken Address of the tokenized stock
     * @param targetToken Address of output token (USDC, cNGN, meme coin, etc.)
     * @param minTargetAmount Minimum acceptable amount of target token
     * @param recipient Address to receive the converted funds (e.g. one-time stealth address)
     * @return targetAmountOut Actual amount of targetToken received by recipient
     */
    function harvestToTarget(
        address stockToken,
        address targetToken,
        uint256 minTargetAmount,
        address recipient
    ) external returns (uint256 targetAmountOut);

    /**
     * @notice Gasless permit + harvest in a single transaction using EIP-2612.
     */
    function harvestWithPermit(
        address stockToken,
        address targetToken,
        uint256 minTargetAmount,
        address recipient,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 targetAmountOut);

    /**
     * @notice Harvests dividend surplus, swaps for target token, routes to one-time stealth address,
     * and announces the payment via ERC-5564 in a single atomic transaction.
     * @param stockToken Address of the tokenized stock
     * @param targetToken Address of the converted currency (e.g. USDC, cNGN)
     * @param minTargetAmount Minimum acceptable output amount
     * @param stealthAddress The one-time stealth destination address
     * @param ephemeralPubKey The sender's ephemeral public key (33 bytes)
     * @param metadata Supplementary metadata including view tag (1 byte)
     */
    function harvestToStealth(
        address stockToken,
        address targetToken,
        uint256 minTargetAmount,
        address stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external returns (uint256 targetAmountOut);

    /**
     * @notice Gasless permit + harvest to stealth address in a single transaction.
     */
    function harvestToStealthWithPermit(
        address stockToken,
        address targetToken,
        uint256 minTargetAmount,
        address stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 targetAmountOut);

    /**
     * @notice Emitted when a user harvests dividend surplus into a Base meme coin.
     * @param user The holder address whose shares were harvested
     * @param stockToken Address of the tokenized stock (e.g. AAPLc)
     * @param memeToken Address of the Base meme coin (e.g. $CLANKER, $HIGHER, $DEGEN)
     * @param surplusShares Amount of raw stock shares trimmed
     * @param memeAmountOut Amount of meme tokens delivered
     * @param recipient Recipient wallet or stealth address
     */
    event HarvestedToMeme(
        address indexed user,
        address indexed stockToken,
        address indexed memeToken,
        uint256 surplusShares,
        uint256 memeAmountOut,
        address recipient
    );

    /**
     * @notice Harvests dividend surplus, swaps for a Base meme coin ($CLANKER, $HIGHER, $DEGEN),
     * and delivers to recipient.
     * @param stockToken Address of the tokenized stock
     * @param memeToken Address of the destination meme token
     * @param minMemeAmount Minimum acceptable amount of meme tokens (slippage protection)
     * @param recipient Destination wallet address (sender or a friend's Basename)
     */
    function harvestToMeme(
        address stockToken,
        address memeToken,
        uint256 minMemeAmount,
        address recipient
    ) external returns (uint256 memeAmountOut);

    /**
     * @notice Gasless permit + harvest into a Base meme coin.
     */
    function harvestToMemeWithPermit(
        address stockToken,
        address memeToken,
        uint256 minMemeAmount,
        address recipient,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 memeAmountOut);

    /**
     * @notice Harvests dividend surplus, swaps for a Base meme coin, delivers to a one-time
     * stealth address, and broadcasts an ERC-5564 announcement.
     * @param stockToken Address of the tokenized stock
     * @param memeToken Address of the Base meme coin
     * @param minMemeAmount Minimum acceptable amount of meme tokens
     * @param stealthAddress One-time stealth destination address
     * @param ephemeralPubKey Ephemeral public key (33 bytes)
     * @param metadata Supplementary metadata including view tag (1 byte)
     */
    function harvestToStealthMeme(
        address stockToken,
        address memeToken,
        uint256 minMemeAmount,
        address stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external returns (uint256 memeAmountOut);

    /**
     * @notice Gasless permit + harvest to stealth meme coin destination.
     */
    function harvestToStealthMemeWithPermit(
        address stockToken,
        address memeToken,
        uint256 minMemeAmount,
        address stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256 memeAmountOut);
}
