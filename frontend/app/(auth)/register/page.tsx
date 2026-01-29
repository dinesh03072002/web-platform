"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

import {
  Mail,
  Lock,
  Phone,
  User,
  ShieldCheck,
  Building2,
} from "lucide-react";

type FieldProps = {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
};

function Field({
  label,
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>

      <div className="relative group">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 blur-lg group-hover:opacity-100 transition" />

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>

          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition",
              "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [organization_name, setOrganizationName] = useState(""); // ✅ optional
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState(""); // ✅ optional
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    // ✅ organization_name optional
    // ✅ contact optional

    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (!password.trim()) return setError("Password is required");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    try {
      setLoading(true);
      setError("");

      await api.post("/api/auth/register", {
        organization_name, // ✅ optional
        name,
        email,
        contact, // ✅ optional
        password,
        confirmPassword,
      });

      router.push("/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Register failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* Premium soft background lights */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-400/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-400/25 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-pink-300/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Glow Border */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 blur-xl opacity-50" />

        {/* Card */}
        <div className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] p-7 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Admin Dashboard Access
              </div>

              <h2 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Create your account
              </h2>

              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Register to securely access the admin dashboard and manage
                contacts and newsletter subscribers.
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
              <ShieldCheck size={22} className="text-white" />
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* ✅ Organization Name optional */}
            <Field
              label="Organization Name (Optional)"
              icon={<Building2 size={18} />}
              placeholder="ABC Pvt Ltd"
              value={organization_name}
              onChange={setOrganizationName}
            />

            <Field
              label="Name"
              icon={<User size={18} />}
              placeholder="John Doe"
              value={name}
              onChange={setName}
            />

            <Field
              label="Email"
              icon={<Mail size={18} />}
              placeholder="john@gmail.com"
              value={email}
              onChange={setEmail}
            />

            {/* ✅ Contact optional */}
            <Field
              label="Contact (Optional)"
              icon={<Phone size={18} />}
              placeholder="9876543210"
              value={contact}
              onChange={setContact}
            />

            <Field
              label="Password"
              type="password"
              icon={<Lock size={18} />}
              placeholder="Password@123"
              value={password}
              onChange={setPassword}
            />

            <Field
              label="Confirm Password"
              type="password"
              icon={<Lock size={18} />}
              placeholder="Password@123"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                ❌ {error}
              </div>
            )}

            {/* Button */}
            <button
              disabled={loading}
              type="submit"
              className="mt-2 w-full rounded-2xl py-3 text-sm font-semibold text-white
              bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-300/40
              hover:opacity-95 active:scale-[0.99] transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Register"}
            </button>

            {/* Footer */}
            <p className="mt-2 text-sm text-slate-600 text-center">
              Already have an account?{" "}
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
    </div>
  );
}
