"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface AlloyBetaPromoCardProps {
  onLearnMore?: () => void;
  className?: string;
}

export const AlloyBetaPromoCard: React.FC<AlloyBetaPromoCardProps> = ({
  onLearnMore,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Promo Card Container */}
      <div
        onClick={onLearnMore}
        className="rounded-3xl bg-white border border-neutral-200/80 shadow-xs overflow-hidden cursor-pointer group hover:border-[#4DA6FF] transition-all duration-200"
      >
        {/* Playful Banner Illustration with Mascot & Friends */}
        <div className="h-28 bg-[#F0F8FF] relative overflow-hidden flex items-center justify-center select-none border-b border-neutral-100">
          <svg
            viewBox="0 0 240 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover"
          >
            {/* Soft Wavy Path */}
            <path
              d="M-20 60 C40 30, 100 80, 160 45 C200 20, 240 50, 270 40 L270 120 L-20 120 Z"
              fill="#E0F2FE"
              fillOpacity="0.8"
            />
            
            {/* Floating Gold Coin Doodles */}
            <circle cx="28" cy="24" r="6" fill="#FBBF24" />
            <circle cx="28" cy="24" r="4.5" stroke="#F59E0B" strokeWidth="1" />
            
            <circle cx="215" cy="28" r="5" fill="#FBBF24" />
            
            {/* Sparkles */}
            <path d="M70 18L71.5 22L75.5 23.5L71.5 25L70 29L68.5 25L64.5 23.5L68.5 22L70 18Z" fill="#38BDF8" />
            <path d="M190 14L191 17L194 18L191 19L190 22L189 19L186 18L189 17L190 14Z" fill="#F43F5E" />

            {/* Little Cute Blobs Row at the bottom */}
            {/* Coral Blob */}
            <circle cx="16" cy="88" r="16" fill="#EF4444" />
            <circle cx="13" cy="84" r="1.5" fill="#FFFFFF" />
            <circle cx="19" cy="84" r="1.5" fill="#FFFFFF" />
            
            {/* Amber Blob */}
            <circle cx="44" cy="90" r="15" fill="#F59E0B" />
            <circle cx="41" cy="86" r="1.5" fill="#111827" />
            <circle cx="47" cy="86" r="1.5" fill="#111827" />

            {/* Mint Blob */}
            <circle cx="72" cy="89" r="16" fill="#10B981" />
            <circle cx="69" cy="85" r="1.5" fill="#FFFFFF" />
            <circle cx="75" cy="85" r="1.5" fill="#FFFFFF" />

            {/* Dark Blob */}
            <circle cx="98" cy="91" r="14" fill="#1F2937" />
            <circle cx="95" cy="88" r="1.2" fill="#FFFFFF" />
            <circle cx="101" cy="88" r="1.2" fill="#FFFFFF" />

            {/* Purple Blob */}
            <circle cx="146" cy="90" r="15" fill="#A855F7" />
            <circle cx="143" cy="86" r="1.5" fill="#FFFFFF" />
            <circle cx="149" cy="86" r="1.5" fill="#FFFFFF" />

            {/* Blue Blob */}
            <circle cx="174" cy="88" r="16" fill="#3B82F6" />
            <circle cx="171" cy="84" r="1.5" fill="#FFFFFF" />
            <circle cx="177" cy="84" r="1.5" fill="#FFFFFF" />

            {/* Light Gold Blob */}
            <circle cx="204" cy="89" r="16" fill="#FBBF24" />
            <circle cx="201" cy="85" r="1.5" fill="#111827" />
            <circle cx="207" cy="85" r="1.5" fill="#111827" />

            {/* Center Star: Cheerful Alloy Winking Mascot */}
            <g transform="translate(96, 12)">
              {/* Sun/Flame Crown */}
              <circle cx="24" cy="24" r="23" fill="#FBBF24" />
              <circle cx="24" cy="24" r="19" fill="#FDE68A" />
              
              {/* Inner Face */}
              <ellipse cx="24" cy="26" rx="15" ry="14" fill="#FFFFFF" />
              
              {/* Left Eye Wink */}
              <path d="M17 24C18 22 20 22 21 24" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
              
              {/* Right Eye Open */}
              <ellipse cx="28" cy="23.5" rx="2" ry="2.5" fill="#111827" />
              <circle cx="29" cy="22.5" r="0.8" fill="#FFFFFF" />
              
              {/* Rosy Cheeks */}
              <circle cx="15" cy="28" r="1.8" fill="#FF8A8A" fillOpacity="0.8" />
              <circle cx="31" cy="28" r="1.8" fill="#FF8A8A" fillOpacity="0.8" />
              
              {/* Smile */}
              <path d="M21 28C22.5 30.5 25.5 30.5 27 28" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* Text Content */}
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-900 font-heading font-medium text-sm group-hover:text-[#007FFF] transition-colors">
            <span>Alloy is currently in beta</span>
            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#007FFF] transition-colors" />
          </div>
          <p className="text-xs text-neutral-400 font-normal">
            Base Sepolia Testnet
          </p>
        </div>
      </div>

      {/* Docs & Socials Footer Links */}
      <div className="flex items-center justify-center gap-4 text-xs text-neutral-400 font-normal px-2">
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-neutral-700 transition-colors"
        >
          Docs
        </a>
        <span>•</span>
        <a
          href="https://x.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-neutral-700 transition-colors"
        >
          X (Twitter)
        </a>
      </div>
    </div>
  );
};
