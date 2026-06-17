"use client";

import { useState, useEffect, useRef } from "react";
import { FaDownload, FaPlus, FaTrash, FaSave, FaMagic, FaCheckCircle, FaExclamationCircle, FaSpinner } from "react-icons/fa";

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState({
    personal: { name: "", email: "", phone: "", linkedin: "", github: "" },
    summary: "",
    education: [],
    experience: [],
    projects: [],
    skills: "",
  });
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("editor"); // "editor" or "ats"
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [atsResult, setAtsResult] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsError, setAtsError] = useState("");

  // Load from local storage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("resumeData");
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved resume data");
      }
    }
    const savedAts = localStorage.getItem("resumeAtsResult");
    if (savedAts) {
      try {
        setAtsResult(JSON.parse(savedAts));
      } catch (e) {}
    }
    const savedRole = localStorage.getItem("resumeTargetRole");
    if (savedRole) {
      setTargetRole(savedRole);
    }
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("resumeData", JSON.stringify(resumeData));
    }
  }, [resumeData, mounted]);

  useEffect(() => {
    if (mounted && atsResult) {
      localStorage.setItem("resumeAtsResult", JSON.stringify(atsResult));
    }
  }, [atsResult, mounted]);

  useEffect(() => {
    if (mounted && targetRole) {
      localStorage.setItem("resumeTargetRole", targetRole);
    }
  }, [targetRole, mounted]);

  const handlePersonalChange = (e) => {
    setResumeData({
      ...resumeData,
      personal: { ...resumeData.personal, [e.target.name]: e.target.value }
    });
  };

  const handleArrayChange = (field, index, key, value) => {
    const newArray = [...resumeData[field]];
    newArray[index][key] = value;
    setResumeData({ ...resumeData, [field]: newArray });
  };

  const addArrayItem = (field, emptyItem) => {
    setResumeData({ ...resumeData, [field]: [...resumeData[field], emptyItem] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = [...resumeData[field]];
    newArray.splice(index, 1);
    setResumeData({ ...resumeData, [field]: newArray });
  };

  const printResume = () => {
    window.print();
  };

  const runAtsAnalysis = async () => {
    setAtsLoading(true);
    setAtsError("");
    try {
      const res = await fetch("/api/ai/resume-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeData, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong during review");
      }
      setAtsResult(data);
    } catch (err) {
      console.error(err);
      setAtsError(err.message || "Failed to analyze resume.");
    } finally {
      setAtsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-12rem)] relative">
      
      {/* Hide this entire column during print */}
      <div className="print:hidden w-full lg:w-1/2 overflow-y-auto pr-4 space-y-6 custom-scrollbar pb-20">
        <div className="flex flex-col gap-4 sticky top-0 bg-[var(--color-background)]/95 backdrop-blur z-10 py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white tracking-wide">Resume Builder</h1>
            <button 
              onClick={printResume}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <FaDownload /> Download PDF
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "editor"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Resume Editor
            </button>
            <button
              onClick={() => setActiveTab("ats")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "ats"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaMagic className="text-xs" /> AI ATS Optimization
            </button>
          </div>
        </div>

        {activeTab === "editor" ? (
          <div className="space-y-6">
            {/* Personal Details */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h2 className="text-lg font-semibold text-emerald-400 mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name" value={resumeData.personal.name} onChange={handlePersonalChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50" />
                <input type="email" name="email" placeholder="Email" value={resumeData.personal.email} onChange={handlePersonalChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50" />
                <input type="text" name="phone" placeholder="Phone Number" value={resumeData.personal.phone} onChange={handlePersonalChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50" />
                <input type="text" name="linkedin" placeholder="LinkedIn URL" value={resumeData.personal.linkedin} onChange={handlePersonalChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50" />
                <input type="text" name="github" placeholder="GitHub URL" value={resumeData.personal.github} onChange={handlePersonalChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 md:col-span-2" />
              </div>
            </div>

            {/* Summary */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h2 className="text-lg font-semibold text-emerald-400 mb-4">Professional Summary</h2>
              <textarea 
                placeholder="A brief summary of your professional background and goals..."
                value={resumeData.summary}
                onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 min-h-[100px]"
              />
            </div>

            {/* Education */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-emerald-400">Education</h2>
                <button onClick={() => addArrayItem("education", { degree: "", institution: "", year: "", gpa: "" })} className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1 cursor-pointer">
                  <FaPlus /> Add
                </button>
              </div>
              <div className="space-y-4">
                {resumeData.education.map((edu, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 relative group">
                    <button onClick={() => removeArrayItem("education", i)} className="absolute top-3 right-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <FaTrash />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <input type="text" placeholder="Degree / Program" value={edu.degree} onChange={(e) => handleArrayChange("education", i, "degree", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" />
                      <input type="text" placeholder="Institution" value={edu.institution} onChange={(e) => handleArrayChange("education", i, "institution", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" />
                      <input type="text" placeholder="Graduation Year (e.g. May 2025)" value={edu.year} onChange={(e) => handleArrayChange("education", i, "year", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" />
                      <input type="text" placeholder="GPA (Optional)" value={edu.gpa} onChange={(e) => handleArrayChange("education", i, "gpa", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" />
                    </div>
                  </div>
                ))}
                {resumeData.education.length === 0 && <p className="text-gray-500 text-sm text-center">No education added.</p>}
              </div>
            </div>

            {/* Experience */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-emerald-400">Experience</h2>
                <button onClick={() => addArrayItem("experience", { role: "", company: "", duration: "", details: "" })} className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1 cursor-pointer">
                  <FaPlus /> Add
                </button>
              </div>
              <div className="space-y-4">
                {resumeData.experience.map((exp, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 relative group">
                    <button onClick={() => removeArrayItem("experience", i)} className="absolute top-3 right-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <FaTrash />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <input type="text" placeholder="Job Title / Role" value={exp.role} onChange={(e) => handleArrayChange("experience", i, "role", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" />
                      <input type="text" placeholder="Company" value={exp.company} onChange={(e) => handleArrayChange("experience", i, "company", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" />
                      <input type="text" placeholder="Duration (e.g. Jan 2023 - Present)" value={exp.duration} onChange={(e) => handleArrayChange("experience", i, "duration", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm md:col-span-2" />
                      <textarea placeholder="Key responsibilities and achievements (bullet points recommended)..." value={exp.details} onChange={(e) => handleArrayChange("experience", i, "details", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm md:col-span-2 min-h-[80px]" />
                    </div>
                  </div>
                ))}
                {resumeData.experience.length === 0 && <p className="text-gray-500 text-sm text-center">No experience added.</p>}
              </div>
            </div>

            {/* Projects */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-emerald-400">Projects</h2>
                <button onClick={() => addArrayItem("projects", { title: "", tools: "", details: "", link: "" })} className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1 cursor-pointer">
                  <FaPlus /> Add
                </button>
              </div>
              <div className="space-y-4">
                {resumeData.projects.map((proj, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 relative group">
                    <button onClick={() => removeArrayItem("projects", i)} className="absolute top-3 right-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <FaTrash />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      <input type="text" placeholder="Project Title" value={proj.title} onChange={(e) => handleArrayChange("projects", i, "title", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" />
                      <input type="text" placeholder="Tech Stack (e.g. React, Node.js)" value={proj.tools} onChange={(e) => handleArrayChange("projects", i, "tools", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm" />
                      <input type="text" placeholder="GitHub Link (Optional)" value={proj.link} onChange={(e) => handleArrayChange("projects", i, "link", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm md:col-span-2" />
                      <textarea placeholder="Description and your contributions..." value={proj.details} onChange={(e) => handleArrayChange("projects", i, "details", e.target.value)} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm md:col-span-2 min-h-[80px]" />
                    </div>
                  </div>
                ))}
                {resumeData.projects.length === 0 && <p className="text-gray-500 text-sm text-center">No projects added.</p>}
              </div>
            </div>

            {/* Skills */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h2 className="text-lg font-semibold text-emerald-400 mb-4">Skills</h2>
              <textarea 
                placeholder="Languages, Frameworks, Tools (comma separated)..."
                value={resumeData.skills}
                onChange={(e) => setResumeData({...resumeData, skills: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 min-h-[80px]"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ATS Setup Box */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h2 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                <FaMagic className="text-sm" /> ATS Optimization Scanner
              </h2>
              <p className="text-gray-400 text-xs leading-relaxed">
                Enter your target career path or job title. Groq AI will evaluate your resume, estimate an ATS compatibility score, highlight missing keywords, and suggest improvements.
              </p>
              
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase text-gray-500">Target Job Role</label>
                <input 
                  type="text" 
                  placeholder="e.g. Frontend Developer, Full-Stack Engineer" 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50" 
                />
              </div>

              {atsError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs">
                  <FaExclamationCircle className="mt-0.5 shrink-0" />
                  <p>{atsError}</p>
                </div>
              )}

              <button
                onClick={runAtsAnalysis}
                disabled={atsLoading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {atsLoading ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" /> Analyzing Resume...
                  </>
                ) : (
                  "Run ATS Analysis"
                )}
              </button>
            </div>

            {/* ATS Results Output */}
            {atsLoading && (
              <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center space-y-4 text-center">
                <FaSpinner className="animate-spin text-4xl text-emerald-400" />
                <div className="space-y-1">
                  <p className="text-white font-semibold text-sm">Evaluating Resume Context...</p>
                  <p className="text-gray-500 text-xs">Comparing your summary, skills, and projects against standard "{targetRole}" requirements.</p>
                </div>
              </div>
            )}

            {atsResult && !atsLoading && (
              <div className="space-y-6">
                {/* Score & Compatibility Overview */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-6">
                  {/* Radial score circle */}
                  <div className="relative w-28 h-28 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={atsResult.score >= 80 ? "#10b981" : atsResult.score >= 50 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (Math.min(100, Math.max(0, atsResult.score)) / 100) * 251.2}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">{atsResult.score}%</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Match</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="font-bold text-white text-base">ATS Compatibility Rating</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {atsResult.atsAnalysis}
                    </p>
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                  <h3 className="font-bold text-white text-sm">Suggested Missing Keywords</h3>
                  <p className="text-gray-500 text-[11px] leading-snug">
                    Recruiters search for these specific skills for a <strong className="text-gray-300">"{targetRole}"</strong> role. Try adding them to your Skills or Project details:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 ? (
                      atsResult.missingKeywords.map((kw, i) => (
                        <span 
                          key={i} 
                          className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg"
                        >
                          + {kw}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-xs">No missing keywords identified! Excellent match.</p>
                    )}
                  </div>
                </div>

                {/* Actionable Suggestions */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="font-bold text-white text-sm">Improvement Suggestions</h3>
                  <div className="space-y-3">
                    {atsResult.improvementSuggestions && atsResult.improvementSuggestions.length > 0 ? (
                      atsResult.improvementSuggestions.map((sug, i) => (
                        <div key={i} className="flex gap-3 text-xs leading-relaxed text-gray-300">
                          <FaCheckCircle className="text-emerald-400 shrink-0 mt-0.5 text-sm" />
                          <p>{sug}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-xs">No suggestions! Your resume is highly optimized.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIVE PREVIEW COLUMN - This is what gets printed */}
      <div className="w-full lg:w-1/2 bg-gray-800 lg:bg-transparent rounded-xl flex justify-center overflow-y-auto custom-scrollbar print:w-full print:block print:overflow-visible print:bg-white print:m-0 print:p-0">
        
        {/* The Actual A4 Paper Resume */}
        <div 
          className="bg-white text-black shadow-2xl shrink-0 w-full max-w-[800px] min-h-[1050px] p-10 md:p-14 print:shadow-none print:max-w-none print:w-full print:min-h-0 print:py-8 print:px-10"
          style={{ fontFamily: "'Times New Roman', Times, serif" }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wide mb-1">
              {resumeData.personal.name || "YOUR NAME"}
            </h1>
            <div className="text-[13px] flex flex-wrap justify-center gap-x-3 text-gray-800">
              {resumeData.personal.phone && <span>{resumeData.personal.phone}</span>}
              {resumeData.personal.phone && (resumeData.personal.email || resumeData.personal.linkedin || resumeData.personal.github) && <span>|</span>}
              
              {resumeData.personal.email && <a href={`mailto:${resumeData.personal.email}`} className="text-blue-700 hover:underline">{resumeData.personal.email}</a>}
              {resumeData.personal.email && (resumeData.personal.linkedin || resumeData.personal.github) && <span>|</span>}
              
              {resumeData.personal.linkedin && <a href={resumeData.personal.linkedin} className="text-blue-700 hover:underline">{resumeData.personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '') || "LinkedIn"}</a>}
              {resumeData.personal.linkedin && resumeData.personal.github && <span>|</span>}
              
              {resumeData.personal.github && <a href={resumeData.personal.github} className="text-blue-700 hover:underline">{resumeData.personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, '') || "GitHub"}</a>}
            </div>
          </div>

          {/* Summary */}
          {resumeData.summary && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-0.5">Professional Summary</h2>
              <p className="text-[13px] leading-snug whitespace-pre-wrap">{resumeData.summary}</p>
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-0.5">Education</h2>
              {resumeData.education.map((edu, i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[14px] font-bold">{edu.institution}</span>
                    <span className="text-[13px]">{edu.year}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[13px] italic">{edu.degree}</span>
                    {edu.gpa && <span className="text-[13px]">GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-0.5">Experience</h2>
              {resumeData.experience.map((exp, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[14px] font-bold">{exp.role}</span>
                    <span className="text-[13px]">{exp.duration}</span>
                  </div>
                  <div className="text-[13px] italic mb-1">{exp.company}</div>
                  <ul className="list-disc list-inside text-[13px] leading-snug">
                    {exp.details.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                      <li key={idx} className="mb-0.5 pl-1" style={{ textIndent: '-1.2em', marginLeft: '1.2em' }}>
                        {line.replace(/^-\s*/, '') /* Remove dash if user typed one */}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {resumeData.projects.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-0.5">Projects</h2>
              {resumeData.projects.map((proj, i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="text-[14px] font-bold">{proj.title}</span>
                      {proj.tools && <span className="text-[13px] italic"> | {proj.tools}</span>}
                    </div>
                    {proj.link && <a href={proj.link} className="text-[12px] text-blue-700 hover:underline whitespace-nowrap">{proj.link.replace(/^https?:\/\//, '')}</a>}
                  </div>
                  <ul className="list-disc list-inside text-[13px] leading-snug mt-1">
                    {proj.details.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                      <li key={idx} className="mb-0.5 pl-1" style={{ textIndent: '-1.2em', marginLeft: '1.2em' }}>
                        {line.replace(/^-\s*/, '')}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {resumeData.skills && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-2 pb-0.5">Technical Skills</h2>
              <p className="text-[13px] leading-snug">
                {resumeData.skills}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
