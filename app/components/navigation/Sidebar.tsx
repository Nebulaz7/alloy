"use client";

import React from "react";
import {
  Home,
  Repeat,
  ReceiptText,
  Sparkles,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { AlloyLogo } from "@/components/brand/AlloyLogo";
import { AlloyBetaPromoCard } from "./AlloyBetaPromoCard";

export type NavTabId =
  | "dashboard"
  | "harvest"
  | "activities"
  | "simulator"
  | "settings";

export interface NavItemConfig {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "harvest", label: "Harvest Studio", icon: Repeat },
  { id: "activities", label: "Activities", icon: ReceiptText },
  { id: "simulator", label: "Simulator", icon: Sparkles, badge: "Base" },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  currentTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  showBetaLogo?: boolean;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  showBetaLogo = false,
  className = "",
}) => {
  return (
    <aside
      className={`w-64 h-screen sticky top-0 flex flex-col justify-between bg-white border-r border-neutral-200/80 px-4 py-6 select-none ${className}`}
    >
      {/* Top Brand & Navigation */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2">
          <AlloyLogo size="md" showBeta={showBetaLogo} />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? "bg-[#E0F2FE]/70 text-[#007FFF] font-medium shadow-2xs border border-[#BAE6FD]/60"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 font-normal border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-[#007FFF]" : "text-neutral-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-lg font-normal ${
                      isActive
                        ? "bg-[#007FFF] text-white"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo & Social Links */}
      <div className="pt-4 border-t border-neutral-100">
        <AlloyBetaPromoCard />
      </div>
    </aside>
  );
};
