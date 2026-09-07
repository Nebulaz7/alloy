"use client";

import React, { useState } from "react";
import { Copy, Check, QrCode, ExternalLink, MoreHorizontal, ShieldCheck } from "lucide-react";

interface PersonalLinkCardProps {
  title?: string;
  subtitle?: string;
  handle?: string;
  avatarEmoji?: string;
  avatarBg?: string;
  onShowQr?: () => void;
  onOpenLink?: () => void;
  className?: string;
}

export const PersonalLinkCard: React.FC<PersonalLinkCardProps> = ({
  title = "Your Personal Link",
  subtitle = "Share to receive dividends privately",
  handle = "bob.base.eth",
  avatarEmoji = "🎧",
  avatarBg = "#007FFF",
  onShowQr,
  onOpenLink,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-3.5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-medium text-neutral-900 text-base">{title}</h3>
          <p className="text-xs text-neutral-400 font-normal">{subtitle}</p>
        </div>

        {/* Options Menu Button */}
        <button
          aria-label="More options"
          className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Link Bar Container */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#F9FAFB] border border-neutral-100 gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Avatar Icon Circle */}
          <div
            style={{ backgroundColor: avatarBg }}
            className="w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-2xs text-lg"
          >
            <span>{avatarEmoji}</span>
          </div>

          {/* Handle Text */}
          <span className="font-heading font-medium text-neutral-900 text-sm sm:text-base truncate">
            {handle}
          </span>
        </div>

        {/* Action Buttons with Rectangular Rounded Edges */}
        <div className="flex items-center gap-1.5 shrink-0 text-neutral-500">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy link"}
            className="px-2.5 py-1.5 rounded-xl hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 text-xs font-normal transition-colors flex items-center gap-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#007FFF]" />
                <span className="text-[#007FFF] font-medium">Copied</span>
              </>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* QR Button */}
          {onShowQr ? (
            <button
              onClick={onShowQr}
              title="Show QR Code"
              className="p-2 rounded-xl hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
            </button>
          ) : null}

          {/* Open Link Button */}
          {onOpenLink ? (
            <button
              onClick={onOpenLink}
              title="Open Link"
              className="p-2 rounded-xl hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
