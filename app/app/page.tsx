"use client";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import { NebulazShader } from "./components/animations/BgShaders";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#090909] text-white">
      {/* 100vh Hero & Navbar Section with WebGL Shader Background */}
      <div className="relative h-screen w-full overflow-hidden flex flex-col">
        {/* Background WebGL Shader */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <NebulazShader theme="dark" />
        </div>

        {/* Navbar and Hero content overlaid on top */}
        <div className="relative z-10 flex flex-col h-full w-full">
          <Navbar />
          <div className="flex-1 flex items-center justify-center text-center">
            <Hero />
          </div>
        </div>
      </div>
    </div>
  );
}

