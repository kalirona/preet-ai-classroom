import React, { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle,
  ChevronRight,
  Copy,
  Edit,
  Eye,
  FileText,
  GraduationCap,
  Layers,
  LayoutGrid,
  ListChecks,
  MoreHorizontal,
  PlayCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { CourseDraft } from "./CourseTypes";
import { courseTemplates } from "./CourseTemplates";
import CourseCreationWizard from "./CourseCreationWizard";
import CourseBuilderStudio from "./CourseBuilderStudio";
import ResourceLibrary from "./ResourceLibrary";

const templateIcons: Record<string, string> = {
  blank: "from-gray-400 to-gray-500",
  mini: "from-emerald-400 to-emerald-600",
  masterclass: "from-indigo-500 to-purple-600",
  workshop: "from-amber-500 to-orange-600",
  coaching: "from-rose-400 to-rose-600",
  membership: "from-cyan-400 to-cyan-600",
  challenge: "from-violet-400 to-violet-600",
};

interface CourseBuilderProps {
  communityId: string;
  initialCourses?: CourseDraft[];
  onCoursesChange?: (courses: CourseDraft[]) => void;
  currentUser?: any;
}

type DashboardTab = "all" | "published" | "draft" | "archived";
type BuilderView = "grid" | "pipeline";

const statusCopy: Record<CourseDraft["status"], { label: string; tone: string; dot: string }> = {
  published: {
    label: "Published",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  draft: {
    label: "Draft",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  archived: {
    label: "Archived",
    tone: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

export default function CourseBuilder({
  communityId,
  initialCourses = [],
  onCoursesChange,
  currentUser,
}: CourseBuilderProps) {
  const [courses, setCourses] = useState<CourseDraft[]>(initialCourses);
  const [activeDraft, setActiveDraft] = useState<CourseDraft | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("all");
  const [builderView, setBuilderView] = useState<BuilderView>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const courseMetrics = useMemo(() => {
    const lessonCount = courses.reduce(
      (total, course) => total + course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
      0
    );
    const moduleCount = courses.reduce((total, course) => total + course.modules.length, 0);
    const totalStudents = courses.reduce((total, course) => total + (course.enrolledCount || 0), 0);
    const revenue = courses.reduce((total, course) => total + (course.revenue || 0), 0);
    const published = courses.filter((course) => course.status === "published").length;
    const drafts = courses.filter((course) => course.status === "draft").length;
    const avgCompletion = courses.length
      ? Math.round(courses.reduce((total, course) => total + (course.completionRate || 0), 0) / courses.length)
      : 0;

    return {
      total: courses.length,
      published,
      drafts,
      moduleCount,
      lessonCount,
      totalStudents,
      revenue,
      avgCompletion,
    };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        if (activeTab === "published") return course.status === "published";
        if (activeTab === "draft") return course.status === "draft";
        if (activeTab === "archived") return course.status === "archived";
        return true;
      })
      .filter((course) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          course.name.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query)
        );
      });
  }, [activeTab, courses, searchQuery]);

  const pipelineColumns = useMemo(() => {
    return [
      {
        id: "draft" as const,
        title: "Build",
        description: "Outline, lessons, resources",
        courses: courses.filter((course) => course.status === "draft"),
      },
      {
        id: "published" as const,
        title: "Live Classroom",
        description: "Members can start learning",
        courses: courses.filter((course) => course.status === "published"),
      },
      {
        id: "archived" as const,
        title: "Archived",
        description: "Hidden from new students",
        courses: courses.filter((course) => course.status === "archived"),
      },
    ];
  }, [courses]);

  const handleCoursesUpdate = (updatedCourses: CourseDraft[]) => {
    setCourses(updatedCourses);
    onCoursesChange?.(updatedCourses);
  };

  const handleWizardComplete = async (draft: CourseDraft) => {
    const updated = [draft, ...courses];
    setCourses(updated);
    setActiveDraft(draft);
    setShowWizard(false);
    onCoursesChange?.(updated);
    try {
      await fetch(`/api/courses/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          coverUrl: draft.coverUrl,
          status: draft.status,
          price: draft.price,
          category: draft.category,
          modules: draft.modules.map((m, mi) => ({
            id: m.id,
            title: m.title,
            index: mi,
            lessons: m.lessons.map((l, li) => ({
              id: l.id,
              title: l.title,
              durationMinutes: l.durationMinutes,
              contentType: l.contentType,
              videoUrl: l.videoUrl || "",
              textContent: l.textContent || "",
              index: li,
              isLocked: l.isLocked,
              attachments: l.attachments || [],
              quizQuestions: l.quizQuestions || [],
              assignmentInstructions: l.assignmentInstructions || "",
            })),
          })),
        }),
      });
    } catch (err) {
      console.error("Failed to save course:", err);
    }
  };

  const handleDraftUpdate = async (updated: CourseDraft) => {
    const updatedCourses = courses.map((course) => (course.id === updated.id ? updated : course));
    setCourses(updatedCourses);
    setActiveDraft(updated);
    onCoursesChange?.(updatedCourses);
    try {
      await fetch(`/api/courses/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updated.name,
          description: updated.description,
          coverUrl: updated.coverUrl,
          status: updated.status,
          price: updated.price,
          category: updated.category,
          modules: updated.modules.map((m, mi) => ({
            id: m.id,
            title: m.title,
            index: mi,
            lessons: m.lessons.map((l, li) => ({
              id: l.id,
              title: l.title,
              durationMinutes: l.durationMinutes,
              contentType: l.contentType,
              videoUrl: l.videoUrl || "",
              textContent: l.textContent || "",
              index: li,
              isLocked: l.isLocked,
              attachments: l.attachments || [],
              quizQuestions: l.quizQuestions || [],
              assignmentInstructions: l.assignmentInstructions || "",
            })),
          })),
        }),
      });
    } catch (err) {
      console.error("Failed to save course:", err);
    }
  };

  const handleArchive = (id: string) => {
    handleCoursesUpdate(
      courses.map((course) =>
        course.id === id
          ? { ...course, status: "archived" as const, updatedAt: new Date().toISOString() }
          : course
      )
    );
  };

  const handleDuplicate = (course: CourseDraft) => {
    const clone: CourseDraft = {
      ...course,
      id: `course-${Date.now()}`,
      communityId,
      name: `${course.name} Copy`,
      status: "draft",
      enrolledCount: 0,
      revenue: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceCourseId: course.id,
    };
    handleCoursesUpdate([clone, ...courses]);
  };

  if (activeDraft) {
    return (
      <CourseBuilderStudio
        draft={activeDraft}
        onUpdate={handleDraftUpdate}
        onBack={() => setActiveDraft(null)}
        currentUser={currentUser}
      />
    );
  }

  const renderStatusBadge = (status: CourseDraft["status"]) => {
    const copy = statusCopy[status];
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${copy.tone}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${copy.dot}`} />
        {copy.label}
      </span>
    );
  };

  const renderCourseMenu = (course: CourseDraft) => (
    <div className="relative">
      <button
        type="button"
        aria-label="Course actions"
        onClick={(event) => {
          event.stopPropagation();
          setOpenMenuId(openMenuId === course.id ? null : course.id);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {openMenuId === course.id && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
          <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
            <button
              type="button"
              onClick={() => {
                setActiveDraft(course);
                setOpenMenuId(null);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Edit className="h-4 w-4" />
              Edit course
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(course.slug ? `/course/${course.slug}` : `/preview/course/${course.id}`, "_blank");
                setOpenMenuId(null);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => {
                handleDuplicate(course);
                setOpenMenuId(null);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>
            {course.status !== "archived" && (
              <button
                type="button"
                onClick={() => {
                  handleArchive(course.id);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Archive className="h-4 w-4" />
                Archive
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderCourseCard = (course: CourseDraft) => {
    const lessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
    const readyScore = Math.min(
      100,
      (course.name ? 20 : 0) +
        (course.description ? 20 : 0) +
        (course.coverUrl ? 15 : 0) +
        (course.modules.length > 0 ? 20 : 0) +
        (lessons > 0 ? 25 : 0)
    );

    return (
      <article
        key={course.id}
        className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
      >
        <div className="relative h-44 overflow-hidden bg-slate-100">
          {course.coverUrl ? (
            <img
              src={course.coverUrl}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#2563eb_55%,#10b981)]">
              <GraduationCap className="h-14 w-14 text-white/35" />
            </div>
          )}
          <div className="absolute left-3 top-3">{renderStatusBadge(course.status)}</div>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur">
            <BookOpen className="h-3.5 w-3.5" />
            {course.category || "General"}
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-950">
                {course.name || "Untitled Course"}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                {course.description || "Add a promise, outcome, and what students will build."}
              </p>
            </div>
            {renderCourseMenu(course)}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-3">
              <Layers className="mb-1 h-3.5 w-3.5 text-slate-500" />
              <span className="block font-semibold text-slate-950">{course.modules.length}</span>
              <span className="text-slate-500">Modules</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <PlayCircle className="mb-1 h-3.5 w-3.5 text-slate-500" />
              <span className="block font-semibold text-slate-950">{lessons}</span>
              <span className="text-slate-500">Lessons</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <Users className="mb-1 h-3.5 w-3.5 text-slate-500" />
              <span className="block font-semibold text-slate-950">{course.enrolledCount || 0}</span>
              <span className="text-slate-500">Students</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Launch readiness</span>
              <span className="font-semibold text-slate-900">{readyScore}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${readyScore}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setActiveDraft(course)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => window.open(course.slug ? `/course/${course.slug}` : `/preview/course/${course.id}`, "_blank")}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
            <div className="p-6 lg:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Classroom Studio
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Skool-style learning hub
                </span>
              </div>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">
                    Build courses your community can actually finish.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    Plan the classroom, publish modules, watch member progress, and keep every course tied to your community experience.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setBuilderView(builderView === "grid" ? "pipeline" : "grid")}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {builderView === "grid" ? <ListChecks className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                    {builderView === "grid" ? "Pipeline" : "Grid"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWizard(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    Create Course
                  </button>
                </div>
              </div>
            </div>

            <aside className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">This month</p>
                  <p className="mt-1 text-3xl font-bold">${courseMetrics.revenue.toLocaleString()}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xl font-semibold">{courseMetrics.totalStudents}</p>
                  <p className="text-xs text-slate-400">Students</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-xl font-semibold">{courseMetrics.avgCompletion}%</p>
                  <p className="text-xs text-slate-400">Avg complete</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-5 flex w-full items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Review analytics
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </aside>
          </div>
        </section>

        {/* Template quick-create grid */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Start with a template</h2>
              <p className="text-xs text-gray-500">Pre-built course structures to accelerate creation</p>
            </div>
            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              See all
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {courseTemplates.map((t) => {
              const gradient = templateIcons[t.id] || "from-indigo-500 to-purple-500";
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    // Quick-create: prepopulate wizard with this template
                    setShowWizard(true);
                  }}
                  className="flex flex-col items-center text-center shrink-0 w-32 p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-2 group-hover:scale-105 transition-transform`}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-900 mb-0.5">{t.name}</span>
                  <span className="text-[10px] text-gray-400">{t.moduleCount}m · {t.lessonCount}l</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Courses", value: courseMetrics.total, icon: BookOpen },
            { label: "Published", value: courseMetrics.published, icon: CheckCircle },
            { label: "Drafts", value: courseMetrics.drafts, icon: FileText },
            { label: "Lessons", value: courseMetrics.lessonCount, icon: PlayCircle },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-950">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-950">Launch checklist</h2>
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-3">
                {[
                  { label: "Course outline", done: courseMetrics.moduleCount > 0 },
                  { label: "Lesson content", done: courseMetrics.lessonCount > 0 },
                  { label: "Published offer", done: courseMetrics.published > 0 },
                  { label: "Student progress", done: courseMetrics.totalStudents > 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        item.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                    </span>
                    <span className={item.done ? "text-slate-800" : "text-slate-500"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-slate-950">Quick builder tools</h2>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Create drip schedule", icon: CalendarClock },
                  { label: "Resource Library", icon: FileText, action: () => setShowResources(true) },
                  { label: "Add certificate", icon: GraduationCap },
                  { label: "Configure access", icon: Settings },
                  { label: "Student leaderboard", icon: BarChart3 },
                ].map((tool: any) => (
                  <button
                    key={tool.label}
                    type="button"
                    onClick={tool.action}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <span className="flex items-center gap-2">
                      <tool.icon className="h-4 w-4" />
                      {tool.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {(["all", "published", "draft", "archived"] as DashboardTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                      activeTab === tab
                        ? "bg-slate-950 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    {tab === "all" ? "All courses" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search courses"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>

            {builderView === "pipeline" ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {pipelineColumns.map((column) => (
                  <section key={column.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h2 className="font-semibold text-slate-950">{column.title}</h2>
                        <p className="text-xs text-slate-500">{column.description}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {column.courses.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {column.courses.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
                          No courses here yet.
                        </div>
                      ) : (
                        column.courses.map((course) => {
                          const lessonCount = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
                          return (
                            <button
                              key={course.id}
                              type="button"
                              onClick={() => setActiveDraft(course)}
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300 hover:bg-white"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-950">{course.name}</p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {course.modules.length} modules / {lessonCount} lessons
                                  </p>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </section>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                  {searchQuery ? <Search className="h-8 w-8 text-slate-400" /> : <BookOpen className="h-8 w-8 text-slate-400" />}
                </div>
                <h3 className="text-lg font-semibold text-slate-950">
                  {searchQuery ? "No matching courses" : "Start your classroom"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {searchQuery
                    ? "Try another keyword or switch the course status filter."
                    : "Create your first course with modules, lessons, quizzes, assignments, and community prompts."}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={() => setShowWizard(true)}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    Create Course
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {filteredCourses.map(renderCourseCard)}
              </div>
            )}
          </main>
        </div>
      </div>

      {showWizard && (
        <CourseCreationWizard
          communityId={communityId}
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {showResources && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowResources(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Resource Library</h2>
              <button onClick={() => setShowResources(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ResourceLibrary />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
