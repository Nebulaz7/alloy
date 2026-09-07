"use client";

import React from "react";
import { AlloyLogo } from "@/components/brand/AlloyLogo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Wallet, ShieldCheck } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  connectedHandle?: string;
  onConnectWallet?: () => void;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  connectedHandle = "bob.base.eth",
  onConnectWallet,
  className = "",
}) => {
  return (
    <header
      className={`sticky top-0 z-40 bg-[#F9FAFB]/90 backdrop-blur-md border-b border-neutral-200/60 px-4 sm:px-6 py-4 flex items-center justify-between transition-all ${className}`}
    >
      {/* Left: Mobile Brand / Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo Only */}
        <div className="md:hidden">
          <AlloyLogo size="sm" showBeta={false} />
        </div>

        <div>
          <h1 className="font-heading font-medium text-xl sm:text-2xl text-neutral-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-neutral-400 font-normal hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Network Status & Wallet Pill */}
      <div className="flex items-center gap-2.5">
        {/* Base Sepolia Live Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200/80 text-xs font-normal text-neutral-600 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse" />
          <span>Base Sepolia</span>
        </div>

        {/* Connected Handle / Wallet Action Button */}
        {connectedHandle ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-neutral-200/80 text-xs text-neutral-700 shadow-2xs hover:border-[#4DA6FF] transition-colors cursor-pointer">
            <div className="w-5 h-5 rounded-lg bg-[#E0F2FE] flex items-center justify-center text-[#007FFF]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-neutral-800">{connectedHandle}</span>
          </div>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={onConnectWallet}
            className="flex items-center gap-1.5 text-xs"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Connect</span>
          </Button>
        )}
      </div>
    </header>
  );
};
