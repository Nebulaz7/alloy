# Alloy — Module 2 Implementation Plan: Stealth Address Privacy Layer (ERC-5564 & ERC-6538)

## 1. Overview & Objectives

Module 2 delivers the privacy differentiator of **Alloy**:
* **Standard Conformance**:
  * **ERC-5564**: Stealth Address Generation & Announcement standard.
  * **ERC-6538**: Stealth Meta-Address Registry standard.
* **Core Guarantee**: **Unlinkability**. When a dividend is harvested and paid out, third-party observers watching the blockchain explorer cannot connect the recipient's identity, Basename, or known public wallet to the receiving address or its downstream activity.
* **Non-Interactive Execution**: Senders derive the stealth destination address locally without requiring real-time interaction or signature from the recipient.
* **Atomic Onchain Broadcaster**: The `AlloyHarvestRouter` trims the dividend surplus, swaps to the target currency, transfers to the stealth address, and broadcasts the announcement in a **single atomic transaction**.

---

## 2. Cryptographic Specification (secp256k1 ECDH)

Alloy adopts **Scheme ID 1** (secp256k1 with view tag), matching the standard Ethereum specification.

### 2.1 Keys & Meta-Address Structure
A recipient possesses two distinct private/public key pairs:
1. **Spending Key Pair**:
   * Private key: $k_{\text{spend}} \in \mathbb{F}_q$
   * Public key: $K_{\text{spend}} = k_{\text{spend}} \cdot G \in \mathbb{G}$
2. **Viewing Key Pair**:
   * Private key: $k_{\text{view}} \in \mathbb{F}_q$
   * Public key: $K_{\text{view}} = k_{\text{view}} \cdot G \in \mathbb{G}$

* **Stealth Meta-Address**: The concatenation of both compressed public keys:
  $$\text{MetaAddress} = (K_{\text{spend}} \;\|\; K_{\text{view}}) \quad (\text{66 bytes: 33 bytes } K_{\text{spend}} + 33\text{ bytes } K_{\text{view}})$$
  Standard prefix: `st:eth:0x...`

### 2.2 Sender Derivation Algorithm (Offchain)
When sending dividend yield to a recipient:
1. Sender retrieves recipient's $(K_{\text{spend}}, K_{\text{view}})$ (via Basenames or ERC-6538).
2. Sender generates cryptographically secure ephemeral scalar:
   $$r \in_R [1, n-1]$$
3. Sender computes ephemeral public key:
   $$R = r \cdot G$$
4. Sender computes Diffie-Hellman shared secret:
   $$S = r \cdot K_{\text{view}} = r \cdot (k_{\text{view}} \cdot G)$$
5. Sender hashes the shared secret:
   $$h = \text{keccak256}(\text{compressed}(S))$$
6. Sender extracts the **View Tag** (1 byte):
   $$v = h[0]$$
7. Sender computes one-time stealth public key:
   $$P = K_{\text{spend}} + h \cdot G$$
8. Sender derives destination stealth address:
   $$\text{stealthAddress} = \text{address}(P) = \text{uint160}(\text{uint256}(\text{keccak256}(\text{uncompressed}(P)[1..64])))$$

### 2.3 Onchain Announcement Broadcast (ERC-5564)
The contract emits:
```solidity
event Announcement(
    uint256 indexed schemeId,      // 1 (secp256k1)
    address indexed stealthAddress, // P address
    address indexed caller,         // Router address
    bytes ephemeralPubKey,          // R (33 bytes)
    bytes metadata                  // abi.encodePacked(viewTag, extraData)
);
```

### 2.4 Recipient Discovery & Scanning Algorithm (Offchain)
Recipients scan announcements efficiently using their viewing private key $k_{\text{view}}$:
1. For each `Announcement` log:
   * Parse $R$ and $v_{\text{log}} = \text{metadata}[0]$.
   * Compute trial shared secret:
     $$S' = k_{\text{view}} \cdot R$$
   * Compute trial hash:
     $$h' = \text{keccak256}(\text{compressed}(S'))$$
   * **Fast View Tag Check**: Compare $h'[0] \stackrel{?}{=} v_{\text{log}}$.
     * If they do not match ($255/256 \approx 99.6\%$ of non-matching transactions), **skip immediately without expensive point multiplication**.
   * **Full Verification**: Compute $P' = K_{\text{spend}} + h' \cdot G$.
   * If $\text{address}(P') == \text{stealthAddress}$, the payment belongs to the recipient!
2. Compute the one-time spending private key:
   $$k_{\text{stealth}} = (k_{\text{spend}} + h') \pmod n$$
   The recipient now has exclusive cryptographic control of the funds.

---

## 3. The "Gas Funding" Dilemma & Unlinkable Withdrawal Architecture

### Problem
Funds land on fresh address $P$ as ERC-20 stablecoins ($USDC$, $cNGN$). The address has **0 ETH** for gas. If the user sends ETH to $P$ from their known main wallet, an onchain link is formed, compromising privacy.

### Alloy Solution: Dual-Mode Unlinkable Withdrawal
1. **Mode A: Gasless Permit & Relayer Sweep (Primary for Hackathon)**
   * Target tokens implement EIP-2612 (`permit`).
   * Recipient generates an offchain permit signature with $k_{\text{stealth}}$ authorizing a relayer / sweep contract to transfer the stablecoin.
   * Recipient signs a transfer message directing the funds to their chosen clean off-ramp or secondary wallet.
   * The relayer executes the transaction, paying Base gas, and deducts a nominal fee ($0.20 USDC) from the transferred amount.
   * **Zero ETH required in the stealth wallet; zero identity linkage.**
2. **Mode B: Base Paymaster (ERC-4337)**
   * Coinbase Smart Wallet paymaster sponsors or accepts USDC as fee tokens on Base.

---

## 4. Smart Contract Architecture (Foundry Layout)

All contracts will reside in `contracts/src/` alongside Module 1:

```
contracts/
├── src/
│   ├── interfaces/
│   │   ├── IERC5564Announcer.sol       // ERC-5564 standard interface
│   │   ├── IERC6538Registry.sol        // ERC-6538 standard interface
│   │   └── IAlloyHarvestRouter.sol     // Extended with harvestToStealth()
│   ├── privacy/
│   │   ├── ERC5564Announcer.sol        // Broadcaster contract
│   │   ├── ERC6538Registry.sol         // Canonical stealth meta-address registry
│   │   └── AlloyStealthRelayer.sol     // Gasless sweep & fee deduction helper
│   ├── AlloyHarvestRouter.sol          // Atomic harvest + swap + stealth announce
│   └── mocks/                          // Existing mocks from Module 1
└── test/
    ├── ERC6538Registry.t.sol           // Unit tests for registration & lookup
    ├── ERC5564Announcer.t.sol          // Unit tests for announcement events & view tags
    └── AlloyStealthHarvest.t.sol       // End-to-end integration test
```

### 4.1 `IERC6538Registry.sol` & `ERC6538Registry.sol`
* **Storage**:
  `mapping(address => mapping(uint256 => bytes)) internal _stealthMetaAddresses;`
* **Core Functions**:
  * `registerKeys(uint256 schemeId, bytes calldata stealthMetaAddress) external`
  * `registerKeysOnBehalf(address registrant, uint256 schemeId, bytes calldata signature, bytes calldata stealthMetaAddress) external`
  * `stealthMetaAddressOf(address registrant, uint256 schemeId) external view returns (bytes memory)`
* **Events**:
  `event StealthMetaAddressSet(address indexed registrant, uint256 indexed schemeId, bytes stealthMetaAddress);`

### 4.2 `IERC5564Announcer.sol` & `ERC5564Announcer.sol`
* **Core Function**:
  ```solidity
  function announce(
      uint256 schemeId,
      address stealthAddress,
      bytes memory ephemeralPubKey,
      bytes memory metadata
  ) external {
      emit Announcement(schemeId, stealthAddress, msg.sender, ephemeralPubKey, metadata);
  }
  ```

### 4.3 `AlloyHarvestRouter.sol` Integration
Add atomic stealth routing method:
```solidity
function harvestToStealth(
    address stockToken,
    address targetToken,
    uint256 minTargetAmount,
    address stealthAddress,
    bytes calldata ephemeralPubKey,
    bytes calldata metadata
) external returns (uint256 targetAmountOut);
```
* **Execution Flow**:
  1. Calculate surplus shares $\Delta B$.
  2. Pull surplus shares from `msg.sender`.
  3. Swap surplus shares via `MockDEX` for `targetToken` (delivering proceeds to `stealthAddress`).
  4. Call `IERC5564Announcer(announcer).announce(1, stealthAddress, ephemeralPubKey, metadata)`.
  5. Emit `Harvested` event.

---

## 5. Basenames Connection (Module 3 Linkage)

When resolving recipient `bob.base.eth`:
1. Check `Base L2Resolver.text(namehash("bob.base.eth"), "stealth")`.
2. If absent, check `ERC6538Registry.stealthMetaAddressOf(Base L2Resolver.addr(namehash("bob.base.eth")), 1)`.
3. The sender performs ECDH on the retrieved meta-address and invokes `harvestToStealth()`.

---

## 6. Testing & Verification Plan

### Test Suite 1: `ERC6538RegistryTest`
* Test key registration for scheme 1.
* Test querying non-existent registrant returns empty bytes.
* Test event emission.
* Test update / overwrite of keys.

### Test Suite 2: `ERC5564AnnouncerTest`
* Test announcement emission with 33-byte ephemeral key and 1-byte view tag metadata.
* Verify log parameters match ERC-5564 standard selectors.

### Test Suite 3: `AlloyStealthHarvestTest` (End-to-End Cryptographic Flow)
* **Setup**:
  * Bob generates $(k_{\text{spend}}, K_{\text{spend}})$ and $(k_{\text{view}}, K_{\text{view}})$.
  * Bob registers his stealth meta-address in `ERC6538Registry`.
  * Alice holds 100 shares of $AAPLc$.
  * Operator triggers a $2.50 dividend on $200 AAPL (+1.25%).
* **Action**:
  * Alice looks up Bob's stealth meta-address.
  * Alice derives ephemeral scalar $r$, $R = r \cdot G$, shared secret $S$, view tag $v$, and stealth address $P$.
  * Alice executes `router.harvestToStealth(AAPLc, USDC, minOut, P, R, metadata)`.
* **Verification**:
  * Bob's stealth address $P$ receives the USDC dividend proceeds.
  * `Announcement` event emitted with correct $R$ and view tag.
  * Alice's AAPLc principal remains conserved down to 1 wei.
  * Bob runs the discovery algorithm using $k_{\text{view}}$, verifies view tag match, derives $k_{\text{stealth}}$, and successfully signs a test transfer of the USDC funds.
