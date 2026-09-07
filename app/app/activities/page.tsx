"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  Search,
  X,
  Download,
  Repeat,
  Sparkles,
  ShieldCheck,
  Filter,
  ReceiptText,
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { NavTabId } from "@/components/navigation/Sidebar";
import { Button } from "@/components/ui/Button";
import { ActivityRow, ActivityItem } from "@/components/ui/ActivityRow";
import { DividendAnalyticsChart, TimeRange } from "@/components/analytics/DividendAnalyticsChart";
import { TxDetailModal } from "@/components/modals/TxDetailModal";
import { DividendSimModal } from "@/components/modals/DividendSimModal";
import { EmojiColorPickerModal } from "@/components/profile/EmojiColorPickerModal";
import { useProfile } from "@/lib/store/profileStore";
import { useActivity, exportActivitiesToCSV } from "@/lib/store/activityStore";
import { useAlloyStocks } from "@/lib/hooks/useAlloyStocks";
import { openReownModal } from "@/lib/wagmi";

type FilterType = "all" | "harvest" | "incoming" | "outgoing" | "swap";

export default function ActivitiesPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { profile, updateProfile } = useProfile();
  const { activities, isHydrated, isPreview } = useActivity();
  const { totalDividendsEarned, availableToHarvest, refetch: refetchStocks } = useAlloyStocks();

  // Component state
  const [selectedTx, setSelectedTx] = useState<ActivityItem | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [assetFilter, setAssetFilter] = useState<"ALL" | "AAPLc" | "NVDAc" | "COINc">("ALL");
  const [copiedCsv, setCopiedCsv] = useState(false);

  // Tab switching handler
  const handleTabChange = (tab: NavTabId) => {
    if (tab === "activities") return;
    if (tab === "dashboard") router.push("/dashboard");
    else if (tab === "harvest") router.push("/harvest");
    else if (tab === "simulator") router.push("/simulator");
    else if (tab === "settings") router.push("/settings");
  };

  // Filtered activities computation
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Type filter
      if (activeFilter !== "all" && act.type !== activeFilter) {
        return false;
      }

      // Asset filter
      if (assetFilter !== "ALL") {
        const textToMatch = `${act.title} ${act.subtitle} ${act.note || ""} ${act.tokenSymbol}`.toUpperCase();
        if (!textToMatch.includes(assetFilter.toUpperCase())) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = act.title?.toLowerCase().includes(query);
        const matchesSubtitle = act.subtitle?.toLowerCase().includes(query);
        const matchesNote = act.note?.toLowerCase().includes(query);
        const matchesRecipient = act.recipient?.toLowerCase().includes(query);
        const matchesTxHash = act.txHash?.toLowerCase().includes(query);
        const matchesToken = act.tokenSymbol?.toLowerCase().includes(query);
        const matchesTag = act.tags?.some((t) => t.toLowerCase().includes(query));

        if (
          !matchesTitle &&
          !matchesSubtitle &&
          !matchesNote &&
          !matchesRecipient &&
          !matchesTxHash &&
          !matchesToken &&
          !matchesTag
        ) {
          return false;
        }
      }

      return true;
    });
  }, [activities, activeFilter, assetFilter, searchQuery]);

  // Group filtered activities chronologically
  const grouped = useMemo(() => {
    const today: ActivityItem[] = [];
    const yesterday: ActivityItem[] = [];
    const earlier: ActivityItem[] = [];

    filteredActivities.forEach((item) => {
      const ts = (item.timestamp || "").toLowerCase();
      if (
        ts.includes("m ago") ||
        ts.includes("h ago") ||
        ts.includes("just now") ||
        ts.includes("today") ||
        ts.includes("s ago")
      ) {
        today.push(item);
      } else if (ts.includes("yesterday") || ts.includes("1d ago")) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { today, yesterday, earlier };
  }, [filteredActivities]);

  // Count by category for filter pill badges
  const categoryCounts = useMemo(() => {
    const counts = {
      all: activities.length,
      harvest: 0,
      incoming: 0,
      outgoing: 0,
      swap: 0,
    };
    activities.forEach((act) => {
      if (act.type in counts) {
        counts[act.type as keyof typeof counts]++;
      }
    });
    return counts;
  }, [activities]);

  // CSV Export action
  const handleExportCSV = () => {
    const filename = `alloy_activities_${new Date().toISOString().slice(0, 10)}.csv`;
    exportActivitiesToCSV(filteredActivities.length > 0 ? filteredActivities : activities, filename);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2200);
  };

  return (
    <AppShell
      activeTab="activities"
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
                You are in <strong>Preview Mode</strong>. Connect a Base wallet to record live stealth dividend distributions.
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

        {/* 2. Top Cumulative Dividends Analytics Chart */}
        <section>
          <DividendAnalyticsChart
            title="Portfolio Dividend Analytics"
            initialRange="1M"
            customTotalAmount={totalDividendsEarned}
            isPreview={isPreview}
            onAssetChange={(asset) => setAssetFilter(asset)}
          />
        </section>

        {/* 3. Summary Metric Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Metric 1: Extracted / Ready */}
          <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-1">
            <div className="text-xs text-neutral-400 font-normal">Ready to Harvest</div>
            <div className="font-heading font-medium text-lg sm:text-xl text-[#10B981] truncate">
              {availableToHarvest}
            </div>
            <div className="text-[11px] text-neutral-500 font-normal flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Live onchain surplus</span>
            </div>
          </div>

          {/* Metric 2: Logged Activities */}
          <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-1">
            <div className="text-xs text-neutral-400 font-normal">Total Recorded</div>
            <div className="font-heading font-medium text-lg sm:text-xl text-neutral-900">
              {activities.length} {activities.length === 1 ? "Tx" : "Txs"}
            </div>
            <div className="text-[11px] text-neutral-500 font-normal flex items-center gap-1">
              <span>{filteredActivities.length} matching filter</span>
            </div>
          </div>

          {/* Metric 3: Stealth Privacy Rail */}
          <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-1">
            <div className="text-xs text-neutral-400 font-normal">Privacy Rail</div>
            <div className="font-heading font-medium text-lg sm:text-xl text-[#007FFF] flex items-center gap-1 truncate">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>ERC-5564</span>
            </div>
            <div className="text-[11px] text-neutral-500 font-normal truncate">
              Non-custodial stealth
            </div>
          </div>

          {/* Metric 4: Settlement Layer */}
          <div className="p-4 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-1">
            <div className="text-xs text-neutral-400 font-normal">Settlement Layer</div>
            <div className="font-heading font-medium text-lg sm:text-xl text-neutral-900 flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse" />
              <span>Base Sepolia</span>
            </div>
            <div className="text-[11px] text-neutral-500 font-normal truncate">
              Sub-cent gas fees
            </div>
          </div>
        </section>

        {/* 4. Filter & Search Controls Card */}
        <section className="p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions, notes, tokens, or hashes..."
                className="w-full pl-9 pr-9 py-2 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#007FFF]/20 focus:border-[#007FFF] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action Buttons: Export CSV & Quick Harvest */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="cursor-pointer text-xs rounded-2xl"
                leftIcon={
                  copiedCsv ? (
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-neutral-500" />
                  )
                }
              >
                {copiedCsv ? (
                  <span className="text-[#10B981]">Downloaded</span>
                ) : (
                  <span>Export CSV</span>
                )}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/harvest")}
                className="cursor-pointer text-xs rounded-2xl"
                leftIcon={<Repeat className="w-3.5 h-3.5" />}
              >
                <span>Harvest</span>
              </Button>
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100">
            <span className="text-xs text-neutral-400 font-normal mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>

            {[
              { id: "all", label: "All", count: categoryCounts.all },
              { id: "harvest", label: "Harvests", icon: "🌾", count: categoryCounts.harvest },
              { id: "incoming", label: "Incoming", icon: "📥", count: categoryCounts.incoming },
              { id: "outgoing", label: "Outgoing", icon: "📤", count: categoryCounts.outgoing },
              { id: "swap", label: "Swaps", icon: "🤖", count: categoryCounts.swap },
            ].map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as FilterType)}
                  className={`px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#E0F2FE] text-[#007FFF] font-medium border border-[#BAE6FD] shadow-2xs"
                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200/60 font-normal"
                  }`}
                >
                  {tab.icon && <span>{tab.icon}</span>}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-[#007FFF] text-white"
                        : "bg-neutral-200/70 text-neutral-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}

            {assetFilter !== "ALL" && (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                <span>Asset: {assetFilter}</span>
                <button
                  onClick={() => setAssetFilter("ALL")}
                  className="hover:text-[#166534] cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </section>

        {/* 5. Grouped Activities Feed */}
        <section className="space-y-6">
          {/* Today Group */}
          {grouped.today.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
                  Today
                </span>
                <span className="text-[11px] text-neutral-400 font-normal">
                  {grouped.today.length} {grouped.today.length === 1 ? "transaction" : "transactions"}
                </span>
              </div>
              <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
                {grouped.today.map((item) => (
                  <ActivityRow
                    key={item.id}
                    activity={item}
                    onClick={(act) => setSelectedTx(act)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday Group */}
          {grouped.yesterday.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
                  Yesterday
                </span>
                <span className="text-[11px] text-neutral-400 font-normal">
                  {grouped.yesterday.length} {grouped.yesterday.length === 1 ? "transaction" : "transactions"}
                </span>
              </div>
              <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
                {grouped.yesterday.map((item) => (
                  <ActivityRow
                    key={item.id}
                    activity={item}
                    onClick={(act) => setSelectedTx(act)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {grouped.earlier.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-heading font-medium uppercase tracking-wider text-neutral-400">
                  Earlier
                </span>
                <span className="text-[11px] text-neutral-400 font-normal">
                  {grouped.earlier.length} {grouped.earlier.length === 1 ? "transaction" : "transactions"}
                </span>
              </div>
              <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
                {grouped.earlier.map((item) => (
                  <ActivityRow
                    key={item.id}
                    activity={item}
                    onClick={(act) => setSelectedTx(act)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State: No activities found */}
          {filteredActivities.length === 0 && isHydrated && (
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-8 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-[#E0F2FE] text-[#007FFF] flex items-center justify-center mx-auto text-2xl shadow-xs">
                <ReceiptText className="w-7 h-7 stroke-[1.75]" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-heading font-medium text-base sm:text-lg text-neutral-900">
                  {searchQuery || activeFilter !== "all" || assetFilter !== "ALL"
                    ? "No Matching Transactions"
                    : "No Dividend Activities Yet"}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
                  {searchQuery || activeFilter !== "all" || assetFilter !== "ALL"
                    ? "Try adjusting your search terms or clearing the active category filters to see more results."
                    : isConnected
                    ? "Your connected wallet has no recorded dividend extractions on Base Sepolia. Harvest surplus from tokenized stocks or run a corporate payout simulation to generate live onchain receipts."
                    : "Connect your Coinbase Smart Wallet or Web3 wallet to execute and track real onchain dividend distributions."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {searchQuery || activeFilter !== "all" || assetFilter !== "ALL" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("all");
                      setAssetFilter("ALL");
                    }}
                    className="cursor-pointer"
                  >
                    Reset Filters
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push("/harvest")}
                      className="cursor-pointer"
                      leftIcon={<Repeat className="w-3.5 h-3.5" />}
                    >
                      <span>Harvest Dividends</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSimModal(true)}
                      className="cursor-pointer"
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#007FFF]" />}
                    >
                      <span>Simulate Payout</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 6. Quick Action Callout Footer */}
        <section className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-[#E0F2FE]/60 via-white to-[#DCFCE7]/50 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="font-heading font-medium text-sm text-neutral-900 flex items-center gap-2">
                <span>Want to test dividend distributions?</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-medium border border-[#BBF7D0]">
                  Corporate Action
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-normal mt-0.5">
                Simulate a cash dividend payout on Base Sepolia to increase stock multipliers and harvest instant yield.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSimModal(true)}
            className="shrink-0 cursor-pointer text-xs rounded-2xl bg-white hover:bg-neutral-50"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#007FFF]" />}
          >
            <span>Simulate Corporate Payout</span>
          </Button>
        </section>
      </div>

      {/* Transaction Detail Receipt Modal */}
      {selectedTx && (
        <TxDetailModal
          isOpen={!!selectedTx}
          activity={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}

      {/* Dividend Simulation Modal */}
      {showSimModal && (
        <DividendSimModal
          isOpen={showSimModal}
          onClose={() => setShowSimModal(false)}
          onDividendSimulated={async () => {
            await refetchStocks();
          }}
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
