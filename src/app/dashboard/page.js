"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaImage, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaFileUpload, FaEdit, FaTimes, FaLink } from "react-icons/fa";
import LeaderboardWidget from "@/components/LeaderboardWidget";

export default function Dashboard() {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState({ miniProjects: [], mainProject: null });
  const [loading, setLoading] = useState(true);
  
  // Forms state
  const [miniForm, setMiniForm] = useState({ githubLink: "", image: "" });
  const [mainForm, setMainForm] = useState({ githubLink: "", image: "", liveLink: "" });
  
  const [miniStatus, setMiniStatus] = useState({ loading: false, success: "", error: "" });
  const [mainStatus, setMainStatus] = useState({ loading: false, success: "", error: "" });
  
  // LinkedIn Form
  const [linkedinForm, setLinkedinForm] = useState({ link: "" });
  const [linkedinStatus, setLinkedinStatus] = useState({ loading: false, success: "", error: "" });

  // Edit forms state
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ githubLink: "", image: "", liveLink: "" });
  const [editStatus, setEditStatus] = useState({ loading: false, success: "", error: "" });

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
          
          // Max dimensions
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
          
          // Compress as JPEG
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e, formType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("Image is too large. Limit it to 5MB.");
      return;
    }

    try {
      // Compress and convert to base64
      const base64 = await compressImage(file);
      if (formType === "mini") {
        setMiniForm({ ...miniForm, image: base64 });
      } else if (formType === "edit") {
        setEditForm({ ...editForm, image: base64 });
      } else {
        setMainForm({ ...mainForm, image: base64 });
      }
    } catch (err) {
      console.error("Error converting file to base64", err);
    }
  };

  const handleMiniSubmit = async (e) => {
    e.preventDefault();
    if (!miniForm.githubLink || !miniForm.image) {
      setMiniStatus({ ...miniStatus, error: "Please enter a GitHub link and upload an output image." });
      return;
    }

    setMiniStatus({ loading: true, error: "", success: "" });
    try {
      const res = await fetch("/api/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "Mini", githubLink: miniForm.githubLink, imageUrl: miniForm.image }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setMiniStatus({ loading: false, success: "Mini Project submitted successfully!", error: "" });
      alert("Submission of your Mini Project has been completed successfully.");
      fetchSubmissions();
    } catch (err) {
      setMiniStatus({ loading: false, error: err.message, success: "" });
    }
  };

  const handleMainSubmit = async (e) => {
    e.preventDefault();
    if (!mainForm.githubLink || !mainForm.image) {
      setMainStatus({ ...mainStatus, error: "Please enter a GitHub link and upload an output image." });
      return;
    }

    setMainStatus({ loading: true, error: "", success: "" });
    try {
      const res = await fetch("/api/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "Main", githubLink: mainForm.githubLink, imageUrl: mainForm.image, liveLink: mainForm.liveLink }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setMainStatus({ loading: false, success: "Main Project submitted successfully!", error: "" });
      alert("Submission of your Main Project has been completed successfully.");
      fetchSubmissions();
    } catch (err) {
      setMainStatus({ loading: false, error: err.message, success: "" });
    }
  };

  const handleLinkedinSubmit = async (e) => {
    e.preventDefault();
    if (!linkedinForm.link) {
      setLinkedinStatus({ ...linkedinStatus, error: "Please enter a LinkedIn post link." });
      return;
    }

    setLinkedinStatus({ loading: true, error: "", success: "" });
    try {
      const res = await fetch("/api/linkedin/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: linkedinForm.link }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setLinkedinStatus({ loading: false, success: "LinkedIn post submitted for review!", error: "" });
      setLinkedinForm({ link: "" });
      fetchSubmissions();
      
      // Clear success message after 5 seconds
      setTimeout(() => setLinkedinStatus(prev => ({ ...prev, success: "" })), 5000);
    } catch (err) {
      setLinkedinStatus({ loading: false, error: err.message, success: "" });
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setEditForm({
      githubLink: project.githubLink,
      image: project.imageUrl,
      liveLink: project.liveLink || "",
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
          liveLink: editForm.liveLink,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Header Profile Info */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden card-3d">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Hello, {user.name}!
            </h1>
            <p className="text-gray-400 text-sm">
              Logged in from <span className="text-emerald-400 font-semibold">{user.campus}</span> | Section: <span className="text-white">{user.section}</span> | Class: <span className="text-white">{user.class}</span> | Roll Number: <span className="text-white">{user.rollNumber}</span>
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 rounded-2xl flex items-center gap-3">
            <span className="text-sm text-gray-400">My Rating:</span>
            <span className="text-lg font-bold text-amber-400">{"★".repeat(user.rating)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEADERBOARD & LINKEDIN (LEFT SIDE) */}
        <div className="lg:col-span-4 flex flex-col gap-8 h-full">
          <div className="flex-1 min-h-[400px]">
            <LeaderboardWidget />
          </div>

          {/* LINKEDIN BONUS SECTION */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 card-3d">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-[#0a66c2] bg-white rounded-sm px-1">in</span> Bonus Points
              </h2>
              {submissions.linkedin && (
                <span className="text-xs bg-[#0a66c2]/10 border border-[#0a66c2]/20 px-2.5 py-1 rounded-full text-[#3b8fd9] font-medium">
                  {submissions.linkedin.submissionCount} Submitted
                </span>
              )}
            </div>
            
            {submissions.linkedin && submissions.linkedin.score > 0 && (
              <div className="mb-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center justify-between">
                <span className="text-sm text-amber-200/80">Bonus Score Added:</span>
                <span className="font-bold text-amber-400">+{submissions.linkedin.score} ★</span>
              </div>
            )}

            <p className="text-gray-400 text-xs mb-4">
              Submit your LinkedIn post links talking about your projects to earn extra leaderboard stars after admin review!
            </p>

            <form onSubmit={handleLinkedinSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="url"
                  placeholder="Paste LinkedIn post URL..."
                  value={linkedinForm.link}
                  onChange={(e) => setLinkedinForm({ link: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#0a66c2]/50 transition-all text-sm"
                  required
                />
              </div>

              {linkedinStatus.error && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <FaExclamationCircle /> {linkedinStatus.error}
                </p>
              )}
              {linkedinStatus.success && (
                <p className="text-emerald-400 text-xs flex items-center gap-1">
                  <FaCheckCircle /> {linkedinStatus.success}
                </p>
              )}

              <button
                type="submit"
                disabled={linkedinStatus.loading}
                className="w-full py-2.5 bg-[#0a66c2] hover:bg-[#004182] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-[#0a66c2]/20 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {linkedinStatus.loading ? "Submitting..." : "Submit Link"}
              </button>
            </form>
          </div>
        </div>

        {/* SUBMISSION FORMS (RIGHT SIDE) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* MINI PROJECT SUBMISSION CARD */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between card-3d">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide">Mini Project</h2>
              <span className="text-xs bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-gray-400">
                Required for All
              </span>
            </div>

            <div className="space-y-6">
              {/* Show already submitted mini projects */}
              {submissions.miniProjects.map((mini, idx) => (
                <div key={mini._id} className="space-y-4 py-4 text-center border-b border-white/5 last:border-0 pb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FaCheckCircle className="text-emerald-400 text-3xl" />
                    <h3 className="text-white font-semibold">Mini Project {idx + 1} Submitted</h3>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left text-sm space-y-2 max-w-sm mx-auto">
                    <p className="truncate text-gray-400">
                      <strong className="text-white">Github:</strong> <a href={mini.githubLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">{mini.githubLink}</a>
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-gray-400 flex items-center gap-2">
                        <strong className="text-white">Status:</strong> {mini.status || "Pending"}
                      </p>
                      <button
                        onClick={() => openEditModal(mini)}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold text-xs cursor-pointer bg-transparent border-0 outline-none"
                      >
                        <FaEdit /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Show submission form if under 2 projects */}
              {submissions.miniProjects.length < 2 && (
                <form onSubmit={handleMiniSubmit} className="space-y-4 mt-4">
                  <div className="text-center mb-4">
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                      Submission {submissions.miniProjects.length + 1} of 2
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    Please submit your link to the GitHub repository and upload a screenshot of your working project.
                  </p>

                  <div className="relative">
                    <FaGithub className="absolute left-4 top-3.5 text-gray-500" />
                    <input
                      type="url"
                      placeholder="GitHub Repository URL"
                      value={miniForm.githubLink}
                      onChange={(e) => setMiniForm({ ...miniForm, githubLink: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                      required
                    />
                  </div>

                  <div className="relative border border-dashed border-white/10 hover:border-emerald-500/30 rounded-xl p-4 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "mini")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="mini-file-input"
                    />
                    <div className="text-center space-y-2 pointer-events-none">
                      <FaFileUpload className="text-gray-500 text-2xl mx-auto" />
                      <p className="text-gray-400 text-sm">
                        {miniForm.image ? "Image Selected (Click to change)" : "Upload Output Screenshot"}
                      </p>
                      <p className="text-gray-600 text-xs">PNG, JPG up to 5MB</p>
                    </div>
                  </div>

                  {miniForm.image && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={miniForm.image} alt="Preview" className="h-full object-contain" />
                    </div>
                  )}

                  {miniStatus.error && (
                    <p className="text-red-400 text-xs flex items-center gap-2">
                      <FaExclamationCircle /> {miniStatus.error}
                    </p>
                  )}
                  {miniStatus.success && (
                    <p className="text-emerald-400 text-xs flex items-center gap-2">
                      <FaCheckCircle /> {miniStatus.success}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={miniStatus.loading}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-98 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {miniStatus.loading ? "Submitting..." : `Submit Mini Project ${submissions.miniProjects.length + 1}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* MAIN PROJECT SUBMISSION CARD */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between card-3d">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide">Main Project</h2>
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 font-medium">
                Team Lead Only
              </span>
            </div>

            {user.role !== "Lead" ? (
              <div className="py-12 text-center text-gray-500 space-y-4">
                <FaInfoCircle className="text-4xl mx-auto text-gray-600" />
                <p className="text-sm max-w-xs mx-auto">
                  Only the <strong>Team Lead</strong> can view and submit the main project for the entire team.
                </p>
              </div>
            ) : !user.teamId?.problem_statement_id ? (
              <div className="py-12 text-center text-amber-500/80 space-y-4">
                <FaExclamationCircle className="text-4xl mx-auto text-amber-500/60 animate-pulse" />
                <p className="text-sm max-w-xs mx-auto font-medium leading-relaxed">
                  Go and select a problem statement first, then you will be allowed to submit your main project.
                </p>
                <Link
                  href="/dashboard/problems"
                  className="inline-flex items-center justify-center px-6 py-2.5 mt-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-all active:scale-95 shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  Select Problem Statement
                </Link>
              </div>
            ) : submissions.mainProject ? (
              <div className="space-y-4 py-4 text-center">
                <FaCheckCircle className="text-emerald-400 text-5xl mx-auto animate-pulse" />
                <h3 className="text-white font-semibold">Submitted successfully</h3>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left text-sm space-y-2 max-w-sm mx-auto">
                  <p className="truncate text-gray-400">
                    <strong className="text-white">Github:</strong> <a href={submissions.mainProject.githubLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">{submissions.mainProject.githubLink}</a>
                  </p>
                  {submissions.mainProject.liveLink && (
                    <p className="truncate text-gray-400">
                      <strong className="text-white">Live Link:</strong> <a href={submissions.mainProject.liveLink} target="_blank" rel="noopener noreferrer" className="text-[#3b8fd9] hover:underline">{submissions.mainProject.liveLink}</a>
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-gray-400 flex items-center gap-2">
                      <strong className="text-white">Status:</strong> {submissions.mainProject.status || "Pending"}
                    </p>
                    <button
                      onClick={() => openEditModal(submissions.mainProject)}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold text-xs cursor-pointer bg-transparent border-0 outline-none"
                    >
                      <FaEdit /> Edit
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMainSubmit} className="space-y-4">
                <p className="text-gray-400 text-sm mb-4">
                  As the Team Lead, submit the main project GitHub link, final output screenshot, and optional live website link for the entire team.
                </p>

                <div className="relative">
                  <FaGithub className="absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="url"
                    placeholder="GitHub Repository URL"
                    value={mainForm.githubLink}
                    onChange={(e) => setMainForm({ ...mainForm, githubLink: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    required
                  />
                </div>

                <div className="relative">
                  <FaLink className="absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="url"
                    placeholder="Live Website URL (Optional)"
                    value={mainForm.liveLink}
                    onChange={(e) => setMainForm({ ...mainForm, liveLink: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                  />
                </div>

                <div className="relative border border-dashed border-white/10 hover:border-emerald-500/30 rounded-xl p-4 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "main")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="main-file-input"
                  />
                  <div className="text-center space-y-2 pointer-events-none">
                    <FaFileUpload className="text-gray-500 text-2xl mx-auto" />
                    <p className="text-gray-400 text-sm">
                      {mainForm.image ? "Image Selected (Click to change)" : "Upload Output Screenshot"}
                    </p>
                    <p className="text-gray-600 text-xs">PNG, JPG up to 5MB</p>
                  </div>
                </div>

                {mainForm.image && (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mainForm.image} alt="Preview" className="h-full object-contain" />
                  </div>
                )}

                {mainStatus.error && (
                  <p className="text-red-400 text-xs flex items-center gap-2">
                    <FaExclamationCircle /> {mainStatus.error}
                  </p>
                )}
                {mainStatus.success && (
                  <p className="text-emerald-400 text-xs flex items-center gap-2">
                    <FaCheckCircle /> {mainStatus.success}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={mainStatus.loading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-98 cursor-pointer disabled:cursor-not-allowed"
                >
                  {mainStatus.loading ? "Submitting..." : "Submit Main Project"}
                </button>
              </form>
            )}
          </div>
        </div>

        </div>
      </div>

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

              {editingProject.type === "Main" && (
                <div>
                  <label className="block text-xs text-gray-500 font-semibold uppercase mb-1">Live Website URL</label>
                  <div className="relative">
                    <FaLink className="absolute left-4 top-3.5 text-gray-500" />
                    <input
                      type="url"
                      placeholder="Live Website URL (Optional)"
                      value={editForm.liveLink}
                      onChange={(e) => setEditForm({ ...editForm, liveLink: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase mb-1">Output Screenshot</label>
                <div className="relative border border-dashed border-white/10 hover:border-emerald-500/30 rounded-xl p-4 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "edit")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="edit-file-input"
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
