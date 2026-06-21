import { useState, useEffect } from "react";
import { Activity, Cpu, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface HealthData {
  uptime: string;
  cpuUsage: number;
  totalErrors: number;
  status: "healthy" | "degraded" | "down";
  lastChecked: string;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
}

export default function SystemMonitor() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch("/api/platform/health");
        if (res.ok) {
          const data = await res.json();
          setHealth({
            uptime: formatUptime(data.uptimeSeconds || 0),
            cpuUsage: data.cpuUsage || 0,
            totalErrors: data.totalErrors || 0,
            status: data.status || "healthy",
            lastChecked: new Date().toLocaleTimeString(),
          });
        } else {
          setHealth({
            uptime: "N/A",
            cpuUsage: 0,
            totalErrors: 0,
            status: "degraded",
            lastChecked: new Date().toLocaleTimeString(),
          });
        }
      } catch {
        setHealth({
          uptime: "N/A",
          cpuUsage: 0,
          totalErrors: 0,
          status: "down",
          lastChecked: new Date().toLocaleTimeString(),
        });
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColors: Record<string, string> = {
    healthy: "text-emerald-600 bg-emerald-50 border-emerald-200",
    degraded: "text-amber-600 bg-amber-50 border-amber-200",
    down: "text-rose-600 bg-rose-50 border-rose-200",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">System Monitor</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Real-time platform health and basic system metrics.</p>
        </div>
        {!loading && health && (
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${statusColors[health.status] || ""}`}>
            {health.status === "healthy" ? "All Systems Operational" : health.status === "degraded" ? "Degraded" : "Down"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-mono text-xs">Loading health data...</div>
      ) : health ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase font-mono">Status</span>
            </div>
            <span className={`text-sm font-bold flex items-center gap-1.5 ${
              health.status === "healthy" ? "text-emerald-600" :
              health.status === "degraded" ? "text-amber-600" : "text-rose-600"
            }`}>
              {health.status === "healthy" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase font-mono">Uptime</span>
            </div>
            <span className="text-sm font-bold text-slate-700">{health.uptime}</span>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase font-mono">CPU Usage</span>
            </div>
            <span className="text-sm font-bold text-slate-700">{health.cpuUsage.toFixed(1)}%</span>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase font-mono">Recent Errors</span>
            </div>
            <span className={`text-sm font-bold ${health.totalErrors > 0 ? "text-rose-600" : "text-slate-700"}`}>
              {health.totalErrors}
            </span>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-rose-500 font-mono text-xs">Unable to fetch health data.</div>
      )}

      {health && (
        <div className="text-right text-[10px] text-slate-400 font-mono">
          Last checked: {health.lastChecked} · Auto-refreshes every 30s
        </div>
      )}
    </div>
  );
}
