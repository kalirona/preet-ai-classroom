import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Plus, GripVertical, Trash2, Film, FileText, HelpCircle, PenTool, Lock, Unlock, ArrowUp, ArrowDown } from "lucide-react";
import { CourseStructureTreeProps, CourseDraftModule } from "./CourseTypes";

const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <Film className="w-3 h-3" />,
  text: <FileText className="w-3 h-3" />,
  quiz: <HelpCircle className="w-3 h-3" />,
  assignment: <PenTool className="w-3 h-3" />,
  download: <FileText className="w-3 h-3" />,
};

export default function CourseStructureTree({
  modules,
  selectedModuleId,
  selectedLessonId,
  onSelectModule,
  onSelectLesson,
  onAddModule,
  onAddLesson,
  onDeleteModule,
  onDeleteLesson,
  onMoveModule,
  onMoveLesson,
  onRenameModule,
  onRenameLesson,
}: CourseStructureTreeProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach((m) => { initial[m.id] = true; });
    return initial;
  });
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startRenameModule = (mod: CourseDraftModule) => {
    setEditingModuleId(mod.id);
    setEditModuleTitle(mod.title);
  };

  const submitRenameModule = () => {
    if (editingModuleId && editModuleTitle.trim()) {
      onRenameModule(editingModuleId, editModuleTitle.trim());
    }
    setEditingModuleId(null);
  };

  const startRenameLesson = (lessonId: string, title: string) => {
    setEditingLessonId(lessonId);
    setEditLessonTitle(title);
  };

  const submitRenameLesson = () => {
    if (editingLessonId && editLessonTitle.trim()) {
      onRenameLesson(editingLessonId, editLessonTitle.trim());
    }
    setEditingLessonId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Course Structure</h3>
        <span className="text-[11px] text-gray-400">{modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {modules.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No modules yet</p>
            <button onClick={onAddModule} className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              + Add your first module
            </button>
          </div>
        )}
        {modules.map((mod) => (
          <div key={mod.id}>
            <div
              className={`group flex items-center gap-1 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                selectedModuleId === mod.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <button onClick={() => toggleModule(mod.id)} className="p-0.5 hover:bg-gray-200 rounded">
                {expandedModules[mod.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[10px] font-medium text-gray-400 w-4">{mod.index + 1}</span>
              <div className="flex-1 min-w-0">
                {editingModuleId === mod.id ? (
                  <input
                    value={editModuleTitle}
                    onChange={(e) => setEditModuleTitle(e.target.value)}
                    onBlur={submitRenameModule}
                    onKeyDown={(e) => e.key === "Enter" && submitRenameModule()}
                    className="w-full text-xs font-medium bg-white border border-indigo-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-xs font-medium truncate block cursor-text"
                    onDoubleClick={() => startRenameModule(mod)}
                    title="Double-click to rename"
                  >
                    {mod.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onMoveModule(mod.id, "up")} className="p-0.5 hover:bg-gray-200 rounded" title="Move up">
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button onClick={() => onMoveModule(mod.id, "down")} className="p-0.5 hover:bg-gray-200 rounded" title="Move down">
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button onClick={() => onAddLesson(mod.id)} className="p-0.5 hover:bg-gray-200 rounded text-emerald-600" title="Add lesson">
                  <Plus className="w-3 h-3" />
                </button>
                <button onClick={() => onDeleteModule(mod.id)} className="p-0.5 hover:bg-red-100 rounded text-red-500" title="Delete module">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {expandedModules[mod.id] && (
              <div className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2">
                {mod.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      selectedLessonId === lesson.id
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "hover:bg-gray-50 text-gray-600 border border-transparent"
                    }`}
                  >
                    <span className="flex-shrink-0">{contentTypeIcons[lesson.contentType] || <FileText className="w-3 h-3" />}</span>
                    <div className="flex-1 min-w-0">
                      {editingLessonId === lesson.id ? (
                        <input
                          value={editLessonTitle}
                          onChange={(e) => setEditLessonTitle(e.target.value)}
                          onBlur={submitRenameLesson}
                          onKeyDown={(e) => e.key === "Enter" && submitRenameLesson()}
                          className="w-full text-[11px] bg-white border border-indigo-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="text-[11px] truncate block cursor-text"
                          onDoubleClick={() => startRenameLesson(lesson.id, lesson.title)}
                        >
                          {lesson.title}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{lesson.durationMinutes}m</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); onMoveLesson(mod.id, lesson.id, "up"); }} className="p-0.5 hover:bg-gray-200 rounded">
                        <ArrowUp className="w-2.5 h-2.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onMoveLesson(mod.id, lesson.id, "down"); }} className="p-0.5 hover:bg-gray-200 rounded">
                        <ArrowDown className="w-2.5 h-2.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson.id); }} className="p-0.5 hover:bg-red-100 rounded text-red-500">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={onAddModule}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Module
        </button>
      </div>
    </div>
  );
}
