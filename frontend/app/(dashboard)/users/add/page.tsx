"use client";

import { useEffect, useState } from "react";
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

/* -------------------- FIELD COMPONENT -------------------- */
type FieldProps = {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
};

function Field({
  label,
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>

        <input
          type={type}
          disabled={disabled}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition",
            "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100",
            disabled && "opacity-70 cursor-not-allowed bg-slate-50"
          )}
        />
      </div>
    </div>
  );
}

/* -------------------- ADD USER PAGE -------------------- */
export default function AddUserPage() {
  // Organization logic
  const [organizationName, setOrganizationName] = useState("");
  const [orgLocked, setOrgLocked] = useState(false);

  // User fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* -------------------- FETCH ADMIN ORGANIZATION -------------------- */
  useEffect(() => {
    async function loadOrganization() {
      try {
        const res = await api.get("/api/admin/organization");

        if (res.data?.organization_name) {
          setOrganizationName(res.data.organization_name);
          setOrgLocked(true); // 🔒 auto-lock
        } else {
          setOrganizationName("");
          setOrgLocked(false); // ✍️ manual entry
        }
      } catch (err) {
        console.error("Failed to load organization");
      }
    }

    loadOrganization();
  }, []);

  /* -------------------- SUBMIT -------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!orgLocked && !organizationName.trim())
      return setError("Organization name is required");

    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (!password.trim()) return setError("Password is required");
    if (!role) return setError("Role is required");

    try {
      setLoading(true);

      await api.post("/api/admin/add-user", {
        organization_name: organizationName,
        name,
        email,
        contact,
        password,
        role,
      });

      setSuccess("✅ User added successfully");

      setName("");
      setEmail("");
      setContact("");
      setPassword("");
      setRole("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white border shadow p-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Add New User</h2>
          <ShieldCheck className="text-indigo-600" />
        </div>

        <Link href="/users" className="text-sm text-indigo-600 font-semibold">
          ← Back to Users
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Organization */}
          <Field
            label="Organization Name"
            icon={<Building2 size={18} />}
            placeholder="ABC Pvt Ltd"
            value={organizationName}
            onChange={setOrganizationName}
            disabled={orgLocked}
            required={!orgLocked}
          />

          <Field
            label="Name"
            icon={<User size={18} />}
            placeholder="John Doe"
            value={name}
            onChange={setName}
            required
          />

          <Field
            label="Email"
            icon={<Mail size={18} />}
            placeholder="john@gmail.com"
            value={email}
            onChange={setEmail}
            required
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
            required
          />

          {/* Role */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Role <span className="text-red-500">*</span>
            </label>

            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none"
            >
              <option value="">Select Role</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>

          {success && <div className="text-green-600 text-sm">{success}</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save User"}
          </button>
        </form>
      </div>
    </div>
  );
}