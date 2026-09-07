"use client";

import React, { useState } from "react";
import { X, Sparkles, RefreshCw, Check, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StockLogo } from "@/components/brand/StockLogos";

interface DividendSimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDividendSimulated?: (multiplier: number, surplus: number) => void;
  currentMultiplier?: number;
}

export const DividendSimModal: React.FC<DividendSimModalProps> = ({
  isOpen,
  onClose,
  onDividendSimulated,
  currentMultiplier = 1.025,
}) => {
  const [selectedStock, setSelectedStock] = useState<"AAPLc" | "NVDAc" | "COINc">("AAPLc");
  const [dividendAmount, setDividendAmount] = useState<string>("2.50");
  const [stockPrice, setStockPrice] = useState<string>("200.00");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simComplete, setSimComplete] = useState(false);

  if (!isOpen) return null;

  const divNum = parseFloat(dividendAmount) || 2.50;
  const priceNum = parseFloat(stockPrice) || 200.00;
  const yieldIncrementPct = (divNum / priceNum) * 100;
  const newMultiplier = +(currentMultiplier * (1 + divNum / priceNum)).toFixed(3);
  const generatedSurplus = +(100 * divNum).toFixed(2);

  const handleExecuteSim = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimComplete(true);
      onDividendSimulated?.(newMultiplier, generatedSurplus);
      setTimeout(() => {
        setSimComplete(false);
        onClose();
      }, 1600);
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-[32px] border border-neutral-200/90 shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden max-h-[92vh] flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse" />
            <h2 className="font-heading font-medium text-lg sm:text-xl text-neutral-900 tracking-tight">
              Simulate Corporate Dividend
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto space-y-4 pr-1 -mr-1 flex-1 text-left">
          <p className="text-xs text-neutral-500 font-normal leading-relaxed">
            Simulate an official cash dividend distribution event on Base Sepolia. This increases the mathematical multiplier of the tokenized equity and creates instant harvestable cashflow.
          </p>

          {/* Stock Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-heading font-medium text-neutral-400 uppercase tracking-wider">
              Target Tokenized Stock
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { sym: "AAPLc" as const, name: "Apple", price: "200.00" },
                { sym: "NVDAc" as const, name: "Nvidia", price: "130.00" },
                { sym: "COINc" as const, name: "Coinbase", price: "220.00" },
              ].map((stock) => {
                const isSelected = selectedStock === stock.sym;
                return (
                  <button
                    key={stock.sym}
                    type="button"
                    onClick={() => {
                      setSelectedStock(stock.sym);
                      setStockPrice(stock.price);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? "border-[#007FFF] bg-[#E0F2FE]/50 shadow-xs"
                        : "border-neutral-200/80 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <StockLogo symbol={stock.sym} size={24} />
                    <span className="font-heading font-medium text-xs text-neutral-900">
                      {stock.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      ${stock.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dividend Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-heading font-medium text-neutral-400 uppercase tracking-wider">
                Dividend Per Share ($)
              </label>
              <span className="text-xs text-[#10B981] font-medium font-mono">
                +{yieldIncrementPct.toFixed(2)}% multiplier jump
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                step="0.25"
                value={dividendAmount}
                onChange={(e) => setDividendAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[#F9FAFB] border border-neutral-200 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#007FFF] focus:bg-white"
              />
            </div>
          </div>

          {/* Mathematical Multiplier Jump Preview */}
          <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-normal">Multiplier Expansion</span>
              <div className="flex items-center gap-1.5 font-mono font-medium">
                <span className="text-neutral-500">{currentMultiplier.toFixed(3)}x</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#007FFF]" />
                <span className="text-[#007FFF]">{newMultiplier.toFixed(3)}x</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100">
              <span className="text-neutral-500 font-normal">New Harvestable Surplus</span>
              <span className="font-mono font-medium text-[#10B981]">
                +${generatedSurplus.toFixed(2)} USDC
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100">
              <span className="text-neutral-500 font-normal">Principal Equity Status</span>
              <span className="text-xs text-[#007FFF] font-normal flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>100% Intact</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 shrink-0">
          <Button
            type="button"
            variant="primary"
            size="lg"
            isLoading={isSimulating}
            onClick={handleExecuteSim}
            className="w-full justify-center text-sm rounded-2xl"
          >
            {simComplete ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Multiplier Jump Broadcasted!
              </span>
            ) : isSimulating ? (
              "Executing on Base Sepolia..."
            ) : (
              `Distribute +$${divNum.toFixed(2)} Dividend`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
