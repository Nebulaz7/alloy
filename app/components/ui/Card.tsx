"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "signature" | "inset" | "dashed";
  className?: string;
}

const variantStyles = {
  default: "bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6 sm:p-8",
  signature:
    "bg-white rounded-3xl border-4 border-[#007FFF] shadow-sm overflow-hidden flex flex-col transition-all duration-200",
  inset: "bg-[#F9FAFB] border border-neutral-100 rounded-2xl p-4 sm:p-5",
  dashed:
    "border-2 border-dashed border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 rounded-3xl p-6 sm:p-8 transition-colors duration-150 cursor-pointer text-center",
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
