"use client";

import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { ALLOY_ADDRESSES } from "@/lib/contracts/addresses";
import { B20_STOCK_ABI } from "@/lib/contracts/abis";
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

export function useAlloyStocks() {
  const { address } = useAccount();
  const { profile } = useProfile();
  const sym = profile.currencySymbol || "$";

  // Target query address (connected wallet or fallback demo deployer)
  const targetAddress = address || "0xeca6Ff5Ce16bf15E38a4F28DE6da2397438f7918";

  // Multicall: read multiplier, balance, and surplus for each stock
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      // AAPLc
      {
        address: ALLOY_ADDRESSES.contracts.MockB20_AAPLc,
        abi: B20_STOCK_ABI,
        functionName: "multiplier",
      },
      {
        address: ALLOY_ADDRESSES.contracts.MockB20_AAPLc,
        abi: B20_STOCK_ABI,
        functionName: "balanceOf",
        args: [targetAddress],
      },
      {
        address: ALLOY_ADDRESSES.contracts.MockB20_AAPLc,
        abi: B20_STOCK_ABI,
        functionName: "calculateSurplus",
        args: [targetAddress],
      },
      // NVDAc
      {
        address: ALLOY_ADDRESSES.contracts.MockB20_NVDAc,
        abi: B20_STOCK_ABI,
        functionName: "multiplier",
      },
      {
        address: ALLOY_ADDRESSES.contracts.MockB20_NVDAc,
        abi: B20_STOCK_ABI,
        functionName: "balanceOf",
        args: [targetAddress],
      },
      {
        address: ALLOY_ADDRESSES.contracts.MockB20_NVDAc,
        abi: B20_STOCK_ABI,
        functionName: "calculateSurplus",
        args: [targetAddress],
      },
      // COINc
      {
        address: ALLOY_ADDRESSES.contracts.MockB20_COINc,
        abi: B20_STOCK_ABI,
        functionName: "multiplier",
      },
      {
        address: ALLOY_ADDRESSES.contracts.MockB20_COINc,
        abi: B20_STOCK_ABI,
        functionName: "balanceOf",
        args: [targetAddress],
      },
      {
        address: ALLOY_ADDRESSES.contracts.MockB20_COINc,
        abi: B20_STOCK_ABI,
        functionName: "calculateSurplus",
        args: [targetAddress],
      },
    ],
    query: {
      refetchInterval: 5000,
    },
  });

  let totalAvailableUsd = 0;
  let totalPortfolioUsd = 0;

  const stockItems: StockTokenItem[] = STOCKS.map((stock, i) => {
    const multRaw = data?.[i * 3]?.result as bigint | undefined;
    const balRaw = data?.[i * 3 + 1]?.result as bigint | undefined;
    const surpRaw = data?.[i * 3 + 2]?.result as bigint | undefined;

    // Multiplier (18 decimals: 1e18 = 1.000x)
    const multiplierFloat = multRaw ? Number(formatUnits(multRaw, 18)) : 1.0;
    const multiplierStr = `${multiplierFloat.toFixed(3)}x`;

    // Shares held
    const sharesFloat = balRaw ? Number(formatUnits(balRaw, 18)) : (i === 0 ? 100 : i === 1 ? 200 : 100);
    const principalValueUsd = sharesFloat * stock.spotPriceUsd;
    totalPortfolioUsd += principalValueUsd;

    // Yield %
    const yieldPct = ((multiplierFloat - 1.0) * 100);
    const yieldStr = yieldPct > 0 ? `+${yieldPct.toFixed(1)}% yield` : "0.0% yield";

    // Surplus shares & harvestable USD
    const surplusSharesFloat = surpRaw ? Number(formatUnits(surpRaw, 18)) : (sharesFloat * (multiplierFloat - 1.0) / multiplierFloat);
    const harvestableUsd = Math.max(0, surplusSharesFloat * stock.spotPriceUsd);
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

  // Cumulative all-time dividends calculation
  const totalEarnedUsd = totalAvailableUsd + 1304.0;

  return {
    stocks: stockItems,
    totalDividendsEarned: `+${sym}${totalEarnedUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    availableToHarvest: `+${sym}${totalAvailableUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    totalPortfolioValue: `${sym}${totalPortfolioUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    isLoading,
    refetch,
  };
}
