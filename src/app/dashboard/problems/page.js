"use client";

import { useState, useEffect } from "react";
import { FaBookOpen, FaLightbulb, FaRegFolderOpen } from "react-icons/fa";

export default function ProblemStatements() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch("/api/problems");
        if (res.ok) {
          const data = await res.json();
          setProblems(data.problems);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
          <FaBookOpen className="text-emerald-500 text-2xl" /> Problem Statements
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Browse and select from the approved project descriptions for your final stage evaluation.
        </p>
      </div>

      {problems.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center text-gray-500 space-y-4">
          <FaRegFolderOpen className="text-5xl mx-auto text-gray-600" />
          <h3 className="text-white font-semibold">No problem statements available</h3>
          <p className="text-sm max-w-sm mx-auto">
            The internship admin hasn&apos;t added any problem statements yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {problems.map((problem) => (
            <div
              key={problem._id}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-950/2 space-y-4 card-3d-secondary"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <FaLightbulb className="text-emerald-400 text-sm" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{problem.title}</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap pl-11">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
