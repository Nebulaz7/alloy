import { parseAbi } from "viem";

export const B20_STOCK_ABI = parseAbi([
  "function multiplier() view returns (uint256)",
  "function initialMultiplier() view returns (uint256)",
  "function baseUnits(address account) view returns (uint256)",
  "function calculateSurplus(address holder) view returns (uint256)",
  "function distributeDividend(uint256 dividendPerShare, uint256 currentStockPrice) external",
  "function trimMultiplier(address holder, uint256 sharesToTrim) external",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) external",
]);

export const HARVEST_ROUTER_ABI = parseAbi([
  "function harvest(address stock, uint256 minUsdcOut, address recipient) external returns (uint256 usdcAmount)",
  "function harvestToStealth(address stock, uint256 minUsdcOut, bytes ephemeralPubKey, uint8 viewTag, address stealthAddress) external returns (uint256 usdcAmount)",
  "function harvestToMeme(address stock, address memeToken, uint256 minMemeOut, address recipient) external returns (uint256 memeAmount)",
  "function harvestToStealthMeme(address stock, address memeToken, uint256 minMemeOut, bytes ephemeralPubKey, uint8 viewTag, address stealthAddress) external returns (uint256 memeAmount)",
  "event DividendHarvested(address indexed user, address indexed stock, uint256 surplusShares, uint256 usdcReceived, address recipient)",
]);

export const BASENAME_RESOLVER_ABI = parseAbi([
  "function resolveBasename(string basename) view returns (bytes stealthMetaAddress, address canonicalAddress)",
  "function resolveStealthMetaAddress(string basename) view returns (bytes)",
  "function reverseResolve(address addr) view returns (string)",
  "function setStealthMetaAddress(string basename, bytes stealthMetaAddress) external",
  "function isNameAvailable(string basename) view returns (bool)",
]);

export const STEALTH_RELAYER_ABI = parseAbi([
  "function sweepWithPermit(address token, address stealthAddress, address destination, uint256 amount, uint256 relayerFee, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external",
  "event StealthFundsSwept(address indexed token, address indexed stealthAddress, address indexed destination, uint256 amount, uint256 feePaid, address relayer)",
]);

export const ERC6538_REGISTRY_ABI = parseAbi([
  "function stealthMetaAddressOf(address registrant, uint256 schemeId) view returns (bytes)",
  "function registerKeys(uint256 schemeId, bytes stealthMetaAddress) external",
  "event StealthMetaAddressSet(address indexed registrant, uint256 indexed schemeId, bytes stealthMetaAddress)",
]);

export const ERC5564_ANNOUNCER_ABI = parseAbi([
  "event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)",
]);

export const DEX_ABI = parseAbi([
  "function getSpotPrice(address tokenIn, address tokenOut) view returns (uint256)",
  "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address recipient) external returns (uint256 amountOut)",
]);

export const ERC20_PERMIT_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function nonces(address owner) view returns (uint256)",
  "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external",
  "function mint(address to, uint256 amount) external",
]);
