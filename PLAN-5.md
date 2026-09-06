# Alloy — Module 5 Implementation Plan: Deployment Scripts, Frontend Architecture & Submission Scope

## 1. Overview & Objectives

Module 5 turns Alloy’s smart contracts into an interactive, end-to-end decentralized application ready for the **Base Builder Quests** submission:
* **The Goal**: Deliver a clean, production-grade dApp on Base Sepolia / local simulation that demonstrates:
  1. Real dividend accrual on B20 tokenized stocks via onchain multipliers.
  2. Non-custodial surplus share extraction preserving 100% of equity principal.
  3. Seamless resolution of `.base.eth` Basenames to ERC-5564 stealth meta-addresses.
  4. 1-Click diversion into local stablecoins ($cNGN$, $USDC$) or Base meme tokens ($CLANKER$, $HIGHER$, $DEGEN$).
  5. Gasless stealth inbox sweeps via `AlloyStealthRelayer` solving the 0-ETH problem.
  6. Visual proof of onchain unlinkability.

---

## 2. Onchain Deployment Pipeline (`contracts/script/DeployAlloy.s.sol`)

A unified Foundry deployment script will deploy and link all components on Base Sepolia (Chain ID `84532`) and local Anvil:

### Deployment Sequence:
1. **Tokenized Equities & Stablecoins**:
   * `MockB20TokenizedStock` ("Apple Tokenized Stock", `AAPLc`) — initial spot $\$200.00$.
   * `MockB20TokenizedStock` ("Nvidia Tokenized Stock", `NVDAc`) — initial spot $\$130.00$.
   * `MockStablecoin` (`USDC`, 6 decimals).
   * `MockStablecoin` (`cNGN`, 6 decimals).
2. **Base Meme Tokens**:
   * `MockMemeToken` (`$CLANKER`, 18 decimals) — spot $\$5.00$.
   * `MockMemeToken` (`$HIGHER`, 18 decimals) — spot $\$0.10$.
   * `MockMemeToken` (`$DEGEN`, 18 decimals) — spot $\$0.02$.
3. **Liquidity Infrastructure**:
   * `MockDEX` (configured with spot oracle prices and funded with initial liquidity for all pairs).
4. **Privacy & Identity Infrastructure**:
   * `ERC5564Announcer` (standard event broadcaster).
   * `ERC6538Registry` (stealth meta-address registry).
   * `MockL2Resolver` (Base Basename resolver simulator).
   * `AlloyBasenameResolver` (dual-tier resolution contract).
   * `AlloyStealthRelayer` (gasless permit sweeper).
5. **Master Coordinator**:
   * `AlloyHarvestRouter(address(dex), address(announcer))`.
6. **Artifact Export**:
   * Exports deployed addresses and JSON ABIs to `frontend/src/contracts/deployedAddresses.json`.

---

## 3. Frontend Architecture (`frontend/` in Monorepo)

The frontend will reside strictly in `frontend/` to maintain our clean monorepo format:

```
frontend/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    // Master Alloy Dashboard
│   │   └── providers.tsx               // Wagmi, QueryClient, Wallet providers
│   ├── components/
│   │   ├── Header.tsx                  // Wallet connection & Basename badge
│   │   ├── PortfolioSection.tsx        // B20 stocks, multiplier tracker, dividend simulator
│   │   ├── HarvestStudio.tsx           // Payout routing: Basename Stealth vs Meme Ape
│   │   ├── StealthInbox.tsx            // Announcement scanner & 1-click gasless claim
│   │   └── PrivacyVisualizer.tsx       // Interactive onchain linkability graph
│   ├── lib/
│   │   ├── stealth.ts                  // secp256k1 ECDH derivation, view tags, scanning
│   │   ├── basename.ts                 // Dual-tier resolution & namehash helper
│   │   ├── wagmiConfig.ts              // Base Sepolia & local chain configuration
│   │   └── demoState.ts                // Instant faucet & mock state for judge testing
│   └── contracts/
│       ├── addresses.ts                // Auto-populated deployed addresses
│       └── abis/                       // Contract ABIs
```

### 3.1 Tech Stack
* **Framework**: Next.js 14/15 App Router + TypeScript.
* **Styling**: Tailwind CSS + Lucide Icons (Base design system: dark mode, deep blues, glassmorphism cards).
* **Web3 Integration**: `viem` + `wagmi` (Base Sepolia + Coinbase Smart Wallet support).
* **Client Cryptography**: `@noble/secp256k1` + `@noble/hashes` for high-performance ECDH, view tag filtering, and key recovery in the browser.

---

## 4. Client-Side Cryptographic Engine (`frontend/src/lib/stealth.ts`)

Implements the full ERC-5564 Scheme 1 specification in TypeScript:
1. **Key Generation**:
   * Generates or derives $(k_{\text{spend}}, K_{\text{spend}})$ and $(k_{\text{view}}, K_{\text{view}})$.
   * Formats 66-byte stealth meta-address `st:eth:0x<K_spend><K_view>`.
2. **Derivation (Sender)**:
   * Takes recipient's meta-address.
   * Generates ephemeral scalar $r \in_R [1, n-1]$.
   * Computes shared secret $S = r \cdot K_{\text{view}}$.
   * Derives scalar hash $h = \text{keccak256}(\text{compressed}(S))$ and 1-byte view tag $v = h[0]$.
   * Derives stealth address $P = \text{address}(K_{\text{spend}} + h \cdot G)$.
3. **Scanner (Recipient)**:
   * Listens to `Announcement` events on Base Sepolia.
   * Filters by 1-byte view tag ($255/256 \approx 99.6\%$ dismissed in $O(1)$ time).
   * Verifies address match.
   * Derives one-time private key $k_{\text{stealth}} = (k_{\text{spend}} + h) \pmod n$.
4. **Gasless Sweep Signature**:
   * Generates EIP-2612 `Permit` signature with $k_{\text{stealth}}$ for `AlloyStealthRelayer`.

---

## 5. UI/UX Screens & Interaction Workflows

### Screen 1: Equity Portfolio & Live Dividend Simulator
* **Display**:
  * Cards for $AAPLc$ and $NVDAc$ showing:
    * Held shares (e.g. 100 shares).
    * Current Multiplier (e.g. $1.0000\text{x}$).
    * Effective Position Value ($\$20,000$).
    * Accrued Dividend Yield ($\$0.00$).
* **Interactive Simulator (For Judges & Testers)**:
  * Button: *"⚡ Simulate Apple $2.50/Share Dividend"*.
  * On click: Calls `distributeDividend(25e17, 200e18)`.
  * **Visual Effect**: Multiplier animates to $1.0125\text{x}$, and the pending dividend banner glows green: *"🎉 $246.91 Dividend Available to Harvest!"*

### Screen 2: Programmable Harvest & Payout Studio
* **Mode 1: Private Basename Payout**:
  * Recipient Input: User enters `bob` or `bob.base.eth`.
  * Real-time resolution badge: *"Resolved: st:eth:0x0279... (Unlinkable)"*.
  * Currency Selector:
    * 💵 **USDC** (USD Coin)
    * 🇳🇬 **cNGN** (Compliant Nigerian Naira — highlighting emerging market access)
    * 💶 **EURC** (Euro Coin)
  * Action: *"Harvest & Send Privately"* (Calls `harvestToStealth`).
* **Mode 2: Base Meme Ape / Gift**:
  * Token Selector: **$CLANKER**, **$HIGHER**, **$DEGEN**.
  * Destination: *"My Wallet"* or *"Gift to Basename"*.
  * Action: *"Ape Dividend into $CLANKER"* (Calls `harvestToMeme` or `harvestToStealthMeme`).

### Screen 3: Stealth Inbox & Gasless Sweep
* **Display**:
  * Lists all incoming dividend transfers directed to the user's Basename that landed on stealth addresses.
  * Shows unspent balance per stealth address (e.g. $246.91 USDC).
* **Action**:
  * Button: *"🚀 1-Click Gasless Sweep to Cold Wallet"*.
  * Invokes `AlloyStealthRelayer.sweepWithPermit`. The stealth address pays **0 ETH**, gas is covered by the relayer, and net tokens land safely in the cold wallet.

### Screen 4: Onchain Privacy Visualizer (The "Aha!" Moment for Judges)
* Interactive flow diagram:
  ```
  [Alice's Wallet] ──> [Alloy Router] ──> [0x7f4a...9b] (Stealth Address)
                                                │
                                                ▼
                                         [Bob's Cold Wallet]
  ```
* Highlights in green: **"No onchain link between Alice and Bob. Bob's Basename never appeared in transaction logs."**

---

## 6. Hackathon Submission & Loom Video Strategy

### Target Requirements from Base:
1. Post a Loom demo on X explaining how it works, tagging `@buildonbase`.
2. Submit project link.

### 2-Minute Video Flow:
* **0:00 - 0:30 (The Hook & Problem)**:
  * "Tokenized stocks on Base pay real dividends, but they sit idle inside a multiplier. Worse, every dividend payout on Base is permanently doxxed."
* **0:30 - 1:00 (The Solution — Alloy)**:
  * Show held $AAPLc$. Click "Simulate Dividend" $\to$ multiplier increases live $\to$ pending yield appears.
  * Show mathematical principal preservation (100 shares stay 100 shares).
* **1:00 - 1:30 (Basenames + Stealth Rail)**:
  * Type `bob.base.eth`. Show it resolves to an ERC-5564 stealth meta-address.
  * Select $cNGN$ or $USDC$. Execute harvest.
  * Open Basescan simulation: point out that `bob.base.eth` and Bob's wallet do NOT appear anywhere in the transaction.
* **1:30 - 1:45 (Base Composability — Meme Ape)**:
  * Show 1-click option to divert dividend directly into $CLANKER / $HIGHER.
* **1:45 - 2:00 (Stealth Inbox & Gasless Sweep)**:
  * Switch to Bob's view. Open "Stealth Inbox".
  * Click "Gasless Sweep" $\to$ tokens land in cold wallet with 0 ETH spent.
  * Conclusion: "Alloy: The private, programmable payout rail for real equities on Base."

---

## 7. Implementation Checklist

- [ ] Write `contracts/script/DeployAlloy.s.sol` Foundry script.
- [ ] Test deployment on local Anvil / dry-run.
- [ ] Scaffold `frontend/` using Next.js, Tailwind, and Viem in monorepo format.
- [ ] Implement `frontend/src/lib/stealth.ts` (secp256k1 ECDH engine).
- [ ] Build Dashboard components (Portfolio, HarvestStudio, StealthInbox, PrivacyVisualizer).
- [ ] Connect web3 hooks to deployed contracts.
- [ ] Verify complete demo workflow.
