import React, { useState, useCallback, useEffect } from "react";
import {
  X, BookOpen, Sparkles, FileText, ChevronRight, ChevronLeft, Check,
  Plus, GripVertical, Trash2, Edit3, Video, Headphones, Download,
  Globe, Lock, Clock, CalendarDays, Search, Eye, EyeOff,
  Wand2, RefreshCw, Users, Target, GraduationCap, Timer, AlertCircle,
  Bot, Loader2, Zap, Layers, CheckCircle2, PenSquare, Lightbulb
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

function getSteps(mode: string | null): string[] {
  if (mode === "ai") {
    return ["Topic", "Review", "Curriculum", "Publish"];
  }
  return ["Basics", "Curriculum", "Details", "Pricing", "Settings", "Publish"];
}

const icons: Record<string, React.ElementType> = {
  video: Video, audio: Headphones, download: Download,
};

const skillLevels = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const durations = ["2 Weeks", "4 Weeks", "6 Weeks", "8 Weeks", "12 Weeks"];

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
  const [aiDropdownModule, setAiDropdownModule] = useState<string | null>(null);

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

  // AI generation state
  const [creationMode, setCreationMode] = useState<"manual" | "ai" | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiAudience, setAiAudience] = useState("");
  const [aiLevel, setAiLevel] = useState("Beginner");
  const [aiDuration, setAiDuration] = useState("4 Weeks");
  const [aiGoal, setAiGoal] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiCurriculum, setAiCurriculum] = useState<any>(null);
  const [aiCredits, setAiCredits] = useState<number>(0);
  const [aiApproving, setAiApproving] = useState(false);
  const [aiEditMode, setAiEditMode] = useState(false);
  const [aiEditableTitle, setAiEditableTitle] = useState("");
  const [aiEditableDescription, setAiEditableDescription] = useState("");

  // AI Curriculum Expansion state
  const [aiActionLoading, setAiActionLoading] = useState<string | null>(null);
  const [aiGeneratedLessons, setAiGeneratedLessons] = useState<any[] | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiMissingTopics, setAiMissingTopics] = useState<any[] | null>(null);
  const [aiActionTarget, setAiActionTarget] = useState<string | null>(null);
  const [selectedGeneratedLessons, setSelectedGeneratedLessons] = useState<Set<number>>(new Set());
  const [aiShowResults, setAiShowResults] = useState(false);
  const [aiResultsTitle, setAiResultsTitle] = useState("");

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

  const handleGenerateAI = useCallback(async () => {
    if (!aiTopic.trim() || !aiAudience.trim() || !aiGoal.trim()) {
      setError("Topic, audience, and goal are required.");
      return;
    }
    setError("");
    setAiGenerating(true);
    setAiCurriculum(null);
    try {
      const response = await fetch("/api/courses/generate-ai-structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          audience: aiAudience.trim(),
          level: aiLevel,
          duration: aiDuration,
          goal: aiGoal.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === "NO_CREDITS") {
          setError("No AI credits remaining. Please contact support.");
        } else {
          setError(data.error || "Failed to generate course.");
        }
        return;
      }
      setAiCurriculum(data.curriculum);
      setAiCredits(data.creditsRemaining);
      setAiEditableTitle(data.curriculum.title);
      setAiEditableDescription(data.curriculum.description);
      setAiEditMode(false);
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  }, [aiTopic, aiAudience, aiLevel, aiDuration, aiGoal]);

  const handleRegenerateAI = useCallback(() => {
    setAiCurriculum(null);
    handleGenerateAI();
  }, [handleGenerateAI]);

  const handleApproveAI = useCallback(async () => {
    if (!aiCurriculum) return;
    setAiApproving(true);
    try {
      const curriculum = { ...aiCurriculum, title: aiEditableTitle, description: aiEditableDescription };
      const response = await fetch("/api/courses/generate-ai-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculum, communityId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to create course.");
        return;
      }
      setAiCredits(data.creditsRemaining);
      // Build draft and hand off to CourseBuilderStudio
      const draft: CourseDraft = {
        id: data.course.id,
        communityId,
        name: curriculum.title,
        slug: curriculum.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: curriculum.description,
        coverUrl: "",
        category: "AI Generated",
        modules: curriculum.modules.map((m: any, mi: number) => ({
          id: `mod-${Date.now()}-${mi}`,
          title: m.title,
          index: mi,
          lessons: (m.lessons || []).map((l: any, li: number) => ({
            id: `lesson-${Date.now()}-${mi}-${li}`,
            title: l.title,
            durationMinutes: l.durationMinutes || 15,
            contentType: "text" as const,
            blocks: [{ id: `block-${Date.now()}-${mi}-${li}`, type: "paragraph" as const, content: "Start writing lesson content here..." }],
            isLocked: false,
            status: "draft" as const,
          })),
        })),
        status: "draft" as const,
        price: 0,
        isFree: true,
        instructorName: "",
        instructorAvatar: "",
        enrolledCount: 0,
        completionRate: 0,
        revenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onComplete(draft);
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setAiApproving(false);
    }
  }, [aiCurriculum, aiEditableTitle, aiEditableDescription, communityId, onComplete]);

  // --- AI Curriculum Expansion handlers ---
  const handleAIAction = useCallback(async (action: string, moduleId?: string) => {
    setAiActionLoading(action);
    setAiGeneratedLessons(null);
    setAiSuggestions(null);
    setAiAnalysis(null);
    setAiMissingTopics(null);
    setAiShowResults(false);
    setError("");

    const courseName = name.trim() || "Untitled Course";
    const targetModule = moduleId ? modules.find(m => m.id === moduleId) : null;
    setAiActionTarget(targetModule?.title || courseName);

    try {
      let endpoint = "";
      let body: any = { courseTopic: courseName };

      if (action === "generate_lessons") {
        endpoint = "/api/courses/generate-lessons";
        body = { ...body, moduleTitle: targetModule?.title || "General", count: 5 };
      } else if (action === "expand_module") {
        endpoint = "/api/courses/expand-module";
        body = { ...body, moduleTitle: targetModule?.title || "General", existingLessons: targetModule?.lessons || [] };
      } else if (action === "improve") {
        endpoint = "/api/courses/improve-curriculum";
        body = { ...body, modules };
      } else if (action === "missing_topics") {
        endpoint = "/api/courses/add-missing-topics";
        body = { ...body, moduleTitles: modules.map(m => m.title) };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "AI action failed.");
        return;
      }

      if (action === "generate_lessons") {
        setAiGeneratedLessons(data.lessons || []);
        setSelectedGeneratedLessons(new Set((data.lessons || []).map((_: any, i: number) => i)));
        setAiResultsTitle(`Generated Lessons for "${targetModule?.title || courseName}"`);
        setAiShowResults(true);
      } else if (action === "expand_module") {
        setAiSuggestions(data.suggestions || []);
        setSelectedGeneratedLessons(new Set((data.suggestions || []).map((_: any, i: number) => i)));
        setAiResultsTitle(`Expansion Suggestions for "${targetModule?.title || courseName}"`);
        setAiShowResults(true);
      } else if (action === "improve") {
        setAiAnalysis(data);
        setAiResultsTitle("Curriculum Analysis");
        setAiShowResults(true);
      } else if (action === "missing_topics") {
        setAiMissingTopics(data.topics || []);
        setSelectedGeneratedLessons(new Set((data.topics || []).map((_: any, i: number) => i)));
        setAiResultsTitle("Suggested Missing Topics");
        setAiShowResults(true);
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setAiActionLoading(null);
    }
  }, [name, modules]);

  const handleAcceptGenerated = useCallback(async (action: string, moduleId?: string) => {
    setAiApproving(true);
    try {
      if (action === "generate_lessons" && aiGeneratedLessons && moduleId) {
        const checkedLessons = aiGeneratedLessons.filter((_, i) => selectedGeneratedLessons.has(i));
        if (checkedLessons.length === 0) { setError("Select at least one lesson."); setAiApproving(false); return; }
        await fetch("/api/courses/accept-ai-lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: "draft", moduleId, lessons: checkedLessons, action }),
        });
        const mod = modules.find(m => m.id === moduleId);
        if (mod) {
          const newLessons = checkedLessons.map((l: any, i: number) => ({
            id: `draft-lesson-${Date.now()}-${i}`,
            title: l.title,
            durationMinutes: l.durationMinutes || 10,
            contentType: "text" as const,
            blocks: [{ id: `block-${Date.now()}-${i}`, type: "paragraph" as const, content: "Start writing..." }],
            isLocked: false,
            status: "draft" as const,
          }));
          setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, ...newLessons] } : m));
        }
      } else if (action === "missing_topics" && aiMissingTopics) {
        const checkedTopics = aiMissingTopics.filter((_, i) => selectedGeneratedLessons.has(i));
        if (checkedTopics.length === 0) { setError("Select at least one topic."); setAiApproving(false); return; }
        await fetch("/api/courses/accept-ai-lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: "draft", moduleId: "new", lessons: checkedTopics, action }),
        });
        const newModules = checkedTopics.map((t: any, i: number) => ({
          id: `draft-mod-${Date.now()}-${i}`,
          title: t.title,
          index: modules.length + i,
          lessons: (t.lessons || []).map((l: any, li: number) => ({
            id: `draft-lesson-${Date.now()}-${i}-${li}`,
            title: l.title,
            durationMinutes: l.durationMinutes || 10,
            contentType: "text" as const,
            blocks: [{ id: `block-${Date.now()}-${i}-${li}`, type: "paragraph" as const, content: "Start writing..." }],
            isLocked: false,
            status: "draft" as const,
          })),
        }));
        setModules([...modules, ...newModules]);
      } else if (action === "expand_module" && aiSuggestions && moduleId) {
        const checked = aiSuggestions.filter((_, i) => selectedGeneratedLessons.has(i));
        if (checked.length === 0) { setError("Select at least one suggestion."); setAiApproving(false); return; }
        await fetch("/api/courses/accept-ai-lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: "draft", moduleId, lessons: checked, action }),
        });
        const mod = modules.find(m => m.id === moduleId);
        if (mod) {
          const newLessons = checked.map((s: any, i: number) => ({
            id: `draft-lesson-${Date.now()}-${i}`,
            title: s.title,
            durationMinutes: s.durationMinutes || 15,
            contentType: "text" as const,
            blocks: [{ id: `block-${Date.now()}-${i}`, type: "paragraph" as const, content: "Start writing..." }],
            isLocked: false,
            status: "draft" as const,
          }));
          setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, ...newLessons] } : m));
        }
      }
      setAiShowResults(false);
      setAiGeneratedLessons(null);
      setAiSuggestions(null);
      setAiMissingTopics(null);
      setAiAnalysis(null);
    } catch (e) {
      setError("Failed to accept. Please try again.");
    } finally {
      setAiApproving(false);
    }
  }, [aiGeneratedLessons, aiSuggestions, aiAnalysis, aiMissingTopics, selectedGeneratedLessons, modules]);

  const toggleGeneratedLesson = (index: number) => {
    setSelectedGeneratedLessons(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  // Close AI dropdown on outside click
  useEffect(() => {
    if (!aiDropdownModule) return;
    const handler = () => setAiDropdownModule(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [aiDropdownModule]);

  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { setError("Course name is required"); return; }
    setIsCreating(true);
    setError("");
    const draftId = `course-${Date.now()}`;
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          id: draftId,
          name: name.trim(),
          description: description.trim() || selectedTemplate?.description || "",
          coverUrl,
          category,
          modules: modules.map((m, mi) => ({
            id: m.id,
            title: m.title,
            index: mi,
            lessons: m.lessons.map((l, li) => ({
              id: l.id,
              title: l.title,
              durationMinutes: l.durationMinutes,
              contentType: l.contentType,
              videoUrl: l.videoUrl || "",
              textContent: l.textContent || "",
              index: li,
              isLocked: l.isLocked,
              attachments: l.attachments || [],
              quizQuestions: l.quizQuestions || [],
              assignmentInstructions: l.assignmentInstructions || "",
            })),
          })),
          price,
          status: publishAction,
          scheduledAt: publishAction === "scheduled" ? scheduledDate : null,
          certificateEnabled: certificate,
          estimatedHours: modules.reduce((acc, m) => acc + m.lessons.reduce((s, l) => s + l.durationMinutes, 0), 0) / 60,
          difficultyLevel: "beginner",
          tags: [],
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to create course.");
        setIsCreating(false);
        return;
      }
      const realId = data.course?.id || draftId;
      const draft: CourseDraft = {
        id: realId,
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
    } catch (e) {
      setError("Network error. Failed to create course.");
      setIsCreating(false);
    }
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
              <p className="text-xs text-gray-500">Step {step + 1} of {(creationMode === "ai" ? 4 : 6)} &mdash; {(creationMode === "ai" ? getSteps("ai") : getSteps(null))[step]}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 px-6 py-3 bg-gray-50 border-b border-gray-200 shrink-0 overflow-x-auto">
          {(creationMode === "ai" ? getSteps("ai") : getSteps(null)).map((s, i) => {
            const totalSteps = creationMode === "ai" ? 4 : 6;
            return (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 shrink-0 ${i <= step ? "text-gray-900" : "text-gray-400"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i < step ? "bg-gray-900 text-white" : i === step ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {i < step ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="text-[11px] font-medium whitespace-nowrap">{s}</span>
                </div>
                {i < totalSteps - 1 && <div className={`flex-1 h-px mx-2 min-w-[12px] ${i < step ? "bg-gray-900" : "bg-gray-200"}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Template Selection or AI Creation */}
          {step === 0 && !creationMode && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">How would you like to start?</h3>
              <p className="text-sm text-gray-500 mb-6">Choose a creation method to build your course</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setCreationMode("manual")}
                  className="relative flex flex-col items-center text-center p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <PenSquare className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="font-semibold text-gray-900 text-lg mb-2">Create Manually</div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Start from scratch or use a pre-built template to build your course step by step.
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Full control over every detail</span>
                  </div>
                </button>

                <button
                  onClick={() => setCreationMode("ai")}
                  className="relative flex flex-col items-center text-center p-8 rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-lg">
                    <Wand2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="font-semibold text-gray-900 text-lg mb-2">Create With AI</div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Describe your course and let AI generate a complete structure with modules and lessons.
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-amber-600">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Uses 1 AI credit per course</span>
                  </div>
                </button>
              </div>

              {/* Templates section - only visible when Manual is selected */}
              {creationMode === "manual" && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 mt-6">Or start with a template</h3>
                  <p className="text-sm text-gray-500 mb-5">Pre-built course structures to accelerate creation</p>
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
            </div>
          )}

          {/* Step 0: Manual mode - template selection */}
          {step === 0 && creationMode === "manual" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Choose a Template</h3>
              <p className="text-sm text-gray-500 mb-5">Start with a pre-built structure or a blank canvas</p>
              <button onClick={() => { setCreationMode(null); setSelectedTemplate(null); }} className="text-xs text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-1">
                <ChevronLeft className="w-3 h-3" /> Back to creation mode
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => { setCreationMode(null); handleSelectTemplate(courseTemplates[0]); }}
                  className="relative flex flex-col items-center text-center p-5 rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">Blank Course</div>
                  <p className="text-[11px] text-gray-500">Start from scratch with zero structure</p>
                </button>
                {courseTemplates.slice(1).map((t) => {
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
                        <span>{t.moduleCount} modules</span>
                        <span>&middot;</span>
                        <span>{t.lessonCount} lessons</span>
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

          {/* AI Step: Input Form */}
          {step === 0 && creationMode === "ai" && (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Describe Your Course</h3>
                  <p className="text-xs text-gray-500">AI will generate a complete course structure based on your inputs</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-700">
                  <Zap className="w-3.5 h-3.5" />
                  Costs 1 AI credit
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                    Course Topic *
                  </label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. WordPress SEO, React for Beginners, Digital Marketing..."
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateAI()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    Target Audience *
                  </label>
                  <input
                    type="text"
                    value={aiAudience}
                    onChange={(e) => setAiAudience(e.target.value)}
                    placeholder="e.g. Beginners, Developers, Marketers..."
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                    Skill Level
                  </label>
                  <select
                    value={aiLevel}
                    onChange={(e) => setAiLevel(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
                  >
                    {skillLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-indigo-500" />
                    Duration
                  </label>
                  <select
                    value={aiDuration}
                    onChange={(e) => setAiDuration(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
                  >
                    {durations.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                    Learning Goal *
                  </label>
                  <textarea
                    value={aiGoal}
                    onChange={(e) => setAiGoal(e.target.value)}
                    placeholder="e.g. Rank Websites on Google, Build a complete React app, Launch a successful marketing campaign..."
                    rows={2}
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleGenerateAI}
                  disabled={aiGenerating || !aiTopic.trim() || !aiAudience.trim() || !aiGoal.trim()}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Course Structure...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Course
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* AI Step: Review Generated Structure */}
          {step === 0 && creationMode === "ai" && aiCurriculum && !aiGenerating && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Generated Course Structure</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRegenerateAI}
                    disabled={aiGenerating}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${aiGenerating ? "animate-spin" : ""}`} />
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Edit mode toggle */}
              {aiEditMode ? (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Course Title</label>
                    <input
                      type="text"
                      value={aiEditableTitle}
                      onChange={(e) => setAiEditableTitle(e.target.value)}
                      className="w-full px-4 py-3 text-lg font-bold text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={aiEditableDescription}
                      onChange={(e) => setAiEditableDescription(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 text-sm text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none resize-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{aiCurriculum.title}</h2>
                  <p className="text-sm text-gray-600 mb-4">{aiCurriculum.description}</p>
                </>
              )}

              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setAiEditMode(!aiEditMode)}
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  {aiEditMode ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  {aiEditMode ? "Done Editing" : "Edit"}
                </button>
              </div>

              {/* Learning Outcomes */}
              {aiCurriculum.learningOutcomes && aiCurriculum.learningOutcomes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Learning Outcomes</h4>
                  </div>
                  <div className="space-y-1.5">
                    {aiCurriculum.learningOutcomes.map((o: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-gray-700">{o}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Module Structure */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Course Structure &mdash; {aiCurriculum.modules?.length || 0} modules, {(aiCurriculum.modules || []).reduce((s: number, m: any) => s + (m.lessons?.length || 0), 0)} lessons
                  </h4>
                </div>
                <div className="space-y-2">
                  {(aiCurriculum.modules || []).map((mod: any, mi: number) => (
                    <div key={mi} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {mi + 1}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{mod.title}</span>
                        <span className="text-[10px] text-gray-400 ml-auto">{mod.lessons?.length || 0} lessons</span>
                      </div>
                      {mod.description && (
                        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-50">{mod.description}</div>
                      )}
                      {(mod.lessons || []).map((lesson: any, li: number) => (
                        <div key={li} className="flex items-center gap-2 px-4 py-2 ml-3 border-l-2 border-gray-100">
                          <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[9px] font-medium text-gray-500 shrink-0">
                            {li + 1}
                          </div>
                          <span className="text-xs text-gray-700">{lesson.title}</span>
                          <span className="text-[10px] text-gray-400 ml-auto">{lesson.durationMinutes}m</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Credits remaining */}
              <div className="mt-6 flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-amber-800">
                  <Zap className="w-4 h-4" />
                  <span>You have <strong>{aiCredits} AI credits</strong> remaining</span>
                </div>
                <button
                  onClick={handleApproveAI}
                  disabled={aiApproving}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-lg disabled:opacity-50"
                >
                  {aiApproving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {aiApproving ? "Creating Course..." : "Approve & Create Course"}
                </button>
              </div>
            </div>
          )}

          {/* AI Curriculum Expansion Results Panel */}
          {aiShowResults && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 pb-8 bg-black/40 backdrop-blur-sm" onClick={() => setAiShowResults(false)}>
              <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    {aiResultsTitle}
                  </h3>
                  <button onClick={() => setAiShowResults(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                  {/* Analysis view (improve curriculum) */}
                  {aiAnalysis && !aiAnalysis.suggestions && (
                    <div className="space-y-4">
                      {aiAnalysis.strengths && (
                        <div>
                          <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {aiAnalysis.strengths.map((s: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiAnalysis.weaknesses && (
                        <div>
                          <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Areas to Improve</h4>
                          <ul className="space-y-1">
                            {aiAnalysis.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <PenSquare className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /> {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiAnalysis.gaps && (
                        <div>
                          <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">Gaps</h4>
                          <ul className="space-y-1">
                            {aiAnalysis.gaps.map((g: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Checklist items (lessons, suggestions, topics) */}
                  {(aiGeneratedLessons || aiSuggestions || aiMissingTopics) && (
                    <div className="space-y-2">
                      {(aiGeneratedLessons || aiSuggestions || aiMissingTopics || []).map((item: any, i: number) => (
                        <label key={i} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          selectedGeneratedLessons.has(i) ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                        }`}>
                          <input
                            type="checkbox"
                            checked={selectedGeneratedLessons.has(i)}
                            onChange={() => toggleGeneratedLesson(i)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            {item.description && <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>}
                            {item.durationMinutes && <div className="text-[10px] text-gray-400 mt-1">{item.durationMinutes} min</div>}
                            {item.lessons && item.lessons.length > 0 && (
                              <div className="mt-1.5 space-y-0.5">
                                {item.lessons.map((l: any, li: number) => (
                                  <div key={li} className="text-[11px] text-gray-500 flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                    {l.title} <span className="text-gray-300">·</span> {l.durationMinutes || 10}m
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {(aiGeneratedLessons || aiSuggestions || aiMissingTopics) && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
                    <span className="text-xs text-gray-500">
                      {Array.from(selectedGeneratedLessons).length} of {(aiGeneratedLessons || aiSuggestions || aiMissingTopics || []).length} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAiShowResults(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const modId = selectedModuleId || (modules[0]?.id);
                          if (!modId) return;
                          if (aiGeneratedLessons) handleAcceptGenerated("generate_lessons", modId);
                          else if (aiSuggestions) handleAcceptGenerated("expand_module", modId);
                          else if (aiMissingTopics) handleAcceptGenerated("missing_topics");
                        }}
                        disabled={aiApproving || selectedGeneratedLessons.size === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {aiApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {aiApproving ? "Applying..." : `Accept (${Array.from(selectedGeneratedLessons).length})`}
                      </button>
                    </div>
                  </div>
                )}
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

          {/* Step 2: Curriculum Builder (Manual) / Settings (AI) */}
          {step === 2 && creationMode !== "ai" && (
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
                          <div className="relative">
                            <button onClick={() => setAiDropdownModule(aiDropdownModule === mod.id ? null : mod.id)} className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="AI actions">
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            {aiDropdownModule === mod.id && (
                              <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 text-xs" onMouseDown={(e) => e.preventDefault()}>
                                <button onClick={() => { setAiDropdownModule(null); handleAIAction("generate_lessons", mod.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-indigo-50">
                                  <Wand2 className="w-3.5 h-3.5 text-indigo-500" /> Generate Lessons
                                </button>
                                <button onClick={() => { setAiDropdownModule(null); handleAIAction("expand_module", mod.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-indigo-50">
                                  <Lightbulb className="w-3.5 h-3.5 text-indigo-500" /> Expand Module
                                </button>
                              </div>
                            )}
                          </div>
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
                <div className="w-64 shrink-0 space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Modules</span><span className="font-medium">{modules.length}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Lessons</span><span className="font-medium">{totalLessons}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-medium">{totalDuration} min</span></div>
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> AI Tools
                    </h4>
                    <p className="text-[11px] text-indigo-600/70 leading-relaxed">Use AI to expand and improve your curriculum</p>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => { const m = modules.find(mod => mod.id === selectedModuleId) || modules[0]; if (m) handleAIAction("generate_lessons", m.id); }}
                        disabled={aiActionLoading !== null || modules.length === 0}
                        className="w-full flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {aiActionLoading === "generate_lessons" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        Generate Lessons
                      </button>
                      <button
                        onClick={() => { const m = modules.find(mod => mod.id === selectedModuleId) || modules[0]; if (m) handleAIAction("expand_module", m.id); }}
                        disabled={aiActionLoading !== null || modules.length === 0}
                        className="w-full flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {aiActionLoading === "expand_module" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
                        Expand Module
                      </button>
                      <button
                        onClick={() => handleAIAction("improve")}
                        disabled={aiActionLoading !== null}
                        className="w-full flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {aiActionLoading === "improve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenSquare className="w-3.5 h-3.5" />}
                        Improve Curriculum
                      </button>
                      <button
                        onClick={() => handleAIAction("missing_topics")}
                        disabled={aiActionLoading !== null}
                        className="w-full flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {aiActionLoading === "missing_topics" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        Add Missing Topics
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Lesson Builder (Manual) / Publish (AI) */}
          {step === 3 && creationMode !== "ai" && (
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

          {/* Step 4: Course Settings (Manual) / or AI Step 2 */}
          {(step === 4 && creationMode !== "ai") || (step === 2 && creationMode === "ai") && (
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

          {/* Step 5: Publish (Manual) / or AI Step 3 */}
          {(step === 5 && creationMode !== "ai") || (step === 3 && creationMode === "ai") && (
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
            onClick={() => {
              if (creationMode === "ai" && step === 0 && (aiCurriculum || !aiGenerating)) {
                setCreationMode(null);
                setAiCurriculum(null);
                setError("");
              } else if (step > 0) {
                setStep(step - 1);
              } else {
                onCancel();
              }
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? (creationMode ? "Back to options" : "Cancel") : "Back"}
          </button>
          <div className="flex items-center gap-2">
            {/* AI mode step navigation */}
            {creationMode === "ai" ? (
              <>
                {step < 3 && (
                  <button
                    onClick={() => {
                      if (step === 0) {
                        // From AI step, need to have approved first
                        if (!aiCurriculum) return;
                        // Auto-pass through to Details
                      }
                      if (step === 1 && !name.trim()) { setError("Course name is required"); return; }
                      setError("");
                      setStep(step + 1);
                    }}
                    disabled={step === 0 && !aiCurriculum}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: {(creationMode === "ai" ? getSteps("ai") : getSteps(null))[step + 1]}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {step === 3 && (
                  <button
                    onClick={step === 0 && aiCurriculum ? () => setStep(1) : handleCreate}
                    disabled={isCreating}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isCreating ? "Creating..." : publishAction === "draft" ? "Save Draft" : publishAction === "published" ? "Publish Course" : publishAction === "scheduled" ? "Schedule Course" : "Archive Course"}
                  </button>
                )}
              </>
            ) : (
              <>
                {step < 5 && (
                  <button
                    onClick={() => {
                      if (step === 1 && !name.trim()) { setError("Course name is required"); return; }
                      setError("");
                      setStep(step + 1);
                    }}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Next: {getSteps(null)[step + 1]}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {step === 5 && (
                  <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isCreating ? "Creating..." : publishAction === "draft" ? "Save Draft" : publishAction === "published" ? "Publish Course" : publishAction === "scheduled" ? "Schedule Course" : "Archive Course"}
                  </button>
                )}
              </>
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