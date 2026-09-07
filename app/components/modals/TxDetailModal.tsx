"use client";

import React, { useState } from "react";
import { X, Check, Copy, ExternalLink, ShieldCheck, ArrowDownLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ActivityItem } from "@/components/ui/ActivityRow";

export interface TxDetailModalProps {
  isOpen: boolean;
  activity: ActivityItem | null;
  onClose: () => void;
  className?: string;
}

export const TxDetailModal: React.FC<TxDetailModalProps> = ({
  isOpen,
  activity,
  onClose,
  className = "",
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !activity) return null;

  const txHash = activity.txHash || "0x7f4a28b9c1048e910248a339948c2014e0b1928437bb9201948ba10283c";

  const handleCopyTxHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isPositive = activity.isPositive ?? activity.type !== "outgoing";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm sm:max-w-md bg-white rounded-[32px] border border-neutral-200/90 shadow-2xl p-6 sm:p-7 space-y-6 overflow-hidden max-h-[92vh] flex flex-col justify-between ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <h2 className="font-heading font-medium text-lg text-neutral-900 tracking-tight">
              Transaction Details
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

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto space-y-5 pr-1 -mr-1">
          {/* Top Amount Banner */}
          <div className="text-center py-3 bg-[#F9FAFB] rounded-2xl border border-neutral-100 space-y-1">
            <div className="text-xs text-neutral-400 font-normal">
              {activity.subtitle || "Dividend Payout"}
            </div>
            <div
              className={`text-3xl sm:text-4xl font-heading font-medium ${
                isPositive ? "text-[#10B981]" : "text-neutral-900"
              }`}
            >
              {isPositive ? `+ ${activity.amount}` : `- ${activity.amount}`}{" "}
              <span className="text-xl font-normal text-neutral-500">
                {activity.tokenSymbol}
              </span>
            </div>
            <div className="text-xs text-neutral-500 font-normal flex items-center justify-center gap-1.5 pt-0.5">
              <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-[10px] font-medium border border-[#BBF7D0]">
                ✓ Confirmed on Base Sepolia
              </span>
            </div>
          </div>

          {/* Details Breakdown List */}
          <div className="space-y-2.5 text-xs">
            {/* Action Type */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/60 border border-neutral-100">
              <span className="text-neutral-400 font-normal">Action Type</span>
              <span className="font-medium text-neutral-800 font-heading">
                {activity.type === "harvest"
                  ? "Dividend Surplus Extraction"
                  : activity.type === "swap"
                  ? "1-Click Meme Swap"
                  : "Private Stealth Payout"}
              </span>
            </div>

            {/* Principal Protection Note */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/60 border border-neutral-100">
              <span className="text-neutral-400 font-normal">Underlying Equity</span>
              <span className="font-medium text-[#007FFF] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Principal Untouched</span>
              </span>
            </div>

            {/* Accrual Multiplier */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/60 border border-neutral-100">
              <span className="text-neutral-400 font-normal">Stock Multiplier</span>
              <span className="font-mono font-medium text-neutral-800">
                {activity.multiplier || "1.025x (+2.5% yield)"}
              </span>
            </div>

            {/* Recipient / Destination */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/60 border border-neutral-100">
              <span className="text-neutral-400 font-normal">Recipient / Rail</span>
              <span className="font-medium text-neutral-800">
                {activity.recipient || "bob.base.eth"}
              </span>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/60 border border-neutral-100">
              <span className="text-neutral-400 font-normal">Timestamp</span>
              <span className="text-neutral-600 font-normal">
                {activity.timestamp || "Today • 2 mins ago"}
              </span>
            </div>

            {/* Network Fee */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/60 border border-neutral-100">
              <span className="text-neutral-400 font-normal">Network Fee</span>
              <span className="text-neutral-600 font-normal">&lt; $0.0001 (Base L2)</span>
            </div>

            {/* ERC-5564 Stealth Details Card */}
            <div className="p-3 rounded-2xl bg-[#E0F2FE]/40 border border-[#BAE6FD]/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-heading font-medium text-[#007FFF] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>ERC-5564 Stealth Proof</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#007FFF] font-mono border border-[#BAE6FD]">
                  View Tag: 0x42
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 font-normal leading-relaxed">
                Yield was transferred non-custodially via an unlinkable stealth announcement. Sender and recipient share zero onchain links.
              </p>
            </div>

            {/* Transaction Hash */}
            <div className="p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100 space-y-1.5">
              <div className="flex items-center justify-between text-neutral-400 font-normal text-[11px]">
                <span>Base Sepolia Tx Hash</span>
                <button
                  onClick={handleCopyTxHash}
                  className="hover:text-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-neutral-400" />
                  <span>{copiedHash ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-neutral-700 break-all select-all">
                {txHash}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 shrink-0 flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() =>
              window.open(`https://sepolia.basescan.org/tx/${txHash}`, "_blank")
            }
            className="flex-1 justify-center text-xs gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
            <span>BaseScan</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="flex-1 justify-center text-xs"
          >
            Close Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};
