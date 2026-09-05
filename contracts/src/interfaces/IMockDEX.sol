// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IMockDEX
 * @notice Interface for secondary liquidity swap router (simulating Aerodrome/Uniswap v3 on Base).
 */
interface IMockDEX {
    /**
     * @notice Swaps an exact amount of input tokens for output tokens.
     * @param tokenIn Address of the token to spend (e.g. surplus AAPLc)
     * @param tokenOut Address of the token to receive (e.g. USDC, cNGN)
     * @param amountIn Exact input amount
     * @param minAmountOut Minimum acceptable output amount (slippage protection)
     * @param to Recipient of the output tokens
     * @return amountOut The actual amount of tokenOut delivered to `to`
     */
    function swapExactTokensForTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external returns (uint256 amountOut);

    /**
     * @notice Quotes the expected output amount for a given input.
     * @param tokenIn Address of the token to spend
     * @param tokenOut Address of the token to receive
     * @param amountIn Amount of tokenIn
     * @return amountOut Expected amount of tokenOut
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut);

    /**
     * @notice Returns the USD price of a token with 18 decimals (1e18 = $1.00 USD).
     * @param token Address of the token
     */
    function getPriceUSD(address token) external view returns (uint256);
}
