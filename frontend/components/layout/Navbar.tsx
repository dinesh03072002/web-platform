"use client";

import { useRouter } from "next/navigation";
import { LogOut, ChevronDown, User } from "lucide-react";
import { clearToken } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  // ✅ close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-[9999] h-14 border-b bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 px-4 md:px-6 flex items-center justify-between backdrop-blur-sm shadow-sm">

      <h1 className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Admin Dashboard
      </h1>

      {/* ✅ IMPORTANT: relative wrapper */}
      <div className="flex items-center gap-3 relative">
        {/* ✅ Logout Button */}
       

        {/* ✅ Admin Dropdown */}
        <div
          className="hidden sm:flex items-center gap-2 text-sm text-slate-600 relative"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() => setOpenMenu((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white shadow-sm border hover:bg-slate-50 transition"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border">
              👤
            </span>
            <span className="font-medium">Admin</span>

            <ChevronDown size={16} className="text-slate-500" />
          </button>

          {/* ✅ Dropdown */}
          {openMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden z-[9999]">
              {/* ✅ Profile button */}
              <button
                onClick={() => {
                  setOpenMenu(false);
                  router.push("/profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition text-left"
              >
                <User size={18} className="text-slate-500" />
                Profile
              </button>

              {/* ✅ Logout inside dropdown */}
              <button
                onClick={() => {
                  setOpenMenu(false);
                  handleLogout();
                }}
                className="w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
