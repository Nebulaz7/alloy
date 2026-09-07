"use client";

import React, { useState, useMemo } from "react";
import { Check, X, Sparkles, ArrowRight, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InteractiveNametagCardProps {
  initialUsername?: string;
  onClaim?: (username: string) => void;
  className?: string;
}

// Simulated taken handles on Base Sepolia
const TAKEN_HANDLES = new Set(["satoshi", "vitalik", "brian", "base", "alloy", "admin"]);

export const InteractiveNametagCard: React.FC<InteractiveNametagCardProps> = ({
  initialUsername = "nebula",
  onClaim,
  className = "",
}) => {
  const [inputVal, setInputVal] = useState(initialUsername);
  const [isClaimed, setIsClaimed] = useState(false);

  // Sanitize input: lowercase, alphanumeric and dashes
  const sanitized = useMemo(() => {
    return inputVal.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  }, [inputVal]);

  const status = useMemo(() => {
    if (!sanitized) return "empty";
    if (sanitized.length < 3) return "too_short";
    if (TAKEN_HANDLES.has(sanitized)) return "taken";
    return "available";
  }, [sanitized]);

  const handleContinue = () => {
    if (status === "available") {
      setIsClaimed(true);
      onClaim?.(sanitized);
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto space-y-6 ${className}`}>
      {/* Title & Instructions */}
      <div className="text-center space-y-1.5 select-none">
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-neutral-900 tracking-tight">
          Claim your username
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 font-normal">
          Choose the Basename handle that will represent you on Alloy.
        </p>
      </div>

      {/* The Signature Interactive Nametag Card (Matching Pivy Inspo) */}
      <div
        className={`relative w-full h-52 sm:h-60 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm select-none ${
          status === "available"
            ? "bg-[#007FFF] text-white border-4 border-[#007FFF] shadow-[0_12px_32px_rgba(0,127,255,0.22)]"
            : status === "taken"
            ? "bg-rose-50/80 text-neutral-900 border-4 border-rose-300 shadow-sm"
            : "bg-white text-neutral-700 border-2 border-dashed border-neutral-300 shadow-xs"
        }`}
      >
        {/* Top-Right: Playful Alloy Mascot Sticker Stamp */}
        <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform duration-300 ${
              status === "available"
                ? "bg-white/95 text-neutral-900 shadow-md scale-105"
                : "bg-neutral-100/90 text-neutral-400"
            }`}
          >
            {/* SVG Winking Coin Mascot Stamp */}
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 sm:w-11 sm:h-11"
            >
              {/* Outer Golden Coin Ring */}
              <circle
                cx="32"
                cy="32"
                r="28"
                fill={status === "available" ? "#FBBF24" : "#E5E7EB"}
              />
              <circle
                cx="32"
                cy="32"
                r="24"
                fill={status === "available" ? "#FDE68A" : "#F3F4F6"}
              />

              {/* Rosy Cheeks */}
              {status === "available" && (
                <>
                  <circle cx="21" cy="38" r="3" fill="#FF8A8A" fillOpacity="0.85" />
                  <circle cx="43" cy="38" r="3" fill="#FF8A8A" fillOpacity="0.85" />
                </>
              )}

              {/* Left Eye: Playful Wink */}
              <path
                d="M23 32C24.5 29 27.5 29 29 32"
                stroke="#111827"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Right Eye: Big Friendly Eye */}
              <ellipse cx="39" cy="31" rx="3" ry="4" fill="#111827" />
              <circle cx="40" cy="30" r="1.2" fill="#FFFFFF" />

              {/* Cheerful Smile */}
              <path
                d="M28 39C30.5 42.5 33.5 42.5 36 39"
                stroke="#111827"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Top Sparkle */}
              {status === "available" && (
                <path
                  d="M48 14L49 17L52 18L49 19L48 22L47 19L44 18L47 17L48 14Z"
                  fill="#F59E0B"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Top-Left: Privacy / Rail Badge */}
        <div className="flex items-center gap-1.5 text-xs font-normal">
          <ShieldCheck
            className={`w-4 h-4 ${
              status === "available" ? "text-white/80" : "text-neutral-400"
            }`}
          />
          <span
            className={status === "available" ? "text-white/90" : "text-neutral-400"}
          >
            Base Sepolia Stealth Nametag
          </span>
        </div>

        {/* Center / Bottom: The Formatted Handle Preview */}
        <div className="space-y-1">
          <div className="text-xs sm:text-sm font-normal uppercase tracking-wider opacity-80">
            Shareable Dividend Link
          </div>
          <div className="flex flex-wrap items-baseline gap-1 text-xl sm:text-2xl font-heading tracking-tight break-all">
            <span
              className={
                status === "available" ? "text-white/80 font-normal" : "text-neutral-400"
              }
            >
              alloy.base.eth/
            </span>
            <span
              className={`font-medium ${
                status === "available"
                  ? "text-white underline decoration-white/40 decoration-2 underline-offset-4"
                  : status === "taken"
                  ? "text-rose-600 line-through"
                  : "text-neutral-900"
              }`}
            >
              {sanitized || "yourname"}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Feedback Pill */}
      <div className="flex justify-center">
        {status === "available" && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-medium border border-[#BBF7D0] shadow-2xs">
            <Check className="w-3.5 h-3.5" />
            <span>Username is available!</span>
          </div>
        )}

        {status === "taken" && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium border border-rose-200 shadow-2xs">
            <X className="w-3.5 h-3.5" />
            <span>&quot;{sanitized}&quot; is already claimed on Base. Try another!</span>
          </div>
        )}

        {status === "too_short" && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neutral-100 text-neutral-500 text-xs font-normal border border-neutral-200">
            <span>Enter at least 3 characters</span>
          </div>
        )}

        {status === "empty" && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neutral-100 text-neutral-400 text-xs font-normal">
            <span>Type a handle below to check availability</span>
          </div>
        )}
      </div>

      {/* Live Input Field Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-3 sm:p-4 shadow-xs space-y-3">
        <label
          htmlFor="handle-input"
          className="block text-xs font-heading font-medium text-neutral-700 uppercase tracking-wider"
        >
          Choose Handle
        </label>

        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-neutral-400 font-mono text-sm select-none">
            @
          </span>
          <input
            id="handle-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. nebula, bob, alex"
            maxLength={20}
            className="w-full pl-8 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-[#F9FAFB] text-neutral-900 text-sm focus:outline-none focus:border-[#007FFF] focus:bg-white transition-all font-normal placeholder:text-neutral-400"
          />
          {inputVal && (
            <button
              onClick={() => setInputVal("")}
              aria-label="Clear input"
              className="absolute right-3 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-neutral-400 font-normal">Suggestions:</span>
          {["nebula", "stealth_whale", "base_builder", "bob", "div_king"].map((sug) => (
            <button
              key={sug}
              onClick={() => setInputVal(sug)}
              className="px-2.5 py-1 rounded-lg text-xs bg-neutral-100 hover:bg-[#E0F2FE] hover:text-[#007FFF] text-neutral-600 transition-colors cursor-pointer font-normal"
            >
              @{sug}
            </button>
          ))}
        </div>
      </div>

      {/* Rectangular Action Button (rounded-2xl, Azure Blue) */}
      <div>
        <Button
          variant="primary"
          size="lg"
          disabled={status !== "available"}
          onClick={handleContinue}
          className="w-full justify-center text-base"
        >
          {isClaimed ? (
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-white" />
              <span>Handle Claimed!</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
