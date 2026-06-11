"use client";

import { UserProvider, useUser } from "@/context/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUsers, FaBookOpen, FaSignOutAlt, FaUserShield, FaProjectDiagram } from "react-icons/fa";

function DashboardShell({ children }) {
  const { user, loading, logout } = useUser();
  const pathname = usePathname();

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
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-white">
      {/* Navbar */}
      <header className="border-b border-white/5 sticky top-0 bg-[var(--color-background)]/85 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/dashboard" className="text-lg font-bold text-white tracking-wider hover:opacity-95 transition-opacity">
              ADHOC <span className="text-emerald-500 text-xs">PORTAL</span>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-xl transition-all ${
                  isActive("/dashboard") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/problems"
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  isActive("/dashboard/problems") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <FaBookOpen className="text-xs" /> Problem Statements
              </Link>
              
              {user.teamId ? (
                <Link
                  href="/dashboard/team"
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                    isActive("/dashboard/team") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUsers className="text-xs" /> Team: {user.teamId.name}
                </Link>
              ) : (
                <Link
                  href="/dashboard/team/build"
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                    isActive("/dashboard/team/build") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUsers className="text-xs" /> Build Team
                </Link>
              )}

              <Link
                href="/dashboard/status"
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  isActive("/dashboard/status") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <FaProjectDiagram className="text-xs" /> Project Status
              </Link>

              {user.role === "Admin" && (
                <Link
                  href="/dashboard/admin"
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                    isActive("/dashboard/admin") ? "bg-white/5 text-emerald-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaUserShield className="text-xs" /> Admin Panel
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-400 font-medium">
              Welcome, <span className="text-white font-semibold">{user.name}</span>
            </span>

            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
              title="Logout"
            >
              <FaSignOutAlt className="text-sm" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-500 mt-12 bg-black/20">
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
