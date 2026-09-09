import React from "react";
import Image from "next/image";
import { AlloyLogo } from "@/components/brand/AlloyLogo";

import { ArrowUpRight } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="left-0 right-0 top-0 z-50 py-2 inset-x-0 border-b border-white/[0.06] bg-black/20 backdrop-blur-md">
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center py-4 px-10">
        {/* Logo + wordmark */}
        <a href="/" className="flex items-center gap-2 select-none">
          <AlloyLogo size="md" wordmarkColor="text-white" />
        </a>

        {/* Nav links: centered, clean text */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-white transition-colors hover:text-[#007fff]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-white transition-colors hover:text-[#007fff]"
          >
            How it works
          </a>
          <a
            href="#faqs"
            className="text-sm font-medium text-white transition-colors hover:text-[#007fff]"
          >
            FAQ
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <a
            href="/docs"
            className="hidden text-sm font-medium text-white transition-colors hover:text-white-100 md:block"
          >
            Docs
          </a>
          <a
            href="https://github.com/nebulaz7/alloy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-[#007fff] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-black active:scale-[0.97]"
          >
            <span>Launch App</span>
            <ArrowUpRight className="h-[15px] w-[15px] shrink-0" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
