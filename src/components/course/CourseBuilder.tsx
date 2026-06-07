import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Grid, FileText, Settings, TrendingUp, Users, DollarSign, Layers, Search, MoreHorizontal, Edit, Eye, Copy, Archive, BarChart3, Play, Clock, CheckCircle, XCircle, Sparkles, GraduationCap, Trophy, Star, ArrowUpRight, ChevronDown } from "lucide-react";
import { CourseDraft } from "./CourseTypes";
import CourseCreationWizard from "./CourseCreationWizard";
import CourseEditor from "./CourseEditor";

interface CourseBuilderProps {
  communityId: string;
  initialCourses?: CourseDraft[];
  onCoursesChange?: (courses: CourseDraft[]) => void;
  currentUser?: any;
}

type DashboardTab = "all" | "published" | "draft" | "archived";

export default function CourseBuilder({ communityId, initialCourses = [], onCoursesChange, currentUser }: CourseBuilderProps) {
  const [courses, setCourses] = useState<CourseDraft[]>(initialCourses);
  const [activeDraft, setActiveDraft] = useState<CourseDraft | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (initialCourses.length > 0) setCourses(initialCourses);
  }, [initialCourses]);

  const filteredCourses = courses.filter((c) => {
    if (activeTab === "published") return c.status === "published";
    if (activeTab === "draft") return c.status === "draft";
    if (activeTab === "archived") return c.status === "archived";
    return true;
  }).filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === "published").length,
    drafts: courses.filter((c) => c.status === "draft").length,
    students: courses.reduce((a, c) => a + (c.enrolledCount || 0), 0),
    revenue: courses.reduce((a, c) => a + (c.revenue || 0), 0),
  };

  const handleWizardComplete = (draft: CourseDraft) => {
    const updated = [draft, ...courses];
    setCourses(updated);
    setActiveDraft(draft);
    setShowWizard(false);
    onCoursesChange?.(updated);
  };

  const handleDraftUpdate = (updated: CourseDraft) => {
    const c = courses.map((c) => (c.id === updated.id ? updated : c));
    setCourses(c);
    setActiveDraft(updated);
    onCoursesChange?.(c);
  };

  const handleDeleteCourse = (id: string) => {
    const c = courses.filter((c) => c.id !== id);
    setCourses(c);
    if (activeDraft?.id === id) setActiveDraft(null);
    onCoursesChange?.(c);
  };

  const handleArchive = (id: string) => {
    const c = courses.map((c) => c.id === id ? { ...c, status: "archived" as const, updatedAt: new Date().toISOString() } : c);
    setCourses(c);
    onCoursesChange?.(c);
  };

  const handleDuplicate = (course: CourseDraft) => {
    const clone: CourseDraft = {
      ...course,
      id: `course-${Date.now()}`,
      name: `${course.name} (Copy)`,
      status: "draft",
      enrolledCount: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceCourseId: course.id,
    };
    const c = [clone, ...courses];
    setCourses(c);
    onCoursesChange?.(c);
  };

  if (activeDraft) {
    return (
      <CourseEditor
        draft={activeDraft}
        onUpdate={handleDraftUpdate}
        onBack={() => setActiveDraft(null)}
        currentUser={currentUser}
      />
    );
  }

  const tabClasses = (tab: DashboardTab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      activeTab === tab ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  const statusBadge = (status: string) => {
    if (status === "published") return <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Published</span>;
    if (status === "archived") return <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" />Archived</span>;
    return <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />Draft</span>;
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Courses</h1>
            <p className="text-sm text-gray-500 mt-1">Create, manage, and publish your courses</p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 text-sm font-semibold bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Courses", value: stats.total, icon: Layers, color: "from-indigo-500 to-indigo-600" },
            { label: "Published", value: stats.published, icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
            { label: "Total Students", value: stats.students, icon: Users, color: "from-blue-500 to-blue-600" },
            { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "from-amber-500 to-amber-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search & Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {(["all", "published", "draft", "archived"] as DashboardTab[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={tabClasses(tab)}>
                {tab === "all" ? "All Courses" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 w-64"
            />
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {searchQuery ? "No courses found" : activeTab === "all" ? "No courses yet" : `No ${activeTab} courses`}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery ? "Try a different search term." : "Create your first course to get started."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowWizard(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Your First Course
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  {course.coverUrl ? (
                    <img src={course.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">{statusBadge(course.status)}</div>
                  {course.status === "published" && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      {course.enrolledCount || 0} enrolled
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{course.name || "Untitled Course"}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{course.description || "No description"}</p>
                    </div>
                    <div className="relative ml-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === course.id ? null : course.id); }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === course.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-1">
                            <button onClick={() => { setActiveDraft(course); setOpenMenuId(null); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Edit className="w-4 h-4" />Edit</button>
                            <button onClick={() => { window.open(`/preview/course/${course.id}`, '_blank'); setOpenMenuId(null); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="w-4 h-4" />Preview</button>
                            <button onClick={() => { handleDuplicate(course); setOpenMenuId(null); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Copy className="w-4 h-4" />Duplicate</button>
                            {course.status !== "archived" && (
                              <button onClick={() => { handleArchive(course.id); setOpenMenuId(null); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Archive className="w-4 h-4" />Archive</button>
                            )}
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={() => { setOpenMenuId(null); }} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><BarChart3 className="w-4 h-4" />Analytics</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{course.modules.length} {course.modules.length === 1 ? "module" : "modules"}</span>
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" />{course.modules.reduce((a, m) => a + m.lessons.length, 0)} lessons</span>
                    {course.instructorName && (
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" />{course.instructorName}</span>
                    )}
                  </div>

                  {/* Progress bar for published */}
                  {course.status === "published" && course.enrolledCount > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Completion</span>
                        <span className="font-semibold text-gray-700">{course.completionRate || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${course.completionRate || 0}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setActiveDraft(course)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-gray-900 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => window.open(`/preview/course/${course.id}`, '_blank')}
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showWizard && (
        <CourseCreationWizard
          communityId={communityId}
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}
