"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaCrown, FaUserPlus, FaChevronRight, FaArrowLeft, FaUsers, FaInfoCircle, FaClipboard, FaCheck } from "react-icons/fa";

export default function BuildTeam() {
  const { user, refreshUser } = useUser();
  const router = useRouter();

  const [roleSelection, setRoleSelection] = useState(""); // "lead" or "member"
  const [teamName, setTeamName] = useState("");
  const [maxSize, setMaxSize] = useState("3");
  const [joinCode, setJoinCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successTeam, setSuccessTeam] = useState(null); // Contains the created team

  const [copied, setCopied] = useState(false);

  // If user already has a team, redirect to team view
  useEffect(() => {
    if (user && user.teamId) {
      router.replace("/dashboard/team");
    }
  }, [user, router]);

  if (user && user.teamId) {
    return null;
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName) {
      setError("Please specify a team name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/team/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName, maxSize }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create team.");

      setSuccessTeam(data.team);
      await refreshUser(); // Update context
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCode) {
      setError("Please specify the unique team join code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join team.");

      await refreshUser();
      router.push("/dashboard/team");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (successTeam) {
      navigator.clipboard.writeText(successTeam.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Build Your Team</h1>
        <p className="text-gray-400 text-sm">Teams must consist of 3 to 5 members. Select your path below.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* SUCCESS STATE (Team Created) */}
        {successTeam && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-3xl border border-emerald-500/20 text-center space-y-6 card-3d"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <FaUsers className="text-emerald-400 text-2xl" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Team Created Successfully!</h2>
              <p className="text-gray-400 text-sm">Your team <strong className="text-white">&quot;{successTeam.name}&quot;</strong> is ready.</p>
            </div>

            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl max-w-sm mx-auto space-y-3">
              <span className="text-xs text-gray-500 font-semibold tracking-wider block uppercase">Join Code for Members</span>
              <div className="flex items-center justify-between bg-black/30 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-2xl font-mono font-bold text-emerald-400 tracking-widest">{successTeam.joinCode}</span>
                <button
                  onClick={copyCode}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  title="Copy Join Code"
                >
                  {copied ? <FaCheck className="text-emerald-400 text-sm" /> : <FaClipboard className="text-sm" />}
                </button>
              </div>
            </div>

            <div className="text-gray-400 text-xs flex justify-center items-center gap-2">
              <FaInfoCircle /> Give this code to your 2-4 team members to join your team.
            </div>

            <button
              onClick={() => router.push("/dashboard/team")}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-98 cursor-pointer"
            >
              Go to Team View
            </button>
          </motion.div>
        )}

        {/* ROLE SELECTION */}
        {!successTeam && roleSelection === "" && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Create Team Card */}
            <button
              onClick={() => setRoleSelection("lead")}
              className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-emerald-500/20 text-left space-y-4 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all group cursor-pointer card-3d"
            >
              <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center border border-amber-400/20 group-hover:scale-110 transition-transform">
                <FaCrown className="text-amber-400 text-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">I am the Team Lead</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Start a new team, define the size (3-5 members), and invite others to join your team using a unique code.
                </p>
              </div>
              <div className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5 pt-2">
                Create Team <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Join Team Card */}
            <button
              onClick={() => setRoleSelection("member")}
              className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-emerald-500/20 text-left space-y-4 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all group cursor-pointer card-3d"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <FaUserPlus className="text-emerald-400 text-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">I am a Team Member</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Enter the unique code shared by your Team Lead to join an existing group.
                </p>
              </div>
              <div className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5 pt-2">
                Join Team <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        )}

        {/* CREATE TEAM FORM */}
        {!successTeam && roleSelection === "lead" && (
          <motion.div
            key="lead-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel p-8 rounded-3xl border border-white/5 card-3d"
          >
            <button
              onClick={() => setRoleSelection("")}
              className="text-gray-500 hover:text-white text-sm flex items-center gap-2 mb-6 cursor-pointer"
            >
              <FaArrowLeft /> Back to options
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Create New Team</h2>

            <form onSubmit={handleCreateTeam} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. Innovators"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Team Size (Including Lead)</label>
                <div className="grid grid-cols-3 gap-4">
                  {["3", "4", "5"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setMaxSize(size)}
                      className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                        maxSize === size
                          ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/10"
                          : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {size} Members
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Creating Team..." : "Create Team & Generate Code"}
              </button>
            </form>
          </motion.div>
        )}

        {/* JOIN TEAM FORM */}
        {!successTeam && roleSelection === "member" && (
          <motion.div
            key="member-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel p-8 rounded-3xl border border-white/5 card-3d"
          >
            <button
              onClick={() => setRoleSelection("")}
              className="text-gray-500 hover:text-white text-sm flex items-center gap-2 mb-6 cursor-pointer"
            >
              <FaArrowLeft /> Back to options
            </button>

            <h2 className="text-2xl font-bold text-white mb-2">Join an Existing Team</h2>
            <p className="text-sm text-gray-400 mb-6">Enter the 6-character code shared by your team lead.</p>

            <form onSubmit={handleJoinTeam} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Team Join Code</label>
                <input
                  type="text"
                  placeholder="e.g. AB49FD"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm font-mono tracking-widest text-center uppercase"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Joining Team..." : "Join Team"}
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
