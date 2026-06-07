import React from "react";
import { ArrowLeft, Eye, Send, MoreHorizontal, BookOpen, Clock, CheckCircle, Save, Globe, Lock } from "lucide-react";
import { CourseDraft } from "./CourseTypes";

interface CourseHeaderProps {
  draft: CourseDraft;
  onUpdate: (updated: CourseDraft) => void;
  onBack: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onSave: () => void;
}

export default function CourseHeader({ draft, onUpdate, onBack, onPreview, onPublish, onSave }: CourseHeaderProps) {
  const totalLessons = draft.modules.reduce((a, m) => a + m.lessons.length, 0);
  const publishedLessons = draft.modules.reduce((a, m) => a + m.lessons.filter((l) => l.status === "published").length, 0);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft.name}
                onChange={(e) => onUpdate({ ...draft, name: e.target.value })}
                className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0 m-0 max-w-[300px]"
                placeholder="Course Name"
              />
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                draft.status === "published" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" :
                draft.status === "archived" ? "text-gray-500 bg-gray-100 border border-gray-200" :
                "text-amber-700 bg-amber-50 border border-amber-200"
              }`}>
                {draft.status === "published" ? <Globe className="w-3 h-3" /> :
                 draft.status === "archived" ? <Lock className="w-3 h-3" /> :
                 <Clock className="w-3 h-3" />}
                {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="font-medium">{draft.modules.length}</span> mod
          <span className="text-gray-300">·</span>
          <span className="font-medium">{totalLessons}</span> les
          {publishedLessons > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium text-emerald-600">{publishedLessons}</span> pub
            </>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <button
          onClick={onSave}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>

        {/* Publish / Unpublish */}
        {draft.status !== "published" ? (
          <button
            onClick={onPublish}
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 px-4 py-1.5 rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
          >
            <Send className="w-4 h-4" />
            Publish
          </button>
        ) : (
          <button
            onClick={() => onUpdate({ ...draft, status: "draft" })}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-600 bg-amber-50 px-4 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Unpublish
          </button>
        )}
      </div>
    </header>
  );
}
