"use client";

import React from "react";
import { X, ShieldCheck } from "lucide-react";
import { StealthInboxCard } from "@/components/stealth/StealthInboxCard";

interface StealthInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const StealthInboxModal: React.FC<StealthInboxModalProps> = ({
  isOpen,
  onClose,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* Modal Close Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Stealth Inbox & Sweeper
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-2 sm:p-3 max-h-[80vh] overflow-y-auto">
          <StealthInboxCard className="!border-0 !shadow-none" />
        </div>
      </div>
    </div>
  );
};
