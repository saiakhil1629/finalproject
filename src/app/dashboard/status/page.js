"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaEye, FaCheckCircle, FaTimesCircle, FaClock, FaCommentDots, FaArrowRight } from "react-icons/fa";

export default function ProjectStatusPage() {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState({ miniProject: null, mainProject: null });
  const [loading, setLoading] = useState(true);
  const [viewImage, setViewImage] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/projects/status");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FaCheckCircle className="text-xs" /> Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <FaTimesCircle className="text-xs" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <FaClock className="text-xs" /> Pending Review
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const renderProjectCard = (project, title, isAllowed) => {
    if (!isAllowed) {
      return (
        <div className="glass-panel p-8 rounded-3xl border border-white/5 opacity-60 flex flex-col justify-between h-full min-h-[300px]">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide mb-4">{title}</h2>
            <p className="text-gray-400 text-sm">
              Only the <strong>Team Lead</strong> can view or check the status of the main project.
            </p>
          </div>
        </div>
      );
    }

    if (!project) {
      return (
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-full min-h-[300px] card-3d-secondary">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide mb-4">{title}</h2>
            <p className="text-gray-400 text-sm mb-6">
              You haven&apos;t submitted your project yet. Submit it from the dashboard.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-center flex items-center justify-center gap-2 border border-white/5 transition-all text-sm"
          >
            Go to Submit <FaArrowRight className="text-xs" />
          </Link>
        </div>
      );
    }

    return (
      <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-full min-h-[300px] card-3d">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
            {getStatusBadge(project.status)}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-3 rounded-xl">
              <FaGithub className="text-gray-400 text-lg flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs text-gray-500 font-semibold uppercase">GitHub URL</p>
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline text-sm truncate block font-mono"
                >
                  {project.githubLink}
                </a>
              </div>
            </div>

            <button
              onClick={() => setViewImage({ title, src: project.imageUrl })}
              className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 rounded-xl transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaEye className="text-sm" /> View Output Screenshot
            </button>
          </div>

          {/* Admin comment section */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-gray-500 font-semibold uppercase mb-2 flex items-center gap-1.5">
              <FaCommentDots className="text-gray-400" /> Admin Feedback
            </p>
            {project.adminComment ? (
              <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl">
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  &ldquo;{project.adminComment}&rdquo;
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No feedback comments provided yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Project Status</h1>
        <p className="text-gray-400 text-sm mt-1">Check approval status and feedback for your submissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderProjectCard(submissions.miniProject, "Mini Project", true)}
        {renderProjectCard(submissions.mainProject, "Main Project", user.role === "Lead" || user.role === "Member" || user.teamId !== null)}
      </div>

      {/* Screenshot View Modal */}
      {viewImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-[#111111] border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-white font-bold text-sm">Screenshot: {viewImage.title}</h3>
              <button
                onClick={() => setViewImage(null)}
                className="text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="w-full flex items-center justify-center overflow-auto max-h-[70vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewImage.src} alt="Project Output" className="max-w-full max-h-[65vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
