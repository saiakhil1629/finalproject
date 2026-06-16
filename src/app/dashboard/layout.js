"use client";

import { UserProvider, useUser } from "@/context/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUsers, FaBookOpen, FaSignOutAlt, FaUserShield, FaProjectDiagram, FaFileAlt, FaTrophy, FaBell, FaBars, FaTimes } from "react-icons/fa";
import BackgroundMesh from "@/components/BackgroundMesh";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchStatusAndCheck = async () => {
      try {
        const res = await fetch("/api/projects/status", { cache: "no-store", headers: { 'Cache-Control': 'no-cache' } });
        if (res.ok) {
          const data = await res.json();
          const previousStateStr = localStorage.getItem("projectStatusState");
          let previousState = previousStateStr ? JSON.parse(previousStateStr) : null;
          
          let newNotifications = [];
          
          const compareProject = (prev, curr, title) => {
            if (!prev && curr) {
              newNotifications.push({ id: Date.now() + Math.random(), message: `You submitted ${title}.`, time: new Date().toISOString(), read: false });
            } else if (prev && curr) {
              if (prev.status !== curr.status) {
                newNotifications.push({ id: Date.now() + Math.random(), message: `${title} status changed to ${curr.status}.`, time: new Date().toISOString(), read: false });
              }
              if (prev.adminComment !== curr.adminComment && curr.adminComment) {
                newNotifications.push({ id: Date.now() + Math.random(), message: `New feedback on ${title}.`, time: new Date().toISOString(), read: false });
              }
            }
          };

          if (previousState) {
             const currMinis = data.miniProjects || [];
             const prevMinis = previousState.miniProjects || [];
             currMinis.forEach((currMini, idx) => {
               const prevMini = prevMinis.find(p => p._id === currMini._id);
               compareProject(prevMini, currMini, `Mini Project ${idx + 1}`);
             });
             compareProject(previousState.mainProject, data.mainProject, "Main Project");
          }

          if (newNotifications.length > 0) {
            const existing = JSON.parse(localStorage.getItem("notifications") || "[]");
            const updated = [...newNotifications, ...existing].slice(0, 20);
            localStorage.setItem("notifications", JSON.stringify(updated));
            setNotifications(updated);
          } else {
            setNotifications(JSON.parse(localStorage.getItem("notifications") || "[]"));
          }

          localStorage.setItem("projectStatusState", JSON.stringify(data));
        }
      } catch(e) {}
    };
    
    fetchStatusAndCheck();
    setNotifications(JSON.parse(localStorage.getItem("notifications") || "[]"));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({...n, read: true}));
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => { setShowDropdown(!showDropdown); if(!showDropdown && unreadCount > 0) markAllRead(); }} 
        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer relative"
      >
        <FaBell className="text-sm" />
        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-3 w-80 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h3 className="font-bold text-sm text-white">Notifications</h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="p-4 text-xs text-gray-500 text-center">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-4 border-b border-white/5 last:border-0 text-sm ${n.read ? 'text-gray-400' : 'text-white bg-white/5'}`}>
                  <p>{n.message}</p>
                  <span className="text-[10px] text-gray-500 mt-1 block">{new Date(n.time).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardShell({ children }) {
  const { user, loading, logout } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (path) => pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-white print:bg-white print:text-black relative overflow-hidden">
      
      {/* Ambient Background */}
      <BackgroundMesh />
      {/* Navbar */}
      <header className="border-b border-white/5 sticky top-0 bg-[var(--color-background)]/85 backdrop-blur-md z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="text-lg font-bold text-white tracking-wider hover:opacity-95 transition-opacity">
              ADHOC <span className="text-emerald-500 text-xs">PORTAL</span>
            </Link>

            {/* Desktop Nav links */}
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive("/dashboard") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/problems"
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive("/dashboard/problems") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <FaBookOpen className="text-xs" /> Problem Statements
              </Link>
              
              {user.teamId ? (
                <Link
                  href="/dashboard/team"
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                    isActive("/dashboard/team") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUsers className="text-xs" /> Team: {user.teamId.name}
                </Link>
              ) : (
                <Link
                  href="/dashboard/team/build"
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                    isActive("/dashboard/team/build") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUsers className="text-xs" /> Build Team
                </Link>
              )}

              <Link
                href="/dashboard/status"
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive("/dashboard/status") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <FaProjectDiagram className="text-xs" /> Project Status
              </Link>

              <Link
                href="/dashboard/resume"
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive("/dashboard/resume") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <FaFileAlt className="text-xs" /> Resume Builder
              </Link>

              {user.role === "Admin" && (
                <Link
                  href="/dashboard/admin"
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                    isActive("/dashboard/admin") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUserShield className="text-xs" /> Admin Panel
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-gray-400 font-medium">
              Welcome, <span className="text-white font-semibold">{user.name}</span>
            </span>

            <NotificationBell />

            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
              title="Logout"
            >
              <FaSignOutAlt className="text-sm" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#111111] border-b border-white/5 absolute w-full left-0 top-16 z-50 px-4 py-4 shadow-2xl">
            <nav className="flex flex-col gap-2 text-sm font-medium">
              <Link
                href="/dashboard"
                className={`px-4 py-3 rounded-xl transition-all ${
                  isActive("/dashboard") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/problems"
                className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                  isActive("/dashboard/problems") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <FaBookOpen className="text-sm" /> Problem Statements
              </Link>
              
              {user.teamId ? (
                <Link
                  href="/dashboard/team"
                  className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    isActive("/dashboard/team") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUsers className="text-sm" /> Team: {user.teamId.name}
                </Link>
              ) : (
                <Link
                  href="/dashboard/team/build"
                  className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    isActive("/dashboard/team/build") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUsers className="text-sm" /> Build Team
                </Link>
              )}

              <Link
                href="/dashboard/status"
                className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                  isActive("/dashboard/status") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <FaProjectDiagram className="text-sm" /> Project Status
              </Link>

              <Link
                href="/dashboard/resume"
                className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                  isActive("/dashboard/resume") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <FaFileAlt className="text-sm" /> Resume Builder
              </Link>

              {user.role === "Admin" && (
                <Link
                  href="/dashboard/admin"
                  className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                    isActive("/dashboard/admin") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUserShield className="text-sm" /> Admin Panel
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Global Announcement Banner */}
      <div className="bg-gradient-to-r from-red-600/90 to-red-500/90 border-b border-red-500 shadow-md print:hidden relative z-30">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center">
          <p className="text-white text-sm font-medium flex items-center gap-2 animate-pulse">
            <span className="text-lg">🚨</span> Announcement: Main projects Deadline till 20th June 6pm.
          </p>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <AnimatePresence mode="wait">
        <motion.main 
          key={pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-500 mt-12 bg-black/20 print:hidden">
        <p>Adhoc Network Tech</p>
        <p className="mt-1">
          Made by <span className="text-emerald-500 font-medium">saiakhil.g</span>
        </p>
      </footer>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <UserProvider>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}
