import { useState, useEffect } from "react";
import { User } from "../types";
import { BarChart3, Users, TrendingUp, Activity, Heart, UserMinus, AlertTriangle } from "lucide-react";

interface ReportsViewProps {
  currentUser: User | null;
  activeCommunityId: string;
}

interface HealthData {
  totalMembers: number;
  active7d: number;
  active30d: number;
  engagement30d: number;
  retention30d: number;
  newMembers30d: number;
  posts30d: number;
  comments30d: number;
  reactions30d: number;
  topContributors: Array<{ id: string; full_name: string; posts_count: number; comments_count: number }>;
  churnRisk: Array<{ id: string; full_name: string; last_active: string }>;
}

export default function ReportsView({ currentUser, activeCommunityId }: ReportsViewProps) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeCommunityId) return;
    loadHealth();
  }, [activeCommunityId]);

  async function loadHealth() {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/analytics/community-health?workspaceId=${activeCommunityId}`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data.health);
      } else {
        setError("Failed to load analytics");
      }
    } catch {
      setError("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="h-full bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <p className="text-xs text-slate-500">{error}</p>
          <button onClick={loadHealth} className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 font-display">Community Reports</h1>
            <p className="text-xs text-slate-400">Health metrics, engagement stats, and contributor insights.</p>
          </div>
        </div>

        {health && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Members", value: health.totalMembers, icon: Users, color: "from-indigo-500 to-indigo-600" },
                { label: "Active (7d)", value: health.active7d, icon: Activity, color: "from-emerald-500 to-emerald-600" },
                { label: "Engagement", value: `${health.engagement30d}%`, icon: Heart, color: "from-rose-500 to-rose-600" },
                { label: "Retention", value: `${health.retention30d}%`, icon: TrendingUp, color: "from-amber-500 to-amber-600" },
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

            {/* Content Activity */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4">Content Activity (30 days)</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Posts", value: health.posts30d, color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
                  { label: "Comments", value: health.comments30d, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                  { label: "Reactions", value: health.reactions30d, color: "bg-amber-50 text-amber-600 border-amber-200" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`p-4 rounded-xl border text-center ${color}`}>
                    <span className="text-2xl font-extrabold block">{value.toLocaleString()}</span>
                    <span className="text-[10px] uppercase font-mono font-bold opacity-70">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Contributors */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Top Contributors</h2>
                  <p className="text-[10px] text-slate-400">Most active members by posts and comments.</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {health.topContributors.length === 0 ? (
                    <div className="py-8 text-center text-slate-300 text-xs font-mono">No data</div>
                  ) : (
                    health.topContributors.slice(0, 5).map((c, i) => (
                      <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition">
                        <span className="text-xs font-bold text-slate-300 w-5 text-center font-mono">{i + 1}</span>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {c.full_name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-900 block truncate">{c.full_name}</span>
                          <span className="text-[10px] text-slate-400">{c.posts_count} posts · {c.comments_count} comments</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Churn Risk */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Churn Risk</h2>
                  <p className="text-[10px] text-slate-400">Members at risk of becoming inactive.</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {health.churnRisk.length === 0 ? (
                    <div className="py-8 text-center text-slate-300 text-xs font-mono">No at-risk members</div>
                  ) : (
                    health.churnRisk.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {m.full_name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-900 block truncate">{m.full_name}</span>
                          <span className="text-[10px] text-slate-400">
                            Last active: {m.last_active ? new Date(m.last_active).toLocaleDateString() : "Unknown"}
                          </span>
                        </div>
                        <UserMinus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Member Growth Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Growth Summary</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 text-center">
                  <span className="text-2xl font-extrabold text-slate-900 block">{health.newMembers30d}</span>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">New Members (30d)</span>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 text-center">
                  <span className="text-2xl font-extrabold text-slate-900 block">{health.active30d}</span>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Active (30d)</span>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 text-center">
                  <span className="text-2xl font-extrabold text-slate-900 block">{health.totalMembers}</span>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Members</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
