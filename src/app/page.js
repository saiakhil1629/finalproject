"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaRocket } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--color-background)]">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass-panel p-10 rounded-3xl max-w-2xl border border-emerald-500/20 shadow-2xl shadow-emerald-900/20 card-3d"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
          >
            <FaRocket className="text-emerald-400 text-3xl" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
            Welcome to the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">
              Final Stage of the Internship
            </span>
          </h1>
          
          <p className="text-gray-400 mb-8 text-lg max-w-lg mx-auto">
            Adhoc Network Tech brings you the ultimate portal to form your teams, submit your projects, and showcase your skills. 
            Students from Aditya KKD & Aditya ASLW, let&apos;s build something extraordinary.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
              Create Account
            </Link>
            <Link href="/login" className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold transition-all border border-white/10 active:scale-95">
              Login to Portal
            </Link>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 z-10 border-t border-white/5">
        <p>Adhoc Network Tech</p>
        <p className="mt-1">Made by <span className="text-emerald-500 font-medium">saiakhil.g</span></p>
      </footer>
    </div>
  );
}
