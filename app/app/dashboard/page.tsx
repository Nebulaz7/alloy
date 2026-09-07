"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Repeat,
  ReceiptText,
  ExternalLink,
  ChevronRight,
  Zap,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import {
  SignatureHeroCard,
  StockTokenItem,
} from "@/components/ui/SignatureHeroCard";
import { PersonalLinkCard } from "@/components/ui/PersonalLinkCard";
import { ActivityRow, ActivityItem } from "@/components/ui/ActivityRow";
import { QRCodeModal } from "@/components/modals/QRCodeModal";
import { TxDetailModal } from "@/components/modals/TxDetailModal";
import { DividendSimModal } from "@/components/modals/DividendSimModal";
import { EmojiColorPickerModal } from "@/components/profile/EmojiColorPickerModal";
import { useAlloyStocks } from "@/lib/hooks/useAlloyStocks";
import { useSimulator } from "@/lib/hooks/useSimulator";
import { useProfile } from "@/lib/store/profileStore";
import { useActivity } from "@/lib/store/activityStore";
import { Button } from "@/components/ui/Button";
import { NavTabId } from "@/components/navigation/Sidebar";

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { profile, updateProfile } = useProfile();
  const { activities } = useActivity();
  const {
    stocks,
    totalDividendsEarned,
    availableToHarvest,
    refetch,
    isLoading,
  } = useAlloyStocks();
  const { simulateDividend } = useSimulator();

  // Modal states
  const [showQr, setShowQr] = useState(false);
  const [showSim, setShowSim] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedTx, setSelectedTx] = useState<ActivityItem | null>(null);

  // Handle sidebar & dock navigation
  const handleTabChange = (tab: NavTabId) => {
    if (tab === "dashboard") return;
    if (tab === "harvest") router.push("/harvest");
    else if (tab === "activities") router.push("/activities");
    else if (tab === "simulator") router.push("/simulator");
    else if (tab === "settings") router.push("/settings");
  };

  // Handle 1-click simulate from modal
  const handleDividendSimulated = async (
    multiplier: number,
    surplus: number,
  ) => {
    try {
      if (isConnected) {
        await simulateDividend("AAPLc", "2.50", "200.00");
      }
      await refetch();
    } catch {
      // Fallback update
      await refetch();
    }
  };

  return (
    <AppShell
      activeTab="dashboard"
      onTabChange={handleTabChange}
      connectedHandle={profile.basename || "nebula.base.eth"}
      avatarEmoji={profile.avatarEmoji}
      avatarBg={profile.avatarBg}
      onEditAvatar={() => setShowAvatarPicker(true)}
    >
      <div className="space-y-6 select-none">
        {/* Unauthenticated / Demo Preview Banner */}
        {!isConnected && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-neutral-800 font-normal">
              <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse" />
              <span>
                You are in <strong>Preview Mode</strong>. Connect a Base wallet
                to harvest real onchain dividends.
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

        {/* 1. Signature Hero Card (Live Web3 multi-asset dividends) */}
        <section aria-label="Dividend Portfolio Hero">
          <SignatureHeroCard
            title="Total Dividends Earned"
            totalDividendsEarned={totalDividendsEarned}
            availableToHarvest={availableToHarvest}
            items={stocks}
            // bannerText="Cash dividends extractable privately via ERC-5564 stealth rails"
            onHarvestClick={(token: StockTokenItem) => {
              // Direct to harvest studio with selected token
              router.push("/harvest");
            }}
          />
        </section>

        {/* 2. Interactive Action Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Quick Action 1: Simulate Corporate Dividend Jump */}
          <div
            onClick={() => setShowSim(true)}
            className="p-4 rounded-3xl bg-white border border-neutral-200/80 hover:border-[#BAE6FD] transition-all shadow-xs cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
                <span>⚡</span>
              </div>
              <div>
                <div className="font-medium text-sm text-neutral-900 flex items-center gap-1.5">
                  <span>Simulate Dividend</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] font-medium">
                    Base Sepolia
                  </span>
                </div>
                <div className="text-xs text-neutral-500 font-normal">
                  Trigger +$2.50/sh corporate cash payout
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#007FFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          {/* Quick Action 2: 1-Click Harvest Studio Entry */}
          <div
            onClick={() => router.push("/harvest")}
            className="p-4 rounded-3xl bg-white border border-neutral-200/80 hover:border-[#BBF7D0] transition-all shadow-xs cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#10B981] flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
                <span>🌾</span>
              </div>
              <div>
                <div className="font-medium text-sm text-neutral-900 flex items-center gap-1.5">
                  <span>Harvest Studio</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] font-medium">
                    {availableToHarvest}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 font-normal">
                  Extract surplus to stealth address or USDC
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#10B981] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </section>

        {/* 3. Personal Link Card (Stealth meta-address & handle) */}
        <section aria-label="Personal Link and QR">
          <PersonalLinkCard
            title="Your Personal Stealth Rail"
            subtitle="Share to receive dividends and payments with 100% privacy"
            handle={profile.basename || "nebula.base.eth"}
            avatarEmoji={profile.avatarEmoji}
            avatarBg={profile.avatarBg}
            onShowQr={() => setShowQr(true)}
            onOpenLink={() => router.push("/onboarding")}
          />
        </section>

        {/* 4. Recent Activities Ledger */}
        <section className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-medium text-neutral-900 text-base">
                Recent Dividend Activity
              </h3>
              <p className="text-xs text-neutral-400 font-normal">
                Onchain payouts and surplus extractions
              </p>
            </div>

            <button
              onClick={() => router.push("/activities")}
              className="text-xs text-[#007FFF] hover:underline font-normal flex items-center gap-0.5 cursor-pointer"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Activity items list */}
          <div className="space-y-1 divide-y divide-neutral-100">
            {activities.slice(0, 4).map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                onClick={(act) => setSelectedTx(act)}
              />
            ))}
          </div>
        </section>

        {/* Security & Non-Custodial Assurance Footer */}
        <footer className="pt-2 text-center text-xs text-neutral-400 font-normal flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>
            Non-custodial. Underlying equity shares remain 100% untouched.
          </span>
        </footer>
      </div>

      {/* --- Dashboard Modals --- */}

      {/* QR Code Sharing Modal */}
      <QRCodeModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        handle={profile.basename || "nebula.base.eth"}
      />

      {/* Transaction Receipt Modal */}
      <TxDetailModal
        isOpen={!!selectedTx}
        activity={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      {/* Onchain Corporate Dividend Simulator Modal */}
      <DividendSimModal
        isOpen={showSim}
        onClose={() => setShowSim(false)}
        onDividendSimulated={handleDividendSimulated}
      />

      {/* Avatar Emoji & Color Picker Modal */}
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
