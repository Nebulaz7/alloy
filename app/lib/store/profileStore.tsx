"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { generateStealthKeyPair, StealthKeyPair } from "@/lib/crypto/stealth";

export interface UserProfile {
  username: string;
  basename: string;
  avatarEmoji: string;
  avatarBg: string;
  address: string;
  isVerified: boolean;
  currency: "USD" | "EUR" | "NGN" | "GBP";
  currencySymbol: string;
  stealthKeyPair: StealthKeyPair | null;
  isClaimed: boolean;
}

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => void;
  loadProfileForAddress: (addr: string) => boolean;
  setCurrency: (curr: "USD" | "EUR" | "NGN" | "GBP") => void;
  resetProfile: () => void;
  isHydrated: boolean;
}

const CURRENCY_SYMBOLS: Record<UserProfile["currency"], string> = {
  USD: "$",
  EUR: "€",
  NGN: "₦",
  GBP: "£",
};

const DEFAULT_PROFILE: UserProfile = {
  username: "nebula",
  basename: "nebula.base.eth",
  avatarEmoji: "🎧",
  avatarBg: "#18181B",
  address: "0xD5687794c8E1b69F477911Df56170679CB6414eC",
  isVerified: true,
  currency: "USD",
  currencySymbol: "$",
  stealthKeyPair: null,
  isClaimed: true,
};

const STORAGE_KEY = "alloy_profile_v1";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile((prev) => ({
          ...prev,
          ...parsed,
          currencySymbol: CURRENCY_SYMBOLS[parsed.currency as UserProfile["currency"]] || "$",
        }));
      } else {
        // Auto-generate initial stealth keypair for new users
        const newKeys = generateStealthKeyPair();
        setProfile((prev) => {
          const updated = { ...prev, stealthKeyPair: newKeys };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      // LocalStorage unavailable
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const updateProfile = React.useCallback((data: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...data };
      if (data.username && !data.basename) {
        updated.basename = `${data.username.replace(/\.base\.eth$/, "")}.base.eth`;
      }
      if (data.currency) {
        updated.currencySymbol = CURRENCY_SYMBOLS[data.currency] || "$";
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (updated.address) {
          localStorage.setItem(`alloy_profile_${updated.address.toLowerCase()}`, JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
  }, []);

  const loadProfileForAddress = React.useCallback((addr: string): boolean => {
    if (!addr) return false;
    try {
      const perAddressKey = `alloy_profile_${addr.toLowerCase()}`;
      const stored = localStorage.getItem(perAddressKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile((prev) => ({
          ...prev,
          ...parsed,
          address: addr,
          isClaimed: true,
        }));
        return true;
      } else {
        // Fresh address without a saved profile
        const freshKeys = generateStealthKeyPair();
        setProfile((prev) => ({
          ...prev,
          username: "",
          basename: "",
          address: addr,
          isVerified: false,
          isClaimed: false,
          stealthKeyPair: freshKeys,
        }));
        return false;
      }
    } catch {
      return false;
    }
  }, []);

  const setCurrency = React.useCallback((currency: UserProfile["currency"]) => {
    updateProfile({ currency, currencySymbol: CURRENCY_SYMBOLS[currency] });
  }, [updateProfile]);

  const resetProfile = React.useCallback(() => {
    const freshKeys = generateStealthKeyPair();
    const fresh = { ...DEFAULT_PROFILE, stealthKeyPair: freshKeys };
    setProfile(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        loadProfileForAddress,
        setCurrency,
        resetProfile,
        isHydrated,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
