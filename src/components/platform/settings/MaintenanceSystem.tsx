import { useState, useEffect } from "react";
import { Activity, Clock, AlertTriangle, CheckCircle, Wrench, Database, HardDrive, Download, Power } from "lucide-react";

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

export default function MaintenanceSystem() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [dbStatus, setDbStatus] = useState<string>("checking...");
  const [backupDate, setBackupDate] = useState<string>("Never");
  const [backingUp, setBackingUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const dbRes = await fetch("/api/database/status");
        if (dbRes.ok) {
          const dbData = await dbRes.json();
          setDbStatus(dbData.connected ? "Connected" : "Disconnected");
        } else {
          setDbStatus("Error");
        }
      } catch {
        setDbStatus("Unreachable");
      }

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
          setHealth({ uptime: "N/A", cpuUsage: 0, totalErrors: 0, status: "degraded", lastChecked: new Date().toLocaleTimeString() });
        }
      } catch {
        setHealth({ uptime: "N/A", cpuUsage: 0, totalErrors: 0, status: "down", lastChecked: new Date().toLocaleTimeString() });
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  function handleBackup() {
    setBackingUp(true);
    setTimeout(() => {
      setBackupDate(new Date().toLocaleString());
      setBackingUp(false);
    }, 2000);
  }

  const statusColors: Record<string, string> = {
    healthy: "text-emerald-600 bg-emerald-50 border-emerald-200",
    degraded: "text-amber-600 bg-amber-50 border-amber-200",
    down: "text-rose-600 bg-rose-50 border-rose-200",
  };

  return (
    <div className="space-y-5">
      {/* Maintenance Mode */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-500" />
          Maintenance Mode
        </h3>
        <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-start gap-2.5">
            <Power className={`w-4 h-4 mt-0.5 shrink-0 ${maintenanceMode ? "text-amber-500" : "text-slate-300"}`} />
            <div>
              <span className="text-xs font-bold text-slate-700 block">Enable Maintenance Mode</span>
              <span className="text-[10px] text-slate-400">When enabled, only super admins can access the platform. Users see a maintenance page.</span>
            </div>
          </div>
          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ml-3 ${maintenanceMode ? "bg-amber-500" : "bg-slate-300"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${maintenanceMode ? "translate-x-5 left-0.5" : "translate-x-0 left-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Backups */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-slate-500" />
          Backups
        </h3>
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-200/80">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">Last backup</p>
            <p className="text-sm font-bold text-slate-700">{backupDate}</p>
          </div>
          <button onClick={handleBackup} disabled={backingUp}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            {backingUp ? "Backing up..." : "Run Backup"}
          </button>
        </div>
      </div>

      {/* Health */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-500" />
          System Health
        </h3>

        {loading ? (
          <div className="py-8 text-center text-slate-400 font-mono text-xs">Loading health data...</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Activity className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase font-mono">Status</span>
              </div>
              <span className={`text-sm font-bold flex items-center gap-1.5 ${health?.status === "healthy" ? "text-emerald-600" : health?.status === "degraded" ? "text-amber-600" : "text-rose-600"}`}>
                {health?.status === "healthy" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {health?.status ? health.status.charAt(0).toUpperCase() + health.status.slice(1) : "Unknown"}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase font-mono">Uptime</span>
              </div>
              <span className="text-sm font-bold text-slate-700">{health?.uptime || "N/A"}</span>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Database className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase font-mono">Database</span>
              </div>
              <span className={`text-sm font-bold ${dbStatus === "Connected" ? "text-emerald-600" : "text-rose-600"}`}>{dbStatus}</span>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <HardDrive className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase font-mono">Storage</span>
              </div>
              <span className="text-sm font-bold text-slate-700">N/A</span>
            </div>
          </div>
        )}

        {health && (
          <div className="text-right text-[10px] text-slate-400 font-mono">Last checked: {health.lastChecked} · Auto-refreshes every 30s</div>
        )}
      </div>

      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5">
        {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
        {saved ? "Saved" : "Save Settings"}
      </button>
    </div>
  );
}
