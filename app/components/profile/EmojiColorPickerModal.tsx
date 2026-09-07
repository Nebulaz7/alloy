"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Dices } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface EmojiColorPickerProps {
  isOpen?: boolean;
  initialEmoji?: string;
  initialColor?: string;
  onSave?: (emoji: string, color: string) => void;
  onClose?: () => void;
  className?: string;
}

export const PLAYFUL_COLORS = [
  { id: "obsidian", hex: "#18181B", name: "Obsidian" },
  { id: "azure", hex: "#007FFF", name: "Azure Blue" },
  { id: "sky", hex: "#4DA6FF", name: "Sky Blue" },
  { id: "lavender", hex: "#A78BFA", name: "Lavender" },
  { id: "pink", hex: "#F472B6", name: "Bubblegum" },
  { id: "mint", hex: "#34D399", name: "Mint" },
  { id: "sunflower", hex: "#FBBF24", name: "Sunflower" },
  { id: "coral", hex: "#FB7185", name: "Coral" },
  { id: "tangerine", hex: "#FB923C", name: "Tangerine" },
  { id: "emerald", hex: "#059669", name: "Emerald" },
];

export const PLAYFUL_EMOJIS = [
  // Row 1 (Exact from inspo screenshot)
  "🔗", "💰", "💳", "💎", "💖", "💙", "🎁", "⭐",
  // Row 2 (Exact from inspo screenshot)
  "☕", "🍕", "🍺", "🎂", "🚀", "👑", "✨", "🎯",
  // Row 3 (Tech, crypto & gaming)
  "🎧", "🔒", "🔥", "🪙", "🏆", "😎", "👻", "🤖",
  // Row 4 (Fintech & mythical)
  "⚡", "🔮", "🛡️", "🍀", "🦁", "🦄", "🎩", "🌈",
];

export const EmojiColorPickerModal: React.FC<EmojiColorPickerProps> = ({
  isOpen = true,
  initialEmoji = "🎧",
  initialColor = "#18181B",
  onSave,
  onClose,
  className = "",
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState(initialEmoji);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [isWiggling, setIsWiggling] = useState(false);

  useEffect(() => {
    setSelectedEmoji(initialEmoji);
    setSelectedColor(initialColor);
  }, [initialEmoji, initialColor]);

  if (!isOpen) return null;

  const handleSurpriseMe = () => {
    setIsWiggling(true);
    const randomColor = PLAYFUL_COLORS[Math.floor(Math.random() * PLAYFUL_COLORS.length)].hex;
    const randomEmoji = PLAYFUL_EMOJIS[Math.floor(Math.random() * PLAYFUL_EMOJIS.length)];
    setSelectedColor(randomColor);
    setSelectedEmoji(randomEmoji);
    setTimeout(() => setIsWiggling(false), 500);
  };

  const handleSelectColor = (hex: string) => {
    setSelectedColor(hex);
  };

  const handleSelectEmoji = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  const handleSave = () => {
    onSave?.(selectedEmoji, selectedColor);
    onClose?.();
  };

  const handleCancel = () => {
    setSelectedEmoji(initialEmoji);
    setSelectedColor(initialColor);
    onClose?.();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Centered Modal Card matching inspo Screenshot 2026-09-07 003348.png */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm sm:max-w-md bg-white rounded-[32px] border border-neutral-200/90 shadow-2xl p-5 sm:p-7 space-y-5 sm:space-y-6 overflow-hidden max-h-[92vh] flex flex-col justify-between ${className}`}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between shrink-0">
          <h2 className="font-heading font-medium text-lg sm:text-xl text-neutral-900 tracking-tight">
            Emoji &amp; Color Picker
          </h2>

          <button
            onClick={handleCancel}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto space-y-5 sm:space-y-6 pr-1 -mr-1">
          {/* Big Centerpiece Avatar Preview */}
          <div className="flex flex-col items-center justify-center space-y-3 pt-1">
            <div
              style={{ backgroundColor: selectedColor }}
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center text-6xl sm:text-7xl shadow-md transition-all duration-300 ${
                isWiggling ? "scale-110 rotate-6" : "scale-100"
              }`}
            >
              <span className="drop-shadow-xs">{selectedEmoji}</span>
            </div>

            {/* "Surprise me!" Dice Pill Button */}
            <button
              type="button"
              onClick={handleSurpriseMe}
              className="px-4 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-normal transition-all duration-150 flex items-center gap-1.5 border border-neutral-200/60 shadow-2xs cursor-pointer active:scale-95"
            >
              <Dices
                className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${
                  isWiggling ? "rotate-180 scale-110" : ""
                }`}
              />
              <span>Surprise me!</span>
            </button>
          </div>

          {/* 10 Solid Playful Color Swatches */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-heading font-medium text-neutral-400 uppercase tracking-wider">
                Background Color
              </span>
              <span className="text-[11px] text-neutral-400 font-normal">
                {PLAYFUL_COLORS.find(
                  (c) => c.hex.toLowerCase() === selectedColor.toLowerCase()
                )?.name || "Custom"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 sm:gap-1.5 px-0.5">
              {PLAYFUL_COLORS.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleSelectColor(color.hex)}
                    aria-label={color.name}
                    style={{ backgroundColor: color.hex }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-150 cursor-pointer relative shrink-0 ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-[#007FFF] scale-110 shadow-sm"
                        : "hover:scale-105 opacity-90 hover:opacity-100"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Curated Grid of Playful Emojis (8 columns matching inspo) */}
          <div className="space-y-2">
            <div className="text-[11px] font-heading font-medium text-neutral-400 uppercase tracking-wider px-1">
              Choose Avatar Emoji
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
              {PLAYFUL_EMOJIS.map((emoji) => {
                const isSelected = selectedEmoji === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectEmoji(emoji)}
                    className={`h-11 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#E0F2FE] border-2 border-[#007FFF] scale-105 shadow-2xs"
                        : "bg-neutral-100/70 hover:bg-neutral-200/70 border border-transparent"
                    }`}
                  >
                    <span>{emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons: Cancel and Save Avatar */}
        <div className="pt-2 shrink-0 flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleCancel}
            className="flex-1 justify-center text-sm sm:text-base rounded-2xl"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleSave}
            className="flex-1 justify-center text-sm sm:text-base rounded-2xl"
          >
            Save Avatar
          </Button>
        </div>
      </div>
    </div>
  );
};
