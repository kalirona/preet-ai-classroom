import React, { useState, useEffect } from "react";
import { User, PlatformRole } from "../../../types";
import { Shield, ShieldOff, Search, AlertTriangle } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  platformRole: string;
}

export default function AdminManagement({ currentUser }: { currentUser: User | null }) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        const users = (data.users || []).map((u: any) => ({
          id: u.id,
          email: u.email,
          username: u.username,
          fullName: u.fullName,
          avatarUrl: u.avatarUrl,
          platformRole: u.platformRole,
        }));
        setAllUsers(users);
        setAdmins(users.filter((u: AdminUser) => u.platformRole === PlatformRole.SUPER_ADMIN));
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handlePromote = async (userId: string) => {
    setPromoting(userId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/rbac/users/${userId}/platform-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformRole: PlatformRole.SUPER_ADMIN }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to promote");
      }
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, platformRole: PlatformRole.SUPER_ADMIN } : u))
      );
      setAdmins((prev) => [
        ...prev,
        allUsers.find((u) => u.id === userId)!,
      ]);
      setSuccess("User promoted to Super Admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPromoting(null);
    }
  };

  const handleDemote = async (userId: string) => {
    if (userId === currentUser?.id) {
      setError("Cannot demote yourself");
      return;
    }
    setPromoting(userId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/rbac/users/${userId}/platform-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformRole: PlatformRole.USER }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to demote");
      }
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, platformRole: PlatformRole.USER } : u))
      );
      setAdmins((prev) => prev.filter((u) => u.id !== userId));
      setSuccess("Super Admin demoted to User");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPromoting(null);
    }
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.platformRole !== PlatformRole.SUPER_ADMIN &&
      (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Current Super Admins */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          Super Administrators ({admins.length})
        </h3>
        <div className="space-y-2">
          {admins.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center">No super administrators found.</p>
          )}
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                  {admin.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {admin.fullName}
                    {admin.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-slate-400 font-normal">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{admin.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleDemote(admin.id)}
                disabled={promoting === admin.id || admin.id === currentUser?.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40 cursor-pointer"
              >
                <ShieldOff className="w-3.5 h-3.5" />
                {promoting === admin.id ? "..." : "Demote"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Promote User */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          Promote User to Super Admin
        </h3>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 mb-3"
        />
        {search && (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {filteredUsers.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">No users found.</p>
            )}
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{user.fullName}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePromote(user.id)}
                  disabled={promoting === user.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-40 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {promoting === user.id ? "..." : "Promote"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
