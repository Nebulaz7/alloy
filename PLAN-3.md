# Alloy — Module 3 Implementation Plan: Basenames & Identity Resolution Layer

## 1. Overview & Objectives

Module 3 integrates Base’s native identity protocol (**Basenames**) into **Alloy**:
* **Target Identity**: `.base.eth` names (e.g. `bob.base.eth` or simply typing `bob`).
* **The Problem Solved**:
  * Raw hex addresses (`0x71C...`) are poor UX and error-prone.
  * Standard Basename payments send funds directly to `L2Resolver.addr(node)`—publicly exposing the recipient's identity, dividend income, and all downstream transactions on Basescan.
* **The Alloy Solution**:
  * Users enter a human-readable Basename (`bob.base.eth`).
  * Alloy resolves the Basename to an **ERC-5564 Stealth Meta-Address** (`st:eth:0x...`) offchain or via an optimized helper.
  * The harvested dividend is sent to a **one-time stealth address ($P$)**, completely decoupling Bob's public Basename from the onchain payment.

---

## 2. Basenames Architecture on Base

### 2.1 Namehashing Algorithm (ENS Standard)
Basenames use the recursive ENS Namehash standard over dot-separated labels:
* $\text{namehash}("") = 0x0000000000000000000000000000000000000000000000000000000000000000$
* For a domain $label.remainder$:
  $$\text{node} = \text{keccak256}(\text{abi.encodePacked}(\text{namehash}(remainder), \text{keccak256}(\text{bytes}(label))))$$
* *Example for `bob.base.eth`:*
  1. $node_{\text{eth}} = \text{keccak256}(0x00...00 \;\|\; \text{keccak256}("eth"))$
  2. $node_{\text{base.eth}} = \text{keccak256}(node_{\text{eth}} \;\|\; \text{keccak256}("base"))$
  3. $node_{\text{bob.base.eth}} = \text{keccak256}(node_{\text{base.eth}} \;\|\; \text{keccak256}("bob"))$

### 2.2 Base L2Resolver Specifications
On Base Mainnet, the canonical L2Resolver is deployed at `0x426fA03fB86E510d0Dd9F70335Cf102a98b10875`.
Standard interface methods:
* `addr(bytes32 node) external view returns (address)`: Returns registrant's public wallet address.
* `text(bytes32 node, string calldata key) external view returns (string memory)`: Returns arbitrary text records.
* `setAddr(bytes32 node, address a) external`: Updates the target address.
* `setText(bytes32 node, string calldata key, string calldata value) external`: Updates text metadata.

---

## 3. Dual-Tier Resolution Pipeline (Hybrid Standard)

To maximize compatibility for both users who configure explicit text records and users who only register in ERC-6538, Alloy implements a dual-tier lookup pipeline:

```
                            User inputs "bob" or "bob.base.eth"
                                           │
                                           ▼
                                 Normalize & Namehash
                                           │
                                           ▼
                              [Query 1: Direct Text Record]
                         L2Resolver.text(node, "stealth")
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ Found & Valid                       │ Unset / Empty
                        ▼                                     ▼
             Return Stealth Meta-Address          [Query 2: Fallback Registry]
                                                  addr = L2Resolver.addr(node)
                                                              │
                                                  ┌───────────┴───────────┐
                                                  │ addr != 0             │ addr == 0
                                                  ▼                       ▼
                                       ERC6538Registry.lookup   Revert: NameNotFound
                                                  │
                                       ┌──────────┴──────────┐
                                       │ Found               │ Not Found
                                       ▼                     ▼
                            Return Meta-Address      Revert: NoStealthKeys
```

### 3.1 Tier 1: Direct Basename Text Record (`"stealth"`)
* Key: `"stealth"` (or `"stealth-meta-address"`).
* Value: `st:eth:0x<66-byte hex>` (139 characters total: 7-char prefix + 132 hex characters representing 33 bytes $K_{\text{spend}}$ + 33 bytes $K_{\text{view}}$).
* **Benefit**: The user's stealth configuration is stored natively inside their Basename profile.

### 3.2 Tier 2: Canonical Fallback (`addr` $\rightarrow$ ERC-6538 Registry)
* If the user hasn't explicitly set a `"stealth"` text record on their Basename, Alloy reads `L2Resolver.addr(node)`.
* If an address is returned, Alloy queries the canonical `ERC6538Registry` for scheme ID 1 (`secp256k1`).
* **Benefit**: Users who already registered their keys in the ERC-6538 registry don't need to spend extra gas writing text records to their Basename.

---

## 4. Smart Contract Architecture (Foundry Layout)

All contracts will reside in `contracts/src/` alongside Modules 1 & 2:

```
contracts/
├── src/
│   ├── interfaces/
│   │   ├── IL2Resolver.sol            // Base L2Resolver standard interface
│   │   └── IAlloyBasenameResolver.sol // Dual-tier lookup interface
│   ├── identity/
│   │   └── AlloyBasenameResolver.sol  // Offchain/onchain dual-tier resolver
│   ├── mocks/
│   │   └── MockL2Resolver.sol         // Base L2Resolver simulator for Base Sepolia
│   └── privacy/                       // Module 2 contracts
└── test/
    ├── MockL2Resolver.t.sol           // Unit tests for L2Resolver simulator
    ├── AlloyBasenameResolver.t.sol    // Dual-tier resolution & namehash tests
    └── AlloyStealthHarvest.t.sol      // E2E Basename -> Stealth -> Relayer test
```

### 4.1 `IL2Resolver.sol` & `MockL2Resolver.sol`
* Implements standard ENS resolver methods on Base:
  * `addr(bytes32 node)`
  * `text(bytes32 node, string calldata key)`
  * `setAddr(bytes32 node, address a)`
  * `setText(bytes32 node, string calldata key, string calldata value)`
  * Emits `AddrChanged(bytes32 indexed node, address a)` and `TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)`.

### 4.2 `AlloyBasenameResolver.sol`
* Implements the dual-tier lookup logic:
  ```solidity
  function resolveStealthMetaAddress(
      bytes32 node
  ) external view returns (bytes memory stealthMetaAddress, address fallbackAddress);

  function resolveBasename(
      string calldata name
  ) external view returns (bytes memory stealthMetaAddress, address fallbackAddress);
  ```
* Includes on-chain Namehash calculation helper for arbitrary subdomains under `.base.eth`.
* Custom Errors:
  * `BasenameNotFound(string name)`
  * `NoStealthKeysRegistered(string name, address resolvedAddress)`
  * `InvalidStealthFormat(string record)`

---

## 5. Privacy & Threat Analysis

| Threat / Concern | Exposure | Mitigation in Alloy |
| :--- | :--- | :--- |
| **Is `"bob.base.eth"` visible onchain?** | ❌ **Zero Exposure** | The Basename query is performed offchain via `eth_call`. The string `"bob.base.eth"` is **never passed** to the router and **never emitted** in logs. |
| **Is Bob's public wallet (`0xBob`) linked?** | ❌ **Zero Exposure** | The payment transaction routes funds strictly to the one-time stealth address $P$. Bob's public address is never mentioned. |
| **Can anyone link $P$ to Bob?** | ❌ **Cryptographically Impossible** | Deriving $P$ uses ECDH with an ephemeral scalar $r$. Without Bob's private viewing key $k_{\text{view}}$, $P$ is indistinguishable from a random Ethereum address. |
| **Can RPC providers correlate queries?** | ⚠️ Minor metadata | If Alice queries `bob.base.eth` right before sending, an RPC node could theoretically correlate the timing. In production, queries can be batched, routed through private RPCs, or cached client-side. |

---

## 6. Testing & Verification Matrix

### Test Suite 1: `MockL2ResolverTest`
* Verify setting and querying `addr(node)`.
* Verify setting and querying `text(node, "stealth")`.
* Verify event emission.

### Test Suite 2: `AlloyBasenameResolverTest`
* **Namehash test**: Computes namehash of `bob.base.eth` and matches standard test vectors.
* **Direct Tier-1 test**: Sets `text(node, "stealth", "st:eth:0x...")`, verifies resolution returns the 66-byte meta-address.
* **Fallback Tier-2 test**: Leaves text record empty, sets `addr(node, bobPublicWallet)`, registers meta-address in `ERC6538Registry`, verifies fallback lookup succeeds.
* **Error handling**:
  * Unregistered Basename reverts with `BasenameNotFound`.
  * Basename with address but no stealth keys reverts with `NoStealthKeysRegistered`.
  * Malformed text record reverts with `InvalidStealthFormat`.

### Test Suite 3: End-to-End Basename Stealth Harvest
* Alice specifies recipient as `bob.base.eth`.
* App resolves `bob.base.eth` $\to$ Bob's stealth meta-address.
* Alice harvests AAPLc dividend to Bob's derived stealth address $P$.
* Bob detects payment, signs permit, and sweeps via `AlloyStealthRelayer`.
