"use client";

import { cookieStorage, createStorage, http } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/react";
import { type AppKitNetwork } from "@reown/appkit/networks";

// 1. Get Project ID from environment or fallback
export const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  "b56e18d47c72ab683b10814fe9495694"; // Demo public AppKit project ID fallback

export const networks = [baseSepolia, base] as [AppKitNetwork, ...AppKitNetwork[]];

// 2. Set up Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

// 3. AppKit Metadata
const metadata = {
  name: "Alloy",
  description: "Private Programmable Dividend Payout Rail for Equities on Base",
  url: "https://alloy.cash",
  icons: ["https://alloy.cash/favicon.ico"],
};

// 4. Initialize modal only on client-side
let appKitInstance: ReturnType<typeof createAppKit> | null = null;

export function getAppKit() {
  if (typeof window !== "undefined" && !appKitInstance) {
    try {
      appKitInstance = createAppKit({
        adapters: [wagmiAdapter],
        projectId,
        networks,
        defaultNetwork: baseSepolia,
        metadata,
        features: {
          analytics: false,
          email: false,
          socials: false,
        },
        themeMode: "light",
        themeVariables: {
          "--w3m-color-mix": "#007FFF",
          "--w3m-color-mix-strength": 15,
          "--w3m-border-radius-master": "16px",
          "--w3m-font-family": "var(--font-body, system-ui)",
        },
      });
    } catch {
      // Graceful fallback if Reown initialization is suppressed
    }
  }
  return appKitInstance;
}

// Auto-initialize in client environment
if (typeof window !== "undefined") {
  getAppKit();
}
