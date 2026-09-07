"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Wallet,
  Check,
  Lock,
  Eye,
  LogOut,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import { AlloyLogo } from "@/components/brand/AlloyLogo";
import { AlloyMascot } from "@/components/brand/AlloyMascot";
import { Button } from "@/components/ui/Button";
import { getAppKit } from "@/lib/wagmi";
import { useProfile } from "@/lib/store/profileStore";

export default function LoginPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { profile, updateProfile } = useProfile();
  const [connectingType, setConnectingType] = useState<
    "coinbase" | "reown" | null
  >(null);

  // Sync connected wallet address to profile store if changed
  useEffect(() => {
    if (isConnected && address && profile.address !== address) {
      updateProfile({ address });
    }
  }, [isConnected, address, profile.address, updateProfile]);

  // Handler 1: Connect via Coinbase Smart Wallet (Passkey / WebAuthn)
  const handleConnectCoinbase = async () => {
    setConnectingType("coinbase");
    try {
      const coinbaseConnector = connectors.find(
        (c) =>
          c.id === "coinbaseWalletSDK" ||
          c.id === "coinbaseWallet" ||
          c.name.toLowerCase().includes("coinbase"),
      );

      if (coinbaseConnector) {
        connect(
          { connector: coinbaseConnector },
          {
            onSuccess: () => {
              setConnectingType(null);
            },
            onError: () => {
              setConnectingType(null);
            },
          },
        );
      } else {
        // Fallback to Reown modal
        const appKit = getAppKit();
        appKit?.open();
        setConnectingType(null);
      }
    } catch {
      setConnectingType(null);
    }
  };

  // Handler 2: Connect via Reown AppKit Modal (MetaMask, WalletConnect, Rainbow, etc.)
  const handleConnectReown = () => {
    setConnectingType("reown");
    const appKit = getAppKit();
    if (appKit) {
      appKit.open();
    }
    setConnectingType(null);
  };

  // Handler 3: Continue in Demo / Preview Mode
  const handlePreviewMode = () => {
    // Navigate directly to app experience
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col justify-between selection:bg-[#E0F2FE] selection:text-[#007FFF]">
      {/* Top Simple Header */}
      <header className="w-full border-b border-neutral-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <AlloyLogo size="md" href="/" />

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#007FFF] text-xs font-normal border border-[#BAE6FD]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007FFF] animate-pulse" />
              Base Sepolia (84532)
            </span>

            <nav className="flex items-center gap-3 text-xs sm:text-sm text-neutral-600 font-normal">
              <a
                href="https://docs.base.org"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#007FFF] transition-colors flex items-center gap-1"
              >
                <span>Docs</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
              <a
                href="https://github.com/Nebulaz7/alloy"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#007FFF] transition-colors flex items-center gap-1"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200/80 shadow-xl shadow-blue-500/5 p-6 sm:p-8 space-y-6 select-none animate-in fade-in duration-300">
          {/* Header & Mascot Badge */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#007FFF] flex items-center justify-center text-3xl shadow-xs">
              <AlloyMascot
                size={36}
                className="transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-900">
              Connect to{" "}
              <span className="logo-font text-[#007FFF]"> alloy </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-normal max-w-xs mx-auto">
              Harvest tokenized stock dividends privately on Base Sepolia.
            </p>
          </div>

          {/* Connected State Banner (if already connected via Wagmi) */}
          {isConnected && address ? (
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs font-medium text-neutral-900">
                    Wallet Connected
                  </span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="text-xs text-neutral-400 hover:text-[#EF4444] transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Disconnect</span>
                </button>
              </div>

              <div className="font-mono text-xs font-medium text-neutral-800 bg-white/80 px-3 py-2 rounded-xl border border-[#BBF7D0]/60 flex items-center justify-between">
                <span>
                  {address.slice(0, 8)}...{address.slice(-6)}
                </span>
                <span className="text-[10px] text-[#10B981] font-sans font-medium px-2 py-0.5 rounded-full bg-[#DCFCE7]">
                  Base Active
                </span>
              </div>

              <Button
                variant="emerald"
                size="lg"
                onClick={() => router.push("/dashboard")}
                className="w-full justify-center text-sm py-3.5 shadow-xs"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            /* Unauthenticated Action Buttons */
            <div className="space-y-3 pt-1">
              {/* Button 1: Connect Coinbase Smart Wallet (Passkey / WebAuthn) */}
              <button
                type="button"
                onClick={handleConnectCoinbase}
                disabled={isPending && connectingType === "coinbase"}
                className="w-full p-4 rounded-2xl bg-[#0052FF] hover:bg-[#0045D8] active:scale-[0.99] text-white shadow-xs transition-all flex items-center justify-between cursor-pointer group disabled:opacity-75"
              >
                <div className="flex items-center gap-3">
                  {/* Coinbase Icon Squircle */}
                  <div className="w-9 h-9 rounded-xl bg-white text-[#0052FF] flex items-center justify-center shadow-xs shrink-0">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 fill-current"
                      aria-hidden="true"
                    >
                      <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM10.5 7.5H13.5C15.1569 7.5 16.5 8.84315 16.5 10.5V13.5C16.5 15.1569 15.1569 16.5 13.5 16.5H10.5C8.84315 16.5 7.5 15.1569 7.5 13.5V10.5C7.5 8.84315 8.84315 7.5 10.5 7.5Z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-white">
                      Coinbase Smart Wallet
                    </div>
                    <div className="text-xs text-white/80 font-normal flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 opacity-90" />
                      <span>Passkey / Zero Gas Setup</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Button 2: Connect Wallet (Reown AppKit Modal) */}
              <button
                type="button"
                onClick={handleConnectReown}
                disabled={isPending && connectingType === "reown"}
                className="w-full p-4 rounded-2xl bg-white hover:bg-neutral-50 active:scale-[0.99] text-neutral-900 border border-neutral-200 shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#007FFF] flex items-center justify-center shadow-2xs shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-neutral-900">
                      Connect Wallet
                    </div>
                    <div className="text-xs text-neutral-500 font-normal">
                      MetaMask, Rainbow, Phantom, 300+
                    </div>
                  </div>
                </div>
              </button>

              {/* Or Divider */}
              <div className="relative py-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200/70" />
                </div>
                <span className="relative bg-white px-3 text-xs text-neutral-400 font-normal uppercase tracking-wider">
                  or preview
                </span>
              </div>

              {/* Preview Option: Explore with Demo Profile */}
              <button
                type="button"
                onClick={handlePreviewMode}
                className="w-full py-3 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 active:scale-[0.99] text-neutral-700 text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-neutral-500" />
                <span>Continue in Preview Mode (nebula.base.eth)</span>
              </button>
            </div>
          )}

          {/* Privacy & Non-Custodial Security Explainer */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-start gap-2.5 text-neutral-500 text-xs leading-relaxed font-normal">
              <ShieldCheck className="w-4 h-4 text-[#007FFF] shrink-0 mt-0.5" />
              <span>
                Alloy is non-custodial. Equity shares remain 100% untouched.
                Accrued cash yields are routed privately via ERC-5564 stealth
                rails.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="w-full border-t border-neutral-200/70 bg-white/60 py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 font-normal">
          <div className="flex items-center gap-2">
            <span>Alloy © 2026</span>
            <span>•</span>
            <span>Base Sepolia Testnet</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://docs.base.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-800 transition-colors"
            >
              Docs
            </a>
            <span>•</span>
            <a
              href="https://github.com/Nebulaz7/alloy"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-800 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
