"use client";

import React, { useState } from "react";
import { X, Search, Check } from "lucide-react";

export interface CurrencyItem {
  countryCode: string;
  code: string;
  name: string;
  symbol: string;
}

export const POPULAR_CURRENCIES: CurrencyItem[] = [
  { countryCode: "US", code: "USD", name: "US Dollar", symbol: "$" },
  { countryCode: "EU", code: "EUR", name: "Euro", symbol: "€" },
  { countryCode: "GB", code: "GBP", name: "British Pound", symbol: "£" },
  { countryCode: "NG", code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { countryCode: "ID", code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { countryCode: "JP", code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { countryCode: "SG", code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { countryCode: "MY", code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { countryCode: "AU", code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { countryCode: "CA", code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { countryCode: "CH", code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { countryCode: "BR", code: "BRL", name: "Brazilian Real", symbol: "R$" },
];

interface CurrencyPickerModalProps {
  isOpen: boolean;
  selectedCurrency?: string;
  onSelectCurrency: (currency: CurrencyItem) => void;
  onClose: () => void;
  className?: string;
}

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  isOpen,
  selectedCurrency = "USD",
  onSelectCurrency,
  onClose,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredCurrencies = POPULAR_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.countryCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Centered Card matching inspo Screenshot 2026-09-07 003002.png */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm sm:max-w-md bg-white rounded-[32px] border border-neutral-200/90 shadow-2xl p-5 sm:p-6 space-y-4 overflow-hidden max-h-[88vh] flex flex-col justify-between ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <h2 className="font-heading font-medium text-xl text-neutral-900 tracking-tight">
            Currency
          </h2>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input matching Screenshot 003002 */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search currency"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/80 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#007FFF] focus:bg-white transition-all font-normal"
          />
        </div>

        {/* Popular Section Label */}
        <div className="overflow-y-auto space-y-1 pr-1 -mr-1 flex-1">
          <div className="text-[11px] font-heading font-medium text-neutral-400 uppercase tracking-wider px-2 py-1">
            Popular
          </div>

          <div className="space-y-1">
            {filteredCurrencies.map((c) => {
              const isSelected = c.code.toLowerCase() === selectedCurrency.toLowerCase();

              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onSelectCurrency(c);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-[#DCFCE7]/70 text-neutral-900 border border-[#BBF7D0]"
                      : "hover:bg-neutral-100/70 text-neutral-700 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Country Code Pill */}
                    <span className="w-7 text-xs font-mono text-neutral-400 font-medium">
                      {c.countryCode}
                    </span>

                    {/* Currency Code & Name */}
                    <span className="font-heading font-medium text-sm text-neutral-900">
                      {c.code}
                    </span>
                    <span className="text-xs text-neutral-500 font-normal">
                      {c.name}
                    </span>
                  </div>

                  {/* Green Checkmark for Selected Currency matching inspo */}
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#10B981] stroke-[2.5]" />
                  )}
                </button>
              );
            })}

            {filteredCurrencies.length === 0 && (
              <div className="text-center py-8 text-xs text-neutral-400 font-normal">
                No currencies found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
