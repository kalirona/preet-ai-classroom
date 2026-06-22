import { useState } from "react";
import { Shield, ShieldAlert, AlertTriangle, Ban, Unlock, Trash2, CheckCircle } from "lucide-react";

const STORAGE_KEYS = {
  bannedIps: "platform_banned_ips",
  abuseLogs: "platform_abuse_logs",
  securityModules: "platform_security_modules",
};

function loadArray(key: string, fallback: any[]) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
}

function loadObject(key: string, fallback: any) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
}

export default function PlatformSecurity() {
  const [shieldThreatLevel, setShieldThreatLevel] = useState<string>("LOW");
  const [alarmActive, setAlarmActive] = useState(false);
  const [securityModules, setSecurityModules] = useState<Record<string, boolean>>(
    loadObject(STORAGE_KEYS.securityModules, {
      corsMode: true, xssSanitizer: true, sqliBlocker: true,
      ddosRateLimit: true, twoFactorForce: true, secureCookies: true,
    })
  );
  const [bannedIps, setBannedIps] = useState<string[]>(loadArray(STORAGE_KEYS.bannedIps, [
    "198.51.100.42", "203.0.113.111", "185.220.101.4",
  ]));
  const [newIpBan, setNewIpBan] = useState("");
  const [abuseLogs, setAbuseLogs] = useState<any[]>(loadArray(STORAGE_KEYS.abuseLogs, [
    { id: "ab01", ip: "185.220.101.4", date: "2026-05-30 08:12:45 UTC", event: "Brute force login attempt", threat: "CRITICAL", actionHandled: "Blocked" },
    { id: "ab02", ip: "203.0.113.111", date: "2026-05-30 07:44:19 UTC", event: "SQL injection probe in /api/courses/search", threat: "HIGH", actionHandled: "Blocked" },
    { id: "ab03", ip: "109.244.3.89", date: "2026-05-30 06:15:30 UTC", event: "Content scraping detected", threat: "MEDIUM", actionHandled: "Rate limited" },
    { id: "ab04", ip: "198.51.100.42", date: "2026-05-30 05:08:12 UTC", event: "XSS attempt on workspace comments", threat: "CRITICAL", actionHandled: "Blocked" },
  ]));
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 2500);
  };

  const toggleModule = (key: string) => {
    const next = { ...securityModules, [key]: !securityModules[key] };
    setSecurityModules(next);
    localStorage.setItem(STORAGE_KEYS.securityModules, JSON.stringify(next));
  };

  const handleBanIp = () => {
    if (!newIpBan.trim()) return;
    const next = [...bannedIps, newIpBan.trim()];
    setBannedIps(next);
    localStorage.setItem(STORAGE_KEYS.bannedIps, JSON.stringify(next));
    setNewIpBan("");
    showFeedback("success", `IP ${newIpBan.trim()} banned.`);
  };

  const handleUnbanIp = (ip: string) => {
    const next = bannedIps.filter((item) => item !== ip);
    setBannedIps(next);
    localStorage.setItem(STORAGE_KEYS.bannedIps, JSON.stringify(next));
    showFeedback("success", `IP ${ip} unbanned.`);
  };

  const handleClearLogs = () => {
    setAbuseLogs([]);
    localStorage.setItem(STORAGE_KEYS.abuseLogs, JSON.stringify([]));
    showFeedback("success", "Security log cleared.");
  };

  const threatColors: Record<string, string> = {
    LOW: "text-emerald-600", ELEVATED: "text-amber-600", CRITICAL: "text-rose-600", LOCKDOWN: "text-red-700",
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

      {/* Threat Monitor */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-mono">Security Shield</h3>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Threat monitoring and intrusion prevention.</p>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-900 p-1 rounded-lg text-xs font-mono font-bold text-white shrink-0">
            {(["LOW", "ELEVATED", "CRITICAL", "LOCKDOWN"] as const).map((level) => (
              <button key={level} onClick={() => setShieldThreatLevel(level)}
                className={`px-2 py-0.5 rounded text-[10px] cursor-pointer font-extrabold transition ${shieldThreatLevel === level ? (level === "LOCKDOWN" ? "bg-red-700 animate-pulse" : level === "CRITICAL" ? "bg-rose-600" : level === "ELEVATED" ? "bg-amber-600" : "bg-emerald-600") : "text-slate-500 hover:text-slate-300"}`}>
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Threat Level</span>
            <p className={`text-sm font-bold font-mono mt-1 ${threatColors[shieldThreatLevel] || "text-slate-700"}`}>{shieldThreatLevel}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Server Port</span>
            <p className="text-xs font-bold font-mono text-slate-700 mt-1">TCP 3000 SSL</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400">Firewall</span>
            <p className="text-xs font-bold text-slate-700 mt-1">Active</p>
          </div>
        </div>

        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] text-rose-600 block font-bold font-mono tracking-wider uppercase">Emergency Lockdown</span>
            <h4 className="text-xs font-bold text-rose-900">Broadcast platform-wide security lockdown</h4>
            <p className="text-[10px] text-rose-700/80">Enforces lockdown across all workspaces and terminates active sessions.</p>
          </div>
          <button onClick={() => { setAlarmActive(!alarmActive); setShieldThreatLevel(alarmActive ? "LOW" : "LOCKDOWN"); showFeedback("success", alarmActive ? "Lockdown disarmed." : "Lockdown activated."); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase font-mono shadow-sm transition shrink-0 cursor-pointer ${alarmActive ? "bg-rose-600 text-white animate-pulse" : "bg-rose-900 hover:bg-rose-800 text-white"}`}>
            {alarmActive ? "Disarm Lockdown" : "Activate Lockdown"}
          </button>
        </div>
      </div>

      {/* Security Protocols */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Security Protocols</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage security modules and protection layers.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(securityModules).map(([key, value]) => {
            const labels: Record<string, string> = {
              corsMode: "CORS Protection", xssSanitizer: "XSS Sanitizer", sqliBlocker: "SQL Injection Blocker",
              ddosRateLimit: "DDoS Rate Limits", twoFactorForce: "MFA Enforcement", secureCookies: "Secure Cookies",
            };
            return (
              <div key={key} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">{labels[key] || key}</span>
                  <span className="text-xs font-bold text-slate-700">{value ? "Active" : "Disabled"}</span>
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

      {/* IP Ban & Abuse Logs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm md:col-span-4 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900">IP Ban Registry</h4>
            <p className="text-[9.5px] text-slate-400 mt-0.5">Block malicious IP addresses.</p>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase font-bold text-slate-500">IP Address</label>
            <div className="flex gap-2">
              <input type="text" placeholder="198.51.100.8" value={newIpBan} onChange={(e) => setNewIpBan(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleBanIp(); }}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition" />
              <button onClick={handleBanIp}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-mono text-[10.5px] font-bold transition cursor-pointer shadow-sm flex items-center gap-1">
                <Ban className="w-3 h-3" /> Ban
              </button>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider block mb-2">Banned IPs ({bannedIps.length})</span>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {bannedIps.length === 0 ? (
                <p className="text-[10px] text-slate-300 font-mono text-center py-2">No banned IPs</p>
              ) : (
                bannedIps.map((ip, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-[10.5px] font-mono">
                    <span className="text-slate-700 flex items-center gap-1.5"><ShieldAlert className="w-3 h-3 text-rose-500" /> {ip}</span>
                    <button onClick={() => handleUnbanIp(ip)}
                      className="text-slate-400 hover:text-emerald-600 font-bold uppercase text-[9px] transition flex items-center gap-1 cursor-pointer">
                      <Unlock className="w-3 h-3" /> unban
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm md:col-span-8 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Security Event Log</h4>
              <p className="text-[9.5px] text-slate-400 mt-0.5">Blocked threats and suspicious activity.</p>
            </div>
            {abuseLogs.length > 0 && (
              <button onClick={handleClearLogs}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-mono text-[9px] font-bold uppercase transition cursor-pointer flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Clear Log
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[9px] font-bold font-mono tracking-wider text-slate-400 uppercase bg-slate-50/50">
                  <th className="py-2 px-3 pb-2.5">Time</th>
                  <th className="py-2 px-3 pb-2.5">Source IP</th>
                  <th className="py-2 px-3 pb-2.5">Event</th>
                  <th className="py-2 px-3 pb-2.5">Severity</th>
                  <th className="py-2 px-3 pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {abuseLogs.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-300 font-mono text-[10.5px]">No security events</td></tr>
                ) : (
                  abuseLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 text-[10.5px] transition">
                      <td className="py-3 px-3 font-mono text-slate-400 text-[10px] whitespace-nowrap">{log.date}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">{log.ip}</td>
                      <td className="py-3 px-3 text-slate-800">{log.event}</td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[8.5px] border ${
                          log.threat === "CRITICAL" ? "bg-rose-50 text-rose-600 border-rose-200" : log.threat === "HIGH" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"
                        }`}>{log.threat}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-500 text-[10px]">{log.actionHandled}</td>
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
