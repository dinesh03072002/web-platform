"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Mail, ArrowLeft } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });

      setSuccess(
        "✅ Reset link sent successfully! Please check your email inbox."
      );
      setEmail("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send reset link."
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
          onSubmit={handleForgotPassword}
          className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] p-7 md:p-8"
        >
          {/* Title */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">
              Forgot Password
            </h2>
            <p className="text-sm text-slate-600">
              Enter your email and we’ll send you a reset link.
            </p>
          </div>

          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none
                transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
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

          {/* Button */}
          <button
            disabled={loading}
            type="submit"
            className="mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white
            bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-300/40
            hover:opacity-95 active:scale-[0.99] transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {/* Back */}
          <div className="mt-5 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
