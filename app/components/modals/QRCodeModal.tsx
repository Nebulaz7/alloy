"use client";

import React, { useState } from "react";
import { X, Copy, Check, Share2, Wallet, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";
import { AlloyLogo } from "@/components/brand/AlloyLogo";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  handle?: string;
  address?: string;
  className?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  handle = "nebula.base.eth",
  address,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"address" | "link">("address");
  const [copied, setCopied] = useState(false);

  // Fallback demo address if unauthenticated
  const activeAddress = address || "0xeca6Ff5Ce16bf15E38a4F28DE6da2397438f7918";
  const paymentUrl = `https://alloy.cash/${handle.replace(".base.eth", "")}`;

  if (!isOpen) return null;

  const currentQrValue = activeTab === "address" ? activeAddress : paymentUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentQrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: activeTab === "address" ? `Alloy Wallet Address` : `Pay ${handle} via Alloy`,
          text: activeTab === "address" ? `Send funds to ${activeAddress} on Base` : `Send private dividend payouts to ${handle} on Base!`,
          url: currentQrValue,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Centered Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm sm:max-w-md bg-white rounded-[32px] border border-neutral-200/90 shadow-2xl p-6 sm:p-7 space-y-5 text-center overflow-hidden flex flex-col items-center justify-between ${className}`}
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
            {activeTab === "address" ? "Receive via Wallet QR" : "Your Payment Link"}
          </h2>
          <p className="text-xs text-neutral-400 font-normal">
            {activeTab === "address"
              ? "Scan with any crypto wallet on Base Sepolia"
              : "Scan to open private dividend link"}
          </p>
        </div>

        {/* Toggle Mode Pills */}
        <div className="flex items-center p-1 rounded-2xl bg-neutral-100 border border-neutral-200/70 text-xs font-medium w-full max-w-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("address");
              setCopied(false);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "address"
                ? "bg-white text-neutral-900 shadow-2xs font-medium"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-[#007FFF]" />
            <span>Wallet Address</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("link");
              setCopied(false);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "link"
                ? "bg-white text-neutral-900 shadow-2xs font-medium"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Payment Link</span>
          </button>
        </div>

        {/* Centerpiece: Real Scalable SVG QR Code with Center Coin Mascot Badge */}
        <div className="p-4 sm:p-5 rounded-[32px] bg-white border-4 border-neutral-900 shadow-md relative group flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <QRCodeSVG
              value={currentQrValue}
              size={210}
              level="H"
              marginSize={1}
              bgColor="#FFFFFF"
              fgColor="#111827"
              className="rounded-xl"
            />
            {/* Center Winking Alloy Mascot Badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-sm border border-neutral-200/90 flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-[#FBBF24] flex items-center justify-center text-sm shadow-2xs">
                  <span>🪙</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address / Link Pill Container */}
        <div className="w-full space-y-1.5">
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Click to copy"}
            className="w-full py-2.5 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs font-normal font-mono transition-all flex items-center justify-between gap-2 cursor-pointer border border-neutral-200/70"
          >
            <span className="truncate">
              {activeTab === "address" ? activeAddress : paymentUrl}
            </span>
            {copied ? (
              <span className="flex items-center gap-1 text-[#007FFF] text-xs font-medium shrink-0">
                <Check className="w-4 h-4" />
                <span>Copied</span>
              </span>
            ) : (
              <Copy className="w-4 h-4 text-neutral-400 shrink-0" />
            )}
          </button>

          {/* Network tag */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-normal">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Base Sepolia (Chain ID: 84532)</span>
          </div>
        </div>

        {/* Brand Mark Stamp */}
        <div className="flex items-center justify-center">
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
            onClick={handleCopy}
            className="flex-1 justify-center text-xs gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : activeTab === "address" ? "Copy Address" : "Copy Link"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
