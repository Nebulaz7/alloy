"use client";

import React from "react";
import { Home, Repeat, ReceiptText, Sparkles, Settings } from "lucide-react";
import { NavTabId, NAV_ITEMS } from "./Sidebar";

interface MobileBottomDockProps {
  currentTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  className?: string;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  currentTab,
  onTabChange,
  className = "",
}) => {
  return (
    <div
      className={`fixed bottom-4 inset-x-4 max-w-md mx-auto z-50 select-none md:hidden ${className}`}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-[32px] border border-neutral-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.08)] px-3 py-1.5 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? "w-14 h-12 rounded-2xl bg-[#E0F2FE] text-[#007FFF] shadow-2xs border border-[#BAE6FD]"
                  : "w-11 h-12 rounded-2xl text-neutral-400 hover:text-neutral-700"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? "scale-110 text-[#007FFF]" : "text-neutral-400"
                }`}
              />

              {/* Little subtle indicator dot on active */}
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#007FFF]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
