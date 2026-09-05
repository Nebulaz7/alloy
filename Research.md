# Alloy — Research & Architecture Document

---

## Module 1: Tokenized Stock Mechanics & Dividend Accounting (Completed & Implemented)

### 1. Base B20 Native Token Standard
* Base introduced the **B20 native token standard** (Beryl upgrade) for real-world assets (RWAs) and equities (issued by Coinbase for assets like $AAPLc$, $NVDAc$, $COINc$).
* B20 tokens are implemented as Rust precompiles on Base nodes with standard ERC-20 selector compatibility.
* **The Multiplier Mechanism**:
  * Raw holder balances (`balanceOf(user)`) remain static to preserve compatibility with DeFi lending collateral (Aave) and liquidity pools (Aerodrome).
  * The contract exposes an on-chain multiplier `multiplier()`, scaled by $10^{18}$ (starting at $1.0\times 10^{18}$).
  * Corporate actions (dividends, stock splits) trigger updates to the multiplier by the `OPERATOR_ROLE`, emitting `MultiplierUpdated(oldM, newM)`.
  * Effective user equity entitlement is:
    $$\text{Effective Claim} = \frac{\text{rawBalance} \times \text{multiplier}}{10^{18}}$$

### 2. The Dividend Accrual & Surplus Share Math
Because user balances do not rebase, dividends accumulate invisibly inside the multiplier. Alloy extracts this yield while preserving 100% of the holder's initial equity principal:
* For a user with raw balance $B$, checkpointed at $M_{\text{checkpoint}}$:
  $$\Delta M = M_{\text{current}} - M_{\text{checkpoint}}$$
* Surplus shares to trim ($\Delta B$):
  $$\Delta B = B \times \frac{M_{\text{current}} - M_{\text{checkpoint}}}{M_{\text{current}}}$$
* Remaining raw balance $B - \Delta B$ evaluated at $M_{\text{current}}$ exactly preserves the original claim:
  $$(B - \Delta B) \times M_{\text{current}} \equiv B \times M_{\text{checkpoint}}$$
* Invariant verified in Foundry unit & integration tests down to 1 wei precision.

---

## Module 2: Stealth Address & Privacy Architecture (ERC-5564 & ERC-6538)

### 1. Core Standards
* **ERC-5564**: Stealth Address Generation & Announcement.
  * Standardizes the creation of one-time destination addresses and on-chain emission of ephemeral public keys.
* **ERC-6538**: Stealth Meta-Address Registry.
  * Onchain contract mapping an entity (wallet address or registrant) to their registered Stealth Meta-Address.

### 2. Cryptographic Protocol (secp256k1 ECDH)
* **Recipient Keys**:
  * Spending private key $k_{\text{spend}} \in \mathbb{F}_q$, Spending public key $K_{\text{spend}} = k_{\text{spend}} \cdot G$.
  * Viewing private key $k_{\text{view}} \in \mathbb{F}_q$, Viewing public key $K_{\text{view}} = k_{\text{view}} \cdot G$.
  * Stealth Meta-Address: $(K_{\text{spend}}, K_{\text{view}})$, formatted as `st:eth:0x...`.
* **Sender Derivation (Non-Interactive)**:
  1. Generate ephemeral private key $r \in_R \mathbb{F}_q$, Ephemeral public key $R = r \cdot G$.
  2. Compute shared secret via Diffie-Hellman:
     $$S = r \cdot K_{\text{view}} = r \cdot k_{\text{view}} \cdot G$$
  3. Derive scalar hash:
     $$h = \text{keccak256}(S)$$
  4. Derive one-time stealth public key $P$:
     $$P = K_{\text{spend}} + h \cdot G$$
  5. Derive stealth address:
     $$\text{stealthAddress} = \text{address}(P)$$
  6. Compute 1-byte view tag $v = \text{first\_byte}(h)$ for $O(1)$ fast announcement filtering.
* **Onchain Announcement (ERC-5564)**:
  Sender/Router emits `Announcement(schemeId, stealthAddress, caller, R, metadata)` with view tag.
* **Recipient Discovery & Spending**:
  1. Recipient reads announcements, computes $S' = k_{\text{view}} \cdot R$.
  2. Checks view tag: if $\text{first\_byte}(\text{keccak256}(S')) == v$, performs full check $P \stackrel{?}{=} K_{\text{spend}} + \text{keccak256}(S') \cdot G$.
  3. Stealth private key for spending:
     $$k_{\text{stealth}} = (k_{\text{spend}} + \text{keccak256}(S')) \pmod n$$
     Only the recipient can calculate $k_{\text{stealth}}$.

### 3. The "Gas Funding" Dilemma on Stealth Addresses
* When converted dividend tokens ($USDC$, $cNGN$) land on a fresh stealth address $P$, the address has **0 ETH** for gas.
* If the user funds $P$ with ETH from their known main wallet, the privacy link is destroyed!
* **Solutions**:
  * **Option A (Base Paymaster / ERC-4337)**: Use Coinbase Smart Wallet or Biconomy/Pimlico paymaster to sponsor gasless withdrawals or permit ERC-20 paymaster fees (pay gas in USDC).
  * **Option B (Alloy Relayer / Gas Sponsorship)**: Alloy relayer submits the transfer transaction signed by $k_{\text{stealth}}$, deducting a micro-fee in the transferred stablecoin.
  * **Option C (1-Click Sweep via Permit / Meta-Transaction)**: Recipient signs an EIP-712 permit or EIP-2612 transfer with $k_{\text{stealth}}$, and a relayer executes it to a clean exchange/offramp address without the stealth wallet needing ETH.

---

## Module 3: Basenames & Identity Resolution Layer

### 1. Why Basenames for Alloy?
* **Base Native Alignment**: Basenames (`.base.eth`) is Base's official identity layer, built on ENS architecture directly deployed to Base.
* **Zero Disconnection**: Users do not need to register a separate, isolated "Alloy Username". They use their existing Base identity (e.g. `alice.base.eth` or simply typing `alice`).

### 2. Basename Contract Architecture on Base
* **Base L2Resolver**:
  * Base Mainnet: `0x426fA03fB86E510d0Dd9F70335Cf102a98b10875` (and equivalent on Base Sepolia).
* **ENS Methods on Base**:
  * `addr(bytes32 node)` $\rightarrow$ Returns the registrant's public wallet address.
  * `text(bytes32 node, string key)` $\rightarrow$ Returns arbitrary text metadata records.

### 3. Dual Resolution Mechanism (Hybrid Standard)
To support all users seamlessly, Alloy implements a two-tier lookup:

```
                  User types "bob" or "bob.base.eth"
                                  │
                                  ▼
                     Resolve node = namehash(name)
                                  │
                                  ├──> 1. Check L2Resolver.text(node, "stealth")
                                  │       └──> Found? Use Stealth Meta-Address
                                  │
                                  └──> 2. Fallback:
                                          addr = L2Resolver.addr(node)
                                          Query ERC-6538 Registry for addr
                                          └──> Found? Use Stealth Meta-Address
```

### 4. Privacy & Unlinkability Guarantees with Basenames
* **Query Isolation**: Resolving `bob.base.eth` is a read-only `eth_call` (view query) performed offchain by the sender's client.
* **Zero Name Footprint Onchain**: The onchain transaction emitted by `AlloyHarvestRouter` contains **only** the freshly derived one-time stealth address ($0x7f4a...$).
* **Neither the string `"bob.base.eth"` nor Bob's known public wallet address is ever written to the blockchain or event logs.**
* An external observer inspecting the blockchain sees:
  `AlloyHarvestRouter` $\longrightarrow$ `0x7f4a...9b` (One-Time Stealth Address).
  Unlinkable to Bob.

---

## Module 4: Currency Conversion & Routing Layer

### 1. Supported Payout Assets
* **USD Stablecoin**: $USDC$ (Circle native on Base).
* **Local Currency Stablecoin**: $cNGN$ (Compliant Nigerian Naira on Base) — demonstrating global emerging-market financial inclusion.
* **Meme Coin Routing (Base Composability Showcase)**:
  * 1-click option to divert harvested dividend directly into buying Base meme tokens ($CLANKER$, $HIGHER$, $DEGEN$) via Uniswap/Aerodrome router.

### 2. Single-Transaction Atomicity
* Detection $\rightarrow$ Surplus Trim $\rightarrow$ DEX Swap $\rightarrow$ Stealth Transfer occurs in a single atomic transaction.
* If any step fails (e.g., slippage or recipient error), the entire transaction reverts, leaving user shares completely untouched.

---

## Module 5: System Boundaries & Hackathon Scope

### 1. Onchain Contracts (Base Sepolia / Local)
* `MockB20TokenizedStock.sol`: B20 Asset token with multiplier and dividend simulation.
* `MockDEX.sol`: Oracle/AMM router for stock to stablecoin/meme conversions.
* `MockStablecoin.sol`: USDC and cNGN mocks.
* `ERC6538Registry.sol`: Canonical Stealth Meta-Address registry.
* `ERC5564Announcer.sol`: Standard stealth announcement broadcaster.
* `AlloyHarvestRouter.sol`: Master coordinator.

### 2. Offchain / Frontend Engine
* Next.js + Tailwind CSS UI.
* `@noble/secp256k1` / `viem` for client-side stealth key derivation, view tag filtering, and announcement scanning.
* Basenames SDK / viem ENS resolution for `.base.eth` names.
