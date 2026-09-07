# Alloy — Design System & UX Specification (`DESIGN.md`)

## 1. Design Philosophy & Aesthetic Identity

Alloy's design is inspired by modern, consumer-grade, playful fintech products (such as **Pivy**, **Cash App**, and **Family Wallet**). It rejects dark neon glows, dark cyberpunk palettes, and heavy gradients in favor of a **light-mode-only**, ultra-clean, approachable, and playful aesthetic.

### Core Visual Principles
1. **Light Mode Only**: Warm, soft white/off-white background (`#F9FAFB` / `#F8F9FA`) with high-contrast elements, rich dark typography, and pure white elevated cards.
2. **No Neon / No Gradients**: Solid, cheerful, flat pop colors. No artificial glowing drop-shadows or dark neon accents.
3. **Playful Geometry & Squircle Forms**:
   - Prominent, friendly rounded cards (`rounded-3xl` / `28px–32px`).
   - Rectangular buttons with rounded edges (`rounded-xl` / 12px or `rounded-2xl` / 16px).
   - Inset input fields and pill buttons (`rounded-2xl` / `16px`).
4. **Signature Card Treatment**:
   - The primary action/balance card features a **bold, solid Azure Blue perimeter border (4px)** with a curved, full-width solid Azure Blue bottom banner pill (e.g., *"Dividends harvested privately through Alloy"*).
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
| **Primary Azure Blue** | `#007FFF` | `blue-600` | Primary hero card border, primary action buttons, brand accents |
| **Light Azure Blue** | `#4DA6FF` | `sky-400` / `blue-400` | Secondary accents, interactive badges, paired contrast with primary Azure |
| **Soft Azure / Ice Tint** | `#E0F2FE` | `sky-100` | Active mobile dock background, alert banners, subtle hover fills |
| **Positive Green** | `#10B981` | `emerald-500` | Incoming transaction values (`+100 USDC`), positive yield indicators, checkmarks |
| **Solid Dark** | `#111827` | `gray-900` | Primary active filter pills (`All`), high-contrast dark buttons |
| **Playful Purple** | `#A855F7` | `purple-500` | Currency preference icon |
| **Playful Amber** | `#F59E0B` | `amber-500` | Connected wallet icon, gold dividend alert badge |
| **Playful Coral** | `#EF4444` | `red-500` | Logout icon, disconnect action |

---

## 3. Typography & Button Specifications

- **Font Family**:
  - **Headings & Titles**: `Comic Relief` (`--font-heading`, playful, organic, expressive headers).
  - **Body & Normal Text**: `Google Sans` (`--font-body`, clean, readable geometric text).
- **Weight Philosophy**:
  - **Do NOT make text overly bold**. Use `font-normal` (400) for body, subtitles, descriptions, and metadata.
  - Use `font-medium` (500) selectively for card headings, balances, and button labels.
- **Button Geometry**:
  - **Rectangular with rounded edges** (`rounded-xl` / 12px or `rounded-2xl` / 16px).
  - Avoid generic full-pill shapes (`rounded-full`) for main buttons.
- **Icons & Logos**:
  - Standard UI icons: `lucide-react`.
  - Stock assets: Official SVG logos for **Apple** (`AAPLc`), **NVIDIA** (`NVDAc`), and **Coinbase** (`COINc`).

---

## 4. Layout & Information Architecture

### 4.1 Desktop Architecture (≥ 1024px)
A clean, focused split-layout:
- **Left Navigation Sidebar (Fixed Width ~260px)**:
  - **Header**: Alloy Logo (playful icon) + `"BETA"` pill badge in soft grey (or clean no-beta variant).
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
  - Active tab is highlighted with a cute soft Azure Blue squircle/pill background (`#E0F2FE`) and solid Azure Blue icon (`#007FFF`).
  - Inactive tabs use clean line icons in soft gray (`#9CA3AF`).

---

## 5. Screen Specifications & Flows

### 5.1 Welcome & Onboarding (`/login`)
- **Hero Mascot**: Winking Alloy mascot with `"BETA"` tag.
- **Title & Subtitle**: *"Welcome to Alloy / Harvest tokenized stock dividends privately on Base."*
- **Action Buttons**:
  - `Connect Wallet` (large rounded rectangular button with wallet icon).
  - Social / Passkey login option (Privy / Coinbase Smart Wallet).
- **Basename / Username Claiming**:
  - Interactive nametag preview card (`alloy.base.eth/username` or `username.base.eth`).
  - Search input with live availability feedback.
  - Card dynamically turns **vivid Azure Blue** (`bg-[#007FFF]` / `border-[#007FFF]`) with a checkmark pill (*"Username is available!"*) when valid.
- **Profile Customization Modal**:
  - Emoji & background color picker (10 pastel color swatches + 3D emoji grid + *"Surprise me!"* dice button).

### 5.2 Dashboard (`/dashboard`)
1. **Signature Balance Card (Hero)**:
   - Thick Azure Blue border (`border-4 border-[#007FFF]`) with solid bottom footer banner:
     *"Dividends harvested privately through Alloy"*.
   - Total equity balance and accrued dividend yield (`+$124.50`).
   - Token list:
     - Apple (`AAPLc`), Nvidia (`NVDAc`), Coinbase (`COINc`) with official vector logos and live multiplier indicators (e.g. `1.025x`).
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
- Activity rows with circular avatar, directional indicator, token quantity in bold, and metadata tags (e.g., `personal`, `stealth payout`, BaseScan link).

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

## 7. Step-by-Step Element Design Blueprint (Collaborative Phase)

1. **Element 1: Brand Mark & Mascot (`Alloy Mascot`)** [Completed]
   - Winking, cheerful Alloy coin/ingot mascot vector.
   - Clean typographic wordmark (`Alloy`) with Azure Blue dot/accent.
   - Clean variant (no-beta tag) and default variant.

2. **Element 2: Core Surface & The Signature Card** [Completed]
   - Clean squircle card container (`rounded-3xl`, `#FFFFFF`, subtle border `#E5E7EB`, gentle shadow).
   - **Signature Hero Card**: 4px solid Azure Blue border (`#007FFF`) with bottom-docked solid Azure Blue pill ribbon: *"Dividends harvested privately through Alloy"*.
   - Official SVG logos for Apple, Nvidia, and Coinbase.
   - Rectangular buttons with rounded corners (`rounded-xl` / `rounded-2xl`).

3. **Element 3: Navigation Shells (Desktop & Mobile)** [Next]
   - **Desktop Left Sidebar**: App brand header, rounded navigation item pills with soft active backgrounds, and bottom promotional doodle card (*"Alloy is currently in beta on Base Sepolia"*).
   - **Mobile Floating Bottom Dock**: Detached floating pill bar with active tab highlighted by a soft Azure Blue squircle (`#E0F2FE`) and solid Azure Blue icon (`#007FFF`).

4. **Element 4: Profile & Interactive Nametag Card**
   - Onboarding nametag card (`alloy.base.eth/username` or `username.base.eth`).
   - Dynamic activation: Transitions to solid Azure Blue (`bg-[#007FFF]`, white text) with an *"Available!"* checkmark pill.
   - Profile avatar preview with 3D playful emoji icon & color badge.

5. **Element 5: Avatar Customization System**
   - 10 solid playful color swatches with active selection ring.
   - Curated grid of 16 playful 3D-style emojis (money bag, sparkle, diamond, rocket, etc.).
   - *"Surprise me!"* dice button pill.

6. **Element 6: Activity & Transaction Rows**
   - Circular token/user avatar with directional badge (green down-arrow for incoming harvests).
   - Bold amount display (`+100 USDC` in `#10B981`, or meme coins).
   - Micro-metadata pills (`personal`, `stealth payout`, BaseScan link).

7. **Element 7: Modals & Dialogs**
   - Currency Picker modal with search bar, country pills, and green checkmark.
   - Connected Wallets modal with address copy, `Export ->` pill, and privacy explainer.
   - QR Code share modal with clean framed SVG QR code and handle pill.
   - Interactive Dividend Simulator modal (+`$2.50`/share test trigger).
