"use client";

import React from "react";
import Link from "next/link";
import { AlloyMascot } from "./AlloyMascot";

interface AlloyLogoProps {
  size?: "sm" | "md" | "lg";
  showBeta?: boolean;
  showWordmark?: boolean;
  href?: string;
  className?: string;
}

const sizeConfig = {
  sm: {
    mascotSize: 28,
    textSize: "text-lg",
    dotSize: "w-1.5 h-1.5",
    betaText: "text-[9px] px-1.5 py-0.5",
    gap: "gap-2",
  },
  md: {
    mascotSize: 36,
    textSize: "text-2xl",
    dotSize: "w-2 h-2",
    betaText: "text-[10px] px-2 py-0.5",
    gap: "gap-2.5",
  },
  lg: {
    mascotSize: 48,
    textSize: "text-3xl",
    dotSize: "w-2.5 h-2.5",
    betaText: "text-xs px-2.5 py-1",
    gap: "gap-3",
  },
};

export const AlloyLogo: React.FC<AlloyLogoProps> = ({
  size = "md",
  showBeta = true,
  showWordmark = true,
  href = "/",
  className = "",
}) => {
  const config = sizeConfig[size];

  const content = (
    <div className={`inline-flex items-center ${config.gap} select-none group ${className}`}>
      {/* Mascot Icon in Azure Squircle */}
      <AlloyMascot size={config.mascotSize} className="transition-transform duration-200 group-hover:scale-105" />

      {/* Typographic Wordmark */}
      {showWordmark ? (
        <div className="flex items-center">
          <span className={`font-black tracking-tight text-neutral-900 ${config.textSize}`}>
            alloy
          </span>
          <span className={`inline-block rounded-full bg-[#007FFF] ml-0.5 ${config.dotSize}`} />
        </div>
      ) : null}

      {/* BETA Tag Pill */}
      {showBeta ? (
        <span
          className={`font-extrabold uppercase tracking-wider text-neutral-500 bg-neutral-100 rounded-full border border-neutral-200/80 ${config.betaText}`}
        >
          Beta
        </span>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007FFF] rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
};
