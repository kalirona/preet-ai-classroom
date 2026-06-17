import React, { useState, useCallback } from "react";
import { FileText } from "lucide-react";
import { CourseDraft, CourseDraftLesson, ContentBlock, CourseDraftModule } from "./CourseTypes";
import CourseHeader from "./CourseHeader";
import CourseStructureTree from "./CourseStructureTree";
import ContentEditor from "./ContentEditor";
import BlockSettings from "./BlockSettings";

interface CourseEditorProps {
  draft: CourseDraft;
  onUpdate: (draft: CourseDraft) => void;
  onBack: () => void;
  currentUser?: any;
}

export default function CourseEditor({ draft, onUpdate, onBack, currentUser }: CourseEditorProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    draft.modules.length > 0 ? draft.modules[0].id : null
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    draft.modules.length > 0 && draft.modules[0].lessons.length > 0 ? draft.modules[0].lessons[0].id : null
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedLesson = selectedLessonId
    ? draft.modules.flatMap((m) => m.lessons).find((l) => l.id === selectedLessonId) || null
    : null;

  const selectedBlock = selectedBlockId && selectedLesson
    ? selectedLesson.blocks.find((b) => b.id === selectedBlockId) || null
    : null;

  // --- Module ops ---
  const addModule = useCallback(() => {
    const newMod: CourseDraftModule = {
      id: `mod-${Date.now()}`,
      title: `Module ${draft.modules.length + 1}`,
      index: draft.modules.length,
      lessons: [],
    };
    onUpdate({ ...draft, modules: [...draft.modules, newMod] });
    setSelectedModuleId(newMod.id);
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

  // --- Lesson ops ---
  const addLesson = useCallback((moduleId: string) => {
    const newLesson: CourseDraftLesson = {
      id: `lesson-${Date.now()}`,
      title: `Lesson ${draft.modules.find((m) => m.id === moduleId)?.lessons.length + 1 || 1}`,
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

  // --- Block ops ---
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
    const allPublished = draft.modules.every((m) => m.lessons.every((l) => l.status === "published"));
    if (!allPublished) {
      // Publish all lessons as well
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
    } else {
      onUpdate({ ...draft, status: "published", updatedAt: new Date().toISOString() });
    }
  }, [draft, onUpdate]);

  const handleSave = useCallback(() => {
    onUpdate({ ...draft, updatedAt: new Date().toISOString() });
  }, [draft, onUpdate]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <CourseHeader
        draft={draft}
        onUpdate={onUpdate}
        onBack={onBack}
        onPreview={() => window.open(`/preview/course/${draft.id}`, "_blank")}
        onPublish={handlePublish}
        onSave={handleSave}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Structure Tree */}
        <div className="w-72 shrink-0">
          <CourseStructureTree
            modules={draft.modules}
            selectedModuleId={selectedModuleId}
            selectedLessonId={selectedLessonId}
            onSelectModule={setSelectedModuleId}
            onSelectLesson={(id) => { setSelectedLessonId(id); setSelectedBlockId(null); }}
            onAddModule={addModule}
            onAddLesson={addLesson}
            onDeleteModule={deleteModule}
            onDeleteLesson={deleteLesson}
            onMoveModule={() => {}}
            onMoveLesson={() => {}}
            onRenameModule={renameModule}
            onRenameLesson={renameLesson}
          />
        </div>

        {/* Center: Content Editor */}
        <div className="flex-1 min-w-0 border-r border-gray-200">
          {selectedLesson ? (
            <ContentEditor
              blocks={selectedLesson.blocks}
              onChange={updateBlocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No lesson selected</h3>
                <p className="text-xs text-gray-500 mb-4">Select a lesson from the structure tree</p>
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

        {/* Right: Settings */}
        <div className="w-72 shrink-0">
          <BlockSettings
            draft={draft}
            selectedLesson={selectedLesson}
            selectedBlock={selectedBlock}
            onUpdateDraft={onUpdate}
            onUpdateLesson={updateLesson}
          />
        </div>
      </div>
    </div>
  );
}
