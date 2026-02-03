"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Search, X, UserCircle, Building2, Phone, Calendar, Shield, User, Lock, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* ================= TYPES ================= */
type UserRow = {
  id?: number | string;
  organization_name?: string;
  name?: string;
  email?: string;
  contact?: string;
  role?: string;
  createdAt?: string;
};

/* ================= PAGE ================= */
export default function UsersPage() {
  const router = useRouter();

  /* ---------- LIST ---------- */
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  /* ---------- VIEW ---------- */
  const [openView, setOpenView] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  /* ---------- EDIT ---------- */
  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState("");

  /* ---------- ADD ---------- */
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const [organizationName, setOrganizationName] = useState("");
  const [orgLocked, setOrgLocked] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    role: "",
  });

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    async function loadUsers() {
      const token = getToken();
      if (!token) return router.push("/login");

      try {
        const res = await api.get("/api/admin/users");
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          clearToken();
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [router]);

  /* ================= FETCH ORGANIZATION ================= */
  useEffect(() => {
    async function loadOrganization() {
      try {
        const res = await api.get("/api/admin/organization");

        if (res.data?.organization_name) {
          setOrganizationName(res.data.organization_name);
          setOrgLocked(true);
        } else {
          setOrgLocked(false);
        }
      } catch {
        console.error("Failed to load organization");
      }
    }

    loadOrganization();
  }, []);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter((u) =>
      `${u.organization_name} ${u.name} ${u.email} ${u.role}`
        .toLowerCase()
        .includes(q)
    );
  }, [users, query]);

  /* ================= UPDATE USER ================= */
  const handleUpdateUser = async () => {
    if (!editUser) return;

    try {
      setSaving(true);

      await api.put(`/api/admin/users/${editUser.id}`, {
        name: editUser.name,
        email: editUser.email,
        contact: editUser.contact,
        role: editUser.role,
        password: newPassword || undefined,
      });

      const refreshed = await api.get("/api/admin/users");
      setUsers(Array.isArray(refreshed.data) ? refreshed.data : []);

      setOpenEdit(false);
      setNewPassword("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= ADD USER ================= */
  const handleAddUser = async () => {
    if (!orgLocked && !organizationName.trim())
      return alert("Organization name is required");

    if (!newUser.name.trim()) return alert("Name is required");
    if (!newUser.email.trim()) return alert("Email is required");
    if (!newUser.password.trim()) return alert("Password is required");
    if (!newUser.role) return alert("Role is required");

    try {
      setSaving(true);

      await api.post("/api/admin/add-user", {
        organization_name: organizationName,
        name: newUser.name,
        email: newUser.email,
        contact: newUser.contact,
        password: newUser.password,
        role: newUser.role,
      });

      const refreshed = await api.get("/api/admin/users");
      setUsers(Array.isArray(refreshed.data) ? refreshed.data : []);

      setOpenAdd(false);
      setNewUser({
        name: "",
        email: "",
        contact: "",
        password: "",
        role: "",
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to add user");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
              User Management
            </h2>
            <p className="text-slate-600 text-sm mt-1">Manage your team members and permissions</p>
          </div>
          <button
            onClick={() => setOpenAdd(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
          >
            <UserCircle size={18} />
            Add New User
          </button>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative w-full md:w-[420px]">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or organization..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-600 mt-4">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-indigo-50/50 text-xs uppercase tracking-wider text-slate-700 border-b-2 border-slate-200">
                    <th className="px-6 py-4 text-left font-semibold">Organization</th>
                    <th className="px-6 py-4 text-left font-semibold">Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-left font-semibold">Role</th>
                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u, i) => (
                    <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4 text-slate-700">{u.organization_name}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={16} className="text-indigo-500" />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full",
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          )}
                        >
                          <Shield size={12} />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setOpenView(true);
                            }}
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setEditUser(u);
                              setOpenEdit(true);
                            }}
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {openView && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <UserCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">User Profile</h3>
                    <p className="text-indigo-100 text-sm">View user information</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenView(false)}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                    <Building2 size={16} />
                    Organization
                  </div>
                  <p className="text-slate-900 font-medium text-lg pl-6">
                    {selectedUser.organization_name || "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                    <Shield size={16} />
                    Role
                  </div>
                  <div className="pl-6">
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full",
                        selectedUser.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      <Shield size={14} />
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                    <User size={16} />
                    Full Name
                  </div>
                  <p className="text-slate-900 font-medium text-lg pl-6">
                    {selectedUser.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                    <Mail size={16} />
                    Email Address
                  </div>
                  <p className="text-slate-900 font-medium break-all pl-6">
                    {selectedUser.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                    <Phone size={16} />
                    Contact Number
                  </div>
                  <p className="text-slate-900 font-medium text-lg pl-6">
                    {selectedUser.contact || "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                    <Calendar size={16} />
                    Joined Date
                  </div>
                  <p className="text-slate-900 font-medium pl-6">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-5 flex justify-end border-t">
              <button
                onClick={() => setOpenView(false)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-lg shadow-indigo-500/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {openEdit && editUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <UserCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Edit User</h3>
                    <p className="text-indigo-100 text-sm">Update user information</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenEdit(false)}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={editUser.name || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={editUser.email || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, email: e.target.value })
                    }
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Phone size={16} />
                    Contact Number
                  </label>
                  <input
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={editUser.contact || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, contact: e.target.value })
                    }
                    placeholder="9876541230"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Lock size={16} />
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Shield size={16} />
                    User Role
                  </label>
                  <select
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={editUser.role}
                    onChange={(e) =>
                      setEditUser({ ...editUser, role: e.target.value })
                    }
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-5 flex justify-end gap-3 border-t">
              <button
                onClick={() => setOpenEdit(false)}
                className="px-6 py-2.5 border-2 border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD MODAL ================= */}
      {openAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <UserCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Add New User</h3>
                    <p className="text-indigo-100 text-sm">Create a new team member account</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenAdd(false)}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Building2 size={16} />
                    Organization Name
                  </label>
                  <input
                    disabled={orgLocked}
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className={cn(
                      "w-full border-2 rounded-xl px-4 py-3 transition-all outline-none",
                      orgLocked
                        ? "bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500"
                        : "border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    )}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Phone size={16} />
                    Contact Number
                  </label>
                  <input
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={newUser.contact}
                    onChange={(e) =>
                      setNewUser({ ...newUser, contact: e.target.value })
                    }
                    placeholder="9876541230"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Lock size={16} />
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Create a secure password"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Shield size={16} />
                    User Role
                  </label>
                  <select
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="">Select a role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">User</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-5 flex justify-end gap-3 border-t">
              <button
                onClick={() => setOpenAdd(false)}
                className="px-6 py-2.5 border-2 border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Adding User...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Add User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}