"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaUser, FaIdCard, FaLock, FaBuilding, FaBook, FaListOl, FaArrowRight, FaArrowLeft, FaCheck } from "react-icons/fa";

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    campus: "",
    name: "",
    sucNumber: "",
    password: "",
    section: "",
    class: "",
    rollNumber: "",
    rating: 0,
  });

  const [hoverRating, setHoverRating] = useState(0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (
      !formData.campus ||
      !formData.name ||
      !formData.sucNumber ||
      !formData.password ||
      !formData.section ||
      !formData.class ||
      !formData.rollNumber
    ) {
      setError("Please fill in all the details.");
      return;
    }
    setError("");
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleRegister = async () => {
    if (formData.rating === 0) {
      setError("Please select a rating for your experience.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--color-background)] px-4 py-12">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl glass-panel p-8 rounded-3xl z-10 border border-emerald-500/10 card-3d"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Onboarding Portal</h2>
          <span className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            Step {step} of 2
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Your Campus</label>
                <div className="grid grid-cols-2 gap-4">
                  {["Aditya KKD", "Aditya ASLW"].map((campusOpt) => (
                    <button
                      key={campusOpt}
                      type="button"
                      onClick={() => setFormData({ ...formData, campus: campusOpt })}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                        formData.campus === campusOpt
                          ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/10"
                          : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      {campusOpt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <FaUser className="absolute left-4 top-3.5 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <FaIdCard className="absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    name="sucNumber"
                    value={formData.sucNumber}
                    onChange={handleInputChange}
                    placeholder="SUC Number"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    placeholder="Class"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                  />
                </div>
                <div className="relative">
                  <FaBook className="absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    placeholder="Sec"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                  />
                </div>
                <div className="relative">
                  <FaListOl className="absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    placeholder="Roll No"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98"
              >
                Next Step <FaArrowRight className="text-xs" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 text-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Rate your Internship Experience</h3>
                <p className="text-sm text-gray-400">Your feedback helps us continuously improve the internship program.</p>
              </div>

              {/* Star Rating Container */}
              <div className="flex justify-center items-center gap-4 py-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: index })}
                    onMouseEnter={() => setHoverRating(index)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-4xl transition-all active:scale-90 duration-150 relative group focus:outline-none"
                  >
                    <FaStar
                      className={`transition-colors duration-200 ${
                        index <= (hoverRating || formData.rating)
                          ? "text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* 3D Star Celebration Card: Display if Rating is 5 */}
              <AnimatePresence>
                {formData.rating === 5 && (
                  <motion.div
                    initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="max-w-xs mx-auto p-6 bg-gradient-to-br from-amber-400/10 via-emerald-500/5 to-white/5 border border-amber-400/30 rounded-2xl shadow-2xl relative overflow-hidden"
                    style={{ perspective: "1000px" }}
                  >
                    {/* Glowing effect inside card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-400/5 to-transparent animate-pulse" />

                    <div className="relative z-10 space-y-3">
                      <div className="text-amber-400 text-5xl flex justify-center animate-bounce">
                        <FaStar />
                      </div>
                      <h4 className="text-white font-bold text-lg">Spectacular! 5/5</h4>
                      <p className="text-gray-300 text-xs leading-relaxed">
                        We are thrilled you had an excellent experience. Thank you for your maximum support!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  <FaArrowLeft className="text-xs" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 active:scale-98 disabled:opacity-50"
                >
                  {loading ? "Registering..." : (
                    <>
                      Finish Onboarding <FaCheck className="text-xs" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
