  ### Phase 1: Core Research & Architectural Modules

  1. Module 1: Tokenized Stock Mechanics & Dividend Detection
      • How do B20 / Backed / Coinbase tokenized stocks represent dividends onchain? (e.g., multiplier rebasing vs accrual indexes
      vs payout distributions).
      • How do we measure and extract accrued yield without liquidating or diluting the underlying principal shares?
      • Detection: Onchain contract reading vs reactive event listeners / offchain indexers.
  2. Module 2: Stealth Address & Privacy Architecture (ERC-5564 & ERC-6538)
      • Cryptographic flow: secp256k1 ECDH, stealth meta-address (K_spend, K_view), ephemeral pubkeys, and view tags for fast
      scanning.
      • The "gas funding" dilemma: When funds land on a fresh, unlinked stealth address, how does the recipient pay gas to move or
      spend them without linking back to their KYC/known wallet?
      • Announcements & indexing: ERC-5564 events vs gas overhead on Base.
  3. Module 3: Username Resolution & Identity Layer
      • Registry design: ERC-6538 extension vs custom lightweight username contract.
      • What data gets published: (Username → Stealth Meta-Address).
      • Privacy analysis: Does looking up @bob leak metadata, and how do we ensure it remains completely unlinkable to Bob's real
      wallet address?
  4. Module 4: Conversion & Routing Layer
      • How does the harvested dividend get routed?
      • Liquidity & Swaps: DEX routing on Base (Aerodrome / Uniswap v3 / mock pools) into local stablecoins (USDC, cNGN) or Base
      meme coins (Clanker / Zora).
      • Transaction atomicity: Can harvest → swap → stealth payout occur in a single atomic transaction, or does it need to be
      asynchronous?
  5. Module 5: System Boundaries & Hackathon Scope
      • Contract boundaries vs client-side crypto vs indexer/relayer.
      • Base Sepolia mocks vs live protocol integrations.

  ──────
