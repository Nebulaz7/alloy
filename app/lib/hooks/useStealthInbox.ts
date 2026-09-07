"use client";

import { useState, useCallback } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { formatUnits } from "viem";
import { ALLOY_ADDRESSES } from "@/lib/contracts/addresses";
import {
  ERC5564_ANNOUNCER_ABI,
  STEALTH_RELAYER_ABI,
  ERC20_PERMIT_ABI,
} from "@/lib/contracts/abis";
import { checkAnnouncement, computeStealthPrivateKey } from "@/lib/crypto/stealth";
import { useProfile } from "@/lib/store/profileStore";
import { useActivity } from "@/lib/store/activityStore";

export interface StealthPayment {
  stealthAddress: `0x${string}`;
  ephemeralPubKey: `0x${string}`;
  viewTag: number;
  tokenSymbol: string;
  tokenAddress: `0x${string}`;
  balance: string;
  rawBalance: bigint;
  caller: `0x${string}`;
  blockNumber: bigint;
}

export function useStealthInbox() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { profile } = useProfile();
  const { addActivity } = useActivity();

  const [payments, setPayments] = useState<StealthPayment[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSweeping, setIsSweeping] = useState<string | null>(null);

  /**
   * Scans Base Sepolia ERC5564Announcer logs for incoming stealth dividend payouts
   */
  const scanInbox = useCallback(async () => {
    if (!profile.stealthKeyPair && !ALLOY_ADDRESSES.demoAccounts.bob.stealthMetaAddress) {
      return;
    }

    setIsScanning(true);
    try {
      if (!publicClient) return;

      const keys = profile.stealthKeyPair;
      const viewingPrivKey = keys?.viewingPrivateKey || "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const spendingPubKey = keys?.spendingPublicKey || "0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";

      // Query latest 500 blocks for announcements
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock > 500n ? currentBlock - 500n : 0n;

      const logs = await publicClient.getContractEvents({
        address: ALLOY_ADDRESSES.contracts.ERC5564_Announcer,
        abi: ERC5564_ANNOUNCER_ABI,
        eventName: "Announcement",
        fromBlock,
      });

      const matched: StealthPayment[] = [];

      for (const log of logs) {
        const { stealthAddress, caller, ephemeralPubKey, metadata } = log.args;
        if (!stealthAddress || !ephemeralPubKey || !metadata) continue;

        // View tag is the first byte of metadata
        const viewTag = Number(metadata.slice(0, 4));

        const isMatch = checkAnnouncement(
          ephemeralPubKey,
          viewingPrivKey,
          viewTag,
          spendingPubKey,
          stealthAddress
        );

        if (isMatch) {
          // Check balance of Mock_USDC on stealth address
          const usdcBalance = (await publicClient.readContract({
            address: ALLOY_ADDRESSES.contracts.Mock_USDC,
            abi: ERC20_PERMIT_ABI,
            functionName: "balanceOf",
            args: [stealthAddress],
          })) as bigint;

          if (usdcBalance > 0n) {
            matched.push({
              stealthAddress,
              ephemeralPubKey,
              viewTag,
              tokenSymbol: "USDC",
              tokenAddress: ALLOY_ADDRESSES.contracts.Mock_USDC,
              balance: formatUnits(usdcBalance, 6),
              rawBalance: usdcBalance,
              caller: caller || "0x0000000000000000000000000000000000000000",
              blockNumber: log.blockNumber || 0n,
            });
          }
        }
      }

      setPayments(matched);
    } catch {
      // Scan fallback
    } finally {
      setIsScanning(false);
    }
  }, [profile.stealthKeyPair, publicClient]);

  /**
   * Sweeps funds from a 0-ETH stealth address to the user's primary wallet via AlloyStealthRelayer
   */
  const sweepPayment = async (payment: StealthPayment) => {
    if (!address) throw new Error("Wallet not connected");

    setIsSweeping(payment.stealthAddress);
    try {
      // Direct sweep via Relayer
      const hash = await writeContractAsync({
        address: ALLOY_ADDRESSES.contracts.Alloy_StealthRelayer,
        abi: STEALTH_RELAYER_ABI,
        functionName: "sweepERC20",
        args: [payment.tokenAddress, payment.stealthAddress, address, payment.rawBalance],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Record activity
      addActivity({
        type: "incoming",
        title: "Gasless Stealth Sweep",
        subtitle: `Swept ${payment.balance} ${payment.tokenSymbol}`,
        amount: payment.balance,
        tokenSymbol: payment.tokenSymbol,
        tags: ["stealth payout", "gasless sweep"],
        note: `Transferred to ${address.slice(0, 6)}...${address.slice(-4)}`,
        recipient: address,
        avatarEmoji: "🚀",
        avatarBg: "#F0FDF4",
        isPositive: true,
        txHash: hash,
      });

      // Remove from unclaimed list
      setPayments((prev) => prev.filter((p) => p.stealthAddress !== payment.stealthAddress));
      return hash;
    } finally {
      setIsSweeping(null);
    }
  };

  const totalUnclaimedUsd = payments.reduce((acc, p) => acc + parseFloat(p.balance || "0"), 0);

  return {
    payments,
    totalUnclaimedUsd: totalUnclaimedUsd.toFixed(2),
    isScanning,
    isSweeping,
    scanInbox,
    sweepPayment,
  };
}
