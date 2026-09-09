import React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto py-12">
      {/* Centered ambient backdrop scrim specifically behind the text */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-3xl h-[440px] bg-black/60 rounded-full blur-3xl" />
        <div className="absolute w-[80%] max-w-xl h-[280px] bg-[#007fff]/10 rounded-full blur-2xl" />
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Hero Headline */}
        <h1 className="max-w-4xl font-extrabold text-white text-4xl sm:text-6xl md:text-[68px] tracking-tight leading-[1.12] drop-shadow-md">
          Receive stock dividends in{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#007fff] via-[#60a5fa] to-white">
            any currency
          </span>
          , completely{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#93c5fd] to-[#007fff]">
            private
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-neutral-200 text-base sm:text-lg md:text-xl font-normal leading-relaxed drop-shadow-sm">
          Get dividends from your Base B20 tokenized stocks in stablecoins or
          memecoins, while staying private without exposing your wallet address.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#007fff] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-[#0066ff] hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
          >
            <span>Launch App</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/nebulaz7/alloy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] px-5 py-3 text-sm font-medium text-neutral-200 backdrop-blur-md transition-all hover:bg-white/[0.1] hover:border-white/[0.2] hover:text-white active:scale-[0.98] cursor-pointer"
          >
            <span>View on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </div>

        {/* Feature / Asset Proof Tags */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-neutral-400">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 border border-white/[0.08] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <span>Base B20 Equities ($AAPLc, $NVDAc)</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 border border-white/[0.08] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007fff]" />
            <span>ERC-5564 Stealth Rails</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 border border-white/[0.08] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            <span>USDC • cNGN • CLANKER</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
