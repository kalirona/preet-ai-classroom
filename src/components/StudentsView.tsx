import React, { useState, useEffect } from "react";
import { User, PlatformRole, WorkspaceRole } from "../types";
import { Search, Users, GraduationCap, BookOpen, TrendingUp, Award, CheckCircle2, AlertTriangle, RefreshCw, Mail, BarChart3 } from "lucide-react";

interface StudentsViewProps {
  currentUser: User | null;
  activeCommunityId: string;
}

export default function StudentsView({ currentUser, activeCommunityId }: StudentsViewProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  async function loadStudents() {
    if (!activeCommunityId) return;
    setIsLoading(true);
    setFeedbackError("");
    try {
      const res = await fetch(`/api/rbac/workspaces/${activeCommunityId}/members`);
      if (res.ok) {
        const data = await res.json();
        const memberList = (data.members || []).filter((m: any) => {
          const role = m.role || "member";
          return role === "member" || role === "instructor";
        });
        setStudents(memberList);
      } else {
        setFeedbackError("Access denied. Instructor credentials required.");
      }
    } catch (e) {
      setFeedbackError("Failed to load student roster.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, [activeCommunityId]);

  const filteredStudents = students.filter((s: any) => {
    const q = search.toLowerCase();
    return (s.fullName || s.username || "").toLowerCase().includes(q) ||
           (s.email || "").toLowerCase().includes(q);
  });

  const totalStudents = students.length;
  const activeStudents = students.filter((s: any) => s.status === "active" || !s.status).length;
  const avgLevel = students.length > 0
    ? Math.round(students.reduce((acc: number, s: any) => acc + (s.level || 1), 0) / students.length)
    : 0;
  const topPerformers = [...students].sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0)).slice(0, 5);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-white border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900 font-display tracking-tight flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Students
            </span>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              {totalStudents} enrolled
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Manage student progress, grades, and enrollment.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadStudents}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Feedback messages */}
        {feedbackMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{feedbackMsg}</span>
          </div>
        )}
        {feedbackError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{feedbackError}</span>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <span className="text-sm font-semibold text-slate-500">Total Students</span>
            <span className="text-lg font-bold text-slate-900 block mt-2">{totalStudents}</span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <span className="text-sm font-semibold text-slate-500">Active</span>
            <span className="text-lg font-bold text-slate-900 block mt-2">{activeStudents}</span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <span className="text-sm font-semibold text-slate-500">Avg Level</span>
            <span className="text-lg font-bold text-slate-900 block mt-2">Lvl {avgLevel}</span>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <span className="text-sm font-semibold text-slate-500">Top XP</span>
            <span className="text-lg font-bold text-slate-900 block mt-2">
              {topPerformers.length > 0 ? `${topPerformers[0].xp || 0} XP` : "—"}
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Student Roster</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">View enrollment and track learning progress.</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Student list */}
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                Loading student roster...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                No students found.
              </div>
            ) : (
              filteredStudents.map((student: any) => (
                <div key={student.id || student.userId} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/80 px-2 rounded-xl transition group">
                  <div className="flex items-center gap-3">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt="avatar"
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {(student.fullName || student.username || "S")[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {student.fullName || student.username || "Unknown"}
                        </span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-600 font-mono px-1.5 py-0.5 rounded">
                          Lvl {student.level || 1}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-slate-400 font-mono">{student.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <span className="block font-bold text-slate-900 font-mono">{student.xp || 0} XP</span>
                      <span className="text-slate-400 text-[10px]">
                        {student.streak || 0} day streak
                      </span>
                    </div>
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((student.xp || 0) % 200) / 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-900">Top Performers</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {topPerformers.map((student: any, idx: number) => (
                <div key={student.id || student.userId} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs mx-auto">
                    {(student.fullName || student.username || "U")[0]}
                  </div>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {student.fullName || student.username}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 font-bold">
                    {student.xp || 0} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
