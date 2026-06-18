import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Plus, GripVertical, Trash2, ChevronDown, ChevronRight, FileText, Video, FileQuestion,
  Download, ClipboardList, MoreHorizontal, Edit2, Copy, Check, X, PanelLeft, PanelRight,
  BookOpen, Layers, Sparkles, Clock, Lock, Eye, Settings, PlayCircle, ArrowLeft,
  Upload, Globe, Search, Grid3X3, List, Undo2, Redo2, Maximize2, Minimize2,
  AlignLeft, Bold, Italic, Link, Hash, Type, Image, Square, Heading1, Heading2,
  MessageSquare, CheckSquare, ExternalLink, MousePointerClick, Quote, Minus, Code,
  Headphones, BarChart3, Lightbulb, Bot, PenSquare, Users, Calendar
} from "lucide-react";
import { CourseDraft, CourseDraftLesson, ContentBlock, BlockType, CourseDraftModule } from "./CourseTypes";
import CourseHeader from "./CourseHeader";
import ContentEditor from "./ContentEditor";
import BlockSettings from "./BlockSettings";

interface CourseBuilderStudioProps {
  draft: CourseDraft;
  onUpdate: (draft: CourseDraft) => void;
  onBack: () => void;
  currentUser?: any;
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

export default function CourseBuilderStudio({ draft, onUpdate, onBack, currentUser }: CourseBuilderStudioProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    draft.modules.length > 0 ? draft.modules[0].id : null
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    draft.modules.length > 0 && draft.modules[0].lessons.length > 0 ? draft.modules[0].lessons[0].id : null
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>(draft.modules.map((m) => m.id));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [openContextMenu, setOpenContextMenu] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<{ type: "module" | "lesson"; id: string } | null>(null);

  const dragNode = useRef<HTMLElement | null>(null);

  const selectedLesson = selectedLessonId
    ? draft.modules.flatMap((m) => m.lessons).find((l) => l.id === selectedLessonId) || null
    : null;

  const selectedBlock = selectedBlockId && selectedLesson
    ? selectedLesson.blocks.find((b) => b.id === selectedBlockId) || null
    : null;

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  // --- Module operations ---
  const addModule = useCallback(() => {
    const newMod: CourseDraftModule = {
      id: `mod-${Date.now()}`,
      title: `Module ${draft.modules.length + 1}`,
      index: draft.modules.length,
      lessons: [],
    };
    onUpdate({ ...draft, modules: [...draft.modules, newMod] });
    setSelectedModuleId(newMod.id);
    setExpandedModules((prev) => [...prev, newMod.id]);
  }, [draft, onUpdate]);

  const deleteModule = useCallback((id: string) => {
    if (draft.modules.length <= 1) return;
    const filtered = draft.modules.filter((m) => m.id !== id);
    onUpdate({ ...draft, modules: filtered });
    if (selectedModuleId === id) {
      const next = filtered[0]?.id || null;
      setSelectedModuleId(next);
      setSelectedLessonId(next ? (filtered.find((m) => m.id === next)?.lessons[0]?.id || null) : null);
    }
  }, [draft, onUpdate, selectedModuleId]);

  const renameModule = useCallback((id: string, title: string) => {
    onUpdate({ ...draft, modules: draft.modules.map((m) => m.id === id ? { ...m, title } : m) });
  }, [draft, onUpdate]);

  // --- Lesson operations ---
  const addLesson = useCallback((moduleId: string) => {
    const targetModule = draft.modules.find((m) => m.id === moduleId);
    const newLesson: CourseDraftLesson = {
      id: `lesson-${Date.now()}`,
      title: `Lesson ${(targetModule?.lessons.length || 0) + 1}`,
      durationMinutes: 10,
      contentType: "text",
      blocks: [{ id: `block-${Date.now()}`, type: "paragraph", content: "Start writing..." }],
      isLocked: false,
      status: "draft",
    };
    onUpdate({
      ...draft,
      modules: draft.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
      ),
    });
    setSelectedLessonId(newLesson.id);
    setSelectedBlockId(newLesson.blocks[0]?.id || null);
  }, [draft, onUpdate]);

  const deleteLesson = useCallback((id: string) => {
    const mod = draft.modules.find((m) => m.lessons.some((l) => l.id === id));
    if (!mod || mod.lessons.length <= 1) return;
    onUpdate({
      ...draft,
      modules: draft.modules.map((m) =>
        m.id === mod.id ? { ...m, lessons: m.lessons.filter((l) => l.id !== id) } : m
      ),
    });
    if (selectedLessonId === id) {
      const remaining = mod.lessons.filter((l) => l.id !== id);
      setSelectedLessonId(remaining[0]?.id || null);
    }
  }, [draft, onUpdate, selectedLessonId]);

  const renameLesson = useCallback((id: string, title: string) => {
    onUpdate({
      ...draft,
      modules: draft.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => l.id === id ? { ...l, title } : l),
      })),
    });
  }, [draft, onUpdate]);

  // --- Move operations (drag-and-drop) ---
  const moveModule = useCallback((fromIndex: number, toIndex: number) => {
    const updated = [...draft.modules];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onUpdate({ ...draft, modules: updated.map((m, i) => ({ ...m, index: i })) });
  }, [draft, onUpdate]);

  const moveLesson = useCallback((moduleId: string, fromIndex: number, toIndex: number) => {
    onUpdate({
      ...draft,
      modules: draft.modules.map((m) => {
        if (m.id !== moduleId) return m;
        const updated = [...m.lessons];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return { ...m, lessons: updated };
      }),
    });
  }, [draft, onUpdate]);

  const moveLessonBetweenModules = useCallback((fromModuleId: string, lessonId: string, toModuleId: string) => {
    const fromMod = draft.modules.find((m) => m.id === fromModuleId);
    const lesson = fromMod?.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    onUpdate({
      ...draft,
      modules: draft.modules.map((m) => {
        if (m.id === fromModuleId) return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
        if (m.id === toModuleId) return { ...m, lessons: [...m.lessons, lesson] };
        return m;
      }),
    });
  }, [draft, onUpdate]);

  // Drag-and-drop handlers
  const handleDragStart = (type: "module" | "lesson", id: string) => (e: React.DragEvent) => {
    setDragItem({ type, id });
    e.dataTransfer.effectAllowed = "move";
    dragNode.current = e.target as HTMLElement;
  };

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (targetType: "module" | "lesson", targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragItem || dragItem.id === targetId) {
      setDragOverId(null);
      setDragItem(null);
      return;
    }

    const allModules = draft.modules;
    if (dragItem.type === "module" && targetType === "module") {
      const fromIdx = allModules.findIndex((m) => m.id === dragItem.id);
      const toIdx = allModules.findIndex((m) => m.id === targetId);
      if (fromIdx !== -1 && toIdx !== -1) moveModule(fromIdx, toIdx);
    } else if (dragItem.type === "lesson" && targetType === "module") {
      const fromMod = allModules.find((m) => m.lessons.some((l) => l.id === dragItem.id));
      if (fromMod) moveLessonBetweenModules(fromMod.id, dragItem.id, targetId);
    } else if (dragItem.type === "lesson" && targetType === "lesson") {
      const fromMod = allModules.find((m) => m.lessons.some((l) => l.id === dragItem.id));
      const toMod = allModules.find((m) => m.lessons.some((l) => l.id === targetId));
      if (fromMod && toMod && fromMod.id === toMod.id) {
        const fromIdx = fromMod.lessons.findIndex((l) => l.id === dragItem.id);
        const toIdx = fromMod.lessons.findIndex((l) => l.id === targetId);
        if (fromIdx !== -1 && toIdx !== -1) moveLesson(fromMod.id, fromIdx, toIdx);
      } else if (fromMod && toMod) {
        moveLessonBetweenModules(fromMod.id, dragItem.id, toMod.id);
      }
    }

    setDragOverId(null);
    setDragItem(null);
  };

  // --- Block operations ---
  const updateBlocks = useCallback((blocks: ContentBlock[]) => {
    if (!selectedLessonId) return;
    onUpdate({
      ...draft,
      modules: draft.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => l.id === selectedLessonId ? { ...l, blocks } : l),
      })),
    });
  }, [draft, onUpdate, selectedLessonId]);

  const updateLesson = useCallback((lessonId: string, updates: Partial<CourseDraftLesson>) => {
    onUpdate({
      ...draft,
      modules: draft.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, ...updates } : l),
      })),
    });
  }, [draft, onUpdate]);

  const handlePublish = useCallback(() => {
    const updated = {
      ...draft,
      status: "published" as const,
      updatedAt: new Date().toISOString(),
      modules: draft.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => ({ ...l, status: "published" as const })),
      })),
    };
    onUpdate(updated);
  }, [draft, onUpdate]);

  const handleSave = useCallback(() => {
    onUpdate({ ...draft, updatedAt: new Date().toISOString() });
  }, [draft, onUpdate]);

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const commitEdit = () => {
    if (!editingId || !editValue.trim()) {
      setEditingId(null);
      return;
    }
    // Check if it's a module or lesson
    const isMod = draft.modules.some((m) => m.id === editingId);
    if (isMod) renameModule(editingId, editValue.trim());
    else renameLesson(editingId, editValue.trim());
    setEditingId(null);
  };

  const getTreeStats = () => {
    const lessonCount = draft.modules.reduce((a, m) => a + m.lessons.length, 0);
    const publishedCount = draft.modules.reduce((a, m) => a + m.lessons.filter((l) => l.status === "published").length, 0);
    return { moduleCount: draft.modules.length, lessonCount, publishedCount };
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Premium header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={draft.name}
              onChange={(e) => onUpdate({ ...draft, name: e.target.value })}
              className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none p-0 placeholder:text-gray-300"
              placeholder="Course name"
            />
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
            draft.status === "published" ? "bg-emerald-50 text-emerald-700" :
            draft.status === "draft" ? "bg-amber-50 text-amber-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {draft.status === "published" ? "Published" : draft.status === "draft" ? "Draft" : "Archived"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className={`p-2 rounded-lg transition-colors ${
              showRightPanel ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
            title="Toggle settings panel"
          >
            <PanelRight className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <button
            onClick={handleSave}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Save
          </button>
          <button
            onClick={handlePublish}
            className="text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 px-4 py-1.5 rounded-lg transition-colors"
          >
            Publish
          </button>
        </div>
      </div>

      {/* Main 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Curriculum Tree */}
        <div className="w-72 shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 shrink-0">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Curriculum</h3>
            <button
              onClick={addModule}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3" />
              Module
            </button>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {draft.modules.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mb-3">No modules yet</p>
                <button
                  onClick={addModule}
                  className="text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Add Module
                </button>
              </div>
            ) : (
              draft.modules.map((mod, mi) => {
                const isExpanded = expandedModules.includes(mod.id);
                const isSelected = selectedModuleId === mod.id;
                const isDragOver = dragOverId === mod.id && dragItem?.type === "lesson";
                const modLessonCount = mod.lessons.length;
                const modPublishedCount = mod.lessons.filter((l) => l.status === "published").length;

                return (
                  <div key={mod.id}>
                    {/* Module row */}
                    <div
                      draggable
                      onDragStart={handleDragStart("module", mod.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragItem?.type === "module") setDragOverId(mod.id);
                      }}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop("module", mod.id)}
                      className={`group flex items-center gap-1 px-2 py-2 rounded-xl cursor-pointer transition-all ${
                        isSelected ? "bg-white shadow-sm border border-gray-200" : "hover:bg-white/80 border border-transparent"
                      } ${dragOverId === mod.id && dragItem?.type === "module" ? "ring-2 ring-gray-300 bg-gray-50" : ""}`}
                      onClick={() => { setSelectedModuleId(mod.id); toggleModule(mod.id); }}
                    >
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleModule(mod.id); }}
                          className="p-0.5 text-gray-400 hover:text-gray-600 shrink-0"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                        <GripVertical className="w-3.5 h-3.5 text-gray-200 shrink-0 cursor-grab active:cursor-grabbing" />
                        {editingId === mod.id ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitEdit();
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="text-xs font-medium text-gray-900 bg-white border border-gray-300 rounded px-1.5 py-0.5 w-full outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-900 truncate">{mod.title}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{modLessonCount}</span>

                      {/* Context menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenContextMenu(openContextMenu === `m-${mod.id}` ? null : `m-${mod.id}`); }}
                          className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        {openContextMenu === `m-${mod.id}` && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenContextMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-1">
                              <button onClick={(e) => { e.stopPropagation(); startEdit(mod.id, mod.title); setOpenContextMenu(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                                <Edit2 className="w-3.5 h-3.5" />Rename
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); addLesson(mod.id); setOpenContextMenu(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                                <Plus className="w-3.5 h-3.5" />Add Lesson
                              </button>
                              <div className="border-t border-gray-100 my-0.5" />
                              <button onClick={(e) => { e.stopPropagation(); deleteModule(mod.id); setOpenContextMenu(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                                <Trash2 className="w-3.5 h-3.5" />Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Lesson list (drag target for lessons) */}
                    <div
                      onDragOver={(e) => {
                        if (dragItem?.type === "lesson") { e.preventDefault(); setDragOverId(mod.id); }
                      }}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop("module", mod.id)}
                      className={`ml-3 space-y-0.5 pl-3 border-l-2 ${isDragOver ? "border-gray-300 bg-gray-50 rounded-xl" : "border-gray-100"}`}
                    >
                      {isExpanded && mod.lessons.length === 0 && (
                        <div className="py-2 text-center">
                          <button
                            onClick={() => addLesson(mod.id)}
                            className="text-[10px] text-gray-400 hover:text-gray-600 font-medium"
                          >
                            + Add lesson
                          </button>
                        </div>
                      )}
                      {isExpanded && mod.lessons.map((lesson, li) => {
                        const Icon = contentTypeIcons[lesson.contentType] || FileText;
                        const colorClass = contentTypeColors[lesson.contentType] || "text-gray-600 bg-gray-50";
                        const isLessonSelected = selectedLessonId === lesson.id;

                        return (
                          <div
                            key={lesson.id}
                            draggable
                            onDragStart={handleDragStart("lesson", lesson.id)}
                            onDragOver={handleDragOver(lesson.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop("lesson", lesson.id)}
                            className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                              isLessonSelected
                                ? "bg-white shadow-sm ring-1 ring-gray-200"
                                : "hover:bg-white/80"
                            } ${dragOverId === lesson.id ? "ring-2 ring-gray-300" : ""}`}
                            onClick={() => { setSelectedLessonId(lesson.id); setSelectedBlockId(null); }}
                          >
                            <GripVertical className="w-3 h-3 text-gray-200 shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            {editingId === lesson.id ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitEdit();
                                  if (e.key === "Escape") setEditingId(null);
                                }}
                                className="text-xs text-gray-700 bg-white border border-gray-300 rounded px-1 py-0.5 flex-1 min-w-0 outline-none"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="text-xs text-gray-700 truncate flex-1 min-w-0">{lesson.title}</span>
                            )}
                            <span className="text-[10px] text-gray-400">{lesson.durationMinutes}m</span>

                            {/* Lesson context menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenContextMenu(openContextMenu === `l-${lesson.id}` ? null : `l-${lesson.id}`); }}
                                className="p-0.5 text-gray-300 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-3 h-3" />
                              </button>
                              {openContextMenu === `l-${lesson.id}` && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenContextMenu(null)} />
                                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-1">
                                    <button onClick={(e) => { e.stopPropagation(); startEdit(lesson.id, lesson.title); setOpenContextMenu(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                                      <Edit2 className="w-3.5 h-3.5" />Rename
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50" title="Copy lesson">
                                      <Copy className="w-3.5 h-3.5" />Duplicate
                                    </button>
                                    <div className="border-t border-gray-100 my-0.5" />
                                    <button onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); setOpenContextMenu(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                                      <Trash2 className="w-3.5 h-3.5" />Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom stats bar */}
          <div className="px-4 py-2.5 border-t border-gray-100 shrink-0 flex items-center justify-between text-[10px] text-gray-400">
            <span>{getTreeStats().moduleCount} modules</span>
            <span>{getTreeStats().lessonCount} lessons ({getTreeStats().publishedCount} published)</span>
          </div>
        </div>

        {/* Center Panel: Content Editor */}
        <div className="flex-1 min-w-0 flex flex-col">
          {selectedLesson ? (
            <ContentEditor
              blocks={selectedLesson.blocks}
              onChange={updateBlocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No lesson selected</h3>
                <p className="text-xs text-gray-500 mb-4 max-w-xs">
                  Select a lesson from the curriculum tree or add a new lesson to start editing
                </p>
                {selectedModuleId && (
                  <button
                    onClick={() => addLesson(selectedModuleId)}
                    className="text-xs font-medium text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    + Add Lesson
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Settings (collapsible) */}
        {showRightPanel && (
          <div className="w-72 shrink-0 border-l border-gray-100">
            <BlockSettings
              draft={draft}
              selectedLesson={selectedLesson}
              selectedBlock={selectedBlock}
              onUpdateDraft={onUpdate}
              onUpdateLesson={updateLesson}
            />
          </div>
        )}
      </div>
    </div>
  );
}
