import React, { useState } from "react";
import {
  X, BookOpen, Sparkles, FileText, ChevronRight, ChevronLeft, Check,
  Plus, GripVertical, Trash2, Edit3, Video, Headphones, Download,
  Globe, Lock, Clock, CalendarDays, Search, Eye, EyeOff
} from "lucide-react";
import { CourseDraft, CourseDraftModule, CourseDraftLesson, CourseTemplate, ContentBlock } from "./CourseTypes";
import { courseTemplates } from "./CourseTemplates";
import ContentEditor from "./ContentEditor";

interface CourseCreationWizardProps {
  communityId: string;
  onComplete: (draft: CourseDraft) => void;
  onCancel: () => void;
}

const categories = ["Web Development", "Data Science", "Design", "Marketing", "Business", "Photography", "Music", "Health", "Personal Development", "Other"];

const templateIcons: Record<string, string> = {
  blank: "from-gray-400 to-gray-500",
  mini: "from-emerald-400 to-emerald-600",
  masterclass: "from-indigo-500 to-purple-600",
  workshop: "from-amber-500 to-orange-600",
  coaching: "from-rose-400 to-rose-600",
  membership: "from-cyan-400 to-cyan-600",
  challenge: "from-violet-400 to-violet-600",
};

const icons: Record<string, React.ElementType> = {
  video: Video, audio: Headphones, download: Download,
};

const steps = ["Template", "Details", "Curriculum", "Lesson Builder", "Settings", "Publish"];

function buildModulesFromTemplate(template: CourseTemplate): CourseDraftModule[] {
  return template.modules.map((m, mi) => ({
    id: `draft-mod-${Date.now()}-${mi}`,
    title: m.title,
    index: mi,
    lessons: m.lessons.map((l, li) => ({
      id: `draft-lesson-${Date.now()}-${mi}-${li}`,
      title: l.title,
      durationMinutes: 10,
      contentType: l.contentType as CourseDraftLesson["contentType"],
      blocks: [{ id: `block-${Date.now()}-${mi}-${li}`, type: "paragraph" as const, content: "Start writing your lesson content here..." }],
      isLocked: false,
      status: "draft" as const,
    })),
  }));
}

export default function CourseCreationWizard({ communityId, onComplete, onCancel }: CourseCreationWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [coverUrl, setCoverUrl] = useState("");
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [instructorName, setInstructorName] = useState("Your Name");
  const [error, setError] = useState("");

  const [modules, setModules] = useState<CourseDraftModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const [certificate, setCertificate] = useState(false);
  const [dripContent, setDripContent] = useState(false);
  const [dripDays, setDripDays] = useState(7);
  const [completionRule, setCompletionRule] = useState<"all_lessons" | "quiz_pass" | "assignment_submit">("all_lessons");
  const [allowComments, setAllowComments] = useState(true);
  const [allowDiscussions, setAllowDiscussions] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [publishAction, setPublishAction] = useState<"draft" | "published" | "scheduled" | "archived">("draft");
  const [scheduledDate, setScheduledDate] = useState("");

  const handleSelectTemplate = (t: CourseTemplate) => {
    setSelectedTemplate(t);
    if (!name && t.id !== "blank") {
      setName(t.name);
      setSlug(t.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
    const mods = buildModulesFromTemplate(t);
    setModules(mods);
    if (mods.length > 0 && mods[0].lessons.length > 0) {
      setSelectedModuleId(mods[0].id);
      setSelectedLessonId(mods[0].lessons[0].id);
    }
    setStep(1);
  };

  const addModule = () => {
    const newMod: CourseDraftModule = {
      id: `draft-mod-${Date.now()}`,
      title: `Module ${modules.length + 1}`,
      index: modules.length,
      lessons: [],
    };
    setModules([...modules, newMod]);
    setSelectedModuleId(newMod.id);
  };

  const deleteModule = (id: string) => {
    const updated = modules.filter((m) => m.id !== id).map((m, i) => ({ ...m, index: i }));
    setModules(updated);
    if (selectedModuleId === id) {
      setSelectedModuleId(updated.length > 0 ? updated[0].id : null);
      setSelectedLessonId(null);
    }
  };

  const addLesson = (moduleId: string) => {
    const newLesson: CourseDraftLesson = {
      id: `draft-lesson-${Date.now()}`,
      title: `Lesson`,
      durationMinutes: 10,
      contentType: "video",
      blocks: [{ id: `block-${Date.now()}`, type: "paragraph", content: "Start writing..." }],
      isLocked: false,
      status: "draft",
    };
    setModules(modules.map((m) => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m));
    setSelectedLessonId(newLesson.id);
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map((m) => m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m));
    if (selectedLessonId === lessonId) setSelectedLessonId(null);
  };

  const moveModule = (id: string, dir: "up" | "down") => {
    const idx = modules.findIndex((m) => m.id === id);
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === modules.length - 1)) return;
    const swapped = [...modules];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    [swapped[idx], swapped[swapIdx]] = [swapped[swapIdx], swapped[idx]];
    setModules(swapped.map((m, i) => ({ ...m, index: i })));
  };

  const moveLesson = (moduleId: string, lessonId: string, dir: "up" | "down") => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const idx = mod.lessons.findIndex((l) => l.id === lessonId);
    if ((dir === "up" && idx === 0) || (dir === "down" && idx === mod.lessons.length - 1)) return;
    const swapped = [...mod.lessons];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    [swapped[idx], swapped[swapIdx]] = [swapped[swapIdx], swapped[idx]];
    setModules(modules.map((m) => m.id === moduleId ? { ...m, lessons: swapped } : m));
  };

  const startRenameModule = (id: string) => {
    const mod = modules.find((m) => m.id === id);
    if (mod) { setEditTitle(mod.title); setEditingModule(id); }
  };

  const confirmRenameModule = () => {
    if (editingModule) {
      setModules(modules.map((m) => m.id === editingModule ? { ...m, title: editTitle } : m));
      setEditingModule(null);
    }
  };

  const startRenameLesson = (id: string) => {
    for (const m of modules) {
      const lesson = m.lessons.find((l) => l.id === id);
      if (lesson) { setEditTitle(lesson.title); setEditingLesson(id); return; }
    }
  };

  const [editingLesson, setEditingLesson] = useState<string | null>(null);

  const confirmRenameLesson = () => {
    if (editingLesson) {
      setModules(modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => l.id === editingLesson ? { ...l, title: editTitle } : l),
      })));
      setEditingLesson(null);
    }
  };

  const selectedLesson = (() => {
    for (const m of modules) {
      const lesson = m.lessons.find((l) => l.id === selectedLessonId);
      if (lesson) return lesson;
    }
    return null;
  })();

  const updateLessonBlocks = (lessonId: string, blocks: ContentBlock[]) => {
    setModules(modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, blocks } : l),
    })));
  };

  const getLessonModule = (lessonId: string) => modules.find((m) => m.lessons.some((l) => l.id === lessonId));

  const handleCreate = () => {
    if (!name.trim()) { setError("Course name is required"); return; }
    const draft: CourseDraft = {
      id: `course-${Date.now()}`,
      communityId,
      name: name.trim(),
      slug: slug || name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: description.trim() || selectedTemplate?.description || "",
      coverUrl,
      category,
      modules,
      status: publishAction,
      price,
      isFree,
      instructorName,
      instructorAvatar: "",
      enrolledCount: 0,
      completionRate: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: selectedTemplate?.id,
      settings: {
        certificate,
        dripContent,
        dripDays: dripContent ? dripDays : 0,
        prerequisites: [],
        completionRules: completionRule,
        allowComments,
        allowDiscussions,
        allowDownloads,
        seoTitle: seoTitle || name.trim(),
        seoDescription: seoDescription || description.trim(),
      },
      scheduledDate: publishAction === "scheduled" ? scheduledDate : undefined,
      visibility,
    };
    onComplete(draft);
  };

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = modules.reduce((acc, m) => acc + m.lessons.reduce((s, l) => s + l.durationMinutes, 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Create New Course</h2>
              <p className="text-xs text-gray-500">Step {step + 1} of 6 &mdash; {steps[step]}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 px-6 py-3 bg-gray-50 border-b border-gray-200 shrink-0 overflow-x-auto">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 shrink-0 ${i <= step ? "text-gray-900" : "text-gray-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < step ? "bg-gray-900 text-white" : i === step ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="text-[11px] font-medium whitespace-nowrap">{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 min-w-[12px] ${i < step ? "bg-gray-900" : "bg-gray-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Template Selection */}
          {step === 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Choose a Template</h3>
              <p className="text-sm text-gray-500 mb-5">Start with a pre-built structure or pick a blank canvas</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {courseTemplates.map((t) => {
                  const sel = selectedTemplate?.id === t.id;
                  const gradient = templateIcons[t.id] || "from-indigo-500 to-purple-500";
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      className={`relative flex flex-col items-center text-center p-5 rounded-xl border-2 transition-all ${
                        sel ? "border-gray-900 bg-gray-50 ring-2 ring-gray-100" : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="font-semibold text-gray-900 text-sm mb-1">{t.name}</div>
                      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{t.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400">
                        <span>{t.moduleCount} {t.moduleCount === 1 ? "module" : "modules"}</span>
                        <span>&middot;</span>
                        <span>{t.lessonCount} {t.lessonCount === 1 ? "lesson" : "lessons"}</span>
                        <span>&middot;</span>
                        <span className="capitalize">{t.difficulty}</span>
                      </div>
                      {sel && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Course Details */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Course Details</h3>
              <p className="text-sm text-gray-500 mb-5">Configure your course information</p>
              <div className="max-w-2xl space-y-4">
                {selectedTemplate && selectedTemplate.id !== "blank" && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Template: <span className="font-medium text-gray-900">{selectedTemplate.name}</span>
                    <button onClick={() => { setStep(0); }} className="text-xs text-gray-500 underline ml-2">Change</button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Course Name *</label>
                    <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} placeholder="e.g. The Complete SEO Masterclass" className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))} placeholder="course-slug" className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 font-mono text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Brief description of your course..." className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900">
                      {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Instructor</label>
                    <input type="text" value={instructorName} onChange={(e) => setInstructorName(e.target.value)} placeholder="Your name" className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cover Image URL</label>
                    <input type="text" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Price ($)</label>
                    <input type="number" min={0} value={isFree ? 0 : price} onChange={(e) => setPrice(Number(e.target.value))} disabled={isFree} className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 disabled:opacity-40" />
                  </div>
                  <div className="flex items-end pb-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                      <span className="text-sm text-gray-700">Free course</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Visibility</label>
                    <select value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "private")} className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900">
                      <option value="public">Public</option>
                      <option value="private">Private (invite only)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Curriculum Builder */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Curriculum Builder</h3>
              <p className="text-sm text-gray-500 mb-5">Organize your course into modules and lessons</p>
              <div className="flex gap-6">
                <div className="flex-1 space-y-2">
                  {modules.map((mod) => (
                    <div key={mod.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab shrink-0" />
                        <div className="flex-1 min-w-0">
                          {editingModule === mod.id ? (
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={confirmRenameModule} onKeyDown={(e) => e.key === "Enter" && confirmRenameModule()} className="text-sm font-semibold bg-white border border-gray-300 rounded px-2 py-0.5 w-full outline-none focus:ring-2 focus:ring-gray-900/10" autoFocus />
                          ) : (
                            <span className="text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => startRenameModule(mod.id)}>{mod.title}</span>
                          )}
                          <span className="text-[10px] text-gray-400 ml-2">{mod.lessons.length} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveModule(mod.id, "up")} disabled={mod.index === 0} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronLeft className="w-3.5 h-3.5 rotate-90" /></button>
                          <button onClick={() => moveModule(mod.id, "down")} disabled={mod.index === modules.length - 1} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronRight className="w-3.5 h-3.5 rotate-90" /></button>
                          <button onClick={() => addLesson(mod.id)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"><Plus className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteModule(mod.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      {mod.lessons.map((lesson) => {
                        const Icon = icons[lesson.contentType] || FileText;
                        return (
                          <div key={lesson.id} className={`flex items-center gap-2 px-4 py-2.5 ml-2 border-l-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedLessonId === lesson.id ? "border-gray-900 bg-gray-50" : "border-transparent"
                          }`} onClick={() => { setSelectedModuleId(mod.id); setSelectedLessonId(lesson.id); }}>
                            <GripVertical className="w-3.5 h-3.5 text-gray-200 cursor-grab shrink-0" />
                            <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              {editingLesson === lesson.id ? (
                                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={confirmRenameLesson} onKeyDown={(e) => e.key === "Enter" && confirmRenameLesson()} className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 w-full outline-none focus:ring-2 focus:ring-gray-900/10" autoFocus />
                              ) : (
                                <span className="text-sm text-gray-700 cursor-pointer" onClick={() => startRenameLesson(lesson.id)}>{lesson.title}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {(() => {
                                const mIdx = modules.findIndex((m) => m.id === mod.id);
                                const lIdx = mod.lessons.findIndex((l) => l.id === lesson.id);
                                return (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); moveLesson(mod.id, lesson.id, "up"); }} disabled={lIdx === 0} className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronLeft className="w-3 h-3 rotate-90" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); moveLesson(mod.id, lesson.id, "down"); }} disabled={lIdx === mod.lessons.length - 1} className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronRight className="w-3 h-3 rotate-90" /></button>
                                  </>
                                );
                              })()}
                              <button onClick={(e) => { e.stopPropagation(); deleteLesson(mod.id, lesson.id); }} className="p-0.5 text-gray-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <button onClick={addModule} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 w-full transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Module
                  </button>
                </div>
                <div className="w-56 shrink-0">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Modules</span><span className="font-medium">{modules.length}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Lessons</span><span className="font-medium">{totalLessons}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium">{totalDuration} min</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Lesson Builder */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Lesson Builder</h3>
              <p className="text-sm text-gray-500 mb-5">Create rich content with blocks</p>
              <div className="flex gap-4 h-[400px]">
                <div className="w-52 shrink-0 border border-gray-200 rounded-xl overflow-y-auto">
                  {modules.map((mod) => (
                    <div key={mod.id}>
                      <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">{mod.title}</div>
                      {mod.lessons.map((lesson) => (
                        <button key={lesson.id} onClick={() => { setSelectedModuleId(mod.id); setSelectedLessonId(lesson.id); }} className={`w-full text-left px-3 py-2 text-xs border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          selectedLessonId === lesson.id ? "bg-gray-100 font-semibold text-gray-900" : "text-gray-600"
                        }`}>
                          {lesson.title}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden">
                  {selectedLesson ? (
                    <ContentEditor
                      blocks={selectedLesson.blocks}
                      onChange={(blocks) => updateLessonBlocks(selectedLesson.id, blocks)}
                      selectedBlockId={null}
                      onSelectBlock={() => {}}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">Select a lesson to edit</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Course Settings */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Course Settings</h3>
              <p className="text-sm text-gray-500 mb-5">Configure certificates, access, and content delivery</p>
              <div className="max-w-2xl space-y-5">
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Certificate & Completion</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={certificate} onChange={(e) => setCertificate(e.target.checked)} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                      <div><span className="text-sm font-medium text-gray-700">Issue Certificate</span><p className="text-[10px] text-gray-400">Award certificate on completion</p></div>
                    </label>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Completion Rule</label>
                      <select value={completionRule} onChange={(e) => setCompletionRule(e.target.value as any)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10">
                        <option value="all_lessons">Complete all lessons</option>
                        <option value="quiz_pass">Pass final quiz</option>
                        <option value="assignment_submit">Submit assignment</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Content Delivery</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={dripContent} onChange={(e) => setDripContent(e.target.checked)} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                      <div><span className="text-sm font-medium text-gray-700">Drip Content</span><p className="text-[10px] text-gray-400">Release lessons over time</p></div>
                    </label>
                    {dripContent && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Drip every (days)</label>
                        <input type="number" min={1} value={dripDays} onChange={(e) => setDripDays(Number(e.target.value))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Interaction</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" /><span className="text-sm text-gray-700">Comments</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={allowDiscussions} onChange={(e) => setAllowDiscussions(e.target.checked)} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" /><span className="text-sm text-gray-700">Discussions</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={allowDownloads} onChange={(e) => setAllowDownloads(e.target.checked)} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" /><span className="text-sm text-gray-700">Downloads</span></label>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">SEO</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SEO Title</label>
                      <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={name || "Course title"} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SEO Description</label>
                      <input type="text" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder={description || "Course description"} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Publish */}
          {step === 5 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Publish</h3>
              <p className="text-sm text-gray-500 mb-5">Choose how to launch your course</p>
              <div className="max-w-xl mx-auto space-y-4">
                {[
                  { value: "draft", label: "Save as Draft", desc: "Keep editing privately before launch", icon: Edit3 },
                  { value: "published", label: "Publish Now", desc: "Make available to students immediately", icon: Globe },
                  { value: "scheduled", label: "Schedule for Later", desc: "Set a future launch date", icon: CalendarDays },
                  { value: "archived", label: "Archive", desc: "Save for later use, hidden from students", icon: Lock },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setPublishAction(opt.value as any)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    publishAction === opt.value ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      publishAction === opt.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.desc}</div>
                    </div>
                  </button>
                ))}
                {publishAction === "scheduled" && (
                  <div className="pl-14">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Schedule Date</label>
                    <input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10" />
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <h4 className="font-semibold text-gray-900">Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Name:</span> <span className="font-medium">{name || "Untitled"}</span></div>
                    <div><span className="text-gray-500">Template:</span> <span className="font-medium">{selectedTemplate?.name || "Custom"}</span></div>
                    <div><span className="text-gray-500">Modules:</span> <span className="font-medium">{modules.length}</span></div>
                    <div><span className="text-gray-500">Lessons:</span> <span className="font-medium">{totalLessons}</span></div>
                    <div><span className="text-gray-500">Duration:</span> <span className="font-medium">{totalDuration} min</span></div>
                    <div><span className="text-gray-500">Price:</span> <span className="font-medium">{isFree ? "Free" : `$${price}`}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onCancel()}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <div className="flex items-center gap-2">
            {step < 5 && (
              <button
                onClick={() => {
                  if (step === 1 && !name.trim()) { setError("Course name is required"); return; }
                  setError("");
                  setStep(step + 1);
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Next: {steps[step + 1]}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            {step === 5 && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {publishAction === "draft" ? "Save Draft" : publishAction === "published" ? "Publish Course" : publishAction === "scheduled" ? "Schedule Course" : "Archive Course"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}