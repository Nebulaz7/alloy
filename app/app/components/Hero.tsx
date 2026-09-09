import React from "react";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4">
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-extrabold text-white text-5xl md:text-[64px] tracking-tight">
          <span className="bg-clip-text bg-gradient-to-r from-[#007fff] via-white to-[#007fff]">
            Alloy
          </span>
        </h1>
        <div>
          <p className="text-[#E0E0E0] text-lg md:text-xl">AI-Powered Financial Advisor</p>
        </div>
        <a
          href="/dashboard"
          className="rounded-lg bg-[#007fff] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-black active:scale-[0.97] cursor-pointer inline-flex items-center justify-center shadow-lg shadow-blue-500/20"
        >
          <span>Launch App</span>
        </a>
      </div>
    </div>
  );
};

export default Hero;
