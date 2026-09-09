"use client";

import React, { useState } from "react";
import {
  Coins,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Zap,
  Sparkles,
  ArrowUpRight,
  Droplets,
  CheckCircle2,
} from "lucide-react";
import { useTokenBalances, TokenCategory } from "@/lib/hooks/useTokenBalances";
import { StockLogo } from "@/components/brand/StockLogos";
import { Button } from "@/components/ui/Button";

interface TokenBalancesTableProps {
  className?: string;
  onTokensMinted?: () => void;
}

export const TokenBalancesTable: React.FC<TokenBalancesTableProps> = ({
  className = "",
  onTokensMinted,
}) => {
  const {
    ethBalance,
    balances,
    isLoading,
    isMinting,
    mintTestTokens,
    mintStarterPack,
    refetch,
  } = useTokenBalances();

  const [activeCategory, setActiveCategory] = useState<"all" | TokenCategory>(
    "all",
  );
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [justMintedToken, setJustMintedToken] = useState<string | null>(null);

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleMint = async (symbol: string, defaultAmount: string) => {
    try {
      await mintTestTokens(symbol, defaultAmount);
      setJustMintedToken(symbol);
      setTimeout(() => setJustMintedToken(null), 2500);
      onTokensMinted?.();
    } catch (err) {
      console.error("Minting failed:", err);
    }
  };

  const handleStarterPack = async () => {
    try {
      await mintStarterPack();
      setJustMintedToken("STARTER_PACK");
      setTimeout(() => setJustMintedToken(null), 3000);
      onTokensMinted?.();
    } catch (err) {
      console.error("Starter pack minting failed:", err);
    }
  };

  const filteredTokens = balances.filter((t) => {
    if (activeCategory === "all") return true;
    return t.category === activeCategory;
  });

  return (
    <div
      className={`bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Header Accent Bar */}
      <div className="bg-gradient-to-r from-[#E0F2FE]/60 via-[#F0FDF4]/60 to-white px-5 sm:px-6 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#007FFF]/10 text-[#007FFF] flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-medium text-neutral-900 text-base">
                Testnet Assets & Faucet Hub
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#007FFF]/10 text-[#007FFF] border border-[#007FFF]/20">
                Base Sepolia (84532)
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Instant 1-click test minting across all 9 ecosystem tokens
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#007FFF] ${isLoading ? "animate-spin" : ""}`}
              />
            }
            className="!py-1.5 !px-3 !text-xs !rounded-xl cursor-pointer"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleStarterPack}
            disabled={isMinting !== null}
            leftIcon={
              <Zap
                className={`w-3.5 h-3.5 text-white ${isMinting === "STARTER_PACK" ? "animate-bounce" : ""}`}
              />
            }
            className="!py-1.5 !px-3.5 !text-xs !rounded-xl cursor-pointer bg-gradient-to-r from-[#007FFF] to-[#0066CC]"
          >
            {isMinting === "STARTER_PACK"
              ? "Minting Pack..."
              : "Mint Starter Pack"}
          </Button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Native ETH Gas Bar */}
        <div className="p-4 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center font-bold text-lg shrink-0 border border-[#0052FF]/20">
              Ξ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-medium text-sm text-neutral-900">
                  Base Sepolia ETH
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#0052FF]/10 text-[#0052FF]">
                  Gas Token
                </span>
              </div>
              <div className="text-xs text-neutral-500 font-mono mt-0.5">
                Balance:{" "}
                <strong className="text-neutral-900">{ethBalance}</strong>
              </div>
            </div>
          </div>

          <a
            href="https://faucets.chain.link/base-sepolia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200/80 hover:border-[#007FFF]/50 text-[#007FFF] text-xs font-medium transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Get Sepolia ETH Faucet</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100/80 border border-neutral-200/50 w-full sm:w-fit overflow-x-auto">
          {[
            { id: "all", label: `All (${balances.length})` },
            { id: "equity", label: "Equities (3)" },
            { id: "stable", label: "Stables (2)" },
            { id: "meme", label: "Memes (3)" },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Tokens List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTokens.map((token) => {
            const isItemMinting = isMinting === token.symbol;
            const isJustMinted = justMintedToken === token.symbol;
            const formattedDisplayAmount =
              token.defaultMintAmount === "50000"
                ? "50,000"
                : token.defaultMintAmount;

            return (
              <div
                key={token.symbol}
                className="p-4 rounded-2xl border border-neutral-200/80 bg-white hover:border-[#007FFF]/40 transition-all space-y-3 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={token.symbol} size={40} />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-heading font-medium text-sm text-neutral-900">
                            {token.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-xs font-semibold text-neutral-700">
                            {token.symbol}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-md font-medium uppercase ${
                              token.category === "equity"
                                ? "bg-[#DCFCE7] text-[#15803D]"
                                : token.category === "stable"
                                  ? "bg-[#E0F2FE] text-[#007FFF]"
                                  : "bg-[#F3E8FF] text-[#7E22CE]"
                            }`}
                          >
                            {token.category === "equity"
                              ? "B20 Equity"
                              : token.category === "stable"
                                ? "Stablecoin"
                                : "Meme"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-neutral-400 font-normal">
                        Balance
                      </div>
                      <div className="font-heading font-bold text-neutral-900 text-sm">
                        {token.balanceFormatted}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action & Explorer Row */}
                <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                    <span>
                      {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(token.address)}
                      className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                      title="Copy Contract Address"
                    >
                      {copiedAddress === token.address ? (
                        <Check className="w-3 h-3 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <a
                      href={`https://sepolia.basescan.org/token/${token.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-[#007FFF] transition-colors"
                      title="View on BaseScan"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleMint(token.symbol, token.defaultMintAmount)
                    }
                    disabled={isItemMinting}
                    leftIcon={
                      isJustMinted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : (
                        <Coins
                          className={`w-3.5 h-3.5 text-[#007FFF] ${isItemMinting ? "animate-spin" : ""}`}
                        />
                      )
                    }
                    className={`!py-1.5 !px-3 !text-xs !rounded-xl cursor-pointer ${
                      isJustMinted
                        ? "!border-[#10B981] !text-[#10B981] !bg-[#DCFCE7]/30"
                        : ""
                    }`}
                  >
                    <span>
                      {isItemMinting
                        ? "Minting..."
                        : isJustMinted
                          ? "Minted!"
                          : `Mint ${formattedDisplayAmount}`}
                    </span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explainer / Guide Footnote */}
        {/* <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-2.5 text-xs text-neutral-500 leading-relaxed">
          <Sparkles className="w-4 h-4 text-[#007FFF] shrink-0 mt-0.5" />
          <span>
            <strong>Testing Note for Judges:</strong> All 9 assets above are deployed directly on <strong>Base Sepolia</strong> with open minting access. Minting test shares automatically updates your balances across the Dashboard, Harvest Studio, and Simulator.
          </span>
        </div> */}
      </div>
    </div>
  );
};
