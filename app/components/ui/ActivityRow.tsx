"use client";

import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "incoming" | "outgoing" | "harvest" | "swap";
  title: string;
  subtitle: string;
  amount: string;
  tokenSymbol: string;
  tags?: string[];
  timestamp?: string;
  avatarBg?: string;
  isPositive?: boolean;
}

interface ActivityRowProps {
  activity: ActivityItem;
  className?: string;
}

export const ActivityRow: React.FC<ActivityRowProps> = ({ activity, className = "" }) => {
  const isPositive = activity.isPositive ?? activity.type !== "outgoing";

  return (
    <div
      className={`flex items-start justify-between p-3 rounded-2xl hover:bg-white hover:shadow-2xs transition-all duration-150 gap-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Rounded Avatar with Directional Badge */}
        <div className="relative shrink-0 mt-0.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-medium text-xs text-neutral-700 border border-neutral-200"
            style={{ backgroundColor: activity.avatarBg || "#F3F4F6" }}
          >
            {activity.title.slice(0, 2).toUpperCase()}
          </div>

          {/* Directional Icon Badge */}
          <div
            className={`absolute -top-1 -left-1 w-4 h-4 rounded-md flex items-center justify-center text-white border border-white ${
              isPositive ? "bg-[#10B981]" : "bg-neutral-800"
            }`}
          >
            {isPositive ? (
              <ArrowDownLeft className="w-2.5 h-2.5 stroke-[3]" />
            ) : (
              <ArrowUpRight className="w-2.5 h-2.5 stroke-[3]" />
            )}
          </div>
        </div>

        {/* Content & Metadata */}
        <div className="space-y-0.5">
          <div className="text-xs text-neutral-400 font-normal">
            {activity.title}
          </div>
          <div className="font-heading font-medium text-neutral-900 text-sm">
            {activity.subtitle}
          </div>

          {/* Tag Pills */}
          {activity.tags && activity.tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {activity.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-600 text-[10px] font-normal border border-neutral-200/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Amount Display */}
      <div className="text-right shrink-0">
        <div
          className={`text-sm font-heading font-medium ${
            isPositive ? "text-[#10B981]" : "text-neutral-900"
          }`}
        >
          {isPositive ? `+ ${activity.amount}` : `- ${activity.amount}`}{" "}
          <span className="text-xs font-normal text-neutral-500">{activity.tokenSymbol}</span>
        </div>
        {activity.timestamp && (
          <div className="text-[11px] text-neutral-400 font-normal">
            {activity.timestamp}
          </div>
        )}
      </div>
    </div>
  );
};
