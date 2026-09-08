"use client";

import { useState } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseUnits } from "viem";
import { ALLOY_ADDRESSES, SupportedStockSymbol } from "@/lib/contracts/addresses";
import { B20_STOCK_ABI } from "@/lib/contracts/abis";
import { useActivity } from "@/lib/store/activityStore";

export function useSimulator() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { addActivity } = useActivity();

  const [isSimulating, setIsSimulating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateDividend = async (
    stockSymbol: SupportedStockSymbol = "AAPLc",
    dividendAmount: string = "2.50",
    stockPrice: string = "200.00"
  ) => {
    setIsSimulating(true);
    setIsSuccess(false);
    setError(null);

    if (!address) {
      // Preview mode simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;
      setTxHash(mockHash);
      setIsSuccess(true);
      addActivity({
        type: "incoming",
        title: `Simulated ${stockSymbol} Dividend`,
        subtitle: `Corporate Action (+$${dividendAmount}/share)`,
        amount: (parseFloat(dividendAmount) * 100).toFixed(2),
        tokenSymbol: "USD",
        tags: ["dividend", "simulation"],
        note: `Multiplier increased in Preview Mode`,
        recipient: "All Stock Holders",
        avatarEmoji: "⚡",
        avatarBg: "#FEF3C7",
        isPositive: true,
        txHash: mockHash,
      });
      setIsSimulating(false);
      return mockHash;
    }

    try {
      let hash: `0x${string}` | null = null;

      // 1. Try authorized operator relay API first to prevent AccessControl 0xe2517d3f error
      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stockSymbol,
            dividendAmount,
            stockPrice,
            userAddress: address,
          }),
        });
        const data = await res.json();
        if (data.success && data.txHash) {
          hash = data.txHash as `0x${string}`;
        } else {
          throw new Error(data.error || "Relay simulation failed");
        }
      } catch (apiErr) {
        console.warn("API simulation fallback to wallet write:", apiErr);

        // 2. Direct wallet fallback
        const stockAddress =
          stockSymbol === "AAPLc"
            ? ALLOY_ADDRESSES.contracts.MockB20_AAPLc
            : stockSymbol === "NVDAc"
            ? ALLOY_ADDRESSES.contracts.MockB20_NVDAc
            : ALLOY_ADDRESSES.contracts.MockB20_COINc;

        const divWei = parseUnits(dividendAmount, 18);
        const priceWei = parseUnits(stockPrice, 18);

        hash = await writeContractAsync({
          address: stockAddress,
          abi: B20_STOCK_ABI,
          functionName: "distributeDividend",
          args: [divWei, priceWei],
        });

        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }
      }

      if (!hash) {
        throw new Error("No transaction hash returned from simulation");
      }

      setTxHash(hash);
      setIsSuccess(true);

      // Log event in activity store
      addActivity({
        type: "incoming",
        title: `Simulated ${stockSymbol} Dividend`,
        subtitle: `Corporate Action (+$${dividendAmount}/share)`,
        amount: (parseFloat(dividendAmount) * 100).toFixed(2),
        tokenSymbol: "USD",
        tags: ["dividend", "simulation"],
        note: `Multiplier increased on Base Sepolia`,
        recipient: address || "All Stock Holders",
        avatarEmoji: "⚡",
        avatarBg: "#FEF3C7",
        isPositive: true,
        txHash: hash,
      });

      return hash;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Simulation failed";
      setError(msg);
      throw err;
    } finally {
      setIsSimulating(false);
    }
  };

  const reset = () => {
    setIsSuccess(false);
    setTxHash(null);
    setError(null);
  };

  return {
    simulateDividend,
    reset,
    isSimulating,
    isSuccess,
    txHash,
    error,
  };
}
