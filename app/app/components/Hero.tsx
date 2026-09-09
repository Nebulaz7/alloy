import React from "react";

const Hero = () => {
  return (
    <div>
      <div>
        <h1 className="font-extrabold text-white md:text-[64px]">
          <span className="bg-clip-text bg-gradient-to-r from-[#007fff] via-white to-[#007fff]">
            Alloy
          </span>
        </h1>
        <div>
          <p className="text-[#E0E0E0]">AI-Powered Financial Advisor</p>
        </div>
        <button className="rounded-lg bg-[#007fff] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-black active:scale-[0.97]">
          <span>Launch App</span>
        </button>
      </div>
    </div>
  );
};

export default Hero;
