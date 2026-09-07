"use client";

import React, { useState } from "react";
import {
  Sparkles,
  FileText,
  Check,
  ArrowRight,
  Layers,
  ArrowDownLeft,
  Smartphone,
  Monitor,
  RefreshCw,
  ExternalLink,
  Shield,
  Coins,
  Send,
  Zap,
  TrendingUp,
  X,
  UserCheck,
  Palette,
  LogOut,
  DollarSign,
  Wallet,
  MoreVertical,
  Info,
  ChevronRight,
  ArrowDown,
  QrCode,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { NavTabId } from "@/components/navigation/Sidebar";
import { DividendAnalyticsChart } from "@/components/analytics/DividendAnalyticsChart";
import { InteractiveNametagCard } from "@/components/profile/InteractiveNametagCard";
import { ProfileAvatarCard, ProfileData } from "@/components/profile/ProfileAvatarCard";
import { NametagClaimFlow } from "@/components/profile/NametagClaimFlow";
import { EmojiColorPickerModal } from "@/components/profile/EmojiColorPickerModal";
import { TxDetailModal } from "@/components/modals/TxDetailModal";
import { LogoutModal } from "@/components/modals/LogoutModal";
import { CurrencyPickerModal } from "@/components/modals/CurrencyPickerModal";
import { ConnectedWalletsModal } from "@/components/modals/ConnectedWalletsModal";
import { QRCodeModal } from "@/components/modals/QRCodeModal";
import { DividendSimModal } from "@/components/modals/DividendSimModal";
import { StockLogo } from "@/components/brand/StockLogos";
import { SignatureHeroCard } from "@/components/ui/SignatureHeroCard";
import { PersonalLinkCard } from "@/components/ui/PersonalLinkCard";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { ActivityRow, ActivityItem } from "@/components/ui/ActivityRow";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    type: "harvest",
    title: "Harvested from AAPLc Multiplier",
    subtitle: "Apple Dividend Surplus ($2.50/sh)",
    amount: "250.00",
    tokenSymbol: "USDC",
    tags: ["harvest", "stealth payout"],
    note: "Apple Q3 Dividend Surplus",
    timestamp: "Today • 2 mins ago",
    avatarBg: "#E0F2FE",
    avatarEmoji: "🍏",
    isPositive: true,
    recipient: "bob.base.eth (Stealth Rail)",
    multiplier: "1.025x (+2.5% yield)",
    txHash: "0x7f4a28b9c1048e910248a339948c2014e0b1928437bb9201948ba10283c",
  },
  {
    id: "act-2",
    type: "swap",
    title: "Meme Dividend Diverted",
    subtitle: "1-Click $CLANKER Swap",
    amount: "50.0",
    tokenSymbol: "CLANKER",
    tags: ["meme swap", "clanker.world"],
    note: "Autonomous AI Bot Payout",
    timestamp: "Today • 1 hour ago",
    avatarBg: "#F3E8FF",
    avatarEmoji: "🤖",
    isPositive: true,
    recipient: "bob.base.eth",
    multiplier: "1.018x (NVDAc Surplus)",
    txHash: "0x3c99a018f28b492048128ba7729014e9284192837bcda0192849182049",
  },
  {
    id: "act-3",
    type: "incoming",
    title: "Received from 0x402...3e94",
    subtitle: "PIVY Demo Token",
    amount: "100",
    tokenSymbol: "PDT",
    tags: ["personal"],
    note: "Here's a test token ...",
    timestamp: "Yesterday • 4:20 PM",
    avatarBg: "#FEF08A",
    avatarEmoji: "😉",
    isPositive: true,
    recipient: "0xD568...14eC",
    multiplier: "1.000x",
    txHash: "0x192849182bc8371948ba0128492014e8291048b291048ba92014829104",
  },
  {
    id: "act-4",
    type: "incoming",
    title: "Private Gift Received",
    subtitle: "ERC-5564 Stealth Announcement",
    amount: "150,000.00",
    tokenSymbol: "cNGN",
    tags: ["gift", "stealth receipt"],
    note: "Emerging Market Remittance",
    timestamp: "Yesterday • 11:15 AM",
    avatarBg: "#DCFCE7",
    avatarEmoji: "🇳🇬",
    isPositive: true,
    recipient: "alice.base.eth",
    multiplier: "1.012x",
    txHash: "0x9a8172049182bca8192048128ba014920184b291048ba9201482910482",
  },
  {
    id: "act-5",
    type: "outgoing",
    title: "Sent to carol.base.eth",
    subtitle: "Gifted Dividend Yield",
    amount: "75.00",
    tokenSymbol: "USDC",
    tags: ["gift", "stealth payout"],
    note: "Happy Birthday Carol!",
    timestamp: "Sep 4, 2026",
    avatarBg: "#FCE7F3",
    avatarEmoji: "🎁",
    isPositive: false,
    recipient: "carol.base.eth",
    multiplier: "1.025x (AAPLc Surplus)",
    txHash: "0x481928401928ba0192847291048ba920148291048291048ba920148291",
  },
];

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTabId>("dashboard");
  const [activeFilterTab, setActiveFilterTab] = useState("all");
  const [showBetaLogo, setShowBetaLogo] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [previewMode, setPreviewMode] = useState<"responsive" | "mobile">("responsive");

  // Element 4 & 5: Profile, Nametag & Avatar state
  const [username, setUsername] = useState("nebula");
  const [avatarEmoji, setAvatarEmoji] = useState("🎧");
  const [avatarBg, setAvatarBg] = useState("#18181B");
  const [isSettingUpIdentity, setIsSettingUpIdentity] = useState(false);
  const [showAvatarPickerModal, setShowAvatarPickerModal] = useState(false);

  // Element 6: Activity Detail Modal & Filter state
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  // Element 7: Modals & Dialogs state
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showConnectedWalletsModal, setShowConnectedWalletsModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);

  // Dividend & Simulation state for real-time reactivity
  const [aaplMultiplier, setAaplMultiplier] = useState(1.025);
  const [aaplSurplus, setAaplSurplus] = useState(75.0);
  const [totalDividends, setTotalDividends] = useState(1428.5);
  const [availableHarvest, setAvailableHarvest] = useState(124.5);

  // Settings & Logout state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setIsLoggedOut(true);
    setTimeout(() => {
      setIsLoggedOut(false);
      setCurrentTab("dashboard");
    }, 2500);
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Type",
      "Title",
      "Subtitle",
      "Amount",
      "Token",
      "Tags",
      "Note",
      "Timestamp",
      "Recipient",
      "Multiplier",
      "TxHash",
    ];
    const rows = mockActivities.map((a) => [
      a.id,
      a.type,
      `"${a.title}"`,
      `"${a.subtitle}"`,
      a.amount,
      a.tokenSymbol,
      `"${(a.tags || []).join("; ")}"`,
      `"${a.note || ""}"`,
      `"${a.timestamp || ""}"`,
      `"${a.recipient || ""}"`,
      `"${a.multiplier || ""}"`,
      `"${a.txHash || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `alloy_dividends_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Harvest Studio interactive state
  const [selectedStock, setSelectedStock] = useState<"AAPLc" | "NVDAc" | "COINc">("AAPLc");
  const [selectedDest, setSelectedDest] = useState<"USDC" | "cNGN" | "CLANKER">("USDC");
  const [recipientType, setRecipientType] = useState<"myself" | "basename">("myself");
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [harvestSuccess, setHarvestSuccess] = useState(false);

  // Simulator state
  const [simMultiplier, setSimMultiplier] = useState(1.025);
  const [simSurplus, setSimSurplus] = useState(124.50);

  const handleSimulateDividend = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimMultiplier((prev) => +(prev + 0.015).toFixed(3));
      setSimSurplus((prev) => +(prev + 75.0).toFixed(2));
      setIsSimulating(false);
    }, 900);
  };

  const handleExecuteHarvest = () => {
    setIsHarvesting(true);
    setTimeout(() => {
      setIsHarvesting(false);
      setHarvestSuccess(true);
      setTimeout(() => setHarvestSuccess(false), 3000);
    }, 1200);
  };

  // Currency symbols map & dynamic stock token items
  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
    IDR: "Rp",
    JPY: "¥",
    SGD: "S$",
    MYR: "RM",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    BRL: "R$",
  };
  const currSymbol = CURRENCY_SYMBOLS[selectedCurrency] || "$";

  const heroStockItems = [
    {
      symbol: "AAPLc",
      name: "Apple Tokenized Stock",
      shares: "100.0 AAPLc",
      valueUsd: "$20,000.00 principal",
      multiplier: `${aaplMultiplier.toFixed(3)}x`,
      dividendYield: `+${((aaplMultiplier - 1) * 100).toFixed(1)}% yield`,
      harvestableSurplus: `+${currSymbol}${aaplSurplus.toFixed(2)}`,
    },
    {
      symbol: "NVDAc",
      name: "Nvidia Tokenized Stock",
      shares: "200.0 NVDAc",
      valueUsd: "$26,000.00 principal",
      multiplier: "1.018x",
      dividendYield: "+1.8% yield",
      harvestableSurplus: `+${currSymbol}45.00`,
    },
    {
      symbol: "COINc",
      name: "Coinbase Tokenized Stock",
      shares: "100.0 COINc",
      valueUsd: "$22,000.00 principal",
      multiplier: "1.006x",
      dividendYield: "+0.6% yield",
      harvestableSurplus: `+${currSymbol}4.50`,
    },
  ];

  // Render content based on active navigation tab
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Element 5 Banner */}
            <div className="p-4 rounded-2xl bg-white border border-[#BAE6FD] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#007FFF] flex items-center justify-center shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-medium text-sm text-neutral-900">
                    Element 5 Active: Avatar Customization System
                  </h2>
                  <p className="text-xs text-neutral-500 font-normal">
                    10 color swatches, 3D emojis &amp; &quot;Surprise me!&quot; dice button
                  </p>
                </div>
              </div>

              {/* Quick Action Pills Row */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAvatarPickerModal(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-normal bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Palette className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Customize Avatar</span>
                  </button>

                  <button
                    onClick={() => setIsSettingUpIdentity(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-normal bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Basename Setup</span>
                  </button>

                  <button
                    onClick={() => setShowSimModal(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#007FFF] border border-[#BAE6FD] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#007FFF]" />
                    <span>Simulate Dividend</span>
                  </button>

                  <button
                    onClick={() => setShowQrModal(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-normal bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Share QR</span>
                  </button>

                  <button
                    onClick={() => setShowConnectedWalletsModal(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-normal bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Wallets</span>
                  </button>

                  <button
                    onClick={() => setShowBetaLogo(!showBetaLogo)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-normal border transition-colors cursor-pointer ${
                      showBetaLogo
                        ? "bg-[#E0F2FE] text-[#007FFF] border-[#BAE6FD]"
                        : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
                    }`}
                  >
                    Logo Beta: {showBetaLogo ? "Shown" : "Hidden"}
                  </button>

                  <button
                    onClick={() =>
                      setPreviewMode(previewMode === "responsive" ? "mobile" : "responsive")
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-normal bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {previewMode === "responsive" ? (
                      <>
                        <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Mobile Frame</span>
                      </>
                    ) : (
                      <>
                        <Monitor className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Full Responsive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 1. Signature Hero Card: Primary Focus on Dividends Earned */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
                  Dividends Earned & Available Yield
                </span>
                <span className="text-xs text-[#007FFF] font-normal flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4DA6FF] animate-pulse" />
                  Base Sepolia Connected
                </span>
              </div>

              <SignatureHeroCard
                title="Total Dividends Earned"
                totalDividendsEarned={`+${currSymbol}${totalDividends.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                availableToHarvest={`+${currSymbol}${availableHarvest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                items={heroStockItems}
                bannerText="Dividends harvested privately through Alloy"
                onHarvestClick={(token) => {
                  setSelectedStock(token.symbol as any);
                  setCurrentTab("harvest");
                }}
              />
            </div>

            {/* 2. Personal Link / Basename Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
                  Basename Identity Card
                </span>
                <button
                  onClick={() => setIsSettingUpIdentity(true)}
                  className="text-xs text-[#007FFF] hover:text-[#0066FF] font-normal cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Claim / Edit Basename</span>
                </button>
              </div>

              <PersonalLinkCard
                title="Your Personal Link"
                subtitle="Share to receive dividends privately"
                handle={`${username}.base.eth`}
                avatarEmoji={avatarEmoji}
                avatarBg={avatarBg}
                onShowQr={() => setShowQrModal(true)}
                onOpenLink={() =>
                  window.open(
                    "https://sepolia.basescan.org/address/0xD5687794c8E1b69F477911Df56170679CB6414eC",
                    "_blank"
                  )
                }
              />
            </div>

            {/* 3. Quick Activity Preview */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-medium text-neutral-900 text-base">
                  Recent Activities
                </h3>
                <span className="text-xs text-neutral-400 font-normal">Real-time</span>
              </div>

              <FilterTabs
                activeTab={activeFilterTab}
                onSelectTab={setActiveFilterTab}
                rightAction={
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-normal text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Export CSV</span>
                  </button>
                }
              />

              <div className="divide-y divide-neutral-100">
                {mockActivities.slice(0, 3).map((act) => (
                  <ActivityRow
                    key={act.id}
                    activity={act}
                    onClick={(item) => setSelectedActivity(item)}
                  />
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => setCurrentTab("activities")}
                >
                  See all activities
                </Button>
                <Button
                  variant="azure-soft"
                  size="sm"
                  className="flex items-center justify-center gap-1.5 text-xs text-[#007FFF]"
                  onClick={() => setCurrentTab("activities")}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>View Dividend Graph</span>
                </Button>
              </div>
            </div>
          </div>
        );

      case "harvest":
        return (
          <div className="space-y-6">
            {/* Header description */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-2">
              <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#007FFF] text-xs font-normal">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Private 1-Click Dividend Rail</span>
                  </div>
                  <h2 className="font-heading font-medium text-2xl text-neutral-900">
                    Harvest Studio
                  </h2>
                  <p className="text-sm text-neutral-500 font-normal">
                    Extract your accrued stock dividends without selling or touching your equity principal. Funds are routed directly or to private stealth addresses.
                  </p>
                </div>
                <button
                  onClick={() => setShowSimModal(true)}
                  className="px-3.5 py-2 rounded-2xl bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#007FFF] border border-[#BAE6FD] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#007FFF]" />
                  <span>Simulate Payout</span>
                </button>
              </div>
            </div>

            {/* Step 1: Choose Equity Asset */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-medium text-neutral-400 uppercase tracking-wider">
                  Step 1: Choose Equity Stock
                </span>
                <span className="text-xs text-[#007FFF] font-normal">
                  Surplus shares available
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { sym: "AAPLc" as const, name: "Apple", surplus: `+${currSymbol}${aaplSurplus.toFixed(2)}`, mult: `${aaplMultiplier.toFixed(3)}x` },
                  { sym: "NVDAc" as const, name: "Nvidia", surplus: `+${currSymbol}45.00`, mult: "1.018x" },
                  { sym: "COINc" as const, name: "Coinbase", surplus: `+${currSymbol}4.50`, mult: "1.006x" },
                ].map((item) => {
                  const isSelected = selectedStock === item.sym;
                  return (
                    <button
                      key={item.sym}
                      onClick={() => setSelectedStock(item.sym)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? "border-[#007FFF] bg-[#E0F2FE]/50 shadow-xs"
                          : "border-neutral-200/80 hover:border-neutral-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <StockLogo symbol={item.sym} size={28} />
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-normal">
                          {item.mult}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-xs text-neutral-800">{item.name}</div>
                        <div className="text-xs text-[#10B981] font-medium">{item.surplus}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Destination Currency */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
              <span className="text-xs font-heading font-medium text-neutral-400 uppercase tracking-wider">
                Step 2: Choose Destination Currency
              </span>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { sym: "USDC" as const, name: "USD Coin", desc: "Global standard" },
                  { sym: "cNGN" as const, name: "Nigerian Naira", desc: "Emerging market" },
                  { sym: "CLANKER" as const, name: "Clanker Meme", desc: "1-Click Base swap" },
                ].map((item) => {
                  const isSelected = selectedDest === item.sym;
                  return (
                    <button
                      key={item.sym}
                      onClick={() => setSelectedDest(item.sym)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? "border-[#007FFF] bg-[#E0F2FE]/50 shadow-xs"
                          : "border-neutral-200/80 hover:border-neutral-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <StockLogo symbol={item.sym} size={28} />
                        {isSelected && <Check className="w-4 h-4 text-[#007FFF]" />}
                      </div>
                      <div>
                        <div className="font-medium text-xs text-neutral-800">{item.name}</div>
                        <div className="text-[11px] text-neutral-400 font-normal">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Recipient Routing */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
              <span className="text-xs font-heading font-medium text-neutral-400 uppercase tracking-wider">
                Step 3: Recipient Routing
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRecipientType("myself")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    recipientType === "myself"
                      ? "border-[#007FFF] bg-[#E0F2FE]/50 shadow-xs"
                      : "border-neutral-200/80 hover:border-neutral-300 bg-white"
                  }`}
                >
                  <div className="font-medium text-xs text-neutral-800">Direct to My Wallet</div>
                  <div className="text-[11px] text-neutral-400 font-normal">bob.base.eth</div>
                </button>

                <button
                  onClick={() => setRecipientType("basename")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    recipientType === "basename"
                      ? "border-[#007FFF] bg-[#E0F2FE]/50 shadow-xs"
                      : "border-neutral-200/80 hover:border-neutral-300 bg-white"
                  }`}
                >
                  <div className="font-medium text-xs text-neutral-800">Stealth Basename Payout</div>
                  <div className="text-[11px] text-neutral-400 font-normal">ERC-5564 stealth rail</div>
                </button>
              </div>

              {/* Action Button (Rectangular with rounded edges) */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  isLoading={isHarvesting}
                  onClick={handleExecuteHarvest}
                >
                  {harvestSuccess ? (
                    <span className="flex items-center gap-2 text-white">
                      <Check className="w-5 h-5" /> Harvested Successfully!
                    </span>
                  ) : isHarvesting ? (
                    "Broadcasting on Base Sepolia..."
                  ) : (
                    `Harvest Surplus to ${selectedDest}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case "activities":
        return (
          <div className="space-y-6">
            {/* 1. Interactive Dividend Analytics Chart */}
            <DividendAnalyticsChart
              title="Dividend Earnings Over Time"
              initialRange="1M"
            />

            {/* 2. Activities Ledger Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-medium text-xl text-neutral-900">
                    Activities Ledger
                  </h2>
                  <p className="text-xs text-neutral-400 font-normal">
                    Private dividend payouts, stealth announcements, and swaps on Base
                  </p>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-normal text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Export CSV</span>
                </button>
              </div>

              <FilterTabs
                activeTab={activeFilterTab}
                onSelectTab={setActiveFilterTab}
              />

              {(() => {
                const filtered = mockActivities.filter((act) => {
                  if (activeFilterTab === "incoming")
                    return act.type === "incoming" || act.type === "harvest";
                  if (activeFilterTab === "outgoing")
                    return act.type === "outgoing";
                  if (activeFilterTab === "gifts")
                    return (
                      act.tags?.some((t) => t.includes("gift")) ||
                      act.tags?.some((t) => t.includes("stealth receipt"))
                    );
                  return true;
                });

                const todayItems = filtered.filter((a) =>
                  a.timestamp?.toLowerCase().includes("today")
                );
                const yesterdayItems = filtered.filter((a) =>
                  a.timestamp?.toLowerCase().includes("yesterday")
                );
                const earlierItems = filtered.filter(
                  (a) =>
                    !a.timestamp?.toLowerCase().includes("today") &&
                    !a.timestamp?.toLowerCase().includes("yesterday")
                );

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-neutral-400 text-xs font-normal">
                      No activities found for this filter tab.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 pt-2">
                    {todayItems.length > 0 && (
                      <div>
                        <div className="text-[11px] font-heading font-medium uppercase tracking-wider text-neutral-400 px-2 py-1">
                          Today
                        </div>
                        <div className="divide-y divide-neutral-100">
                          {todayItems.map((act) => (
                            <ActivityRow
                              key={act.id}
                              activity={act}
                              onClick={(item) => setSelectedActivity(item)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {yesterdayItems.length > 0 && (
                      <div>
                        <div className="text-[11px] font-heading font-medium uppercase tracking-wider text-neutral-400 px-2 py-1">
                          Yesterday
                        </div>
                        <div className="divide-y divide-neutral-100">
                          {yesterdayItems.map((act) => (
                            <ActivityRow
                              key={act.id}
                              activity={act}
                              onClick={(item) => setSelectedActivity(item)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {earlierItems.length > 0 && (
                      <div>
                        <div className="text-[11px] font-heading font-medium uppercase tracking-wider text-neutral-400 px-2 py-1">
                          Previous
                        </div>
                        <div className="divide-y divide-neutral-100">
                          {earlierItems.map((act) => (
                            <ActivityRow
                              key={act.id}
                              activity={act}
                              onClick={(item) => setSelectedActivity(item)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        );

      case "simulator":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-heading font-medium text-[#007FFF] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Base Sepolia Interactive Testing</span>
              </div>
              <h2 className="font-heading font-medium text-2xl text-neutral-900">
                Dividend Multiplier Simulator
              </h2>
              <p className="text-sm text-neutral-500 font-normal">
                Test the smart contract dividend distribution flow live. Triggering a dividend increases the stock asset multiplier and dynamically generates harvestable surplus.
              </p>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-xs space-y-1">
                <div className="text-xs text-neutral-400 font-normal">Current Multiplier</div>
                <div className="text-2xl font-medium text-[#007FFF] font-mono">
                  {simMultiplier.toFixed(3)}x
                </div>
                <div className="text-[11px] text-[#10B981] font-medium">
                  +1.5% dividend increment
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-xs space-y-1">
                <div className="text-xs text-neutral-400 font-normal">Harvestable Surplus</div>
                <div className="text-2xl font-medium text-[#10B981] font-mono">
                  +${simSurplus.toFixed(2)}
                </div>
                <div className="text-[11px] text-neutral-400 font-normal">
                  No principal affected
                </div>
              </div>
            </div>

            {/* Trigger Button */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
              <div className="text-xs font-heading font-medium text-neutral-400 uppercase tracking-wider">
                Simulate Corporate Action
              </div>

              <p className="text-xs text-neutral-500 font-normal">
                Calls <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">AlloyRebalancer.distributeDividend()</code> on the Base Sepolia testnet to credit all Apple (<code className="font-mono text-neutral-800">AAPLc</code>) shareholders.
              </p>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  isLoading={isSimulating}
                  onClick={handleSimulateDividend}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
                  <span>{isSimulating ? "Distributing on Chain..." : "Distribute +$2.50 Dividend"}</span>
                </Button>

                <Button
                  variant="azure-light"
                  onClick={() => {
                    setSimMultiplier(1.025);
                    setSimSurplus(124.50);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            {/* Logged Out Banner Notification if triggered */}
            {isLoggedOut && (
              <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-medium flex items-center justify-between animate-in fade-in">
                <span>You have been disconnected from Base Sepolia. Reconnecting...</span>
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
              </div>
            )}

            {/* Profile & Identity Card (Element 4 & 5) */}
            <ProfileAvatarCard
              mode="settings"
              profile={{
                username,
                avatarEmoji,
                avatarBg,
                address: "0xD5687794c8E1b69F477911Df56170679CB6414eC",
                isVerified: true,
              }}
              onEditAvatar={() => setShowAvatarPickerModal(true)}
              onEditUsername={() => setIsSettingUpIdentity(true)}
            />

            {/* 1. Preferences Section (Matching inspo Screenshot 002947) */}
            <div className="space-y-2">
              <div className="text-xs font-heading font-medium text-neutral-400 uppercase tracking-wider px-2">
                Preferences
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200/80 p-2 shadow-xs">
                <button
                  type="button"
                  onClick={() => setShowCurrencyModal(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-50/90 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Purple $ Circle Icon */}
                    <div className="w-10 h-10 rounded-full bg-[#A855F7] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      <DollarSign className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="font-heading font-medium text-neutral-900 text-sm">
                        Currency
                      </div>
                      <div className="text-xs text-neutral-400 font-normal">
                        Default display currency
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="font-medium text-xs text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg">
                      {selectedCurrency}
                    </span>
                    <MoreVertical className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Account Section (Matching inspo Screenshot 002947 with Logout button!) */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs font-heading font-medium text-neutral-400 uppercase tracking-wider px-2">
                <span>Account</span>
                <Info className="w-3.5 h-3.5 text-neutral-400" />
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200/80 p-2 shadow-xs divide-y divide-neutral-100">
                {/* Connected Wallets Row */}
                <button
                  type="button"
                  onClick={() => setShowConnectedWalletsModal(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-50/90 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Amber / Yellow Wallet Circle Icon */}
                    <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-heading font-medium text-neutral-900 text-sm">
                        Connected Wallets
                      </div>
                      <div className="text-xs text-neutral-400 font-normal font-mono">
                        Base Sepolia (0xD568...14eC)
                      </div>
                    </div>
                  </div>

                  <MoreVertical className="w-4 h-4 text-neutral-400" />
                </button>

                {/* Logout Row (Coral Red Circle matching inspo Screenshot 002947) */}
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#FEF2F2]/60 transition-colors cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Coral Red Circle Icon with LogOut */}
                    <div className="w-10 h-10 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-xs shrink-0 transition-transform group-hover:scale-105">
                      <LogOut className="w-5 h-5 ml-0.5" />
                    </div>
                    <div>
                      <div className="font-heading font-medium text-neutral-900 group-hover:text-[#EF4444] text-sm transition-colors">
                        Logout
                      </div>
                      <div className="text-xs text-neutral-400 font-normal">
                        Disconnect active wallet session
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-[#EF4444] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

            {/* 3. Links Section (Matching inspo Screenshot 003851) */}
            <div className="space-y-2">
              <div className="text-xs font-heading font-medium text-neutral-400 uppercase tracking-wider px-2">
                Links
              </div>

              <div className="bg-white rounded-3xl border border-neutral-200/80 p-2 shadow-xs divide-y divide-neutral-100">
                <a
                  href="https://docs.base.org"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-50/90 transition-colors cursor-pointer text-left group"
                >
                  <span className="font-heading font-medium text-neutral-900 text-sm">
                    Docs
                  </span>
                  <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
                </a>

                <a
                  href="https://github.com/Nebulaz7/alloy"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-50/90 transition-colors cursor-pointer text-left group"
                >
                  <span className="font-heading font-medium text-neutral-900 text-sm">
                    GitHub
                  </span>
                  <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
                </a>
              </div>
            </div>

            {/* 4. Network & Smart Contracts Section */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-medium text-base text-neutral-900">
                  Network &amp; Smart Contracts
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#007FFF] font-normal border border-[#BAE6FD]">
                  Chain ID: 84532
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    name: "AlloyRebalancer (Dividend Hook)",
                    addr: "0x78BFE2A2fB2D6bE4924A1948B0c7F9B93563459c",
                  },
                  {
                    name: "AlloyStealthRelayer (ERC-5564)",
                    addr: "0x3344690C9B6A1A310214878a87bA2f44C6A88942",
                  },
                  {
                    name: "MockAAPLc (Rebasing Stock Token)",
                    addr: "0x280e2f5B28833b91B981C650A1a24d4554868e64",
                  },
                ].map((contract) => (
                  <div
                    key={contract.name}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F9FAFB] border border-neutral-100 text-xs"
                  >
                    <div>
                      <div className="font-medium text-neutral-800 font-heading">{contract.name}</div>
                      <div className="font-mono text-[11px] text-neutral-400">
                        {contract.addr.slice(0, 10)}...{contract.addr.slice(-8)}
                      </div>
                    </div>

                    <a
                      href={`https://sepolia.basescan.org/address/${contract.addr}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  // Full-Screen Identity Setup (Dedicated view matching Pivy inspo, NO POPUP)
  if (isSettingUpIdentity) {
    if (previewMode === "mobile") {
      return (
        <div className="min-h-screen bg-neutral-200 flex flex-col items-center justify-center p-4">
          <div className="mb-4 flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-xs border border-neutral-300">
            <span className="text-xs font-normal text-neutral-600">
              Simulated Mobile Viewport (Full-Screen Identity Setup)
            </span>
            <button
              onClick={() => setPreviewMode("responsive")}
              className="text-xs px-3 py-1 rounded-xl bg-[#007FFF] text-white font-normal hover:bg-[#0066FF] cursor-pointer transition-colors"
            >
              Switch to Full Responsive
            </button>
          </div>

          <div className="w-[390px] h-[820px] bg-[#F9FAFB] rounded-[48px] border-[10px] border-neutral-900 shadow-2xl overflow-hidden flex flex-col relative">
            <NametagClaimFlow
              initialUsername={username}
              onBack={() => setIsSettingUpIdentity(false)}
              onComplete={(newProfile) => {
                setUsername(newProfile.username);
                setAvatarEmoji(newProfile.avatarEmoji);
                setAvatarBg(newProfile.avatarBg);
                setIsSettingUpIdentity(false);
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <NametagClaimFlow
        initialUsername={username}
        onBack={() => setIsSettingUpIdentity(false)}
        onComplete={(newProfile) => {
          setUsername(newProfile.username);
          setAvatarEmoji(newProfile.avatarEmoji);
          setAvatarBg(newProfile.avatarBg);
          setIsSettingUpIdentity(false);
        }}
      />
    );
  }

  // If previewMode is "mobile", render an interactive simulated phone frame on desktop so the user can easily test the mobile dock!
  if (previewMode === "mobile") {
    return (
      <div className="min-h-screen bg-neutral-200 flex flex-col items-center justify-center p-4">
        {/* Toggle Bar */}
        <div className="mb-4 flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-xs border border-neutral-300">
          <span className="text-xs font-normal text-neutral-600">
            Simulated Mobile Viewport (Testing Floating Dock)
          </span>
          <button
            onClick={() => setPreviewMode("responsive")}
            className="text-xs px-3 py-1 rounded-xl bg-[#007FFF] text-white font-normal hover:bg-[#0066FF] cursor-pointer transition-colors"
          >
            Switch to Full Responsive
          </button>
        </div>

        {/* Phone Frame */}
        <div className="w-[390px] h-[820px] bg-[#F9FAFB] rounded-[48px] border-[10px] border-neutral-900 shadow-2xl overflow-hidden flex flex-col relative">
          <AppShell
            activeTab={currentTab}
            onTabChange={setCurrentTab}
            showBetaLogo={showBetaLogo}
            connectedHandle={`${username}.base.eth`}
            avatarEmoji={avatarEmoji}
            avatarBg={avatarBg}
            onEditAvatar={() => setShowAvatarPickerModal(true)}
          >
            {renderTabContent()}
          </AppShell>
        </div>

        {/* Element 5: Avatar Picker Modal in Mobile Preview */}
        {showAvatarPickerModal && (
          <EmojiColorPickerModal
            isOpen={showAvatarPickerModal}
            initialEmoji={avatarEmoji}
            initialColor={avatarBg}
            onClose={() => setShowAvatarPickerModal(false)}
            onSave={(emoji, color) => {
              setAvatarEmoji(emoji);
              setAvatarBg(color);
              setShowAvatarPickerModal(false);
            }}
          />
        )}

        {/* Element 6: Transaction Detail Modal in Mobile Preview */}
        <TxDetailModal
          isOpen={!!selectedActivity}
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />

        {/* Logout Confirmation Modal in Mobile Preview */}
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirmLogout={handleConfirmLogout}
        />

        {/* Element 7: Currency Picker Modal in Mobile Preview */}
        <CurrencyPickerModal
          isOpen={showCurrencyModal}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={(cur) => {
            setSelectedCurrency(cur.code);
            setShowCurrencyModal(false);
          }}
          onClose={() => setShowCurrencyModal(false)}
        />

        {/* Element 7: Connected Wallets Modal in Mobile Preview */}
        <ConnectedWalletsModal
          isOpen={showConnectedWalletsModal}
          onClose={() => setShowConnectedWalletsModal(false)}
          primaryAddress="0xD5687794c8E1b69F477911Df56170679CB6414eC"
        />

        {/* Element 7: QR Code Share Modal in Mobile Preview */}
        <QRCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          handle={`${username}.base.eth`}
        />

        {/* Element 7: Corporate Dividend Simulator Modal in Mobile Preview */}
        <DividendSimModal
          isOpen={showSimModal}
          onClose={() => setShowSimModal(false)}
          currentMultiplier={aaplMultiplier}
          onDividendSimulated={(newMult, surplus) => {
            setAaplMultiplier(newMult);
            setAaplSurplus((prev) => +(prev + surplus).toFixed(2));
            setAvailableHarvest((prev) => +(prev + surplus).toFixed(2));
            setTotalDividends((prev) => +(prev + surplus).toFixed(2));
          }}
        />
      </div>
    );
  }

  // Default Responsive Layout (Desktop Sidebar on screens >= md, Mobile Floating Dock on screens < md)
  return (
    <>
      <AppShell
        activeTab={currentTab}
        onTabChange={setCurrentTab}
        showBetaLogo={showBetaLogo}
        connectedHandle={`${username}.base.eth`}
        avatarEmoji={avatarEmoji}
        avatarBg={avatarBg}
        onEditAvatar={() => setShowAvatarPickerModal(true)}
      >
        {renderTabContent()}
      </AppShell>

      {/* Element 5: Avatar Picker Modal in Responsive Layout */}
      {showAvatarPickerModal && (
        <EmojiColorPickerModal
          isOpen={showAvatarPickerModal}
          initialEmoji={avatarEmoji}
          initialColor={avatarBg}
          onClose={() => setShowAvatarPickerModal(false)}
          onSave={(emoji, color) => {
            setAvatarEmoji(emoji);
            setAvatarBg(color);
            setShowAvatarPickerModal(false);
          }}
        />
      )}

      {/* Element 6: Transaction Detail Modal in Responsive Layout */}
      <TxDetailModal
        isOpen={!!selectedActivity}
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      {/* Logout Confirmation Modal in Responsive Layout */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={handleConfirmLogout}
      />

      {/* Element 7: Currency Picker Modal in Responsive Layout */}
      <CurrencyPickerModal
        isOpen={showCurrencyModal}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={(cur) => {
          setSelectedCurrency(cur.code);
          setShowCurrencyModal(false);
        }}
        onClose={() => setShowCurrencyModal(false)}
      />

      {/* Element 7: Connected Wallets Modal in Responsive Layout */}
      <ConnectedWalletsModal
        isOpen={showConnectedWalletsModal}
        onClose={() => setShowConnectedWalletsModal(false)}
        primaryAddress="0xD5687794c8E1b69F477911Df56170679CB6414eC"
      />

      {/* Element 7: QR Code Share Modal in Responsive Layout */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        handle={`${username}.base.eth`}
      />

      {/* Element 7: Corporate Dividend Simulator Modal in Responsive Layout */}
      <DividendSimModal
        isOpen={showSimModal}
        onClose={() => setShowSimModal(false)}
        currentMultiplier={aaplMultiplier}
        onDividendSimulated={(newMult, surplus) => {
          setAaplMultiplier(newMult);
          setAaplSurplus((prev) => +(prev + surplus).toFixed(2));
          setAvailableHarvest((prev) => +(prev + surplus).toFixed(2));
          setTotalDividends((prev) => +(prev + surplus).toFixed(2));
        }}
      />
    </>
  );
}
