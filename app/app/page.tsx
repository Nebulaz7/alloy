"use client";

import React, { useState } from "react";
import { AlloyLogo } from "@/components/brand/AlloyLogo";
import { AlloyMascot } from "@/components/brand/AlloyMascot";

export default function Home() {
  const [expression, setExpression] = useState<"wink" | "smile">("wink");
  const [copied, setCopied] = useState(false);

  const handleCopySvg = (name: string) => {
    navigator.clipboard.writeText(`/alloy-${name}.svg`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Top Status Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#007FFF] text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse" />
            ELEMENT 1 REVIEW — BRAND MARK & MASCOT
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900">
            Alloy Visual Identity
          </h1>
          <p className="text-neutral-500 text-sm max-w-lg mx-auto">
            Light-mode-only, playful consumer fintech design with Azure Blue primary branding,
            custom winking mascot, and squircle geometry.
          </p>
        </div>

        {/* Hero Preview Card (Matches Inspo Signature Squircle Container) */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
            Primary Brand Header
          </span>

          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-100">
            <AlloyLogo size="lg" showBeta={true} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setExpression(expression === "wink" ? "smile" : "wink")}
              className="px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 font-bold text-xs text-neutral-700 transition-colors"
            >
              Toggle Expression: <span className="text-[#007FFF] capitalize">{expression}</span>
            </button>
            <button
              onClick={() => handleCopySvg("logo")}
              className="px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 font-bold text-xs text-neutral-700 transition-colors"
            >
              {copied ? "Copied SVG Path!" : "Copy SVG Reference"}
            </button>
          </div>
        </div>

        {/* Mascot Variations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Squircle Mascot */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm space-y-4 text-center">
            <h3 className="font-bold text-sm text-neutral-500 uppercase tracking-wider">
              Squircle Icon (App Icon & Header)
            </h3>
            <div className="h-32 flex items-center justify-center">
              <AlloyMascot size="2xl" expression={expression} withSquircle={true} />
            </div>
            <p className="text-xs text-neutral-400">
              Vibrant Azure Blue base (`#007FFF`) + white winking coin + dividend sparkle
            </p>
          </div>

          {/* Standalone Mascot */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm space-y-4 text-center">
            <h3 className="font-bold text-sm text-neutral-500 uppercase tracking-wider">
              Sticker / Standalone
            </h3>
            <div className="h-32 flex items-center justify-center">
              <AlloyMascot size="2xl" expression={expression} withSquircle={false} />
            </div>
            <p className="text-xs text-neutral-400">
              Frameless coin mascot for stickers, empty states, and celebrations
            </p>
          </div>
        </div>

        {/* Size Scale */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-neutral-500 uppercase tracking-wider text-center">
            Size Scale Hierarchy
          </h3>

          <div className="flex flex-wrap items-center justify-around gap-6 py-4">
            <div className="flex flex-col items-center gap-2">
              <AlloyLogo size="sm" />
              <span className="text-[11px] font-mono text-neutral-400">sm (28px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AlloyLogo size="md" />
              <span className="text-[11px] font-mono text-neutral-400">md (36px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AlloyLogo size="lg" />
              <span className="text-[11px] font-mono text-neutral-400">lg (48px)</span>
            </div>
          </div>
        </div>

        {/* In-Context Inspo Preview (Header Simulation) */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-neutral-500 uppercase tracking-wider">
            In-Context: Left Sidebar Header (Pivy Style)
          </h3>
          <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-100 flex items-center justify-between">
            <AlloyLogo size="md" />
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                Base Sepolia
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-neutral-400 pb-8">
          Element 1 Complete. Ready for review and transition to Element 2 (Signature Card & Core Surfaces).
        </div>
      </div>
    </main>
  );
}
