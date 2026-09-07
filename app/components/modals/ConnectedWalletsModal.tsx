"use client";

import React, { useState } from "react";
import { X, Copy, Check, ShieldCheck, ExternalLink, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConnectedWalletsModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryAddress?: string;
  className?: string;
}

interface WalletEntry {
  id: string;
  name: string;
  type: string;
  address: string;
  iconBg: string;
  symbol: string;
  mockKey: string;
}

export const ConnectedWalletsModal: React.FC<ConnectedWalletsModalProps> = ({
  isOpen,
  onClose,
  primaryAddress = "0xD5687794c8E1b69F477911Df56170679CB6414eC",
  className = "",
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportingWallet, setExportingWallet] = useState<WalletEntry | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  if (!isOpen) return null;

  const wallets: WalletEntry[] = [
    {
      id: "base",
      name: "Base Sepolia Primary",
      type: "EVM Injected / Metamask",
      address: primaryAddress,
      iconBg: "#0052FF",
      symbol: "🔵",
      mockKey: "0x4c0883a69102934a6210492810482014b9281048201948201948201481920481",
    },
    {
      id: "coinbase",
      name: "Coinbase Smart Wallet",
      type: "Passkey / WebAuthn Account",
      address: "0xeca69284102948b20148b1029482014879182048",
      iconBg: "#007FFF",
      symbol: "🛡️",
      mockKey: "passkey:webauthn:credential:alloy:0xeca69284102948b20148b1029482014879182048",
    },
    {
      id: "stealth",
      name: "ERC-5564 Stealth Meta-Address",
      type: "Unlinkable Private Payout Rail",
      address: "st:eth:0x0279c81048b20148192048128ba014920184b291048ba9201482910482",
      iconBg: "#8B5CF6",
      symbol: "⚡",
      mockKey: "spending_key:0x9182048102948102948102948102948102948102948102948102948102948102",
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Centered Modal Card matching inspo Screenshot 2026-09-07 003017.png */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm sm:max-w-md bg-white rounded-[32px] border border-neutral-200/90 shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden max-h-[92vh] flex flex-col justify-between ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <h2 className="font-heading font-medium text-xl text-neutral-900 tracking-tight">
            Connected Wallets
          </h2>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-4 pr-1 -mr-1 flex-1">
          {exportingWallet ? (
            /* Export Key View */
            <div className="space-y-4 p-4 rounded-2xl bg-[#FEF2F2]/60 border border-[#FECACA] animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="text-xs font-heading font-medium text-[#DC2626] uppercase tracking-wider">
                  Export Credentials: {exportingWallet.name}
                </div>
                <button
                  onClick={() => {
                    setExportingWallet(null);
                    setShowPrivateKey(false);
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-800"
                >
                  Back
                </button>
              </div>

              <p className="text-xs text-neutral-600 font-normal leading-relaxed">
                Never disclose your private key or passkey credentials. Anyone with these keys can control this wallet.
              </p>

              <div className="p-3 rounded-xl bg-white border border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">Private Key / Secret</span>
                  <button
                    type="button"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="text-xs text-[#007FFF] flex items-center gap-1 cursor-pointer"
                  >
                    {showPrivateKey ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> <span>Reveal</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="font-mono text-xs text-neutral-800 break-all select-all">
                  {showPrivateKey ? exportingWallet.mockKey : "••••••••••••••••••••••••••••••••••••••••••••••••"}
                </div>
              </div>

              <Button
                size="sm"
                variant="primary"
                className="w-full justify-center text-xs"
                onClick={() => {
                  handleCopy("exported-key", exportingWallet.mockKey);
                }}
              >
                {copiedId === "exported-key" ? "Copied Key!" : "Copy Key to Clipboard"}
              </Button>
            </div>
          ) : (
            /* Wallet Cards List matching inspo */
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-[#BAE6FD] transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Wallet Icon Circle */}
                    <div
                      style={{ backgroundColor: wallet.iconBg }}
                      className="w-11 h-11 rounded-full text-white flex items-center justify-center text-lg shadow-xs shrink-0"
                    >
                      <span>{wallet.symbol}</span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="font-heading font-medium text-sm text-neutral-900 truncate">
                        {wallet.name}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
                        <span>
                          {wallet.address.slice(0, 7)}...{wallet.address.slice(-4)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(wallet.id, wallet.address)}
                          aria-label="Copy address"
                          className="hover:text-neutral-700 p-0.5 transition-colors cursor-pointer"
                        >
                          {copiedId === wallet.id ? (
                            <Check className="w-3 h-3 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3 h-3 text-neutral-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* "Export |->" Pill Button matching Screenshot 003017 */}
                  <button
                    type="button"
                    onClick={() => setExportingWallet(wallet)}
                    className="px-3.5 py-1.5 rounded-full bg-neutral-200/70 hover:bg-neutral-300 text-neutral-800 text-xs font-normal transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <span>Export</span>
                    <span className="font-mono text-neutral-500">|→</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Educational Note (Exact text from inspo Screenshot 003017) */}
          <div className="pt-2 px-2 text-center">
            <p className="text-xs text-neutral-400 font-normal leading-relaxed">
              Your connected wallets are only used to cryptographically generate your private payment address. They are never used for transactions, ensuring your payment activity remains separate and private.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="w-full justify-center text-sm rounded-2xl"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
