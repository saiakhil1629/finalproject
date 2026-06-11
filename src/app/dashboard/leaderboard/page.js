"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTrophy, FaMedal, FaStar } from "react-icons/fa";

export default function LeaderboardPage() {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gradient flex items-center justify-center gap-3">
          <FaTrophy className="text-amber-400" /> Global Leaderboard
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Ranked by highest Admin rating. Complete projects early and with high quality to climb the ranks!
        </p>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 pt-8 pb-4">
          {/* 2nd Place */}
          {top3[1] && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="order-2 md:order-1 flex flex-col items-center w-full md:w-48"
            >
              <div className="bg-gray-400/20 text-gray-300 p-3 rounded-full mb-3 border border-gray-400/30">
                <FaMedal className="text-3xl" />
              </div>
              <div className="glass-panel w-full p-4 rounded-t-3xl border-t border-l border-r border-white/10 h-32 flex flex-col items-center justify-start text-center card-3d">
                <p className="font-bold text-white truncate w-full">{top3[1].name}</p>
                <p className="text-xs text-gray-400 truncate w-full mb-2">{top3[1].campus}</p>
                <p className="text-amber-400 font-bold flex items-center gap-1"><FaStar className="text-xs" /> {top3[1].rating}</p>
                <div className="mt-auto font-black text-4xl text-white/5">2</div>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="order-1 md:order-2 flex flex-col items-center w-full md:w-56 z-10"
            >
              <div className="bg-amber-400/20 text-amber-400 p-4 rounded-full mb-3 border border-amber-400/30 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                <FaTrophy className="text-4xl" />
              </div>
              <div className="bg-gradient-to-t from-amber-500/10 to-amber-500/5 w-full p-5 rounded-t-3xl border-t border-l border-r border-amber-500/30 h-40 flex flex-col items-center justify-start text-center relative overflow-hidden card-3d">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                <p className="font-bold text-amber-400 truncate w-full text-lg">{top3[0].name}</p>
                <p className="text-xs text-gray-400 truncate w-full mb-2">{top3[0].campus}</p>
                <p className="text-amber-400 font-bold flex items-center gap-1 text-lg"><FaStar className="text-sm" /> {top3[0].rating}</p>
                <div className="mt-auto font-black text-5xl text-amber-500/10">1</div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="order-3 flex flex-col items-center w-full md:w-48"
            >
              <div className="bg-amber-700/20 text-amber-600 p-3 rounded-full mb-3 border border-amber-700/30">
                <FaMedal className="text-3xl" />
              </div>
              <div className="glass-panel w-full p-4 rounded-t-3xl border-t border-l border-r border-white/10 h-24 flex flex-col items-center justify-start text-center card-3d">
                <p className="font-bold text-white truncate w-full">{top3[2].name}</p>
                <p className="text-xs text-gray-400 truncate w-full mb-2">{top3[2].campus}</p>
                <p className="text-amber-400 font-bold flex items-center gap-1"><FaStar className="text-xs" /> {top3[2].rating}</p>
                <div className="mt-auto font-black text-3xl text-white/5">3</div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Rest of the Leaderboard Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/5 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-center w-16">Rank</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4 hidden md:table-cell">Campus</th>
                <th className="px-6 py-4 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderboard.map((student, idx) => {
                const isCurrentUser = user && user.id === student.id;
                const rank = idx + 1;
                return (
                  <tr 
                    key={student.id} 
                    className={`transition-colors ${isCurrentUser ? "bg-emerald-500/10 border-l-4 border-emerald-500" : "hover:bg-white/5"}`}
                  >
                    <td className="px-6 py-4 text-center font-bold text-gray-400">
                      #{rank}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isCurrentUser ? "text-emerald-400" : "text-white"}`}>
                          {student.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-400">
                      {student.campus}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-bold">
                        <FaStar className="text-xs" /> {student.rating}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
