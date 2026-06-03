import React from "react";
import { ArrowLeft, Save, Eye, Copy, Globe, FileText, Check, Clock } from "lucide-react";
import { CourseDraft } from "./CourseTypes";

interface CourseHeaderProps {
  course: CourseDraft;
  onBack: () => void;
  onSave: () => void;
  onPublishToggle: () => void;
  onClone: () => void;
  onPreview: () => void;
  isSaving: boolean;
}

export default function CourseHeader({
  course, onBack, onSave, onPublishToggle, onClone, onPreview, isSaving,
}: CourseHeaderProps) {
  const isPublished = course.status === "published";

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to courses"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{course.name || "Untitled Course"}</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}>
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onClone}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title="Clone course"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clone</span>
        </button>
        <button
          onClick={onPublishToggle}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            isPublished
              ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
          }`}
        >
          {isPublished ? <Clock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
          {isPublished ? "Unpublish" : "Publish"}
        </button>
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>
        <div className="h-5 w-px bg-gray-200 mx-1" />
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 text-xs font-medium bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </header>
  );
}
