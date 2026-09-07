"use client";

import React, { useState } from "react";
import { X, Copy, Check, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AlloyLogo } from "@/components/brand/AlloyLogo";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  handle?: string;
  className?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  handle = "nebula.base.eth",
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const paymentUrl = `https://alloy.cash/${handle.replace(".base.eth", "")}`;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pay via Alloy",
          text: `Send private dividend payouts to ${handle} on Base!`,
          url: paymentUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Centered Modal Card matching inspo Screenshot 2026-09-07 003516.png */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm sm:max-w-md bg-white rounded-[32px] border border-neutral-200/90 shadow-2xl p-6 sm:p-8 space-y-6 text-center overflow-hidden flex flex-col items-center justify-between ${className}`}
      >
        {/* Top-Right Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title & Subtitle */}
        <div className="space-y-1 pt-1">
          <h2 className="font-heading font-medium text-2xl text-neutral-900 tracking-tight">
            Your Payment Link
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-normal">
            Scan to open private dividend link
          </p>
        </div>

        {/* Centerpiece: Clean Vector QR Code with Winking Alloy Mascot Stamp */}
        <div className="p-4 sm:p-5 rounded-[36px] bg-white border-4 border-neutral-900 shadow-md relative group">
          <svg
            viewBox="0 0 160 160"
            className="w-48 h-48 sm:w-56 sm:h-56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Corner Alignment Squares */}
            {/* Top-Left */}
            <rect x="10" y="10" width="40" height="40" rx="10" stroke="#111827" strokeWidth="8" />
            <rect x="22" y="22" width="16" height="16" rx="4" fill="#111827" />

            {/* Top-Right */}
            <rect x="110" y="10" width="40" height="40" rx="10" stroke="#111827" strokeWidth="8" />
            <rect x="122" y="22" width="16" height="16" rx="4" fill="#111827" />

            {/* Bottom-Left */}
            <rect x="10" y="110" width="40" height="40" rx="10" stroke="#111827" strokeWidth="8" />
            <rect x="22" y="122" width="16" height="16" rx="4" fill="#111827" />

            {/* Simulated Data Pattern Matrix */}
            <circle cx="65" cy="18" r="4" fill="#111827" />
            <circle cx="80" cy="18" r="4" fill="#111827" />
            <circle cx="95" cy="18" r="4" fill="#111827" />

            <circle cx="65" cy="32" r="4" fill="#111827" />
            <circle cx="95" cy="32" r="4" fill="#111827" />

            <circle cx="65" cy="46" r="4" fill="#111827" />
            <circle cx="80" cy="46" r="4" fill="#111827" />
            <circle cx="95" cy="46" r="4" fill="#111827" />

            <circle cx="18" cy="65" r="4" fill="#111827" />
            <circle cx="32" cy="65" r="4" fill="#111827" />
            <circle cx="46" cy="65" r="4" fill="#111827" />

            <circle cx="114" cy="65" r="4" fill="#111827" />
            <circle cx="128" cy="65" r="4" fill="#111827" />
            <circle cx="142" cy="65" r="4" fill="#111827" />

            <circle cx="18" cy="80" r="4" fill="#111827" />
            <circle cx="32" cy="80" r="4" fill="#111827" />
            <circle cx="46" cy="80" r="4" fill="#111827" />

            <circle cx="114" cy="80" r="4" fill="#111827" />
            <circle cx="142" cy="80" r="4" fill="#111827" />

            <circle cx="18" cy="95" r="4" fill="#111827" />
            <circle cx="46" cy="95" r="4" fill="#111827" />

            <circle cx="114" cy="95" r="4" fill="#111827" />
            <circle cx="128" cy="95" r="4" fill="#111827" />
            <circle cx="142" cy="95" r="4" fill="#111827" />

            <circle cx="65" cy="114" r="4" fill="#111827" />
            <circle cx="80" cy="114" r="4" fill="#111827" />
            <circle cx="95" cy="114" r="4" fill="#111827" />

            <circle cx="65" cy="128" r="4" fill="#111827" />
            <circle cx="95" cy="128" r="4" fill="#111827" />

            <circle cx="65" cy="142" r="4" fill="#111827" />
            <circle cx="80" cy="142" r="4" fill="#111827" />
            <circle cx="95" cy="142" r="4" fill="#111827" />

            {/* Center Winking Alloy Mascot Badge */}
            <circle cx="80" cy="80" r="22" fill="#FFFFFF" stroke="#111827" strokeWidth="4" />
            <g transform="translate(68, 68)">
              <circle cx="12" cy="12" r="11" fill="#FBBF24" />
              <path d="M8 10C9 9 10 9 11 10" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
              <ellipse cx="14.5" cy="10" rx="1.2" ry="1.5" fill="#111827" />
              <path d="M10 14C11 15 13 15 14 14" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* URL Pill Container matching Screenshot 003516 */}
        <div className="w-full">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2.5 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs sm:text-sm font-normal font-mono transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-200/70"
          >
            <span className="truncate">{paymentUrl}</span>
            {copied ? (
              <Check className="w-4 h-4 text-[#007FFF] shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-neutral-400 shrink-0" />
            )}
          </button>
        </div>

        {/* Brand Mark Stamp at bottom matching inspo */}
        <div className="pt-1 flex items-center justify-center">
          <AlloyLogo size="sm" showBeta={false} />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleShare}
            className="flex-1 justify-center text-xs gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleCopyLink}
            className="flex-1 justify-center text-xs gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
