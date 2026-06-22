import { X, Clock, BookOpen, Lock, ChevronRight } from "lucide-react";
import type { CourseDraft } from "./CourseTypes";

interface CoursePreviewModalProps {
  course: CourseDraft;
  onClose: () => void;
}

export default function CoursePreviewModal({ course, onClose }: CoursePreviewModalProps) {
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((s, l) => s + l.durationMinutes, 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">{course.name}</h2>
            <p className="text-xs text-gray-500">Preview mode &mdash; this is how students will see your course</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              course.status === "published"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {course.status === "published" ? "Published" : "Draft Preview"}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {course.coverUrl && (
            <img src={course.coverUrl} alt="" className="w-full h-48 object-cover rounded-xl" />
          )}

          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {course.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{course.modules.length} modules</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{totalLessons} lessons &middot; ~{Math.ceil(totalDuration / 60)}h total</span>
            </div>
            {course.price > 0 && (
              <span className="font-medium text-gray-900">${course.price}</span>
            )}
            {course.isFree && (
              <span className="font-medium text-emerald-600">Free</span>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Curriculum</h3>
            <div className="space-y-2">
              {course.modules.map((mod, mi) => (
                <details key={mod.id} className="group" open={mi === 0}>
                  <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                      <span className="font-medium text-sm text-gray-900">{mod.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">{mod.lessons.length} lessons</span>
                  </summary>
                  <div className="ml-4 mt-1 space-y-1">
                    {mod.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2.5">
                          {lesson.isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-gray-300" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                          )}
                          <span className="text-sm text-gray-700">{lesson.title}</span>
                        </div>
                        <span className="text-xs text-gray-400">{lesson.durationMinutes} min</span>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Editor
          </button>
          {course.status !== "published" && (
            <span className="text-xs text-gray-400">Publish to make this course visible to students</span>
          )}
        </div>
      </div>
    </div>
  );
}
