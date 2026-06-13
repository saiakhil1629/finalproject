"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTrophy, FaMedal, FaStar } from "react-icons/fa";

export default function LeaderboardWidget() {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } });
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-white/5 h-full flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 10); // Show top 10 in widget

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 h-full flex flex-col card-3d">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <FaTrophy className="text-amber-400" /> Leaderboard
        </h2>
        <span className="text-xs bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-amber-400 font-medium">
          Top 10
        </span>
      </div>

      <motion.div 
        className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {top3.map((student, idx) => {
          const isCurrentUser = user && user.id === student.id;
          const isFirst = idx === 0;
          return (
            <motion.div 
              key={student.id} 
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              className={`flex items-center gap-3 p-3 rounded-2xl border ${
                isFirst ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]" : 
                isCurrentUser ? "bg-emerald-500/10 border-emerald-500/30" : 
                "bg-white/5 border-white/5"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                isFirst ? "bg-amber-400 text-amber-900" : 
                idx === 1 ? "bg-gray-300 text-gray-800" : 
                idx === 2 ? "bg-amber-700 text-white" : 
                "bg-white/10 text-gray-400"
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${isFirst ? "text-amber-400" : isCurrentUser ? "text-emerald-400" : "text-white"}`}>
                  {student.name} {isCurrentUser && "(You)"}
                </p>
                <p className="text-xs text-gray-500 truncate">{student.campus}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">Score</p>
                <p className="font-bold text-amber-400 flex items-center gap-1 text-sm justify-end">
                  {student.score} <FaStar className="text-[10px]" />
                </p>
              </div>
            </motion.div>
          );
        })}

        {rest.map((student, idx) => {
          const isCurrentUser = user && user.id === student.id;
          const rank = idx + 4;
          return (
            <motion.div 
              key={student.id} 
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
              className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                isCurrentUser ? "bg-emerald-500/10 border-emerald-500/30" : "border-transparent hover:bg-white/5"
              }`}
            >
              <div className="w-6 text-center text-xs font-bold text-gray-500 shrink-0">
                #{rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isCurrentUser ? "text-emerald-400" : "text-gray-300"}`}>
                  {student.name} {isCurrentUser && "(You)"}
                </p>
              </div>
              <div className="font-bold text-amber-400/80 flex items-center gap-1 text-xs shrink-0">
                {student.score} <FaStar className="text-[10px]" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
