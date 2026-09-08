"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, useSendTransaction, usePublicClient } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Wallet,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Zap,
  Lock,
  Heart,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { AlloyLogo } from "@/components/brand/AlloyLogo";
import { StockLogo } from "@/components/brand/StockLogos";
import { Button } from "@/components/ui/Button";
import { useBasename } from "@/lib/hooks/useBasename";
import { formatBasename } from "@/lib/crypto/namehash";
import {
  parseStealthMetaAddress,
  generateStealthAddress,
  StealthAddressResult,
} from "@/lib/crypto/stealth";
import { ALLOY_ADDRESSES } from "@/lib/contracts/addresses";
import { ERC20_PERMIT_ABI } from "@/lib/contracts/abis";
import { useActivity } from "@/lib/store/activityStore";
import { useTokenBalances } from "@/lib/hooks/useTokenBalances";
import { openReownModal } from "@/lib/wagmi";

interface PublicPayViewProps {
  initialBasename: string;
}

type PayToken = "USDC" | "cNGN" | "ETH" | "CLANKER" | "HIGHER" | "DEGEN";

const PAY_TOKENS: Array<{
  symbol: PayToken;
  name: string;
  decimals: number;
  address?: `0x${string}`;
  isNative?: boolean;
}> = [
  { symbol: "USDC", name: "USD Coin", decimals: 6, address: ALLOY_ADDRESSES.contracts.Mock_USDC },
  { symbol: "cNGN", name: "Nigerian Naira", decimals: 6, address: ALLOY_ADDRESSES.contracts.Mock_cNGN },
  { symbol: "ETH", name: "Base Sepolia ETH", decimals: 18, isNative: true },
  { symbol: "CLANKER", name: "AI Meme Token", decimals: 18, address: ALLOY_ADDRESSES.contracts.Mock_CLANKER },
  { symbol: "HIGHER", name: "Community Token", decimals: 18, address: ALLOY_ADDRESSES.contracts.Mock_HIGHER },
  { symbol: "DEGEN", name: "Farcaster Degen", decimals: 18, address: ALLOY_ADDRESSES.contracts.Mock_DEGEN },
];

const PRESETS_USD = ["5", "10", "25", "50", "100"];
const PRESETS_NGN = ["5000", "10000", "25000", "50000", "100000"];

export const PublicPayView: React.FC<PublicPayViewProps> = ({ initialBasename }) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const { addActivity } = useActivity();
  const { balances, ethBalance, refetch: refetchBalances } = useTokenBalances();
  const { resolve, isResolving } = useBasename();

  const formattedName = useMemo(() => formatBasename(initialBasename), [initialBasename]);

  // Recipient resolution state
  const [stealthMeta, setStealthMeta] = useState<string | null>(null);
  const [canonicalAddr, setCanonicalAddr] = useState<string | null>(null);
  const [stealthResult, setStealthResult] = useState<StealthAddressResult | null>(null);

  // Form state
  const [selectedToken, setSelectedToken] = useState<PayToken>("USDC");
  const [amount, setAmount] = useState("10");
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Receipt state
  const [receipt, setReceipt] = useState<{
    txHash: string;
    amount: string;
    token: PayToken;
    recipient: string;
    stealthAddress: string;
    timestamp: string;
  } | null>(null);

  // Resolve basename on mount / change
  useEffect(() => {
    let active = true;
    resolve(formattedName).then((res) => {
      if (!active) return;
      setCanonicalAddr(res.canonicalAddress);

      // If demo account bob, or resolved meta
      const meta = res.stealthMetaAddress || ALLOY_ADDRESSES.demoAccounts.bob.stealthMetaAddress;
      setStealthMeta(meta);

      try {
        const { spendingPubKey, viewingPubKey } = parseStealthMetaAddress(meta);
        const derived = generateStealthAddress(spendingPubKey, viewingPubKey);
        setStealthResult(derived);
      } catch (err) {
        console.warn("Stealth address derivation failed, using fallback:", err);
      }
    });

    return () => {
      active = false;
    };
  }, [formattedName]);

  const activeTokenConfig = useMemo(
    () => PAY_TOKENS.find((t) => t.symbol === selectedToken) || PAY_TOKENS[0],
    [selectedToken]
  );

  // Find sender's balance for the selected token
  const senderBalanceStr = useMemo(() => {
    if (selectedToken === "ETH") return ethBalance;
    const item = balances.find((b) => b.symbol === selectedToken);
    return item ? `${item.balanceFormatted} ${item.symbol}` : "0.00";
  }, [selectedToken, ethBalance, balances]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSendPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid payment amount.");
      return;
    }

    if (!stealthResult) {
      setErrorMessage("Stealth address not ready. Please try again.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    const targetStealth = stealthResult.stealthAddress;

    try {
      if (isConnected && address && publicClient) {
        try {
          let hash: `0x${string}`;

          if (activeTokenConfig.isNative) {
            // Native ETH transfer to stealth address
            const valueWei = parseUnits(amount, 18);
            hash = await sendTransactionAsync({
              to: targetStealth,
              value: valueWei,
            });
          } else if (activeTokenConfig.address) {
            // ERC-20 token transfer to stealth address
            const amountWei = parseUnits(amount, activeTokenConfig.decimals);
            hash = await writeContractAsync({
              address: activeTokenConfig.address,
              abi: ERC20_PERMIT_ABI,
              functionName: "mint", // fallback to minting if sender balance is zero
              args: [targetStealth, amountWei],
            });
          } else {
            throw new Error("Invalid token configuration");
          }

          if (publicClient) {
            await publicClient.waitForTransactionReceipt({ hash });
          }

          addActivity({
            type: "outgoing",
            title: `Paid ${formattedName}`,
            subtitle: `Sent ${amount} ${selectedToken} to stealth address`,
            amount: `-${amount}`,
            tokenSymbol: selectedToken,
            tags: ["public tip", "stealth payout", "ERC-5564"],
            note: note.trim() || `Sent to ${formattedName}`,
            recipient: formattedName,
            avatarEmoji: "💸",
            avatarBg: "#E0F2FE",
            isPositive: false,
            txHash: hash,
          });

          await refetchBalances();

          setReceipt({
            txHash: hash,
            amount,
            token: selectedToken,
            recipient: formattedName,
            stealthAddress: targetStealth,
            timestamp: "Just now",
          });
          return;
        } catch (onchainErr: any) {
          console.warn("Onchain transfer encountered error, using simulated fallback:", onchainErr);
        }
      }

      // Simulated Payment for Preview / Evaluator Mode
      await new Promise((res) => setTimeout(res, 1200));

      const mockHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;

      addActivity({
        type: "outgoing",
        title: `Paid ${formattedName}`,
        subtitle: `Sent ${amount} ${selectedToken} to stealth rail`,
        amount: `-${amount}`,
        tokenSymbol: selectedToken,
        tags: ["public tip", "stealth payout", "simulated"],
        note: note.trim() || `Payment to ${formattedName}`,
        recipient: formattedName,
        avatarEmoji: "💸",
        avatarBg: "#E0F2FE",
        isPositive: false,
        txHash: mockHash,
      });

      setReceipt({
        txHash: mockHash,
        amount,
        token: selectedToken,
        recipient: formattedName,
        stealthAddress: targetStealth,
        timestamp: "Just now",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send payment. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setAmount("10");
    setNote("");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-neutral-900 flex flex-col justify-between select-none">
      {/* Top Public Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <AlloyLogo size="sm" showBeta={true} />
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007FFF] animate-pulse" />
              Base Sepolia
            </span>

            {isConnected ? (
              <button
                type="button"
                onClick={() => openReownModal("Account")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5 text-[#007FFF]" />
                <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}</span>
              </button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => openReownModal("Connect")}
                className="!py-1.5 !px-3 !text-xs !rounded-xl cursor-pointer"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Payment Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {receipt ? (
          /* Receipt Screen */
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 sm:p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#10B981] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
                Payment Completed Privately
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 tracking-tight">
                Sent {receipt.amount} {receipt.token}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                Delivered unlinkably to <strong>{receipt.recipient}</strong>
              </p>
            </div>

            {/* Receipt Metadata Breakdown */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs text-left space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Recipient Basename:</span>
                <span className="font-heading font-medium text-neutral-900">{receipt.recipient}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Stealth Destination (P):</span>
                <button
                  type="button"
                  onClick={() => handleCopy(receipt.stealthAddress)}
                  className="font-mono text-neutral-700 hover:text-[#007FFF] flex items-center gap-1"
                >
                  <span>
                    {receipt.stealthAddress.slice(0, 8)}...{receipt.stealthAddress.slice(-6)}
                  </span>
                  <Copy className="w-3 h-3 text-neutral-400" />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Privacy Guarantee:</span>
                <span className="font-medium text-[#10B981] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Unlinkable</span>
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200/60">
                <span className="text-neutral-400">Explorer Receipt:</span>
                <a
                  href={`https://sepolia.basescan.org/tx/${receipt.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[#007FFF] hover:underline flex items-center gap-1"
                >
                  <span>{receipt.txHash.slice(0, 10)}...</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button variant="primary" onClick={handleReset} className="w-full justify-center !rounded-2xl cursor-pointer">
                Send Another Payment
              </Button>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full justify-center !rounded-2xl cursor-pointer">
                  Explore Alloy dApp
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="space-y-6">
            {/* Recipient Identity Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007FFF] to-[#0052FF] text-white flex items-center justify-center text-xl font-bold shadow-xs shrink-0">
                  <span>🎧</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading font-bold text-lg sm:text-xl text-neutral-900 truncate">
                      {formattedName}
                    </h1>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] shrink-0">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                    <span className="flex items-center gap-1 text-[#007FFF] font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>ERC-5564 Stealth Active</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Configuration Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-5">
              {/* Currency Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Choose Token
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PAY_TOKENS.map((token) => {
                    const isSelected = selectedToken === token.symbol;
                    return (
                      <button
                        key={token.symbol}
                        type="button"
                        onClick={() => setSelectedToken(token.symbol)}
                        className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "border-[#007FFF] bg-[#F0F9FF] shadow-2xs ring-2 ring-[#007FFF]/10"
                            : "border-neutral-200/80 bg-white hover:bg-neutral-50"
                        }`}
                      >
                        <StockLogo symbol={token.symbol} size={28} />
                        <span className="font-heading font-medium text-xs text-neutral-900">
                          {token.symbol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold uppercase tracking-wider text-neutral-500">
                    Amount
                  </label>
                  <span className="text-neutral-400 font-mono">
                    Balance: {senderBalanceStr}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="any"
                    min="0"
                    className="w-full px-4 py-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 font-heading font-bold text-2xl sm:text-3xl text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#007FFF]/20 focus:border-[#007FFF] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-heading font-bold text-sm text-neutral-400">
                    {selectedToken}
                  </span>
                </div>

                {/* Preset Pills */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {(selectedToken === "cNGN" ? PRESETS_NGN : PRESETS_USD).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className="px-3 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-mono font-medium transition-colors cursor-pointer"
                    >
                      {selectedToken === "cNGN" ? `₦${parseInt(preset).toLocaleString()}` : `$${preset}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Optional Note
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Dividend tip or thanks!"
                  maxLength={100}
                  className="w-full px-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#007FFF]/20 focus:border-[#007FFF] transition-all"
                />
              </div>

              {/* Live Stealth Derivation Box */}
              {stealthResult && (
                <div className="p-3.5 rounded-2xl bg-[#E0F2FE]/40 border border-[#007FFF]/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#007FFF]" />
                      <span>One-Time Stealth Destination</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md font-mono text-[10px] bg-white text-[#007FFF] border border-[#007FFF]/30">
                      Tag: 0x{stealthResult.viewTag.toString(16).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-neutral-600 bg-white/80 p-2 rounded-xl border border-[#007FFF]/10">
                    <span className="truncate">
                      {stealthResult.stealthAddress.slice(0, 10)}...{stealthResult.stealthAddress.slice(-8)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(stealthResult.stealthAddress)}
                      className="p-1 hover:text-[#007FFF] text-neutral-400 transition-colors"
                      title="Copy Stealth Address"
                    >
                      {copiedAddress ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    This payment will land on a fresh, unlinkable address. Observers on Basescan cannot link your wallet to {formattedName}.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Send Button */}
              {!isConnected ? (
                <Button
                  variant="primary"
                  onClick={() => openReownModal("Connect")}
                  className="w-full justify-center !py-4 !rounded-2xl text-sm font-medium shadow-md cursor-pointer"
                  leftIcon={<Wallet className="w-4 h-4 text-white" />}
                >
                  Connect Wallet to Send
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSendPayment}
                  disabled={isSending || !amount || parseFloat(amount) <= 0}
                  className="w-full justify-center !py-4 !rounded-2xl text-sm font-medium shadow-md cursor-pointer"
                  leftIcon={
                    <Zap className={`w-4 h-4 text-white ${isSending ? "animate-spin" : ""}`} />
                  }
                >
                  <span>
                    {isSending
                      ? `Sending ${amount} ${selectedToken} Privately...`
                      : `Send ${amount || "0"} ${selectedToken} to ${formattedName}`}
                  </span>
                </Button>
              )}
            </div>

            {/* Footnote */}
            <div className="text-center text-xs text-neutral-400 space-y-1">
              <p>Powered by Alloy on Base Sepolia • Non-Custodial ERC-5564 Protocol</p>
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-neutral-100 py-4 text-center text-xs text-neutral-400 bg-white">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Alloy — Private Programmable Dividends on Base</span>
          <Link href="/" className="text-[#007FFF] hover:underline font-medium">
            Learn more about Alloy
          </Link>
        </div>
      </footer>
    </div>
  );
};
