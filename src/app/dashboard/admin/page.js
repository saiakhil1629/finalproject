"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { FaTrash, FaPlus, FaUsers, FaUserGraduate, FaFileCode, FaLightbulb, FaEye, FaSearch, FaTimes } from "react-icons/fa";

export default function AdminPanel() {
  const { user } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("problems"); // problems, students, teams, submissions
  const [data, setData] = useState({ students: [], teams: [], projects: [] });
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [newProblem, setNewProblem] = useState({ title: "", description: "" });
  const [searchQuery, setSearchQuery] = useState("");

  // Modal image state
  const [viewImage, setViewImage] = useState(null);

  // New review states
  const [reviewProject, setReviewProject] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("Approved");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "Admin") {
      router.replace("/dashboard");
      return;
    }

    fetchAdminData();
    fetchProblems();
  }, [user, router]);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/data");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await fetch("/api/problems");
      if (res.ok) {
        const json = await res.json();
        setProblems(json.problems);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProblem = async (e) => {
    e.preventDefault();
    if (!newProblem.title || !newProblem.description) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProblem),
      });

      if (res.ok) {
        setSuccess("Problem statement added successfully!");
        setNewProblem({ title: "", description: "" });
        fetchProblems();
      } else {
        const errJson = await res.json();
        setError(errJson.error || "Failed to add problem statement");
      }
    } catch (err) {
      setError("Failed to submit.");
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!confirm("Are you sure you want to delete this problem statement?")) return;

    try {
      const res = await fetch("/api/problems", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setSuccess("Problem statement deleted successfully!");
        fetchProblems();
      }
    } catch (err) {
      setError("Failed to delete.");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure you want to delete this team? All members' roles and team status will be reset.")) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/team/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });

      const resJson = await res.json();
      if (res.ok) {
        setSuccess("Team deleted successfully!");
        fetchAdminData();
      } else {
        setError(resJson.error || "Failed to delete team.");
      }
    } catch (err) {
      setError("Failed to delete team.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewProject) return;

    setReviewLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/projects/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: reviewProject._id,
          status: reviewStatus,
          adminComment: reviewComment,
        }),
      });

      const resJson = await res.json();
      if (res.ok) {
        setSuccess(`${reviewProject.type} project reviewed successfully!`);
        setReviewProject(null);
        setReviewComment("");
        fetchAdminData();
      } else {
        setError(resJson.error || "Failed to submit review.");
      }
    } catch (err) {
      setError("Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Filter functions
  const filteredStudents = data.students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.sucNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.campus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeams = data.teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Control panel for managing Adhoc Network Tech internship portal.</p>
        </div>
      </div>

      {success && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>}
      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Students</span>
            <FaUserGraduate className="text-lg text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{data.students.length}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Teams Formed</span>
            <FaUsers className="text-lg text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">{data.teams.length}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Mini Submissions</span>
            <FaFileCode className="text-lg text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {data.projects.filter((p) => p.type === "Mini").length}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs uppercase tracking-wider font-semibold">Main Submissions</span>
            <FaFileCode className="text-lg text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {data.projects.filter((p) => p.type === "Main").length}
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-white/5 gap-2 overflow-x-auto pb-1">
        {[
          { id: "problems", label: "Problem Statements", icon: FaLightbulb },
          { id: "students", label: "Students", icon: FaUserGraduate },
          { id: "teams", label: "Teams", icon: FaUsers },
          { id: "submissions", label: "Submissions", icon: FaFileCode },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
              }}
              className={`px-5 py-3 rounded-t-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white/5 border-b-2 border-emerald-500 text-emerald-400 font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="text-xs" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: PROBLEM STATEMENTS */}
      {activeTab === "problems" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Add Problem Form */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FaPlus className="text-emerald-400 text-sm" /> Add Problem Statement
            </h3>
            <form onSubmit={handleAddProblem} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Problem Title"
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase mb-1">Description</label>
                <textarea
                  placeholder="Detailed description..."
                  value={newProblem.description}
                  onChange={(e) => setNewProblem({ ...newProblem, description: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Add Statement
              </button>
            </form>
          </div>

          {/* Problems List */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white">Active Problems ({problems.length})</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {problems.map((prob) => (
                <div key={prob._id} className="glass-panel p-5 rounded-2xl border border-white/5 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">{prob.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">{prob.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProblem(prob._id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all cursor-pointer"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STUDENTS */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <FaSearch className="absolute left-4 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, SUC or campus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
            />
          </div>

          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/5 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">SUC Number</th>
                    <th className="px-6 py-4">Campus</th>
                    <th className="px-6 py-4">Class/Sec/Roll</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{student.name}</td>
                      <td className="px-6 py-4 font-mono">{student.sucNumber}</td>
                      <td className="px-6 py-4 text-emerald-400">{student.campus}</td>
                      <td className="px-6 py-4">
                        {student.class} - {student.section} - #{student.rollNumber}
                      </td>
                      <td className="px-6 py-4 text-amber-400 font-bold">{"★".repeat(student.rating)}</td>
                      <td className="px-6 py-4 text-gray-400">{student.teamId ? student.teamId.name : "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TEAMS */}
      {activeTab === "teams" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <FaSearch className="absolute left-4 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by team name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
            />
          </div>

          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/5 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Team Name</th>
                    <th className="px-6 py-4">Join Code</th>
                    <th className="px-6 py-4">Lead</th>
                    <th className="px-6 py-4">Campus</th>
                    <th className="px-6 py-4">Members Count</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTeams.map((team) => (
                    <tr key={team._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{team.name}</td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">{team.joinCode}</td>
                      <td className="px-6 py-4">{team.leadId?.name || "Deleted"}</td>
                      <td className="px-6 py-4 text-gray-400">{team.leadId?.campus || "N/A"}</td>
                      <td className="px-6 py-4">
                        {team.members.length} / {team.maxSize}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteTeam(team._id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all text-xs font-semibold cursor-pointer"
                        >
                          Reset Team
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUBMISSIONS */}
      {activeTab === "submissions" && (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 font-semibold border-b border-white/5 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Submitter / Team</th>
                  <th className="px-6 py-4">GitHub Repository</th>
                  <th className="px-6 py-4">Campus</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Output Screen</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.projects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        proj.type === "Main" ? "bg-amber-400/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {proj.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {proj.type === "Main" ? proj.teamId?.name || "Deleted Team" : proj.submitterId?.name}
                    </td>
                    <td className="px-6 py-4">
                      <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline break-all font-mono text-xs">
                        {proj.githubLink}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{proj.submitterId?.campus}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        proj.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                        proj.status === "Rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {proj.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setViewImage({ title: proj.type === "Main" ? proj.teamId?.name : proj.submitterId?.name, src: proj.imageUrl })}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <FaEye className="text-xs" /> View Output
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setReviewProject(proj);
                          setReviewStatus(proj.status === "Rejected" ? "Rejected" : "Approved");
                          setReviewComment(proj.adminComment || "");
                        }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-lg transition-all text-xs font-semibold cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR SCREENSHOT VIEW */}
      {viewImage && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-[#111111] border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-white font-bold text-sm">Output screenshot for: {viewImage.title}</h3>
              <button
                onClick={() => setViewImage(null)}
                className="text-gray-500 hover:text-white p-1"
              >
                <FaTimes />
              </button>
            </div>
            <div className="w-full flex items-center justify-center overflow-auto max-h-[70vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewImage.src} alt="Submissions Preview" className="max-w-full max-h-[65vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR PROJECT REVIEW */}
      {reviewProject && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="relative max-w-lg w-full bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-white font-bold text-lg">Review Submission</h3>
              <button
                onClick={() => setReviewProject(null)}
                className="text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-300">
              <p><span className="text-gray-400 font-semibold">Project Type:</span> <strong className="text-white">{reviewProject.type}</strong></p>
              <p>
                <span className="text-gray-400 font-semibold">{reviewProject.type === "Main" ? "Team:" : "Student:"}</span>{" "}
                <strong className="text-white">
                  {reviewProject.type === "Main" ? reviewProject.teamId?.name : reviewProject.submitterId?.name}
                </strong>
              </p>
              <p>
                <span className="text-gray-400 font-semibold">GitHub Link:</span>{" "}
                <a href={reviewProject.githubLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-mono text-xs break-all font-semibold">
                  {reviewProject.githubLink}
                </a>
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase mb-2">Review Status</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setReviewStatus("Approved")}
                    className={`flex-1 py-2 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      reviewStatus === "Approved"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("Rejected")}
                    className={`flex-1 py-2 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      reviewStatus === "Rejected"
                        ? "bg-red-500/10 border-red-500 text-red-400"
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-semibold uppercase mb-1">Feedback Comment</label>
                <textarea
                  placeholder="Enter what's right or what's wrong with the submission..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all text-sm"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewProject(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
