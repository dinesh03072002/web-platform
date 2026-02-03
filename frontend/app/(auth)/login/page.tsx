"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // ✅ Remember Me
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem("remember_email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/auth/login", {
        email,
        password,
        rememberMe,
      });

      const token = res.data?.token;

      if (!token) {
        setError("Invalid email or password");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("remember_email", email);
      } else {
        localStorage.removeItem("remember_email");
      }

      setToken(token);

      await new Promise((r) => setTimeout(r, 2000));

      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* soft lights */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-400/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-400/25 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-pink-300/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 blur-xl opacity-50" />

        <form
          onSubmit={handleLogin}
          className="relative rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] p-7 md:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Admin Login
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Sign in to continue
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
              <Shield size={22} className="text-white" />
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* 🔴 ERROR MESSAGE ABOVE EMAIL */}
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-red-600 text-sm font-semibold">
                ❌ Invalid email or password
              </p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="john@gmail.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2 mt-4">
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-2xl border border-slate-200 bg-white px-11 pr-12 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Password@123"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                {showPassword ? (
                  <EyeOff size={18} className="text-slate-600" />
                ) : (
                  <Eye size={18} className="text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me + forgot */}
          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Remember me
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-indigo-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Button */}
          <button
            disabled={loading}
            type="submit"
            className="mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-300/40 hover:opacity-95 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>

          {/* Register */}
          <p className="mt-5 text-sm text-slate-600 text-center">
            Don’t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-700 hover:underline"
            >
              Register
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-3 text-xs text-slate-500 text-center">
            Secure access • JWT protected
          </p>
        </form>
      </div>
    </div>
  );
}
