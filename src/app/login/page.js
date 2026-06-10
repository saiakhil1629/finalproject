"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaIdCard, FaLock, FaSignInAlt } from "react-icons/fa";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sucNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.sucNumber || !formData.password) {
      setError("Please fill in all details.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--color-background)] px-4">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl z-10 border border-emerald-500/10 shadow-2xl card-3d"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-gray-400 mt-2">Log in to manage your team and submissions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <FaIdCard className="absolute left-4 top-3.5 text-gray-500" />
            <input
              type="text"
              name="sucNumber"
              value={formData.sucNumber}
              onChange={handleInputChange}
              placeholder="SUC Number"
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-3.5 text-gray-500" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 disabled:opacity-50"
          >
            {loading ? "Logging in..." : (
              <>
                Log In <FaSignInAlt className="text-xs" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-emerald-400 hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
