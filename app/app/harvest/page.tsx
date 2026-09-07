"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Lock,
  Wallet,
  Zap,
  RefreshCw,
  Info,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { StockLogo } from "@/components/brand/StockLogos";
import { NavTabId } from "@/components/navigation/Sidebar";
import { useAlloyStocks } from "@/lib/hooks/useAlloyStocks";
import { useHarvest, HarvestParams } from "@/lib/hooks/useHarvest";
import { useBasename } from "@/lib/hooks/useBasename";
import { useProfile } from "@/lib/store/profileStore";
import { openReownModal } from "@/lib/wagmi";
import { DividendSimModal } from "@/components/modals/DividendSimModal";
import { EmojiColorPickerModal } from "@/components/profile/EmojiColorPickerModal";
import { SupportedStockSymbol, ALLOY_ADDRESSES } from "@/lib/contracts/addresses";

type DestinationToken = "USDC" | "cNGN" | "CLANKER" | "HIGHER" | "DEGEN";

interface DestinationOption {
  symbol: DestinationToken;
  name: string;
  category: "stable" | "meme";
  desc: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
}

const DESTINATION_OPTIONS: DestinationOption[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    category: "stable",
    desc: "Global digital dollar cashflow directly into your wallet or stealth rail.",
    badge: "Direct Cash",
    badgeBg: "#E0F2FE",
    badgeText: "#007FFF",
  },
  {
    symbol: "cNGN",
    name: "Nigerian Naira",
    category: "stable",
    desc: "Local currency stablecoin for emerging market remittance and spending.",
    badge: "Local FX",
    badgeBg: "#DCFCE7",
    badgeText: "#15803D",
  },
  {
    symbol: "CLANKER",
    name: "Autonomous AI Agent",
    category: "meme",
    desc: "Auto-routed DEX swap into Base's leading autonomous AI meme token.",
    badge: "AI Meme",
    badgeBg: "#F3E8FF",
    badgeText: "#7E22CE",
  },
  {
    symbol: "HIGHER",
    name: "Base Community Token",
    category: "meme",
    desc: "Auto-routed DEX swap into the optimistic community lifestyle token.",
    badge: "Community",
    badgeBg: "#DBEAFE",
    badgeText: "#1D4ED8",
  },
  {
    symbol: "DEGEN",
    name: "Farcaster Degen",
    category: "meme",
    desc: "Auto-routed DEX swap into Farcaster's native social tipping currency.",
    badge: "Social",
    badgeBg: "#FCE7F3",
    badgeText: "#BE185D",
  },
];

export default function HarvestPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { profile, updateProfile } = useProfile();
  const { stocks, availableToHarvest, refetch, isPreview, isLoading } = useAlloyStocks();
  const { executeHarvest, isPending, error: harvestError } = useHarvest();
  const { resolve, isResolving } = useBasename();

  // Wizard state
  const [selectedStock, setSelectedStock] = useState<SupportedStockSymbol>("AAPLc");
  const [selectedDest, setSelectedDest] = useState<DestinationToken>("USDC");
  const [destCategory, setDestCategory] = useState<"all" | "stable" | "meme">("all");
  const [payoutMode, setPayoutMode] = useState<"self" | "stealth">("self");
  const [customRecipient, setCustomRecipient] = useState("bob.base.eth");
  const [resolvedMeta, setResolvedMeta] = useState<string | null>(null);

  // Modals & Feedback
  const [showSimModal, setShowSimModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    txHash: string;
    stock: string;
    dest: string;
    recipient: string;
    isStealth: boolean;
    stealthAddress?: string;
  } | null>(null);

  // Handle Tab Navigation
  const handleTabChange = (tab: NavTabId) => {
    if (tab === "harvest") return;
    if (tab === "dashboard") router.push("/dashboard");
    else if (tab === "activities") router.push("/activities");
    else if (tab === "simulator") router.push("/simulator");
    else if (tab === "settings") router.push("/settings");
  };

  // Find currently selected stock item
  const currentStockItem = stocks.find((s) => s.symbol === selectedStock) || stocks[0];

  // Resolve recipient basename when stealth mode is active
  useEffect(() => {
    let active = true;
    if (payoutMode === "stealth" && customRecipient) {
      resolve(customRecipient).then((res) => {
        if (active) {
          setResolvedMeta(res.stealthMetaAddress);
        }
      });
    } else {
      setResolvedMeta(null);
    }
    return () => {
      active = false;
    };
  }, [payoutMode, customRecipient, resolve]);

  // Extract harvestable surplus number (for display / disable checks)
  const harvestableNum = currentStockItem
    ? parseFloat(currentStockItem.harvestableSurplus.replace(/[^0-9.]/g, "")) || 0
    : 0;

  // Execute Harvest action
  const handleHarvestClick = async () => {
    try {
      if (!isConnected || isPreview) {
        // Preview mode mock simulated execution
        setSuccessReceipt({
          txHash: "0x7f4a28b9c1048e910248a339948c2014e0b1928437bb9201948ba10283c7193a",
          stock: selectedStock,
          dest: selectedDest,
          recipient: payoutMode === "stealth" ? customRecipient : address || "Connected Wallet",
          isStealth: payoutMode === "stealth",
          stealthAddress: "st:eth:0x0279be6...c709ee5",
        });
        return;
      }

      const params: HarvestParams = {
        stockSymbol: selectedStock,
        destinationCurrency: selectedDest,
        recipient: payoutMode === "stealth" ? customRecipient : "self",
        stealthMetaAddress: resolvedMeta || undefined,
      };

      const result = await executeHarvest(params);
      setSuccessReceipt({
        txHash: result.txHash,
        stock: selectedStock,
        dest: selectedDest,
        recipient: payoutMode === "stealth" ? customRecipient : address || "Connected Wallet",
        isStealth: payoutMode === "stealth",
        stealthAddress: result.stealthDetails?.stealthAddress,
      });

      await refetch();
    } catch (err) {
      console.error("Harvest execution failed:", err);
    }
  };

  const filteredDestinations = DESTINATION_OPTIONS.filter((opt) => {
    if (destCategory === "stable") return opt.category === "stable";
    if (destCategory === "meme") return opt.category === "meme";
    return true;
  });

  return (
    <AppShell
      activeTab="harvest"
      onTabChange={handleTabChange}
      connectedHandle={profile.basename || "nebula.base.eth"}
      avatarEmoji={profile.avatarEmoji}
      avatarBg={profile.avatarBg}
      onEditAvatar={() => setShowAvatarPicker(true)}
      onOpenWallet={() => openReownModal("Account")}
    >
      <div className="space-y-6 select-none pb-12">
        {/* Unauthenticated / Demo Preview Banner */}
        {!isConnected && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-neutral-800 font-normal">
              <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse" />
              <span>
                You are in <strong>Preview Mode</strong>. Connect a Base wallet
                to execute real onchain dividend harvests.
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/login")}
              className="shrink-0 cursor-pointer"
            >
              Connect Wallet
            </Button>
          </div>
        )}

        {/* 1. Header Overview & Surplus Assurance Card */}
        <section className="bg-white rounded-3xl border-4 border-[#007FFF] shadow-xs p-5 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading uppercase tracking-wider text-neutral-400 font-medium">
                  Harvest Dividends
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                  Live Multipliers
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-medium text-neutral-900 tracking-tight mt-1">
                Harvest Stock Yield
              </h2>
            </div>

            <div className="text-left sm:text-right bg-neutral-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
              <span className="text-xs text-neutral-400 font-normal block">
                Total Accrued Across Portfolio
              </span>
              <span className="text-2xl font-heading font-medium text-[#10B981]">
                {availableToHarvest} ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-normal pt-1 border-t border-neutral-100">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>
              100% Non-Custodial. Mathematical surplus is extracted without liquidating or selling your principal stock shares.
            </span>
          </div>
        </section>

        {/* Success Receipt Modal/Card */}
        {successReceipt && (
          <div className="p-5 sm:p-6 rounded-3xl bg-[#DCFCE7]/90 border border-[#86EFAC] shadow-xs space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-medium text-neutral-900 text-base sm:text-lg">
                    Dividend Surplus Harvested!
                  </h3>
                  <p className="text-xs text-neutral-600 font-normal">
                    {successReceipt.isStealth
                      ? `Extracted privately via ERC-5564 stealth rail to ${successReceipt.recipient}`
                      : `Directly transferred ${successReceipt.dest} to your connected address.`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSuccessReceipt(null)}
                className="text-xs text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer"
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/80 p-3 rounded-2xl border border-[#BBF7D0]">
              <div>
                <span className="text-neutral-400 block">Transaction Hash:</span>
                <a
                  href={`https://sepolia.basescan.org/tx/${successReceipt.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#007FFF] hover:underline font-mono truncate block flex items-center gap-1"
                >
                  <span>{successReceipt.txHash.slice(0, 16)}...{successReceipt.txHash.slice(-8)}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              {successReceipt.stealthAddress && (
                <div>
                  <span className="text-neutral-400 block">Unlinkable Stealth Payout:</span>
                  <span className="font-mono text-neutral-700 truncate block">
                    {successReceipt.stealthAddress.slice(0, 14)}...{successReceipt.stealthAddress.slice(-6)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/activities")}
                className="cursor-pointer"
              >
                View in Activities
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuccessReceipt(null)}
                className="cursor-pointer"
              >
                Harvest Another Asset
              </Button>
            </div>
          </div>
        )}

        {/* 2. Step 1: Choose Source Tokenized Stock */}
        <section className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-heading font-medium text-[#007FFF] uppercase tracking-wider">
                Step 1
              </span>
              <h3 className="text-base sm:text-lg font-heading font-medium text-neutral-900">
                Select Stock Dividend Source
              </h3>
            </div>
            <span className="text-xs text-neutral-400 font-normal">
              {stocks.length} equities available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stocks.map((stock) => {
              const isSelected = selectedStock === stock.symbol;
              const surplusNum = parseFloat(stock.harvestableSurplus.replace(/[^0-9.]/g, "")) || 0;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock.symbol as SupportedStockSymbol)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "border-[#007FFF] bg-[#F0F9FF] shadow-xs ring-2 ring-[#007FFF]/10"
                      : "border-neutral-200/80 bg-white hover:bg-neutral-50/70"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <StockLogo symbol={stock.symbol} size={36} />
                      <div>
                        <div className="font-heading font-medium text-sm text-neutral-900 flex items-center gap-1.5">
                          <span>{stock.symbol}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E0F2FE] text-[#007FFF] font-medium border border-[#BAE6FD]">
                            {stock.multiplier}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-normal truncate max-w-[130px]">
                          {stock.name}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                        isSelected ? "bg-[#007FFF] text-white" : "border border-neutral-300 text-transparent"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Shares Held</span>
                      <span className="font-medium text-neutral-700">{stock.shares}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-400 block text-[10px]">Harvestable</span>
                      <span
                        className={`font-medium ${
                          surplusNum > 0 ? "text-[#10B981]" : "text-neutral-400"
                        }`}
                      >
                        {stock.harvestableSurplus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Step 2: Choose Destination Asset */}
        <section className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-heading font-medium text-[#007FFF] uppercase tracking-wider">
                Step 2
              </span>
              <h3 className="text-base sm:text-lg font-heading font-medium text-neutral-900">
                Choose Payout Currency
              </h3>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200/70 text-xs font-medium self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setDestCategory("all")}
                className={`py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                  destCategory === "all" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDestCategory("stable")}
                className={`py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                  destCategory === "stable" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Stablecoins
              </button>
              <button
                type="button"
                onClick={() => setDestCategory("meme")}
                className={`py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                  destCategory === "meme" ? "bg-white text-neutral-900 shadow-2xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Base Memes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredDestinations.map((token) => {
              const isSelected = selectedDest === token.symbol;

              return (
                <div
                  key={token.symbol}
                  onClick={() => setSelectedDest(token.symbol)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-[#007FFF] bg-[#F0F9FF] shadow-xs ring-2 ring-[#007FFF]/10"
                      : "border-neutral-200/80 bg-white hover:bg-neutral-50/70"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StockLogo symbol={token.symbol} size={38} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-medium text-sm text-neutral-900">
                          {token.name}
                        </span>
                        <span
                          style={{ backgroundColor: token.badgeBg, color: token.badgeText }}
                          className="text-[10px] px-1.5 py-0.2 rounded-md font-medium"
                        >
                          {token.badge}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-normal truncate mt-0.5">
                        {token.desc}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? "bg-[#007FFF] text-white" : "border border-neutral-300 text-transparent"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Step 3: Recipient & Stealth Rail Configuration */}
        <section className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-heading font-medium text-[#007FFF] uppercase tracking-wider">
              Step 3
            </span>
            <h3 className="text-base sm:text-lg font-heading font-medium text-neutral-900">
              Select Payout Recipient & Privacy
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option A: Direct Wallet Claim */}
            <div
              onClick={() => setPayoutMode("self")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                payoutMode === "self"
                  ? "border-[#007FFF] bg-[#F0F9FF] shadow-xs"
                  : "border-neutral-200/80 bg-white hover:bg-neutral-50/70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-heading font-medium text-sm text-neutral-900">
                      My Connected Wallet
                    </div>
                    <div className="text-[11px] text-neutral-400 font-normal">
                      Direct onchain payout
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    payoutMode === "self" ? "bg-[#007FFF] text-white" : "border border-neutral-300"
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
              </div>

              <div className="text-xs font-mono text-neutral-500 pt-1 border-t border-neutral-100 truncate">
                {address ? `${address.slice(0, 10)}...${address.slice(-6)}` : "Connected Base Address"}
              </div>
            </div>

            {/* Option B: ERC-5564 Stealth Rail */}
            <div
              onClick={() => setPayoutMode("stealth")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                payoutMode === "stealth"
                  ? "border-[#10B981] bg-[#F0FDF4] shadow-xs"
                  : "border-neutral-200/80 bg-white hover:bg-neutral-50/70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-heading font-medium text-sm text-neutral-900 flex items-center gap-1.5">
                      <span>Stealth Basename Rail</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#DCFCE7] text-[#15803D] font-medium">
                        ERC-5564
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-normal">
                      100% Private Unlinkable Address
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    payoutMode === "stealth" ? "bg-[#10B981] text-white" : "border border-neutral-300"
                  }`}
                >
                  <Check className="w-3 h-3" />
                </div>
              </div>

              <div className="text-xs text-neutral-500 pt-1 border-t border-neutral-100 flex items-center justify-between">
                <span>Receiver:</span>
                <span className="font-mono text-neutral-800 font-medium">{customRecipient}</span>
              </div>
            </div>
          </div>

          {/* Stealth Basename Input & Verification Area */}
          {payoutMode === "stealth" && (
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3 animate-in fade-in duration-150">
              <label className="text-xs font-medium text-neutral-700 block">
                Recipient Basename or Stealth Meta-Address:
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value.toLowerCase().trim())}
                  placeholder="e.g. bob.base.eth or st:eth:0x..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs sm:text-sm font-mono text-neutral-800 focus:outline-hidden focus:border-[#10B981] shadow-2xs"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomRecipient(profile.basename || "nebula.base.eth")}
                    className="px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:border-[#10B981] text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors shadow-2xs cursor-pointer"
                  >
                    My Basename
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomRecipient("bob.base.eth")}
                    className="px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:border-[#10B981] text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors shadow-2xs cursor-pointer"
                  >
                    bob.base.eth
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {isResolving ? (
                  <span className="text-neutral-400 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#10B981]" />
                    <span>Resolving stealth meta-address on Base Sepolia...</span>
                  </span>
                ) : resolvedMeta ? (
                  <span className="text-[#15803D] flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Verified ERC-5564 stealth rail ({resolvedMeta.slice(0, 16)}...{resolvedMeta.slice(-8)})</span>
                  </span>
                ) : (
                  <span className="text-neutral-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Will derive ephemeral one-time keys on Base Sepolia upon transaction signing.</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 5. Execution Summary & Primary Action Button */}
        <section className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <h3 className="font-heading font-medium text-neutral-900 text-base">
            Harvest Review
          </h3>

          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-100 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Equity Asset:</span>
              <span className="font-medium text-neutral-800">
                {currentStockItem.name} ({currentStockItem.symbol})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Current Multiplier:</span>
              <span className="font-mono font-medium text-[#007FFF]">
                {currentStockItem.multiplier} ({currentStockItem.dividendYield})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Harvestable Surplus:</span>
              <span className="font-mono font-medium text-[#10B981]">
                {currentStockItem.harvestableSurplus}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Destination Payout:</span>
              <span className="font-medium text-neutral-800">
                {selectedDest} on Base Sepolia
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Recipient Rail:</span>
              <span className="font-mono text-neutral-800 font-medium">
                {payoutMode === "stealth" ? `Stealth (${customRecipient})` : "Direct (Self)"}
              </span>
            </div>

            <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Conserved Stock Principal:</span>
              </span>
              <span className="font-mono font-medium text-neutral-700">
                {currentStockItem.valueUsd} (Untouched)
              </span>
            </div>
          </div>

          {/* If 0 surplus on selected stock */}
          {harvestableNum === 0 && !isPreview && isConnected && (
            <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#92400E]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  No dividend surplus currently ready on <strong>{selectedStock}</strong>. Simulate an onchain payout to jump multipliers!
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSimModal(true)}
                className="shrink-0 bg-white hover:bg-[#FEF3C7] text-[#92400E] border-[#FCD34D] cursor-pointer"
              >
                Simulate Dividend
              </Button>
            </div>
          )}

          {/* Primary Harvest Button */}
          <Button
            variant="primary"
            size="lg"
            isLoading={isPending}
            disabled={isPending || (harvestableNum === 0 && isConnected && !isPreview)}
            onClick={handleHarvestClick}
            className="w-full py-4 rounded-2xl justify-center text-sm sm:text-base font-medium shadow-md cursor-pointer"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Approving & Harvesting on Base Sepolia...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>
                  Harvest {currentStockItem.harvestableSurplus} to {selectedDest}
                </span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          {harvestError && (
            <p className="text-xs text-rose-600 text-center font-normal pt-1">
              Error: {harvestError}
            </p>
          )}
        </section>
      </div>

      {/* --- Modals --- */}
      <DividendSimModal
        isOpen={showSimModal}
        onClose={() => setShowSimModal(false)}
        onDividendSimulated={async () => {
          await refetch();
          setShowSimModal(false);
        }}
      />

      {showAvatarPicker && (
        <EmojiColorPickerModal
          isOpen={showAvatarPicker}
          initialEmoji={profile.avatarEmoji}
          initialColor={profile.avatarBg}
          onClose={() => setShowAvatarPicker(false)}
          onSave={(emoji, color) => {
            updateProfile({ avatarEmoji: emoji, avatarBg: color });
            setShowAvatarPicker(false);
          }}
        />
      )}
    </AppShell>
  );
}
