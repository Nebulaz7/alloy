# Alloy — Module 4 Implementation Plan: Base Meme Coin Routing & DEX Swaps

## 1. Overview & Objectives

Module 4 implements the secondary composability showcase of **Alloy**:
* **The Narrative**: Blending real-world Wall Street equities with Base-native meme culture.
* **The Problem Solved**:
  * Normally, receiving equity dividends requires waiting days for fiat bank deposits, after which buying onchain crypto tokens requires a separate onramp, gas bridging, and multiple DEX swaps.
* **The Alloy Solution**:
  * A 1-click execution rail that detects an equity dividend, calculates the surplus yield $\Delta B$, and automatically diverts the proceeds into Base-native meme coins (e.g. **$CLANKER**, **$HIGHER**, **$DEGEN**) via Base liquidity pools in a single atomic transaction.
* **Composability Primitives**:
  1. **Direct Meme Ape**: Route dividend proceeds directly to the user's primary wallet.
  2. **Meme Gifting**: Route dividend proceeds to a friend's Basename (`alice.base.eth`).
  3. **Stealth Meme Payout**: Route dividend proceeds as meme coins to a one-time ERC-5564 stealth address—combining Base meme culture with unlinkable onchain privacy.

---

## 2. Base Meme Ecosystem & Launchpad Primitives

Alloy integrates with tokens representing the core of Base culture:
1. **$CLANKER** (`clanker.world`):
   * Autonomous AI token launcher protocol natively deployed on Base (contracts `0x2A78...` on Base Mainnet).
   * Launches tokens paired with WETH/USDC on Uniswap v3 with permanently locked liquidity via `LpLockerv2`.
2. **$HIGHER** (`higher.eth`):
   * Community-driven creative culture token on Base.
3. **$DEGEN**:
   * The canonical Base/Farcaster social tipping and ecosystem token.

---

## 3. Mathematical & Swap Mechanics

### 3.1 Principal Conservation Invariant
Surplus share calculation remains identical to Modules 1–3:
$$\Delta B = B \times \frac{M_{\text{current}} - M_{\text{checkpoint}}}{M_{\text{current}}}$$
* **Guarantee**: Even when apeing 100% of the dividend into high-volatility meme coins, the user's underlying equity principal ($AAPLc$, $NVDAc$) remains **100% intact and conserved to the wei**.

### 3.2 DEX Pricing & Conversion
The swap path executes via secondary AMM liquidity pools (simulating Base Uniswap v3 / Aerodrome pools):
$$\text{Value}_{\text{USD}} = \frac{\Delta B \times \text{Price}_{\text{USD}}(\text{Stock})}{10^{\text{decimals}(\text{Stock})}}$$
$$\text{AmountOut}_{\text{Meme}} = \frac{\text{Value}_{\text{USD}} \times 10^{\text{decimals}(\text{Meme})}}{\text{Price}_{\text{USD}}(\text{Meme})}$$

* **Slippage Constraint**: Senders specify `minMemeAmount`. If market volatility causes $\text{AmountOut} < \text{minMemeAmount}$, the transaction reverts, leaving user stock shares completely untouched.

---

## 4. Smart Contract Architecture (Foundry Layout)

All contracts will reside in `contracts/src/` alongside Modules 1–3:

```
contracts/
├── src/
│   ├── interfaces/
│   │   ├── IAlloyHarvestRouter.sol     // Extended with meme harvesting methods
│   │   └── IMockDEX.sol                // Supports stock-to-meme routing
│   ├── mocks/
│   │   ├── MockMemeToken.sol           // Standard 18-decimal Base meme coin mock ($CLANKER, $HIGHER, $DEGEN)
│   │   └── MockDEX.sol                 // Instant pricing & liquidity for meme pairs
│   ├── AlloyHarvestRouter.sol          // Atomic execution for meme routing
│   ├── identity/                       // Module 3 contracts
│   └── privacy/                        // Module 2 contracts
└── test/
    ├── MockMemeToken.t.sol             // Unit tests for meme token issuance
    └── AlloyMemeHarvest.t.sol          // Integration test suite for meme diversion
```

### 4.1 `MockMemeToken.sol`
* Implements standard ERC-20 with 18 decimals and metadata:
  * Symbol: `CLANKER`, `HIGHER`, `DEGEN`.
  * Name: `Clanker Token`, `Higher`, `Degen Token`.
  * Faucet minting function for tests and demo wallets.

### 4.2 Extended `IAlloyHarvestRouter.sol` & `AlloyHarvestRouter.sol`
Add dedicated meme diversion methods:
```solidity
event HarvestedToMeme(
    address indexed user,
    address indexed stockToken,
    address indexed memeToken,
    uint256 surplusShares,
    uint256 memeAmountOut,
    address recipient
);

function harvestToMeme(
    address stockToken,
    address memeToken,
    uint256 minMemeAmount,
    address recipient
) external returns (uint256 memeAmountOut);

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

function harvestToStealthMeme(
    address stockToken,
    address memeToken,
    uint256 minMemeAmount,
    address stealthAddress,
    bytes calldata ephemeralPubKey,
    bytes calldata metadata
) external returns (uint256 memeAmountOut);
```

* **Execution Flow**:
  1. Calculate user's $\Delta B$ surplus shares.
  2. Pull surplus shares from `msg.sender`.
  3. Swap $\Delta B$ for `memeToken` via `dexRouter`.
  4. Transfer resulting meme coins to `recipient` (or `stealthAddress`).
  5. If stealth routing: emit ERC-5564 `Announcement` log with view tag.
  6. Emit `HarvestedToMeme` event.

---

## 5. Privacy & Composability Scenarios

| Scenario | Destination | Privacy Level | Use Case |
| :--- | :--- | :--- | :--- |
| **Self Ape** | User's main wallet | Public | User directly converts dividend cash into Base meme bags. |
| **Meme Gift** | Friend's Basename (`bob.base.eth`) | Public / Stealth | Gifting dividend yield as community tokens. |
| **Stealth Meme** | One-time address $P$ | **100% Unlinkable** | User accumulates meme tokens privately without doxxing their positions on Base. |

---

## 6. Testing & Verification Plan

### Test Suite 1: `MockMemeTokenTest`
* Verify deployment of $CLANKER$, $HIGHER$, and $DEGEN$.
* Verify 18-decimal scaling and transfers.

### Test Suite 2: `AlloyMemeHarvestTest`
* **Test 1: Direct Meme Harvest ($AAPLc \rightarrow \$CLANKER$)**:
  * Apple distributes $2.50 dividend on $200 stock.
  * Alice harvests surplus directly into $CLANKER.
  * Alice receives expected $CLANKER tokens.
  * Alice retains 100 shares of AAPLc effective claim (principal preserved).
* **Test 2: Stealth Meme Harvest ($AAPLc \rightarrow \$DEGEN$)**:
  * Alice resolves Bob's stealth meta-address.
  * Alice calls `harvestToStealthMeme(AAPLc, DEGEN, minOut, stealthAddress, R, metadata)`.
  * One-time stealth address receives $DEGEN tokens.
  * ERC-5564 `Announcement` emitted with view tag.
  * Bob scans with viewing key, signs EIP-2612 permit with stealth key, and sweeps $DEGEN to his cold wallet.
* **Test 3: Slippage Protection**:
  * Verify transaction reverts if `minMemeAmount` is higher than DEX quote.
