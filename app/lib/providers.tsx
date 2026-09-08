"use client";

import React, { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { ProfileProvider } from "@/lib/store/profileStore";
import { ActivityProvider } from "@/lib/store/activityStore";

// Suppress benign telemetry errors from third-party wallet SDKs
// (e.g. Coinbase Wallet SDK telemetry blocked by browser ad-blockers / Brave Shields)
if (typeof window !== "undefined") {
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    const first = typeof args[0] === "string" ? args[0] : "";
    const third = args[2] as { context?: string } | undefined;
    if (
      first.includes("Analytics SDK") ||
      third?.context === "AnalyticsSDKApiError"
    ) {
      // Ignored: ad-blocker blocked third-party analytics beacon
      return;
    }
    origError.apply(console, args);
  };
}

export function AlloyProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 4000,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ProfileProvider>
          <ActivityProvider>{children}</ActivityProvider>
        </ProfileProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
