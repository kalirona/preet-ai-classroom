import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Grid, FileText, Settings } from "lucide-react";
import { CourseDraft } from "./CourseTypes";
import CourseCreationWizard from "./CourseCreationWizard";
import CourseEditor from "./CourseEditor";

interface CourseBuilderProps {
  communityId: string;
  initialCourses?: CourseDraft[];
  onCoursesChange?: (courses: CourseDraft[]) => void;
}

export default function CourseBuilder({ communityId, initialCourses = [], onCoursesChange }: CourseBuilderProps) {
  const [courses, setCourses] = useState<CourseDraft[]>(initialCourses);
  const [activeDraft, setActiveDraft] = useState<CourseDraft | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (initialCourses.length > 0) {
      setCourses(initialCourses);
    }
  }, [initialCourses]);

  const handleWizardComplete = (draft: CourseDraft) => {
    const updated = [draft, ...courses];
    setCourses(updated);
    setActiveDraft(draft);
    setShowWizard(false);
    onCoursesChange?.(updated);
  };

  const handleDraftUpdate = (updated: CourseDraft) => {
    const updatedCourses = courses.map((c) => (c.id === updated.id ? updated : c));
    setCourses(updatedCourses);
    setActiveDraft(updated);
    onCoursesChange?.(updatedCourses);
  };

  const handleDeleteCourse = (id: string) => {
    const updated = courses.filter((c) => c.id !== id);
    setCourses(updated);
    if (activeDraft?.id === id) setActiveDraft(null);
    onCoursesChange?.(updated);
  };

  // If editing a specific draft, show the editor
  if (activeDraft) {
    return (
      <CourseEditor
        draft={activeDraft}
        onUpdate={handleDraftUpdate}
        onBack={() => setActiveDraft(null)}
      />
    );
  }

  // Course list view
  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Course Builder</h1>
            <p className="text-sm text-gray-500">Create and manage your courses</p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </div>
      </div>

      {/* Course grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No courses yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              Create your first course using our guided wizard or start from a template.
            </p>
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 text-sm font-medium bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setActiveDraft(course)}
              >
                {course.coverUrl ? (
                  <div className="h-32 bg-gray-100 overflow-hidden">
                    <img src={course.coverUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-white/60" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{course.name || "Untitled Course"}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      course.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {course.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description || "No description"}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{course.modules.length} {course.modules.length === 1 ? "module" : "modules"}</span>
                    <span>{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creation Wizard */}
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
