"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { FaCrown, FaUser, FaClipboard, FaCheck, FaInfoCircle, FaCalendarAlt } from "react-icons/fa";

export default function TeamDetails() {
  const { user } = useUser();
  const router = useRouter();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If not associated with any team, redirect to build
    if (user && !user.teamId) {
      router.replace("/dashboard/team/build");
      return;
    }

    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/team/members");
        if (res.ok) {
          const data = await res.json();
          setTeam(data.team);
        }
      } catch (err) {
        console.error("Failed to load team data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [user, router]);

  const copyCode = () => {
    if (team) {
      navigator.clipboard.writeText(team.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!team) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header Info */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 card-3d">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div>
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Active Team
          </span>
          <h1 className="text-3xl font-bold text-white tracking-tight mt-3 mb-1">
            {team.name}
          </h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <FaCalendarAlt className="text-xs text-gray-500" /> Created on {new Date(team.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Join Code</span>
            <span className="text-lg font-mono font-bold text-white tracking-widest">{team.joinCode}</span>
          </div>
          <button
            onClick={copyCode}
            className="p-2.5 text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
            title="Copy Code"
          >
            {copied ? <FaCheck className="text-emerald-400 text-sm" /> : <FaClipboard className="text-sm" />}
          </button>
        </div>
      </div>

      {/* Team Size Limit Indicator */}
      <div className="flex items-center justify-between text-sm bg-white/5 border border-white/5 px-6 py-3 rounded-2xl">
        <span className="text-gray-400">Team Size:</span>
        <span className="text-white font-semibold">
          {team.members.length} / {team.maxSize} Members
        </span>
      </div>

      {/* Team Members Profiles List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Team Profile & Members</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.members.map((member) => {
            const isLead = member._id === team.leadId._id;
            return (
              <div
                key={member._id}
                className={`glass-panel p-6 rounded-2xl border transition-all card-3d-secondary ${
                  isLead ? "border-amber-400/20 shadow-md shadow-amber-400/2" : "border-white/5"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isLead ? "bg-amber-400/10 border border-amber-400/20" : "bg-white/5 border border-white/5"
                    }`}>
                      {isLead ? <FaCrown className="text-amber-400" /> : <FaUser className="text-gray-400" />}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{member.name}</h3>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isLead ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" : "bg-white/5 text-gray-400"
                      }`}>
                        {isLead ? "Team Lead" : "Member"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-400 border-t border-white/5 pt-4">
                  <div className="flex justify-between">
                    <span>SUC Number:</span>
                    <span className="text-white font-semibold">{member.sucNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Campus:</span>
                    <span className="text-white font-semibold">{member.campus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Class & Sec:</span>
                    <span className="text-white font-semibold">
                      {member.class} - {member.section}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Roll Number:</span>
                    <span className="text-white font-semibold">{member.rollNumber}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
