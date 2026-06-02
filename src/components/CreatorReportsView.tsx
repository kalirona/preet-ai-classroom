import React, { useState } from "react";
import { Flag, AlertTriangle, CheckCircle, Trash2, Shield, Calendar, ShieldAlert, Sparkles, Filter, ChevronDown, UserX } from "lucide-react";

interface Report {
  id: string;
  reporterName: string;
  reporterEmail: string;
  reportedName: string;
  reportedEmail: string;
  category: "Spam" | "Harassment" | "Hate Speech" | "Inappropriate" | "Plagiarism";
  location: "Feed" | "Comments" | "Group Chat" | "Profile";
  contentSnippet: string;
  status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "ESCALATED";
  date: string;
}

export default function CreatorReportsView() {
  const [toast, setToast] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [reports, setReports] = useState<Report[]>([
    {
      id: "rep-101",
      reporterName: "Sarah Connor",
      reporterEmail: "sarahc@sky.net",
      reportedName: "Cyberdyne Bot",
      reportedEmail: "bot-90@cyber.com",
      category: "Spam",
      location: "Comments",
      contentSnippet: "Invest in T-800 mining algorithms for 300% monthly returns! Free registration!",
      status: "PENDING",
      date: "2026-05-30"
    },
    {
      id: "rep-102",
      reporterName: "James Miller",
      reporterEmail: "miller.j@gmail.com",
      reportedName: "Alex Mercer",
      reportedEmail: "mercer@gentek.org",
      category: "Harassment",
      location: "Feed",
      contentSnippet: "You guys are absolute clowns, your course materials are useless rubbish.",
      status: "UNDER_REVIEW",
      date: "2026-05-29"
    },
    {
      id: "rep-103",
      reporterName: "Eleanor Vance",
      reporterEmail: "eleanor.v@hill.org",
      reportedName: "Hugh Crain",
      reportedEmail: "crain@hill.org",
      category: "Hate Speech",
      location: "Group Chat",
      contentSnippet: "Unacceptably offensive comments made targeting student origins during live class.",
      status: "PENDING",
      date: "2026-05-28"
    },
    {
      id: "rep-104",
      reporterName: "Luke Skywalker",
      reporterEmail: "luke@academy.edu",
      reportedName: "Darth Vader",
      reportedEmail: "vader@empire.io",
      category: "Inappropriate",
      location: "Feed",
      contentSnippet: "Dark side propaganda posts with intense graphic banners.",
      status: "RESOLVED",
      date: "2026-05-25"
    },
    {
      id: "rep-105",
      reporterName: "Hermione Granger",
      reporterEmail: "hermione@hogwarts.ac.uk",
      reportedName: "Ron Weasley",
      reportedEmail: "ron@weasley.co.uk",
      category: "Plagiarism",
      location: "Feed",
      contentSnippet: "Copy pasted direct translation assignments without authorship declaration.",
      status: "RESOLVED",
      date: "2026-05-24"
    }
  ]);

  const handleUpdateStatus = (id: string, newStatus: Report["status"]) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    let actionWord = "updated";
    if (newStatus === "RESOLVED") actionWord = "marked as Resolved";
    if (newStatus === "ESCALATED") actionWord = "Escalated to Creator";
    if (newStatus === "UNDER_REVIEW") actionWord = "moved to Under Review";
    
    setToast(`🛡️ Report ticket ${id} has been ${actionWord} successfully.`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDismissReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "RESOLVED" } : r));
    setToast(`✅ Report ${id} has been dismissed (marked resolved with no infraction).`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteReportedContent = (id: string, reportedName: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    setToast(`🗑️ Infringing content deleted permanently. Author "${reportedName}" has received a warning strike.`);
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const categoryMatch = filterCategory === "ALL" || r.category === filterCategory;
    const statusMatch = filterStatus === "ALL" || r.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  // KPI calculations
  const totalCount = reports.length;
  const pendingCount = reports.filter(r => r.status === "PENDING").length;
  const reviewCount = reports.filter(r => r.status === "UNDER_REVIEW").length;
  const resolvedCount = reports.filter(r => r.status === "RESOLVED").length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full bg-[#F8F9FB]" id="ws-reports-view">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold font-display text-gray-900 tracking-tight flex items-center gap-2">
            <Flag className="w-5 h-5 text-indigo-650" />
            Member Reports Center
          </h1>
          <p className="text-xs text-gray-450 mt-0.5">
            Review member-submitted misconduct flags, triage violation categories, and issue warning strikes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-indigo-50 border border-indigo-200 text-indigo-950 font-semibold px-3 py-1.5 rounded-xl pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-indigo-550 shrink-0 animate-pulse" />
          <span>94% Resolution Target Met</span>
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in zoom-in-95 duration-100">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* KPI STATISTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] text-gray-400 font-mono uppercase block">Total Tickets</span>
          <strong className="text-xl font-black text-gray-900 mt-1 block">{totalCount}</strong>
          <span className="text-[9px] text-gray-400 mt-1 block">YTD logged cases</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] text-amber-600 font-mono uppercase block">Pending Review</span>
          <strong className="text-xl font-black text-amber-605 mt-1 block">{pendingCount}</strong>
          <span className="text-[9px] text-amber-500 font-medium mt-1 block">Requires immediate triage</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] text-indigo-600 font-mono uppercase block">In Triage / Review</span>
          <strong className="text-xl font-black text-indigo-650 mt-1 block">{reviewCount}</strong>
          <span className="text-[9px] text-indigo-400 mt-1 block">Assigned standard priority</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[10px] text-emerald-600 font-mono uppercase block font-bold">Resolved Rate</span>
          <strong className="text-xl font-black text-emerald-650 mt-1 block">{resolutionRate}%</strong>
          <span className="text-[9px] text-emerald-500 font-medium mt-1 block">{resolvedCount} cases shut cleanly</span>
        </div>
      </div>

      {/* CHARTS AND TRIAGE SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FILTERS AND RECENT TICKET MANAGER */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Header & Filter Row */}
          <div className="p-4 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-extrabold uppercase tracking-wider text-slate-500 font-mono">Triage Directory Workspace</span>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent font-medium text-gray-600 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Spam">Spam</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Hate Speech">Hate Speech</option>
                  <option value="Inappropriate">Inappropriate</option>
                  <option value="Plagiarism">Plagiarism</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent font-medium text-gray-600 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="ESCALATED">Escalated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto text-xs flex-1">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-medium">
                No tickets matching active search coefficients found.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-400 uppercase font-mono border-b border-gray-150 text-[10px] tracking-wider font-extrabold">
                    <th className="py-2.5 px-4">Ticket details</th>
                    <th className="py-2.5 px-4">Violation / Area</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {report.id}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              via {report.reporterName}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 font-sans leading-relaxed italic line-clamp-2">
                            "{report.contentSnippet}"
                          </p>

                          <div className="text-[10px] text-gray-400 flex items-center gap-3">
                            <span className="flex items-center gap-0.5">
                              <UserX className="w-3 h-3" />
                              Accused: <strong className="text-gray-650">{report.reportedName}</strong>
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {report.date}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${
                            report.category === "Spam" ? "bg-amber-100 text-amber-800" :
                            report.category === "Harassment" ? "bg-rose-100 text-rose-800" :
                            report.category === "Hate Speech" ? "bg-red-100 text-red-800 font-bold" :
                            report.category === "Inappropriate" ? "bg-purple-100 text-purple-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {report.category}
                          </span>
                          <span className="block text-[10px] text-gray-450 font-mono">
                            Area: {report.location}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded ${
                          report.status === "PENDING" ? "bg-rose-50 border border-rose-350 text-rose-800" :
                          report.status === "UNDER_REVIEW" ? "bg-indigo-50 border border-indigo-300 text-indigo-800" :
                          report.status === "ESCALATED" ? "bg-amber-50 border border-amber-300 text-amber-805" :
                          "bg-emerald-50 border border-emerald-300 text-emerald-800"
                        }`}>
                          {report.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          {report.status !== "RESOLVED" && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDismissReport(report.id)}
                                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono text-[9px] font-bold rounded cursor-pointer"
                                title="Dismiss / Resolve"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(report.id, "UNDER_REVIEW")}
                                className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono text-[9px] font-bold rounded cursor-pointer"
                              >
                                Triage
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(report.id, "ESCALATED")}
                                className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-mono text-[9px] font-bold rounded cursor-pointer"
                                title="Escalate to Creator"
                              >
                                Escalate
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteReportedContent(report.id, report.reportedName)}
                            className="text-rose-600 hover:text-rose-800 font-mono font-bold text-[10px] mt-1 shrink-0 flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Purge Content
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RECENT SETTINGS METRICS CARD */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Incident Density</h3>
            
            {/* Visual SVG mini list */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-700">
                  <span>Spam Marketing Blocks</span>
                  <span className="font-mono text-gray-500 font-bold">42%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-700">
                  <span>Harassment & Toxicity</span>
                  <span className="font-mono text-gray-500 font-bold">28%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: "28%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-700">
                  <span>Plagiarism Infractions</span>
                  <span className="font-mono text-gray-500 font-bold">18%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: "18%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-700">
                  <span>Other / Spam Links</span>
                  <span className="font-mono text-gray-500 font-bold">12%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "12%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-150 pt-4 mt-6 space-y-2.5">
            <div className="flex gap-2 text-xs bg-slate-50 border border-gray-150 p-3 rounded-2xl">
              <ShieldAlert className="w-4 h-4 text-rose-550 shrink-0" />
              <p className="text-[10.5px] text-gray-550 leading-relaxed font-semibold">
                Member reports flag items directly into this workspace database index. Purging content deletes it immediately from user screens.
              </p>
            </div>
            
            <div className="bg-[#1E293B] text-white p-3.5 rounded-2xl border border-gray-700 text-xs">
              <span className="block text-[8px] uppercase tracking-wider font-mono text-indigo-400 font-black">Audit Policy rule</span>
              <span className="font-bold block mt-1 leading-snug">Resolution history is piped straight into workspace transaction ledger logs.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
