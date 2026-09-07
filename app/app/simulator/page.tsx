"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Check,
  Repeat,
  ExternalLink,
  Coins,
  ReceiptText,
  AlertCircle,
  RefreshCw,
  Sliders,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { NavTabId } from "@/components/navigation/Sidebar";
import { Button } from "@/components/ui/Button";
import { StockLogo } from "@/components/brand/StockLogos";
import { TxDetailModal } from "@/components/modals/TxDetailModal";
import { EmojiColorPickerModal } from "@/components/profile/EmojiColorPickerModal";
import { useProfile } from "@/lib/store/profileStore";
import { useActivity } from "@/lib/store/activityStore";
import { useAlloyStocks } from "@/lib/hooks/useAlloyStocks";
import { useTokenBalances } from "@/lib/hooks/useTokenBalances";
import { useSimulator } from "@/lib/hooks/useSimulator";
import { openReownModal } from "@/lib/wagmi";
import { ALLOY_ADDRESSES, SupportedStockSymbol } from "@/lib/contracts/addresses";

const STOCK_DATA = [
  {
    symbol: "AAPLc" as const,
    name: "Apple Tokenized Stock",
    shortName: "Apple",
    defaultPrice: "200.00",
    address: ALLOY_ADDRESSES.contracts.MockB20_AAPLc,
    accent: "#007FFF",
  },
  {
    symbol: "NVDAc" as const,
    name: "Nvidia Tokenized Stock",
    shortName: "Nvidia",
    defaultPrice: "130.00",
    address: ALLOY_ADDRESSES.contracts.MockB20_NVDAc,
    accent: "#10B981",
  },
  {
    symbol: "COINc" as const,
    name: "Coinbase Tokenized Stock",
    shortName: "Coinbase",
    defaultPrice: "220.00",
    address: ALLOY_ADDRESSES.contracts.MockB20_COINc,
    accent: "#0052FF",
  },
];

const PRESET_DIVIDENDS = [
  { label: "Quarterly ($0.50)", value: "0.50" },
  { label: "Semi-Annual ($1.25)", value: "1.25" },
  { label: "Standard Yield ($2.50)", value: "2.50" },
  { label: "Surplus Event ($5.00)", value: "5.00" },
  { label: "Mega Payout ($10.00)", value: "10.00" },
];

export default function SimulatorPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { profile, updateProfile } = useProfile();
  const { activities } = useActivity();
  const { stocks, refetch: refetchStocks, isPreview } = useAlloyStocks();
  const { mintTestTokens, isMinting } = useTokenBalances();
  const { simulateDividend, isSimulating, isSuccess, txHash, error, reset } = useSimulator();

  // Local state
  const [selectedStock, setSelectedStock] = useState<SupportedStockSymbol>("AAPLc");
  const [dividendAmount, setDividendAmount] = useState<string>("2.50");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [quickSimulatingStock, setQuickSimulatingStock] = useState<string | null>(null);

  // Tab switching
  const handleTabChange = (tab: NavTabId) => {
    if (tab === "simulator") return;
    if (tab === "dashboard") router.push("/dashboard");
    else if (tab === "harvest") router.push("/harvest");
    else if (tab === "activities") router.push("/activities");
    else if (tab === "settings") router.push("/settings");
  };

  // Active stock item from useAlloyStocks
  const currentStockItem = useMemo(() => {
    return stocks.find((s) => s.symbol === selectedStock) || stocks[0];
  }, [stocks, selectedStock]);

  const activeStockConfig = useMemo(() => {
    return STOCK_DATA.find((s) => s.symbol === selectedStock) || STOCK_DATA[0];
  }, [selectedStock]);

  // Current multiplier parsed from contract string (e.g. "1.025x" -> 1.025)
  const currentMultiplierNum = useMemo(() => {
    const raw = parseFloat(currentStockItem?.multiplier?.replace("x", "") || "1.000");
    return isNaN(raw) || raw < 1 ? 1.0 : raw;
  }, [currentStockItem]);

  // Calculations for simulated dividend
  const divNum = parseFloat(dividendAmount) || 0;
  const priceNum = parseFloat(activeStockConfig.defaultPrice) || 200.0;
  const yieldIncrementPct = priceNum > 0 ? (divNum / priceNum) * 100 : 0;
  const newMultiplierNum = +(currentMultiplierNum * (1 + (priceNum > 0 ? divNum / priceNum : 0))).toFixed(3);

  // Parse user shares held (e.g. "100.0 AAPLc" -> 100)
  const userSharesHeld = useMemo(() => {
    const match = currentStockItem?.shares?.match(/^([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }, [currentStockItem]);

  // Calculate instant harvestable cashflow generated for the user
  const effectiveShares = userSharesHeld > 0 ? userSharesHeld : 100;
  const generatedSurplusUsd = +(effectiveShares * divNum).toFixed(2);

  // Execute simulation
  const handleExecuteSimulation = async (
    targetStock: SupportedStockSymbol = selectedStock,
    targetDiv: string = dividendAmount
  ) => {
    try {
      reset();
      await simulateDividend(targetStock, targetDiv, activeStockConfig.defaultPrice);
      await refetchStocks();
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  // 1-Click Quick Simulator for matrix cards
  const handleQuickSimulate = async (symbol: SupportedStockSymbol) => {
    setQuickSimulatingStock(symbol);
    try {
      const stockCfg = STOCK_DATA.find((s) => s.symbol === symbol) || STOCK_DATA[0];
      await simulateDividend(symbol, "1.00", stockCfg.defaultPrice);
      await refetchStocks();
    } catch (err) {
      console.error("Quick simulation failed:", err);
    } finally {
      setQuickSimulatingStock(null);
    }
  };

  // Filter simulation activity events
  const simulationActivities = useMemo(() => {
    return activities.filter(
      (act) =>
        act.tags?.includes("simulation") ||
        act.tags?.includes("dividend") ||
        act.title?.toLowerCase().includes("simulat")
    );
  }, [activities]);

  return (
    <AppShell
      activeTab="simulator"
      onTabChange={handleTabChange}
      connectedHandle={profile.basename || "nebula.base.eth"}
      avatarEmoji={profile.avatarEmoji}
      avatarBg={profile.avatarBg}
      onEditAvatar={() => setShowAvatarPicker(true)}
      onOpenWallet={() => openReownModal("Account")}
    >
      <div className="space-y-6 select-none pb-12">
        {/* 1. Unauthenticated / Demo Preview Mode Banner */}
        {!isConnected && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-neutral-800 font-normal">
              <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse shrink-0" />
              <span>
                You are in <strong>Preview Mode</strong>. Simulations execute in demo state. Connect a Base wallet to broadcast live onchain corporate actions on Base Sepolia.
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

        {/* 2. Main Simulation Lab Card */}
        <section className="bg-white rounded-3xl border-4 border-[#007FFF] shadow-xs p-5 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading uppercase tracking-wider text-neutral-400 font-medium">
                  Corporate Action Engine
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>Base Sepolia Live</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-medium text-neutral-900 tracking-tight mt-1">
                Simulate Cash Dividend
              </h2>
            </div>

            <div className="text-left sm:text-right bg-neutral-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
              <span className="text-xs text-neutral-400 font-normal block">
                Targeted Stock Multiplier
              </span>
              <span className="text-2xl font-heading font-medium text-[#007FFF]">
                {currentStockItem?.multiplier || "1.000x"}
              </span>
            </div>
          </div>

          {/* Reassurance Banner */}
          <div className="p-3.5 rounded-2xl bg-[#E0F2FE]/50 border border-[#BAE6FD] flex items-start gap-2.5 text-xs text-neutral-700">
            <ShieldCheck className="w-4 h-4 text-[#007FFF] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              When a corporation pays a cash dividend, Alloy executes non-dilutive mathematical rebasing. The stock multiplier expands, unlocking instantly extractable cashflow <strong>without selling or liquidating a single share of equity principal</strong>.
            </p>
          </div>

          {/* Step 1: Select Tokenized Equity */}
          <div className="space-y-2">
            <label className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
              1. Choose Tokenized Equity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {STOCK_DATA.map((stock) => {
                const isSelected = selectedStock === stock.symbol;
                const stockItem = stocks.find((s) => s.symbol === stock.symbol);
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => {
                      setSelectedStock(stock.symbol);
                      reset();
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? "border-[#007FFF] bg-[#F0F9FF] shadow-xs ring-2 ring-[#007FFF]/10"
                        : "border-neutral-200/80 bg-white hover:bg-neutral-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <StockLogo symbol={stock.symbol} size={36} />
                      <span className="text-xs font-mono font-medium text-neutral-500">
                        ${stock.defaultPrice}
                      </span>
                    </div>

                    <div>
                      <div className="font-heading font-medium text-sm text-neutral-900">
                        {stock.shortName}
                      </div>
                      <div className="text-xs text-neutral-400 font-normal">
                        {stockItem?.shares || "0.0 shares"}
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-neutral-100/80 flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-normal">Multiplier</span>
                      <span className="font-mono font-medium text-[#007FFF]">
                        {stockItem?.multiplier || "1.000x"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test Shares Mint Helper for 0-balance wallets */}
            {isConnected && userSharesHeld === 0 && (
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-3 text-xs">
                <span className="text-neutral-600 font-normal">
                  You currently hold 0 {selectedStock} shares on Base Sepolia.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isMinting === selectedStock}
                  onClick={async () => {
                    await mintTestTokens(selectedStock, "100");
                    await refetchStocks();
                  }}
                  className="shrink-0 text-xs rounded-xl"
                  leftIcon={<Coins className="w-3.5 h-3.5 text-[#007FFF]" />}
                >
                  <span>Mint 100 Test Shares</span>
                </Button>
              </div>
            )}
          </div>

          {/* Step 2: Configure Dividend Payout Amount */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
                2. Dividend Payout Per Share
              </label>
              <span className="text-xs font-mono font-medium text-[#10B981] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{yieldIncrementPct.toFixed(2)}% multiplier jump</span>
              </span>
            </div>

            {/* Number Input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-base font-medium">
                $
              </span>
              <input
                type="number"
                step="0.25"
                min="0.1"
                value={dividendAmount}
                onChange={(e) => {
                  setDividendAmount(e.target.value);
                  reset();
                }}
                placeholder="2.50"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-base font-mono font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#007FFF]/20 focus:border-[#007FFF] transition-all"
              />
            </div>

            {/* Preset Amount Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-neutral-400 font-normal mr-1">Presets:</span>
              {PRESET_DIVIDENDS.map((preset) => {
                const isSelected = dividendAmount === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setDividendAmount(preset.value);
                      reset();
                    }}
                    className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#007FFF] text-white font-medium shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 border border-neutral-200/60 font-normal"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Mathematical Expansion Impact Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
              <span>Mathematical Impact Preview</span>
              <span className="text-[#007FFF]">Onchain Rebase</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Box 1: Multiplier Jump */}
              <div className="p-3 rounded-xl bg-white border border-neutral-200/80 space-y-1">
                <span className="text-[11px] text-neutral-400 font-normal block">
                  Multiplier Expansion
                </span>
                <div className="flex items-center gap-2 font-mono font-medium text-sm">
                  <span className="text-neutral-500">{currentMultiplierNum.toFixed(3)}x</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#007FFF] shrink-0" />
                  <span className="text-[#007FFF]">{newMultiplierNum.toFixed(3)}x</span>
                </div>
              </div>

              {/* Box 2: Instant Harvestable Surplus */}
              <div className="p-3 rounded-xl bg-white border border-neutral-200/80 space-y-1">
                <span className="text-[11px] text-neutral-400 font-normal block">
                  New Cashflow Surplus
                </span>
                <div className="font-mono font-medium text-sm text-[#10B981]">
                  +${generatedSurplusUsd.toFixed(2)} USDC
                </div>
              </div>

              {/* Box 3: Principal Protection */}
              <div className="p-3 rounded-xl bg-white border border-neutral-200/80 space-y-1">
                <span className="text-[11px] text-neutral-400 font-normal block">
                  Principal Equity Status
                </span>
                <div className="text-xs font-medium text-[#007FFF] flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Intact</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed break-all">{error}</p>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="p-4 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-heading font-medium text-sm text-[#15803D]">
                  <Check className="w-4 h-4 text-[#16A34A]" />
                  <span>Corporate Dividend Multiplier Jump Broadcasted!</span>
                </div>
                {txHash && (
                  <button
                    onClick={() =>
                      window.open(`https://sepolia.basescan.org/tx/${txHash}`, "_blank")
                    }
                    className="text-xs font-medium text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>BaseScan</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <p className="text-xs text-[#166534] font-normal leading-relaxed">
                The {selectedStock} smart contract on Base Sepolia has updated its rebase multiplier. Your new mathematical surplus is ready to be harvested privately to any stealth address or settled in USDC.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push("/harvest")}
                  className="text-xs rounded-xl"
                  leftIcon={<Repeat className="w-3.5 h-3.5" />}
                >
                  <span>Harvest New Surplus Now</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className="text-xs rounded-xl bg-white hover:bg-neutral-50"
                >
                  <span>Simulate Another</span>
                </Button>
              </div>
            </div>
          )}

          {/* Main Action Button */}
          {!isSuccess && (
            <Button
              variant="primary"
              size="lg"
              isLoading={isSimulating}
              onClick={() => handleExecuteSimulation()}
              className="w-full justify-center text-sm font-medium rounded-2xl shadow-xs"
              leftIcon={<Sparkles className="w-4 h-4 text-white" />}
            >
              <span>
                {isSimulating
                  ? "Broadcasting to Base Sepolia..."
                  : `Distribute +$${divNum.toFixed(2)} Dividend on ${selectedStock}`}
              </span>
            </Button>
          )}
        </section>

        {/* 3. Live Equities Multiplier Board */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
              Active Equities Multiplier Board
            </span>
            <span className="text-xs text-neutral-400 font-normal">
              Base Sepolia Rebasing Equities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STOCK_DATA.map((stock) => {
              const item = stocks.find((s) => s.symbol === stock.symbol);
              const isCurrentlyQuickSim = quickSimulatingStock === stock.symbol;

              return (
                <div
                  key={stock.symbol}
                  className="p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={stock.symbol} size={40} />
                      <div>
                        <div className="font-heading font-medium text-sm sm:text-base text-neutral-900">
                          {stock.shortName}
                        </div>
                        <div className="text-xs text-neutral-400 font-normal">
                          {item?.shares || "0.0 shares"}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-lg">
                      ${stock.defaultPrice}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 font-normal">Contract Multiplier</span>
                      <span className="font-mono font-medium text-[#007FFF]">
                        {item?.multiplier || "1.000x"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 font-normal">Dividend Yield</span>
                      <span className="font-mono font-medium text-[#10B981]">
                        {item?.dividendYield || "0.0% yield"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 font-normal">Harvestable Surplus</span>
                      <span className="font-mono font-medium text-[#10B981]">
                        {item?.harvestableSurplus || "+$0.00"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={isCurrentlyQuickSim}
                    onClick={() => handleQuickSimulate(stock.symbol)}
                    className="w-full justify-center text-xs rounded-xl"
                    leftIcon={<Zap className="w-3.5 h-3.5 text-[#007FFF]" />}
                  >
                    <span>Quick +$1.00 Payout</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Technical Explainer: How Rebasing Dividend Cashflows Work */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007FFF]" />
            <h3 className="font-heading font-medium text-base sm:text-lg text-neutral-900">
              How Alloy Rebasing Equities Work
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100 space-y-1.5">
              <span className="text-xs font-mono font-medium text-[#007FFF]">01. Payout</span>
              <div className="font-heading font-medium text-xs sm:text-sm text-neutral-900">
                Corporate Action
              </div>
              <p className="text-[11px] text-neutral-500 font-normal leading-relaxed">
                Corporations announce regular quarterly or special dividends. The cash is deposited onchain into the Alloy protocol.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100 space-y-1.5">
              <span className="text-xs font-mono font-medium text-[#10B981]">02. Rebase</span>
              <div className="font-heading font-medium text-xs sm:text-sm text-neutral-900">
                Multiplier Expansion
              </div>
              <p className="text-[11px] text-neutral-500 font-normal leading-relaxed">
                The smart contract updates `multiplier = multiplier * (1 + dividend / price)` without minting dilutive equity.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100 space-y-1.5">
              <span className="text-xs font-mono font-medium text-[#007FFF]">03. Principal</span>
              <div className="font-heading font-medium text-xs sm:text-sm text-neutral-900">
                100% Conserved
              </div>
              <p className="text-[11px] text-neutral-500 font-normal leading-relaxed">
                Your underlying equity shares remain untouched in your wallet. You retain full long-term equity ownership.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100 space-y-1.5">
              <span className="text-xs font-mono font-medium text-[#10B981]">04. Stealth</span>
              <div className="font-heading font-medium text-xs sm:text-sm text-neutral-900">
                Private Harvesting
              </div>
              <p className="text-[11px] text-neutral-500 font-normal leading-relaxed">
                Accrued yield is extracted directly to ERC-5564 stealth addresses or swapped into USDC with zero link to your holdings.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Recent Simulation Activity Feed */}
        {simulationActivities.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
                Recent Simulation Events
              </span>
              <span className="text-xs text-neutral-400 font-normal">
                {simulationActivities.length} recorded
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
              {simulationActivities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  onClick={() => setSelectedTx(act)}
                  className="p-4 hover:bg-neutral-50/80 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-lg shrink-0">
                      <span>⚡</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-heading font-medium text-sm text-neutral-900 truncate">
                        {act.title}
                      </div>
                      <div className="text-xs text-neutral-400 font-normal truncate">
                        {act.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-medium text-[#10B981]">
                      Onchain Rebased
                    </div>
                    <div className="text-[11px] text-neutral-400 font-normal">
                      {act.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Transaction Detail Receipt Modal */}
      {selectedTx && (
        <TxDetailModal
          isOpen={!!selectedTx}
          activity={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}

      {/* Avatar Emoji & Color Picker Modal */}
      {showAvatarPicker && (
        <EmojiColorPickerModal
          isOpen={showAvatarPicker}
          initialEmoji={profile.avatarEmoji}
          initialColor={profile.avatarBg}
          onClose={() => setShowAvatarPicker(false)}
          onSave={(emoji: string, color: string) => {
            updateProfile({ avatarEmoji: emoji, avatarBg: color });
            setShowAvatarPicker(false);
          }}
        />
      )}
    </AppShell>
  );
}
