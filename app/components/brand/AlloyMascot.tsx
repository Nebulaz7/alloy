"use client";

import React from "react";

interface AlloyMascotProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | number;
  className?: string;
  expression?: "wink" | "smile" | "sparkle";
  withSquircle?: boolean;
}

const sizeMap = {
  sm: 28,
  md: 40,
  lg: 56,
  xl: 72,
  "2xl": 96,
};

export const AlloyMascot: React.FC<AlloyMascotProps> = ({
  size = "md",
  className = "",
  expression = "wink",
  withSquircle = true,
}) => {
  const dimension = typeof size === "number" ? size : sizeMap[size];

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform duration-200 hover:scale-105 select-none ${className}`}
      aria-label="Alloy Mascot"
    >
      {withSquircle ? (
        <>
          {/* Rounded Squircle Base (Azure Blue) */}
          <rect width="100" height="100" rx="28" fill="#007FFF" />

          {/* Subtle Inner Top Highlight */}
          <path
            d="M12 28C12 19.1634 19.1634 12 28 12H72C80.8366 12 88 19.1634 88 28V36C88 27.1634 80.8366 20 72 20H28C19.1634 20 12 27.1634 12 36V28Z"
            fill="white"
            fillOpacity="0.18"
          />
        </>
      ) : null}

      {/* Mascot Coin Body */}
      <ellipse
        cx="50"
        cy={withSquircle ? "53" : "50"}
        rx="32"
        ry="30"
        fill="#FFFFFF"
        stroke={withSquircle ? "none" : "#E5E7EB"}
        strokeWidth={withSquircle ? 0 : 2}
      />

      {/* Inner Decorative Ring */}
      <ellipse
        cx="50"
        cy={withSquircle ? "53" : "50"}
        rx="26"
        ry="24"
        stroke="#E0F2FE"
        strokeWidth="2.5"
        strokeDasharray="2 4"
      />

      {/* Left Eye: Wink or Open based on expression */}
      {expression === "smile" ? (
        <ellipse
          cx="39"
          cy={withSquircle ? "48" : "45"}
          rx="4.5"
          ry="5.5"
          fill="#111827"
        />
      ) : (
        <path
          d={
            withSquircle
              ? "M36 49C37.5 45 42 45 44 49"
              : "M36 46C37.5 42 42 42 44 46"
          }
          stroke="#111827"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Right Eye: Playful Open Eye with Glint */}
      <ellipse
        cx="61"
        cy={withSquircle ? "48" : "45"}
        rx="4.5"
        ry="5.5"
        fill="#111827"
      />
      <circle cx="63" cy={withSquircle ? "46" : "43"} r="1.8" fill="#FFFFFF" />

      {/* Rosy Blush Cheeks */}
      <ellipse
        cx="32"
        cy={withSquircle ? "56" : "53"}
        rx="4"
        ry="2.5"
        fill="#FF8A8A"
        fillOpacity="0.65"
      />
      <ellipse
        cx="68"
        cy={withSquircle ? "56" : "53"}
        rx="4"
        ry="2.5"
        fill="#FF8A8A"
        fillOpacity="0.65"
      />

      {/* Cheerful Curved Smile */}
      <path
        d={
          withSquircle
            ? "M44 56C46.5 61 53.5 61 56 56"
            : "M44 53C46.5 58 53.5 58 56 53"
        }
        stroke="#111827"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Gold Dividend Sparkle (Top-Right) */}
      <path
        d={
          withSquircle
            ? "M74 24L75.5 29.5L81 31L75.5 32.5L74 38L72.5 32.5L67 31L72.5 29.5L74 24Z"
            : "M76 18L77.5 23.5L83 25L77.5 26.5L76 32L74.5 26.5L69 25L74.5 23.5L76 18Z"
        }
        fill="#FBBF24"
      />
    </svg>
  );
};
