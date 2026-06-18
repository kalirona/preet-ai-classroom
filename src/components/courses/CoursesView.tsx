import React, { useState, useMemo } from "react";
import {
  BookOpen, Plus, Search, MoreHorizontal, Eye, Edit, Copy, Archive,
  CheckCircle, Clock, FileText, TrendingUp, Users, DollarSign,
  Layers, GraduationCap, X, BarChart3
} from "lucide-react";
import { Course } from "../../types";

interface CoursesViewProps {
  communityId: string;
  currentUser: any;
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onRefreshCourses: () => void;
  onEditCourse?: (courseId: string) => void;
}

type FilterType = "all" | "published" | "draft" | "scheduled" | "archived";

interface CourseCardData {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  students: number;
  revenue: number;
  completionRate: number;
  status: string;
  lastUpdated: string;
  modulesCount: number;
  lessonsCount: number;
  scheduledDate?: string;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  published: { label: "Published", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  draft: { label: "Draft", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
};

export default function CoursesView({
  communityId, currentUser, courses, onAddCourse, onRefreshCourses, onEditCourse
}: CoursesViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const courseCards: CourseCardData[] = useMemo(() =>
    courses.map(c => ({
      id: c.id,
      name: c.name || "Untitled",
      description: c.description || "",
      coverUrl: c.coverUrl || "",
      students: c.enrolledCount || 0,
      revenue: c.revenue || 0,
      completionRate: c.completionRate || 0,
      status: (c as any).scheduledAt ? "scheduled" : (c.status || "draft"),
      lastUpdated: c.updatedAt || c.createdAt || new Date().toISOString(),
      modulesCount: c.modules?.length || 0,
      lessonsCount: c.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0,
      scheduledDate: (c as any).scheduledAt,
    })),
  [courses]);

  const filters: { id: FilterType; label: string; count: number }[] = [
    { id: "all", label: "All", count: courseCards.length },
    { id: "published", label: "Published", count: courseCards.filter(c => c.status === "published").length },
    { id: "draft", label: "Draft", count: courseCards.filter(c => c.status === "draft").length },
    { id: "scheduled", label: "Scheduled", count: courseCards.filter(c => c.status === "scheduled").length },
    { id: "archived", label: "Archived", count: courseCards.filter(c => c.status === "archived").length },
  ];

  const filteredCards = useMemo(() => {
    return courseCards
      .filter(c => activeFilter === "all" || c.status === activeFilter)
      .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [courseCards, activeFilter, searchQuery]);

  const totalStudents = courseCards.reduce((a, c) => a + c.students, 0);
  const totalRevenue = courseCards.reduce((a, c) => a + c.revenue, 0);
  const avgCompletion = courseCards.length ? Math.round(courseCards.reduce((a, c) => a + c.completionRate, 0) / courseCards.length) : 0;

  const handlePublishToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const course = courses.find(c => c.id === id);
    if (course) onAddCourse({ ...course, status: newStatus, updatedAt: new Date().toISOString() });
  };

  const handleArchive = (id: string) => {
    const course = courses.find(c => c.id === id);
    if (course) onAddCourse({ ...course, status: "archived", updatedAt: new Date().toISOString() });
  };

  const handleDuplicate = (card: CourseCardData) => {
    const course = courses.find(c => c.id === card.id);
    if (!course) return;
    const clone: Course = {
      ...course,
      id: `course-${Date.now()}`,
      name: `${course.name} Copy`,
      status: "draft",
      enrolledCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAddCourse(clone);
  };

  const handleCreateCourse = () => {
    // Generate a blank draft course and open it
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      communityId,
      name: "New Course",
      description: "",
      coverUrl: "",
      isPremiumOnly: false,
      modulesCount: 1,
      enrolledCount: 0,
      modules: [{
        id: `mod-init-${Date.now()}`,
        courseId: `course-${Date.now()}`,
        title: "Module 1: Getting Started",
        index: 0,
        lessons: [{
          id: `lesson-init-${Date.now()}`,
          moduleId: `mod-init-${Date.now()}`,
          title: "Welcome",
          durationMinutes: 5,
          videoUrl: "",
          textContent: "Welcome to the course!",
          index: 0,
          isLocked: false,
          contentType: "text",
        }],
      }],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAddCourse(newCourse);
    if (onEditCourse) onEditCourse(newCourse.id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Courses</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your course catalog</p>
          </div>
          <button onClick={handleCreateCourse}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition">
            <Plus className="w-4 h-4" /> Create Course
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Total Courses</p>
            <p className="text-lg font-bold text-gray-900">{courseCards.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Students</p>
            <p className="text-lg font-bold text-gray-900">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Revenue</p>
            <p className="text-lg font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Avg Completion</p>
            <p className="text-lg font-bold text-gray-900">{avgCompletion}%</p>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {filters.map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  activeFilter === f.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
                {f.label}
                <span className="ml-1.5 text-xs text-gray-400">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900/10" />
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredCards.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-gray-700">No courses found</h4>
            <p className="text-sm text-gray-400 mt-1">
              {activeFilter === "all" ? "Create your first course to get started." : `No courses with status "${activeFilter}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCards.map(card => {
              const status = statusConfig[card.status] || statusConfig.draft;
              const daysSinceUpdate = Math.floor((Date.now() - new Date(card.lastUpdated).getTime()) / 86400000);

              return (
                <div key={card.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all group">
                  {/* Thumbnail */}
                  <div className="h-36 bg-gray-100 relative overflow-hidden">
                    {card.coverUrl ? (
                      <img src={card.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${status.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>

                    {/* Actions menu */}
                    <div className="absolute top-3 right-3">
                      <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === card.id ? null : card.id); }}
                          className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4 text-gray-600" />
                        </button>
                        {openMenuId === card.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-1">
                              <button onClick={() => { onEditCourse?.(card.id); setOpenMenuId(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Edit className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={() => { window.open(`/preview/course/${card.id}`, "_blank"); setOpenMenuId(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Eye className="w-4 h-4" /> Preview
                              </button>
                              <button onClick={() => { handleDuplicate(card); setOpenMenuId(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Copy className="w-4 h-4" /> Duplicate
                              </button>
                              <div className="border-t border-gray-100 my-1" />
                              <button onClick={() => { handlePublishToggle(card.id, card.status); setOpenMenuId(null); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <CheckCircle className="w-4 h-4" /> {card.status === "published" ? "Unpublish" : "Publish"}
                              </button>
                              {card.status !== "archived" && (
                                <button onClick={() => { handleArchive(card.id); setOpenMenuId(null); }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                  <Archive className="w-4 h-4" /> Archive
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{card.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{card.description}</p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <Users className="w-3.5 h-3.5 text-gray-400 mx-auto mb-0.5" />
                        <span className="font-medium text-gray-700">{card.students}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400 mx-auto mb-0.5" />
                        <span className="font-medium text-gray-700">${card.revenue}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <TrendingUp className="w-3.5 h-3.5 text-gray-400 mx-auto mb-0.5" />
                        <span className="font-medium text-gray-700">{card.completionRate}%</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {card.modulesCount} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {daysSinceUpdate === 0 ? "Today" : `${daysSinceUpdate}d ago`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
