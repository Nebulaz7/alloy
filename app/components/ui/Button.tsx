"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "azure-light" | "azure-soft" | "emerald" | "dark" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary:
    "bg-[#007FFF] hover:bg-[#0066FF] active:bg-[#0055D4] text-white shadow-xs font-medium border border-transparent",
  "azure-light":
    "bg-[#4DA6FF] hover:bg-[#3695F5] active:bg-[#1E82EC] text-white shadow-xs font-medium border border-transparent",
  "azure-soft":
    "bg-[#E0F2FE] hover:bg-[#BAE6FD] active:bg-[#7DD3FC] text-[#007FFF] font-medium border border-[#BAE6FD]/60",
  emerald:
    "bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white shadow-xs font-medium border border-transparent",
  dark: "bg-[#111827] hover:bg-black active:bg-neutral-800 text-white font-medium border border-transparent",
  secondary:
    "bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-800 font-medium border border-neutral-200/60",
  outline:
    "bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 font-medium border border-neutral-200 shadow-2xs",
  ghost: "bg-transparent hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 font-medium",
};

const sizeStyles = {
  sm: "text-xs px-3.5 py-1.5 rounded-xl gap-1.5",
  md: "text-sm px-4.5 py-2.5 rounded-xl gap-2",
  lg: "text-base px-5.5 py-3.5 rounded-2xl gap-2.5",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007FFF] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
};
