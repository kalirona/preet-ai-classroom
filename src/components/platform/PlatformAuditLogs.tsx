import { useState, useEffect } from "react";

export default function PlatformAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [logsSearch, setLogsSearch] = useState("");
  const [logsFilterAction, setLogsFilterAction] = useState("ALL");

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/rbac/audit-logs")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.auditLogs) setAuditLogs(data.auditLogs);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredLogs = auditLogs.filter((l) => {
    const textMatch =
      l.userName?.toLowerCase().includes(logsSearch.toLowerCase()) ||
      l.details?.toLowerCase().includes(logsSearch.toLowerCase()) ||
      l.action?.toLowerCase().includes(logsSearch.toLowerCase());
    const actionMatch = logsFilterAction === "ALL" || l.action === logsFilterAction;
    return textMatch && actionMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Audit Log</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Role changes, security events, and tenant actions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={logsFilterAction}
              onChange={(e) => setLogsFilterAction(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Events</option>
              <option value="SECURITY_VIOLATION">Security Violations</option>
              <option value="ROLE_UPGRADE">Role Changes</option>
              <option value="COURSE_CREATED">Course Created</option>
              <option value="MIGRATION_AUTO">Migrations</option>
            </select>

            <input
              type="text"
              placeholder="Search logs..."
              value={logsSearch}
              onChange={(e) => setLogsSearch(e.target.value)}
              className="border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-max border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold font-mono text-[9.5px] uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Workspace</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-300 font-mono">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.slice().reverse().map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 text-[10.5px] transition">
                    <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toUTCString() : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {log.userName || "System"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono uppercase font-bold border ${
                        log.action === "SECURITY_VIOLATION"
                          ? "bg-rose-50 text-rose-600 border-rose-200"
                          : (log.action || "").includes("ROLE") || (log.action || "").includes("UPGRADE")
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : "bg-indigo-50 text-indigo-600 border-indigo-200"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">
                      {log.workspaceId || "System"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-md truncate" title={log.details}>
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
  );
}
