"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();

  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    const pass = password.trim();
    const confirm = confirmPassword.trim();

    if (!token) {
      setError("Reset token missing. Please use valid reset link.");
      return;
    }
    if (!pass) return setError("New password is required");
    if (pass.length < 6) return setError("Password must be at least 6 characters");
    if (!confirm) return setError("Confirm password is required");
    if (pass !== confirm) return setError("Passwords do not match");

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // ✅ Debug log (check token is coming)
      console.log("RESET TOKEN:", token);
      console.log("RESET PAYLOAD:", {
        token,
        password: pass,
        confirmPassword: confirm,
        newPassword: pass,
      });

      // ✅ FIX: send both password + newPassword (backend may expect newPassword)
      await axios.post(`${BASE_URL}/api/auth/reset-password`, {
        token,
        password: pass,
        confirmPassword: confirm,

        // ✅ extra safe (backend might require this key)
        newPassword: pass,
      });

      setSuccess("✅ Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      console.error("RESET ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Reset password failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* background glow */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-400/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-400/25 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 blur-xl opacity-50" />

        <form
          onSubmit={handleResetPassword}
          className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] p-7 md:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Reset Password
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Create a new password for your account.
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
              <ShieldCheck size={22} className="text-white" />
            </div>
          </div>

          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Token warning */}
          {!token && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              ⚠️ Token missing in URL.
              <br />
              Open reset link like:
              <span className="block mt-1 text-xs font-mono text-slate-700">
                /reset-password?token=xxxx
              </span>
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              New Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-11 pr-12 py-3 text-sm text-slate-900 outline-none
                transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                placeholder="••••••••"
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

          {/* Confirm */}
          <div className="space-y-2 mt-4">
            <label className="text-sm font-semibold text-slate-700">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none
              transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="••••••••"
            />
          </div>

          {/* Messages */}
          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {success}
            </div>
          )}

          <button
            disabled={loading || !token}
            type="submit"
            className="mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white
            bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-300/40
            hover:opacity-95 active:scale-[0.99] transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <p className="mt-5 text-sm text-slate-600 text-center">
            Go back to{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-700 hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
