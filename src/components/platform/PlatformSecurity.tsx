import { useState } from "react";

export default function PlatformSecurity() {
  const [shieldThreatLevel, setShieldThreatLevel] = useState<"LOW" | "ELEVATED" | "CRITICAL" | "LOCKDOWN">("LOW");
  const [alarmActive, setAlarmActive] = useState(false);
  const [securityModules, setSecurityModules] = useState({
    corsMode: true,
    xssSanitizer: true,
    sqliBlocker: true,
    ddosRateLimit: true,
    twoFactorForce: true,
    secureCookies: true,
  });
  const [bannedIps, setBannedIps] = useState<string[]>([
    "198.51.100.42",
    "203.0.113.111",
    "185.220.101.4",
  ]);
  const [newIpBan, setNewIpBan] = useState("");
  const [abuseLogs, setAbuseLogs] = useState([
    { id: "ab01", ip: "185.220.101.4", date: "2026-05-30 08:12:45 UTC", event: "Automated Bruteforce Botnet Probe", threat: "CRITICAL", actionHandled: "Temporarily rate-grouped & auto-rejected via CloudPanel TLS ingress policy" },
    { id: "ab02", ip: "203.0.113.111", date: "2026-05-30 07:44:19 UTC", event: "SQLi Injection Probe in /api/courses/search", threat: "HIGH", actionHandled: "Sanitized completely & source IP placed on temporary honeypot lock" },
    { id: "ab03", ip: "109.244.3.89", date: "2026-05-30 06:15:30 UTC", event: "Syllabus Content Scraper Crawler Campaign", threat: "MEDIUM", actionHandled: "Enforced captcha-challenge loop block in egress route" },
    { id: "ab04", ip: "198.51.100.42", date: "2026-05-30 05:08:12 UTC", event: "XSS Infiltration attempt on Workspace comments payload", threat: "CRITICAL", actionHandled: "Blocked & blacklisted globally" },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">

      {/* 1. Threat Monitor */}
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
            <span className="px-2 text-slate-500 uppercase text-[9px]">THREAT:</span>
            {(["LOW", "ELEVATED", "CRITICAL", "LOCKDOWN"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setShieldThreatLevel(level)}
                className={`px-2 py-0.5 rounded text-[10px] cursor-pointer font-extrabold transition ${shieldThreatLevel === level ? (level === "LOCKDOWN" ? "bg-red-700 animate-pulse" : level === "CRITICAL" ? "bg-rose-600" : level === "ELEVATED" ? "bg-amber-600" : "bg-emerald-600") : "text-slate-500 hover:text-slate-300"}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400">Threat Level</span>
            <span className={`text-sm font-bold font-mono mt-1 ${shieldThreatLevel === "LOCKDOWN" ? "text-red-700 animate-pulse" : shieldThreatLevel === "CRITICAL" ? "text-rose-600" : shieldThreatLevel === "ELEVATED" ? "text-amber-600" : "text-emerald-600"}`}>
              {shieldThreatLevel}
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400">Port</span>
            <span className="text-xs font-bold font-mono text-slate-700 mt-1">TCP 3000 SSL</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400">Firewall</span>
            <span className="text-xs font-bold text-slate-700 mt-1">TLS Proxy Active</span>
          </div>
        </div>

        {/* Emergency broadcast */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] text-rose-600 block font-bold font-mono tracking-wider uppercase">Emergency Lockdown</span>
            <h4 className="text-xs font-bold text-rose-900">Broadcast platform-wide security evacuation</h4>
            <p className="text-[10px] text-rose-700/80 leading-normal">Enforces lockdown across all workspaces and terminates active sessions.</p>
          </div>

          <button
            onClick={() => {
              setAlarmActive(!alarmActive);
              if (!alarmActive) {
                setShieldThreatLevel("LOCKDOWN");
                alert("Platform shifted to LOCKDOWN state.");
              } else {
                setShieldThreatLevel("LOW");
                alert("Lockdown disarmed. Platform reverted to normal.");
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase font-mono shadow-sm transition shrink-0 cursor-pointer ${
              alarmActive
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-rose-900 hover:bg-rose-800 text-white"
            }`}
          >
            {alarmActive ? "Disarm Lockdown" : "Activate Lockdown"}
          </button>
        </div>
      </div>

      {/* 2. Security Protocols */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Security Protocols</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">MFA enforcement, CORS, XSS sanitization, and DDoS protection.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(securityModules).map(([key, value]) => {
            let displayName = key.replace(/([A-Z])/g, ' $1').trim();
            if (key === "twoFactorForce") displayName = "MFA Enforcement";
            if (key === "corsMode") displayName = "CORS Protection";
            if (key === "xssSanitizer") displayName = "XSS Sanitizer";
            if (key === "sqliBlocker") displayName = "SQL Injection Blocker";
            if (key === "ddosRateLimit") displayName = "DDoS Rate Limits";
            if (key === "secureCookies") displayName = "Secure Cookies";

            return (
              <div key={key} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">{displayName}</span>
                  <span className="text-xs font-bold text-slate-700">{value ? "Active" : "Disabled"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSecurityModules(prev => ({ ...prev, [key]: !value }))}
                  className={`w-11 h-6 rounded-full transition relative shrink-0 cursor-pointer ${value ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <span className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all duration-150 ${value ? "left-5.5" : "left-1"}`} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-indigo-50 border border-indigo-200/70 p-3.5 rounded-xl">
          <p className="text-[10px] text-indigo-800 leading-relaxed">
            <strong>MFA Enforcement:</strong> Enabling hardware MFA shields all database access pathways. Admin and Owner credentials require authenticator keys before granting edit access.
          </p>
        </div>
      </div>

      {/* 3. IP Ban Registry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-100">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm md:col-span-4 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-display">IP Ban Registry</h4>
            <p className="text-[9.5px] text-slate-400 mt-0.5">Block malicious IPs before they reach the proxy layer.</p>
          </div>

          <div className="space-y-1.5 text-xs font-sans">
            <label className="block text-[10px] font-mono uppercase font-bold text-slate-500">IP Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="198.51.100.8"
                value={newIpBan}
                onChange={(e) => setNewIpBan(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
              <button
                onClick={() => {
                  if (!newIpBan.trim()) return;
                  setBannedIps([...bannedIps, newIpBan.trim()]);
                  setNewIpBan("");
                  alert(`IP ${newIpBan} banned.`);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-mono text-[10.5px] font-bold transition cursor-pointer shadow-sm"
              >
                Ban
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider block mb-2">Banned IPs ({bannedIps.length})</span>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {bannedIps.length === 0 ? (
                <p className="text-[10px] text-slate-300 font-mono text-center py-2">No bans</p>
              ) : (
                bannedIps.map((ip, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-[10.5px] font-mono">
                    <span className="text-slate-700">{ip}</span>
                    <button
                      onClick={() => {
                        setBannedIps(bannedIps.filter(item => item !== ip));
                        alert(`IP ${ip} unbanned.`);
                      }}
                      className="text-slate-400 hover:text-rose-600 font-bold uppercase text-[9px] transition"
                    >
                      remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 4. Abuse Logs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm md:col-span-8 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 font-display">Security Event Log</h4>
              <p className="text-[9.5px] text-slate-400 mt-0.5">Anomalous activity, rate-limit triggers, and threat signals.</p>
            </div>
            <button
              onClick={() => {
                setAbuseLogs([]);
                alert("Log cleared.");
              }}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-mono text-[9px] font-bold uppercase transition cursor-pointer"
            >
              Clear Log
            </button>
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
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-300 font-mono text-[10.5px]">
                      No security events
                    </td>
                  </tr>
                ) : (
                  abuseLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 text-[10.5px] transition">
                      <td className="py-3 px-3 font-mono text-slate-400 text-[10px] whitespace-nowrap">{log.date}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">{log.ip}</td>
                      <td className="py-3 px-3 text-slate-800">{log.event}</td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[8.5px] border ${
                          log.threat === "CRITICAL"
                            ? "bg-rose-50 text-rose-600 border-rose-200"
                            : log.threat === "HIGH"
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-blue-50 text-blue-600 border-blue-200"
                        }`}>
                          {log.threat}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-400 text-[10px] max-w-xs truncate" title={log.actionHandled}>
                        {log.actionHandled}
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
