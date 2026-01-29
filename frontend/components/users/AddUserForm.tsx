"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

import { Mail, Lock, Phone, User, ShieldCheck, Building2 } from "lucide-react";

type FieldProps = {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
};

function Field({
  label,
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  disabled = false,
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
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition",
              "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100",
              disabled && "opacity-70 cursor-not-allowed bg-slate-50"
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default function AddUserForm() {
  const [organization_name, setOrganizationName] = useState("");
  const [orgLocked, setOrgLocked] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Fetch admin organization on page load
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await api.get("/api/admin/organization");

        if (res.data) {
          setOrganizationName(res.data.name);
          setOrgLocked(true);
        } else {
          setOrgLocked(false);
        }
      } catch (err) {
        console.error("Failed to fetch organization", err);
      }
    };

    fetchOrganization();
  }, []);

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();

    if (!orgLocked && !organization_name.trim()) {
      return setError("Company / Organization name is required");
    }

    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (!password.trim()) return setError("Password is required");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await api.post("/api/admin/add-user", {
        organization_name,
        name,
        email,
        contact,
        password,
        confirmPassword: password, // ✅ AUTO-SENT (NO UI FIELD)
      });

      setSuccess("✅ User saved successfully!");

      setName("");
      setEmail("");
      setContact("");
      setPassword("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Saving user failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">


      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-400/25 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-400/25 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 blur-xl opacity-50" />

        <div className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] p-7 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Admin Panel - Add User
              </div>

              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Add New User
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
              <ShieldCheck size={22} className="text-white" />
            </div>
          </div>

          <div className="mt-3">
            <Link
              href="/users"
              className="text-sm font-semibold text-indigo-700 hover:underline"
            >
              ← Back to Users
            </Link>
          </div>

          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          <form onSubmit={handleSaveUser} className="space-y-4">
            {!orgLocked ? (
              <Field
                label="Company / Organization Name"
                icon={<Building2 size={18} />}
                placeholder="ABC Pvt Ltd"
                value={organization_name}
                onChange={setOrganizationName}
              />
            ) : (
              <Field
                label="Company / Organization Name"
                icon={<Building2 size={18} />}
                placeholder="ABC Pvt Ltd"
                value={organization_name}
                onChange={setOrganizationName}
                disabled
              />
            )}

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

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                ❌ {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-2 w-full rounded-2xl py-3 text-sm font-semibold text-white
              bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-300/40
              hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Saving user..." : "Save User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}