"use client";

import React from "react";
import { LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-[32px] border border-neutral-200/90 shadow-2xl p-6 text-center space-y-5"
      >
        {/* Top-Right Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Coral Red Logout Circle */}
        <div className="w-14 h-14 rounded-full bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center mx-auto shadow-xs">
          <LogOut className="w-7 h-7" />
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="font-heading font-medium text-xl text-neutral-900 tracking-tight">
            Log out of Alloy?
          </h3>
          <p className="text-xs text-neutral-500 font-normal leading-relaxed">
            You will be disconnected from your Base Sepolia session. You can reconnect anytime with your wallet or Basename identity.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            className="flex-1 justify-center rounded-2xl"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="md"
            onClick={onConfirmLogout}
            className="flex-1 justify-center rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] text-white"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};
