"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Wallet,
  TrendingUp,
  Layers,
  Lock,
  RefreshCw,
  Check,
  ChevronRight,
  Code2,
} from "lucide-react";
import { AlloyLogo } from "@/components/brand/AlloyLogo";
import { StockLogo } from "@/components/brand/StockLogos";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const [hasHarvested, setHasHarvested] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [multiplier, setMultiplier] = useState(1.025);
  const [surplus, setSurplus] = useState(75.0);

  const handleTestHarvest = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setHasHarvested(true);
      setTimeout(() => setHasHarvested(false), 3500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col justify-between selection:bg-[#E0F2FE] selection:text-[#007FFF]">
      {/* 1. Clean Top Header */}
      <header className="w-full border-b border-neutral-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlloyLogo size="md" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#007FFF] text-xs font-normal border border-[#BAE6FD]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007FFF] animate-pulse" />
              Base Sepolia (84532)
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="flex items-center gap-4 text-xs sm:text-sm text-neutral-600 font-normal">
              <a
                href="https://docs.base.org"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#007FFF] transition-colors flex items-center gap-1"
              >
                <span>Docs</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
              <a
                href="https://github.com/Nebulaz7/alloy"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#007FFF] transition-colors flex items-center gap-1"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </nav>

            <Link href="/login">
              <Button variant="primary" size="sm" className="shadow-xs cursor-pointer">
                <span>Launch App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main One-Screen Hero & Interactive Showcase */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-8 sm:space-y-12">
        {/* Hero Copy */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#007FFF] text-xs sm:text-sm font-normal shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#007FFF]" />
            <span>Private Programmable Dividend Rails on Base</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-neutral-900 leading-[1.15]">
            Harvest tokenized stock dividends{" "}
            <span className="text-[#007FFF]">privately</span>.
          </h1>

          <p className="text-sm sm:text-lg text-neutral-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Non-custodial surplus yield extraction from real tokenized equities (
            <span className="text-neutral-900 font-medium">$AAPLc</span>,{" "}
            <span className="text-neutral-900 font-medium">$NVDAc</span>,{" "}
            <span className="text-neutral-900 font-medium">$COINc</span>) routed directly to
            unlinkable Basename stealth addresses without selling principal shares.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                className="shadow-md shadow-blue-500/15 cursor-pointer text-base px-6 py-3.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <a
              href="https://github.com/Nebulaz7/alloy"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="cursor-pointer text-base px-6 py-3.5"
              >
                <Code2 className="w-4 h-4 text-neutral-500" />
                <span>View Source</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Interactive Architecture & Signature Card Showcase */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-3xl border-4 border-[#007FFF] shadow-xl shadow-blue-500/5 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-neutral-900">
                  Interactive Rail Preview
                </span>
              </div>
              <span className="text-xs text-neutral-500 font-normal font-mono bg-neutral-100 px-2.5 py-1 rounded-lg">
                Hook: 0x78BF...459c
              </span>
            </div>

            {/* Split Flow Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
              {/* Left Column: Tokenized Asset */}
              <div className="md:col-span-3 p-5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StockLogo symbol="AAPLc" size={36} />
                    <div>
                      <div className="font-medium text-sm text-neutral-900">
                        Apple Inc. (AAPLc)
                      </div>
                      <div className="text-xs text-neutral-400 font-normal">
                        Backed B20 Equities
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-[#E0F2FE] text-[#007FFF] border border-[#BAE6FD]">
                    {multiplier.toFixed(3)}x
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-200/50 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-normal">Principal Shares:</span>
                  <span className="text-neutral-800 font-medium font-mono">
                    100.0 AAPLc ($20,000.00)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-normal">Accrued Cash Dividend:</span>
                  <span className="text-[#10B981] font-medium font-mono">
                    +${surplus.toFixed(2)} (+2.5% yield)
                  </span>
                </div>
              </div>

              {/* Middle Flow Action */}
              <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
                <button
                  type="button"
                  onClick={handleTestHarvest}
                  disabled={isSimulating}
                  className="w-11 h-11 rounded-full bg-[#007FFF] hover:bg-[#0066FF] active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                  title="Test Harvest Flow"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${isSimulating ? "animate-spin" : ""}`}
                  />
                </button>
                <span className="text-[10px] text-neutral-400 font-normal mt-1.5">
                  1-Click Rail
                </span>
              </div>

              {/* Right Column: Stealth Payout */}
              <div className="md:col-span-3 p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StockLogo symbol="USDC" size={36} />
                    <div>
                      <div className="font-medium text-sm text-neutral-900">
                        Stealth Dividend Payout
                      </div>
                      <div className="text-xs text-neutral-500 font-normal">
                        USD Coin (USDC)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    ERC-5564
                  </span>
                </div>

                <div className="pt-2 border-t border-[#BBF7D0]/60 flex items-center justify-between text-xs">
                  <span className="text-neutral-600 font-normal">Recipient Handle:</span>
                  <span className="text-neutral-800 font-medium font-mono">
                    stealth.base.eth
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 font-normal">Harvested Yield:</span>
                  <span className="text-[#15803D] font-medium font-mono text-sm">
                    {hasHarvested ? "+$75.00 USDC" : "+$75.00 Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Feedback Banner */}
            <div className="p-3.5 rounded-2xl bg-[#E0F2FE]/70 border border-[#BAE6FD] flex items-center justify-between text-xs text-neutral-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#007FFF]" />
                <span>
                  {hasHarvested ? (
                    <strong className="text-[#10B981]">
                      ✓ Extracted $75.00 USDC to stealth rail! Underlying equity principal is 100% untouched.
                    </strong>
                  ) : (
                    "Underlying equity principal shares are non-custodial and remain 100% untouched."
                  )}
                </span>
              </div>
              <span className="text-[11px] text-[#007FFF] font-medium font-mono hidden sm:inline">
                Verified on Base
              </span>
            </div>
          </div>
        </div>

        {/* 3. Three Core Pillars Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-2 hover:border-[#BAE6FD] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#007FFF] flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-base text-neutral-900">
              Mathematical Surplus
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
              Harvest corporate dividend yield as asset multipliers rise without selling or liquidating your principal equity shares.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-2 hover:border-[#BAE6FD] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#007FFF] flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-base text-neutral-900">
              Stealth Basenames
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
              Native <code className="font-mono text-neutral-800">.base.eth</code> names automatically resolve to ERC-5564 stealth meta-addresses for private onchain payouts.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-2 hover:border-[#BAE6FD] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#007FFF] flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-base text-neutral-900">
              Composability &amp; Swaps
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
              Route extracted dividends directly into global USDC, emerging market local stablecoins (cNGN), or Base meme tokens (CLANKER).
            </p>
          </div>
        </div>
      </main>

      {/* 4. Minimal, Clean Footer */}
      <footer className="w-full border-t border-neutral-200/70 bg-white/60 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-normal">
          <div className="flex items-center gap-2">
            <span>Alloy © 2026</span>
            <span>•</span>
            <span>Built on Base Sepolia</span>
            <span>•</span>
            <span className="text-neutral-400">Backed B20 &amp; ERC-5564</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://docs.base.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-800 transition-colors"
            >
              Docs
            </a>
            <span>•</span>
            <a
              href="https://github.com/Nebulaz7/alloy"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-800 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
