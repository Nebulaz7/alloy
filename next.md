1. Stealth Inbox & Gasless Sweeper Widget (

useStealthInbox
)
Context: The smart contract (AlloyStealthRelayer) and headless hook (

useStealthInbox.ts
) are already built. They solve the 0-ETH problem (when a stealth address receives USDC or meme coins, it has no ETH to pay gas fees).
What to build: Add a dedicated "Stealth Inbox / Unclaimed Dividends" section or drawer into

/activities
or

/harvest
, letting users scan Base Sepolia for ERC-5564 announcements matching their viewing key and sweep funds with 0 ETH gas. 2. All-in-One Token Balances & Judge Faucet Hub (

useTokenBalances
)
Context: Recipe 10 in

INSTRUCT.md
specifies an all-in-one testnet faucet view for hackathon judges showing all 9 deployed tokens (AAPLc, NVDAc, COINc, USDC, cNGN, CLANKER, HIGHER, DEGEN, and Base Sepolia ETH).
What to build: An interactive card/table in

/settings
or

/simulator
showing real-time balances for all 9 tokens with 1-click "Mint 100" buttons. 3. Public Payment / Tip Link Page (/[basename] or /pay/[basename])
Context: The

PersonalLinkCard
generates a shareable link (alloy.cash/bob.base.eth).
What to build: A lightweight public pay page where an external user can visit alloy.cash/[basename] to send private dividends or tips directly to that Basename, deriving a one-time stealth address automatically. 4. PWA Support & Mobile Web App Manifest
Context: Mobile installability outlined in

DAPP-PLAN.md
.
What to build: Create public/manifest.json, add Apple touch icons, and configure standalone mobile web app meta tags in

app/layout.tsx
.
