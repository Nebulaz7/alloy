"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { NametagClaimFlow } from "@/components/profile/NametagClaimFlow";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <NametagClaimFlow
      initialUsername="nebula"
      onBack={() => router.push("/")}
      onComplete={(profile) => {
        // Redirect to dashboard with saved profile
        router.push("/");
      }}
    />
  );
}
