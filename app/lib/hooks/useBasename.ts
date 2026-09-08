"use client";

import { useState } from "react";
import { usePublicClient, useAccount, useWriteContract } from "wagmi";
import { ALLOY_ADDRESSES } from "@/lib/contracts/addresses";
import { BASENAME_RESOLVER_ABI, L2_RESOLVER_ABI, ERC6538_REGISTRY_ABI } from "@/lib/contracts/abis";
import { formatBasename, computeNamehash } from "@/lib/crypto/namehash";

export interface BasenameResolution {
  name: string;
  stealthMetaAddress: string | null;
  canonicalAddress: `0x${string}` | null;
  isRegistered: boolean;
}

export function useBasename() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [isResolving, setIsResolving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

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

  /**
   * Checks if a Basename and stealth meta-address are published onchain to MockL2Resolver
   */
  const checkOnchainStatus = async (
    basename: string
  ): Promise<{ isPublished: boolean; resolvedAddr: string | null; stealthRecord: string | null }> => {
    if (!basename) return { isPublished: false, resolvedAddr: null, stealthRecord: null };
    try {
      const clean = formatBasename(basename);
      const node = computeNamehash(clean);
      if (!publicClient) return { isPublished: false, resolvedAddr: null, stealthRecord: null };

      const [resolvedAddr, textRecord] = await Promise.all([
        publicClient.readContract({
          address: ALLOY_ADDRESSES.contracts.Mock_L2Resolver,
          abi: L2_RESOLVER_ABI,
          functionName: "addr",
          args: [node],
        }) as Promise<string>,
        publicClient.readContract({
          address: ALLOY_ADDRESSES.contracts.Mock_L2Resolver,
          abi: L2_RESOLVER_ABI,
          functionName: "text",
          args: [node, "stealth"],
        }) as Promise<string>,
      ]);

      const isPublished =
        resolvedAddr !== "0x0000000000000000000000000000000000000000" &&
        Boolean(textRecord && textRecord.length > 10);

      return {
        isPublished,
        resolvedAddr,
        stealthRecord: textRecord || null,
      };
    } catch {
      return { isPublished: false, resolvedAddr: null, stealthRecord: null };
    }
  };

  /**
   * Publishes Basename resolution and ERC-5564 stealth text record to Base Sepolia
   */
  const publishOnchain = async ({
    basename,
    stealthMetaAddress,
  }: {
    basename: string;
    stealthMetaAddress: string;
  }): Promise<{ node: `0x${string}`; cleanBasename: string; txHash: `0x${string}` }> => {
    if (!address) throw new Error("Wallet not connected");

    setIsPublishing(true);
    setPublishError(null);

    try {
      const cleanBasename = formatBasename(basename);
      const node = computeNamehash(cleanBasename);

      // 1. Set canonical address on MockL2Resolver
      const setAddrTx = await writeContractAsync({
        address: ALLOY_ADDRESSES.contracts.Mock_L2Resolver,
        abi: L2_RESOLVER_ABI,
        functionName: "setAddr",
        args: [node, address],
      });
      await publicClient?.waitForTransactionReceipt({ hash: setAddrTx });

      // 2. Set stealth text record on MockL2Resolver
      const setTextTx = await writeContractAsync({
        address: ALLOY_ADDRESSES.contracts.Mock_L2Resolver,
        abi: L2_RESOLVER_ABI,
        functionName: "setText",
        args: [node, "stealth", stealthMetaAddress],
      });
      await publicClient?.waitForTransactionReceipt({ hash: setTextTx });

      // 3. Register stealth keys on ERC-6538 Registry
      try {
        const cleanHex = stealthMetaAddress.replace(/^st:eth:/, "");
        const hexValue = cleanHex.startsWith("0x") ? cleanHex : `0x${cleanHex}`;
        const regTx = await writeContractAsync({
          address: ALLOY_ADDRESSES.contracts.ERC6538_Registry,
          abi: ERC6538_REGISTRY_ABI,
          functionName: "registerKeys",
          args: [1n, hexValue as `0x${string}`],
        });
        await publicClient?.waitForTransactionReceipt({ hash: regTx });
      } catch {
        // Non-blocking ERC-6538 registration
      }

      return { node, cleanBasename, txHash: setTextTx };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish Basename onchain";
      setPublishError(msg);
      throw err;
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    resolve,
    checkAvailability,
    reverseResolve,
    checkOnchainStatus,
    publishOnchain,
    isResolving,
    isPublishing,
    publishError,
  };
}
