// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IMockDEX} from "../interfaces/IMockDEX.sol";

/**
 * @title MockDEX
 * @notice Secondary liquidity pool simulator for Base Sepolia.
 * Uses oracle prices to swap between tokenized stocks and target stablecoins (USDC, cNGN) or meme tokens.
 */
contract MockDEX is IMockDEX {
    using SafeERC20 for IERC20;

    /// @notice USD price per token with 18-decimal precision (1e18 = $1.00 USD)
    mapping(address => uint256) public tokenPricesUSD;

    error PriceNotSet(address token);
    error SlippageExceeded(uint256 amountOut, uint256 minAmountOut);
    error InsufficientLiquidity(address token, uint256 requested, uint256 available);

    event PriceUpdated(address indexed token, uint256 priceUSD);
    event Swapped(
        address indexed caller,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address to
    );

    constructor() {}

    /**
     * @notice Set or update the mock oracle price for a token.
     * @param token Address of the token
     * @param priceUSD Price in 18-decimal USD (e.g. $200.00 = 200 * 1e18)
     */
    function setPrice(address token, uint256 priceUSD) external {
        tokenPricesUSD[token] = priceUSD;
        emit PriceUpdated(token, priceUSD);
    }

    /**
     * @notice Returns the USD price of a token with 18 decimals.
     */
    function getPriceUSD(address token) external view override returns (uint256) {
        uint256 price = tokenPricesUSD[token];
        if (price == 0) revert PriceNotSet(token);
        return price;
    }

    /**
     * @notice Quotes the expected output amount for a given input.
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view override returns (uint256 amountOut) {
        uint256 priceIn = tokenPricesUSD[tokenIn];
        uint256 priceOut = tokenPricesUSD[tokenOut];
        if (priceIn == 0) revert PriceNotSet(tokenIn);
        if (priceOut == 0) revert PriceNotSet(tokenOut);

        uint8 decimalsIn = IERC20Metadata(tokenIn).decimals();
        uint8 decimalsOut = IERC20Metadata(tokenOut).decimals();

        // valueUSD = (amountIn * priceIn) / 10^decimalsIn
        // amountOut = (valueUSD * 10^decimalsOut) / priceOut
        uint256 valueUSD = (amountIn * priceIn) / (10 ** decimalsIn);
        amountOut = (valueUSD * (10 ** decimalsOut)) / priceOut;
    }

    /**
     * @notice Swaps exact input tokens for output tokens based on oracle prices.
     */
    function swapExactTokensForTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external override returns (uint256 amountOut) {
        amountOut = getAmountOut(tokenIn, tokenOut, amountIn);
        if (amountOut < minAmountOut) revert SlippageExceeded(amountOut, minAmountOut);

        // Pull tokenIn from caller
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Ensure DEX has enough liquidity in tokenOut
        uint256 balanceOut = IERC20(tokenOut).balanceOf(address(this));
        if (balanceOut < amountOut) {
            revert InsufficientLiquidity(tokenOut, amountOut, balanceOut);
        }

        // Deliver tokenOut to recipient
        IERC20(tokenOut).safeTransfer(to, amountOut);

        emit Swapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut, to);
    }
}
