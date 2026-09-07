"use client";

import React from "react";

export interface FilterTabOption {
  id: string;
  label: string;
}

interface FilterTabsProps {
  options?: FilterTabOption[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  rightAction?: React.ReactNode;
  className?: string;
}

const defaultOptions: FilterTabOption[] = [
  { id: "all", label: "All" },
  { id: "incoming", label: "Incoming" },
  { id: "outgoing", label: "Outgoing" },
  { id: "gifts", label: "Gifts" },
];

export const FilterTabs: React.FC<FilterTabsProps> = ({
  options = defaultOptions,
  activeTab,
  onSelectTab,
  rightAction,
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-between gap-3 overflow-x-auto select-none ${className}`}>
      {/* Rectangular Rounded Tabs List */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100/80 border border-neutral-200/50">
        {options.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-[#111827] text-white shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 font-normal"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right Action */}
      {rightAction ? <div className="shrink-0">{rightAction}</div> : null}
    </div>
  );
};
