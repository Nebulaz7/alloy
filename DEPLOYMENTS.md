# Alloy — Onchain Deployments

## Network Information

* **Network**: Base Sepolia Testnet
* **Chain ID**: `84532`
* **RPC Endpoint**: `https://sepolia.base.org`
* **Block Explorer**: [BaseScan Sepolia](https://sepolia.basescan.org/)
* **Deployment Block**: `46446262`
* **Deployer Address**: `0xeca6Ff5Ce16bf15E38a4F28DE6da2397438f7918`
* **Total Gas Paid**: `0.000077793642 ETH`

---

## Deployed Smart Contracts

| Contract Name | Address | Description | Explorer Link |
| :--- | :--- | :--- | :--- |
| **`MockB20 AAPLc`** | `0x5B57069627a99E79d852C3A156886E0Db9e703a8` | Tokenized Apple Stock (B20 Asset variant with multiplier) | [View on BaseScan](https://sepolia.basescan.org/address/0x5B57069627a99E79d852C3A156886E0Db9e703a8) |
| **`MockB20 NVDAc`** | `0x6c42b4049dA39216d49Da72AA6B199D7aF877fF6` | Tokenized Nvidia Stock (B20 Asset variant with multiplier) | [View on BaseScan](https://sepolia.basescan.org/address/0x6c42b4049dA39216d49Da72AA6B199D7aF877fF6) |
| **`MockB20 COINc`** | `0xC766102E8140E46dfB12b01Ab79667df1D38C724` | Tokenized Coinbase Stock (B20 Asset variant with multiplier) | [View on BaseScan](https://sepolia.basescan.org/address/0xC766102E8140E46dfB12b01Ab79667df1D38C724) |
| **`Mock USDC`** | `0xb15cbEc963EC9791dF96ca60e5b73E7202511747` | USD Coin (6 decimals, EIP-2612 permit support) | [View on BaseScan](https://sepolia.basescan.org/address/0xb15cbEc963EC9791dF96ca60e5b73E7202511747) |
| **`Mock cNGN`** | `0xe1D6e244632Cbb1d89cE2Da1e21Ec83FCCb63656` | Compliant Nigerian Naira stablecoin (6 decimals) | [View on BaseScan](https://sepolia.basescan.org/address/0xe1D6e244632Cbb1d89cE2Da1e21Ec83FCCb63656) |
| **`Mock $CLANKER`** | `0xf73716899193ce90377631Aa00DCD9C6eDB19aF8` | Base-native AI meme token (18 decimals) | [View on BaseScan](https://sepolia.basescan.org/address/0xf73716899193ce90377631Aa00DCD9C6eDB19aF8) |
| **`Mock $HIGHER`** | `0x7E394E4C40D029ec15dE7Db1224a0858dAFA76dB` | Base community meme token (18 decimals) | [View on BaseScan](https://sepolia.basescan.org/address/0x7E394E4C40D029ec15dE7Db1224a0858dAFA76dB) |
| **`Mock $DEGEN`** | `0xE588DAa5b526694B149eBCAf0042d1009CA7e7FE` | Base/Farcaster community token (18 decimals) | [View on BaseScan](https://sepolia.basescan.org/address/0xE588DAa5b526694B149eBCAf0042d1009CA7e7FE) |
| **`Mock DEX`** | `0x15bCFD66af185c97CB99dfe0a2d2d3c027Da6DF1` | Secondary AMM liquidity pool & oracle router | [View on BaseScan](https://sepolia.basescan.org/address/0x15bCFD66af185c97CB99dfe0a2d2d3c027Da6DF1) |
| **`ERC5564 Announcer`** | `0xBd809F5Fef1dB656cc3b38386C31aA64D1a967F5` | Canonical ERC-5564 stealth announcement broadcaster | [View on BaseScan](https://sepolia.basescan.org/address/0xBd809F5Fef1dB656cc3b38386C31aA64D1a967F5) |
| **`ERC6538 Registry`** | `0xf54e5c0A08CEf9263dd3c24dd1cbdFaaEe353F6B` | Canonical ERC-6538 stealth meta-address registry | [View on BaseScan](https://sepolia.basescan.org/address/0xf54e5c0A08CEf9263dd3c24dd1cbdFaaEe353F6B) |
| **`Mock L2Resolver`** | `0x1ab326aF806bE8Fb95F051A7347184242E3D1328` | Base Basenames L2Resolver simulator | [View on BaseScan](https://sepolia.basescan.org/address/0x1ab326aF806bE8Fb95F051A7347184242E3D1328) |
| **`Alloy Basename Resolver`** | `0xD5687794c8E1b69F477911Df56170679CB6414eC` | Dual-tier Basename resolution contract | [View on BaseScan](https://sepolia.basescan.org/address/0xD5687794c8E1b69F477911Df56170679CB6414eC) |
| **`Alloy Stealth Relayer`** | `0xc9d7d371bEc6aafeC73C202821A75b230Ad00D24` | Gasless sweeper for 0-ETH stealth addresses | [View on BaseScan](https://sepolia.basescan.org/address/0xc9d7d371bEc6aafeC73C202821A75b230Ad00D24) |
| **`Alloy Harvest Router`** | `0x22fd6f7283aF20815980228F563a17F21B25C359` | Master non-custodial dividend extraction coordinator | [View on BaseScan](https://sepolia.basescan.org/address/0x22fd6f7283aF20815980228F563a17F21B25C359) |

---

## Pre-Seeded Onchain State

### 1. Deployer Initial Holdings
* **Deployer Address**: `0xeca6Ff5Ce16bf15E38a4F28DE6da2397438f7918`
* `100.0 AAPLc` shares ($20,000 initial value)
* `200.0 NVDAc` shares ($26,000 initial value)
* `100.0 COINc` shares ($22,000 initial value)

### 2. DEX Liquidity Reserves
* `10,000,000 USDC` ($10M)
* `10,000,000,000 cNGN` ($6.25M equivalent)
* `10,000,000 $CLANKER` ($50M equivalent)
* `50,000,000 $HIGHER` ($5M equivalent)
* `100,000,000 $DEGEN` ($2M equivalent)

### 3. Demo Basename Identity
* **Name**: `bob.base.eth`
* **Node**: `0x61d1efd620addc3b34a60e25eb80098ea8879da07ec5322d04574a1f23157c13`
* **Registered Address**: `0x00000000000000000000000000000000000B0b01`
* **Stealth Text Record (`"stealth"`)**:
  `st:eth:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f8179802c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5`

---

## CLI Testing Recipes (`cast`)

```bash
# Set RPC endpoint
export RPC=https://sepolia.base.org

# 1. Read deployer AAPLc balance (returns 100000000000000000000 = 100 shares)
cast call 0x5B57069627a99E79d852C3A156886E0Db9e703a8 "balanceOf(address)(uint256)" 0xeca6Ff5Ce16bf15E38a4F28DE6da2397438f7918 --rpc-url $RPC

# 2. Read AAPLc multiplier (starts at 1e18 = 1.0x)
cast call 0x5B57069627a99E79d852C3A156886E0Db9e703a8 "multiplier()(uint256)" --rpc-url $RPC

# 3. Simulate a $2.50/share dividend on $200 AAPLc (+1.25%)
cast send 0x5B57069627a99E79d852C3A156886E0Db9e703a8 "distributeDividend(uint256,uint256)" 2500000000000000000 200000000000000000000 \
  --private-key $PRIVATE_KEY --rpc-url $RPC

# 4. Resolve "bob.base.eth" to its stealth meta-address
cast call 0xD5687794c8E1b69F477911Df56170679CB6414eC "resolveBasename(string)(bytes,address)" "bob.base.eth" --rpc-url $RPC
```
