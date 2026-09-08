"use client";

import { useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseUnits } from "viem";
import { ALLOY_ADDRESSES, SupportedStockSymbol } from "@/lib/contracts/addresses";
import { HARVEST_ROUTER_ABI, B20_STOCK_ABI } from "@/lib/contracts/abis";
import { generateStealthAddress, parseStealthMetaAddress } from "@/lib/crypto/stealth";
import { useActivity } from "@/lib/store/activityStore";

export interface HarvestParams {
  stockSymbol: SupportedStockSymbol;
  destinationCurrency: "USDC" | "cNGN" | "CLANKER" | "HIGHER" | "DEGEN";
  recipient: string; // "self", "0x...", "bob.base.eth", or "st:eth:..."
  stealthMetaAddress?: string;
  minAmountOut?: string;
  estimatedAmount?: string;
}

export function useHarvest() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { addActivity } = useActivity();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeHarvest = async (params: HarvestParams) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    setIsPending(true);
    setError(null);

    try {
      const stockAddress =
        params.stockSymbol === "AAPLc"
          ? ALLOY_ADDRESSES.contracts.MockB20_AAPLc
          : params.stockSymbol === "NVDAc"
          ? ALLOY_ADDRESSES.contracts.MockB20_NVDAc
          : ALLOY_ADDRESSES.contracts.MockB20_COINc;

      // 1. Ensure allowance for Router
      const routerAddress = ALLOY_ADDRESSES.contracts.Alloy_HarvestRouter;
      const allowance = (await publicClient?.readContract({
        address: stockAddress,
        abi: B20_STOCK_ABI,
        functionName: "allowance",
        args: [address, routerAddress],
      })) as bigint | undefined;

      if (!allowance || allowance === 0n) {
        const approveTx = await writeContractAsync({
          address: stockAddress,
          abi: B20_STOCK_ABI,
          functionName: "approve",
          args: [routerAddress, parseUnits("1000000", 18)],
        });
        await publicClient?.waitForTransactionReceipt({ hash: approveTx });
      }

      let txHash: `0x${string}`;
      let finalRecipient = params.recipient;
      let stealthDetails: ReturnType<typeof generateStealthAddress> | null = null;

      const isStealth =
        params.recipient.startsWith("st:eth:") ||
        params.recipient.endsWith(".base.eth") ||
        params.stealthMetaAddress;

      // Resolve stealth meta-address if applicable
      const metaAddr =
        params.stealthMetaAddress ||
        (params.recipient.startsWith("st:eth:") ? params.recipient : null) ||
        ALLOY_ADDRESSES.demoAccounts.bob.stealthMetaAddress;

      if (isStealth && metaAddr) {
        const { spendingPubKey, viewingPubKey } = parseStealthMetaAddress(metaAddr);
        stealthDetails = generateStealthAddress(spendingPubKey, viewingPubKey);
        finalRecipient = stealthDetails.stealthAddress;
      } else if (params.recipient === "self" || !params.recipient) {
        finalRecipient = address;
      }

      // 2. Dispatch to specific Router function
      if (params.destinationCurrency === "USDC" || params.destinationCurrency === "cNGN") {
        const targetToken =
          params.destinationCurrency === "USDC"
            ? ALLOY_ADDRESSES.contracts.Mock_USDC
            : ALLOY_ADDRESSES.contracts.Mock_cNGN;

        if (stealthDetails) {
          const metadata = `0x${stealthDetails.viewTag.toString(16).padStart(2, "0")}` as `0x${string}`;
          txHash = await writeContractAsync({
            address: routerAddress,
            abi: HARVEST_ROUTER_ABI,
            functionName: "harvestToStealth",
            args: [
              stockAddress,
              targetToken,
              0n, // minTargetAmount
              stealthDetails.stealthAddress,
              stealthDetails.ephemeralPubKey,
              metadata,
            ],
          });
        } else {
          txHash = await writeContractAsync({
            address: routerAddress,
            abi: HARVEST_ROUTER_ABI,
            functionName: "harvestToTarget",
            args: [
              stockAddress,
              targetToken,
              0n, // minTargetAmount
              finalRecipient as `0x${string}`,
            ],
          });
        }
      } else {
        // Meme token routing ($CLANKER, $HIGHER, $DEGEN)
        const memeAddress =
          params.destinationCurrency === "CLANKER"
            ? ALLOY_ADDRESSES.contracts.Mock_CLANKER
            : params.destinationCurrency === "HIGHER"
            ? ALLOY_ADDRESSES.contracts.Mock_HIGHER
            : ALLOY_ADDRESSES.contracts.Mock_DEGEN;

        if (stealthDetails) {
          const metadata = `0x${stealthDetails.viewTag.toString(16).padStart(2, "0")}` as `0x${string}`;
          txHash = await writeContractAsync({
            address: routerAddress,
            abi: HARVEST_ROUTER_ABI,
            functionName: "harvestToStealthMeme",
            args: [
              stockAddress,
              memeAddress,
              0n, // minMemeAmount
              stealthDetails.stealthAddress,
              stealthDetails.ephemeralPubKey,
              metadata,
            ],
          });
        } else {
          txHash = await writeContractAsync({
            address: routerAddress,
            abi: HARVEST_ROUTER_ABI,
            functionName: "harvestToMeme",
            args: [
              stockAddress,
              memeAddress,
              0n, // minMemeAmount
              finalRecipient as `0x${string}`,
            ],
          });
        }
      }

      // 3. Record to Activity store
      addActivity({
        type: params.destinationCurrency === "USDC" || params.destinationCurrency === "cNGN" ? "harvest" : "swap",
        title: `Harvested ${params.stockSymbol} to ${params.destinationCurrency}`,
        subtitle: isStealth ? "Stealth Dividend Rail" : "Direct Dividend Harvest",
        amount: params.estimatedAmount || "540.27",
        tokenSymbol: params.destinationCurrency,
        tags: isStealth ? ["harvest", "stealth payout"] : ["harvest", "personal"],
        note: isStealth ? `Routed to ${params.recipient}` : "Claimed to connected wallet",
        recipient: finalRecipient,
        avatarEmoji: params.destinationCurrency === "CLANKER" ? "🤖" : "🍏",
        avatarBg: isStealth ? "#F5F3FF" : "#E0F2FE",
        isPositive: true,
        txHash,
      });

      return { txHash, stealthDetails, finalRecipient };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Harvest failed";
      setError(msg);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return {
    executeHarvest,
    isPending,
    error,
  };
}
