"use client";

import React, { useState } from "react";
import { Pencil, Check, ShieldCheck, Copy } from "lucide-react";
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

  const handleCopyAddress = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(profile.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Welcome / Onboarding Mode (Faithfully matching inspo Screenshot 2026-09-07 003324.png)
  if (mode === "welcome") {
    return (
      <div
        className={`w-full max-w-sm sm:max-w-md mx-auto text-center space-y-8 select-none ${className}`}
      >
        {/* Welcome Heading */}
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-heading font-medium text-neutral-900 tracking-tight">
            Hi, {profile.username}!
          </h2>
          <p className="text-sm sm:text-base text-neutral-500 font-normal">
            Let&apos;s set up your account!
          </p>
        </div>

        {/* Big Avatar Centerpiece with Floating Edit Badge (Pivy inspo) */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative group">
            {/* Main Circular Avatar */}
            <button
              type="button"
              onClick={onEditAvatar}
              aria-label="Customize avatar"
              style={{ backgroundColor: profile.avatarBg }}
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center text-6xl sm:text-7xl shadow-md cursor-pointer transition-transform duration-200 group-hover:scale-105 select-none"
            >
              <span>{profile.avatarEmoji}</span>
            </button>

            {/* Floating Edit Pencil Badge */}
            <button
              type="button"
              onClick={onEditAvatar}
              aria-label="Edit avatar emoji and color"
              className="absolute bottom-2 right-2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 hover:text-[#007FFF] hover:border-[#007FFF] transition-all cursor-pointer group-hover:scale-110"
            >
              <Pencil className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>

          {/* Subtle Claimed Basename Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200/70 text-xs text-neutral-700">
            <span className="font-medium">{profile.username}.base.eth</span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[9px]">
              ✓
            </span>
          </div>
        </div>

        {/* Action Button: Rectangular with rounded edges in Emerald Green matching inspo */}
        <div className="pt-2">
          <Button
            variant="emerald"
            size="lg"
            onClick={onContinue}
            className="w-full justify-center text-base sm:text-lg rounded-2xl shadow-xs py-4"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Settings Profile View (Matching inspo Screenshot 2026-09-07 002947.png & 003017.png)
  return (
    <div
      className={`bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4 select-none ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-medium text-neutral-900 text-lg">
          Profile &amp; Identity
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-xl bg-[#E0F2FE] text-[#007FFF] font-normal border border-[#BAE6FD]">
          Base Sepolia
        </span>
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-100 gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar with Custom Background */}
          <div
            style={{ backgroundColor: profile.avatarBg }}
            onClick={onEditAvatar}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-2xs cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          >
            <span>{profile.avatarEmoji}</span>
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="font-heading font-medium text-base text-neutral-900 truncate">
              {profile.username}.base.eth
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
          className="px-4 py-2 rounded-xl bg-neutral-200/80 hover:bg-neutral-300/80 text-neutral-800 text-xs font-normal transition-colors cursor-pointer shrink-0"
        >
          Edit
        </button>
      </div>
    </div>
  );
};
