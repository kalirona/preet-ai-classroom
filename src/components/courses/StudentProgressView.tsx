import React, { useState, useEffect, useMemo } from "react";
import { Search, Users, UserCheck, AlertTriangle, Award, Clock, BookOpen, ArrowRight, Filter, ChevronDown, FileText, Star, TrendingUp, Activity } from "lucide-react";

interface StudentData {
  enrollment_id: string;
  course_id: string;
  user_id: string;
  enrollment_status: string;
  progress: number;
  completed_lessons: string[];
  started_at: string;
  completed_at: string | null;
  last_accessed_at: string;
  certificate_issued: boolean;
  grade: string | null;
  full_name: string;
  avatar_url: string | null;
  email: string;
  last_login_at: string | null;
  course_name: string;
  course_cover: string | null;
  course_ref_id: string;
}

interface StudentProgressViewProps {
  workspaceId: string;
}

type FilterType = "all" | "active" | "at_risk" | "completed";

export default function StudentProgressView({ workspaceId }: StudentProgressViewProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    fetch(`/api/workspace/${workspaceId}/students`)
      .then((r) => r.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const filtered = useMemo(() => {
    let list = students;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
    }
    switch (filter) {
      case "active":
        return list.filter((s) => s.enrollment_status === "active" && s.progress < 100);
      case "at_risk": {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return list.filter((s) => s.enrollment_status === "active" && s.progress < 100 && new Date(s.last_accessed_at).getTime() < sevenDaysAgo);
      }
      case "completed":
        return list.filter((s) => s.enrollment_status === "completed" || s.progress >= 100);
      default:
        return list;
    }
  }, [students, filter, search]);

  const counts = useMemo(() => {
    const active = students.filter((s) => s.enrollment_status === "active" && s.progress < 100).length;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const atRisk = students.filter((s) => s.enrollment_status === "active" && s.progress < 100 && new Date(s.last_accessed_at).getTime() < sevenDaysAgo).length;
    const completed = students.filter((s) => s.enrollment_status === "completed" || s.progress >= 100).length;
    return { all: students.length, active, atRisk, completed };
  }, [students]);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getLastLesson = (s: StudentData) => {
    const lessons = s.completed_lessons;
    return lessons && lessons.length > 0 ? `${lessons.length} completed` : "Not started";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Students</h1>
        <p className="text-sm text-gray-500 mt-1">Track student progress across all courses</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {([
          { key: "all", label: "All Students", icon: Users, count: counts.all, color: "text-gray-600 bg-gray-100" },
          { key: "active", label: "Active", icon: UserCheck, count: counts.active, color: "text-emerald-600 bg-emerald-100" },
          { key: "at_risk", label: "At Risk", icon: AlertTriangle, count: counts.atRisk, color: "text-amber-600 bg-amber-100" },
          { key: "completed", label: "Completed", icon: Award, count: counts.completed, color: "text-indigo-600 bg-indigo-100" },
        ] as const).map((stat) => (
          <div
            key={stat.key}
            onClick={() => setFilter(stat.key as FilterType)}
            className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${
              filter === stat.key ? "border-indigo-300 ring-2 ring-indigo-100" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.color}`}>{stat.count}</span>
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
          />
        </div>
        <span className="text-xs text-gray-400">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Student</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Last Login</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Progress</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Last Lesson</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Course</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Grade</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Certificate</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Completed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No students found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.enrollment_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold text-gray-500">{(s.full_name || "?").charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.full_name || "Unknown"}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{formatDate(s.last_login_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              s.progress >= 100 ? "bg-emerald-500" : s.progress > 0 ? "bg-indigo-500" : "bg-gray-200"
                            }`}
                            style={{ width: `${Math.min(s.progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(s.progress)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600">{getLastLesson(s)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{s.course_name || "Unknown"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {s.grade ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                          <Star className="w-3 h-3" />
                          {s.grade}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.certificate_issued ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                          <FileText className="w-3 h-3" />
                          Issued
                        </span>
                      ) : s.enrollment_status === "completed" || s.progress >= 100 ? (
                        <span className="text-sm text-amber-600">Pending</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {s.enrollment_status === "completed" || s.progress >= 100 ? formatDate(s.completed_at) : "—"}
                      </span>
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
