# Alloy — Design System & UX Specification (`DESIGN.md`)

## 1. Design Philosophy & Aesthetic Identity

Alloy's design is inspired by modern, consumer-grade, playful fintech products (such as **Pivy**, **Cash App**, and **Family Wallet**). It rejects dark neon glows, dark cyberpunk palettes, and heavy gradients in favor of a **light-mode-only**, ultra-clean, approachable, and playful aesthetic.

### Core Visual Principles
1. **Light Mode Only**: Warm, soft white/off-white background (`#F9FAFB` / `#F8F9FA`) with high-contrast elements, rich black typography, and pure white elevated cards.
2. **No Neon / No Gradients**: Solid, cheerful, flat pop colors. No artificial glowing drop-shadows or dark neon accents.
3. **Playful Geometry & Squircle Forms**:
   - Prominent, friendly rounded cards (`rounded-3xl` / `28px–32px`).
   - Pill-shaped buttons and filter tags (`rounded-full`).
   - Inset input fields and pill buttons (`rounded-2xl` / `16px`).
4. **Signature Card Treatment**:
   - The primary action/balance card features a **bold, solid green perimeter border (4px)** with a curved, full-width solid green bottom banner pill (e.g., *"Dividends harvested privately through Alloy"*).
5. **Expressive Mascot & Visual Micro-Elements**:
   - Playful mascot character (winking Alloy coin / friendly flame sticker).
   - Customizable user profiles featuring 3D playful emoji avatars and bold background color badges.
   - Interactive feedback pills (*"Username is available!"*, checkmarks, badge icons).

---

## 2. Color Palette & Design Tokens

### 2.1 Surfaces & Neutrals
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `bg-page` | `#F9FAFB` | Main application background (soft off-white) |
| `bg-card` | `#FFFFFF` | Primary surface for elevated cards and modals |
| `bg-muted` | `#F3F4F6` | Secondary input boxes, inactive tab pills, subtle hover fills |
| `border-subtle`| `#E5E7EB` | Hairline card borders, modal separators |
| `text-primary`| `#111827` | Headings, primary balances, active labels |
| `text-secondary`| `#6B7280` | Subtitles, asset ticker labels, metadata |
| `text-muted` | `#9CA3AF` | Placeholder text, disabled timestamps |

### 2.2 Playful Brand & Accent Colors
| Role | Hex | Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| **Signature Emerald** | `#00D26A` / `#10B981` | `emerald-500` / `green-500` | Primary hero card border, success badges, main CTA button |
| **Soft Mint** | `#DCFCE7` | `emerald-100` | Active mobile icon badge background, notification pills |
| **Solid Dark** | `#111827` | `gray-900` | Primary active filter pills (`All`), dark CTA buttons |
| **Playful Purple** | `#A855F7` | `purple-500` | Currency preference icon |
| **Playful Amber** | `#F59E0B` | `amber-500` | Connected wallet icon, gold dividend alert badge |
| **Playful Coral** | `#EF4444` | `red-500` | Logout icon, disconnect action |
| **Playful Blue** | `#3B82F6` | `blue-500` | Basename `.base.eth` identity badge, Base network badge |

---

## 3. Typography & Numerical Display

- **Font Family**: Modern, rounded, geometric sans-serif (e.g., `Plus Jakarta Sans` or `Geist Sans` with high legibility).
- **Scale**:
  - Hero Balances: `text-4xl` to `text-5xl` font-extrabold (`$1,240.00`).
  - Page Titles: `text-2xl` font-bold text-center on mobile & desktop.
  - Card Headings: `text-lg` font-bold (`Your Accrued Dividends`, `Your Personal Link`).
  - Body & Labels: `text-sm` font-medium.
  - Micro-tags & Badges: `text-xs` font-semibold uppercase tracking-wider.
- **Tabular Figures**: `font-mono` or `tabular-nums` for token balances and multipliers to avoid layout jitter during live updates.

---

## 4. Layout & Information Architecture

### 4.1 Desktop Architecture (≥ 1024px)
A clean, focused split-layout:
- **Left Navigation Sidebar (Fixed Width ~260px)**:
  - **Header**: Alloy Logo (playful icon) + `"BETA"` pill badge in soft grey.
  - **Navigation Links**:
    - 🏠 **Dashboard**: Portfolio overview, multiplier growth, accrued yields.
    - 🔗 **Harvest / Links**: 1-Click dividend surplus router & Basename payments.
    - 📋 **Activities**: Filterable transaction ledger (Harvests, Swaps, Stealth).
    - 🧪 **Simulator & Faucet**: Live multiplier jumper (+`$2.50`/share) & test mints.
    - ⚙️ **Settings**: Profile editor, connected wallets, stealth meta-address keys.
  - **Footer Card**: Playful promo illustration container (*"Alloy is currently in beta on Base Sepolia"*), with links to Docs and Twitter/X.
- **Main Viewport**:
  - Centered clean single-column layout (max width `680px` to `768px`) to maintain focus and prevent visual clutter.
  - Top header displaying page title (`Dashboard`, `Activities`, etc.).

### 4.2 Mobile Responsive Architecture (< 1024px)
- **Top Header**: Simple, clean header with the active page title and subtle network/profile pill.
- **Vertical Stack**: All cards and modules stack in a thumb-friendly vertical scroll area with 16px horizontal padding.
- **Floating Bottom Navigation Dock**:
  - Detached, floating rounded pill bar (`rounded-full`, `bg-white`, subtle shadow and hairline border).
  - Fixed at `bottom-5 inset-x-4 max-w-sm mx-auto z-50`.
  - Active tab is highlighted with a cute soft mint green squircle/pill background (`#DCFCE7`) and solid green icon.
  - Inactive tabs use clean line icons in soft gray (`#9CA3AF`).

---

## 5. Screen Specifications & Flows

### 5.1 Welcome & Onboarding (`/login`)
- **Hero Mascot**: Winking Alloy mascot with `"BETA"` tag.
- **Title & Subtitle**: *"Welcome to Alloy / Harvest tokenized stock dividends privately on Base."*
- **Action Buttons**:
  - `Connect Wallet` (large rounded pill button with wallet icon).
  - Social / Passkey login option (Privy / Coinbase Smart Wallet).
- **Basename / Username Claiming**:
  - Interactive nametag preview card (`alloy.base.eth/username` or `username.base.eth`).
  - Search input with live availability feedback.
  - Card dynamically turns **vivid lime green** with a checkmark pill (*"Username is available!"*) when valid.
- **Profile Customization Modal**:
  - Emoji & background color picker (10 pastel color swatches + 3D emoji grid + *"Surprise me!"* dice button).

### 5.2 Dashboard (`/dashboard`)
1. **Signature Balance Card (Hero)**:
   - Thick emerald border (`border-4 border-[#00D26A]`) with solid bottom footer banner:
     *"Dividends harvested privately through Alloy"*.
   - Total equity balance and accrued dividend yield (`+$124.50`).
   - Token list:
     - Apple (`AAPLc`), Nvidia (`NVDAc`), Coinbase (`COINc`) with live multiplier indicators (e.g. `1.025x`).
     - Alert pill: *"Corporate dividend detected! Multiplier increased from 1.00x to 1.025x. Tap to harvest."*
2. **Personal Link / Basename Card**:
   - User's public Basename / stealth handle (e.g., `alloy.cash/nebula` or `bob.base.eth`).
   - Action buttons: Copy link, Show QR Code modal, Open link.
3. **Quick Activity Preview**:
   - Filter pills: `All`, `Incoming`, `Outgoing`, `Gifts`.
   - Recent transaction items with green incoming arrows, token amounts, and memo tags.
   - *"See all activities"* soft rounded button.

### 5.3 Harvest Studio / Payout Rail (`/harvest` or Modal)
- **Step 1: Choose Equity Asset**: Select which stock to harvest from (`AAPLc`, `NVDAc`, `COINc`). Shows calculated surplus shares $\Delta B$ without touching principal.
- **Step 2: Choose Destination Currency**:
  - Stablecoins: `$USDC$` (global standard), `$cNGN$` (emerging markets).
  - Base Memes: `$CLANKER$`, `$HIGHER$`, `$DEGEN$`.
- **Step 3: Recipient Routing**:
  - Myself (Direct to connected wallet).
  - Basename (`friend.base.eth`) $\rightarrow$ Automatically resolves to stealth meta-address.
  - Custom Stealth Address.
- **1-Click Atomic Execution**: Trims surplus $\rightarrow$ Swaps on AMM $\rightarrow$ Sends to recipient $\rightarrow$ Emits ERC-5564 announcement.

### 5.4 Activities Ledger (`/activities`)
- Filter pills: `All`, `Incoming`, `Outgoing`, `Gifts`, plus an `Export CSV` button pill.
- Date grouped lists (`TODAY`, `YESTERDAY`, etc.).
- Activity rows with circular avatar, green/black directional indicator, token quantity in bold, and metadata tags (e.g., `personal`, `stealth payout`, BaseScan link).

### 5.5 Settings (`/settings`)
- **Profile Card**: Avatar with edit button pill, username, email/address.
- **Preferences**:
  - `Currency`: Opens clean currency picker modal with search bar, country codes, and green checkmark.
- **Account**:
  - `Connected Wallets`: Opens modal showing connected addresses with `Export ->` pill and educational note on privacy.
  - `Logout`: Red circle icon with clean confirmation.
- **Links**: Docs and Twitter/X external link rows with top-right arrow icons.

---

## 6. Key Modals & Micro-Interiors

All modals use centered rounded cards (`rounded-3xl`), pure white backgrounds, subtle overlays (`bg-black/40`), and a prominent top-right close (`✕`) button:

1. **Currency Picker Modal**: Search input at top, list of currencies with country flag/code, code in bold (`USD`, `EUR`, `NGN`), and checkmark for the selected item.
2. **Emoji & Avatar Picker Modal**: Big circular preview at top, *"Surprise me!"* dice button, row of circular color swatches with active selection ring, and 4x4 grid of playful emojis.
3. **QR Code Modal**: Big clean QR code in rounded frame, clickable handle pill, and cute logo stamp at the bottom.
4. **Dividend Simulator Modal**: A special developer/testing tool allowing the user to trigger `distributeDividend(+$2.50)` on Base Sepolia and watch their multiplier jump in real time.
5. **Stealth Inbox & Sweeper Modal**: Allows scanning incoming ERC-5564 announcements with 1-click gasless permit sweep via `AlloyStealthRelayer`.

---

## 7. Next Steps & Implementation Roadmap

- [ ] **Figma Assets**: User connects Figma for custom SVG icons, mascots, and stickers.
- [ ] **Dependencies**: Install `wagmi`, `viem`, `@tanstack/react-query`, Lucide icons, and secp256k1 crypto tools.
- [ ] **Components**: Build the shared UI primitives (Buttons, Cards, Modals, Pills, Sidebar, Floating Bottom Dock) conforming to this light, playful specification.
- [ ] **Contract Integration**: Wire components to the Base Sepolia deployed contracts.
