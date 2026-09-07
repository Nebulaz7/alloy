"use client";

import React from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Repeat,
  ShieldCheck,
  FileText,
  Headphones,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "incoming" | "outgoing" | "harvest" | "swap";
  title: string;
  subtitle: string;
  amount: string;
  tokenSymbol: string;
  tags?: string[];
  note?: string;
  timestamp?: string;
  avatarBg?: string;
  avatarEmoji?: string;
  isPositive?: boolean;
  recipient?: string;
  multiplier?: string;
  txHash?: string;
}

interface ActivityRowProps {
  activity: ActivityItem;
  onClick?: (activity: ActivityItem) => void;
  className?: string;
}

export const ActivityRow: React.FC<ActivityRowProps> = ({
  activity,
  onClick,
  className = "",
}) => {
  const isPositive = activity.isPositive ?? activity.type !== "outgoing";

  return (
    <div
      onClick={() => onClick?.(activity)}
      className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl hover:bg-neutral-50/90 transition-all duration-150 gap-3 cursor-pointer select-none border border-transparent hover:border-neutral-200/60 ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Circular Avatar Container with Directional Badge (Pivy inspo) */}
        <div className="relative shrink-0">
          {/* Main Circular Avatar */}
          <div
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl shadow-2xs border border-neutral-200/80 transition-transform group-hover:scale-105"
            style={{ backgroundColor: activity.avatarBg || "#F3F4F6" }}
          >
            <span>{activity.avatarEmoji || (activity.type === "swap" ? "🤖" : activity.type === "harvest" ? "🍏" : "😉")}</span>
          </div>

          {/* Directional Icon Badge (Green Down-Arrow matching Screenshot 002928) */}
          <div
            className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-white shadow-xs ${
              activity.type === "swap"
                ? "bg-[#007FFF]"
                : isPositive
                ? "bg-[#10B981]"
                : "bg-neutral-800"
            }`}
          >
            {activity.type === "swap" ? (
              <Repeat className="w-2.5 h-2.5 stroke-[2.5]" />
            ) : isPositive ? (
              <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
            ) : (
              <ArrowUpRight className="w-2.5 h-2.5 stroke-[3]" />
            )}
          </div>
        </div>

        {/* Content & Metadata */}
        <div className="space-y-1 min-w-0">
          {/* Top Line: Counterparty / Action (e.g. Received from 0x402...3e94) */}
          <div className="text-xs text-neutral-400 font-normal truncate">
            {activity.title}
          </div>

          {/* Middle Line: Asset Title (e.g. PIVY Demo Token / Apple Dividend Surplus) */}
          <div className="font-heading font-medium text-neutral-900 text-sm sm:text-base truncate">
            {activity.subtitle}
          </div>

          {/* Tag Pills matching inspo */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {/* Memo Tag Pill (e.g. 🎧 personal or 🛡️ stealth payout) */}
            {activity.tags && activity.tags.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-normal border border-neutral-200/70">
                {activity.tags[0].includes("personal") ? (
                  <Headphones className="w-3 h-3 text-neutral-400" />
                ) : activity.tags[0].includes("stealth") ? (
                  <ShieldCheck className="w-3 h-3 text-[#007FFF]" />
                ) : (
                  <Sparkles className="w-3 h-3 text-[#10B981]" />
                )}
                <span>{activity.tags[0]}</span>
              </span>
            )}

            {/* Note Tag Pill (e.g. 📄 Here's a test token ...) */}
            {activity.note ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-normal border border-neutral-200/70 truncate max-w-[170px] sm:max-w-[220px]">
                <FileText className="w-3 h-3 text-neutral-400 shrink-0" />
                <span className="truncate">{activity.note}</span>
              </span>
            ) : activity.tags && activity.tags.length > 1 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-normal border border-neutral-200/70 truncate max-w-[170px] sm:max-w-[220px]">
                <FileText className="w-3 h-3 text-neutral-400 shrink-0" />
                <span className="truncate">{activity.tags[1]}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Amount Display in Emerald Green */}
      <div className="text-right shrink-0 flex items-center gap-2 pl-2">
        <div>
          <div
            className={`text-sm sm:text-base font-heading font-medium tracking-tight ${
              isPositive ? "text-[#10B981]" : "text-neutral-900"
            }`}
          >
            {isPositive ? `+ ${activity.amount}` : `- ${activity.amount}`}{" "}
            <span className="text-xs font-normal text-neutral-600">
              {activity.tokenSymbol}
            </span>
          </div>

          {activity.timestamp && (
            <div className="text-[11px] text-neutral-400 font-normal">
              {activity.timestamp}
            </div>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all hidden sm:block" />
      </div>
    </div>
  );
};
