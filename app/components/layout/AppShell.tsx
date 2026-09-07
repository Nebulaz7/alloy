"use client";

import React, { useState } from "react";
import { Sidebar, NavTabId, NAV_ITEMS } from "@/components/navigation/Sidebar";
import { MobileBottomDock } from "@/components/navigation/MobileBottomDock";
import { AppHeader } from "@/components/navigation/AppHeader";

interface AppShellProps {
  children?: React.ReactNode;
  activeTab?: NavTabId;
  onTabChange?: (tab: NavTabId) => void;
  showBetaLogo?: boolean;
}

const TAB_TITLES: Record<NavTabId, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Private Programmable Dividend Harvesting on Base",
  },
  harvest: {
    title: "Harvest Studio",
    subtitle: "Extract Surplus Yield Without Touching Principal",
  },
  activities: {
    title: "Activities",
    subtitle: "Stealth Payouts & Dividend History",
  },
  simulator: {
    title: "Dividend Simulator",
    subtitle: "Simulate Corporate Stock Dividend Events on Base Sepolia",
  },
  settings: {
    title: "Settings",
    subtitle: "Account, Preferences & Connected Wallets",
  },
};

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeTab: externalTab,
  onTabChange: externalOnTabChange,
  showBetaLogo = false,
}) => {
  const [internalTab, setInternalTab] = useState<NavTabId>("dashboard");

  const currentTab = externalTab !== undefined ? externalTab : internalTab;
  const handleTabChange = (tab: NavTabId) => {
    if (externalOnTabChange) {
      externalOnTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const currentMeta = TAB_TITLES[currentTab] || TAB_TITLES.dashboard;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-neutral-900 flex flex-row">
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        showBetaLogo={showBetaLogo}
        className="hidden md:flex shrink-0"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* App Top Header */}
        <AppHeader
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          connectedHandle="bob.base.eth"
        />

        {/* Page Content Centered Column */}
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-12 space-y-6">
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Dock (hidden on desktop) */}
      <MobileBottomDock
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};
