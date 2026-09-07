"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { NametagClaimFlow } from "@/components/profile/NametagClaimFlow";
import { useProfile } from "@/lib/store/profileStore";

export default function OnboardingPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { profile, updateProfile } = useProfile();

  const handleComplete = (claimedData: {
    username: string;
    avatarEmoji: string;
    avatarBg: string;
    address: string;
  }) => {
    // Persist claimed identity to local storage and store
    updateProfile({
      username: claimedData.username,
      basename: `${claimedData.username.replace(/\.base\.eth$/, "")}.base.eth`,
      avatarEmoji: claimedData.avatarEmoji,
      avatarBg: claimedData.avatarBg,
      address: address || claimedData.address,
      isClaimed: true,
      isVerified: true,
    });

    // Navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <NametagClaimFlow
      initialUsername={profile.username && profile.username !== "nebula" ? profile.username : ""}
      connectedAddress={address || profile.address}
      onBack={() => router.push("/login")}
      onComplete={handleComplete}
    />
  );
}
