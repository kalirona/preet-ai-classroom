import { useState, useEffect } from "react";
import { User } from "../../types";
import { RefreshCw } from "lucide-react";

interface PlatformUsersProps {
  currentUser: User | null;
}

export default function PlatformUsers({ currentUser }: PlatformUsersProps) {
  const [globalUsers, setGlobalUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [usersSearch, setUsersSearch] = useState("");

  const filteredUsers = globalUsers.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(usersSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(usersSearch.toLowerCase()) ||
      u.platformRole?.toLowerCase().includes(usersSearch.toLowerCase())
  );

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const res = await fetch("/api/gamification/leaderboard");
        if (res.ok) {
          const data = await res.json();
          if (data.leaderboard) {
            setGlobalUsers(data.leaderboard);
          }
        }
      } catch (err) {
        setErrorMessage("Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleUpdatePlatformRole = async (userId: string, targetPlatformRole: string) => {
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const res = await fetch(`/api/rbac/users/${userId}/platform-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformRole: targetPlatformRole }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setErrorMessage(errData.error || "Failed to alter status.");
        return;
      }

      setSuccessMessage(`Successfully elevated and updated platform-level access to ${targetPlatformRole}!`);
      setGlobalUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, platformRole: targetPlatformRole as PlatformRole } : u
        )
      );
    } catch (err) {
      setErrorMessage("RBAC operational promotion failed.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">User Management</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage platform roles and security clearance levels.</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
              className="w-full sm:w-64 pl-3 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition"
            />
          </div>
        </div>

        {successMessage && (
          <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2">{errorMessage}</div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Loading users...
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                No users matching search criteria.
              </div>
            ) : (
              filteredUsers.map((userObj) => (
                <div key={userObj.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs hover:bg-slate-50/80 px-2 rounded-xl transition group">
                  <div className="flex items-center gap-3">
                    {userObj.avatarUrl ? (
                      <img
                        src={userObj.avatarUrl}
                        alt="avatar"
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {(userObj.fullName || "U")[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{userObj.fullName || "Unknown"}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded">
                          Lvl {userObj.level || 1}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-slate-400 font-mono">{userObj.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <select
                      disabled={userObj.id === currentUser?.id}
                      value={userObj.platformRole || "user"}
                      onChange={(e) => handleUpdatePlatformRole(userObj.id, e.target.value)}
                      className="border border-slate-200 bg-white text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer disabled:opacity-40 font-semibold text-slate-600 transition"
                    >
                      <option value="user">User</option>
                      <option value="super_admin">Super Admin</option>
                    </select>

                    <button
                      onClick={() => {
                        alert(`Account suspension triggered for ${userObj.fullName}.`);
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-400 rounded-lg text-[10px] uppercase font-mono font-bold cursor-pointer transition"
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
