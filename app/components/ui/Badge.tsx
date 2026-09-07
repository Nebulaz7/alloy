"use client";

import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "azure" | "green" | "gray" | "amber" | "purple" | "red" | "dark";
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles = {
  azure: "bg-blue-50 text-[#007FFF] border-blue-100",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  gray: "bg-neutral-100 text-neutral-600 border-neutral-200/80",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  red: "bg-red-50 text-red-600 border-red-100",
  dark: "bg-neutral-900 text-white border-neutral-900",
};

const sizeStyles = {
  sm: "text-[10px] px-2 py-0.5 font-bold",
  md: "text-xs px-2.5 py-1 font-bold",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "azure",
  size = "md",
  className = "",
  icon,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </span>
  );
};
