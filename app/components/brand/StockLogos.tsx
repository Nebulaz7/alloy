"use client";

import React from "react";
import Image from "next/image";

interface StockLogoProps {
  symbol:
    | "AAPLc"
    | "NVDAc"
    | "COINc"
    | "USDC"
    | "cNGN"
    | "CLANKER"
    | "HIGHER"
    | "DEGEN"
    | "BASE"
    | string;
  size?: number;
  className?: string;
}

export const StockLogo: React.FC<StockLogoProps> = ({
  symbol,
  size = 36,
  className = "",
}) => {
  switch (symbol.toUpperCase()) {
    case "AAPLC":
    case "AAPL":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-white border border-neutral-200/80 p-1.5 flex items-center justify-center shadow-xs shrink-0 overflow-hidden ${className}`}
          title="Apple Inc."
        >
          <Image
            src="/brand-logos/apple-logo.svg"
            alt="Apple"
            width={size}
            height={size}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
      );

    case "NVDAC":
    case "NVDA":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-white border border-neutral-200/80 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden ${className}`}
          title="NVIDIA Corporation"
        >
          <Image
            src="/brand-logos/nvidia-logo.png"
            alt="NVIDIA"
            width={size}
            height={size}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
      );

    case "COINC":
    case "COIN":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-[#0052FF] flex items-center justify-center shadow-xs shrink-0 overflow-hidden ${className}`}
          title="Coinbase Global"
        >
          <Image
            src="/brand-logos/coinbase-logo.png"
            alt="Coinbase"
            width={size}
            height={size}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      );

    case "USDC":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-[#2775CA] flex items-center justify-center shadow-xs shrink-0 overflow-hidden ${className}`}
          title="USD Coin"
        >
          <Image
            src="/brand-logos/usdc-logo.svg"
            alt="USDC"
            width={size}
            height={size}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      );

    case "CNGN":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-white border border-neutral-200/80 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden ${className}`}
          title="Compliant Nigerian Naira"
        >
          <Image
            src="/brand-logos/cNGN-logo.png"
            alt="cNGN"
            width={size}
            height={size}
            className="w-full h-full object-contain"
            unoptimized
          />
        </div>
      );

    case "BASE":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-[#0052FF] flex items-center justify-center shadow-xs shrink-0 overflow-hidden ${className}`}
          title="Base"
        >
          <Image
            src="/brand-logos/base-logo.jpeg"
            alt="Base"
            width={size}
            height={size}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      );

    case "CLANKER":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-[#111827] text-white flex items-center justify-center p-1.5 shadow-xs shrink-0 text-sm ${className}`}
          title="$CLANKER AI Meme"
        >
          🤖
        </div>
      );

    case "HIGHER":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-[#0052FF] text-white flex items-center justify-center p-1.5 shadow-xs shrink-0 font-black text-xs ${className}`}
          title="$HIGHER Base Token"
        >
          ↗
        </div>
      );

    case "DEGEN":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-[#A855F7] text-white flex items-center justify-center p-1.5 shadow-xs shrink-0 font-black text-xs ${className}`}
          title="$DEGEN Token"
        >
          🎩
        </div>
      );

    default:
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-xs shrink-0 ${className}`}
        >
          {symbol.slice(0, 2).toUpperCase()}
        </div>
      );
  }
};
