import { useState, useEffect } from "react";
import { User } from "../types";
import { Shield, Users, Ban, VolumeX, Search } from "lucide-react";

interface ModerationCenterProps {
  currentUser: User | null;
  activeCommunityId: string;
}

interface Member {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

export default function ModerationCenter({ currentUser, activeCommunityId }: ModerationCenterProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCommunityId) return;
    loadData();
  }, [activeCommunityId]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [membersRes, logsRes] = await Promise.all([
        fetch(`/api/rbac/workspaces/${activeCommunityId}/members`),
        fetch(`/api/rbac/audit-logs?workspaceId=${activeCommunityId}`),
      ]);
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members || []);
      }
      if (logsRes.ok) {
        const data = await logsRes.json();
        setAuditLogs(data.logs || []);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMemberAction(memberId: string, userId: string, action: "banned" | "muted" | "active") {
    if (!activeCommunityId) return;
    setActionLoading(memberId + action);
    try {
      const res = await fetch(`/api/rbac/workspaces/${activeCommunityId}/members/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.userId === userId ? { ...m, status: action } : m));
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  }

  const filteredMembers = members.filter(m =>
    m.fullName?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(l => {
    const match = l.userName?.toLowerCase().includes(logSearch.toLowerCase()) ||
                  l.details?.toLowerCase().includes(logSearch.toLowerCase());
    const actionMatch = actionFilter === "ALL" || l.action === actionFilter;
    return match && actionMatch;
  });

  const statusColor = (status: string) => {
    if (status === "banned") return "bg-rose-50 text-rose-600 border-rose-200";
    if (status === "muted") return "bg-amber-50 text-amber-600 border-amber-200";
    return "bg-emerald-50 text-emerald-600 border-emerald-200";
  };

  const actionColor = (action: string) => {
    if (action.includes("BAN") || action.includes("SECURITY")) return "bg-rose-50 text-rose-600 border-rose-200";
    if (action.includes("MUTE")) return "bg-amber-50 text-amber-600 border-amber-200";
    if (action.includes("ROLE")) return "bg-indigo-50 text-indigo-600 border-indigo-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  if (isLoading) {
    return (
      <div className="h-full bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading moderation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 font-display">Moderation Center</h1>
            <p className="text-xs text-slate-400">Manage members, review logs, and enforce community rules.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Members", value: members.length, icon: Users, color: "from-indigo-500 to-indigo-600" },
            { label: "Active", value: members.filter(m => m.status === "active").length, icon: Users, color: "from-emerald-500 to-emerald-600" },
            { label: "Muted", value: members.filter(m => m.status === "muted").length, icon: VolumeX, color: "from-amber-500 to-amber-600" },
            { label: "Banned", value: members.filter(m => m.status === "banned").length, icon: Ban, color: "from-rose-500 to-rose-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">{label}</span>
              </div>
              <span className="text-xl font-extrabold text-slate-900">{value}</span>
            </div>
          ))}
        </div>

        {/* Member Management */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Member Management</h2>
              <p className="text-[10px] text-slate-400">Mute or ban members violating community guidelines.</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full sm:w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-mono text-[9.5px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 text-left">Member</th>
                  <th className="py-2.5 px-4 text-left">Role</th>
                  <th className="py-2.5 px-4 text-left">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-300 font-mono">No members found</td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {m.fullName?.[0] || m.email?.[0] || "?"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{m.fullName || "Unknown"}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{m.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${statusColor(m.status)}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {m.role === "owner" ? (
                          <span className="text-[10px] text-slate-300 font-mono">Protected</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            {m.status !== "muted" && (
                              <button
                                disabled={actionLoading === m.userId + "muted"}
                                onClick={() => handleMemberAction(m.id, m.userId, "muted")}
                                className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-[10px] font-bold hover:bg-amber-100 transition cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading === m.userId + "muted" ? "..." : "Mute"}
                              </button>
                            )}
                            {m.status !== "banned" && (
                              <button
                                disabled={actionLoading === m.userId + "banned"}
                                onClick={() => handleMemberAction(m.id, m.userId, "banned")}
                                className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-bold hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading === m.userId + "banned" ? "..." : "Ban"}
                              </button>
                            )}
                            {m.status !== "active" && (
                              <button
                                disabled={actionLoading === m.userId + "active"}
                                onClick={() => handleMemberAction(m.id, m.userId, "active")}
                                className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                              >
                                {actionLoading === m.userId + "active" ? "..." : "Restore"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Moderation Log</h2>
              <p className="text-[10px] text-slate-400">Audit trail of all moderation actions in this workspace.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All Actions</option>
                <option value="MEMBER_BANNED">Bans</option>
                <option value="MEMBER_MUTED">Mutes</option>
                <option value="ROLE_CHANGED">Role Changes</option>
                <option value="SECURITY_VIOLATION">Security</option>
              </select>
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-7 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-mono text-[9.5px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 text-left">Time</th>
                  <th className="py-2.5 px-4 text-left">Actor</th>
                  <th className="py-2.5 px-4 text-left">Action</th>
                  <th className="py-2.5 px-4 text-left">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-300 font-mono">No logs found</td>
                  </tr>
                ) : (
                  filteredLogs.slice().reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap text-[10px]">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{log.userName || "System"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${actionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[10px] max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
