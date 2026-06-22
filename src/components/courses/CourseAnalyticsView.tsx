import React, { useState, useEffect } from "react";
import { BarChart3, BookOpen, Users, Award, TrendingUp, Clock } from "lucide-react";

interface CourseAnalyticsViewProps {
  workspaceId: string;
}

export default function CourseAnalyticsView({ workspaceId }: CourseAnalyticsViewProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    fetch(`/api/courses?communityId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.courses) setCourses(data.courses);
      })
      .catch((err: unknown) => console.error("Failed to load course analytics:", err))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalStudents = courses.reduce((sum: number, c: any) => sum + (c.enrolled_count || 0), 0);
  const totalRevenue = courses.reduce((sum: number, c: any) => sum + (c.revenue || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Course Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Performance metrics for your courses</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Courses", value: courses.length, icon: BookOpen, color: "text-indigo-600 bg-indigo-100" },
          { label: "Total Students", value: totalStudents, icon: Users, color: "text-emerald-600 bg-emerald-100" },
          { label: "Completion Rate", value: courses.length > 0 ? `${Math.round(courses.reduce((s: number, c: any) => s + (c.completion_rate || 0), 0) / courses.length)}%` : "0%", icon: Award, color: "text-amber-600 bg-amber-100" },
          { label: "Avg Engagement", value: "—", icon: TrendingUp, color: "text-cyan-600 bg-cyan-100" },
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
          <h2 className="text-sm font-semibold text-gray-900">Course Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Course</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Students</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Completion</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No courses yet</p>
                  </td>
                </tr>
              ) : (
                courses.map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name || c.title || "Untitled"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.enrolled_count || 0}</td>
                    <td className="px-4 py-3">{c.completion_rate ? `${Math.round(c.completion_rate)}%` : "—"}</td>
                    <td className="px-4 py-3 text-gray-600">${(c.revenue || 0).toFixed(2)}</td>
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
