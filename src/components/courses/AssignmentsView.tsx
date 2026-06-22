import React, { useState, useEffect } from "react";
import { ClipboardList, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface AssignmentsViewProps {
  workspaceId: string;
}

export default function AssignmentsView({ workspaceId }: AssignmentsViewProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    fetch(`/api/workspace/${workspaceId}/assignments`)
      .then((r) => r.json())
      .then((data) => {
        if (data.assignments) setAssignments(data.assignments);
      })
      .catch((err: unknown) => console.error("Failed to load assignments:", err))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    total: assignments.length,
    submitted: assignments.filter((a: any) => a.status === "submitted").length,
    graded: assignments.filter((a: any) => a.status === "graded").length,
    pending: assignments.filter((a: any) => a.status === "pending" || !a.status).length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
        <p className="text-sm text-gray-500 mt-1">Review and grade student submissions</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, icon: ClipboardList, color: "text-gray-600 bg-gray-100" },
          { label: "Submitted", value: stats.submitted, icon: CheckCircle, color: "text-emerald-600 bg-emerald-100" },
          { label: "Graded", value: stats.graded, icon: FileText, color: "text-indigo-600 bg-indigo-100" },
          { label: "Pending Review", value: stats.pending, icon: AlertCircle, color: "text-amber-600 bg-amber-100" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Student</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Course</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Submitted</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Grade</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No assignments yet</p>
                  </td>
                </tr>
              ) : (
                assignments.map((a: any, i: number) => (
                  <tr key={a.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.student_name || "Unknown"}</td>
                    <td className="px-4 py-3 text-gray-600">{a.course_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        a.status === "graded" ? "text-emerald-600 bg-emerald-50" :
                        a.status === "submitted" ? "text-amber-600 bg-amber-50" :
                        "text-gray-500 bg-gray-100"
                      }`}>
                        {a.status === "graded" ? <CheckCircle className="w-3 h-3" /> :
                         a.status === "submitted" ? <Clock className="w-3 h-3" /> :
                         <AlertCircle className="w-3 h-3" />}
                        {(a.status || "pending").charAt(0).toUpperCase() + (a.status || "pending").slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.grade || "—"}</td>
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
