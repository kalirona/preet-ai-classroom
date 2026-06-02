import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { 
  Search, Download, ShieldAlert, Users, Calendar, TrendingUp, Info, 
  HelpCircle, AlertCircle, RefreshCw, Layers, Sparkles, Filter, X, ArrowDownWideNarrow
} from "lucide-react";
import { AuditLog, User, Community } from "../types";

interface WorkspaceAuditLogsViewProps {
  currentUser: User | null;
  activeCommunity: Community | null;
  workspaceLogs: AuditLog[];
  loadingWsLogs: boolean;
  onRefresh: () => void;
}

export default function WorkspaceAuditLogsView({
  currentUser,
  activeCommunity,
  workspaceLogs,
  loadingWsLogs,
  onRefresh
}: WorkspaceAuditLogsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "SECURITY" | "ROLE" | "LMS" | "MODERATION">("ALL");
  const [hoveredPoint, setHoveredPoint] = useState<{ date: Date; count: number; x: number; y: number } | null>(null);
  
  // D3 Sizing responsive state
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 260 });

  // Update chart width upon resizing the layout fluidly
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(300, width),
          height: 230
        });
      }
    });
    resizeObserver.observe(chartContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Filter logs safely
  const filteredLogs = workspaceLogs.filter((log) => {
    const userNameMatch = (log.userName || "System actor").toLowerCase().includes(searchTerm.toLowerCase());
    const actionMatch = (log.action || "").toLowerCase().includes(searchTerm.toLowerCase());
    const detailsMatch = (log.details || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSearch = userNameMatch || actionMatch || detailsMatch;

    if (categoryFilter === "ALL") return matchesSearch;
    if (categoryFilter === "SECURITY") {
      return matchesSearch && (log.action.includes("SECURITY") || log.action.includes("OVERRIDE") || log.action === "MUTUTAL_VIOLATION");
    }
    if (categoryFilter === "ROLE") {
      return matchesSearch && (log.action.includes("ROLE") || log.action.includes("PROMOTE") || log.action.includes("DEMOTE"));
    }
    if (categoryFilter === "LMS") {
      return matchesSearch && (log.action.includes("COURSE") || log.action.includes("LESSON") || log.action.includes("MODULE") || log.action.includes("ENROLL"));
    }
    if (categoryFilter === "MODERATION") {
      return matchesSearch && (log.action.includes("DELETE") || log.action.includes("BAN") || log.action.includes("MUTE") || log.action.includes("REMOVE"));
    }
    return matchesSearch;
  });

  // Calculate security event daily occurrence maps for the last 30 days
  const now = new Date();
  const past30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const dailyCounts = past30Days.map((date) => {
    // Count matches in filteredLogs (gives dynamic reactive plot stats!)
    const count = filteredLogs.filter((log) => {
      const logDate = new Date(log.createdAt);
      return (
        logDate.getFullYear() === date.getFullYear() &&
        logDate.getMonth() === date.getMonth() &&
        logDate.getDate() === date.getDate()
      );
    }).length;
    return { date, count };
  });

  // Export to standard enterprise compliant CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert("No logs available to export.");
      return;
    }

    const headers = ["ID", "Timestamp UTC", "Operator Name", "Action Type", "SaaS Payload Details"];
    
    const rows = filteredLogs.map((log) => [
      log.id,
      log.createdAt,
      log.userName || "System actor",
      log.action,
      log.details
    ]);

    // CSV format escape sequences
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(row => 
          row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `${activeCommunity?.subdomain || "workspace"}_security_audit_trail.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // SVG Chart parameters
  const margin = { top: 20, right: 30, bottom: 45, left: 45 };
  const chartWidth = Math.max(100, dimensions.width - margin.left - margin.right);
  const chartHeight = Math.max(100, dimensions.height - margin.top - margin.bottom);

  // D3 Scales definition
  const xScale = d3.scaleTime()
    .domain(d3.extent(dailyCounts, d => d.date) as [Date, Date])
    .range([0, chartWidth]);

  const maxVal = d3.max(dailyCounts, d => d.count) || 0;
  // Fallback beautiful round vertical grid bounds if logs are clean
  const yScale = d3.scaleLinear()
    .domain([0, Math.max(5, maxVal) + 1])
    .nice()
    .range([chartHeight, 0]);

  // Generators for line & filled glowing gradients under line
  const linePathGenerator = d3.line<{ date: Date; count: number }>()
    .x(d => xScale(d.date))
    .y(d => yScale(d.count))
    .curve(d3.curveMonotoneX);

  const areaPathGenerator = d3.area<{ date: Date; count: number }>()
    .x(d => xScale(d.date))
    .y0(chartHeight)
    .y1(d => yScale(d.count))
    .curve(d3.curveMonotoneX);

  const dPath = linePathGenerator(dailyCounts) || "";
  const dArea = areaPathGenerator(dailyCounts) || "";

  // Ticks formatting for Space Grotesk elegant axes
  const xTicks = xScale.ticks(6);
  const yTicks = yScale.ticks(5);

  const dateFormater = d3.timeFormat("%b %d");

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] overflow-y-auto p-4 sm:p-6 space-y-6" id="workspace-audit-tab">
      <div className="max-w-5xl w-full mx-auto space-y-5 animate-in fade-in duration-300">
        
        {/* Dynamic Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border border-indigo-900/30 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="text-[9px] uppercase font-mono bg-indigo-600/90 text-indigo-50 border border-indigo-400/30 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5 shadow-sm">
                <ShieldAlert className="w-3 h-3 text-emerald-400" /> SECURE AUDIT TIMELINE
              </span>
              <h3 className="text-base font-bold font-display mt-3 tracking-tight">
                Enterprise Multi-Tenant Trail Ledger
              </h3>
              <p className="text-[10.5px] text-indigo-200/90 mt-1 max-w-xl leading-relaxed">
                Audited operations logged with absolute safety on the server side. Tracks critical actions, promotions, platform-wide overrides, and compliance data mapped dynamically for <strong>{activeCommunity?.name}</strong>.
              </p>
            </div>
            
            <button
              onClick={onRefresh}
              disabled={loadingWsLogs}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 active:bg-white/20 transition rounded-xl text-[10.5px] font-bold inline-flex items-center gap-1.5 shrink-0 select-none border border-white/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingWsLogs ? "animate-spin" : ""}`} />
              Query Database
            </button>
          </div>
        </div>

        {/* D3 Security Event Frequency Chart */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#F3F4F6] pb-3">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> SECURITY EVENTS FREQUENCY
              </h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Frequency of events plotted in real-time over the last 30 days based on search constraints</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full inline-block" />
              <span className="text-[10px] text-gray-650 font-semibold font-mono">Daily Triggers</span>
            </div>
          </div>

          <div ref={chartContainerRef} className="relative w-full overflow-hidden bg-slate-50/50 rounded-2xl border p-4">
            {loadingWsLogs ? (
              <div className="h-[210px] flex items-center justify-center text-xs text-gray-400 font-mono">
                Calculating coordinate map...
              </div>
            ) : (
              <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
                {/* Embedded Gradients and Glow filters */}
                <defs>
                  <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                  </linearGradient>
                  <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <g transform={`translate(${margin.left}, ${margin.top})`}>
                  
                  {/* Y Axis Grid lines */}
                  {yTicks.map((tick, index) => (
                    <g key={`y-grid-${index}`} transform={`translate(0, ${yScale(tick)})`}>
                      <line x1={0} x2={chartWidth} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
                      <text 
                        x={-10} 
                        y={3} 
                        textAnchor="end" 
                        fill="#9CA3AF" 
                        className="text-[9px] font-mono font-medium"
                      >
                        {tick}
                      </text>
                    </g>
                  ))}

                  {/* Area projection path below the line */}
                  <path d={dArea} fill="url(#chart-area-grad)" />

                  {/* Primary Event Curve */}
                  <path 
                    d={dPath} 
                    fill="none" 
                    stroke="#4f46e5" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    filter="url(#line-glow)" 
                  />

                  {/* Interactive node dots on the vertex points */}
                  {dailyCounts.map((d, index) => {
                    const cx = xScale(d.date);
                    const cy = yScale(d.count);
                    const isHovered = hoveredPoint && hoveredPoint.date.getTime() === d.date.getTime();

                    return (
                      <circle
                        key={`node-${index}`}
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 6 : 3.5}
                        fill={isHovered ? "#FFFFFF" : "#4f46e5"}
                        stroke="#4f46e5"
                        strokeWidth={isHovered ? 3 : 1.5}
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={(e) => {
                          setHoveredPoint({
                            date: d.date,
                            count: d.count,
                            x: cx + margin.left,
                            y: cy + margin.top
                          });
                        }}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}

                  {/* X Axis label tick marks */}
                  {xTicks.map((tick, index) => (
                    <g key={`x-tick-${index}`} transform={`translate(${xScale(tick)}, ${chartHeight})`}>
                      <line y1={0} y2={5} stroke="#D1D5DB" strokeWidth="1" />
                      <text 
                        y={18} 
                        textAnchor="middle" 
                        fill="#9CA3AF" 
                        className="text-[9px] font-mono font-medium"
                      >
                        {dateFormater(tick)}
                      </text>
                    </g>
                  ))}

                  {/* Horizontal Base Line */}
                  <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#D1D5DB" strokeWidth="1" />
                </g>
              </svg>
            )}

            {/* Custom Interactive Tooltip card floating exactly targeting node coordinates */}
            {hoveredPoint && (
              <div 
                className="absolute z-20 bg-slate-900 border border-slate-950 text-white rounded-xl shadow-lg p-2.5 pointer-events-none text-[10px] font-mono leading-tight flex flex-col space-y-1 transition duration-100"
                style={{ 
                  left: `${hoveredPoint.x}px`, 
                  top: `${hoveredPoint.y - 60}px`,
                  transform: "translateX(-50%)"
                }}
              >
                <span className="text-[8.5px] text-slate-400 font-bold whitespace-nowrap">
                  📅 {hoveredPoint.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="font-bold whitespace-nowrap text-emerald-400">
                  ⚡ Events: {hoveredPoint.count} incidents
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Controls, Search Field & Category quick filter row */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
            
            {/* Search Input Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by operator name or action type..."
                className="w-full bg-slate-50 border border-gray-200 hover:border-gray-300 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs font-medium outline-none transition focus:ring-1 focus:ring-indigo-150 text-gray-800"
                id="audit-search-field"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-200 p-0.5 rounded transition text-gray-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick action button for CSV export */}
            <button
              onClick={handleExportCSV}
              className="w-full md:w-auto font-display text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 px-4.5 py-2 rounded-xl border border-slate-950 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              id="btn-export-csv"
            >
              <Download className="w-3.5 h-3.5 text-indigo-300" />
              Export to CSV
            </button>
          </div>

          {/* Quick Filter Badges for easier search segmentation */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-indigo-500" /> Segment:
            </span>
            {[
              { id: "ALL", label: "All Records", count: workspaceLogs.length },
              { 
                id: "SECURITY", 
                label: "Security alerts", 
                count: workspaceLogs.filter(l => l.action.includes("SECURITY") || l.action.includes("OVERRIDE")).length 
              },
              { 
                id: "ROLE", 
                label: "Role Shifts", 
                count: workspaceLogs.filter(l => l.action.includes("ROLE") || l.action.includes("PROMOTE") || l.action.includes("DEMOTE")).length 
              },
              { 
                id: "LMS", 
                label: "LMS events", 
                count: workspaceLogs.filter(l => l.action.includes("COURSE") || l.action.includes("LESSON") || l.action.includes("MODULE")).length 
              },
              { 
                id: "MODERATION", 
                label: "Moderation", 
                count: workspaceLogs.filter(l => l.action.includes("DELETE") || l.action.includes("BAN") || l.action.includes("MUTE")).length 
              }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-tight border transition flex items-center gap-1.5 cursor-pointer ${
                  categoryFilter === cat.id
                    ? "bg-indigo-650 text-indigo-50 border-indigo-650 shadow-sm"
                    : "bg-slate-50 text-gray-500 border-gray-150 hover:bg-gray-100"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full font-mono text-[8px] ${
                  categoryFilter === cat.id ? "bg-indigo-750 text-indigo-100" : "bg-gray-200/80 text-gray-600"
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Records Table View */}
          <div className="border border-gray-150 rounded-2xl overflow-hidden bg-slate-50/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-max">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold font-mono text-[9px] uppercase tracking-wider bg-gray-50">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Payload Incident Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150/60 bg-white">
                  {loadingWsLogs ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400 font-mono font-medium animate-pulse">
                        Accessing secure tenant database audit...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400 font-mono text-[10.5px]">
                        No audited activity found matching the search or segment constraints.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.slice().reverse().map((log: AuditLog) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 text-[10.5px] transition duration-100">
                        <td className="py-3 px-4 font-mono text-gray-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-800">
                          {log.userName || "System actor"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase border ${
                            log.action === "SECURITY_VIOLATION" || log.action.includes("SECURITY")
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : log.action.includes("ROLE")
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : log.action.includes("COURSE") || log.action.includes("LESSON")
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 max-w-md truncate md:max-w-xl font-sans" title={log.details}>
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Elegant Table Summary Footer */}
            <div className="py-3 px-4 border-t border-gray-150 bg-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>Showing {filteredLogs.length} matching entries</span>
              <span>Workspace ID: {activeCommunity?.id}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
