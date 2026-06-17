import React, { useState } from "react";
import { Plus, GripVertical, ChevronDown, ChevronRight, FileText, Video, FileQuestion, Download, ClipboardList, MoreHorizontal, Edit2, Trash2, Copy, PenSquare, Check, X } from "lucide-react";
import { CourseDraftModule, CourseDraftLesson } from "./CourseTypes";

interface CourseStructureTreeProps {
  modules: CourseDraftModule[];
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  onSelectModule: (id: string) => void;
  onSelectLesson: (id: string) => void;
  onAddModule: () => void;
  onAddLesson: (moduleId: string) => void;
  onDeleteModule: (id: string) => void;
  onDeleteLesson: (id: string) => void;
  onMoveModule: (id: string, direction: "up" | "down") => void;
  onMoveLesson: (moduleId: string, lessonId: string, direction: "up" | "down") => void;
  onRenameModule: (id: string, title: string) => void;
  onRenameLesson: (id: string, title: string) => void;
}

const contentTypeIcons: Record<string, React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: FileQuestion,
  assignment: ClipboardList,
  download: Download,
};

const contentTypeColors: Record<string, string> = {
  video: "text-purple-600 bg-purple-50",
  text: "text-blue-600 bg-blue-50",
  quiz: "text-amber-600 bg-amber-50",
  assignment: "text-emerald-600 bg-emerald-50",
  download: "text-rose-600 bg-rose-50",
};

export default function CourseStructureTree({
  modules, selectedModuleId, selectedLessonId, onSelectModule, onSelectLesson,
  onAddModule, onAddLesson, onDeleteModule, onDeleteLesson,
  onRenameModule, onRenameLesson,
}: CourseStructureTreeProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(modules.map((m) => m.id));
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  const startEditModule = (m: CourseDraftModule) => {
    setEditingModuleId(m.id);
    setEditValue(m.title);
  };

  const startEditLesson = (l: CourseDraftLesson) => {
    setEditingLessonId(l.id);
    setEditValue(l.title);
  };

  const commitEdit = () => {
    if (editingModuleId && editValue.trim()) {
      onRenameModule(editingModuleId, editValue.trim());
    }
    if (editingLessonId && editValue.trim()) {
      onRenameLesson(editingLessonId, editValue.trim());
    }
    setEditingModuleId(null);
    setEditingLessonId(null);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Course Structure</h3>
        <button
          onClick={onAddModule}
          className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Module
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {modules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400 mb-3">No modules yet</p>
            <button onClick={onAddModule} className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
              + Add First Module
            </button>
          </div>
        ) : (
          modules.map((mod, mi) => {
            const isExpanded = expandedModules.includes(mod.id);
            const isSelected = selectedModuleId === mod.id;
            const modLessonCount = mod.lessons.length;
            const modPublishedCount = mod.lessons.filter((l) => l.status === "published").length;

            return (
              <div key={mod.id} className="select-none">
                {/* Module row */}
                <div
                  className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                  onClick={() => { onSelectModule(mod.id); toggleModule(mod.id); }}
                >
                  <button className="p-0.5 text-gray-400 hover:text-gray-600 shrink-0">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {editingModuleId === mod.id ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") { setEditingModuleId(null); } }}
                        className="text-xs font-medium text-gray-900 bg-white border border-gray-300 rounded px-1 py-0.5 w-full outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="text-xs font-medium text-gray-900 truncate">{mod.title}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">{modLessonCount}</span>
                    {modPublishedCount > 0 && modPublishedCount === modLessonCount && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  {/* Module context menu */}
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === `m-${mod.id}` ? null : `m-${mod.id}`); }}
                      className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {openMenuId === `m-${mod.id}` && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-1">
                          <button onClick={(e) => { e.stopPropagation(); startEditModule(mod); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"><Edit2 className="w-3.5 h-3.5" />Rename</button>
                          <button onClick={(e) => { e.stopPropagation(); onAddLesson(mod.id); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"><Plus className="w-3.5 h-3.5" />Add Lesson</button>
                          <div className="border-t border-gray-100 my-0.5" />
                          <button onClick={(e) => { e.stopPropagation(); onDeleteModule(mod.id); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Lessons */}
                {isExpanded && (
                  <div className="ml-4 space-y-0.5 mt-0.5">
                    {mod.lessons.map((lesson, li) => {
                      const Icon = contentTypeIcons[lesson.contentType] || FileText;
                      const colorClass = contentTypeColors[lesson.contentType] || "text-gray-600 bg-gray-50";
                      const isLessonSelected = selectedLessonId === lesson.id;

                      return (
                        <div
                          key={lesson.id}
                          className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                            isLessonSelected ? "bg-gray-100 ring-1 ring-gray-200" : "hover:bg-gray-50"
                          }`}
                          onClick={() => onSelectLesson(lesson.id)}
                        >
                          <GripVertical className="w-3 h-3 text-gray-200 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingLessonId === lesson.id ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") { setEditingLessonId(null); } }}
                                className="text-xs text-gray-700 bg-white border border-gray-300 rounded px-1 py-0.5 w-full outline-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div className="text-xs text-gray-700 truncate">{lesson.title}</div>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{lesson.durationMinutes}m</span>

                          {/* Lesson context menu */}
                          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === `l-${lesson.id}` ? null : `l-${lesson.id}`); }}
                              className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </button>
                            {openMenuId === `l-${lesson.id}` && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-1">
                                  <button onClick={(e) => { e.stopPropagation(); startEditLesson(lesson); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"><Edit2 className="w-3.5 h-3.5" />Rename</button>
                                  <div className="border-t border-gray-100 my-0.5" />
                                  <button onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson.id); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom info bar */}
      <div className="px-4 py-2 border-t border-gray-100 shrink-0 flex items-center justify-between text-[10px] text-gray-400">
        <span>{modules.length} modules</span>
        <span>{modules.reduce((a, m) => a + m.lessons.length, 0)} lessons</span>
      </div>
    </div>
  );
}
