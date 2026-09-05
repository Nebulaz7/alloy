// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {IB20Asset} from "./interfaces/IB20Asset.sol";
import {IMockDEX} from "./interfaces/IMockDEX.sol";
import {IAlloyHarvestRouter} from "./interfaces/IAlloyHarvestRouter.sol";
import {IERC5564Announcer} from "./interfaces/IERC5564Announcer.sol";

/**
 * @title AlloyHarvestRouter
 * @notice Core routing contract for Alloy.
 * Extracts dividend yield from Base B20 tokenized stocks via surplus share trimming,
 * swaps into the user's chosen currency (USDC, cNGN, etc.), and routes to a destination
 * address (standard or ERC-5564 stealth address) non-custodially.
 */
contract AlloyHarvestRouter is IAlloyHarvestRouter, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MULTIPLIER_BASE = 1e18;
    uint256 public constant SCHEME_ID_SECP256K1 = 1;

    /// @notice Address of the DEX swap router
    address public immutable dexRouter;

    /// @notice Address of the ERC-5564 stealth announcement contract
    address public immutable announcer;

    /// @notice User checkpoints: user => stockToken => UserCheckpoint
    mapping(address => mapping(address => UserCheckpoint)) public checkpoints;

    error NoPendingDividend();
    error ZeroAddressRecipient();
    error InvalidMultiplier();

    constructor(address _dexRouter, address _announcer) {
        dexRouter = _dexRouter;
        announcer = _announcer;
    }

    /**
     * @notice Returns the user's stored checkpoint for a given stock token.
     */
    function getCheckpoint(address user, address stockToken)
        external
        view
        override
        returns (uint256 lastMultiplier, uint256 lastTimestamp)
    {
        UserCheckpoint memory cp = checkpoints[user][stockToken];
        return (cp.lastMultiplier, cp.lastTimestamp);
    }

    /**
     * @notice Computes unharvested dividend surplus shares and estimated USD value for a user.
     * Formula:
     *   surplusShares = balance * (currentMultiplier - lastMultiplier) / currentMultiplier
     */
    function getPendingDividend(address user, address stockToken)
        public
        view
        override
        returns (uint256 surplusShares, uint256 estimatedUsdValue)
    {
        uint256 currentMultiplier = IB20Asset(stockToken).multiplier();
        uint256 lastM = checkpoints[user][stockToken].lastMultiplier;

        // If never checkpointed, default to base initial multiplier (1.0x)
        if (lastM == 0) {
            lastM = MULTIPLIER_BASE;
        }

        if (currentMultiplier <= lastM) {
            return (0, 0);
        }

        uint256 userBalance = IERC20(stockToken).balanceOf(user);
        if (userBalance == 0) {
            return (0, 0);
        }

        uint256 deltaMultiplier = currentMultiplier - lastM;
        surplusShares = (userBalance * deltaMultiplier) / currentMultiplier;

        // Calculate estimated USD value if DEX router is configured
        if (dexRouter != address(0) && surplusShares > 0) {
            try IMockDEX(dexRouter).getPriceUSD(stockToken) returns (uint256 priceUSD) {
                uint8 decimals = IERC20Metadata(stockToken).decimals();
                estimatedUsdValue = (surplusShares * priceUSD) / (10 ** decimals);
            } catch {
                estimatedUsdValue = 0;
            }
        }
    }

    /**
     * @notice Sets the user's checkpoint to the current multiplier.
     */
    function checkpoint(address user, address stockToken) public override {
        uint256 currentMultiplier = IB20Asset(stockToken).multiplier();
        checkpoints[user][stockToken] = UserCheckpoint({
            lastMultiplier: currentMultiplier,
            lastTimestamp: block.timestamp
        });
        emit UserCheckpointed(user, stockToken, currentMultiplier);
    }

    /**
     * @notice Harvests dividend surplus, swaps for target token, and routes to recipient.
     */
    function harvestToTarget(
        address stockToken,
        address targetToken,
        uint256 minTargetAmount,
        address recipient
    ) external override nonReentrant returns (uint256 targetAmountOut) {
        return _harvestToTarget(stockToken, targetToken, minTargetAmount, recipient);
    }

    /**
     * @notice Gasless permit + harvest in a single transaction.
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
    ) external override nonReentrant returns (uint256 targetAmountOut) {
        (uint256 surplusShares, ) = getPendingDividend(msg.sender, stockToken);
        if (surplusShares == 0) revert NoPendingDividend();

        IERC20Permit(stockToken).permit(
            msg.sender,
            address(this),
            surplusShares,
            deadline,
            v,
            r,
            s
        );

        return _harvestToTarget(stockToken, targetToken, minTargetAmount, recipient);
    }

    /**
     * @notice Harvests dividend surplus, swaps for target token, routes to one-time stealth address,
     * and announces the payment via ERC-5564 in a single atomic transaction.
     */
    function harvestToStealth(
        address stockToken,
        address targetToken,
        uint256 minTargetAmount,
        address stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external override nonReentrant returns (uint256 targetAmountOut) {
        targetAmountOut = _harvestToTarget(stockToken, targetToken, minTargetAmount, stealthAddress);

        if (announcer != address(0)) {
            IERC5564Announcer(announcer).announce(
                SCHEME_ID_SECP256K1,
                stealthAddress,
                ephemeralPubKey,
                metadata
            );
        }
    }

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
    ) external override nonReentrant returns (uint256 targetAmountOut) {
        (uint256 surplusShares, ) = getPendingDividend(msg.sender, stockToken);
        if (surplusShares == 0) revert NoPendingDividend();

        IERC20Permit(stockToken).permit(
            msg.sender,
            address(this),
            surplusShares,
            deadline,
            v,
            r,
            s
        );

        targetAmountOut = _harvestToTarget(stockToken, targetToken, minTargetAmount, stealthAddress);

        if (announcer != address(0)) {
            IERC5564Announcer(announcer).announce(
                SCHEME_ID_SECP256K1,
                stealthAddress,
                ephemeralPubKey,
                metadata
            );
        }
    }

    /**
     * @dev Internal logic for dividend harvesting and swapping.
     */
    function _harvestToTarget(
        address stockToken,
        address targetToken,
        uint256 minTargetAmount,
        address recipient
    ) internal returns (uint256 targetAmountOut) {
        if (recipient == address(0)) revert ZeroAddressRecipient();

        (uint256 surplusShares, ) = getPendingDividend(msg.sender, stockToken);
        if (surplusShares == 0) revert NoPendingDividend();

        uint256 currentMultiplier = IB20Asset(stockToken).multiplier();

        // 1. Update checkpoint state before external calls
        checkpoints[msg.sender][stockToken] = UserCheckpoint({
            lastMultiplier: currentMultiplier,
            lastTimestamp: block.timestamp
        });
        emit UserCheckpointed(msg.sender, stockToken, currentMultiplier);

        // 2. Pull surplus shares from user
        IERC20(stockToken).safeTransferFrom(msg.sender, address(this), surplusShares);

        // 3. Swap or route to target
        if (targetToken == stockToken) {
            IERC20(stockToken).safeTransfer(recipient, surplusShares);
            targetAmountOut = surplusShares;
        } else {
            IERC20(stockToken).forceApprove(dexRouter, surplusShares);
            targetAmountOut = IMockDEX(dexRouter).swapExactTokensForTokens(
                stockToken,
                targetToken,
                surplusShares,
                minTargetAmount,
                recipient
            );
        }

        emit Harvested(
            msg.sender,
            stockToken,
            targetToken,
            surplusShares,
            targetAmountOut,
            recipient
        );
    }

    /**
     * @notice Harvests dividend surplus, swaps for a Base meme coin ($CLANKER, $HIGHER, $DEGEN),
     * and delivers to recipient.
     */
    function harvestToMeme(
        address stockToken,
        address memeToken,
        uint256 minMemeAmount,
        address recipient
    ) external override nonReentrant returns (uint256 memeAmountOut) {
        (uint256 surplusBefore, ) = getPendingDividend(msg.sender, stockToken);
        memeAmountOut = _harvestToTarget(stockToken, memeToken, minMemeAmount, recipient);
        emit HarvestedToMeme(msg.sender, stockToken, memeToken, surplusBefore, memeAmountOut, recipient);
    }

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
    ) external override nonReentrant returns (uint256 memeAmountOut) {
        (uint256 surplusShares, ) = getPendingDividend(msg.sender, stockToken);
        if (surplusShares == 0) revert NoPendingDividend();

        IERC20Permit(stockToken).permit(
            msg.sender,
            address(this),
            surplusShares,
            deadline,
            v,
            r,
            s
        );

        memeAmountOut = _harvestToTarget(stockToken, memeToken, minMemeAmount, recipient);
        emit HarvestedToMeme(msg.sender, stockToken, memeToken, surplusShares, memeAmountOut, recipient);
    }

    /**
     * @notice Harvests dividend surplus, swaps for a Base meme coin, delivers to a one-time
     * stealth address, and broadcasts an ERC-5564 announcement.
     */
    function harvestToStealthMeme(
        address stockToken,
        address memeToken,
        uint256 minMemeAmount,
        address stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external override nonReentrant returns (uint256 memeAmountOut) {
        (uint256 surplusShares, ) = getPendingDividend(msg.sender, stockToken);
        memeAmountOut = _harvestToTarget(stockToken, memeToken, minMemeAmount, stealthAddress);

        if (announcer != address(0)) {
            IERC5564Announcer(announcer).announce(
                SCHEME_ID_SECP256K1,
                stealthAddress,
                ephemeralPubKey,
                metadata
            );
        }

        emit HarvestedToMeme(msg.sender, stockToken, memeToken, surplusShares, memeAmountOut, stealthAddress);
    }

    /**
     * @notice Gasless permit + harvest to stealth meme destination.
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
    ) external override nonReentrant returns (uint256 memeAmountOut) {
        (uint256 surplusShares, ) = getPendingDividend(msg.sender, stockToken);
        if (surplusShares == 0) revert NoPendingDividend();

        IERC20Permit(stockToken).permit(
            msg.sender,
            address(this),
            surplusShares,
            deadline,
            v,
            r,
            s
        );

        memeAmountOut = _harvestToTarget(stockToken, memeToken, minMemeAmount, stealthAddress);

        if (announcer != address(0)) {
            IERC5564Announcer(announcer).announce(
                SCHEME_ID_SECP256K1,
                stealthAddress,
                ephemeralPubKey,
                metadata
            );
        }

        emit HarvestedToMeme(msg.sender, stockToken, memeToken, surplusShares, memeAmountOut, stealthAddress);
    }
}
