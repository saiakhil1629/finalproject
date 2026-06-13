"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaEye, FaCheckCircle, FaTimesCircle, FaClock, FaCommentDots, FaArrowRight, FaEdit, FaTimes, FaFileUpload, FaExclamationCircle } from "react-icons/fa";

export default function ProjectStatusPage() {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState({ miniProjects: [], mainProject: null });
  const [loading, setLoading] = useState(true);
  const [viewImage, setViewImage] = useState(null);

  // Edit project state
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ githubLink: "", image: "" });
  const [editStatus, setEditStatus] = useState({ loading: false, success: "", error: "" });

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Limit it to 5MB.");
      return;
    }

    try {
      const base64 = await compressImage(file);
      setEditForm({ ...editForm, image: base64 });
    } catch (err) {
      console.error("Error converting file to base64", err);
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setEditForm({
      githubLink: project.githubLink,
      image: project.imageUrl,
    });
    setEditStatus({ loading: false, error: "", success: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.githubLink || !editForm.image) {
      setEditStatus({ ...editStatus, error: "Please enter a GitHub link and upload an output image." });
      return;
    }

    setEditStatus({ loading: true, error: "", success: "" });
    try {
      const res = await fetch("/api/projects/submit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProject._id,
          githubLink: editForm.githubLink,
          imageUrl: editForm.image,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setEditStatus({ loading: false, success: "Submission updated successfully!", error: "" });
      alert("Submission has been updated successfully.");
      setEditingProject(null);
      fetchSubmissions();
    } catch (err) {
      setEditStatus({ loading: false, error: err.message, success: "" });
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/projects/status", { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } });
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

  const renderProjectCard = (project, title, isAllowed, key = null) => {
    if (!isAllowed) {
      return (
        <div key={key} className="glass-panel p-8 rounded-3xl border border-white/5 opacity-60 flex flex-col justify-between h-full min-h-[300px]">
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
        <div key={key} className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-full min-h-[300px] card-3d-secondary">
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
      <div key={key} className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between h-full min-h-[300px] card-3d">
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

            <div className="flex gap-2">
              <button
                onClick={() => setViewImage({ title, src: project.imageUrl })}
                className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 rounded-xl transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaEye className="text-sm" /> View Screenshot
              </button>
              
              {((project.type === "Mini") || (project.type === "Main" && user.role === "Lead")) && (
                <button
                  onClick={() => openEditModal(project)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-xl transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaEdit className="text-sm" /> Edit Submit
                </button>
              )}
            </div>
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
        {submissions.miniProjects && submissions.miniProjects.length > 0 ? (
          submissions.miniProjects.map((mini, idx) => 
            renderProjectCard(mini, `Mini Project ${idx + 1}`, true, mini._id)
          )
        ) : (
          renderProjectCard(null, "Mini Project 1", true, "mini-empty")
        )}
        {renderProjectCard(submissions.mainProject, "Main Project", user.role === "Lead" || user.role === "Member" || user.teamId !== null, "main")}
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

      {/* Edit Submission Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 animate-fade-in animate-[fadeIn_0.2s_ease-out]">
          <div className="relative max-w-lg w-full bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-white font-bold text-lg">Edit Submission</h3>
              <button
                onClick={() => setEditingProject(null)}
                className="text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer bg-transparent border-0 outline-none"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-1 text-sm text-gray-300">
              <p><span className="text-gray-400">Project Type:</span> <strong className="text-white">{editingProject.type} Project</strong></p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase mb-1">GitHub Repository URL</label>
                <div className="relative">
                  <FaGithub className="absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="url"
                    placeholder="GitHub Repository URL"
                    value={editForm.githubLink}
                    onChange={(e) => setEditForm({ ...editForm, githubLink: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase mb-1">Output Screenshot</label>
                <div className="relative border border-dashed border-white/10 hover:border-emerald-500/30 rounded-xl p-4 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="status-edit-file-input"
                  />
                  <div className="text-center space-y-2 pointer-events-none">
                    <FaFileUpload className="text-gray-500 text-2xl mx-auto" />
                    <p className="text-gray-400 text-sm">
                      Upload new screenshot to replace current one
                    </p>
                    <p className="text-gray-600 text-xs">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              {editForm.image && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editForm.image} alt="Preview" className="max-h-full object-contain rounded" />
                </div>
              )}

              {editStatus.error && (
                <p className="text-red-400 text-xs flex items-center gap-2">
                  <FaExclamationCircle /> {editStatus.error}
                </p>
              )}
              {editStatus.success && (
                <p className="text-emerald-400 text-xs flex items-center gap-2">
                  <FaCheckCircle /> {editStatus.success}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editStatus.loading}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {editStatus.loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
