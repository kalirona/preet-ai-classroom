import { useState } from "react";
import { User, Community } from "../../types";
import { Send, ArrowRight, CheckCircle, RefreshCw, Shield, Wrench, AlertTriangle, Loader2 } from "lucide-react";

interface PlatformOverviewProps {
  currentUser: User | null;
  communities: Community[];
}

export default function PlatformOverview({ currentUser, communities }: PlatformOverviewProps) {
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [maintenanceModeActive, setMaintenanceModeActive] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const totalMRR = (communities ?? []).reduce((sum, c) => sum + (c.isPremium ? c.priceMonthly : 0), 0);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 2500);
  };

  const callAction = async (action: string, url: string, body?: Record<string, unknown>) => {
    setLoading(action);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      showFeedback("success", data.message);
      if (body && "enabled" in body) setMaintenanceModeActive(!!body.enabled);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      showFeedback("error", msg);
    } finally {
      setLoading(null);
    }
  };

  const handleDispatchBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastMessage("");
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          feedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {feedback.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {feedback.msg}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 relative overflow-hidden">
          <span className="text-sm font-semibold text-slate-500">Status</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg font-bold text-slate-900">Operational</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 relative overflow-hidden">
          <span className="text-sm font-semibold text-slate-500">Database</span>
          <span className="text-lg font-bold text-slate-900 block mt-2">SQLite</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 relative overflow-hidden">
          <span className="text-sm font-semibold text-slate-500">Communities</span>
          <span className="text-lg font-bold text-slate-900 block mt-2">
            {(communities ?? []).length}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 relative overflow-hidden">
          <span className="text-sm font-semibold text-slate-500">Revenue</span>
          <span className="text-lg font-bold text-slate-900 block mt-2">
            ${totalMRR.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Communities</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">All workspaces on the platform.</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-2.5 py-1 rounded-lg">{(communities ?? []).length} active</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-80 pr-1">
            {(communities ?? []).map((comm) => (
              <div key={comm.id} className="py-3.5 flex justify-between items-center text-xs hover:bg-slate-50/80 px-2 rounded-xl transition group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                    {comm.branding?.logoUrl || comm.name?.[0] || "S"}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition">{comm.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {comm.subdomain}.skool
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-slate-900 font-mono">${comm.isPremium ? comm.priceMonthly : 0}<span className="text-slate-400 font-normal text-[10px]">/mo</span></span>
                  <span className="text-slate-400 text-[10px]">{comm.membersCount} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Send Announcement</h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Send a banner notification to all registered workspace pages.
            </p>
          </div>

          <form onSubmit={handleDispatchBroadcast} className="space-y-3 mt-4">
            {broadcastSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs space-y-1 border border-emerald-100 animate-in zoom-in-95 duration-150">
                <span className="font-bold block">Broadcast Sent</span>
                <p className="text-[9.5px] text-emerald-600">Alert dispatched to all active channels.</p>
              </div>
            ) : (
              <>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Maintenance Notice: Scheduled downtime at 04:00 UTC."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none placeholder:text-slate-400 leading-normal font-sans transition"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-200 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Broadcast
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => callAction("cache", "/api/platform/cache/flush")}
            disabled={loading !== null}
            className="p-4 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs text-left font-bold transition-all hover:shadow-sm flex items-center justify-between group disabled:opacity-60"
          >
            <span>{loading === "cache" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Flush Cache"}</span>
            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition shrink-0" />
          </button>
          <button
            onClick={() => callAction("snapshot", "/api/platform/snapshot")}
            disabled={loading !== null}
            className="p-4 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs text-left font-bold transition-all hover:shadow-sm flex items-center justify-between group disabled:opacity-60"
          >
            <span>{loading === "snapshot" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Capture Snapshot"}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0" />
          </button>
          <button
            onClick={() => callAction("maintenance", "/api/platform/maintenance/toggle", { enabled: !maintenanceModeActive })}
            disabled={loading !== null}
            className={`p-4 border rounded-xl text-xs text-left font-bold transition-all hover:shadow-sm flex items-center justify-between group disabled:opacity-60 ${
              maintenanceModeActive
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <span>{loading === "maintenance" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : maintenanceModeActive ? "Disable Maintenance" : "Enable Maintenance"}</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
          </button>
          <button
            onClick={() => callAction("alerts", "/api/platform/security/clear-alerts")}
            disabled={loading !== null}
            className="p-4 bg-cyan-50/50 hover:bg-cyan-50 border border-cyan-100 text-cyan-700 rounded-xl text-xs text-left font-bold transition-all hover:shadow-sm flex items-center justify-between group disabled:opacity-60"
          >
            <span>{loading === "alerts" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Clear Security Alerts"}</span>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
