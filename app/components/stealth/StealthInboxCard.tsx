"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Zap,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useStealthInbox, StealthPayment } from "@/lib/hooks/useStealthInbox";
import { StockLogo } from "@/components/brand/StockLogos";
import { Button } from "@/components/ui/Button";

interface StealthInboxCardProps {
  className?: string;
  onPaymentSwept?: (txHash: string) => void;
}

export const StealthInboxCard: React.FC<StealthInboxCardProps> = ({
  className = "",
  onPaymentSwept,
}) => {
  const {
    payments,
    totalUnclaimedUsd,
    isScanning,
    hasScanned,
    isSweeping,
    scanInbox,
    sweepPayment,
  } = useStealthInbox();

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleSweep = async (payment: StealthPayment) => {
    try {
      const txHash = await sweepPayment(payment);
      setSuccessNotice(`Successfully swept ${payment.balance} ${payment.tokenSymbol}!`);
      setTimeout(() => setSuccessNotice(null), 4000);
      onPaymentSwept?.(txHash);
    } catch (err: any) {
      console.error("Sweep failed:", err);
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Top Accent Header */}
      <div className="bg-gradient-to-r from-[#E0F2FE]/60 via-[#F0FDF4]/60 to-white px-5 sm:px-6 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#007FFF]/10 text-[#007FFF] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-medium text-neutral-900 text-base">
                Stealth Inbox
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#007FFF]/10 text-[#007FFF] border border-[#007FFF]/20">
                ERC-5564
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                0 ETH Gas
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Unclaimed private dividends sent to your Basename
            </p>
          </div>
        </div>

        {/* Scan Action */}
        <Button
          variant="secondary"
          size="sm"
          onClick={scanInbox}
          disabled={isScanning}
          leftIcon={
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#007FFF] ${isScanning ? "animate-spin" : ""}`}
            />
          }
          className="!py-1.5 !px-3 !text-xs !rounded-xl"
        >
          {isScanning ? "Scanning logs..." : "Scan Base Sepolia"}
        </Button>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="mx-5 sm:mx-6 mt-4 p-3 bg-[#DCFCE7] border border-[#10B981]/30 rounded-2xl flex items-center gap-2 text-xs text-[#065F46] font-medium animate-fadeIn">
          <Check className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Unclaimed Balance Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-neutral-50/80 border border-neutral-100 gap-3">
          <div>
            <span className="text-xs text-neutral-500 font-medium">
              Total Unclaimed Balance
            </span>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 tracking-tight flex items-baseline gap-2">
              <span>+${totalUnclaimedUsd}</span>
              <span className="text-xs text-neutral-400 font-normal">USD equiv.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>
              {payments.length} {payments.length === 1 ? "stealth payout" : "stealth payouts"} ready to sweep
            </span>
          </div>
        </div>

        {/* Payment Items List */}
        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((p) => {
              const isItemSweeping = isSweeping === p.stealthAddress;
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-neutral-200/90 bg-white hover:border-[#007FFF]/40 transition-all duration-200 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={p.tokenSymbol} size={40} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-neutral-900 text-base">
                            +{p.balance} {p.tokenSymbol}
                          </span>
                          {p.isDemo && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-neutral-100 text-neutral-600">
                              Simulated
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-neutral-400">
                          Block #{p.blockNumber.toString()}
                        </span>
                      </div>
                    </div>

                    {/* Sweep Button */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSweep(p)}
                      disabled={isItemSweeping}
                      leftIcon={
                        <Zap
                          className={`w-3.5 h-3.5 text-white ${isItemSweeping ? "animate-bounce" : ""}`}
                        />
                      }
                      className="!py-2 !px-3.5 !text-xs !rounded-xl"
                    >
                      {isItemSweeping ? "Sweeping (0 ETH)..." : "Gasless Sweep (0 ETH)"}
                    </Button>
                  </div>

                  {/* Cryptographic Proof & Metadata Row */}
                  <div className="pt-2 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50/80 border border-neutral-100">
                      <span className="text-neutral-400">Stealth Address:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(p.stealthAddress)}
                        className="inline-flex items-center gap-1 font-mono text-neutral-700 hover:text-[#007FFF] transition-colors"
                        title="Copy Address"
                      >
                        <span>
                          {p.stealthAddress.slice(0, 6)}...{p.stealthAddress.slice(-4)}
                        </span>
                        {copiedAddress === p.stealthAddress ? (
                          <Check className="w-3 h-3 text-[#10B981]" />
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50/80 border border-neutral-100">
                      <span className="text-neutral-400">View Tag / ECDH:</span>
                      <span className="font-mono text-neutral-700 font-medium">
                        Tag 0x{p.viewTag.toString(16).padStart(2, "0")} • {p.ephemeralPubKey.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 space-y-2">
            <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-medium text-neutral-800 text-sm">
              {hasScanned ? "No Unclaimed Stealth Dividends" : "Stealth Inbox Ready"}
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {hasScanned
                ? "All private dividend payouts matching your viewing key have been swept into your primary wallet."
                : "Click 'Scan Base Sepolia' to scan recent ERC-5564 announcements and sweep incoming private dividends with zero ETH gas."}
            </p>
          </div>
        )}

        {/* Educational Explainer Accordion */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowExplainer(!showExplainer)}
            className="w-full flex items-center justify-between text-xs text-neutral-500 hover:text-neutral-800 py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#007FFF]" />
              How does 0-ETH Gasless Sweeping work?
            </span>
            {showExplainer ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {showExplainer && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-[#E0F2FE]/30 border border-[#007FFF]/20 text-xs text-neutral-600 space-y-2 leading-relaxed animate-fadeIn">
              <p>
                <strong>1. The 0-ETH Dilemma:</strong> When equity dividends are harvested to a private stealth address, that address has clean ERC-20 tokens but 0 ETH to pay gas.
              </p>
              <p>
                <strong>2. Client-Side Key Recovery:</strong> Alloy computes the one-time private key <code className="text-[#007FFF]">k_stealth = (k_spend + h) mod n</code> locally in your browser without exposing it.
              </p>
              <p>
                <strong>3. EIP-2612 Permit & Relayer:</strong> You sign a gasless permit offchain. The <code className="text-[#007FFF]">AlloyStealthRelayer</code> contract on Base Sepolia broadcasts the sweep transaction and sponsors the gas, delivering 100% of the funds to your primary wallet!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
