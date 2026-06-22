import { useState } from "react";
import { Shield, ShieldAlert, AlertTriangle, Ban, Unlock, Trash2, CheckCircle, Lock, Globe } from "lucide-react";

const STORAGE_KEYS = {
  bannedIps: "platform_banned_ips",
  abuseLogs: "platform_abuse_logs",
  securityModules: "platform_security_modules",
};

function loadArray(key: string, fallback: any[]) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
}

function loadObject(key: string, fallback: any) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
}

export default function PlatformSecurity() {
  const [lockdown, setLockdown] = useState(false);
  const [securityModules, setSecurityModules] = useState<Record<string, boolean>>(
    loadObject(STORAGE_KEYS.securityModules, {
      corsMode: true, xssSanitizer: true, sqliBlocker: true,
      ddosRateLimit: true, twoFactorForce: true, secureCookies: true,
    })
  );
  const [bannedIps, setBannedIps] = useState<string[]>(loadArray(STORAGE_KEYS.bannedIps, [
    "198.51.100.42", "203.0.113.111", "185.220.101.4",
  ]));
  const [newIp, setNewIp] = useState("");
  const [logs, setLogs] = useState<any[]>(loadArray(STORAGE_KEYS.abuseLogs, [
    { id: "ab01", ip: "185.220.101.4", date: "2026-05-30 08:12:45 UTC", event: "Brute force login attempt", threat: "CRITICAL", action: "Blocked" },
    { id: "ab02", ip: "203.0.113.111", date: "2026-05-30 07:44:19 UTC", event: "SQL injection probe", threat: "HIGH", action: "Blocked" },
    { id: "ab03", ip: "109.244.3.89", date: "2026-05-30 06:15:30 UTC", event: "Content scraping detected", threat: "MEDIUM", action: "Rate limited" },
    { id: "ab04", ip: "198.51.100.42", date: "2026-05-30 05:08:12 UTC", event: "XSS attempt on comments", threat: "CRITICAL", action: "Blocked" },
  ]));
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const show = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 2500);
  };

  const toggleModule = (key: string) => {
    const next = { ...securityModules, [key]: !securityModules[key] };
    setSecurityModules(next);
    localStorage.setItem(STORAGE_KEYS.securityModules, JSON.stringify(next));
  };

  const handleBan = () => {
    if (!newIp.trim()) return;
    const next = [...bannedIps, newIp.trim()];
    setBannedIps(next);
    localStorage.setItem(STORAGE_KEYS.bannedIps, JSON.stringify(next));
    setNewIp("");
    show("success", `IP ${newIp.trim()} banned.`);
  };

  const handleUnban = (ip: string) => {
    const next = bannedIps.filter((item) => item !== ip);
    setBannedIps(next);
    localStorage.setItem(STORAGE_KEYS.bannedIps, JSON.stringify(next));
    show("success", `IP ${ip} unbanned.`);
  };

  const handleClearLogs = () => {
    setLogs([]);
    localStorage.setItem(STORAGE_KEYS.abuseLogs, JSON.stringify([]));
    show("success", "Security log cleared.");
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

      {/* Lockdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Emergency Lockdown</h3>
            <p className="text-xs text-slate-400">Block access to all workspaces and terminate active sessions.</p>
          </div>
          <button onClick={() => { setLockdown(!lockdown); show("success", lockdown ? "Lockdown lifted." : "Lockdown active."); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase shadow-sm transition shrink-0 cursor-pointer ${lockdown ? "bg-rose-600 text-white animate-pulse" : "bg-rose-900 hover:bg-rose-800 text-white"}`}>
            {lockdown ? "Disarm" : "Activate"}
          </button>
        </div>
      </div>

      {/* Security Modules */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Security Measures</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(securityModules).map(([key, value]) => {
            const labels: Record<string, string> = {
              corsMode: "CORS Protection", xssSanitizer: "XSS Sanitizer", sqliBlocker: "SQL Injection Blocker",
              ddosRateLimit: "DDoS Rate Limits", twoFactorForce: "MFA Enforcement", secureCookies: "Secure Cookies",
            };
            return (
              <div key={key} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-700">{labels[key] || key}</span>
                  <span className={`text-[10px] block ${value ? "text-emerald-600" : "text-slate-400"}`}>{value ? "Active" : "Disabled"}</span>
                </div>
                <button type="button" onClick={() => toggleModule(key)}
                  className={`w-11 h-6 rounded-full transition relative shrink-0 cursor-pointer ${value ? "bg-indigo-600" : "bg-slate-200"}`}>
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-150 ${value ? "left-6" : "left-1"}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* IP Ban & Security Log */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm md:col-span-4 space-y-4">
          <h4 className="text-sm font-bold text-slate-900">IP Ban</h4>
          <div className="flex gap-2">
            <input type="text" placeholder="192.168.1.1" value={newIp} onChange={(e) => setNewIp(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleBan(); }}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition" />
            <button onClick={handleBan}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1">
              <Ban className="w-3 h-3" /> Ban
            </button>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 block mb-2">Banned ({bannedIps.length})</span>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {bannedIps.length === 0 ? (
                <p className="text-xs text-slate-300 font-mono text-center py-2">No banned IPs</p>
              ) : (
                bannedIps.map((ip, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-xs font-mono">
                    <span className="text-slate-700 flex items-center gap-1.5"><ShieldAlert className="w-3 h-3 text-rose-500" /> {ip}</span>
                    <button onClick={() => handleUnban(ip)}
                      className="text-slate-400 hover:text-emerald-600 font-bold uppercase text-[10px] transition flex items-center gap-1 cursor-pointer">
                      <Unlock className="w-3 h-3" /> unban
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm md:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Security Log</h4>
              <p className="text-xs text-slate-400">Blocked threats and suspicious activity.</p>
            </div>
            {logs.length > 0 && (
              <button onClick={handleClearLogs}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50">
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">IP</th>
                  <th className="py-2 px-3">Event</th>
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-300 font-mono text-xs">No security events</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 text-xs transition">
                      <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">{log.date}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">{log.ip}</td>
                      <td className="py-3 px-3 text-slate-800">{log.event}</td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] border ${
                          log.threat === "CRITICAL" ? "bg-rose-50 text-rose-600 border-rose-200" : log.threat === "HIGH" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"
                        }`}>{log.threat}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-500">{log.action}</td>
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
