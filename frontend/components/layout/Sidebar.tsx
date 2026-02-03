"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  Mail,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  UserCog,
} from "lucide-react";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Contacts", path: "/contacts", icon: Users },
  { name: "Newsletters", path: "/newsletters", icon: Mail },
  { name: "Users", path: "/users", icon: UserCog }
];

export default function Sidebar({
  sidebarOpen = true,
  setSidebarOpen,
}: {
  sidebarOpen?: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <div
      className={`h-full flex flex-col border-r border-slate-200/60 backdrop-blur-sm transition-all duration-300
      bg-gradient-to-b from-white via-blue-50/20 to-purple-50/20
      ${sidebarOpen ? "p-6" : "p-3 items-center"}
    `}
    >
      {/* Logo + Toggle */}
      <div
        className={`relative w-full flex items-center justify-between group ${
          sidebarOpen ? "mb-12" : "mb-8"
        }`}
      >
        <div className="relative">
          <div
            className={`text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${
              sidebarOpen ? "block" : "hidden"
            }`}
          >
            Admin Panel
          </div>

          {!sidebarOpen && (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-lg">A</span>
            </div>
          )}

          {sidebarOpen && (
            <>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              <Sparkles
                size={16}
                className="absolute -top-1 -right-1 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"
              />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition"
        >
          {sidebarOpen ? (
            <PanelLeftClose size={18} className="text-slate-700" />
          ) : (
            <PanelLeftOpen size={18} className="text-slate-700" />
          )}
        </button>
      </div>

      {/* Main Menu */}
      <nav className="space-y-3">
        {menu.map((item) => {
          const active = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
              ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-slate-700 hover:bg-white hover:shadow-md"
              }`}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status */}
      {sidebarOpen && (
        <div className="mt-auto pt-6 border-t border-slate-200/60">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-600">
              System Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
