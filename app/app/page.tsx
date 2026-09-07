"use client";

import React, { useState } from "react";
import { Sparkles, FileText, Check, ArrowRight, Layers } from "lucide-react";
import { AlloyLogo } from "@/components/brand/AlloyLogo";
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
    subtitle: "Apple Dividend Yield",
    amount: "250.00",
    tokenSymbol: "USDC",
    tags: ["harvest", "stealth payout", "bob.base.eth"],
    timestamp: "2 mins ago",
    avatarBg: "#E0F2FE",
    isPositive: true,
  },
  {
    id: "act-2",
    type: "swap",
    title: "Meme Dividend Diverted",
    subtitle: "1-Click $CLANKER Swap",
    amount: "50.0",
    tokenSymbol: "CLANKER",
    tags: ["meme ape", "clanker.world"],
    timestamp: "1 hour ago",
    avatarBg: "#F3E8FF",
    isPositive: true,
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("all");
  const [showBeta, setShowBeta] = useState(false);
  const [expression, setExpression] = useState<"wink" | "smile">("wink");
  const [isSimulating, setIsSimulating] = useState(false);

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-neutral-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-xs">
          <AlloyLogo size="md" showBeta={showBeta} />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBeta(!showBeta)}
              className={`px-3 py-1.5 rounded-xl text-xs font-normal border transition-colors cursor-pointer ${
                showBeta
                  ? "bg-[#E0F2FE] text-[#007FFF] border-[#BAE6FD]"
                  : "bg-neutral-100 text-neutral-600 border-neutral-200"
              }`}
            >
              Beta Tag: {showBeta ? "Visible" : "Hidden (Clean Variant)"}
            </button>

            <button
              onClick={() => setExpression(expression === "wink" ? "smile" : "wink")}
              className="px-3 py-1.5 rounded-xl text-xs font-normal bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Mascot: <span className="text-[#007FFF] capitalize">{expression}</span>
            </button>
          </div>
        </div>

        {/* Section Title with Google Sans */}
        <div className="text-center space-y-1.5">
          <Badge variant="azure" size="sm">
            Typography & Style Updates Applied
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-heading font-medium tracking-tight text-neutral-900">
            Alloy Design System
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto font-normal">
            Google Sans headers, Comic Relief body, dual Azure Blue accents, official stock logos, and rectangular rounded buttons.
          </p>
        </div>

        {/* 1. SIGNATURE HERO CARD (With Real Stock Logos & Dual Azure Shades) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
              Signature Hero Card
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#007FFF] font-normal">
              <span className="w-2 h-2 rounded-full bg-[#4DA6FF] animate-ping" />
              <span>Base Sepolia Live</span>
            </div>
          </div>

          <SignatureHeroCard
            title="Your Equity Holdings"
            totalBalance="$68,000.00"
            bannerText="Dividends harvested privately through Alloy"
            onHarvestClick={(token) => alert(`Harvesting surplus from ${token.symbol}`)}
          />
        </div>

        {/* 2. PERSONAL LINK / BASENAME CARD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
              Basename Identity Card
            </span>
          </div>

          <PersonalLinkCard
            title="Your Personal Link"
            subtitle="Share to receive dividends privately"
            handle="bob.base.eth"
            onShowQr={() => alert("QR modal triggered")}
            onOpenLink={() => window.open("https://sepolia.basescan.org/address/0xD5687794c8E1b69F477911Df56170679CB6414eC", "_blank")}
          />
        </div>

        {/* 3. RECENT ACTIVITY LEDGER */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-medium text-neutral-900 text-base">Recent Activities</h3>
            <span className="text-xs text-neutral-400 font-normal">Auto-Sync</span>
          </div>

          <FilterTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            rightAction={
              <button
                onClick={() => alert("Exporting CSV...")}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-normal text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                <span>Export CSV</span>
              </button>
            }
          />

          <div className="divide-y divide-neutral-100">
            {mockActivities.map((act) => (
              <ActivityRow key={act.id} activity={act} />
            ))}
          </div>

          <div className="pt-2">
            <Button variant="secondary" size="sm" className="w-full">
              See all activities
            </Button>
          </div>
        </div>

        {/* 4. STOCK LOGOS & DUAL AZURE PALETTE SHOWCASE */}
        <Card variant="default" className="space-y-5">
          <h3 className="font-heading font-medium text-neutral-900 text-sm uppercase tracking-wider text-center">
            Official Stock Logos & Dual Azure Palette
          </h3>

          {/* Official Stock Logos */}
          <div className="space-y-2">
            <div className="text-xs font-heading font-medium text-neutral-400">
              Official Stock Vector Logos
            </div>
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-[#F9FAFB] border border-neutral-100">
              <div className="flex items-center gap-2 pr-3 border-r border-neutral-200">
                <StockLogo symbol="AAPLc" size={32} />
                <span className="text-xs font-normal text-neutral-700">Apple</span>
              </div>
              <div className="flex items-center gap-2 pr-3 border-r border-neutral-200">
                <StockLogo symbol="NVDAc" size={32} />
                <span className="text-xs font-normal text-neutral-700">Nvidia</span>
              </div>
              <div className="flex items-center gap-2 pr-3 border-r border-neutral-200">
                <StockLogo symbol="COINc" size={32} />
                <span className="text-xs font-normal text-neutral-700">Coinbase</span>
              </div>
              <div className="flex items-center gap-2 pr-3 border-r border-neutral-200">
                <StockLogo symbol="USDC" size={32} />
                <span className="text-xs font-normal text-neutral-700">USDC</span>
              </div>
              <div className="flex items-center gap-2">
                <StockLogo symbol="cNGN" size={32} />
                <span className="text-xs font-normal text-neutral-700">cNGN</span>
              </div>
            </div>
          </div>

          {/* Dual Azure Blue Palette */}
          <div className="space-y-2">
            <div className="text-xs font-heading font-medium text-neutral-400">
              Dual Azure Palette & Button Shapes (Rectangular Rounded)
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="primary">
                Primary Azure (#007FFF)
              </Button>
              <Button variant="azure-light">
                Light Azure (#4DA6FF)
              </Button>
              <Button variant="azure-soft">
                Soft Azure (#E0F2FE)
              </Button>
              <Button variant="dark">
                Dark Action
              </Button>
              <Button
                variant="primary"
                isLoading={isSimulating}
                onClick={() => {
                  setIsSimulating(true);
                  setTimeout(() => setIsSimulating(false), 2000);
                }}
              >
                {isSimulating ? "Processing..." : "Simulate Action"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-center text-xs text-neutral-400 pb-12 font-normal">
          Edits applied! Review at <span className="font-mono text-neutral-600">localhost:3000</span>. When ready, we will implement Element 3 (Navigation Shells: Desktop Sidebar & Mobile Floating Dock).
        </div>
      </div>
    </main>
  );
}
