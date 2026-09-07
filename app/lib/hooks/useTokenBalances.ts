"use client";

import { useState } from "react";
import { useAccount, useBalance, useReadContracts, useWriteContract, usePublicClient } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { ALLOY_ADDRESSES } from "@/lib/contracts/addresses";
import { ERC20_PERMIT_ABI, B20_STOCK_ABI } from "@/lib/contracts/abis";

export interface TokenBalanceItem {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  balanceFormatted: string;
  rawBalance: bigint;
  iconBg: string;
  symbolEmoji: string;
}

export function useTokenBalances() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [isMinting, setIsMinting] = useState<string | null>(null);

  const targetAddress = address || "0xeca6Ff5Ce16bf15E38a4F28DE6da2397438f7918";

  // Native ETH balance
  const { data: ethBalance } = useBalance({
    address: targetAddress,
  });

  const tokensConfig = [
    {
      symbol: "AAPLc",
      name: "Apple Tokenized Stock",
      address: ALLOY_ADDRESSES.contracts.MockB20_AAPLc,
      decimals: 18,
      iconBg: "#18181B",
      symbolEmoji: "🍏",
    },
    {
      symbol: "NVDAc",
      name: "Nvidia Tokenized Stock",
      address: ALLOY_ADDRESSES.contracts.MockB20_NVDAc,
      decimals: 18,
      iconBg: "#15803D",
      symbolEmoji: "🟢",
    },
    {
      symbol: "COINc",
      name: "Coinbase Tokenized Stock",
      address: ALLOY_ADDRESSES.contracts.MockB20_COINc,
      decimals: 18,
      iconBg: "#0052FF",
      symbolEmoji: "🔵",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: ALLOY_ADDRESSES.contracts.Mock_USDC,
      decimals: 6,
      iconBg: "#2775CA",
      symbolEmoji: "💵",
    },
    {
      symbol: "cNGN",
      name: "Nigerian Naira Stablecoin",
      address: ALLOY_ADDRESSES.contracts.Mock_cNGN,
      decimals: 6,
      iconBg: "#059669",
      symbolEmoji: "🇳🇬",
    },
    {
      symbol: "CLANKER",
      name: "Autonomous AI Meme Token",
      address: ALLOY_ADDRESSES.contracts.Mock_CLANKER,
      decimals: 18,
      iconBg: "#7C3AED",
      symbolEmoji: "🤖",
    },
    {
      symbol: "HIGHER",
      name: "Base Community Token",
      address: ALLOY_ADDRESSES.contracts.Mock_HIGHER,
      decimals: 18,
      iconBg: "#2563EB",
      symbolEmoji: "🏹",
    },
    {
      symbol: "DEGEN",
      name: "Farcaster Degen Token",
      address: ALLOY_ADDRESSES.contracts.Mock_DEGEN,
      decimals: 18,
      iconBg: "#9333EA",
      symbolEmoji: "🎩",
    },
  ];

  const contractsQuery = tokensConfig.map((t) => ({
    address: t.address,
    abi: ERC20_PERMIT_ABI,
    functionName: "balanceOf" as const,
    args: [targetAddress] as const,
  }));

  const { data: balancesData, isLoading, refetch } = useReadContracts({
    contracts: contractsQuery,
    query: {
      refetchInterval: 5000,
    },
  });

  const balances: TokenBalanceItem[] = tokensConfig.map((t, idx) => {
    const raw = (balancesData?.[idx]?.result as bigint) || 0n;
    const formatted = formatUnits(raw, t.decimals);
    const num = parseFloat(formatted);
    const displayStr =
      num > 0
        ? num.toLocaleString("en-US", { maximumFractionDigits: t.decimals === 6 ? 2 : 4 })
        : "0.00";

    return {
      symbol: t.symbol,
      name: t.name,
      address: t.address,
      decimals: t.decimals,
      balanceFormatted: displayStr,
      rawBalance: raw,
      iconBg: t.iconBg,
      symbolEmoji: t.symbolEmoji,
    };
  });

  // Mint test tokens for judges / demo testers
  const mintTestTokens = async (tokenSymbol: string, amountString: string = "100") => {
    if (!address) throw new Error("Wallet not connected");

    const targetToken = tokensConfig.find((t) => t.symbol === tokenSymbol);
    if (!targetToken) throw new Error(`Token ${tokenSymbol} not found`);

    setIsMinting(tokenSymbol);
    try {
      const amountWei = parseUnits(amountString, targetToken.decimals);
      const isStock = tokenSymbol.endsWith("c");

      const hash = await writeContractAsync({
        address: targetToken.address,
        abi: isStock ? B20_STOCK_ABI : ERC20_PERMIT_ABI,
        functionName: "mint",
        args: [address, amountWei],
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      await refetch();
      return hash;
    } finally {
      setIsMinting(null);
    }
  };

  return {
    ethBalance: ethBalance
      ? `${parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4)} ${ethBalance.symbol}`
      : "0.0000 ETH",
    balances,
    isLoading,
    isMinting,
    mintTestTokens,
    refetch,
  };
}
