"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBookOpen, FaLightbulb, FaRegFolderOpen, FaMagic, FaChevronDown } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export default function ProblemStatements() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState({});
  const [explanations, setExplanations] = useState({});

  const handleExplain = async (problem) => {
    if (explanations[problem._id]) return; // already explained

    setExplaining(prev => ({ ...prev, [problem._id]: true }));
    try {
      const res = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: problem.title, description: problem.description })
      });
      const data = await res.json();
      if (res.ok) {
        setExplanations(prev => ({ ...prev, [problem._id]: data.explanation }));
      } else {
        alert(data.error || "Failed to explain.");
      }
    } catch (err) {
      alert("Error calling AI.");
    } finally {
      setExplaining(prev => ({ ...prev, [problem._id]: false }));
    }
  };

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
        <motion.div 
          className="grid grid-cols-1 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
        >
          {problems.map((problem) => (
            <motion.div
              key={problem._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-950/2 space-y-4 card-3d-secondary"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <FaLightbulb className="text-emerald-400 text-sm" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{problem.title}</h3>
                
                <button
                  onClick={() => handleExplain(problem)}
                  disabled={explaining[problem._id]}
                  className="ml-auto flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 text-emerald-400 hover:text-white hover:border-emerald-500/40 hover:from-emerald-500/20 hover:to-amber-500/20 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {explaining[problem._id] ? (
                    <span className="animate-pulse">Thinking...</span>
                  ) : (
                    <>
                      <FaMagic className="text-amber-400" /> AI Breakdown
                    </>
                  )}
                </button>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap pl-11">
                {problem.description}
              </p>

              <AnimatePresence>
                {explanations[problem._id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/5 pl-11">
                      <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold text-sm">
                        <FaMagic className="text-amber-400" /> Gemini Analysis
                      </div>
                      <div className="text-sm text-gray-300 prose prose-invert prose-emerald max-w-none prose-sm">
                        <ReactMarkdown>{explanations[problem._id]}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

    </div>
  );
}
