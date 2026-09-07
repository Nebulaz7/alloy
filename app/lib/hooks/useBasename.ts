"use client";

import { useState } from "react";
import { usePublicClient } from "wagmi";
import { ALLOY_ADDRESSES } from "@/lib/contracts/addresses";
import { BASENAME_RESOLVER_ABI } from "@/lib/contracts/abis";
import { formatBasename } from "@/lib/crypto/namehash";

export interface BasenameResolution {
  name: string;
  stealthMetaAddress: string | null;
  canonicalAddress: `0x${string}` | null;
  isRegistered: boolean;
}

export function useBasename() {
  const publicClient = usePublicClient();
  const [isResolving, setIsResolving] = useState(false);

  /**
   * Resolves a Basename to its ERC-5564 stealth meta-address and registered owner
   */
  const resolve = async (name: string): Promise<BasenameResolution> => {
    if (!name || name.trim() === "") {
      return { name, stealthMetaAddress: null, canonicalAddress: null, isRegistered: false };
    }

    const formattedName = formatBasename(name);

    // Fast-path demo account
    if (formattedName === "bob.base.eth") {
      return {
        name: formattedName,
        stealthMetaAddress: ALLOY_ADDRESSES.demoAccounts.bob.stealthMetaAddress,
        canonicalAddress: ALLOY_ADDRESSES.demoAccounts.bob.address,
        isRegistered: true,
      };
    }

    setIsResolving(true);
    try {
      if (!publicClient) {
        return { name: formattedName, stealthMetaAddress: null, canonicalAddress: null, isRegistered: false };
      }

      const res = (await publicClient.readContract({
        address: ALLOY_ADDRESSES.contracts.Alloy_BasenameResolver,
        abi: BASENAME_RESOLVER_ABI,
        functionName: "resolveBasename",
        args: [formattedName],
      })) as [string, `0x${string}`];

      const stealthMetaHex = res[0];
      const canonicalAddr = res[1];

      const isRegistered = canonicalAddr !== "0x0000000000000000000000000000000000000000";

      return {
        name: formattedName,
        stealthMetaAddress: stealthMetaHex && stealthMetaHex !== "0x" ? stealthMetaHex : null,
        canonicalAddress: isRegistered ? canonicalAddr : null,
        isRegistered,
      };
    } catch {
      return { name: formattedName, stealthMetaAddress: null, canonicalAddress: null, isRegistered: false };
    } finally {
      setIsResolving(false);
    }
  };

  /**
   * Checks if a Basename is available to claim
   */
  const checkAvailability = async (name: string): Promise<boolean> => {
    if (!name || name.trim().length < 3) return false;
    const formatted = formatBasename(name);
    if (formatted === "bob.base.eth") return false;

    try {
      if (!publicClient) return true;
      const available = (await publicClient.readContract({
        address: ALLOY_ADDRESSES.contracts.Alloy_BasenameResolver,
        abi: BASENAME_RESOLVER_ABI,
        functionName: "isNameAvailable",
        args: [formatted],
      })) as boolean;
      return available;
    } catch {
      return true;
    }
  };

  /**
   * Reverse resolves an address to a Basename
   */
  const reverseResolve = async (addr: `0x${string}`): Promise<string | null> => {
    try {
      if (!publicClient) return null;
      const name = (await publicClient.readContract({
        address: ALLOY_ADDRESSES.contracts.Alloy_BasenameResolver,
        abi: BASENAME_RESOLVER_ABI,
        functionName: "reverseResolve",
        args: [addr],
      })) as string;
      return name && name !== "" ? name : null;
    } catch {
      return null;
    }
  };

  return {
    resolve,
    checkAvailability,
    reverseResolve,
    isResolving,
  };
}
