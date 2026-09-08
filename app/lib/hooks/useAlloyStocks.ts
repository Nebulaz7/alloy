"use client";

import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { ALLOY_ADDRESSES } from "@/lib/contracts/addresses";
import { B20_STOCK_ABI, HARVEST_ROUTER_ABI } from "@/lib/contracts/abis";
import { StockTokenItem } from "@/components/ui/SignatureHeroCard";
import { useProfile } from "@/lib/store/profileStore";

const STOCKS = [
  {
    symbol: "AAPLc" as const,
    name: "Apple Tokenized Stock",
    address: ALLOY_ADDRESSES.contracts.MockB20_AAPLc,
    spotPriceUsd: 200.0,
  },
  {
    symbol: "NVDAc" as const,
    name: "Nvidia Tokenized Stock",
    address: ALLOY_ADDRESSES.contracts.MockB20_NVDAc,
    spotPriceUsd: 130.0,
  },
  {
    symbol: "COINc" as const,
    name: "Coinbase Tokenized Stock",
    address: ALLOY_ADDRESSES.contracts.MockB20_COINc,
    spotPriceUsd: 220.0,
  },
];

const PREVIEW_STOCKS: StockTokenItem[] = [
  {
    symbol: "AAPLc",
    name: "Apple Tokenized Stock",
    shares: "100.0 AAPLc",
    valueUsd: "$20,000.00 principal",
    multiplier: "1.025x",
    dividendYield: "+2.5% yield",
    harvestableSurplus: "+$75.00",
  },
  {
    symbol: "NVDAc",
    name: "Nvidia Tokenized Stock",
    shares: "200.0 NVDAc",
    valueUsd: "$26,000.00 principal",
    multiplier: "1.018x",
    dividendYield: "+1.8% yield",
    harvestableSurplus: "+$45.00",
  },
  {
    symbol: "COINc",
    name: "Coinbase Tokenized Stock",
    shares: "100.0 COINc",
    valueUsd: "$22,000.00 principal",
    multiplier: "1.006x",
    dividendYield: "+0.6% yield",
    harvestableSurplus: "+$4.50",
  },
];

export function useAlloyStocks() {
  const { address, isConnected } = useAccount();
  const { profile } = useProfile();
  const sym = profile.currencySymbol || "$";

  // Check whether the user is in preview mode (unauthenticated)
  const isPreview = !isConnected || !address;

  // Contracts query for authenticated user's address
  const contractsQuery = [
    // AAPLc
    {
      address: ALLOY_ADDRESSES.contracts.MockB20_AAPLc,
      abi: B20_STOCK_ABI,
      functionName: "multiplier" as const,
    },
    {
      address: ALLOY_ADDRESSES.contracts.MockB20_AAPLc,
      abi: B20_STOCK_ABI,
      functionName: "balanceOf" as const,
      args: address ? [address] : undefined,
    },
    {
      address: ALLOY_ADDRESSES.contracts.Alloy_HarvestRouter,
      abi: HARVEST_ROUTER_ABI,
      functionName: "getPendingDividend" as const,
      args: address ? [address, ALLOY_ADDRESSES.contracts.MockB20_AAPLc] : undefined,
    },
    // NVDAc
    {
      address: ALLOY_ADDRESSES.contracts.MockB20_NVDAc,
      abi: B20_STOCK_ABI,
      functionName: "multiplier" as const,
    },
    {
      address: ALLOY_ADDRESSES.contracts.MockB20_NVDAc,
      abi: B20_STOCK_ABI,
      functionName: "balanceOf" as const,
      args: address ? [address] : undefined,
    },
    {
      address: ALLOY_ADDRESSES.contracts.Alloy_HarvestRouter,
      abi: HARVEST_ROUTER_ABI,
      functionName: "getPendingDividend" as const,
      args: address ? [address, ALLOY_ADDRESSES.contracts.MockB20_NVDAc] : undefined,
    },
    // COINc
    {
      address: ALLOY_ADDRESSES.contracts.MockB20_COINc,
      abi: B20_STOCK_ABI,
      functionName: "multiplier" as const,
    },
    {
      address: ALLOY_ADDRESSES.contracts.MockB20_COINc,
      abi: B20_STOCK_ABI,
      functionName: "balanceOf" as const,
      args: address ? [address] : undefined,
    },
    {
      address: ALLOY_ADDRESSES.contracts.Alloy_HarvestRouter,
      abi: HARVEST_ROUTER_ABI,
      functionName: "getPendingDividend" as const,
      args: address ? [address, ALLOY_ADDRESSES.contracts.MockB20_COINc] : undefined,
    },
  ];

  const { data, isLoading: queryLoading, isFetching, refetch } = useReadContracts({
    contracts: contractsQuery,
    query: {
      enabled: !isPreview,
      refetchInterval: 5000,
    },
  });

  // Preserve mock data strictly for unauthenticated preview mode
  if (isPreview) {
    return {
      stocks: PREVIEW_STOCKS,
      totalDividendsEarned: `+${sym}1,428.50`,
      availableToHarvest: `+${sym}124.50`,
      totalPortfolioValue: `${sym}68,000.00`,
      rawPortfolioValue: 68000,
      isLoading: false,
      refetch: async () => {},
      isPreview: true,
    };
  }

  // Loading state when contract calls are in-flight
  const isLoading = queryLoading || (!data && isFetching);

  let totalAvailableUsd = 0;
  let totalPortfolioUsd = 0;

  const stockItems: StockTokenItem[] = STOCKS.map((stock, i) => {
    const multRaw = data?.[i * 3]?.result as bigint | undefined;
    const balRaw = data?.[i * 3 + 1]?.result as bigint | undefined;
    const pendingDivData = data?.[i * 3 + 2]?.result as [bigint, bigint] | undefined;

    // Multiplier from contract (18 decimals: 1e18 = 1.000x)
    const multiplierFloat = multRaw ? Number(formatUnits(multRaw, 18)) : 1.0;
    const multiplierStr = `${multiplierFloat.toFixed(3)}x`;

    // Real live balance from live contract (0 if user has no tokens)
    const sharesFloat = balRaw ? Number(formatUnits(balRaw, 18)) : 0;
    const principalValueUsd = sharesFloat * stock.spotPriceUsd;
    totalPortfolioUsd += principalValueUsd;

    // Yield % based on contract multiplier
    const yieldPct = Math.max(0, (multiplierFloat - 1.0) * 100);
    const yieldStr = yieldPct > 0 ? `+${yieldPct.toFixed(1)}% yield` : "0.0% yield";

    // 1. Onchain pending dividend from AlloyHarvestRouter
    const divQueryResult = data?.[i * 3 + 2];
    const onchainSurplusShares = pendingDivData?.[0] ? Number(formatUnits(pendingDivData[0], 18)) : 0;
    const onchainSurplusUsd = pendingDivData?.[1] && pendingDivData[1] > 0n
      ? Number(formatUnits(pendingDivData[1], 18))
      : onchainSurplusShares * stock.spotPriceUsd;

    // 2. Mathematical surplus formula fallback:
    // surplusShares = shares * (multiplier - 1.0) / multiplier
    const mathSurplusShares =
      multiplierFloat > 1.0 && sharesFloat > 0
        ? (sharesFloat * (multiplierFloat - 1.0)) / multiplierFloat
        : 0;
    const mathSurplusUsd = mathSurplusShares * stock.spotPriceUsd;

    // Prefer onchain pending dividend when query succeeds; fallback to mathematical surplus calculation
    const harvestableUsd =
      divQueryResult?.status === "success"
        ? onchainSurplusUsd
        : (onchainSurplusUsd > 0 ? onchainSurplusUsd : mathSurplusUsd);
    totalAvailableUsd += harvestableUsd;

    return {
      symbol: stock.symbol,
      name: stock.name,
      shares: `${sharesFloat.toFixed(1)} ${stock.symbol}`,
      valueUsd: `${sym}${principalValueUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} principal`,
      multiplier: multiplierStr,
      dividendYield: yieldStr,
      harvestableSurplus: `+${sym}${harvestableUsd.toFixed(2)}`,
    };
  });

  // Cumulative dividends for live smart contract (actual real harvestable surplus)
  const totalEarnedUsd = totalAvailableUsd;

  return {
    stocks: stockItems,
    totalDividendsEarned: `+${sym}${totalEarnedUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    availableToHarvest: `+${sym}${totalAvailableUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    totalPortfolioValue: `${sym}${totalPortfolioUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    rawPortfolioValue: totalPortfolioUsd,
    isLoading,
    refetch,
    isPreview: false,
  };
}
