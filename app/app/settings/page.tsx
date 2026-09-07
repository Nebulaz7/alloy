"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import {
  Pencil,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Globe,
  Wallet,
  LogOut,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Sliders,
  Lock,
  Coins,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { NavTabId } from "@/components/navigation/Sidebar";
import { Button } from "@/components/ui/Button";
import { QRCodeModal } from "@/components/modals/QRCodeModal";
import { CurrencyPickerModal } from "@/components/modals/CurrencyPickerModal";
import { ConnectedWalletsModal } from "@/components/modals/ConnectedWalletsModal";
import { LogoutModal } from "@/components/modals/LogoutModal";
import { EmojiColorPickerModal } from "@/components/profile/EmojiColorPickerModal";
import { useProfile } from "@/lib/store/profileStore";
import { ALLOY_ADDRESSES } from "@/lib/contracts/addresses";
import { openReownModal } from "@/lib/wagmi";

export default function SettingsPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { profile, updateProfile, setCurrency } = useProfile();

  // Modal visibility states
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showWalletsModal, setShowWalletsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Clipboard feedback states
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedContract, setCopiedContract] = useState<string | null>(null);

  // Preference switches
  const [autoStealth, setAutoStealth] = useState(true);
  const [anonymousAnnouncements, setAnonymousAnnouncements] = useState(true);

  // Tab switching
  const handleTabChange = (tab: NavTabId) => {
    if (tab === "settings") return;
    if (tab === "dashboard") router.push("/dashboard");
    else if (tab === "harvest") router.push("/harvest");
    else if (tab === "activities") router.push("/activities");
    else if (tab === "simulator") router.push("/simulator");
  };

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyContract = (name: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContract(name);
    setTimeout(() => setCopiedContract(null), 2000);
  };

  const handleConfirmLogout = () => {
    try {
      disconnect();
    } catch {}
    setShowLogoutModal(false);
    router.push("/login");
  };

  const displayAddress = address || profile.address;

  return (
    <AppShell
      activeTab="settings"
      onTabChange={handleTabChange}
      connectedHandle={profile.basename || "nebula.base.eth"}
      avatarEmoji={profile.avatarEmoji}
      avatarBg={profile.avatarBg}
      onEditAvatar={() => setShowAvatarPicker(true)}
      onOpenWallet={() => openReownModal("Account")}
    >
      <div className="space-y-6 select-none pb-12">
        {/* 1. Unauthenticated Preview Banner */}
        {!isConnected && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-neutral-800 font-normal">
              <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse shrink-0" />
              <span>
                You are in <strong>Preview Mode</strong>. Connect a Base wallet to customize your live profile onchain.
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/login")}
              className="shrink-0 cursor-pointer"
            >
              Connect Wallet
            </Button>
          </div>
        )}

        {/* 2. Profile & Identity Card */}
        <section className="bg-white rounded-3xl border-4 border-[#007FFF] shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading uppercase tracking-wider text-neutral-400 font-medium">
                  Identity & Basename
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                  Verified on Base
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-medium text-neutral-900 tracking-tight mt-1">
                Account Profile
              </h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/onboarding")}
              className="text-xs rounded-xl"
              leftIcon={<Pencil className="w-3 h-3 text-neutral-500" />}
            >
              <span>Change Handle</span>
            </Button>
          </div>

          {/* Profile Identity Details Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Avatar Squircle Button */}
              <div className="relative group shrink-0">
                <div
                  style={{ backgroundColor: profile.avatarBg }}
                  onClick={() => setShowAvatarPicker(true)}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-2xs cursor-pointer hover:opacity-90 transition-all group-hover:scale-105 select-none"
                >
                  <span>{profile.avatarEmoji}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  aria-label="Edit avatar"
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-neutral-200 shadow-xs flex items-center justify-center text-neutral-600 hover:text-[#007FFF] transition-colors cursor-pointer"
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Handle & Address Details */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-medium text-base sm:text-lg text-neutral-900 truncate">
                    {profile.basename || `${profile.username}.base.eth`}
                  </span>
                  <span className="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
                    ✓
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                  <span>
                    {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
                  </span>
                  <button
                    onClick={() => handleCopyAddress(displayAddress)}
                    className="hover:text-neutral-900 transition-colors p-0.5 cursor-pointer"
                    title="Copy full address"
                  >
                    {copiedAddress ? (
                      <Check className="w-3 h-3 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3 h-3 text-neutral-400" />
                    )}
                  </button>
                  <a
                    href={`https://sepolia.basescan.org/address/${displayAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#007FFF] transition-colors p-0.5"
                    title="View on BaseScan"
                  >
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions: Share / QR */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQrModal(true)}
                className="text-xs rounded-xl"
                leftIcon={<QrCode className="w-3.5 h-3.5 text-neutral-500" />}
              >
                <span>QR Code</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAvatarPicker(true)}
                className="text-xs rounded-xl"
              >
                <span>Customize</span>
              </Button>
            </div>
          </div>
        </section>

        {/* 3. Preferences & Currency Configuration */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007FFF]" />
            <h3 className="font-heading font-medium text-base sm:text-lg text-neutral-900">
              Preferences & Privacy Rails
            </h3>
          </div>

          <div className="divide-y divide-neutral-100">
            {/* Primary Display Currency */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-heading font-medium text-sm text-neutral-900">
                  Primary Currency Display
                </div>
                <div className="text-xs text-neutral-400 font-normal">
                  All portfolio totals and dividend figures calculate in this denomination
                </div>
              </div>

              <button
                onClick={() => setShowCurrencyModal(true)}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/60 text-neutral-800 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span className="font-mono text-sm">{profile.currencySymbol || "$"}</span>
                <span>{profile.currency || "USD"}</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>

            {/* Auto-Stealth Routing */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-heading font-medium text-sm text-neutral-900 flex items-center gap-2">
                  <span>Default to ERC-5564 Stealth Rails</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#007FFF] font-medium border border-[#BAE6FD]">
                    Privacy
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-normal">
                  Automatically generate fresh unlinkable stealth recipients on every dividend harvest
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoStealth}
                  onChange={(e) => setAutoStealth(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007FFF]"></div>
              </label>
            </div>

            {/* Anonymous Announcements */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-heading font-medium text-sm text-neutral-900">
                  Broadcast Stealth Announcements
                </div>
                <div className="text-xs text-neutral-400 font-normal">
                  Publish ERC-5564 view tags to the onchain announcer contract on Base Sepolia
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymousAnnouncements}
                  onChange={(e) => setAnonymousAnnouncements(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
              </label>
            </div>
          </div>
        </section>

        {/* 4. Connected Wallets & Key Management */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <h3 className="font-heading font-medium text-base sm:text-lg text-neutral-900">
                Connected Wallets &amp; Keys
              </h3>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWalletsModal(true)}
              className="text-xs rounded-xl"
              leftIcon={<Layers className="w-3.5 h-3.5 text-neutral-500" />}
            >
              <span>Manage Wallets</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Wallet 1: Primary EVM */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-heading font-medium text-xs sm:text-sm text-neutral-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#007FFF]" />
                  <span>Base Sepolia Injected Account</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-medium border border-[#BBF7D0]">
                  Connected
                </span>
              </div>
              <div className="text-xs text-neutral-500 font-mono break-all">
                {displayAddress}
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400">
                <span>EVM Signature Rail</span>
                <button
                  onClick={() => openReownModal("Account")}
                  className="text-[#007FFF] hover:underline cursor-pointer"
                >
                  Wallet Modal
                </button>
              </div>
            </div>

            {/* Wallet 2: Stealth Rail */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-heading font-medium text-xs sm:text-sm text-neutral-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>ERC-5564 Stealth Meta-Address</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] font-medium border border-[#DDD6FE]">
                  Active
                </span>
              </div>
              <div className="text-xs text-neutral-500 font-mono truncate">
                st:eth:0x0279be66...9ee5
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Unlinkable Private Payouts</span>
                <span className="text-neutral-600 font-medium">Secp256k1</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Verified Smart Contract Directory on Base Sepolia */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#007FFF] animate-pulse" />
              <h3 className="font-heading font-medium text-base sm:text-lg text-neutral-900">
                Verified Base Sepolia Contracts
              </h3>
            </div>
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#007FFF] hover:underline flex items-center gap-1"
            >
              <span>BaseScan Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {[
              {
                name: "Alloy Harvest Router",
                desc: "Autonomous dividend routing & non-custodial extraction",
                address: ALLOY_ADDRESSES.contracts.Alloy_HarvestRouter,
              },
              {
                name: "Apple Stock (AAPLc)",
                desc: "Rebasing tokenized equity with dynamic dividend multipliers",
                address: ALLOY_ADDRESSES.contracts.MockB20_AAPLc,
              },
              {
                name: "Nvidia Stock (NVDAc)",
                desc: "Rebasing tokenized equity with corporate cashflow rebase",
                address: ALLOY_ADDRESSES.contracts.MockB20_NVDAc,
              },
              {
                name: "Coinbase Stock (COINc)",
                desc: "Rebasing tokenized equity with Base Sepolia cash settlement",
                address: ALLOY_ADDRESSES.contracts.MockB20_COINc,
              },
              {
                name: "ERC-5564 Announcer",
                desc: "Unlinkable stealth announcement registry",
                address: ALLOY_ADDRESSES.contracts.ERC5564_Announcer,
              },
            ].map((contract) => (
              <div
                key={contract.name}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-heading font-medium text-neutral-900">
                    {contract.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-normal">
                    {contract.desc}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-neutral-600 bg-neutral-100 px-2 py-1 rounded-lg">
                    {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                  </span>
                  <button
                    onClick={() => handleCopyContract(contract.name, contract.address)}
                    className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    title="Copy address"
                  >
                    {copiedContract === contract.name ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={`https://sepolia.basescan.org/address/${contract.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-[#007FFF] transition-colors"
                    title="View on BaseScan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Session & Disconnect Section */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-heading font-medium text-neutral-900 text-sm sm:text-base">
              Session Management
            </h4>
            <p className="text-xs text-neutral-500 font-normal">
              Disconnect your wallet and reset local sessions on this device.
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={() => setShowLogoutModal(true)}
            className="shrink-0 rounded-2xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 text-xs"
            leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
          >
            <span>Log Out of Alloy</span>
          </Button>
        </section>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <QRCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          handle={profile.basename}
          address={displayAddress}
        />
      )}

      {/* Currency Selection Modal */}
      {showCurrencyModal && (
        <CurrencyPickerModal
          isOpen={showCurrencyModal}
          selectedCurrency={profile.currency}
          onSelectCurrency={(item) => {
            setCurrency(item.code as any);
            updateProfile({ currency: item.code as any });
            setShowCurrencyModal(false);
          }}
          onClose={() => setShowCurrencyModal(false)}
        />
      )}

      {/* Connected Wallets Management Modal */}
      {showWalletsModal && (
        <ConnectedWalletsModal
          isOpen={showWalletsModal}
          primaryAddress={displayAddress}
          onClose={() => setShowWalletsModal(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirmLogout={handleConfirmLogout}
        />
      )}

      {/* Avatar Emoji & Color Picker Modal */}
      {showAvatarPicker && (
        <EmojiColorPickerModal
          isOpen={showAvatarPicker}
          initialEmoji={profile.avatarEmoji}
          initialColor={profile.avatarBg}
          onClose={() => setShowAvatarPicker(false)}
          onSave={(emoji: string, color: string) => {
            updateProfile({ avatarEmoji: emoji, avatarBg: color });
            setShowAvatarPicker(false);
          }}
        />
      )}
    </AppShell>
  );
}
