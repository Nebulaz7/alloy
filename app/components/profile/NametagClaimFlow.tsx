"use client";

import React, { useState } from "react";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { InteractiveNametagCard } from "./InteractiveNametagCard";
import { ProfileAvatarCard, ProfileData } from "./ProfileAvatarCard";

interface NametagClaimFlowProps {
  initialUsername?: string;
  onComplete?: (profile: ProfileData) => void;
  className?: string;
}

export const NametagClaimFlow: React.FC<NametagClaimFlowProps> = ({
  initialUsername = "nebula",
  onComplete,
  className = "",
}) => {
  const [step, setStep] = useState<"claim" | "avatar_preview">("claim");
  const [profile, setProfile] = useState<ProfileData>({
    username: initialUsername,
    avatarEmoji: "🎧",
    avatarBg: "#18181B",
    address: "0xD5687794c8E1b69F477911Df56170679CB6414eC",
    isVerified: true,
  });

  const handleClaim = (claimedUsername: string) => {
    setProfile((prev) => ({ ...prev, username: claimedUsername }));
    setStep("avatar_preview");
  };

  return (
    <div className={`w-full max-w-xl mx-auto space-y-6 ${className}`}>
      {/* Top Flow Header with Back Navigation */}
      <div className="flex items-center justify-between px-2">
        {step === "avatar_preview" ? (
          <button
            onClick={() => setStep("claim")}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-neutral-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to username</span>
          </button>
        ) : (
          <div className="text-xs text-neutral-400 font-normal">
            Step 1 of 2: Identity Setup
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-[#007FFF] font-normal">
          <Sparkles className="w-3.5 h-3.5 text-[#007FFF]" />
          <span>Base Sepolia Rail</span>
        </div>
      </div>

      {/* Step Views */}
      {step === "claim" ? (
        <InteractiveNametagCard
          initialUsername={profile.username}
          onClaim={handleClaim}
        />
      ) : (
        <ProfileAvatarCard
          mode="welcome"
          profile={profile}
          onEditUsername={() => setStep("claim")}
          onContinue={() => onComplete?.(profile)}
        />
      )}
    </div>
  );
};
