"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaImage, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaFileUpload } from "react-icons/fa";

export default function Dashboard() {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState({ miniProject: null, mainProject: null });
  const [loading, setLoading] = useState(true);
  
  // Forms state
  const [miniForm, setMiniForm] = useState({ githubLink: "", image: "" });
  const [mainForm, setMainForm] = useState({ githubLink: "", image: "" });
  
  const [miniStatus, setMiniStatus] = useState({ loading: false, success: "", error: "" });
  const [mainStatus, setMainStatus] = useState({ loading: false, success: "", error: "" });

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

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e, formType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert("Image is too large. Limit it to 2MB.");
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      if (formType === "mini") {
        setMiniForm({ ...miniForm, image: base64 });
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
        body: JSON.stringify({ type: "Main", githubLink: mainForm.githubLink, imageUrl: mainForm.image }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setMainStatus({ loading: false, success: "Main Project submitted successfully!", error: "" });
      fetchSubmissions();
    } catch (err) {
      setMainStatus({ loading: false, error: err.message, success: "" });
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* MINI PROJECT SUBMISSION CARD */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col justify-between card-3d">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-wide">Mini Project</h2>
              <span className="text-xs bg-white/5 border border-white/5 px-2.5 py-1 rounded-full text-gray-400">
                Required for All
              </span>
            </div>

            {submissions.miniProject ? (
              <div className="space-y-4 py-4 text-center">
                <FaCheckCircle className="text-emerald-400 text-5xl mx-auto animate-pulse" />
                <h3 className="text-white font-semibold">Submitted successfully</h3>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left text-sm space-y-2 max-w-sm mx-auto">
                  <p className="truncate text-gray-400">
                    <strong className="text-white">Github:</strong> <a href={submissions.miniProject.githubLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">{submissions.miniProject.githubLink}</a>
                  </p>
                  <p className="text-gray-400 flex items-center gap-2">
                    <strong className="text-white">Status:</strong> Completed
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMiniSubmit} className="space-y-4">
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
                    <p className="text-gray-600 text-xs">PNG, JPG up to 2MB</p>
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
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-98"
                >
                  {miniStatus.loading ? "Submitting..." : "Submit Mini Project"}
                </button>
              </form>
            )}
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
            ) : submissions.mainProject ? (
              <div className="space-y-4 py-4 text-center">
                <FaCheckCircle className="text-emerald-400 text-5xl mx-auto animate-pulse" />
                <h3 className="text-white font-semibold">Submitted successfully</h3>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left text-sm space-y-2 max-w-sm mx-auto">
                  <p className="truncate text-gray-400">
                    <strong className="text-white">Github:</strong> <a href={submissions.mainProject.githubLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">{submissions.mainProject.githubLink}</a>
                  </p>
                  <p className="text-gray-400 flex items-center gap-2">
                    <strong className="text-white">Status:</strong> Completed
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleMainSubmit} className="space-y-4">
                <p className="text-gray-400 text-sm mb-4">
                  As the Team Lead, submit the main project GitHub link and final output screenshot for the entire team.
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
                    <p className="text-gray-600 text-xs">PNG, JPG up to 2MB</p>
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
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-98"
                >
                  {mainStatus.loading ? "Submitting..." : "Submit Main Project"}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
