import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Plus, GripVertical, Trash2, ChevronDown, ChevronRight, FileText, Video, FileQuestion,
  Download, ClipboardList, MoreHorizontal, Edit2, Copy, Check, X, PanelLeft, PanelRight,
  BookOpen, Layers, Sparkles, Clock, Lock, Eye, Settings, PlayCircle, ArrowLeft,
  Upload, Globe, Search, Grid3X3, List, Undo2, Redo2, Maximize2, Minimize2,
  AlignLeft, Bold, Italic, Link, Hash, Type, Image, Square, Heading1, Heading2,
  MessageSquare, CheckSquare, ExternalLink, MousePointerClick, Quote, Minus, Code,
  Headphones, BarChart3, Lightbulb, Bot, PenSquare, Users, Calendar,
  CheckCircle, Archive
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
  const [nameInput, setNameInput] = useState(draft.name);

  const dragNode = useRef<HTMLElement | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nameInput !== draft.name) {
        onUpdate({ ...draftRef.current, name: nameInput });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [nameInput, onUpdate, draft.name]);

  const selectedLesson = selectedLessonId
    ? draftRef.current.modules.flatMap((m) => m.lessons).find((l) => l.id === selectedLessonId) || null
    : null;

  const selectedBlock = selectedBlockId && selectedLesson
    ? selectedLesson.blocks.find((b) => b.id === selectedBlockId) || null
    : null;

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  // --- Module operations ---
  const addModule = useCallback(() => {
    const d = draftRef.current;
    const newMod: CourseDraftModule = {
      id: `mod-${Date.now()}`,
      title: `Module ${d.modules.length + 1}`,
      index: d.modules.length,
      lessons: [],
    };
    onUpdate({ ...d, modules: [...d.modules, newMod] });
    setSelectedModuleId(newMod.id);
    setExpandedModules((prev) => [...prev, newMod.id]);
  }, [onUpdate]);

  const deleteModule = useCallback((id: string) => {
    const d = draftRef.current;
    if (d.modules.length <= 1) return;
    const filtered = d.modules.filter((m) => m.id !== id);
    onUpdate({ ...d, modules: filtered });
    if (selectedModuleId === id) {
      const next = filtered[0]?.id || null;
      setSelectedModuleId(next);
      setSelectedLessonId(next ? (filtered.find((m) => m.id === next)?.lessons[0]?.id || null) : null);
    }
  }, [onUpdate, selectedModuleId]);

  const renameModule = useCallback((id: string, title: string) => {
    const d = draftRef.current;
    onUpdate({ ...d, modules: d.modules.map((m) => m.id === id ? { ...m, title } : m) });
  }, [onUpdate]);

  // --- Lesson operations ---
  const addLesson = useCallback((moduleId: string) => {
    const d = draftRef.current;
    const targetModule = d.modules.find((m) => m.id === moduleId);
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
      ...d,
      modules: d.modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
      ),
    });
    setSelectedLessonId(newLesson.id);
    setSelectedBlockId(newLesson.blocks[0]?.id || null);
  }, [onUpdate]);

  const deleteLesson = useCallback((id: string) => {
    const d = draftRef.current;
    const mod = d.modules.find((m) => m.lessons.some((l) => l.id === id));
    if (!mod || mod.lessons.length <= 1) return;
    onUpdate({
      ...d,
      modules: d.modules.map((m) =>
        m.id === mod.id ? { ...m, lessons: m.lessons.filter((l) => l.id !== id) } : m
      ),
    });
    if (selectedLessonId === id) {
      const remaining = mod.lessons.filter((l) => l.id !== id);
      setSelectedLessonId(remaining[0]?.id || null);
    }
  }, [onUpdate, selectedLessonId]);

  const renameLesson = useCallback((id: string, title: string) => {
    const d = draftRef.current;
    onUpdate({
      ...d,
      modules: d.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => l.id === id ? { ...l, title } : l),
      })),
    });
  }, [onUpdate]);

  // --- Move operations (drag-and-drop) ---
  const moveModule = useCallback((fromIndex: number, toIndex: number) => {
    const d = draftRef.current;
    const updated = [...d.modules];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onUpdate({ ...d, modules: updated.map((m, i) => ({ ...m, index: i })) });
  }, [onUpdate]);

  const moveLesson = useCallback((moduleId: string, fromIndex: number, toIndex: number) => {
    const d = draftRef.current;
    onUpdate({
      ...d,
      modules: d.modules.map((m) => {
        if (m.id !== moduleId) return m;
        const updated = [...m.lessons];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return { ...m, lessons: updated };
      }),
    });
  }, [onUpdate]);

  const moveLessonBetweenModules = useCallback((fromModuleId: string, lessonId: string, toModuleId: string) => {
    const d = draftRef.current;
    const fromMod = d.modules.find((m) => m.id === fromModuleId);
    const lesson = fromMod?.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    onUpdate({
      ...d,
      modules: d.modules.map((m) => {
        if (m.id === fromModuleId) return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
        if (m.id === toModuleId) return { ...m, lessons: [...m.lessons, lesson] };
        return m;
      }),
    });
  }, [onUpdate]);

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
    const d = draftRef.current;
    onUpdate({
      ...d,
      modules: d.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => l.id === selectedLessonId ? { ...l, blocks } : l),
      })),
    });
  }, [onUpdate, selectedLessonId]);

  const updateLesson = useCallback((lessonId: string, updates: Partial<CourseDraftLesson>) => {
    const d = draftRef.current;
    onUpdate({
      ...d,
      modules: d.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, ...updates } : l),
      })),
    });
  }, [onUpdate]);

  const handlePublish = useCallback(() => {
    const d = draftRef.current;
    const updated = {
      ...d,
      status: "published" as const,
      updatedAt: new Date().toISOString(),
      modules: d.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => ({ ...l, status: "published" as const })),
      })),
    };
    onUpdate(updated);
  }, [onUpdate]);

  const handleSave = useCallback(() => {
    const d = draftRef.current;
    onUpdate({ ...d, updatedAt: new Date().toISOString() });
  }, [onUpdate]);

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
      {/* Premium wrapper */}
      <div className="h-full flex flex-col">
        {/* Premium header bar - full width */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors shadow-sm hover:shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none p-0 placeholder:text-gray-300 w-64 sm:w-80"
                placeholder="Course name"
              />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              draft.status === "published" ? "bg-emerald-50 text-emerald-700" :
              draft.status === "draft" ? "bg-amber-50 text-amber-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {draft.status === "published" ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Published
                </>
              ) : draft.status === "draft" ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  Draft
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  Archived
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-6 w-px bg-gray-200 hidden lg:block" />
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-2.5 rounded-xl transition-all ${
                showRightPanel ? "bg-gray-100 text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
              title="Toggle settings panel"
            >
              <PanelRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              className="text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-5 py-2 rounded-xl transition-all shadow-sm hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Publish Course
            </button>
          </div>
        </div>

        {/* Main 3-panel layout - Full width */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Curriculum Tree - Wider */}
          <div className="w-80 shrink-0 border-r border-gray-100 bg-gradient-to-b from-gray-50/50 to-white flex flex-col">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0 bg-white/50 backdrop-blur-sm">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Curriculum</h3>
              <button
                onClick={addModule}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl transition-all shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                Add Module
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

        {/* Center Panel: Content Editor - Full width */}
        <div className="flex-1 min-w-0 flex flex-col relative">
          {selectedLesson ? (
            <ContentEditor
              blocks={selectedLesson.blocks}
              onChange={updateBlocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              lessonTitle={selectedLesson.title}
              moduleTitle={draftRef.current.modules.find(m => m.lessons.some(l => l.id === selectedLessonId))?.title}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/50 to-white">
              <div className="text-center px-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-5">
                  <FileText className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No lesson selected</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
                  Select a lesson from the curriculum tree on the left, or add a new lesson to start building your content.
                </p>
                {selectedModuleId && (
                  <button
                    onClick={() => addLesson(selectedModuleId)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Lesson
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Settings (collapsible) - Premium */}
        {showRightPanel && (
          <div className="w-80 shrink-0 border-l border-gray-100 bg-white/50 backdrop-blur-sm">
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
    </div>
  );
}
