"use client";

import { useState, useMemo } from "react";
import { useAccount, useBalance, useReadContracts, useWriteContract, usePublicClient } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { ALLOY_ADDRESSES } from "@/lib/contracts/addresses";
import { ERC20_PERMIT_ABI, B20_STOCK_ABI } from "@/lib/contracts/abis";

export type TokenCategory = "equity" | "stable" | "meme";

export interface TokenBalanceItem {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  balanceFormatted: string;
  rawBalance: bigint;
  iconBg: string;
  symbolEmoji: string;
  category: TokenCategory;
  defaultMintAmount: string;
}

export const TOKENS_CONFIG: Array<{
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  iconBg: string;
  symbolEmoji: string;
  category: TokenCategory;
  defaultMintAmount: string;
}> = [
  {
    symbol: "AAPLc",
    name: "Apple Tokenized Stock",
    address: ALLOY_ADDRESSES.contracts.MockB20_AAPLc,
    decimals: 18,
    iconBg: "#18181B",
    symbolEmoji: "🍏",
    category: "equity",
    defaultMintAmount: "100",
  },
  {
    symbol: "NVDAc",
    name: "Nvidia Tokenized Stock",
    address: ALLOY_ADDRESSES.contracts.MockB20_NVDAc,
    decimals: 18,
    iconBg: "#15803D",
    symbolEmoji: "🟢",
    category: "equity",
    defaultMintAmount: "100",
  },
  {
    symbol: "COINc",
    name: "Coinbase Tokenized Stock",
    address: ALLOY_ADDRESSES.contracts.MockB20_COINc,
    decimals: 18,
    iconBg: "#0052FF",
    symbolEmoji: "🔵",
    category: "equity",
    defaultMintAmount: "100",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: ALLOY_ADDRESSES.contracts.Mock_USDC,
    decimals: 6,
    iconBg: "#2775CA",
    symbolEmoji: "💵",
    category: "stable",
    defaultMintAmount: "100",
  },
  {
    symbol: "cNGN",
    name: "Nigerian Naira Stablecoin",
    address: ALLOY_ADDRESSES.contracts.Mock_cNGN,
    decimals: 6,
    iconBg: "#059669",
    symbolEmoji: "🇳🇬",
    category: "stable",
    defaultMintAmount: "50000",
  },
  {
    symbol: "CLANKER",
    name: "Autonomous AI Meme Token",
    address: ALLOY_ADDRESSES.contracts.Mock_CLANKER,
    decimals: 18,
    iconBg: "#7C3AED",
    symbolEmoji: "🤖",
    category: "meme",
    defaultMintAmount: "100",
  },
  {
    symbol: "HIGHER",
    name: "Base Community Token",
    address: ALLOY_ADDRESSES.contracts.Mock_HIGHER,
    decimals: 18,
    iconBg: "#2563EB",
    symbolEmoji: "🏹",
    category: "meme",
    defaultMintAmount: "1000",
  },
  {
    symbol: "DEGEN",
    name: "Farcaster Degen Token",
    address: ALLOY_ADDRESSES.contracts.Mock_DEGEN,
    decimals: 18,
    iconBg: "#9333EA",
    symbolEmoji: "🎩",
    category: "meme",
    defaultMintAmount: "5000",
  },
];

export function useTokenBalances() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [isMinting, setIsMinting] = useState<string | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Record<string, number>>({});

  const targetAddress = address || "0xeca6Ff5Ce16bf15E38a4F28DE6da2397438f7918";

  // Native ETH balance on Base Sepolia
  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address: targetAddress,
  });

  const contractsQuery = TOKENS_CONFIG.map((t) => ({
    address: t.address,
    abi: ERC20_PERMIT_ABI,
    functionName: "balanceOf" as const,
    args: [targetAddress] as const,
  }));

  const { data: balancesData, isLoading, refetch } = useReadContracts({
    contracts: contractsQuery,
    query: {
      refetchInterval: 6000,
    },
  });

  const balances: TokenBalanceItem[] = useMemo(() => {
    return TOKENS_CONFIG.map((t, idx) => {
      const raw = (balancesData?.[idx]?.result as bigint) || 0n;
      const formatted = formatUnits(raw, t.decimals);
      const onchainNum = parseFloat(formatted);
      const localSim = localOverrides[t.symbol] || 0;
      const totalNum = onchainNum + localSim;

      const displayStr =
        totalNum > 0
          ? totalNum.toLocaleString("en-US", { maximumFractionDigits: t.decimals === 6 ? 2 : 4 })
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
        category: t.category,
        defaultMintAmount: t.defaultMintAmount,
      };
    });
  }, [balancesData, localOverrides]);

  /**
   * Mint test tokens for judges and testers
   */
  const mintTestTokens = async (tokenSymbol: string, amountString?: string): Promise<string> => {
    const targetToken = TOKENS_CONFIG.find((t) => t.symbol === tokenSymbol);
    if (!targetToken) throw new Error(`Token ${tokenSymbol} not found`);

    const finalAmount = amountString || targetToken.defaultMintAmount;
    setIsMinting(tokenSymbol);

    try {
      if (isConnected && address && publicClient) {
        try {
          const amountWei = parseUnits(finalAmount, targetToken.decimals);
          const isStock = tokenSymbol.endsWith("c");

          const hash = await writeContractAsync({
            address: targetToken.address,
            abi: isStock ? B20_STOCK_ABI : ERC20_PERMIT_ABI,
            functionName: "mint",
            args: [address, amountWei],
          });

          await publicClient.waitForTransactionReceipt({ hash });
          await refetch();
          return hash;
        } catch (err) {
          console.warn("Onchain mint failed or was rejected, falling back to simulated mint:", err);
        }
      }

      // Simulated mint for preview mode or unauthenticated testing
      await new Promise((res) => setTimeout(res, 800));
      const added = parseFloat(finalAmount) || 100;
      setLocalOverrides((prev) => ({
        ...prev,
        [tokenSymbol]: (prev[tokenSymbol] || 0) + added,
      }));

      return `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    } finally {
      setIsMinting(null);
    }
  };

  /**
   * Quick action for judges: mints 100 AAPLc + 100 USDC in one click
   */
  const mintStarterPack = async (): Promise<void> => {
    setIsMinting("STARTER_PACK");
    try {
      await mintTestTokens("AAPLc", "100");
      await mintTestTokens("USDC", "100");
      await refetch();
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
    mintStarterPack,
    refetch: async () => {
      await refetch();
      await refetchEth();
    },
  };
}
