import React, { useState, useEffect } from "react";
import { User, PlatformRole, WorkspaceRole } from "../types";
import { Search, Shield, UserPlus, Mail, Filter, CheckCircle2, Ban, ShieldAlert, Sparkles, AlertTriangle, RefreshCw, Users } from "lucide-react";

interface MembersViewProps {
  currentUser: User | null;
  activeCommunityId: string;
}

export default function MembersView({ currentUser, activeCommunityId }: MembersViewProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  
  // Invite Member inputs
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>(WorkspaceRole.MEMBER);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  const pfRole = currentUser?.platformRole || PlatformRole.USER;
  const wsRole = currentUser?.platformRole === PlatformRole.SUPER_ADMIN 
    ? WorkspaceRole.CREATOR 
    : (currentUser?.workspaceRoles?.[activeCommunityId] || WorkspaceRole.MEMBER);

  const isCreator = wsRole === WorkspaceRole.CREATOR;
  const isAdmin = wsRole === WorkspaceRole.ADMIN || isCreator;
  const isModerator = wsRole === WorkspaceRole.MODERATOR || isAdmin;

  async function loadWorkspaceMembers() {
    if (!activeCommunityId) return;
    setIsLoading(true);
    setFeedbackError("");
    try {
      const res = await fetch(`/api/rbac/workspaces/${activeCommunityId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      } else {
        setFeedbackError("Access Denied. You do not hold credentials to inspect team participants.");
      }
    } catch (e) {
      setFeedbackError("Failed to establish session tunnel to members list.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspaceMembers();
  }, [activeCommunityId]);

  const handleUpdateRole = async (userId: string, targetRole: string) => {
    setFeedbackSuccess("");
    setFeedbackError("");
    try {
      const res = await fetch(`/api/rbac/workspaces/${activeCommunityId}/members/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole })
      });

      if (!res.ok) {
        const errData = await res.json();
        setFeedbackError(errData.error || "Failed to update role status.");
        return;
      }

      setFeedbackSuccess("Member workspace permission altered successfully!");
      
      // Update local state and reload
      loadWorkspaceMembers();
    } catch (err) {
      setFeedbackError("Failed to coordinate role update request.");
    }
  };

  const handleUpdateStatus = async (userId: string, targetStatus: "active" | "muted" | "banned") => {
    setFeedbackSuccess("");
    setFeedbackError("");
    try {
      const res = await fetch(`/api/rbac/workspaces/${activeCommunityId}/members/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus })
      });

      if (!res.ok) {
        const errData = await res.json();
        setFeedbackError(errData.error || "Failed to update moderation status.");
        return;
      }

      const statusLabels = {
        active: "restored to active status",
        muted: "muted from chat feeds",
        banned: "suspended from space"
      };
      
      setFeedbackSuccess(`Successfully ${statusLabels[targetStatus]}!`);
      
      // Reload state
      loadWorkspaceMembers();
    } catch (err) {
      setFeedbackError("Failed to execute member moderation request.");
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setFeedbackError("");
    
    try {
      const res = await fetch(`/api/rbac/workspaces/${activeCommunityId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });

      if (!res.ok) {
        const errData = await res.json();
        setFeedbackError(errData.error || "Failed to transmit invitation.");
        return;
      }

      setInviteSuccess(true);
      setTimeout(() => {
        setInviteSuccess(false);
        setShowInviteModal(false);
        setInviteEmail("");
        // Reload list to see invited draft member
        loadWorkspaceMembers();
      }, 1500);

    } catch (err) {
      setFeedbackError("Failed to transmit email invitation hook.");
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = (m.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
                          (m.email || "").toLowerCase().includes(search.toLowerCase()) ||
                          (m.username || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] overflow-y-auto selection:bg-indigo-150" id="members-view">
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Top Header Branding Block */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
              {isModerator ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 font-display">
                {isModerator ? "Workspace Trust & Security Center" : "Workspace Members"}
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isModerator 
                  ? "Manage community team assignments, audit active participants, and configure fine-grained moderation safety locks."
                  : "Browse and discover other participants learning alongside you in this workspace."}
              </p>
            </div>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-100"
            >
              <UserPlus className="w-4 h-4" />
              Invite Team Member
            </button>
          )}
        </div>

        {/* Action feedback notices */}
        {feedbackSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedbackSuccess}</span>
          </div>
        )}
        {feedbackError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{feedbackError}</span>
          </div>
        )}

        {/* Filters and Searches Rows */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search participants by credentials, name, email or index identity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-3 text-xs text-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-650"
            />
          </div>
          <div className="md:col-span-4 relative">
            <Filter className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-3 text-xs text-gray-950 focus:outline-none focus:ring-1 focus:ring-indigo-650 cursor-pointer"
            >
              <option value="All">All Tenant Roles</option>
              <option value={WorkspaceRole.CREATOR}>Creator</option>
              <option value={WorkspaceRole.ADMIN}>Administrator</option>
              <option value={WorkspaceRole.MODERATOR}>Moderator</option>
              <option value={WorkspaceRole.MEMBER}>Member</option>
            </select>
          </div>
        </div>

        {/* Registry Table Card wrapper */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-gray-400 font-mono flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Load workspace participant profiles...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 font-mono">No active community accounts conform to filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/60 border-b border-[#E5E7EB] text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                    <th className="py-4 px-5">Participant Profile Card</th>
                    <th className="py-4 px-5">Tenant Workspace Role</th>
                    {isModerator && (
                      <>
                        <th className="py-4 px-5">Subspace Join Date</th>
                        <th className="py-4 px-5">Account Status</th>
                        <th className="py-4 px-5 text-right">Protection Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredMembers.map((member) => (
                    <tr key={member.userId} className="hover:bg-gray-50/30 transition text-xs text-gray-700">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatarUrl}
                            alt="avatar"
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-gray-100"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block">{member.fullName}</span>
                            <span className="text-[10px] text-gray-400 font-mono block">
                              {member.userId === currentUser?.id || isModerator ? member.email : "Email Hidden"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        {isAdmin && member.userId !== currentUser?.id && member.role !== WorkspaceRole.CREATOR ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                              className="bg-white border border-[#E5E7EB] rounded-lg px-2 py-1 text-[11px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-semibold"
                            >
                              <option value="creator">Creator</option>
                              <option value="admin">Admin</option>
                              <option value="moderator">Moderator</option>
                              <option value="member">Member</option>
                            </select>
                          </div>
                        ) : (
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold font-mono uppercase bg-indigo-50 border border-indigo-150 text-indigo-700 rounded`}>
                            {member.role}
                          </span>
                        )}
                      </td>
                      {isModerator && (
                        <>
                          <td className="py-4 px-5 font-mono text-gray-400 text-[10.5px]">
                            {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "Pre-seeded"}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`px-2 py-0.5 text-[9px] font-bold font-mono uppercase rounded ${
                              member.status === "banned" 
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : member.status === "muted"
                                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {member.status || "active"}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex justify-end gap-1.5">
                              {member.userId !== currentUser?.id && member.role !== WorkspaceRole.CREATOR && (
                                <div className="flex gap-1.5">
                                  {member.status !== "muted" && member.status !== "banned" && (
                                    <button
                                      onClick={() => handleUpdateStatus(member.userId, "muted")}
                                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-mono text-[9.5px] uppercase font-bold tracking-wider rounded-lg transition"
                                      title="Mute of chat communication"
                                    >
                                      Mute
                                    </button>
                                  )}
                                  {member.status !== "banned" && (
                                    <button
                                      onClick={() => handleUpdateStatus(member.userId, "banned")}
                                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-mono text-[9.5px] uppercase font-bold tracking-wider rounded-lg transition"
                                      title="Ban user account entirely"
                                    >
                                      Ban
                                    </button>
                                  )}
                                  {(member.status === "muted" || member.status === "banned") && (
                                    <button
                                      onClick={() => handleUpdateStatus(member.userId, "active")}
                                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono text-[9.5px] uppercase font-bold tracking-wider rounded-lg transition"
                                      title="Restore participant access privileges"
                                    >
                                      Approve
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Invite Member Drawer Overlays */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <span className="text-[9px] uppercase font-mono text-indigo-650 font-black tracking-widest block bg-indigo-50 px-2 py-0.5 rounded w-max">Onboarding System</span>
                <h2 className="text-base font-bold text-gray-900 font-display mt-1.5">Draft Workspace Invitation</h2>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 px-2.5 text-xs text-gray-400 hover:text-gray-600 font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSendInvite}>
              <div className="p-6 space-y-4 font-sans text-xs">
                {inviteSuccess ? (
                  <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-center space-y-1 animate-in zoom-in-95 duration-100">
                    <div className="font-bold">✨ Simulated Invitation Dispatched</div>
                    <p className="text-[10px] text-emerald-600">Simulated invite generated in DB logs successfully!</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-700">Recipient Email Coordinate</label>
                      <input
                        type="email"
                        required
                        placeholder="newmember@domain.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-950 focus:outline-none focus:ring-1 focus:ring-indigo-650 placeholder:text-gray-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-700">Sandbox Workspace Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-950 focus:outline-none cursor-pointer font-semibold"
                      >
                        <option value={WorkspaceRole.MEMBER}>Member (Standard Student)</option>
                        <option value={WorkspaceRole.MODERATOR}>Moderator (Moderate Comments & Comm)</option>
                        <option value={WorkspaceRole.ADMIN}>Admin (Manage Team & Courses)</option>
                      </select>
                    </div>

                    <p className="text-[9.5px] text-gray-400 mt-2 leading-relaxed bg-gray-50 border border-gray-100 p-2.5 rounded-xl">
                      🚀 Inviting team members spawns real workspace associations in the database. Recipient bypasses premium requirements.
                    </p>
                  </>
                )}
              </div>

              {!inviteSuccess && (
                <div className="p-6 bg-gray-50/50 border-t border-[#E5E7EB] flex justify-end gap-3 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm shadow-indigo-100"
                  >
                    Send Invitation
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
