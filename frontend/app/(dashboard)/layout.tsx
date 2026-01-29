"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-slate-200">
      {/* ✅ MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-screen
          bg-white border-r border-slate-200
          transition-all duration-300 overflow-hidden
          ${sidebarOpen ? "w-64" : "w-0 md:w-16"}
        `}
      >
        {/* ✅ Sidebar toggle is inside Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </aside>

      {/* ✅ Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ✅ Navbar without toggle */}
        <Navbar />

        {/* ✅ content scroll only */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-200 via-slate-100 to-indigo-100">
          {children}
        </main>
      </div>
    </div>
  );
}