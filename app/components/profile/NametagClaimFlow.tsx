"use client";

import React, { useState } from "react";
import { ChevronLeft, ShieldCheck, Sparkles } from "lucide-react";
import { InteractiveNametagCard } from "./InteractiveNametagCard";
import { ProfileAvatarCard, ProfileData } from "./ProfileAvatarCard";
import { AlloyLogo } from "@/components/brand/AlloyLogo";

interface NametagClaimFlowProps {
  initialUsername?: string;
  onComplete?: (profile: ProfileData) => void;
  onBack?: () => void;
  className?: string;
}

export const NametagClaimFlow: React.FC<NametagClaimFlowProps> = ({
  initialUsername = "nebula",
  onComplete,
  onBack,
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

  const handleBack = () => {
    if (step === "avatar_preview") {
      setStep("claim");
    } else {
      onBack?.();
    }
  };

  return (
    <div
      className={`min-h-screen w-full bg-[#F9FAFB] text-neutral-900 flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none ${className}`}
    >
      {/* Top Navigation Bar with Back Button matching Pivy inspo */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <AlloyLogo size="sm" showBeta={false} />

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200/80 text-xs text-neutral-600 shadow-2xs font-normal">
          <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse" />
          <span>Base Sepolia</span>
        </div>
      </header>

      {/* Main Centered Content (Full-Screen View) */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
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
      </main>

      {/* Bottom Footer Assurance */}
      <footer className="max-w-md w-full mx-auto text-center text-xs text-neutral-400 font-normal py-2 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
        <span>Self-custodial Basename identity on Base Sepolia</span>
      </footer>
    </div>
  );
};
