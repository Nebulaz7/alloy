"use client";

import React, { useState } from "react";
import { Pencil, Check, ShieldCheck, Sparkles, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ProfileData {
  username: string;
  avatarEmoji: string;
  avatarBg: string;
  address: string;
  isVerified?: boolean;
}

interface ProfileAvatarCardProps {
  profile?: ProfileData;
  mode?: "welcome" | "settings";
  onEditAvatar?: () => void;
  onEditUsername?: () => void;
  onContinue?: () => void;
  className?: string;
}

const defaultProfile: ProfileData = {
  username: "nebula",
  avatarEmoji: "🎧",
  avatarBg: "#18181B",
  address: "0xD5687794c8E1b69F477911Df56170679CB6414eC",
  isVerified: true,
};

export const ProfileAvatarCard: React.FC<ProfileAvatarCardProps> = ({
  profile = defaultProfile,
  mode = "welcome",
  onEditAvatar,
  onEditUsername,
  onContinue,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(profile.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Welcome / Onboarding Mode (Matching Screenshot 2026-09-07 003324.png)
  if (mode === "welcome") {
    return (
      <div className={`w-full max-w-md mx-auto text-center space-y-7 select-none ${className}`}>
        {/* Welcome Heading */}
        <div className="space-y-1.5">
          <h2 className="text-3xl sm:text-4xl font-heading font-medium text-neutral-900 tracking-tight">
            Hi, {profile.username}!
          </h2>
          <p className="text-sm text-neutral-500 font-normal">
            Let&apos;s set up your private dividend account!
          </p>
        </div>

        {/* Big Avatar Centerpiece with Floating Edit Badge */}
        <div className="flex justify-center">
          <div className="relative group">
            {/* The Main Circular Avatar */}
            <div
              style={{ backgroundColor: profile.avatarBg }}
              onClick={onEditAvatar}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-md cursor-pointer transition-transform duration-200 group-hover:scale-105 select-none"
            >
              <span>{profile.avatarEmoji}</span>
            </div>

            {/* Floating Edit Pencil Badge */}
            <button
              onClick={onEditAvatar}
              aria-label="Edit avatar emoji and background"
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 hover:text-[#007FFF] hover:border-[#007FFF] transition-all cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Claimed Handle & Stealth Info */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-xs space-y-2 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-medium text-neutral-400 uppercase tracking-wider">
                Claimed Basename
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-[10px] font-medium border border-[#BBF7D0] flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />
                <span>Verified</span>
              </span>
            </div>

            {onEditUsername && (
              <button
                onClick={onEditUsername}
                className="text-xs text-[#007FFF] hover:text-[#0066FF] font-normal transition-colors cursor-pointer"
              >
                Change
              </button>
            )}
          </div>

          <div className="font-heading font-medium text-lg text-neutral-900">
            {profile.username}.base.eth
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#007FFF]" />
              <span className="font-mono text-[11px] text-neutral-400">
                {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
              </span>
            </div>

            <button
              onClick={handleCopyAddress}
              className="hover:text-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3 text-neutral-400" />
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Action Button: Rectangular with rounded edges in Azure Blue */}
        <div>
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
            className="w-full justify-center text-base"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Settings Profile View (Matching Screenshot 2026-09-07 003017.png)
  return (
    <div
      className={`bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4 select-none ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-medium text-neutral-900 text-lg">
          Profile & Identity
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-xl bg-[#E0F2FE] text-[#007FFF] font-normal border border-[#BAE6FD]">
          Base Sepolia
        </span>
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-100">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Custom Background */}
          <div
            style={{ backgroundColor: profile.avatarBg }}
            onClick={onEditAvatar}
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span>{profile.avatarEmoji}</span>
          </div>

          <div className="space-y-0.5">
            <div className="font-heading font-medium text-base text-neutral-900">
              @{profile.username}
            </div>
            <div className="text-xs text-neutral-400 font-normal font-mono flex items-center gap-1.5">
              <span>
                {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
              </span>
              <button
                onClick={handleCopyAddress}
                aria-label="Copy address"
                className="hover:text-neutral-700 transition-colors p-0.5 cursor-pointer"
              >
                <Copy className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Edit Button Pill (Rectangular rounded as in inspo) */}
        <button
          onClick={onEditAvatar}
          className="px-4 py-2 rounded-xl bg-neutral-200/80 hover:bg-neutral-300/80 text-neutral-800 text-xs font-normal transition-colors cursor-pointer"
        >
          Edit
        </button>
      </div>
    </div>
  );
};
