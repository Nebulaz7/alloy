"use client";

import React from "react";

interface StockLogoProps {
  symbol: "AAPLc" | "NVDAc" | "COINc" | "USDC" | "cNGN" | "CLANKER" | "HIGHER" | "DEGEN" | string;
  size?: number;
  className?: string;
}

export const StockLogo: React.FC<StockLogoProps> = ({ symbol, size = 36, className = "" }) => {
  switch (symbol.toUpperCase()) {
    case "AAPLC":
    case "AAPL":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-neutral-900 text-white flex items-center justify-center p-2 shadow-xs shrink-0 ${className}`}
          title="Apple Inc."
        >
          <svg viewBox="0 0 170 170" fill="currentColor" className="w-full h-full">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.64-14.01-6.19-9.67-11.08-20.73-14.67-33.19-3.59-12.45-5.38-24.15-5.38-35.1 0-14.44 3.73-26.6 11.19-36.48 7.46-9.88 16.92-14.93 28.38-15.15 4.9.11 10.33 1.34 16.29 3.7 5.96 2.36 10.02 3.6 12.19 3.71 2.51-.11 6.88-1.46 13.1-4.04 6.23-2.58 11.83-3.75 16.8-3.51 12.63.78 22.84 5.75 30.63 14.92-11.02 6.64-16.42 15.89-16.2 27.75.22 9.38 3.82 17.26 10.8 23.63 6.98 6.38 15.34 10.01 25.08 10.9-2.22 6.84-4.8 13.39-7.74 19.64zM119.22 33.56c0-6.72 2.45-13.14 7.35-18.25 4.9-5.12 10.9-8.49 18.01-10.12.89 6.29-.68 12.52-4.7 18.7-4.02 6.18-9.35 9.77-15.99 10.77-.9-3.69-2.33-7.44-4.67-11.1z" />
          </svg>
        </div>
      );

    case "NVDAC":
    case "NVDA":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-[#76B900] text-white flex items-center justify-center p-2 shadow-xs shrink-0 ${className}`}
          title="NVIDIA Corporation"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851c-.398 0-.787-.062-1.158-.185v-4.346c1.528.185 1.837.857 2.747 2.385l2.04-1.714s-1.492-1.952-4-1.952a6.016 6.016 0 0 0-.796.035m0-4.735v2.138l.424-.027c5.45-.185 9.01 4.47 9.01 4.47s-4.08 4.964-8.33 4.964c-.37 0-.733-.035-1.095-.097v1.325c.3.035.61.062.91.062 3.957 0 6.82-2.023 9.593-4.408.459.371 2.34 1.263 2.73 1.546-2.58 2.536-5.83 4.098-9.98 4.098a10.66 10.66 0 0 1-2.246-.239V20h-2.1V4.098c.7-.027 1.4-.035 2.1-.035m0-4.063c.7 0 1.4.035 2.1.088 7.37 0 12.952 5.92 12.952 11.91 0 5.99-5.582 11.91-12.952 11.91-.7 0-1.4-.035-2.1-.088V24H4.75V0h4.2z" />
          </svg>
        </div>
      );

    case "COINC":
    case "COIN":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-[#0052FF] text-white flex items-center justify-center p-1.5 shadow-xs shrink-0 ${className}`}
          title="Coinbase Global"
        >
          <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
            <path
              d="M23.9573 32.5C22.3527 32.4676 20.7898 31.9838 19.4487 31.1044C18.1076 30.2249 17.0427 28.9855 16.3767 27.5289C15.7108 26.0724 15.4707 24.4578 15.6842 22.8711C15.8977 21.2843 16.5561 19.79 17.5835 18.5602C18.611 17.3303 19.9658 16.4149 21.4919 15.9193C23.018 15.4237 24.6534 15.3681 26.2098 15.7589C27.7663 16.1497 29.1804 16.9709 30.2894 18.1281C31.3985 19.2853 32.1574 20.7315 32.4787 22.3H41C40.5628 17.9606 38.4703 13.9546 35.1552 11.1109C31.8402 8.26711 27.5563 6.803 23.1895 7.02133C18.8226 7.23967 14.707 9.12377 11.6937 12.284C8.68042 15.4442 7 19.6386 7 24C7 28.3613 8.68042 32.5558 11.6937 35.716C14.707 38.8762 18.8226 40.7603 23.1895 40.9787C27.5563 41.197 31.8402 39.7329 35.1552 36.8891C38.4703 34.0454 40.5628 30.0394 41 25.7H32.4787C32.4787 29.1 27.3658 32.5 23.9573 32.5Z"
              fill="white"
            />
          </svg>
        </div>
      );

    case "USDC":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-[#2775CA] text-white flex items-center justify-center p-1.5 shadow-xs shrink-0 font-black text-xs ${className}`}
          title="USD Coin"
        >
          $
        </div>
      );

    case "CNGN":
      return (
        <div
          style={{ width: size, height: size }}
          className={`rounded-2xl bg-[#008751] text-white flex items-center justify-center p-1.5 shadow-xs shrink-0 font-black text-xs ${className}`}
          title="Compliant Nigerian Naira"
        >
          ₦
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
