# Alloy — Module 1 Implementation Plan: Tokenized Stock Mechanics & Dividend Harvesting

## 1. Overview & Objectives

Module 1 establishes the mathematical and onchain foundation of **Alloy**:
* **Asset Model**: B20-compatible Tokenized Stocks (Base native RWA standard, Asset variant) with an onchain multiplier (`multiplier()`).
* **Custody Model**: **Non-custodial**. Users retain full ownership of their tokenized stocks in their own wallets (Coinbase Smart Wallet, MetaMask, etc.) without locking them in a custodial vault.
* **Access Model**: EIP-2612 `permit` and standard ERC-20 `allowance`, allowing the `AlloyHarvestRouter` to pull and liquidate only the exact calculated dividend surplus shares.
* **Harvesting Logic**: Mathematical extraction of dividend value accrued through multiplier increases, leaving 100% of the user's initial equity principal intact.

---

## 2. Mathematical Foundation & Invariants

### 2.1 Multiplier Invariant
In the B20 standard:
* Multiplier scale: $1\text{e}18 = 1.000000000000000000$.
* Initial state for stock $S$: $M_0 = 1\times 10^{18}$.
* Effective equity claim of a user holding raw balance $B$:
  $$\text{Claim} = \frac{B \times M}{10^{18}}$$

### 2.2 Dividend Accrual & Surplus Share Calculation
When a corporate dividend event occurs, the issuer updates the multiplier from $M_{\text{old}}$ to $M_{\text{new}}$ ($M_{\text{new}} > M_{\text{old}}$).

For a user holding raw balance $B$ whose last harvest occurred at $M_{\text{checkpoint}}$:
1. **Accrual condition**:
   $$\Delta M = M_{\text{current}} - M_{\text{checkpoint}} > 0$$

2. **Surplus shares to trim ($\Delta B$)**:
   To harvest the dividend while ensuring the user's remaining effective claim equals their initial claim ($B \times M_{\text{checkpoint}}$):
   $$(B - \Delta B) \times M_{\text{current}} = B \times M_{\text{checkpoint}}$$
   $$B \times M_{\text{current}} - \Delta B \times M_{\text{current}} = B \times M_{\text{checkpoint}}$$
   $$\Delta B \times M_{\text{current}} = B \times (M_{\text{current}} - M_{\text{checkpoint}})$$
   $$\Delta B = B \times \frac{M_{\text{current}} - M_{\text{checkpoint}}}{M_{\text{current}}}$$

3. **Invariants Preserved**:
   * **Principal Conservation**: The user's net effective equity exposure after harvesting is identically equal to their exposure before the dividend event.
   * **No Value Extraction Overdraft**: A user cannot harvest more dividend value than their holding duration accrued.
   * **Re-entrancy & Double Harvest Protection**: Checkpointing $M_{\text{checkpoint}} \leftarrow M_{\text{current}}$ immediately prior to token transfer.

---

## 3. Smart Contract Specifications

All smart contracts will be written for Solidity `^0.8.24` and tested via **Foundry (`forge` in WSL)**.

```
contracts/
├── src/
│   ├── interfaces/
│   │   ├── IB20Asset.sol             // Base B20 Asset interface (multiplier, roles)
│   │   ├── IAlloyHarvestRouter.sol   // Core harvest and routing interface
│   │   └── IMockDEX.sol              // Swap router interface (AMMs / secondary liquidity)
│   ├── mocks/
│   │   ├── MockB20TokenizedStock.sol // B20 Asset token with multiplier & dividend simulation
│   │   ├── MockStablecoin.sol        // Mock USDC (6 decimals) and cNGN (6 decimals)
│   │   └── MockDEX.sol               // Simple constant product / oracle swap pool
│   └── AlloyHarvestRouter.sol        // Checkpointing, dividend math, extraction & DEX swap
├── test/
│   ├── MockB20TokenizedStock.t.sol   // Unit tests for B20 multiplier & dividend triggers
│   └── AlloyHarvestRouter.t.sol      // Integration tests for checkpointing, trimming & swapping
└── foundry.toml                      // Foundry configuration
```

### 3.1 `MockB20TokenizedStock.sol`
* **Base Standards**: ERC-20, ERC-2612 (Permit), AccessControl (`OPERATOR_ROLE`).
* **State Variables**:
  * `uint256 public multiplier = 1e18;`
  * `uint256 public lastDividendTime;`
* **Core Methods**:
  * `updateMultiplier(uint256 newMultiplier) external onlyRole(OPERATOR_ROLE)`
    * Emits `MultiplierUpdated(uint256 oldMultiplier, uint256 newMultiplier)`.
  * `distributeDividend(uint256 dividendPerShareWei, uint256 sharePriceWei) external onlyRole(OPERATOR_ROLE)`
    * Calculates new multiplier: $M_{\text{new}} = M_{\text{current}} \times (1 + \frac{\text{dividendPerShare}}{\text{sharePrice}})$.
    * Updates multiplier and emits `DividendDistributed(dividendPerShareWei, newMultiplier)`.
  * `effectiveBalanceOf(address account) external view returns (uint256)`
    * Returns $(balanceOf(account) \times multiplier) / 1\text{e}18$.

### 3.2 `AlloyHarvestRouter.sol`
* **State Variables**:
  * `struct UserCheckpoint { uint256 lastMultiplier; uint256 lastTimestamp; }`
  * `mapping(address => mapping(address => UserCheckpoint)) public checkpoints;` // user => stock => checkpoint
  * `address public immutable dexRouter;`
* **Key Methods**:
  * `getPendingDividend(address user, address stockToken) external view returns (uint256 surplusShares, uint256 estimatedUsdcValue)`
    * Reads `currentMultiplier = IB20Asset(stockToken).multiplier()`.
    * Computes $\Delta B$ using the surplus formula.
    * Queries DEX for estimated USDC output.
  * `checkpoint(address user, address stockToken) external`
    * Sets `checkpoints[user][stockToken].lastMultiplier = currentMultiplier`.
    * Invoked automatically on first harvest or manually when a user acquires new stock.
  * `harvestToTarget(address stockToken, address targetToken, uint256 minTargetAmount, address recipient) external returns (uint256 targetAmountOut)`
    * Calculates user's $\Delta B$.
    * Pulls $\Delta B$ from `msg.sender` via `transferFrom`.
    * Updates checkpoint: `checkpoints[msg.sender][stockToken].lastMultiplier = currentMultiplier`.
    * Approves DEX router and swaps $\Delta B$ stock tokens into `targetToken` (e.g. USDC, cNGN).
    * Delivers `targetAmountOut` to `recipient` (in Module 2, `recipient` will be the computed stealth address).
  * `harvestWithPermit(...)`
    * Accepts EIP-2612 signature for gasless approval + harvest in a single transaction.

### 3.3 `MockDEX.sol`
* Simulates Uniswap v3 / Aerodrome pool on Base Sepolia.
* Enables instant conversion from tokenized stock (e.g., $AAPLc$) to stablecoins ($USDC$, $cNGN$) or meme tokens.
* Deterministic spot pricing with configurable slippage.

---

## 4. WSL / Foundry Workflow

Because Foundry is installed inside WSL:
* Project root will contain `foundry.toml` with standard paths (`src = "contracts/src"`, `test = "contracts/test"`).
* Build & test commands:
  ```bash
  wsl forge build
  wsl forge test -vvv
  ```
* Standard dependencies (`forge-std`, `openzeppelin-contracts`) vendored or installed via git submodules / forge install.

---

## 5. Verification & Test Criteria

1. **Multiplier Update Test**:
   * Initial multiplier is $1.0\times 10^{18}$.
   * Trigger $2.50$ dividend on a $\$200$ stock $\to$ multiplier updates to $1.0125\times 10^{18}$.
   * Event `MultiplierUpdated` and `DividendDistributed` are emitted.
2. **Surplus Calculation Test**:
   * User with $100$ raw shares.
   * Multiplier goes from $1.0 \to 1.0125$.
   * `getPendingDividend` returns:
     $$100 \times \frac{0.0125}{1.0125} \approx 1.2345679\text{ shares}$$
3. **Execution & Principal Preservation Test**:
   * User approves router.
   * Router harvests $1.2345679$ shares and swaps to USDC.
   * User retains $98.7654321$ raw shares.
   * Remaining effective claim:
     $$98.7654321 \times 1.0125 = 100.0000000\text{ shares}$$
   * Principal is exactly preserved.
4. **Subsequent Harvest Guard Test**:
   * Immediate second call to `harvest()` reverts with `NoPendingDividend`.

---

## 6. Handoff to Module 2 (Stealth Address Privacy)
The output of `harvestToTarget(..., address recipient)` delivers the converted stablecoin to `recipient`. In Module 2, `recipient` will be dynamically derived via the ERC-5564 stealth address scheme using the user's registered ERC-6538 stealth meta-address.
