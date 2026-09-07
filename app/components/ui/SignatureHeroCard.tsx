"use client";

import React, { useState } from "react";
import { Info, Scan, ArrowUpRight, X, Sparkles } from "lucide-react";
import { StockLogo } from "@/components/brand/StockLogos";

export interface StockTokenItem {
  symbol: "AAPLc" | "NVDAc" | "COINc" | string;
  name: string;
  shares: string;
  valueUsd: string;
  multiplier: string;
  pendingYield?: string;
}

interface SignatureHeroCardProps {
  title?: string;
  totalBalance?: string;
  items?: StockTokenItem[];
  bannerText?: string;
  onHarvestClick?: (token: StockTokenItem) => void;
  className?: string;
}

const defaultItems: StockTokenItem[] = [
  {
    symbol: "AAPLc",
    name: "Apple Tokenized Stock",
    shares: "100.0",
    valueUsd: "$20,000.00",
    multiplier: "1.025x",
    pendingYield: "+$250.00",
  },
  {
    symbol: "NVDAc",
    name: "Nvidia Tokenized Stock",
    shares: "200.0",
    valueUsd: "$26,000.00",
    multiplier: "1.000x",
  },
  {
    symbol: "COINc",
    name: "Coinbase Tokenized Stock",
    shares: "100.0",
    valueUsd: "$22,000.00",
    multiplier: "1.000x",
  },
];

export const SignatureHeroCard: React.FC<SignatureHeroCardProps> = ({
  title = "Your Equity Holdings",
  totalBalance = "$68,000.00",
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
              title="Tokenized stocks accrue cash dividends onchain via increasing mathematical multipliers."
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

        {/* Big Balance Display (Google Sans, not overly bold) */}
        <div className="space-y-0.5">
          <div className="text-4xl sm:text-5xl font-heading font-semibold text-neutral-900 tracking-tight">
            {totalBalance}
          </div>
          <div className="text-xs text-neutral-400 font-normal">
            Principal equity value (100% conserved on Base)
          </div>
        </div>

        {/* Section Label */}
        <div className="text-[11px] font-heading font-medium uppercase tracking-wider text-neutral-400 pt-1">
          Tokenized Stocks & Multipliers
        </div>

        {/* Token List with Real Logos */}
        <div className="space-y-2.5">
          {items.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-neutral-50/80 transition-colors duration-150"
            >
              <div className="flex items-center gap-3">
                {/* Official SVG Logo */}
                <StockLogo symbol={token.symbol} size={40} />

                {/* Token Symbol and Title */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-900 text-sm sm:text-base font-medium">
                      {token.shares}
                    </span>
                    <span className="text-neutral-400 text-xs sm:text-sm font-normal">
                      {token.symbol}
                    </span>
                    {token.multiplier && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[#E0F2FE] text-[#007FFF] border border-[#BAE6FD]">
                        {token.multiplier}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 font-normal">
                    {token.name}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <div className="text-neutral-800 text-sm sm:text-base font-normal">
                    {token.valueUsd}
                  </div>
                  {token.pendingYield ? (
                    <div className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-0.5">
                      <span>{token.pendingYield}</span>
                    </div>
                  ) : null}
                </div>

                {/* Harvest / Action Button */}
                <button
                  onClick={() => onHarvestClick?.(token)}
                  aria-label={`Harvest ${token.symbol}`}
                  className="w-8 h-8 rounded-xl bg-[#F0F7FF] hover:bg-[#007FFF] text-[#007FFF] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title="Harvest Dividend Surplus"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Dividend Alert Banner with Light Azure Accents */}
        {showDemoBanner ? (
          <div className="bg-[#F0F8FF] border border-[#BAE6FD] text-neutral-800 rounded-2xl p-3.5 sm:p-4 flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-xl bg-[#4DA6FF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs space-y-1">
                <div className="font-heading font-medium text-neutral-900">
                  Dividend Surplus Detected
                </div>
                <div className="text-neutral-600 leading-relaxed font-normal">
                  We simulated a <span className="font-medium text-[#007FFF]">+$2.50</span> dividend
                  on AAPLc (+1.25% multiplier). Your principal equity remains intact while
                  surplus can be privately routed!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDemoBanner(false)}
              className="text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Signature Solid Bottom Banner Ribbon (Paired with Lighter Azure Strip) */}
      <div className="bg-[#007FFF] text-white text-xs sm:text-sm py-2.5 px-4 text-center font-heading font-medium tracking-wide select-none flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4DA6FF] animate-pulse" />
        <span>{bannerText}</span>
      </div>
    </div>
  );
};
