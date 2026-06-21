import React, { useState, useEffect } from "react";
import { BookOpen, Users, Clock, Search, Filter } from "lucide-react";

interface CoursesListViewProps {
  workspaceId: string;
}

export default function CoursesListView({ workspaceId }: CoursesListViewProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    fetch(`/api/courses?communityId=${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.courses) setCourses(data.courses);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const filtered = courses.filter((c: any) =>
    !search || (c.name || c.title || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Courses</h1>
        <p className="text-sm text-gray-500 mt-1">All courses in this workspace</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No courses found</p>
          </div>
        ) : (
          filtered.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {c.coverUrl ? (
                    <img src={c.coverUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-indigo-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.name || c.title || "Untitled"}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description || "No description"}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {c.module_count || 0} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {c.enrolled_count || 0} students
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  c.status === "published" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                }`}>
                  {(c.status || "draft").charAt(0).toUpperCase() + (c.status || "draft").slice(1)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
