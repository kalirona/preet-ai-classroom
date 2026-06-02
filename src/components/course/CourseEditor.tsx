import React, { useState, useCallback } from "react";
import { PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, Plus } from "lucide-react";
import { CourseDraft, CourseDraftModule, CourseDraftLesson, ContentBlock } from "./CourseTypes";
import { v4 as uuidv4 } from "uuid";
import CourseHeader from "./CourseHeader";
import CourseStructureTree from "./CourseStructureTree";
import ContentEditor from "./ContentEditor";
import BlockSettings from "./BlockSettings";

interface CourseEditorProps {
  draft: CourseDraft;
  onUpdate: (draft: CourseDraft) => void;
  onBack: () => void;
}

export default function CourseEditor({ draft, onUpdate, onBack }: CourseEditorProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    draft.modules.length > 0 ? draft.modules[0].id : null
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    draft.modules.length > 0 && draft.modules[0].lessons.length > 0 ? draft.modules[0].lessons[0].id : null
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedLesson = selectedLessonId
    ? draft.modules.flatMap((m) => m.lessons).find((l) => l.id === selectedLessonId)
    : null;

  const selectedBlock = selectedBlockId
    ? selectedLesson?.blocks.find((b) => b.id === selectedBlockId)
    : null;

  const updateDraft = useCallback((updates: Partial<CourseDraft>) => {
    onUpdate({ ...draft, ...updates, updatedAt: new Date().toISOString() });
  }, [draft, onUpdate]);

  const updateModules = useCallback((modules: CourseDraftModule[]) => {
    updateDraft({ modules });
  }, [updateDraft]);

  const updateLessonInModules = useCallback((lessonId: string, updates: Partial<CourseDraftLesson>) => {
    const newModules = draft.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)),
    }));
    updateModules(newModules);
  }, [draft.modules, updateModules]);

  // Tree handlers
  const handleSelectLesson = (id: string) => {
    setSelectedLessonId(id);
    setSelectedBlockId(null);
    // Find and select parent module
    for (const m of draft.modules) {
      if (m.lessons.find((l) => l.id === id)) {
        setSelectedModuleId(m.id);
        break;
      }
    }
  };

  const handleAddModule = () => {
    const newMod: CourseDraftModule = {
      id: `mod-${uuidv4().slice(0, 8)}`,
      title: `Module ${draft.modules.length + 1}`,
      index: draft.modules.length,
      lessons: [],
    };
    updateModules([...draft.modules, newMod]);
    setSelectedModuleId(newMod.id);
  };

  const handleAddLesson = (moduleId: string) => {
    const mod = draft.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const newLesson: CourseDraftLesson = {
      id: `les-${uuidv4().slice(0, 8)}`,
      title: `Lesson ${mod.lessons.length + 1}`,
      durationMinutes: 10,
      contentType: "video",
      blocks: [
        { id: `block-${uuidv4().slice(0, 8)}`, type: "heading", content: "New Lesson" },
        { id: `block-${uuidv4().slice(0, 8)}`, type: "paragraph", content: "Start writing your content here..." },
      ],
      isLocked: false,
      status: "draft",
    };
    const newModules = draft.modules.map((m) =>
      m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
    );
    updateModules(newModules);
    setSelectedLessonId(newLesson.id);
  };

  const handleDeleteModule = (id: string) => {
    const newModules = draft.modules.filter((m) => m.id !== id);
    updateModules(newModules);
    if (selectedModuleId === id) {
      setSelectedModuleId(newModules.length > 0 ? newModules[0].id : null);
    }
  };

  const handleDeleteLesson = (id: string) => {
    const newModules = draft.modules.map((m) => ({
      ...m,
      lessons: m.lessons.filter((l) => l.id !== id),
    }));
    updateModules(newModules);
    if (selectedLessonId === id) {
      setSelectedLessonId(null);
      setSelectedBlockId(null);
    }
  };

  const handleMoveModule = (id: string, direction: "up" | "down") => {
    const idx = draft.modules.findIndex((m) => m.id === id);
    if (direction === "up" && idx > 0) {
      const newModules = [...draft.modules];
      [newModules[idx - 1], newModules[idx]] = [newModules[idx], newModules[idx - 1]];
      updateModules(newModules.map((m, i) => ({ ...m, index: i })));
    } else if (direction === "down" && idx < draft.modules.length - 1) {
      const newModules = [...draft.modules];
      [newModules[idx + 1], newModules[idx]] = [newModules[idx], newModules[idx + 1]];
      updateModules(newModules.map((m, i) => ({ ...m, index: i })));
    }
  };

  const handleMoveLesson = (moduleId: string, lessonId: string, direction: "up" | "down") => {
    const newModules = draft.modules.map((m) => {
      if (m.id !== moduleId) return m;
      const idx = m.lessons.findIndex((l) => l.id === lessonId);
      const lessons = [...m.lessons];
      if (direction === "up" && idx > 0) {
        [lessons[idx - 1], lessons[idx]] = [lessons[idx], lessons[idx - 1]];
      } else if (direction === "down" && idx < lessons.length - 1) {
        [lessons[idx + 1], lessons[idx]] = [lessons[idx], lessons[idx + 1]];
      }
      return { ...m, lessons };
    });
    updateModules(newModules);
  };

  const handleRenameModule = (id: string, title: string) => {
    updateModules(draft.modules.map((m) => (m.id === id ? { ...m, title } : m)));
  };

  const handleRenameLesson = (id: string, title: string) => {
    updateLessonInModules(id, { title });
  };

  // Content editor handlers
  const handleBlocksChange = (blocks: ContentBlock[]) => {
    if (selectedLessonId) {
      updateLessonInModules(selectedLessonId, { blocks });
    }
  };

  const handleLessonTitleChange = (title: string) => {
    if (selectedLessonId) {
      updateLessonInModules(selectedLessonId, { title });
    }
  };

  const handleContentTypeChange = (contentType: string) => {
    if (selectedLessonId) {
      updateLessonInModules(selectedLessonId, { contentType: contentType as CourseDraftLesson["contentType"] });
    }
  };

  // Save / Publish
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/courses", {
        method: draft.id.includes("course-") ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id,
          communityId: draft.communityId,
          name: draft.name,
          description: draft.description,
          coverUrl: draft.coverUrl,
          modules: draft.modules,
          status: draft.status,
        }),
      });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handlePublishToggle = () => {
    updateDraft({
      status: draft.status === "published" ? "draft" : "published",
    });
  };

  const handleClone = () => {
    const cloned: CourseDraft = {
      ...draft,
      id: `course-${Date.now()}`,
      name: `${draft.name} (Copy)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceCourseId: draft.id,
    };
    onUpdate(cloned);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <CourseHeader
        course={draft}
        onBack={onBack}
        onSave={handleSave}
        onPublishToggle={handlePublishToggle}
        onClone={handleClone}
        onPreview={() => window.open(`/preview/course/${draft.id}`, "_blank")}
        isSaving={isSaving}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tree */}
        {showLeftPanel && (
          <div className="w-72 border-r border-gray-200 bg-white flex-shrink-0 flex flex-col">
            <CourseStructureTree
              modules={draft.modules}
              selectedModuleId={selectedModuleId}
              selectedLessonId={selectedLessonId}
              onSelectModule={setSelectedModuleId}
              onSelectLesson={handleSelectLesson}
              onAddModule={handleAddModule}
              onAddLesson={handleAddLesson}
              onDeleteModule={handleDeleteModule}
              onDeleteLesson={handleDeleteLesson}
              onMoveModule={handleMoveModule}
              onMoveLesson={handleMoveLesson}
              onRenameModule={handleRenameModule}
              onRenameLesson={handleRenameLesson}
            />
          </div>
        )}

        {/* Toggle left panel */}
        <button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          className="flex items-center justify-center w-5 bg-white border-r border-gray-200 text-gray-300 hover:text-gray-500 hover:bg-gray-50 flex-shrink-0"
        >
          {showLeftPanel ? <PanelLeftClose className="w-3 h-3" /> : <PanelLeft className="w-3 h-3" />}
        </button>

        {/* Center - Content Editor */}
        <div className="flex-1 bg-white flex flex-col min-w-0">
          {selectedLesson ? (
            <ContentEditor
              blocks={selectedLesson.blocks}
              onChange={handleBlocksChange}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              lessonTitle={selectedLesson.title}
              onLessonTitleChange={handleLessonTitleChange}
              contentType={selectedLesson.contentType}
              onContentTypeChange={handleContentTypeChange}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Plus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Select or create a lesson to start editing</p>
                {draft.modules.length === 0 && (
                  <button
                    onClick={handleAddModule}
                    className="mt-3 text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Add your first module
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toggle right panel */}
        <button
          onClick={() => setShowRightPanel(!showRightPanel)}
          className="flex items-center justify-center w-5 bg-white border-l border-gray-200 text-gray-300 hover:text-gray-500 hover:bg-gray-50 flex-shrink-0"
        >
          {showRightPanel ? <PanelRightClose className="w-3 h-3" /> : <PanelRight className="w-3 h-3" />}
        </button>

        {/* Right Panel - Block Settings */}
        {showRightPanel && (
          <div className="w-72 border-l border-gray-200 bg-white flex-shrink-0 flex flex-col">
            <BlockSettings
              block={selectedBlock}
              onChange={(updates) => {
                if (selectedBlock && selectedLessonId) {
                  const newBlocks = selectedLesson.blocks.map((b) =>
                    b.id === selectedBlock.id ? { ...b, ...updates } : b
                  );
                  handleBlocksChange(newBlocks);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
