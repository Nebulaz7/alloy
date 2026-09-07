# Alloy — Developer Integration Guide & Instructions (`INSTRUCT.md`)

This guide explains how to connect your existing reusable UI components ([`components/`](file:///C:/Users/PC/desktop/coding/alloy/app/components)) to the newly built, type-safe headless Web3 engine in [**`lib/`**](file:///C:/Users/PC/desktop/coding/alloy/app/lib).

---

## 1. Engine Directory Map (`app/lib/`)

The `lib/` architecture provides a clean separation of concerns:

```
app/lib/
├── contracts/
│   ├── addresses.ts        # 11 verified contracts on Base Sepolia (84532) + demo accounts
│   └── abis.ts             # Strongly-typed viem ABIs for all stocks, routers, and registries
├── crypto/
│   ├── stealth.ts          # Pure client-side ERC-5564 Scheme 1 ECDH, view tags, & key recovery
│   └── namehash.ts         # Standard ENS namehash & Basename formatters
├── wagmi.ts                # Reown AppKit adapter + Base Sepolia Wagmi configuration
├── providers.tsx           # <AlloyProviders> (Wagmi + React Query + Profile + Activity)
├── store/
│   ├── profileStore.tsx    # Reactive user profile (username, emoji avatar, theme, currency)
│   └── activityStore.tsx   # Persistent activity history matching ActivityItem interface
└── hooks/
    ├── useAlloyStocks.ts   # Live multiplier, balances, & accrued surplus (matches SignatureHeroCard)
    ├── useHarvest.ts       # 4 payout modes (Standard, Basename Stealth, Meme, Stealth Meme)
    ├── useBasename.ts      # Dual-tier Basename resolution, availability check, & reverse lookup
    ├── useSimulator.ts     # Triggers onchain distributeDividend() on Base Sepolia
    ├── useTokenBalances.ts # Real-time balances of all 9 tokens + 1-click test token minting
    └── useStealthInbox.ts  # Scans Base Sepolia logs for announcements & gasless sweeps
```

---

## 2. Step 1: Global Provider Setup (`app/layout.tsx`)

Wrap your application in `<AlloyProviders>` in `app/layout.tsx`. This enables Wagmi, React Query, your Profile state, and your Activity store across all pages:

```tsx
// app/layout.tsx
import { AlloyProviders } from "@/lib/providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AlloyProviders>{children}</AlloyProviders>
      </body>
    </html>
  );
}
```

---

## 3. Screen & Component Integration Recipes

All hooks in `lib/hooks/` were engineered to match the exact TypeScript interfaces and prop shapes you created in `components/`. You do not need to rewrite your UI.

---

### Recipe 1: Connecting `SignatureHeroCard` (Dashboard Hero)

**Component**: [`components/ui/SignatureHeroCard.tsx`](file:///C:/Users/PC/desktop/coding/alloy/app/components/ui/SignatureHeroCard.tsx)  
**Hook**: [`useAlloyStocks()`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/hooks/useAlloyStocks.ts)

`useAlloyStocks()` returns `stocks`, `totalDividendsEarned`, and `availableToHarvest` matching the exact `StockTokenItem[]` prop of `SignatureHeroCard`.

```tsx
import {
  SignatureHeroCard,
  StockTokenItem,
} from "@/components/ui/SignatureHeroCard";
import { useAlloyStocks } from "@/lib/hooks/useAlloyStocks";

export function DashboardHero({
  onSelectStock,
}: {
  onSelectStock?: (stock: StockTokenItem) => void;
}) {
  const { stocks, totalDividendsEarned, availableToHarvest, isLoading } =
    useAlloyStocks();

  return (
    <SignatureHeroCard
      title="Total Dividends Earned"
      totalDividendsEarned={totalDividendsEarned}
      availableToHarvest={availableToHarvest}
      items={stocks}
      onHarvestClick={(stock) => {
        console.log("Harvesting:", stock.symbol);
        onSelectStock?.(stock);
      }}
    />
  );
}
```

---

### Recipe 2: Connecting `PersonalLinkCard` (Stealth Handle)

**Component**: [`components/ui/PersonalLinkCard.tsx`](file:///C:/Users/PC/desktop/coding/alloy/app/components/ui/PersonalLinkCard.tsx)  
**Store**: [`useProfile()`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/store/profileStore.tsx)

```tsx
import { useState } from "react";
import { PersonalLinkCard } from "@/components/ui/PersonalLinkCard";
import { QRCodeModal } from "@/components/modals/QRCodeModal";
import { useProfile } from "@/lib/store/profileStore";

export function PersonalLinkSection() {
  const { profile } = useProfile();
  const [showQr, setShowQr] = useState(false);

  return (
    <>
      <PersonalLinkCard
        handle={profile.basename}
        avatarEmoji={profile.avatarEmoji}
        avatarBg={profile.avatarBg}
        onShowQr={() => setShowQr(true)}
      />

      <QRCodeModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        handle={profile.basename}
        address={profile.address}
      />
    </>
  );
}
```

---

### Recipe 3: Connecting `DividendSimModal` (Onchain Testing)

**Component**: [`components/modals/DividendSimModal.tsx`](file:///C:/Users/PC/desktop/coding/alloy/app/components/modals/DividendSimModal.tsx)  
**Hook**: [`useSimulator()`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/hooks/useSimulator.ts)

Replaces mock timeouts with a real transaction on Base Sepolia (`MockB20TokenizedStock.distributeDividend`).

```tsx
import { DividendSimModal } from "@/components/modals/DividendSimModal";
import { useSimulator } from "@/lib/hooks/useSimulator";
import { useAlloyStocks } from "@/lib/hooks/useAlloyStocks";

export function SimulatorPopup({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { simulateDividend, isSimulating } = useSimulator();
  const { refetch } = useAlloyStocks();

  return (
    <DividendSimModal
      isOpen={isOpen}
      onClose={onClose}
      onDividendSimulated={async (multiplier, surplus) => {
        // Triggers real dividend on Base Sepolia
        await simulateDividend("AAPLc", "2.50", "200.00");
        // Refreshes stock cards on the dashboard
        await refetch();
      }}
    />
  );
}
```

---

### Recipe 4: Connecting `NametagClaimFlow` (Onboarding)

**Component**: [`components/profile/NametagClaimFlow.tsx`](file:///C:/Users/PC/desktop/coding/alloy/app/components/profile/NametagClaimFlow.tsx)  
**Hook**: [`useBasename()`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/hooks/useBasename.ts)  
**Store**: [`useProfile()`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/store/profileStore.tsx)

```tsx
import { useRouter } from "next/navigation";
import { NametagClaimFlow } from "@/components/profile/NametagClaimFlow";
import { useProfile } from "@/lib/store/profileStore";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  return (
    <NametagClaimFlow
      initialUsername={profile.username}
      onComplete={(claimedData) => {
        // Persists avatar, username, and background theme to local storage
        updateProfile({
          username: claimedData.username,
          avatarEmoji: claimedData.avatarEmoji,
          avatarBg: claimedData.avatarBg,
          address: claimedData.address,
        });
        router.push("/dashboard");
      }}
    />
  );
}
```

---

### Recipe 5: Connecting `ConnectedWalletsModal` (Settings)

**Component**: [`components/modals/ConnectedWalletsModal.tsx`](file:///C:/Users/PC/desktop/coding/alloy/app/components/modals/ConnectedWalletsModal.tsx)  
**Hook**: `useAccount()` from Wagmi + `profile.stealthKeyPair`

```tsx
import { ConnectedWalletsModal } from "@/components/modals/ConnectedWalletsModal";
import { useAccount } from "wagmi";
import { useProfile } from "@/lib/store/profileStore";

export function WalletsModalWrapper({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { address } = useAccount();
  const { profile } = useProfile();

  return (
    <ConnectedWalletsModal
      isOpen={isOpen}
      onClose={onClose}
      primaryAddress={address || profile.address}
    />
  );
}
```

---

### Recipe 6: Connecting `ActivityRow` & `TxDetailModal` (Activities Page)

**Component**: [`components/ui/ActivityRow.tsx`](file:///C:/Users/PC/desktop/coding/alloy/app/components/ui/ActivityRow.tsx) & [`components/modals/TxDetailModal.tsx`](file:///C:/Users/PC/desktop/coding/alloy/app/components/modals/TxDetailModal.tsx)  
**Store**: [`useActivity()`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/store/activityStore.tsx)

```tsx
import { useState } from "react";
import { ActivityRow, ActivityItem } from "@/components/ui/ActivityRow";
import { TxDetailModal } from "@/components/modals/TxDetailModal";
import { useActivity } from "@/lib/store/activityStore";

export function ActivitiesList({ filterTab }: { filterTab: string }) {
  const { activities } = useActivity();
  const [selectedTx, setSelectedTx] = useState<ActivityItem | null>(null);

  const filtered = activities.filter((act) => {
    if (filterTab === "Incoming") return act.isPositive;
    if (filterTab === "Outgoing") return !act.isPositive;
    if (filterTab === "Gifts") return act.tags?.includes("stealth payout");
    return true; // "All"
  });

  return (
    <div className="space-y-2">
      {filtered.map((item) => (
        <ActivityRow
          key={item.id}
          activity={item}
          onClick={(act) => setSelectedTx(act)}
        />
      ))}

      <TxDetailModal
        isOpen={!!selectedTx}
        activity={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
```

---

### Recipe 7: Connecting `CurrencyPickerModal` (Settings)

**Component**: [`components/modals/CurrencyPickerModal.tsx`](file:///C:/Users/PC/desktop/coding/alloy/app/components/modals/CurrencyPickerModal.tsx)  
**Store**: [`useProfile()`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/store/profileStore.tsx)

```tsx
import { CurrencyPickerModal } from "@/components/modals/CurrencyPickerModal";
import { useProfile } from "@/lib/store/profileStore";

export function CurrencyModalWrapper({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { profile, setCurrency } = useProfile();

  return (
    <CurrencyPickerModal
      isOpen={isOpen}
      onClose={onClose}
      selectedCurrency={profile.currency}
      onSelectCurrency={(curr) => {
        setCurrency(curr.code as "USD" | "EUR" | "NGN" | "GBP");
        onClose();
      }}
    />
  );
}
```

---

### Recipe 8: Executing Dividend Harvests (Harvest Studio)

**Hook**: [`useHarvest()`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/hooks/useHarvest.ts)

Supports 1-click execution for standard wallet claims, Basename stealth routing, and Base meme coin auto-swaps:

```tsx
import { useHarvest } from "@/lib/hooks/useHarvest";

export function HarvestButton() {
  const { executeHarvest, isPending } = useHarvest();

  const handleHarvestToStealth = async () => {
    await executeHarvest({
      stockSymbol: "AAPLc",
      destinationCurrency: "USDC",
      recipient: "bob.base.eth", // Automatically resolves to ERC-5564 stealth meta-address!
    });
  };

  const handleHarvestToMeme = async () => {
    await executeHarvest({
      stockSymbol: "NVDAc",
      destinationCurrency: "CLANKER", // Swaps extracted surplus into $CLANKER
      recipient: "self",
    });
  };

  return (
    <div className="flex gap-3">
      <button onClick={handleHarvestToStealth} disabled={isPending}>
        {isPending ? "Harvesting..." : "Harvest to bob.base.eth (Stealth)"}
      </button>
      <button onClick={handleHarvestToMeme} disabled={isPending}>
        {isPending ? "Swapping..." : "Ape Dividend to $CLANKER"}
      </button>
    </div>
  );
}
```

---

### Recipe 9: Scanning & Gasless Sweeping (Stealth Inbox)

**Hook**: [`useStealthInbox()`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/hooks/useStealthInbox.ts)

Scans onchain announcements matching your viewing key, recovers 0-ETH private keys, and calls `AlloyStealthRelayer` with an EIP-2612 permit:

```tsx
import { useStealthInbox } from "@/lib/hooks/useStealthInbox";

export function StealthInboxWidget() {
  const {
    payments,
    totalUnclaimedUsd,
    isScanning,
    isSweeping,
    scanInbox,
    sweepPayment,
  } = useStealthInbox();

  return (
    <div className="p-4 bg-white rounded-2xl border border-neutral-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-heading font-medium">
          Unclaimed Stealth Dividends
        </h4>
        <button
          onClick={scanInbox}
          disabled={isScanning}
          className="text-xs text-[#007FFF]"
        >
          {isScanning ? "Scanning logs..." : "Scan Base Sepolia"}
        </button>
      </div>

      <div className="text-2xl font-heading font-medium text-[#10B981] mb-3">
        +${totalUnclaimedUsd} USDC
      </div>

      {payments.map((p) => (
        <div
          key={p.stealthAddress}
          className="flex justify-between items-center py-2 border-t text-sm"
        >
          <span>
            {p.balance} USDC on {p.stealthAddress.slice(0, 8)}...
          </span>
          <button
            onClick={() => sweepPayment(p)}
            disabled={isSweeping === p.stealthAddress}
            className="px-3 py-1 bg-[#007FFF] text-white rounded-xl text-xs"
          >
            {isSweeping === p.stealthAddress
              ? "Sweeping..."
              : "Gasless Sweep (0 ETH)"}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### Recipe 10: Token Balances Table & Faucets (Settings / Demo)

**Hook**: [`useTokenBalances()`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/hooks/useTokenBalances.ts)

Displays all 9 deployed tokens with 1-click test mint buttons for judges:

```tsx
import { useTokenBalances } from "@/lib/hooks/useTokenBalances";

export function TokenBalancesSection() {
  const { ethBalance, balances, isMinting, mintTestTokens } =
    useTokenBalances();

  return (
    <div className="space-y-3">
      <div className="text-sm text-neutral-500">
        Base Sepolia Gas: {ethBalance}
      </div>

      <div className="space-y-2">
        {balances.map((token) => (
          <div
            key={token.symbol}
            className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <span>{token.symbolEmoji}</span>
              <span className="font-medium">{token.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-heading">
                {token.balanceFormatted} {token.symbol}
              </span>
              <button
                onClick={() => mintTestTokens(token.symbol, "100")}
                disabled={isMinting === token.symbol}
                className="text-xs px-2 py-1 bg-white border border-neutral-200 rounded-lg hover:border-[#007FFF]"
              >
                {isMinting === token.symbol ? "Minting..." : "Mint 100"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 4. Reown AppKit / Connect Wallet Setup

The connection configuration in [`lib/wagmi.ts`](file:///C:/Users/PC/desktop/coding/alloy/app/lib/wagmi.ts) works out-of-the-box with standard Wagmi fallback.

To enable the official Reown modal (with QR code and mobile wallet deep links):

1. Visit [cloud.reown.com](https://cloud.reown.com) (free, 30-second sign up).
2. Create a project named **Alloy**.
3. Copy your **Project ID**.
4. Add it to `app/.env.local`:
   ```bash
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id_here
   ```

To trigger the Reown connect modal from any button:

```tsx
import { getAppKit } from "@/lib/wagmi";

export function ConnectButton() {
  const openModal = () => {
    const appKit = getAppKit();
    appKit?.open();
  };

  return (
    <button
      onClick={openModal}
      className="px-5 py-2.5 bg-[#007FFF] text-white rounded-xl font-medium"
    >
      Connect Wallet
    </button>
  );
}
```

---

## 5. Wiring `AppShell` with Dynamic State

In [`components/layout/AppShell.tsx`](file:///C:/Users/PC/desktop/coding/alloy/app/components/layout/AppShell.tsx), bind `connectedHandle`, `avatarEmoji`, and `avatarBg` to `useProfile()`:

```tsx
import { AppShell } from "@/components/layout/AppShell";
import { useProfile } from "@/lib/store/profileStore";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();

  return (
    <AppShell
      connectedHandle={profile.basename}
      avatarEmoji={profile.avatarEmoji}
      avatarBg={profile.avatarBg}
    >
      {children}
    </AppShell>
  );
}
```

---

## Summary of Completed Deliverables

1. [x] **Contract Bindings & ABIs** in `app/lib/contracts/`
2. [x] **Client-Side Cryptography** (ERC-5564 Scheme 1 ECDH, view tags, & key recovery) in `app/lib/crypto/`
3. [x] **Web3 & Reown AppKit Configuration** in `app/lib/wagmi.ts`
4. [x] **Persistent State Stores** (`profileStore.tsx` and `activityStore.tsx`) in `app/lib/store/`
5. [x] **Custom Web3 Hooks** (`useAlloyStocks`, `useHarvest`, `useBasename`, `useSimulator`, `useTokenBalances`, `useStealthInbox`) in `app/lib/hooks/`
6. [x] **Global Providers Component** in `app/lib/providers.tsx`
7. [x] **Type-Checked & Verified** (`tsc --noEmit` and `next build` passing with 0 errors)
8. [x] **Step-by-Step Developer Manual** in `INSTRUCT.md`
