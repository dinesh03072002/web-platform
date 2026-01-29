"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, X, Mail, Search, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

type UserRow = {
  id?: number | string;
  organization_name?: string;
  name?: string;
  email?: string;
  contact?: string;
  role?: string;
  createdAt: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [openView, setOpenView] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");

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

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter((u) =>
      `${u.organization_name} ${u.name} ${u.email} ${u.role}`
        .toLowerCase()
        .includes(q)
    );
  }, [users, query]);

  const handleUpdateUser = async () => {
    if (!editUser) return;

    try {
      setSaving(true);

      await api.put(`/api/admin/users/${editUser.id}`, {
        name: editUser.name,
        email: editUser.email,
        contact: editUser.contact,
        role: editUser.role,
        password: newPassword,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? { ...editUser } : u))
      );

      setOpenEdit(false);
      setNewPassword("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <h2 className="text-4xl font-bold text-slate-900">Users</h2>

      {/* 🔍 Search */}
      <div className="p-4 bg-white rounded-2xl shadow-sm border">
        <div className="relative w-full md:w-[420px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-200 outline-none"
          />
        </div>
      </div>

      {/* 📋 Table */}
      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading users...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b">
                <th className="px-6 py-4 text-left">Organization</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.map((u, idx) => (
                <tr key={String(u.id ?? idx)} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-5 font-medium text-slate-700 capitalize">
                    {u.organization_name || "-"}
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-900 capitalize">
                    {u.name}
                  </td>
                  <td className="px-6 py-5 text-slate-600 flex items-center gap-2">
                    <Mail size={14} /> {u.email}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setOpenView(true);
                        }}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditUser(u);
                          setOpenEdit(true);
                        }}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 👁 VIEW MODAL */}
      {openView && selectedUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-lg">
            <div className="flex justify-between">
              <h3 className="font-bold text-lg">User Details</h3>
              <button onClick={() => setOpenView(false)}><X /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-slate-700">
              <p><b>Name:</b> {selectedUser.name}</p>
              <p><b>Email:</b> {selectedUser.email}</p>
              <p><b>Contact:</b> {selectedUser.contact}</p>
              <p><b>Role:</b> {selectedUser.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* ✏ EDIT MODAL */}
      {openEdit && editUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-lg">
            <div className="flex justify-between">
              <h3 className="font-bold text-lg">Edit User</h3>
              <button onClick={() => setOpenEdit(false)}><X /></button>
            </div>

            <div className="space-y-4 mt-4">
              <input className="w-full border rounded-xl px-3 py-2" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}/>
              <input className="w-full border rounded-xl px-3 py-2" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}/>
              <input className="w-full border rounded-xl px-3 py-2" value={editUser.contact || ""} onChange={(e) => setEditUser({ ...editUser, contact: e.target.value })}/>
              <input type="password" placeholder="New Password (optional)" className="w-full border rounded-xl px-3 py-2" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
              <select className="w-full border rounded-xl px-3 py-2" value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setOpenEdit(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
              <button onClick={handleUpdateUser} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
