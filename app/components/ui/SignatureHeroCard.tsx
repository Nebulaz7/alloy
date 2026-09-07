"use client";

import React, { useState } from "react";
import { Info, Scan, ArrowUpRight, X, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { StockLogo } from "@/components/brand/StockLogos";

export interface StockTokenItem {
  symbol: "AAPLc" | "NVDAc" | "COINc" | string;
  name: string;
  shares: string;
  valueUsd: string;
  multiplier: string;
  dividendYield: string;
  harvestableSurplus: string;
}

interface SignatureHeroCardProps {
  title?: string;
  totalDividendsEarned?: string;
  availableToHarvest?: string;
  items?: StockTokenItem[];
  bannerText?: string;
  onHarvestClick?: (token: StockTokenItem) => void;
  className?: string;
}

const defaultItems: StockTokenItem[] = [
  {
    symbol: "AAPLc",
    name: "Apple Tokenized Stock",
    shares: "100.0 AAPLc",
    valueUsd: "$20,000.00 principal",
    multiplier: "1.025x",
    dividendYield: "+2.5% yield",
    harvestableSurplus: "+$75.00",
  },
  {
    symbol: "NVDAc",
    name: "Nvidia Tokenized Stock",
    shares: "200.0 NVDAc",
    valueUsd: "$26,000.00 principal",
    multiplier: "1.018x",
    dividendYield: "+1.8% yield",
    harvestableSurplus: "+$45.00",
  },
  {
    symbol: "COINc",
    name: "Coinbase Tokenized Stock",
    shares: "100.0 COINc",
    valueUsd: "$22,000.00 principal",
    multiplier: "1.006x",
    dividendYield: "+0.6% yield",
    harvestableSurplus: "+$4.50",
  },
];

export const SignatureHeroCard: React.FC<SignatureHeroCardProps> = ({
  title = "Total Dividends Earned",
  totalDividendsEarned = "+$1,428.50",
  availableToHarvest = "+$124.50",
  items = defaultItems,
  bannerText = "Dividends harvested privately through Alloy",
  onHarvestClick,
  className = "",
}) => {
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  return (
    <div
      className={`bg-white rounded-3xl border-4 border-[#007FFF] shadow-xs overflow-hidden flex flex-col transition-all duration-200 ${className}`}
    >
      {/* Card Content Area */}
      <div className="p-6 sm:p-7 space-y-5">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-neutral-600 font-heading text-sm">
            <span>{title}</span>
            <span
              className="text-neutral-400 hover:text-neutral-600 cursor-help transition-colors"
              title="Cash dividends accrue automatically via Base Sepolia mathematical multipliers without selling stock principal."
            >
              <Info className="w-4 h-4" />
            </span>
          </div>

          {/* Top-Right Action (Lucide Scan icon) */}
          <button
            aria-label="Scan or QR"
            className="w-9 h-9 rounded-xl bg-neutral-100 hover:bg-[#E0F2FE] hover:text-[#007FFF] flex items-center justify-center text-neutral-600 transition-colors cursor-pointer"
          >
            <Scan className="w-4 h-4" />
          </button>
        </div>

        {/* Big Dividend Figure Display */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-heading font-medium text-neutral-900 tracking-tight">
              {totalDividendsEarned}
            </span>
            <span className="text-xs sm:text-sm font-medium text-[#10B981] px-2.5 py-1 rounded-xl bg-[#DCFCE7] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{availableToHarvest} ready to harvest</span>
            </span>
          </div>

          {/* Underlying Equity Protected Assurance */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-normal">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>$68,000.00 stock principal 100% untouched & conserved</span>
          </div>
        </div>

        {/* Section Label: Accruing Dividend Yields */}
        <div className="flex items-center justify-between text-[11px] font-heading font-medium uppercase tracking-wider text-neutral-400 pt-1">
          <span>Accruing Stock Dividends</span>
          <span>Surplus Yield</span>
        </div>

        {/* Token List: Focused on Dividend Yield & Surplus */}
        <div className="space-y-2.5">
          {items.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-neutral-50/80 transition-colors duration-150 group"
            >
              <div className="flex items-center gap-3">
                {/* Official SVG Stock Logo */}
                <StockLogo symbol={token.symbol} size={40} />

                {/* Token and Dividend Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-900 text-sm sm:text-base font-medium">
                      {token.harvestableSurplus}
                    </span>
                    <span className="text-neutral-400 text-xs sm:text-sm font-normal">
                      from {token.symbol}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[#E0F2FE] text-[#007FFF] border border-[#BAE6FD]">
                      {token.multiplier}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 font-normal">
                    {token.shares} • {token.valueUsd}
                  </div>
                </div>
              </div>

              {/* Action / Harvest Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onHarvestClick?.(token)}
                  className="px-3 py-1.5 rounded-xl bg-[#E0F2FE] hover:bg-[#007FFF] text-[#007FFF] hover:text-white text-xs font-normal transition-all duration-150 flex items-center gap-1 cursor-pointer"
                >
                  <span>Harvest</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Active Demo Alert Banner */}
        {showDemoBanner && (
          <div className="p-3.5 rounded-2xl bg-[#E0F2FE]/70 border border-[#BAE6FD] flex items-start justify-between gap-3 text-xs text-neutral-700">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-[#007FFF] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3" />
              </div>
              <div className="space-y-0.5">
                <div className="font-medium text-neutral-900">
                  Apple Corporate Dividend Credited (+1.025x)
                </div>
                <div className="text-neutral-600 font-normal">
                  $75.00 in surplus dividend shares is ready for 1-click private extraction. Your equity principal remains 100% untouched.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDemoBanner(false)}
              className="text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Full-width Solid Azure Blue Bottom Ribbon Banner */}
      <div className="bg-[#007FFF] py-3.5 px-6 text-center text-white text-xs sm:text-sm font-medium tracking-wide">
        {bannerText}
      </div>
    </div>
  );
};
