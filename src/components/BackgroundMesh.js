"use client";

import { motion } from "framer-motion";

export default function BackgroundMesh() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none print:hidden">
      {/* Deep Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]"></div>

      {/* Ambient glowing orbs with slow floating animations */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-900/20 blur-[120px] mix-blend-screen"
      />
      
      <motion.div
        animate={{
          x: [0, -100, 80, 0],
          y: [0, 120, -60, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-amber-900/10 blur-[150px] mix-blend-screen"
      />

      <motion.div
        animate={{
          x: [0, 50, -80, 0],
          y: [0, 80, -40, 0],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-emerald-800/10 blur-[100px] mix-blend-screen"
      />

      {/* Subtle Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      ></div>
    </div>
  );
}
