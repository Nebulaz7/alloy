"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityItem } from "@/components/ui/ActivityRow";

interface ActivityContextType {
  activities: ActivityItem[];
  addActivity: (activity: Omit<ActivityItem, "id" | "timestamp"> & { timestamp?: string }) => void;
  clearActivities: () => void;
  isHydrated: boolean;
}

const STORAGE_KEY = "alloy_activity_v1";

const SEED_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "harvest",
    title: "Harvested from AAPLc",
    subtitle: "Apple Dividend Surplus",
    amount: "75.00",
    tokenSymbol: "USDC",
    tags: ["harvest", "stealth payout"],
    note: "Corporate multiplier +1.25% yield",
    timestamp: "10m ago",
    avatarBg: "#E0F2FE",
    avatarEmoji: "🍏",
    isPositive: true,
    recipient: "st:eth:0x0279b...9ee5",
    multiplier: "1.025x",
    txHash: "0x7f4a28b9c1048e910248a339948c2014e0b1928437bb9201948ba10283c7193a",
  },
  {
    id: "act-2",
    type: "swap",
    title: "Aped Dividend to $CLANKER",
    subtitle: "DEX Meme Auto-Route",
    amount: "50.0",
    tokenSymbol: "CLANKER",
    tags: ["swap", "personal"],
    note: "Diverted $250.00 NVDA dividend",
    timestamp: "2h ago",
    avatarBg: "#F3E8FF",
    avatarEmoji: "🤖",
    isPositive: true,
    recipient: "0xeca6Ff5Ce16bf15E38a4F28DE6da2397438f7918",
    txHash: "0x4c0883a69102934a6210492810482014b9281048201948201948201481920481",
  },
  {
    id: "act-3",
    type: "incoming",
    title: "Received from bob.base.eth",
    subtitle: "Private Remittance",
    amount: "100.00",
    tokenSymbol: "cNGN",
    tags: ["stealth payout", "personal"],
    note: "Unlinkable ERC-5564 stealth claim",
    timestamp: "Yesterday",
    avatarBg: "#DCFCE7",
    avatarEmoji: "🇳🇬",
    isPositive: true,
    recipient: "0x00000000000000000000000000000000000B0b01",
    txHash: "0x9182048102948102948102948102948102948102948102948102948102948102",
  },
];

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<ActivityItem[]>(SEED_ACTIVITIES);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setActivities(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ACTIVITIES));
      }
    } catch {
      // LocalStorage unavailable
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const addActivity = (
    item: Omit<ActivityItem, "id" | "timestamp"> & { timestamp?: string }
  ) => {
    const newItem: ActivityItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: item.timestamp || "Just now",
    };

    setActivities((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearActivities = () => {
    setActivities([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        addActivity,
        clearActivities,
        isHydrated,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
