"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Maximize2, Minimize2, X } from "lucide-react";
import { AlloyLogo } from "@/components/brand/AlloyLogo";

interface SlideData {
  number: string;
  category: string;
  title: string;
  subtitle?: string;
  renderContent: () => React.ReactNode;
}

export default function SlideDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalSlides = 5;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const slides: SlideData[] = [
    // ----------------------------------------------------
    // SLIDE 1: Title & Premise
    // ----------------------------------------------------
    {
      number: "01",
      category: "ALLOY PROTOCOL • BASE B20",
      title: "Private programmable dividend rails for tokenized equities.",
      subtitle:
        "Harvest Wall Street stock dividends into any currency — without touching your equity principal or exposing your wallet onchain.",
      renderContent: () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-neutral-800/80 mt-auto">
          <div>
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">
              01 / Token Standard
            </div>
            <div className="text-base font-medium text-white mb-1">
              Base B20 Equities
            </div>
            <div className="text-sm text-neutral-400 font-normal leading-relaxed">
              Tokenized equities ($AAPLc, $NVDAc, $COINc) using non-rebasing contract multipliers.
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">
              02 / Capital Invariant
            </div>
            <div className="text-base font-medium text-white mb-1">
              100% Conserved Principal
            </div>
            <div className="text-sm text-neutral-400 font-normal leading-relaxed">
              Precision surplus math trims only the dividend yield without liquidating core stock shares.
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider mb-2">
              03 / Privacy Layer
            </div>
            <div className="text-base font-medium text-white mb-1">
              ERC-5564 Stealth Basenames
            </div>
            <div className="text-sm text-neutral-400 font-normal leading-relaxed">
              One-time cryptographic destination addresses resolved from native .base.eth handles.
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 2: The Problem
    // ----------------------------------------------------
    {
      number: "02",
      category: "THE PROBLEM",
      title: "Stock dividends on public blockchains are trapped and doxxed.",
      subtitle:
        "How corporate actions on tokenized assets break traditional cash flow and financial privacy.",
      renderContent: () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-neutral-800/80 mt-auto">
          <div className="flex flex-col">
            <span className="text-sm font-mono text-neutral-500 mb-3">01</span>
            <h3 className="text-lg font-medium text-white mb-2">
              Dividends Stay Frozen
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-normal">
              To stay composable with DeFi lending, B20 stocks use internal multipliers instead of airdropping cash. Yield remains trapped inside the contract.
            </p>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-mono text-neutral-500 mb-3">02</span>
            <h3 className="text-lg font-medium text-white mb-2">
              Selling Destroys Principal
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-normal">
              To extract cash today, holders must manually calculate and liquidate shares—permanently reducing their equity position and triggering taxable events.
            </p>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-mono text-neutral-500 mb-3">03</span>
            <h3 className="text-lg font-medium text-white mb-2">
              Public Ledger Surveillance
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-normal">
              Collecting dividends directly to a wallet creates a permanent public trace on BaseScan, revealing total net worth, stock balances, and recurring income.
            </p>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 3: The Engine (How It Works)
    // ----------------------------------------------------
    {
      number: "03",
      category: "THE ENGINE",
      title: "Automated surplus extraction in three clean steps.",
      subtitle:
        "Non-custodial routing that converts contract multiplier gains into private, spendable liquidity.",
      renderContent: () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-neutral-800/80 mt-auto">
          <div className="flex flex-col">
            <div className="text-xs font-mono text-[#007FFF] uppercase tracking-wider mb-2">
              Phase 1
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Checkpoint &amp; Detect
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-normal">
              Alloy continuously tracks Base B20 equity multipliers. When a dividend increases the multiplier, Alloy calculates the exact surplus yield against the user’s baseline.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="text-xs font-mono text-[#007FFF] uppercase tracking-wider mb-2">
              Phase 2
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Invariant Share Trim
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-normal">
              Alloy trims exclusively the surplus shares (ΔB). The remaining equity principal is mathematically preserved, and trimmed yield is swapped into USDC, cNGN, or CLANKER.
            </p>
          </div>

          <div className="flex flex-col">
            <div className="text-xs font-mono text-[#007FFF] uppercase tracking-wider mb-2">
              Phase 3
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Stealth Settlement
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-normal">
              The dividend is routed to an unlinkable, one-time ERC-5564 stealth address resolved from the holder’s Basename. The recipient scans and claims privately.
            </p>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 4: The Math & Privacy
    // ----------------------------------------------------
    {
      number: "04",
      category: "THE FOUNDATION",
      title: "Formally verified math and non-interactive stealth cryptography.",
      subtitle:
        "Guaranteed capital conservation backed by native Base identity resolution.",
      renderContent: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-neutral-800/80 mt-auto">
          <div className="space-y-4">
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              Mathematical Invariant
            </div>
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-2">
              <div className="text-neutral-500">// Surplus Share Formula:</div>
              <div className="text-white font-medium">ΔB = B × (M_current - M_checkpoint) / M_current</div>
              <div className="text-neutral-500 pt-2">// Conservation Proof:</div>
              <div className="text-[#007FFF] font-medium">(B - ΔB) × M_current ≡ B × M_checkpoint</div>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed font-normal">
              Evaluated at current market multipliers, the holder’s effective equity value remains identical before and after extraction. Fuzz-tested to 1 wei on Foundry.
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
              Privacy Architecture
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-[#007FFF] font-mono text-xs pt-0.5">01</span>
                <div>
                  <span className="text-white font-medium">Native Basenames: </span>
                  <span className="text-neutral-400">Users share simple handles (e.g. alice.base.eth) instead of raw cryptographic public keys.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#007FFF] font-mono text-xs pt-0.5">02</span>
                <div>
                  <span className="text-white font-medium">Dual-Tier Resolution: </span>
                  <span className="text-neutral-400">Resolves L2 ENS text records (&quot;stealth&quot;) with fallback to ERC-6538 Registry.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#007FFF] font-mono text-xs pt-0.5">03</span>
                <div>
                  <span className="text-white font-medium">O(1) Fast Inbox Scanning: </span>
                  <span className="text-neutral-400">1-byte view tags allow recipients to detect private incoming dividends instantly.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // SLIDE 5: Real-World Use Cases & Live Status
    // ----------------------------------------------------
    {
      number: "05",
      category: "MARKETS & STATUS",
      title: "Live on Base Sepolia. Built for global capital.",
      subtitle:
        "From emerging market cash flows to institutional privacy and DeFi composability.",
      renderContent: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-neutral-800/80 mt-auto">
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="text-xs font-mono text-neutral-500 uppercase mb-2">
              Emerging Markets
            </div>
            <h4 className="text-base font-medium text-white mb-2">
              cNGN Local Payouts
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-normal">
              Investors hold US equities and stream dividends directly into local stablecoins (cNGN) for real-world spending.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="text-xs font-mono text-neutral-500 uppercase mb-2">
              Private Wealth
            </div>
            <h4 className="text-base font-medium text-white mb-2">
              Zero Wallet Doxxing
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-normal">
              Eliminates public surveillance and phishing vectors by routing dividend cash flows to fresh stealth addresses.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="text-xs font-mono text-neutral-500 uppercase mb-2">
              DeFi Collateral
            </div>
            <h4 className="text-base font-medium text-white mb-2">
              Aave Composability
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-normal">
              Equities used as lending collateral retain 100% position integrity while surplus yield is safely siphoned.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <div className="text-xs font-mono text-[#007FFF] uppercase mb-2">
              Live on Testnet
            </div>
            <h4 className="text-base font-medium text-white mb-2">
              Base Sepolia
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-normal">
              Deployed contracts (Router, MockB20, Resolver, Registry) with live portfolio tracker and stealth inbox.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between selection:bg-[#007FFF]/20 selection:text-white">
      {/* Minimal Top Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-neutral-900">
        <div className="flex items-center gap-3">
          <AlloyLogo size="sm" wordmarkColor="text-white" />
          <span className="text-xs text-neutral-500 font-mono pl-2 border-l border-neutral-800">
            Pitch Deck
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
          <span className="hidden sm:inline">Use ← / → keys to navigate</span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <Link
            href="/"
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Exit to Home"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Slide Canvas */}
      <main className="flex-1 flex items-center justify-center w-full max-w-6xl mx-auto px-6 py-12">
        <div className="w-full flex flex-col min-h-[460px] justify-between">
          {/* Slide Category Kicker */}
          <div>
            <div className="text-xs font-mono text-[#007FFF] tracking-wider mb-4 uppercase">
              {current.category}
            </div>

            {/* Slide Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight text-white leading-[1.15] max-w-4xl">
              {current.title}
            </h1>

            {/* Slide Subtitle */}
            {current.subtitle && (
              <p className="text-base sm:text-lg text-neutral-400 font-normal max-w-3xl mt-4 leading-relaxed">
                {current.subtitle}
              </p>
            )}
          </div>

          {/* Slide Dynamic Content Area */}
          <div className="w-full mt-8">{current.renderContent()}</div>
        </div>
      </main>

      {/* Minimal Bottom Bar */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-neutral-900">
        {/* Slide Counter */}
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
          <span className="text-white font-medium">{current.number}</span>
          <span>/</span>
          <span>0{totalSlides}</span>
        </div>

        {/* Minimal Progress Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 transition-all rounded-full cursor-pointer ${
                idx === currentSlide
                  ? "w-8 bg-[#007FFF]"
                  : "w-2 bg-neutral-800 hover:bg-neutral-600"
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 disabled:hover:border-neutral-800 transition-colors cursor-pointer"
            title="Previous Slide (←)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="p-2 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 disabled:opacity-30 disabled:hover:border-neutral-800 transition-colors cursor-pointer"
            title="Next Slide (→)"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
