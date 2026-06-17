import React, { useState, useEffect } from "react";
import { Course, Lesson, Comment, CourseStatus, CourseType, DifficultyLevel } from "../types";
import { 
  BookOpen, PlayCircle, CheckCircle, Lock, Download, Sparkles, Send, Box, ChevronRight, 
  GraduationCap, CreditCard, ShieldCheck, HelpCircle, Award, Flame, ClipboardList, PenTool, FileText, RefreshCw, X, ArrowUp, ArrowDown, Trash2, Plus
} from "lucide-react";
import CourseBuilder from "./course/CourseBuilder";

interface ClassroomViewProps {
  currentUser: any;
  activeCommunity: any;
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onRefreshCourses: () => void;
  isCourseBuilderOnly?: boolean;
  isAnalyticsOnly?: boolean;
}

export default function ClassroomView({
  currentUser,
  activeCommunity,
  courses,
  onAddCourse,
  onRefreshCourses,
  isCourseBuilderOnly = false,
  isAnalyticsOnly = false
}: ClassroomViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeNotes, setActiveNotes] = useState("");

  // Determine user context roles
  const pfRole = currentUser?.platformRole || "user";
  const wsRole = pfRole === "super_admin" 
    ? "owner" 
    : (currentUser?.workspaceRoles?.[activeCommunity?.id || ""] || "member");

  const hasStaffOverride = pfRole === "super_admin" || pfRole === "support_staff" || wsRole === "owner" || wsRole === "admin";
  const canCreateCourse = wsRole === "owner" || wsRole === "admin" || pfRole === "super_admin";

  // Auto-select first course when component is mounted (skip if in standalone builder/analytics)
  useEffect(() => {
    if (isCourseBuilderOnly || isAnalyticsOnly) return;
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]);
      if (courses[0].modules?.[0]?.lessons?.[0]) {
        setActiveLesson(courses[0].modules[0].lessons[0]);
      }
    }
  }, [courses, selectedCourse, isCourseBuilderOnly, isAnalyticsOnly]);

  // Load notes dynamically for selected user & lesson
  useEffect(() => {
    if (currentUser?.id && activeLesson?.id) {
      const saved = localStorage.getItem(`/classroom/notes/${currentUser.id}/${activeLesson.id}`);
      setActiveNotes(saved || "");
    } else {
      setActiveNotes("");
    }
  }, [currentUser, activeLesson]);

  const handleSaveNotes = (text: string) => {
    setActiveNotes(text);
    if (currentUser?.id && activeLesson?.id) {
      localStorage.setItem(`/classroom/notes/${currentUser.id}/${activeLesson.id}`, text);
    }
  };

  // Subscription Checking & Loaded details
  const [hasSubscribedLocal, setHasSubscribedLocal] = useState(false);
  const [subStatus, setSubStatus] = useState<any>(null);
  const [activeLessonDetails, setActiveLessonDetails] = useState<Lesson | null>(null);
  const [lessonFetchError, setLessonFetchError] = useState<string|null>(null);
  const [isFetchingLesson, setIsFetchingLesson] = useState(false);

  // Lesson Comments/Discussions states
  const [lessonComments, setLessonComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);

  // Quiz interactive states
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Assignment interactive states
  const [assignmentText, setAssignmentText] = useState("");
  const [assignmentFile, setAssignmentFile] = useState("saas_database_eviction_v1.pdf");
  const [assignmentSubmission, setAssignmentSubmission] = useState<any>(null);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);

  // Gamification overlay states
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [lastLeveledUp, setLastLeveledUp] = useState<number | null>(null);
  const [showLevelUpAlert, setShowLevelUpAlert] = useState(false);

  // Classroom Tab states (Skool dashboard vs specific course selection lists)
  const [classroomTab, setClassroomTab] = useState<"dashboard" | "courses">("dashboard");
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  // Reply and Like states for lesson discussion threads
  const [activeReplyInputId, setActiveReplyInputId] = useState<string | null>(null);
  const [commentReplyText, setCommentReplyText] = useState<Record<string, string>>({});
  const [commentReplies, setCommentReplies] = useState<Record<string, { id: string; authorName: string; authorAvatar: string; content: string; createdAt: string; }[]>>({
    "comm_preset_1": [
      {
        id: "rep_preset_1",
        authorName: "Sarah Connor (Instructor)",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
        content: "Make sure you read through the handouts to fully understand the MCQ tests!",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  });
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});
  const [likedComments, setLikedComments] = useState<string[]>([]);
  
  // Local Course overrides/state for Creator builder
  const [localCourses, setLocalCourses] = useState<Course[]>(() => courses || []);
  useEffect(() => {
    setLocalCourses(courses);
  }, [courses]);

  // Creator Hub active view controllers
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [creatorTab, setCreatorTab] = useState<"analytics" | "builder" | "activity" | "community">("analytics");
  
  // Selected course for editing in Course Builder
  const [selectedBuilderCourse, setSelectedBuilderCourse] = useState<Course | null>(null);
  const [builderSelectedLesson, setBuilderSelectedLesson] = useState<Lesson | null>(null);
  const [lessonEditTitle, setLessonEditTitle] = useState("");
  const [lessonEditDuration, setLessonEditDuration] = useState(15);
  const [lessonEditVideoUrl, setLessonEditVideoUrl] = useState("");
  const [lessonEditPlaybook, setLessonEditPlaybook] = useState("");
  const [lessonEditType, setLessonEditType] = useState<"video" | "text" | "download" | "quiz" | "assignment">("video");
  const [lessonEditInstructions, setLessonEditInstructions] = useState("");
  const [quizEditQuestions, setQuizEditQuestions] = useState<any[]>([]);
  const [attachmentsList, setAttachmentsList] = useState<string[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState("");

  // Standalone course-builder tab sync
  useEffect(() => {
    if (isCourseBuilderOnly) {
      setIsCreatorMode(true);
      setCreatorTab("builder");
      if (!selectedBuilderCourse && localCourses.length > 0) {
        setSelectedBuilderCourse(localCourses[0]);
      }
    }
  }, [isCourseBuilderOnly, localCourses, selectedBuilderCourse]);

  // Standalone analytics tab sync
  useEffect(() => {
    if (isAnalyticsOnly) {
      setIsCreatorMode(true);
      setCreatorTab("analytics");
    }
  }, [isAnalyticsOnly]);
  
  // New Course Creator states
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseCover, setNewCourseCover] = useState("");
  const [newCoursePremium, setNewCoursePremium] = useState(false);
  const [newCourseType, setNewCourseType] = useState<CourseType>("flagship");
  const [newCourseDifficulty, setNewCourseDifficulty] = useState<DifficultyLevel>("beginner");
  const [newCoursePrice, setNewCoursePrice] = useState(0);
  const [newCourseCategory, setNewCourseCategory] = useState("");

  // Course status tracking - uses real course.status from API
  const handleToggleCourseStatus = async (courseId: string, newStatus: CourseStatus) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefreshCourses();
      }
    } catch (err) {
      console.error("Failed to toggle course status:", err);
    }
  };

  // Get display-friendly status label
  const getStatusLabel = (status?: CourseStatus): string => {
    switch (status) {
      case "published": return "Published";
      case "draft": return "Draft";
      case "scheduled": return "Scheduled";
      case "archived": return "Archived";
      default: return "Draft";
    }
  };

  // Get status badge color
  const getStatusColor = (status?: CourseStatus): string => {
    switch (status) {
      case "published": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "draft": return "bg-slate-50 text-slate-600 border-slate-200";
      case "scheduled": return "bg-amber-50 text-amber-700 border-amber-200";
      case "archived": return "bg-red-50 text-red-600 border-red-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // Get course type display label
  const getCourseTypeLabel = (type?: CourseType): string => {
    switch (type) {
      case "mini_course": return "Mini Course";
      case "flagship": return "Flagship";
      case "workshop": return "Workshop";
      case "membership": return "Membership";
      case "coaching": return "Coaching";
      case "challenge": return "Challenge";
      default: return "Flagship";
    }
  };

  // Get difficulty level color
  const getDifficultyColor = (level?: DifficultyLevel): string => {
    switch (level) {
      case "beginner": return "bg-emerald-50 text-emerald-700";
      case "intermediate": return "bg-amber-50 text-amber-700";
      case "advanced": return "bg-red-50 text-red-600";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  // Gutenberg Block Definition
  interface EditorBlock {
    id: string;
    type: "h1" | "h2" | "p" | "code" | "callout" | "bullet" | "divider" | "image";
    content: string;
  }

  const [editorBlocks, setEditorBlocks] = useState<EditorBlock[]>([]);
  const [lastLoadedLessonId, setLastLoadedLessonId] = useState<string | null>(null);

  // Synchronize active lesson to editor blocks upon selection
  useEffect(() => {
    if (builderSelectedLesson) {
      if (builderSelectedLesson.id !== lastLoadedLessonId) {
        setLastLoadedLessonId(builderSelectedLesson.id);
        const rawText = builderSelectedLesson.textContent || "";
        const lines = rawText.split("\n\n");
        const blocks: EditorBlock[] = [];
        
        lines.forEach(blockText => {
          const trimmed = blockText.trim();
          if (!trimmed) return;
          
          if (trimmed.startsWith("## ")) {
            blocks.push({ id: Math.random().toString(36).substring(2, 9), type: "h2", content: trimmed.substring(3).trim() });
          } else if (trimmed.startsWith("# ")) {
            blocks.push({ id: Math.random().toString(36).substring(2, 9), type: "h1", content: trimmed.substring(2).trim() });
          } else if (trimmed.startsWith("> ")) {
            blocks.push({ id: Math.random().toString(36).substring(2, 9), type: "callout", content: trimmed.substring(2).trim() });
          } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            blocks.push({ id: Math.random().toString(36).substring(2, 9), type: "bullet", content: trimmed.substring(2).trim() });
          } else if (trimmed.startsWith("```")) {
            const codeClean = trimmed.replace(/```[a-zA-Z]*/g, "").trim();
            blocks.push({ id: Math.random().toString(36).substring(2, 9), type: "code", content: codeClean });
          } else if (trimmed === "---") {
            blocks.push({ id: Math.random().toString(36).substring(2, 9), type: "divider", content: "" });
          } else if (trimmed.startsWith("![") && trimmed.includes("](") && trimmed.endsWith(")")) {
            const url = trimmed.split("](")[1].slice(0, -1);
            blocks.push({ id: Math.random().toString(36).substring(2, 9), type: "image", content: url });
          } else {
            blocks.push({ id: Math.random().toString(36).substring(2, 9), type: "p", content: trimmed });
          }
        });
        
        if (blocks.length === 0) {
          blocks.push({ id: Math.random().toString(36).substring(2, 9), type: "p", content: rawText });
        }
        setEditorBlocks(blocks);
      }
    } else {
      setLastLoadedLessonId(null);
      setEditorBlocks([]);
    }
  }, [builderSelectedLesson, lastLoadedLessonId]);

  const updateEditorBlocksAndSave = (newBlocks: EditorBlock[]) => {
    setEditorBlocks(newBlocks);
    
    // serialize to markdown
    const md = newBlocks.map(b => {
      switch (b.type) {
        case "h1": return `# ${b.content}`;
        case "h2": return `## ${b.content}`;
        case "callout": return `> ${b.content}`;
        case "bullet": return `- ${b.content}`;
        case "code": return `\`\`\`\n${b.content}\n\`\`\``;
        case "divider": return "---";
        case "image": return `![Image](${b.content})`;
        default: return b.content;
      }
    }).join("\n\n");
    
    setLessonEditPlaybook(md);
    
    // Propagate change into the active course structure directly
    if (selectedBuilderCourse && builderSelectedLesson) {
      const updatedModules = selectedBuilderCourse.modules.map(mod => {
        if (mod.id !== builderSelectedLesson.moduleId) return mod;
        return {
          ...mod,
          lessons: mod.lessons.map(l => {
            if (l.id !== builderSelectedLesson.id) return l;
            return {
              ...l,
              textContent: md
            };
          })
        };
      });
      const updatedCourse = { ...selectedBuilderCourse, modules: updatedModules };
      setSelectedBuilderCourse(updatedCourse);
      setLocalCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    }
  };

  // Community discussion flags
  const [pinnedComments, setPinnedComments] = useState<string[]>(["comm_preset_1"]);
  const [featuredComments, setFeaturedComments] = useState<string[]>([]);
  
  // Analytics sample datasets (fully responsive & mutable)
  const [completionRates, setCompletionRates] = useState([
    { courseName: "SaaS Multi-Tenant Mastery", completionRate: 85, enrolled: 124 },
    { courseName: "Workspace Sandbox Security", completionRate: 64, enrolled: 885 },
    { courseName: "High Ingress SQL Optimization", completionRate: 42, enrolled: 450 }
  ]);
  
  const [lessonViewsAnalytics, setLessonViewsAnalytics] = useState([
    { id: "l_an1", lessonTitle: "Intro to Container Isolation", views: 245, watchTimeHours: 122, dropOffPercent: 5 },
    { id: "l_an2", lessonTitle: "Configuring nginx Reverse Proxy", views: 189, watchTimeHours: 94, dropOffPercent: 12 },
    { id: "l_an3", lessonTitle: "Stripe API Key Server Proximity", views: 144, watchTimeHours: 72, dropOffPercent: 28 },
    { id: "l_an4", lessonTitle: "Preventing Memory Leaks in TS", views: 98, watchTimeHours: 49, dropOffPercent: 44 },
    { id: "l_an5", lessonTitle: "Handling Multi-Tenant Row Security", views: 67, watchTimeHours: 33, dropOffPercent: 62 }
  ]);

  const [studentActivities, setStudentActivities] = useState([
    { id: "act_1", studentName: "Lincoln Flores", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80", action: "completed lesson", target: "Intro to Container Isolation", time: "10 minutes ago" },
    { id: "act_2", studentName: "Michael Vance", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80", action: "submitted assignment for", target: "Stripe API Key Server Proximity", time: "1 hour ago" },
    { id: "act_3", studentName: "Elise Montgomery", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80", action: "enrolled in", target: "High Ingress SQL Optimization", time: "3 hours ago" },
    { id: "act_4", studentName: "Aris Thorne", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80", action: "completed quiz in", target: "Workspace Sandbox Security", time: "5 hours ago" }
  ]);
  
  // RSVPs and live broadcasting lists
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});
  const [liveSessions, setLiveSessions] = useState([
    {
      id: "live_1",
      title: "🔥 Weekly SaaS Architecture AMA & Co-Working Hour",
      host: "Alex Rivera",
      date: "Today at 7:00 PM (UTC)",
      desc: "Live code walkthrough & questions about workspace sandboxes or OAuth popups.",
      attendees: 18,
      isLiveSoon: true
    },
    {
      id: "live_2",
      title: "💡 Database Tuning & High Ingress Performance Labs",
      host: "Sarah Connor",
      date: "June 2, 2026",
      desc: "Learn to handle huge scale spikes & avoid memory leaks in express servers.",
      attendees: 31,
      isLiveSoon: false
    }
  ]);

  // ==============================================================================
  // COURSE BUILDER CONTROLLERS & ACTIONS (SCOPEABLE IN MODULE BODY)
  // ==============================================================================
  const handleMoveLessonLocal = (moduleId: string, lessonIndex: number, direction: "up" | "down") => {
    if (!selectedBuilderCourse) return;
    const updatedModules = selectedBuilderCourse.modules.map(mod => {
      if (mod.id !== moduleId) return mod;
      const reordered = [...mod.lessons];
      const swapIdx = direction === "up" ? lessonIndex - 1 : lessonIndex + 1;
      if (swapIdx < 0 || swapIdx >= reordered.length) return mod;
      // swap
      const temp = reordered[lessonIndex];
      reordered[lessonIndex] = reordered[swapIdx];
      reordered[swapIdx] = temp;
      // update indices and keys
      return {
        ...mod,
        lessons: reordered.map((l, i) => ({ ...l, index: i }))
      };
    });
    const updatedCourse = { ...selectedBuilderCourse, modules: updatedModules };
    setSelectedBuilderCourse(updatedCourse);
    setLocalCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const handleAddLessonLocal = (moduleId: string) => {
    if (!selectedBuilderCourse) return;
    const newLessonId = "les_new_" + Math.random().toString(36).substring(2, 7);
    const updatedModules = selectedBuilderCourse.modules.map(mod => {
      if (mod.id !== moduleId) return mod;
      const newLesson: Lesson = {
        id: newLessonId,
        moduleId: mod.id,
        title: "New Draft Lecture " + (mod.lessons.length + 1),
        durationMinutes: 10,
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        textContent: "## Overview\nModify this lecture markdown with your personalized instructor content.",
        index: mod.lessons.length,
        isLocked: false,
        contentType: "video",
        attachments: [],
        quizQuestions: []
      };
      return { ...mod, lessons: [...mod.lessons, newLesson] };
    });
    const updatedCourse = { ...selectedBuilderCourse, modules: updatedModules };
    setSelectedBuilderCourse(updatedCourse);
    setLocalCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const handleDeleteLessonLocal = (moduleId: string, lessonId: string) => {
    if (!selectedBuilderCourse) return;
    const updatedModules = selectedBuilderCourse.modules.map(mod => {
      if (mod.id !== moduleId) return mod;
      const filtered = mod.lessons.filter(l => l.id !== lessonId);
      return {
        ...mod,
        lessons: filtered.map((l, i) => ({ ...l, index: i }))
      };
    });
    const updatedCourse = { ...selectedBuilderCourse, modules: updatedModules };
    setSelectedBuilderCourse(updatedCourse);
    setLocalCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    if (builderSelectedLesson?.id === lessonId) {
      setBuilderSelectedLesson(null);
    }
  };

  const handleAddModuleLocal = (title: string) => {
    if (!selectedBuilderCourse || !title.trim()) return;
    const newModId = "mod_new_" + Math.random().toString(36).substring(2, 7);
    const newMod = {
      id: newModId,
      courseId: selectedBuilderCourse.id,
      title: title.trim(),
      index: selectedBuilderCourse.modules.length,
      lessons: []
    };
    const updatedCourse = {
      ...selectedBuilderCourse,
      modules: [...selectedBuilderCourse.modules, newMod]
    };
    setSelectedBuilderCourse(updatedCourse);
    setLocalCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const handleSaveLessonDeepEdits = () => {
    if (!selectedBuilderCourse || !builderSelectedLesson) return;
    const updatedModules = selectedBuilderCourse.modules.map(mod => {
      if (mod.id !== builderSelectedLesson.moduleId) return mod;
      const updatedLessons = mod.lessons.map(l => {
        if (l.id !== builderSelectedLesson.id) return l;
        return {
          ...l,
          title: lessonEditTitle,
          durationMinutes: lessonEditDuration,
          videoUrl: lessonEditVideoUrl,
          textContent: lessonEditPlaybook,
          contentType: lessonEditType,
          assignmentInstructions: lessonEditInstructions,
          quizQuestions: quizEditQuestions,
          attachments: attachmentsList
        };
      });
      return { ...mod, lessons: updatedLessons };
    });
    const updatedCourse = { ...selectedBuilderCourse, modules: updatedModules };
    setSelectedBuilderCourse(updatedCourse);
    setLocalCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    if (selectedCourse?.id === updatedCourse.id) {
      setSelectedCourse(updatedCourse);
    }
  };

  const handleDeployNewCourse = (name: string, desc: string, cover: string, premium: boolean) => {
    if (!name.trim()) return;
    const newCourse: Course = {
      id: "crs_" + Math.random().toString(36).substring(2, 7),
      communityId: activeCommunity?.id || "comm_1",
      name: name.trim(),
      description: desc || "Instructor curated syllabus details.",
      coverUrl: cover || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80",
      isPremiumOnly: premium,
      modulesCount: 1,
      enrolledCount: 0,
      status: "draft",
      courseType: newCourseType,
      price: newCoursePrice,
      certificateEnabled: false,
      estimatedHours: 0,
      difficultyLevel: newCourseDifficulty,
      tags: [],
      category: newCourseCategory || undefined,
      creatorName: currentUser?.fullName,
      creatorAvatar: currentUser?.avatarUrl,
      modules: [
        {
          id: "mod_init_" + Math.random().toString(36).substring(2, 7),
          courseId: "crs_new",
          title: "Module 1: Getting Started",
          index: 0,
          isFreePreview: true,
          lessons: [
            {
              id: "les_init_" + Math.random().toString(36).substring(2, 7),
              moduleId: "mod_init",
              title: "Lecture 1: Welcome Orientation",
              durationMinutes: 5,
              videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
              textContent: "Modify this template playbook introduction.",
              index: 0,
              isLocked: false,
              isFreePreview: true,
              contentType: "video"
            }
          ]
        }
      ]
    };
    setLocalCourses(prev => [newCourse, ...prev]);
    setShowCreateCourseModal(false);
    setNewCourseName("");
    setNewCourseDesc("");
    setNewCourseCover("");
    setNewCoursePremium(false);
    setNewCourseType("flagship");
    setNewCourseDifficulty("beginner");
    setNewCoursePrice(0);
    setNewCourseCategory("");
    setSelectedBuilderCourse(newCourse);
    onAddCourse(newCourse);
  };

  // Payments checking effects
  useEffect(() => {
    if (!activeCommunity?.id) return;
    async function checkSubscription() {
      try {
        const res = await fetch(`/api/communities/${activeCommunity.id}/subscription-status`);
        const data = await res.json();
        setSubStatus(data);
        setHasSubscribedLocal(data.subscribed === true);
      } catch (err) {
        console.error("Subscription verify telemetry failed", err);
      }
    }
    checkSubscription();
  }, [activeCommunity, courses]);

  // Load completed list from user profile dynamically
  useEffect(() => {
    if (currentUser?.completedLessons) {
      setCompletedLessons(currentUser.completedLessons);
    }
  }, [currentUser]);

  // Fetch full details whenever the active lesson transitions
  useEffect(() => {
    if (!activeLesson) {
      setActiveLessonDetails(null);
      setLessonFetchError(null);
      return;
    }

    async function loadLessonDetails() {
      setIsFetchingLesson(true);
      setLessonFetchError(null);
      // Reset interactive submission states upon switching lesson
      setQuizSelectedAnswers({});
      setQuizSubmitted(false);
      setQuizResults(null);
      setAssignmentText("");
      setAssignmentSubmission(null);

      try {
        const res = await fetch(`/api/lessons/${activeLesson.id}`);
        if (!res.ok) {
          const errData = await res.json();
          setLessonFetchError(errData.error || "Access denied. Private syllabus item.");
          setActiveLessonDetails(null);
        } else {
          const data = await res.json();
          setActiveLessonDetails(data.lesson);

          // Trigger fetch for dedicated lesson comments
          fetchLessonComments(activeLesson.id);
        }
      } catch (err) {
        setLessonFetchError("Failed to authenticate connection with classroom streaming servers.");
        setActiveLessonDetails(null);
      } finally {
        setIsFetchingLesson(false);
      }
    }

    loadLessonDetails();
  }, [activeLesson]);

  // Helper: Calculate progress percentage of a course based on completed lessons
  const getCourseProgress = (course: Course) => {
    if (!course.modules) return 0;
    let total = 0;
    let completed = 0;
    course.modules.forEach(mod => {
      if (mod.lessons) {
        total += mod.lessons.length;
        mod.lessons.forEach(l => {
          if (completedLessons.includes(l.id)) {
            completed++;
          }
        });
      }
    });
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Helper: Find target core course and lesson for Continue Learning Home dashboard
  const getContinueLearningTarget = () => {
    if (localCourses.length === 0) return null;
    
    // Find course with some progress but not totally complete
    let targetCourse = localCourses.find(c => {
      const p = getCourseProgress(c);
      return p > 0 && p < 100;
    });
    
    // Or first incomplete course
    if (!targetCourse) {
      targetCourse = localCourses.find(c => getCourseProgress(c) < 100);
    }
    
    // Or fallback to first course
    if (!targetCourse) {
      targetCourse = localCourses[0];
    }
    
    let nextL: Lesson | null = null;
    if (targetCourse.modules) {
      for (const m of targetCourse.modules) {
        if (m.lessons) {
          for (const l of m.lessons) {
            if (!completedLessons.includes(l.id)) {
              nextL = l;
              break;
            }
          }
        }
        if (nextL) break;
      }
    }
    
    if (!nextL && targetCourse?.modules?.[0]?.lessons?.[0]) {
      nextL = targetCourse.modules[0].lessons[0];
    }
    
    return {
      course: targetCourse,
      nextLesson: nextL
    };
  };

  // Helpers for Next/Previous lesson queue navigation
  const getFlatLessons = () => {
    if (!selectedCourse?.modules) return [];
    const list: Lesson[] = [];
    selectedCourse.modules.forEach(mod => {
      if (mod.lessons) {
        list.push(...mod.lessons);
      }
    });
    return list;
  };

  const flatLessons = getFlatLessons();
  const activeIndex = flatLessons.findIndex(l => l.id === activeLesson?.id);
  const hasPrevLesson = activeIndex > 0;
  const hasNextLesson = activeIndex !== -1 && activeIndex < flatLessons.length - 1;

  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      setActiveLesson(flatLessons[activeIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      setActiveLesson(flatLessons[activeIndex + 1]);
    }
  };

  // Save active lesson view event into recently viewed JSON buffer
  useEffect(() => {
    if (activeLesson && currentUser?.id) {
      try {
        const storedStr = localStorage.getItem(`/classroom/recentlyViewed/${currentUser.id}`) || "[]";
        const stored = JSON.parse(storedStr);
        const filtered = stored.filter((item: any) => item.id !== activeLesson.id);
        filtered.unshift({
          id: activeLesson.id,
          title: activeLesson.title,
          courseId: selectedCourse?.id || "",
          courseName: selectedCourse?.name || "Active Course",
          viewedAt: new Date().toISOString()
        });
        localStorage.setItem(`/classroom/recentlyViewed/${currentUser.id}`, JSON.stringify(filtered.slice(0, 5)));
        setRecentlyViewed(filtered.slice(0, 5));
      } catch (err) {
        console.error("Local storage update error", err);
      }
    }
  }, [activeLesson, currentUser, selectedCourse]);

  // Load recently viewed cache upon student load
  useEffect(() => {
    if (currentUser?.id) {
      try {
        const stored = localStorage.getItem(`/classroom/recentlyViewed/${currentUser.id}`);
        if (stored) {
          setRecentlyViewed(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Recently viewed retrieve error", e);
      }
    }
  }, [currentUser]);

  // Fetch comments of a lesson
  const fetchLessonComments = async (lessonId: string) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setLessonComments(data.comments || []);
      }
    } catch (e) {
      console.error("Error loading chat stream", e);
    }
  };

  // Submit lesson specific comment
  const handlePostLessonComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeLesson) return;
    setIsSendingComment(true);

    try {
      const res = await fetch(`/api/lessons/${activeLesson.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newCommentText })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setLessonComments([...lessonComments, data.comment]);
          setNewCommentText("");
          // Play micro reward sound/action in client if possible
          if (currentUser) {
            currentUser.xp += 10; // Instantly reward locally to maintain visual loop
          }
        }
      }
    } catch (e) {
      console.error("Failed sending comment telemetry", e);
    } finally {
      setIsSendingComment(false);
    }
  };

  // Submit MCQ Quiz
  const handleQuizSubmit = async () => {
    if (!activeLessonDetails || isSubmittingQuiz) return;
    setIsSubmittingQuiz(true);

    // Map responses list
    const questions = activeLessonDetails.quizQuestions || [];
    const answers = questions.map((_, idx) => quizSelectedAnswers[idx] ?? -1);

    try {
      const res = await fetch(`/api/lessons/${activeLessonDetails.id}/quiz-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });

      if (res.ok) {
        const data = await res.json();
        setQuizResults(data);
        setQuizSubmitted(true);
        if (data.passed) {
          // Sync completion
          if (!completedLessons.includes(activeLessonDetails.id)) {
            setCompletedLessons([...completedLessons, activeLessonDetails.id]);
          }
          if (data.level > (currentUser?.level || 1)) {
            setLastLeveledUp(data.level);
            setShowLevelUpAlert(true);
          }
          if (currentUser) {
            currentUser.xp = data.xp;
            currentUser.level = data.level;
          }
        }
      }
    } catch (err) {
      console.error("Error submitting quiz", err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Submit project assignment
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLessonDetails || !assignmentText.trim() || isSubmittingAssignment) return;
    setIsSubmittingAssignment(true);

    try {
      const res = await fetch(`/api/lessons/${activeLessonDetails.id}/assignment-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionText: assignmentText,
          mockFileName: assignmentFile
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAssignmentSubmission(data.submission);
        if (!completedLessons.includes(activeLessonDetails.id)) {
          setCompletedLessons([...completedLessons, activeLessonDetails.id]);
        }
        if (data.level > (currentUser?.level || 1)) {
          setLastLeveledUp(data.level);
          setShowLevelUpAlert(true);
        }
        if (currentUser) {
          currentUser.xp = data.xp;
          currentUser.level = data.level;
        }
      }
    } catch (err) {
      console.error("Failed submitting workbook", err);
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  // Checkout Upgrade Premium Locks
  const [showCheckoutModal, setShowCheckoutModal] = useState<Course | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // AI course generator triggers
  const [aiProposalText, setAiProposalText] = useState("");
  const [isAiBuilding, setIsAiBuilding] = useState(false);

  // Manual course creator configurations
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualCover, setManualCover] = useState("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600");
  const [manualPremium, setManualPremium] = useState(false);
  const [manualCourseType, setManualCourseType] = useState<CourseType>("flagship");
  const [manualDifficulty, setManualDifficulty] = useState<DifficultyLevel>("beginner");
  const [manualPrice, setManualPrice] = useState(0);
  const [manualCategory, setManualCategory] = useState("");
  const [manualCertificateEnabled, setManualCertificateEnabled] = useState(false);
  const [manualEstimatedHours, setManualEstimatedHours] = useState(0);
  const [manualModules, setManualModules] = useState<Array<{
    title: string;
    description?: string;
    isFreePreview?: boolean;
    lessons: Array<{
      title: string;
      durationMinutes: number;
      textContent: string;
      videoUrl: string;
      attachments: string[];
      isLocked?: boolean;
      isFreePreview?: boolean;
      contentType: "video" | "text" | "download" | "quiz" | "assignment";
      quizQuestions?: Array<{ question: string; options: string[]; answerIndex: number }>;
      assignmentInstructions?: string;
      passingScore?: number;
    }>;
  }>>([
    {
      title: "Module 1: Fundamental Syntax Rules",
      description: "",
      isFreePreview: false,
      lessons: [
        { 
          title: "Intro Lecture Overview", 
          durationMinutes: 10, 
          textContent: "Welcome message introducing structural patterns.", 
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
          attachments: [],
          contentType: "video",
          isFreePreview: false,
          passingScore: 70,
        }
      ]
    }
  ]);
  const [isManualSaving, setIsManualSaving] = useState(false);

  // Interactive Module Studio (IMS) States
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [studioModuleIndex, setStudioModuleIndex] = useState<number | null>(null);
  const [studioTab, setStudioTab] = useState<"paste" | "prompt" | "templates" | "form">("paste");
  const [studioOutlineText, setStudioOutlineText] = useState("");
  const [studioPromptText, setStudioPromptText] = useState("");
  const [studioModuleTitle, setStudioModuleTitle] = useState("");
  const [studioLessons, setStudioLessons] = useState<Array<any>>([]);
  const [isStudioRunningAI, setIsStudioRunningAI] = useState(false);
  const [editorMode, setEditorMode] = useState<"wysiwyg" | "raw">("wysiwyg");

  // Helper compiler to turn current module values back into the plain syllabus outline syntax
  const compileLessonsToOutlineText = (mTitle: string, lessonsList: any[]) => {
    let out = `Module Title: ${mTitle || "New Course Module"}\n`;
    (lessonsList || []).forEach((l) => {
      const typeStr = l.contentType || "video";
      const dur = l.durationMinutes || 10;
      out += `- ${l.title || "Syllabus Lecture Item"} (${typeStr}, ${dur} mins)\n`;
      if (typeStr === "quiz" && l.quizQuestions && l.quizQuestions.length > 0) {
        l.quizQuestions.forEach((q: any) => {
          out += `  ? ${q.question || "Which represents the core aspect?"}\n`;
          if (q.options && q.options.length > 0) {
            out += `  o: ${q.options.join(", ")}\n`;
          }
          out += `  a: ${q.answerIndex !== undefined ? q.answerIndex + 1 : 1}\n`;
        });
      }
    });
    return out;
  };

  const handleUpdateBlockEditor = (newTitle: string, newLessons: any[]) => {
    setStudioModuleTitle(newTitle);
    setStudioLessons(newLessons);
    const textOut = compileLessonsToOutlineText(newTitle, newLessons);
    setStudioOutlineText(textOut);
  };

  const handleSwitchToWysiwyg = () => {
    const parsed = parseModuleOutline(studioOutlineText);
    setStudioModuleTitle(parsed.title);
    setStudioLessons(parsed.lessons);
    setEditorMode("wysiwyg");
  };

  const handleSwitchToRaw = () => {
    const compiled = compileLessonsToOutlineText(studioModuleTitle, studioLessons);
    setStudioOutlineText(compiled);
    setEditorMode("raw");
  };

  const updateLessonBlockField = (idx: number, field: string, value: any) => {
    const updated = [...studioLessons];
    updated[idx] = { ...updated[idx], [field]: value };
    handleUpdateBlockEditor(studioModuleTitle, updated);
  };

  const reorderLessonBlock = (idx: number, direction: "up" | "down") => {
    const updated = [...studioLessons];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    handleUpdateBlockEditor(studioModuleTitle, updated);
  };

  const deleteLessonBlock = (idx: number) => {
    const updated = studioLessons.filter((_, i) => i !== idx);
    handleUpdateBlockEditor(studioModuleTitle, updated);
  };

  const addLessonBlock = (type: "video" | "text" | "download" | "quiz" | "assignment") => {
    const updated = [...studioLessons];
    const newLesson: any = {
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Block Lecture`,
      durationMinutes: 15,
      contentType: type,
      textContent: type === "assignment" 
        ? "Please submit your completed repository link and screenshots here." 
        : `Enter textbook study content guides about this block topic. Supports standard playbooks.`,
      videoUrl: type === "video" ? "https://www.youtube.com/embed/dQw4w9WgXcQ" : "",
      attachments: type === "download" ? ["Handout_Reference.pdf"] : []
    };
    if (type === "quiz") {
      newLesson.quizQuestions = [
        {
          question: "Question: Pick the optimal scaling rule?",
          options: ["Speculative Execution", "Dynamic Load Balance", "Predefined Buffers", "Local Sandbox cachesOnly"],
          answerIndex: 0
        }
      ];
    }
    updated.push(newLesson);
    handleUpdateBlockEditor(studioModuleTitle, updated);
  };

  // Helper parser for course outlines
  const parseModuleOutline = (rawText: string) => {
    const lines = rawText.split('\n');
    let moduleTitle = "New Course Module";
    const lessons: any[] = [];
    let currentQuizQuestion: any = null;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.toLowerCase().startsWith("module name:") || trimmed.toLowerCase().startsWith("module title:") || trimmed.toLowerCase().startsWith("module:")) {
        moduleTitle = trimmed.substring(trimmed.indexOf(":") + 1).trim();
        continue;
      }

      if (trimmed.startsWith("-") || trimmed.startsWith("*") || /^\d+\./.test(trimmed)) {
        let lessonLine = trimmed.replace(/^[-*\d.]+\s*/, "").trim();
        let contentType: "video" | "text" | "download" | "quiz" | "assignment" = "video";
        let duration = 15;
        let attachments: string[] = [];

        const lowerLine = lessonLine.toLowerCase();
        if (lowerLine.includes("(video)") || lowerLine.includes("[video]")) {
          contentType = "video";
        } else if (lowerLine.includes("(text)") || lowerLine.includes("[text]") || lowerLine.includes("(reading)") || lowerLine.includes("[reading]")) {
          contentType = "text";
        } else if (lowerLine.includes("(download)") || lowerLine.includes("[download]") || lowerLine.includes("(pdf)") || lowerLine.includes("[pdf]")) {
          contentType = "download";
          attachments = ["ResourceWorkbook.pdf"];
        } else if (lowerLine.includes("(quiz)") || lowerLine.includes("[quiz]") || lowerLine.includes("(test)") || lowerLine.includes("[test]")) {
          contentType = "quiz";
        } else if (lowerLine.includes("(assignment)") || lowerLine.includes("[assignment]") || lowerLine.includes("(project)") || lowerLine.includes("[project]")) {
          contentType = "assignment";
        }

        const durationMatch = lessonLine.match(/(\d+)\s*(min|m|minute)/i);
        if (durationMatch) {
          duration = parseInt(durationMatch[1], 10);
        }

        let title = lessonLine.replace(/\(([^)]+)\)/g, "").replace(/\[([^\]]+)\]/g, "").trim();
        if (!title) {
          title = "Syllabus Lecture Item";
        }

        lessons.push({
          title,
          durationMinutes: duration,
          textContent: `Comprehensive playbook guide on: ${title}. Keep studying to complete curriculum.`,
          videoUrl: contentType === "video" ? "https://www.youtube.com/embed/dQw4w9WgXcQ" : "",
          attachments,
          contentType,
          quizQuestions: contentType === "quiz" ? [
            {
              question: `Which represents the core aspect of ${title}?`,
              options: ["Optimal scaling parameters", "Local dev persistence setups", "Default global configurations", "None of the above"],
              answerIndex: 0
            }
          ] : undefined
        });
        continue;
      }

      if (trimmed.startsWith("?") || trimmed.toLowerCase().startsWith("q:")) {
        const qText = trimmed.replace(/^(\?|q:)\s*/i, "").trim();
        if (lessons.length > 0 && lessons[lessons.length - 1].contentType === "quiz") {
          const lastLesson = lessons[lessons.length - 1];
          if (!lastLesson.quizQuestions) lastLesson.quizQuestions = [];
          currentQuizQuestion = {
            question: qText,
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            answerIndex: 0
          };
          lastLesson.quizQuestions.push(currentQuizQuestion);
        }
      } else if (trimmed.toLowerCase().startsWith("o:") || trimmed.toLowerCase().startsWith("options:")) {
        const optStr = trimmed.replace(/^(o:|options:)\s*/i, "").trim();
        const opts = optStr.split(",").map(s => s.trim());
        if (currentQuizQuestion && opts.length > 0) {
          const paddedOpts = [...opts];
          while (paddedOpts.length < 4) paddedOpts.push(`Option ${paddedOpts.length + 1}`);
          currentQuizQuestion.options = paddedOpts.slice(0, 4);
        }
      } else if (trimmed.toLowerCase().startsWith("a:") || trimmed.toLowerCase().startsWith("answer:")) {
        const ansWord = trimmed.replace(/^(a:|answer:)\s*/i, "").trim();
        const ansIdx = parseInt(ansWord, 10) - 1;
        if (currentQuizQuestion && !isNaN(ansIdx)) {
          currentQuizQuestion.answerIndex = Math.max(0, Math.min(3, ansIdx));
        }
      }
    }

    if (lessons.length === 0) {
      lessons.push({
        title: "Lecture 1: Intro Overview",
        durationMinutes: 10,
        textContent: "Welcome message starting this learning path.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        attachments: [],
        contentType: "video"
      });
    }

    return { title: moduleTitle, lessons };
  };

  // Synchronize outline text automatically
  useEffect(() => {
    if (showStudioModal && studioTab === "paste") {
      if (editorMode === "raw") {
        const parsed = parseModuleOutline(studioOutlineText);
        setStudioModuleTitle(parsed.title);
        setStudioLessons(parsed.lessons);
      }
    }
  }, [studioOutlineText, studioTab, showStudioModal, editorMode]);

  const handleOpenStudioNewModule = () => {
    setStudioModuleIndex(null);
    setStudioModuleTitle("Advanced Systems Operations");
    setStudioLessons([
      {
        title: "Lecture 1: Core System Architecture",
        durationMinutes: 12,
        textContent: "Welcome message starting this learning path.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        attachments: [],
        contentType: "video"
      }
    ]);
    setStudioOutlineText(
      "Module Title: Advanced Systems Operations\n" +
      "- Lecture 1: Core System Architecture (video, 12 mins)\n" +
      "- Practical Execution Guide (text, 20 mins)\n" +
      "- Infrastructure Verification Quiz (quiz, 10 mins)\n" +
      "  ? What is the main benefit of decentralized architectures?\n" +
      "  o: Resiliency and high availability, Simple sync updates, Complete row lock coordination, Zero networking budget\n" +
      "  a: 1\n" +
      "- Final Performance Sandbox Assignment (assignment, 45 mins)"
    );
    setStudioTab("paste");
    setShowStudioModal(true);
  };

  const handleOpenStudioExistingModule = (modIdx: number) => {
    const mod = manualModules[modIdx];
    setStudioModuleIndex(modIdx);
    setStudioModuleTitle(mod.title);
    setStudioLessons(mod.lessons || []);

    let text = `Module Title: ${mod.title}\n`;
    if (mod.lessons) {
      mod.lessons.forEach((l) => {
        text += `- ${l.title} (${l.contentType || "video"}, ${l.durationMinutes || 10} mins)\n`;
        if (l.contentType === "quiz" && l.quizQuestions) {
          l.quizQuestions.forEach((q) => {
            text += `  ? ${q.question}\n`;
            text += `  o: ${q.options.join(", ")}\n`;
            text += `  a: ${q.answerIndex + 1}\n`;
          });
        } else if (l.textContent && l.textContent !== `Comprehensive playbook guide on: ${l.title}. Keep studying to complete curriculum.`) {
          text += `  [TextContent] ${l.textContent}\n`;
        }
      });
    }

    setStudioOutlineText(text);
    setStudioTab("paste");
    setShowStudioModal(true);
  };

  const handleSaveStudioModule = () => {
    const finalTitle = studioModuleTitle.trim() || "New Course Module";
    const updatedModule = {
      title: finalTitle,
      lessons: studioLessons.map((l, lIdx) => ({
        ...l,
        index: lIdx,
        attachments: l.attachments || [],
        contentType: l.contentType || "video"
      }))
    };

    if (studioModuleIndex === null) {
      setManualModules([...manualModules, updatedModule]);
    } else {
      const updated = [...manualModules];
      updated[studioModuleIndex] = updatedModule;
      setManualModules(updated);
    }
    setShowStudioModal(false);
  };

  const handleRunStudioAI = () => {
    if (!studioPromptText.trim()) return;
    setIsStudioRunningAI(true);
    
    setTimeout(() => {
      const prompt = studioPromptText.toLowerCase();
      let moduleTitle = "Engineered Architecture Module";
      let lessons: any[] = [];
      
      if (prompt.includes("docker") || prompt.includes("container") || prompt.includes("kubernetes")) {
        moduleTitle = "Containerization & Kubernetes Operations";
        lessons = [
          {
            title: "Docker Image Multi-Stage Optimization",
            durationMinutes: 12,
            contentType: "video",
            textContent: "Learn how to squeeze production Docker images down to < 50MB using multi-stage builds and alpine bases.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            attachments: ["Dockerfile.optimized"]
          },
          {
            title: "SaaS Docker Compose Microservices Setup",
            durationMinutes: 20,
            contentType: "text",
            textContent: "A comprehensive guide to orchestrating Express, Redis, PostgreSQL, and Nginx with docker-compose for zero-trust development.\n\n### Core Commands:\n- `docker compose up --build -d`\n- `docker compose logs -f`"
          },
          {
            title: "Docker Networking & Volumes Quiz",
            durationMinutes: 10,
            contentType: "quiz",
            textContent: "Knowledge check.",
            quizQuestions: [
              {
                question: "Which network driver allows containers to bind directly to host port interfaces?",
                options: ["bridge", "host", "overlay", "none"],
                answerIndex: 1
              },
              {
                question: "What volume mount is best for instant live reload persistence in development containers?",
                options: ["Bind mount", "Named volume", "Anonymous volume", "S3 remote mount"],
                answerIndex: 0
              }
            ]
          },
          {
            title: "Multi-container Environment Assignment",
            durationMinutes: 30,
            contentType: "assignment",
            textContent: "Create a containerized Redis-cached server that increments request counts persistent to a directory bind-mount. Submit draft playbook."
          }
        ];
      } else if (prompt.includes("react") || prompt.includes("frontend") || prompt.includes("next.js") || prompt.includes("tailwind")) {
        moduleTitle = "Modern Frontend Framework Architecture";
        lessons = [
          {
            title: "Mastering React Server Components & Streaming",
            durationMinutes: 15,
            contentType: "video",
            textContent: "Unlock parallel asynchronous fetching and skeleton indicators in Next.js/React frameworks with Suspense.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
          },
          {
            title: "Optimizing Tailwind CSS Layouts & Custom Themes",
            durationMinutes: 12,
            contentType: "text",
            textContent: "How to use CSS variable-backed Tailwind themes to render beautiful dynamic color-swapping structures with 100% responsiveness.\n\n### Best Practices:\n- Limit font family variants.\n- Use fluid typography margins."
          },
          {
            title: "React Hooks Lifecycle Knowledge Check",
            durationMinutes: 10,
            contentType: "quiz",
            quizQuestions: [
              {
                question: "In which React Hook should you invoke direct event-based local storage syncloop writes?",
                options: ["useEffect", "useMemo", "useEvent", "useContext"],
                answerIndex: 0
              }
            ]
          }
        ];
      } else if (prompt.includes("database") || prompt.includes("sql") || prompt.includes("prisma") || prompt.includes("postgres")) {
        moduleTitle = "Relational Databases & Scalable Query Schema Design";
        lessons = [
          {
            title: "Database Indexing, B-Trees & Explain Analyze",
            durationMinutes: 18,
            contentType: "video",
            textContent: "Deep dive lecture into indexing columns, compound indexes, index scans, and identifying bottlenecks.",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
          },
          {
            title: "Database Isolation Levels, ACID & Row-level Locks",
            durationMinutes: 25,
            contentType: "text",
            textContent: "Avoid phantom reads, dirty reads, and deadlock exceptions in production under high traffic locks."
          },
          {
            title: "SQL Performance Certification Quiz",
            durationMinutes: 10,
            contentType: "quiz",
            quizQuestions: [
              {
                question: "Which PostgreSQL isolation level completely prevents serialization anomalies and phantom reads?",
                options: ["Read Committed", "Repeatable Read", "Serializable", "Read Uncommitted"],
                answerIndex: 2
              }
            ]
          }
        ];
      } else {
        const capitalizedPrompt = studioPromptText.charAt(0).toUpperCase() + studioPromptText.slice(1);
        moduleTitle = `Course in ${capitalizedPrompt}`;
        lessons = [
          {
            title: `Introductory Frameworks of ${capitalizedPrompt}`,
            durationMinutes: 15,
            contentType: "video",
            textContent: `Introduction and foundational roadmap looking at modern implementation patterns of ${capitalizedPrompt}.`,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
          },
          {
            title: `Operational Guidelines for ${capitalizedPrompt} Deployments`,
            durationMinutes: 20,
            contentType: "text",
            textContent: `Practical playbook detailing security checklists, config files, package rules, and performance auditing metrics for ${capitalizedPrompt}.`
          },
          {
            title: `${capitalizedPrompt} Verification Quiz`,
            durationMinutes: 10,
            contentType: "quiz",
            quizQuestions: [
              {
                question: `What represents the main architecture bottleneck in building ${capitalizedPrompt}?`,
                options: ["Unoptimized sync rendering bottlenecks", "Cold starts and remote database latency", "Global state inconsistency across client sessions", "All of the above"],
                answerIndex: 3
              }
            ]
          },
          {
            title: `${capitalizedPrompt} Final Implementation Assessment`,
            durationMinutes: 45,
            contentType: "assignment",
            textContent: `Propose an end-to-end integration diagram, configuration list, and benchmark results for a typical production scale application using ${capitalizedPrompt}.`
          }
        ];
      }

      setStudioModuleTitle(moduleTitle);
      setStudioLessons(lessons);

      let text = `Module Title: ${moduleTitle}\n`;
      lessons.forEach(l => {
        text += `- ${l.title} (${l.contentType}, ${l.durationMinutes} mins)\n`;
        if (l.contentType === 'quiz' && l.quizQuestions) {
          l.quizQuestions.forEach(q => {
            text += `  ? ${q.question}\n`;
            text += `  o: ${q.options.join(", ")}\n`;
            text += `  a: ${q.answerIndex + 1}\n`;
          });
        }
      });
      setStudioOutlineText(text);
      setIsStudioRunningAI(false);
      setStudioTab("paste");
    }, 1500);
  };

  const handleAddModuleField = () => {
    setManualModules([
      ...manualModules,
      {
        title: `Module ${manualModules.length + 1}: Unlocking Secrets`,
        lessons: [
          { 
            title: "Playbook Lecture Notes", 
            durationMinutes: 15, 
            textContent: "Comprehensive workbook on topic.", 
            videoUrl: "", 
            attachments: [],
            contentType: "text"
          }
        ]
      }
    ]);
  };

  const handleRemoveModuleField = (index: number) => {
    setManualModules(manualModules.filter((_, i) => i !== index));
  };

  const handleModuleTitleChange = (index: number, val: string) => {
    const updated = [...manualModules];
    updated[index].title = val;
    setManualModules(updated);
  };

  const handleAddLessonField = (moduleIdx: number) => {
    const updated = [...manualModules];
    updated[moduleIdx].lessons.push({
      title: "New Syllabus Task",
      durationMinutes: 12,
      textContent: "Provide details, snippets, formulas, or textbooks for curriculum students.",
      videoUrl: "",
      attachments: [],
      contentType: "video"
    });
    setManualModules(updated);
  };

  const handleRemoveLessonField = (moduleIdx: number, lessonIdx: number) => {
    const updated = [...manualModules];
    updated[moduleIdx].lessons = updated[moduleIdx].lessons.filter((_, i) => i !== lessonIdx);
    setManualModules(updated);
  };

  const handleLessonChange = (moduleIdx: number, lessonIdx: number, field: string, val: any) => {
    const updated = [...manualModules];
    updated[moduleIdx].lessons[lessonIdx] = {
      ...updated[moduleIdx].lessons[lessonIdx],
      [field]: val
    };
    setManualModules(updated);
  };

  const handleAddQuizQuestionField = (modIdx: number, lesIdx: number) => {
    const updated = [...manualModules];
    const currentQuizQs = updated[modIdx].lessons[lesIdx].quizQuestions || [];
    updated[modIdx].lessons[lesIdx].quizQuestions = [
      ...currentQuizQs,
      { question: "What is the primary action hook?", options: ["Option A", "Option B", "Option C", "Option D"], answerIndex: 0 }
    ];
    setManualModules(updated);
  };

  const handleQuizQuestionChange = (modIdx: number, lesIdx: number, qIdx: number, field: string, val: any) => {
    const updated = [...manualModules];
    const quizQs = updated[modIdx].lessons[lesIdx].quizQuestions ? [...updated[modIdx].lessons[lesIdx].quizQuestions!] : [];
    quizQs[qIdx] = {
      ...quizQs[qIdx],
      [field]: val
    };
    updated[modIdx].lessons[lesIdx].quizQuestions = quizQs;
    setManualModules(updated);
  };

  const handleQuizQuestionOptionChange = (modIdx: number, lesIdx: number, qIdx: number, optIdx: number, val: string) => {
    const updated = [...manualModules];
    const quizQs = updated[modIdx].lessons[lesIdx].quizQuestions ? [...updated[modIdx].lessons[lesIdx].quizQuestions!] : [];
    const opts = [...quizQs[qIdx].options];
    opts[optIdx] = val;
    quizQs[qIdx] = {
      ...quizQs[qIdx],
      options: opts
    };
    updated[modIdx].lessons[lesIdx].quizQuestions = quizQs;
    setManualModules(updated);
  };

  const handleSaveManualCourse = async () => {
    if (!manualName.trim()) return;
    setIsManualSaving(true);
    
    const isEditing = !!editingCourseId;
    const saveUrl = isEditing ? `/api/courses/${editingCourseId}` : "/api/courses";
    const saveMethod = isEditing ? "PUT" : "POST";

    try {
      const payload = {
        communityId: activeCommunity?.id,
        name: manualName,
        description: manualDesc,
        coverUrl: manualCover,
        isPremiumOnly: manualPremium,
        courseType: manualCourseType || "flagship",
        difficultyLevel: manualDifficulty || "beginner",
        price: manualPrice || 0,
        category: manualCategory || null,
        certificateEnabled: manualCertificateEnabled || false,
        estimatedHours: manualEstimatedHours || 0,
        modules: manualModules.map((m, mIdx) => ({
          id: `mod-${mIdx}-${Date.now()}`,
          courseId: editingCourseId || "",
          title: m.title,
          description: m.description || null,
          index: mIdx,
          isFreePreview: m.isFreePreview || false,
          lessons: m.lessons.map((l, lIdx) => ({
            id: `ls-${mIdx}-${lIdx}-${Date.now()}`,
            moduleId: "",
            title: l.title,
            durationMinutes: Number(l.durationMinutes) || 10,
            videoUrl: l.videoUrl || "",
            textContent: l.textContent,
            attachments: l.attachments || [],
            isLocked: l.isLocked || false,
            isFreePreview: l.isFreePreview || false,
            index: lIdx,
            contentType: l.contentType || "video",
            quizQuestions: l.contentType === "quiz" ? l.quizQuestions : undefined,
            assignmentInstructions: l.contentType === "assignment" ? l.textContent : undefined,
            passingScore: l.passingScore || 70,
          }))
        }))
      };

      const res = await fetch(saveUrl, {
        method: saveMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (!isEditing && data.course) {
          onAddCourse(data.course);
        }
        setManualName("");
        setManualDesc("");
        setManualPremium(false);
        setManualCourseType("flagship");
        setManualDifficulty("beginner");
        setManualPrice(0);
        setManualCategory("");
        setManualCertificateEnabled(false);
        setManualEstimatedHours(0);
        setManualModules([
          {
            title: "Module 1: Fundamental Syntax Rules",
            description: "",
            isFreePreview: false,
            lessons: [
              { 
                title: "Intro Lecture Overview", 
                durationMinutes: 10, 
                textContent: "Welcome message introducing structural patterns.", 
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", 
                attachments: [],
                contentType: "video",
                isFreePreview: false,
                passingScore: 70,
              }
            ]
          }
        ]);
        setEditingCourseId(null);
        setShowManualModal(false);
        onRefreshCourses();
        
        if (isEditing && selectedCourse?.id === editingCourseId) {
          const updatedCourse = data.course || payload;
          setSelectedCourse(updatedCourse);
          if (updatedCourse.modules?.[0]?.lessons?.[0]) {
            setActiveLesson(updatedCourse.modules[0].lessons[0]);
          }
        }
      }
    } catch (e) {
      console.error("Manual course build failure: ", e);
    } finally {
      setIsManualSaving(false);
    }
  };

  const handleToggleCompleted = async (lessonId: string) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/toggle-completed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        if (!completedLessons.includes(lessonId)) {
          setCompletedLessons([...completedLessons, lessonId]);
        }
        if (data.level > (currentUser?.level || 1)) {
          setLastLeveledUp(data.level);
          setShowLevelUpAlert(true);
        }
        if (currentUser) {
          currentUser.xp = data.xp;
          currentUser.level = data.level;
        }
      }
    } catch (e) {
      console.error("Check lesson error", e);
    }
  };

  const handleGenerateCourseOutline = async () => {
    if (!aiProposalText.trim()) return;
    setIsAiBuilding(true);
    try {
      const res = await fetch("/api/courses/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiProposalText,
          communityId: activeCommunity?.id
        })
      });
      const data = await res.json();
      if (data.success && data.course) {
        onAddCourse(data.course);
        setAiProposalText("");
        setSelectedCourse(data.course);
        if (data.course.modules && data.course.modules[0]?.lessons[0]) {
          setActiveLesson(data.course.modules[0].lessons[0]);
        }
      }
    } catch (e) {
      console.error("Ai course outline failed to generate: ", e);
    } finally {
      setIsAiBuilding(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    const isLocked = course.isPremiumOnly && !hasStaffOverride && !hasSubscribedLocal;
    
    if (isLocked) {
      setShowCheckoutModal(course);
      return;
    }

    setSelectedCourse(course);
    if (course.modules && course.modules[0] && course.modules[0].lessons[0]) {
      setActiveLesson(course.modules[0].lessons[0]);
    } else {
      setActiveLesson(null);
    }
  };

  const handleExecutePayment = async () => {
    if (!showCheckoutModal) return;
    setIsProcessingPayment(true);
    try {
      await fetch(`/api/communities/${activeCommunity?.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      setHasSubscribedLocal(true);
      setShowCheckoutModal(null);
      setSelectedCourse(showCheckoutModal);
      if (showCheckoutModal.modules && showCheckoutModal.modules[0] && showCheckoutModal.modules[0].lessons[0]) {
        setActiveLesson(showCheckoutModal.modules[0].lessons[0]);
      }
    } catch (err) {
      console.error("Failed executing payments telemetry", err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // User context roles are retrieved at the top of the component as state/props derivatives

  // Calculate Course Progression
  const courseSyllabusLessons = selectedCourse ? selectedCourse.modules?.flatMap(m => m.lessons || []) || [] : [];
  const completedInActiveCourse = courseSyllabusLessons.filter(l => completedLessons.includes(l.id));
  const progressPercent = courseSyllabusLessons.length > 0 
    ? Math.round((completedInActiveCourse.length / courseSyllabusLessons.length) * 100) 
    : 0;

  // Rich Playbook Markup Renderer
  const renderRichTextPlaybook = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${idx}`} className="my-3 p-3.5 bg-gray-900 text-indigo-200 font-mono text-[11px] rounded-xl overflow-x-auto shadow-inner border border-gray-800">
              <code>{codeBlockLines.join("\n")}</code>
            </pre>
          );
          codeBlockLines = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      if (line.startsWith("### ")) {
        elements.push(<h4 key={idx} className="text-xs font-bold text-gray-900 mt-4 mb-2 font-mono uppercase tracking-wider text-indigo-950">{line.replace("### ", "")}</h4>);
      } else if (line.startsWith("## ")) {
        elements.push(<h3 key={idx} className="text-sm font-bold text-indigo-900 mt-5 mb-2 font-display">{line.replace("## ", "")}</h3>);
      } else if (line.match(/^\d+\.\s+/)) {
        elements.push(
          <div key={idx} className="flex gap-2 items-start ml-2 my-1.5 animate-in fade-in">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-mono">{line.substring(0, 1)}</span>
            <span className="text-xs text-gray-650 leading-relaxed font-sans">{line.replace(/^\d+\.\s+/, "")}</span>
          </div>
        );
      } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        elements.push(
          <div key={idx} className="flex gap-2 items-start ml-4 my-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5"></span>
            <span className="text-xs text-gray-650 leading-relaxed font-sans">{line.replace(/^[\-\*]\s+/, "")}</span>
          </div>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={idx} className="h-2"></div>);
      } else {
        elements.push(
          <p key={idx} className="text-xs text-gray-650 my-1 leading-relaxed font-sans">
            {line}
          </p>
        );
      }
    });

    return <div className="space-y-1">{elements}</div>;
  };

  if (isCourseBuilderOnly) {
    return (
      <CourseBuilder
        communityId={activeCommunity?.id || ""}
        initialCourses={localCourses.map((c: any) => ({
          id: c.id,
          communityId: c.communityId || activeCommunity?.id || "",
          name: c.name || "Untitled Course",
          description: c.description || "",
          coverUrl: c.coverUrl || "",
          category: c.category || "General",
          modules: (c.modules || []).map((m: any) => ({
            id: m.id || `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: m.title || "Module",
            index: m.index || 0,
            lessons: (m.lessons || []).map((l: any) => ({
              id: l.id || `les-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title: l.title || "Lesson",
              durationMinutes: l.durationMinutes || 10,
              contentType: l.contentType || "video",
              blocks: l.blocks || [
                { id: `block-${Date.now()}`, type: "heading" as const, content: l.title || "Lesson" },
                { id: `block-${Date.now() + 1}`, type: "paragraph" as const, content: "Content goes here." },
              ],
              isLocked: l.isLocked || false,
              status: "draft" as const,
              videoUrl: l.videoUrl || "",
              textContent: l.textContent || "",
              quizQuestions: l.quizQuestions || [],
              assignmentInstructions: l.assignmentInstructions || "",
              attachments: l.attachments || [],
            })),
          })),
          status: (c.status || "draft") as "draft" | "published" | "archived",
          price: c.price || 0,
          isFree: c.isFree !== undefined ? c.isFree : true,
          instructorName: c.instructorName || "",
          instructorAvatar: c.instructorAvatar || "",
          enrolledCount: c.enrolledCount || 0,
          completionRate: c.completionRate || 0,
          revenue: c.revenue || 0,
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
          templateId: c.templateId || "",
        }))}
        onCoursesChange={(updated) => {
          setLocalCourses(updated as any);
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto selection:bg-indigo-150" id="classroom-main-view">

      {/* Real-time Level Up Toast Alert */}
      {showLevelUpAlert && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-900 to-indigo-950 border border-indigo-500/30 text-white p-5 rounded-2xl shadow-2xl shrink-0 max-w-sm z-50 animate-in slide-in-from-bottom duration-300 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-amber-300 font-mono tracking-wider uppercase">Level Achieved! 🎉</h4>
              <button onClick={() => setShowLevelUpAlert(false)} className="text-white/60 hover:text-white ml-2">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-indigo-100 mt-1">
              You upgraded to <strong>Level {lastLeveledUp}</strong>! Keep finishing lectures to earn accreditation certifications!
            </p>
          </div>
        </div>
      )}

      {/* RENDER LIST OF COURSES INITIAL VIEW */}
      {!selectedCourse ? (
        <div className="space-y-6">

          {/* CREATOR TOGGLE ZONE BANNER */}
          {hasStaffOverride && !isCourseBuilderOnly && !isAnalyticsOnly && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 transition duration-150 relative overflow-hidden" id="creator-workspace-bar">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles className="w-24 h-24 text-slate-300" />
              </div>
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-xl select-none">
                  🎓
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Instructor Dashboard</h4>
                  <p className="text-sm text-slate-300 mt-0.5 leading-normal max-w-md">
                    Manage your courses, track student progress, and review content.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreatorMode(!isCreatorMode);
                  if (!selectedBuilderCourse && localCourses.length > 0) {
                    setSelectedBuilderCourse(localCourses[0]);
                  }
                }}
                className={`py-2 px-5 rounded-xl text-sm font-medium transition duration-150 cursor-pointer shrink-0 ${
                  isCreatorMode
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
                id="toggle-creator-studio-btn"
              >
                {isCreatorMode ? "Enter Student View" : "Enter Instructor Hub"}
              </button>
            </div>
          )}

          {isCreatorMode && (hasStaffOverride || canCreateCourse || isCourseBuilderOnly || isAnalyticsOnly) ? (
            /* ==============================================================================
               CREATOR HUB WORKSPACE
               ============================================================================== */
            <div className="space-y-6 animate-in fade-in duration-300" id="creator-hub-workspace">
              {isCourseBuilderOnly ? null : isAnalyticsOnly ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4 mb-3 gap-2 shrink-0">
                  <div>
                    <h1 className="text-base font-bold text-gray-900 tracking-tight font-display flex items-center gap-2">
                       Classroom Analytics
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Monitor student progress, completion rates, and course engagement.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex border-b border-gray-200 gap-5 sm:gap-6 shrink-0 select-none overflow-x-auto pb-px">
                  <button
                    type="button"
                    onClick={() => setCreatorTab("analytics")}
                    className={`pb-2.5 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer border-0 bg-transparent ${
                      creatorTab === "analytics"
                        ? "border-b-2 border-indigo-600 text-indigo-700 font-semibold"
                        : "text-gray-400 hover:text-gray-650"
                    }`}
                  >
                    Analytics
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatorTab("builder");
                      if (!selectedBuilderCourse && localCourses.length > 0) {
                        setSelectedBuilderCourse(localCourses[0]);
                      }
                    }}
                    className={`pb-2.5 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer border-0 bg-transparent ${
                      creatorTab === "builder"
                        ? "border-b-2 border-indigo-600 text-indigo-700 font-semibold"
                        : "text-gray-400 hover:text-gray-650"
                    }`}
                  >
                    Course Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatorTab("review")}
                    className={`pb-2.5 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer border-0 bg-transparent ${
                      creatorTab === "review"
                        ? "border-b-2 border-indigo-600 text-indigo-700 font-semibold"
                        : "text-gray-400 hover:text-gray-650"
                    }`}
                  >
                    Review & Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatorTab("activity")}
                    className={`pb-2.5 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer border-0 bg-transparent ${
                      creatorTab === "activity"
                        ? "border-b-2 border-indigo-600 text-indigo-700 font-semibold"
                        : "text-gray-400 hover:text-gray-650"
                    }`}
                  >
                    Activity
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatorTab("community")}
                    className={`pb-2.5 text-sm font-medium transition flex items-center gap-1.5 cursor-pointer border-0 bg-transparent ${
                      creatorTab === "community"
                        ? "border-b-2 border-indigo-600 text-indigo-700 font-semibold"
                        : "text-gray-400 hover:text-gray-650"
                    }`}
                  >
                    Community
                  </button>
                </div>
              )}

              {/* TAB 1: ANALYTICS DASHBOARD */}
              {creatorTab === "analytics" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Cumulative Watch Time</span>
                      <strong className="text-xl font-bold text-gray-900 mt-1 block">382.4 Hours</strong>
                      <span className="text-[10px] text-emerald-600 font-medium font-mono mt-1 block">▲ +12.4% watch duration</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Total Cohort Enrolled</span>
                      <strong className="text-xl font-bold text-gray-900 mt-1 block">
                        {localCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0)} students
                      </strong>
                      <span className="text-[10px] text-indigo-600 font-medium font-mono mt-1 block">Across {localCourses.length} syllabus courses</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Completion Rates</span>
                      <strong className="text-xl font-bold text-gray-900 mt-1 block">63.6% average</strong>
                      <span className="text-[10px] text-indigo-600 font-medium font-mono mt-1 block">Diploma claim logs: active</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Instructor XP Badge Boost</span>
                      <strong className="text-xl font-bold text-amber-600 mt-1 block">Level Platinum</strong>
                      <span className="text-[10px] text-amber-650 font-medium font-mono mt-1 block">★ Accredited curriculum owner</span>
                    </div>
                  </div>

                  {/* Course Completion Rates & Engagement Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                      <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider border-b border-gray-100 pb-2">
                        Course Completion & Enrollment Density
                      </h3>
                      <div className="space-y-4">
                        {completionRates.map((rate, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between items-center text-[10.5px]">
                              <strong className="text-gray-800">{rate.courseName}</strong>
                              <span className="text-gray-400 font-mono">{rate.enrolled} matriculated</span>
                            </div>
                            <div className="flex gap-2 items-center">
                              <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-650 rounded-full transition-all duration-500"
                                  style={{ width: `${rate.completionRate}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-755 font-mono min-w-[32px] text-right">
                                {rate.completionRate}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Funnel Drop-off Points & Lesson View Analytics */}
                    <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                      <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider border-b border-gray-100 pb-2 flex justify-between items-center">
                        <span>Drop-off Points & Lesson Viewcounts</span>
                        <span className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-mono font-bold">Funnel Alerts</span>
                      </h3>
                      
                      <div className="space-y-3.5">
                        {lessonViewsAnalytics.map((lesson) => (
                          <div key={lesson.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                            <div className="flex justify-between items-start text-xs gap-2">
                              <strong className="text-gray-800 font-semibold truncate block max-w-[280px]">
                                {lesson.lessonTitle}
                              </strong>
                              <span className="text-[10px] text-gray-500 shrink-0 font-mono font-bold">
                                👥 {lesson.views} views
                              </span>
                            </div>
                            
                            {/* Drop-off funnel visualization */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[9px] font-mono text-gray-400">
                                <span>Accumulated Watch Time: {lesson.watchTimeHours} hrs</span>
                                <span className="font-bold text-rose-600">⚠️ {lesson.dropOffPercent}% Drop-off</span>
                              </div>
                              <div className="w-full bg-slate-205 h-1.5 rounded-full overflow-hidden relative">
                                <div
                                  className="h-full bg-rose-500 rounded-full"
                                  style={{ width: `${lesson.dropOffPercent}%` }}
                                />
                              </div>
                              {lesson.dropOffPercent > 35 && (
                                <p className="text-[8.5px] text-rose-700/80 italic font-medium pt-0.5">
                                  💡 Tip: High fatigue noticed. Try converting this 45m screen lecture into smaller micro-readings or interactive quizzes.
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Course Diagnostics audit check */}
                  <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-950 font-sans flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-650" /> Gemini Curriculum Optimizer Diagnostics
                    </h4>
                    <p className="text-[11px] text-gray-650 leading-relaxed font-sans">
                      Our automated student heuristics auditor completed a curriculum scan. Here is the generated action diagnostics:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 select-text pt-1">
                      <div className="bg-white border border-indigo-100 p-3.5 rounded-xl text-[10px] space-y-1">
                        <strong className="text-gray-800 block">📉 High Ingress SQL Optimization • Exit Fatigue Warning</strong>
                        <p className="text-gray-500 leading-relaxed font-sans">
                          A 62% student drop-off rate is identified inside module 4. Heuristics show the material contains advanced database relational charts. Recommend integrating a progress check quiz to boost motivation!
                        </p>
                      </div>
                      <div className="bg-white border border-indigo-100 p-3.5 rounded-xl text-[10px] space-y-1">
                        <strong className="text-gray-800 block">📊 Workspace Sandbox Security • Peak Engagement Rating</strong>
                        <p className="text-gray-500 leading-relaxed font-sans">
                          Syllabus item 2 &apos;Configuring nginx Reverse Proxy&apos; has earned a 94% retention rating over cumulative watch sessions. This indicates student clarity. Use similar sandbox layouts in future drafts!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COURSE BUILDER */}
              {creatorTab === "builder" && (
                localCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-12 bg-white border border-gray-200 rounded-3xl shadow-sm max-w-xl mx-auto my-12" id="course-builder-empty-state">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 animate-pulse">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase font-mono tracking-wide">You don’t have any courses yet</h3>
                    <p className="text-xs text-gray-400 mt-2 max-w-sm">
                      Launch your virtual school catalog by creating your first multi-chapter instructor syllabus course.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCreateCourseModal(true)}
                      className="mt-6 px-5 py-2.5 bg-indigo-605 hover:bg-indigo-755 text-white font-bold rounded-xl text-xs uppercase font-mono tracking-wider cursor-pointer shadow-md transition"
                      id="course-builder-create-first-btn"
                    >
                      Create First Course
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
                    {/* Left Column: Select Course & Customize Details */}
                    <div className="lg:col-span-5 space-y-5">
                    {/* Course Selection dropdown / list */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-105 pb-3">
                        <h4 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                          Choose Course To Modify
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowCreateCourseModal(true)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-extrabold uppercase font-mono tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Create New
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {localCourses.map(course => {
                          const isSelected = selectedBuilderCourse?.id === course.id;
                          return (
                            <button
                              key={course.id}
                              type="button"
                              onClick={() => {
                                setSelectedBuilderCourse(course);
                                setBuilderSelectedLesson(null);
                              }}
                              className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-50 border-indigo-250 text-indigo-950 font-bold"
                                  : "bg-slate-50 border-slate-100 hover:border-gray-200 text-gray-700"
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="text-[10.5px] font-bold block truncate">{course.name}</span>
                                <span className="text-[8.5px] text-gray-400 font-mono block mt-0.5 uppercase">
                                  {course.modules?.length || 0} Modules • {course.enrolledCount} students
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Course metadata customizer */}
                    {selectedBuilderCourse && (
                      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider border-b border-gray-105 pb-3">
                          Syllabus Metadata Settings
                        </h4>
                        
                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-gray-500 uppercase font-mono block">Course Name</label>
                            <input
                              type="text"
                              value={selectedBuilderCourse.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...selectedBuilderCourse, name: val };
                                setSelectedBuilderCourse(updated);
                                setLocalCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
                              }}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:bg-white text-gray-900 focus:border-indigo-300"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-gray-500 uppercase font-mono block">Acumen Description</label>
                            <textarea
                              rows={3}
                              value={selectedBuilderCourse.description}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...selectedBuilderCourse, description: val };
                                setSelectedBuilderCourse(updated);
                                setLocalCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
                              }}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:bg-white text-gray-900 focus:border-indigo-300 font-sans leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-gray-500 uppercase font-mono block">Cover Image URL</label>
                            <input
                              type="text"
                              value={selectedBuilderCourse.coverUrl}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...selectedBuilderCourse, coverUrl: val };
                                setSelectedBuilderCourse(updated);
                                setLocalCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
                              }}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:bg-white text-gray-900 focus:border-indigo-300 font-mono"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                // Simulate full deletion
                                setLocalCourses(prev => prev.filter(c => c.id !== selectedBuilderCourse.id));
                                setSelectedBuilderCourse(localCourses.filter(c => c.id !== selectedBuilderCourse.id)[0] || null);
                                setBuilderSelectedLesson(null);
                              }}
                              className="flex-1 py-2 border border-red-200 hover:bg-red-50 text-red-650 hover:text-red-800 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Discard Course
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedCourse?.id === selectedBuilderCourse.id) {
                                  setSelectedCourse(selectedBuilderCourse);
                                }
                                onRefreshCourses();
                              }}
                              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              ✓ Save Metadata
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: syllabus module builder & lesson node customization tree */}
                  <div className="lg:col-span-7 space-y-5">
                    {selectedBuilderCourse ? (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                        {/* Modules and Lectures panel */}
                        <div className="sm:col-span-6 bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-xs">
                          <div className="flex justify-between items-center border-b border-gray-105 pb-3">
                            <h4 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                              Modules & Lectures Tree
                            </h4>
                          </div>

                          <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                            {selectedBuilderCourse.modules?.map((mod, modIdx) => (
                              <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex justify-between items-center gap-2">
                                  <strong className="text-[10px] text-gray-800 font-bold block truncate leading-none">
                                    {mod.title}
                                  </strong>
                                  <button
                                    type="button"
                                    onClick={() => handleAddLessonLocal(mod.id)}
                                    className="p-1 bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 rounded-lg text-[8px] font-bold uppercase transition flex items-center gap-0.5 cursor-pointer shrink-0"
                                    title="Add Lesson Node"
                                  >
                                    <Plus className="w-2.5 h-2.5" /> Lecture
                                  </button>
                                </div>

                                <div className="p-2 space-y-1 bg-white">
                                  {mod.lessons?.length === 0 ? (
                                    <p className="text-[8.5px] text-gray-400 italic py-1 px-1.5">No lecture nodes inside this module yet.</p>
                                  ) : (
                                    mod.lessons?.map((les, lesIdx) => {
                                      const isSelected = builderSelectedLesson?.id === les.id;
                                      return (
                                        <div
                                          key={les.id}
                                          className={`group/node flex items-center justify-between p-2 rounded-lg border transition ${
                                            isSelected
                                              ? "bg-slate-100 border-indigo-250 text-indigo-950 font-bold"
                                              : "bg-slate-50/50 border-slate-100 hover:border-gray-200 text-gray-700"
                                          }`}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setBuilderSelectedLesson(les);
                                              setLessonEditTitle(les.title || "");
                                              setLessonEditDuration(les.durationMinutes || 10);
                                              setLessonEditVideoUrl(les.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4");
                                              setLessonEditPlaybook(les.textContent || "");
                                              setLessonEditType(les.contentType || "video");
                                              setLessonEditInstructions(les.assignmentInstructions || "");
                                              setQuizEditQuestions(les.quizQuestions || []);
                                              setAttachmentsList(les.attachments || []);
                                            }}
                                            className="min-w-0 flex-1 text-left cursor-pointer bg-transparent border-0 font-sans"
                                          >
                                            <span className="text-[10px] block truncate text-gray-800 font-semibold">
                                              {lesIdx + 1}. {les.title}
                                            </span>
                                            <span className="text-[8px] text-gray-400 font-mono block mt-0.5 lowercase">
                                              ⏱ {les.durationMinutes} minutes • {les.contentType || "video"}
                                            </span>
                                          </button>

                                          {/* Move Actions Up/Down & Delete */}
                                          <div className="flex items-center gap-1 opacity-60 group-hover/node:opacity-100 transition">
                                            <button
                                              type="button"
                                              disabled={lesIdx === 0}
                                              onClick={() => handleMoveLessonLocal(mod.id, lesIdx, "up")}
                                              className="p-0.5 bg-white border border-gray-200 hover:border-indigo-305 hover:text-indigo-600 rounded disabled:opacity-30 cursor-pointer"
                                            >
                                              <ArrowUp className="w-2.5 h-2.5" />
                                            </button>
                                            <button
                                              type="button"
                                              disabled={lesIdx === mod.lessons.length - 1}
                                              onClick={() => handleMoveLessonLocal(mod.id, lesIdx, "down")}
                                              className="p-0.5 bg-white border border-gray-200 hover:border-indigo-305 hover:text-indigo-600 rounded disabled:opacity-30 cursor-pointer"
                                            >
                                              <ArrowDown className="w-2.5 h-2.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteLessonLocal(mod.id, les.id)}
                                              className="p-0.5 bg-white border border-gray-200 hover:border-red-405 hover:text-red-650 rounded cursor-pointer"
                                            >
                                              <Trash2 className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Add module node form */}
                            <div className="pt-2">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const fd = new FormData(e.currentTarget);
                                  const title = fd.get("newModTitle") as string;
                                  if (title) {
                                    handleAddModuleLocal(title);
                                    e.currentTarget.reset();
                                  }
                                }}
                                className="flex gap-2"
                              >
                                <input
                                  type="text"
                                  name="newModTitle"
                                  required
                                  placeholder="e.g. Module 2: Security Integration"
                                  className="flex-1 text-[10px] bg-slate-50 border border-slate-205 rounded-lg px-2 py-1.5 focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  className="px-3 bg-indigo-600 text-white hover:bg-indigo-750 text-[9px] font-extrabold uppercase font-mono tracking-wider rounded-lg border-0 cursor-pointer shrink-0"
                                >
                                  + Module
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>

                        {/* Selected Lecture Details Forms Sidepanel */}
                        <div className="sm:col-span-6 bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-xs">
                          <h4 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider border-b border-gray-105 pb-3">
                            Customize Lecture Content
                          </h4>

                          {builderSelectedLesson ? (
                            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 text-[8.5px] text-indigo-950 font-sans">
                                <strong>Lecture Identifier Node:</strong> {builderSelectedLesson.id}
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase font-mono block">Lecture Title</label>
                                <input
                                  type="text"
                                  value={lessonEditTitle}
                                  onChange={(e) => setLessonEditTitle(e.target.value)}
                                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:bg-white text-gray-900"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase font-mono block">Estimated Duration (minutes)</label>
                                <input
                                  type="number"
                                  value={lessonEditDuration}
                                  onChange={(e) => setLessonEditDuration(Number(e.target.value))}
                                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:bg-white text-gray-900"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase font-mono block">Lesson Type / Format</label>
                                <select
                                  value={lessonEditType}
                                  onChange={(e) => setLessonEditType(e.target.value as any)}
                                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:bg-white text-gray-900"
                                >
                                  <option value="video">🎞️ Video (player links + markdown note)</option>
                                  <option value="quiz">📝 Quizzes (multi-choice questions)</option>
                                  <option value="assignment">📂 Assignment Submission (instructions)</option>
                                  <option value="text">📖 Documentation (text overview only)</option>
                                </select>
                              </div>

                              {lessonEditType === "video" && (
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase font-mono block">Video Source Streaming Link</label>
                                  <input
                                    type="text"
                                    value={lessonEditVideoUrl}
                                    onChange={(e) => setLessonEditVideoUrl(e.target.value)}
                                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:bg-white text-gray-950"
                                  />
                                </div>
                              )}

                              {lessonEditType === "assignment" && (
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase font-mono block">Assignment Instructions</label>
                                  <textarea
                                    rows={3}
                                    placeholder="Provide detailed project or codebase assignment homework instructions..."
                                    value={lessonEditInstructions}
                                    onChange={(e) => setLessonEditInstructions(e.target.value)}
                                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:bg-white text-gray-900"
                                  />
                                </div>
                              )}

                              {lessonEditType === "quiz" && (
                                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-3">
                                  <strong className="text-[9.5px] text-gray-800 uppercase font-mono block border-b border-gray-200 pb-1">Quiz Questions List ({quizEditQuestions.length})</strong>
                                  
                                  {quizEditQuestions.length === 0 ? (
                                    <p className="text-[8.5px] text-gray-400 italic">No MCQ questions added yet.</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {quizEditQuestions.map((q, qIndex) => (
                                        <div key={qIndex} className="bg-white border border-slate-100 p-2.5 rounded-lg text-[9px] space-y-1 relative group/q">
                                          <button
                                            type="button"
                                            onClick={() => setQuizEditQuestions(prev => prev.filter((_, idx) => idx !== qIndex))}
                                            className="absolute top-1.5 right-1.5 text-red-500 hover:text-red-700 opacity-30 group-hover/q:opacity-100 transition"
                                          >
                                            🗑️
                                          </button>
                                          <strong>Q{qIndex + 1}: {q.question}</strong>
                                          <ul className="list-disc pl-3 text-gray-500">
                                            {q.options?.map((opt: string, optI: number) => (
                                              <li key={optI} className={optI === q.answerIndex ? "text-indigo-600 font-bold" : ""}>
                                                {opt} {optI === q.answerIndex && "✓"}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Add quick quiz query maker form */}
                                  <div className="bg-white p-2.5 border border-slate-200 rounded-xl space-y-2 text-[9.5px]">
                                    <strong className="text-gray-800">Add MCQ Question Form</strong>
                                    <form
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        const fd = new FormData(e.currentTarget);
                                        const ques = fd.get("ques") as string;
                                        const o1 = fd.get("o1") as string;
                                        const o2 = fd.get("o2") as string;
                                        const o3 = fd.get("o3") as string;
                                        const o4 = fd.get("o4") as string;
                                        const correct = Number(fd.get("correct") || 0);

                                        if (ques && o1 && o2) {
                                          const options = [o1, o2];
                                          if (o3) options.push(o3);
                                          if (o4) options.push(o4);
                                          const newQ = { question: ques, options, answerIndex: correct };
                                          setQuizEditQuestions([...quizEditQuestions, newQ]);
                                          e.currentTarget.reset();
                                        }
                                      }}
                                      className="space-y-1.5"
                                    >
                                      <input type="text" name="ques" required placeholder="Question label..." className="w-full p-1 border text-[9px] rounded" />
                                      <div className="grid grid-cols-2 gap-1.5">
                                        <input type="text" name="o1" required placeholder="Choice A" className="p-1 border text-[9px] rounded focus:outline-none" />
                                        <input type="text" name="o2" required placeholder="Choice B" className="p-1 border text-[9px] rounded focus:outline-none" />
                                        <input type="text" name="o3" placeholder="Choice C (Optional)" className="p-1 border text-[9px] rounded focus:outline-none" />
                                        <input type="text" name="o4" placeholder="Choice D (Optional)" className="p-1 border text-[9px] rounded focus:outline-none" />
                                      </div>
                                      <div className="flex justify-between items-center bg-slate-50 p-1.5 border border-slate-100 rounded">
                                        <span>Correct Index:</span>
                                        <select name="correct" className="text-[9px] border p-0.5 rounded focus:outline-none bg-white">
                                          <option value="0">Index 0 (Choice A)</option>
                                          <option value="1">Index 1 (Choice B)</option>
                                          <option value="2">Index 2 (Choice C)</option>
                                          <option value="3">Index 3 (Choice D)</option>
                                        </select>
                                      </div>
                                      <button type="submit" className="w-full py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-bold rounded text-[8.5px] uppercase">
                                        ✓ Append MCQ Object
                                      </button>
                                    </form>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase font-mono block">Lecture Playbook Content (Markdown Support)</label>
                                <textarea
                                  rows={6}
                                  placeholder="Use ### Markdown text rules to specify deep analysis or code snippets..."
                                  value={lessonEditPlaybook}
                                  onChange={(e) => setLessonEditPlaybook(e.target.value)}
                                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:bg-white text-indigo-950 font-semibold"
                                />
                              </div>

                              {/* Attachments / Resource list creator */}
                              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-3">
                                <strong className="text-[9.5px] text-gray-800 uppercase font-mono block border-b border-gray-200 pb-1">Curriculum Handouts ({attachmentsList.length})</strong>
                                
                                {attachmentsList.length === 0 ? (
                                  <p className="text-[8.5px] text-gray-400 italic">No attachments or PDF resource guides added yet.</p>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {attachmentsList.map((filename, fileIdx) => (
                                      <div key={fileIdx} className="bg-white border border-slate-150 px-2.5 py-1 rounded-full text-[8.5px] text-gray-650 flex items-center gap-1.5">
                                        <span>{filename}</span>
                                        <button
                                          type="button"
                                          onClick={() => setAttachmentsList(prev => prev.filter((_, idx) => idx !== fileIdx))}
                                          className="text-red-500 font-bold hover:text-red-700"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    placeholder="e.g. database_schema_v2.pdf"
                                    value={newAttachmentName}
                                    onChange={(e) => setNewAttachmentName(e.target.value)}
                                    className="flex-1 text-[9px] p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (newAttachmentName.trim()) {
                                        setAttachmentsList([...attachmentsList, newAttachmentName.trim()]);
                                        setNewAttachmentName("");
                                      }
                                    }}
                                    className="px-3 bg-indigo-650 hover:bg-indigo-750 text-white font-extrabold uppercase font-mono tracking-wider text-[8.5px] rounded-lg shrink-0 cursor-pointer"
                                  >
                                    + File
                                  </button>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleSaveLessonDeepEdits}
                                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                ✓ Save Lesson Modifications
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-16 text-gray-400">
                              <PenTool className="w-8 h-8 text-indigo-100 mx-auto mb-2" />
                              <p className="text-[10px] font-medium">Select a lecture node from the tree map on the left to edit its playbook text, videos, MCQ quizzes, or attachments!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl p-6 text-gray-450">
                        <BookOpen className="w-12 h-12 text-indigo-100 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-gray-700">No active course selected for customization</h4>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">Select a course from the left panel to customize, or create a new one.</p>
                      </div>
                    )}
                  </div>
                </div>
                )
              )}

              {/* TAB: REVIEW & PUBLISH */}
              {creatorTab === "review" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {selectedBuilderCourse ? (
                    <>
                      {/* Course Overview Card */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start gap-4">
                            {selectedBuilderCourse.coverUrl ? (
                              <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                <img src={selectedBuilderCourse.coverUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-20 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
                                <BookOpen className="w-6 h-6 text-indigo-400" />
                              </div>
                            )}
                            <div>
                              <h2 className="text-xl font-semibold text-slate-900">{selectedBuilderCourse.name || "Untitled Course"}</h2>
                              <p className="text-sm text-slate-500 mt-1">{selectedBuilderCourse.description || "No description"}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                <span>{selectedBuilderCourse.modules?.length || 0} modules</span>
                                <span>•</span>
                                <span>{selectedBuilderCourse.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0} lessons</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            selectedBuilderCourse.status === "published" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {selectedBuilderCourse.status === "published" ? "Published" : "Draft"}
                          </span>
                        </div>

                        {/* Module Summary */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Course Structure</h3>
                          {selectedBuilderCourse.modules?.map((mod: any, idx: number) => (
                            <div key={mod.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-slate-900">Module {idx + 1}: {mod.title}</h4>
                                <span className="text-xs text-slate-400">{mod.lessons?.length || 0} lessons</span>
                              </div>
                              <div className="space-y-1">
                                {mod.lessons?.map((les: any, lesIdx: number) => (
                                  <div key={les.id} className="flex items-center gap-2 text-sm text-slate-600 py-1">
                                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600 shrink-0">{lesIdx + 1}</span>
                                    <span className="truncate">{les.title}</span>
                                    <span className="text-xs text-slate-400 shrink-0">{les.durationMinutes}min</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                      les.contentType === "video" ? "bg-blue-50 text-blue-600" :
                                      les.contentType === "quiz" ? "bg-purple-50 text-purple-600" :
                                      les.contentType === "assignment" ? "bg-amber-50 text-amber-600" :
                                      "bg-slate-100 text-slate-500"
                                    }`}>{les.contentType}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Readiness Checklist */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <h3 className="text-base font-semibold text-slate-900 mb-4">Publish Checklist</h3>
                        <div className="space-y-3">
                          {[
                            { label: "Course has a name", done: !!selectedBuilderCourse.name },
                            { label: "Course has a description", done: !!selectedBuilderCourse.description },
                            { label: "At least one module exists", done: (selectedBuilderCourse.modules?.length || 0) > 0 },
                            { label: "Each module has at least one lesson", done: selectedBuilderCourse.modules?.every((m: any) => (m.lessons?.length || 0) > 0) },
                            { label: "All lessons have content", done: selectedBuilderCourse.modules?.every((m: any) => m.lessons?.every((l: any) => (l.blocks?.length || 0) > 0)) },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                {item.done ? <Check className="w-3 h-3" /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
                              </div>
                              <span className={`text-sm ${item.done ? "text-slate-900" : "text-slate-500"}`}>{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Publish Actions */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">Ready to publish?</h3>
                          <p className="text-sm text-slate-500 mt-0.5">Once published, students can enroll and start learning.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleSaveLessonDeepEdits}
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
                          >
                            Save Draft
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedBuilderCourse) {
                                const updated = { ...selectedBuilderCourse, status: "published" as const };
                                setSelectedBuilderCourse(updated);
                                setLocalCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
                              }
                            }}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition"
                          >
                            Publish Course
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
                      <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <h4 className="text-base font-medium text-slate-900">Select a course to review</h4>
                      <p className="text-sm text-slate-500 mt-1">Choose a course from the Builder tab first.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RECENT STUDENT ACTIVITY */}
              {creatorTab === "activity" && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-gray-105 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                        Recent Student Actions Feed
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">Operational telemetry logs of lesson completions, quiz attempts, and forum questions.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Generate a random student activity
                        const students = ["Sarah Connor", "Aris Thorne", "Lincoln Flores", "Michael Vance", "Elise Montgomery"];
                        const actions = [
                          { action: "completed lesson", target: "Configuring nginx Reverse Proxy" },
                          { action: "enrolled in", target: "SaaS Multi-Tenant Mastery" },
                          { action: "submitted assignment for", target: "Preventing Memory Leaks in TS" },
                          { action: "completed quiz in", target: "Workspace Sandbox Security" },
                          { action: "enrolled in", target: "High Ingress SQL Optimization" }
                        ];
                        const randStud = students[Math.floor(Math.random() * students.length)];
                        const randAct = actions[Math.floor(Math.random() * actions.length)];
                        const newAct = {
                          id: "act_" + Math.random().toString(36).substring(2, 7),
                          studentName: randStud,
                          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 950000)}?auto=format&fit=crop&w=100&h=100&q=80`,
                          action: randAct.action,
                          target: randAct.target,
                          time: "Just now"
                        };
                        setStudentActivities([newAct, ...studentActivities]);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-750 text-[10px] font-extrabold uppercase font-mono tracking-wider rounded-xl cursor-pointer"
                    >
                      🚀 Mock Student Session
                    </button>
                  </div>

                  <div className="space-y-3.5 select-text">
                    {studentActivities.map((act) => (
                      <div key={act.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-indigo-100 hover:bg-indigo-50/10 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={act.avatar}
                            alt={act.studentName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100 shadow-3xs"
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] text-gray-800 leading-normal block">
                              <strong className="font-extrabold text-indigo-950">{act.studentName}</strong> <span className="text-gray-500">{act.action}</span> <strong className="font-semibold text-gray-800">{act.target}</strong>
                            </span>
                            <span className="text-[8.5px] text-gray-400 font-mono block mt-0.5">{act.time}</span>
                          </div>
                        </div>

                        <span className="text-[8px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-white text-gray-450 border shrink-0">
                          Telemetry OK
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: COMMUNITY MODERATION DECK */}
              {creatorTab === "community" && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider border-b border-gray-105 pb-3">
                      Lesson Discussions Moderation Desk
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">Manage comment threads, pin premium inquiries, feature helpful logs, and reply with verified staff credentials.</p>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {lessonComments.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <BookOpen className="w-8 h-8 text-indigo-100 mx-auto mb-2" />
                        <p className="text-[10.5px] font-medium">No system lecture comments logged yet.</p>
                        <p className="text-[8.5px] text-gray-500 max-w-[200px] mx-auto mt-0.5 font-light">As students complete course modules, their questions and comments will stream here for moderator audit.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5 select-text">
                        {lessonComments.map((comm) => {
                          const isPinned = pinnedComments.includes(comm.id);
                          const isFeatured = featuredComments.includes(comm.id);
                          return (
                            <div key={comm.id} className="border border-slate-155 bg-slate-50/75 hover:bg-slate-50 rounded-xl p-4 space-y-3 relative transition">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={comm.authorAvatar}
                                    alt={comm.authorName}
                                    referrerPolicy="no-referrer"
                                    className="w-6.5 h-6.5 rounded-full object-cover border shrink-0 shadow-3xs"
                                  />
                                  <div className="min-w-0 leading-tight">
                                    <strong className="text-[11px] font-bold text-gray-900 truncate block">{comm.authorName}</strong>
                                    <span className="text-[8px] text-gray-450 font-mono uppercase block">{comm.authorRole || "Student"} • {comm.createdAt ? new Date(comm.createdAt).toLocaleDateString() : ""}</span>
                                  </div>
                                </div>

                                <div className="flex gap-1 items-center shrink-0">
                                  {isPinned && (
                                    <span className="text-[8px] bg-indigo-100 text-indigo-850 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                      Pinned📌
                                    </span>
                                  )}
                                  {isFeatured && (
                                    <span className="text-[8px] bg-amber-100 text-amber-850 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                      Featured⭐
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-[11px] text-gray-700 pl-0.5 leading-relaxed">{comm.content}</p>

                              <div className="flex gap-3 justify-end pt-2 border-t border-slate-200/50 text-[9px] font-mono shrink-0 select-none">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isPinned) {
                                      setPinnedComments(pinnedComments.filter(id => id !== comm.id));
                                    } else {
                                      setPinnedComments([...pinnedComments, comm.id]);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded bg-white border border-slate-200 font-bold hover:text-indigo-650 transition cursor-pointer ${
                                    isPinned ? "border-indigo-250 text-indigo-700 bg-indigo-50/30" : "text-gray-550"
                                  }`}
                                >
                                  📌 {isPinned ? "Unpin Comment" : "Pin In Lesson"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isFeatured) {
                                      setFeaturedComments(featuredComments.filter(id => id !== comm.id));
                                    } else {
                                      setFeaturedComments([...featuredComments, comm.id]);
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded bg-white border border-slate-200 font-bold hover:text-amber-650 transition cursor-pointer ${
                                    isFeatured ? "border-amber-250 text-amber-700 bg-amber-50/30" : "text-gray-550"
                                  }`}
                                >
                                  ⭐ {isFeatured ? "Unfeature Post" : "Feature Comment"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLessonComments(prev => prev.filter(c => c.id !== comm.id));
                                  }}
                                  className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 transition cursor-pointer"
                                >
                                  🗑️ Moderate / Hide
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ==============================================================================
               STANDARD STUDENT CLASSROOM VIEW
               ============================================================================== */
            <>
              {/* Tab Selection */}
              <div className="flex border-b border-gray-200 mb-6 gap-6 shrink-0 select-none">
                <button
                  onClick={() => setClassroomTab("dashboard")}
                  className={`pb-2.5 text-xs uppercase font-mono tracking-wider font-bold transition flex items-center gap-1.5 cursor-pointer border-0 bg-transparent ${
                    classroomTab === "dashboard"
                      ? "border-b-2 border-indigo-600 text-indigo-700 font-bold"
                      : "text-gray-400 hover:text-gray-650 font-medium"
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-indigo-500" /> 🏠 Classroom Dashboard
                </button>
                <button
                  onClick={() => setClassroomTab("courses")}
                  className={`pb-2.5 text-xs uppercase font-mono tracking-wider font-bold transition flex items-center gap-1.5 cursor-pointer border-0 bg-transparent ${
                    classroomTab === "courses"
                      ? "border-b-2 border-indigo-600 text-indigo-700 font-bold"
                      : "text-gray-400 hover:text-gray-650 font-medium"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> 📚 Courses Catalog ({localCourses.length})
                </button>
              </div>

              {classroomTab === "dashboard" ? (
                /* THE DETAILED SKOOL-STYLE DASHBOARD WRAPPER */
                <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-200" id="student-dashboard-tab">
                  {/* LEFT MAIN COLUMN: CONTINUE LEARNING & COURSE PROGRESS */}
                  <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* CONTINUE LEARNING CARD */}
                    {(() => {
                      const target = getContinueLearningTarget();
                      if (!target || !target.course) {
                        return (
                          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-450 shadow-xs">
                            <GraduationCap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-gray-700">Ready to begin?</h3>
                            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                              Click on the <strong>Courses Catalog</strong> tab above to browse learning modules and start completing lessons.
                            </p>
                          </div>
                        );
                      }

                      const progress = getCourseProgress(target.course);
                      return (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-5 items-center hover:border-gray-300 transition duration-150">
                          {/* Course covered picture */}
                          <div className="w-full md:w-36 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                            <img
                              src={target.course.coverUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80"}
                              alt={target.course.name}
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info & action */}
                          <div className="flex-1 min-w-0 space-y-2.5 w-full">
                            <div>
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                                Continue Learning (Resume Course)
                              </span>
                              <h3 className="text-sm font-extrabold text-gray-900 truncate mt-1">
                                {target.course.name}
                              </h3>
                              {target.nextLesson && (
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  Left Off: <strong className="text-gray-700 font-semibold">{target.nextLesson.title}</strong>
                                </p>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                                <span>Overall Progress %</span>
                                <span className="font-bold text-gray-755">{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-indigo-650 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Button action */}
                            <div className="flex justify-end pt-0.5">
                              <button
                                onClick={() => {
                                  setSelectedCourse(target.course);
                                  if (target.nextLesson) {
                                    setActiveLesson(target.nextLesson);
                                  } else if (target.course?.modules?.[0]?.lessons?.[0]) {
                                    setActiveLesson(target.course.modules[0].lessons[0]);
                                  }
                                }}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                              >
                                ⚡ Resume Study
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* COURSE PROGRESS REGISTRY */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                      <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider border-b border-gray-100 pb-2">
                        Course Progress & Completion %
                      </h3>
                      
                      {localCourses.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No syllabus courses available yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {localCourses.map((course) => {
                            const progress = getCourseProgress(course);
                            return (
                              <div key={course.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:border-gray-250">
                                <div className="min-w-0 pr-2">
                                  <span className="text-[10.5px] font-bold text-gray-800 truncate block">
                                    {course.name}
                                  </span>
                                  <span className="text-[8.5px] font-mono block text-gray-450 mt-0.5 uppercase">
                                    {course.modules?.length || 0} Modules • {progress}% Completed
                                  </span>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                  <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                    <div className="h-full transition-all" style={{ width: `${progress}%`, backgroundColor: '#4f46e5' }} />
                                  </div>

                                  {progress === 100 ? (
                                    <button
                                      onClick={() => {
                                        setSelectedCourse(course);
                                        setCertificateModalOpen(true);
                                      }}
                                      className="px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-800 rounded-lg text-[9.5px] font-bold tracking-tight uppercase flex items-center gap-1 cursor-pointer shrink-0 animate-pulse"
                                    >
                                      ⭐ Claim Certificate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedCourse(course);
                                        if (course.modules?.[0]?.lessons?.[0]) {
                                          setActiveLesson(course.modules[0].lessons[0]);
                                        }
                                      }}
                                      className="px-3 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-[9.5px] font-semibold tracking-tight uppercase shrink-0 cursor-pointer"
                                    >
                                      Browse
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* CERTIFICATES EARNED PANEL */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-105 pb-2">
                        <h3 className="text-xs font-bold text-gray-950 font-mono uppercase tracking-wider">
                          Certificates Earned
                        </h3>
                        <span className="text-[9px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-mono font-bold scale-95 uppercase">
                          Mastery Accreditations
                        </span>
                      </div>

                      {localCourses.filter(c => getCourseProgress(c) === 100).length === 0 ? (
                        <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl text-center">
                          <Award className="w-8 h-8 text-gray-200 mx-auto mb-1.5" />
                          <p className="text-[10px] text-gray-400 font-medium font-sans">Verify 100% lecture completions across a syllabus to unlock accredited diploma files immediately!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {localCourses.filter(c => getCourseProgress(c) === 100).map(course => (
                            <div key={course.id} className="border border-amber-200 bg-amber-50/15 hover:bg-amber-50/25 rounded-xl p-3.5 flex flex-col justify-between hover:scale-[1.01] transition duration-155">
                              <div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-mono bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                                    VERIFIED MASTER
                                  </span>
                                  <span className="text-[8.5px] text-gray-400 font-mono">
                                    ID: {course.id.substring(0, 5)}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-gray-900 mt-2 line-clamp-1">{course.name}</h4>
                                <p className="text-[9.5px] text-gray-500 mt-0.5">Course completed.</p>
                              </div>
                              <div className="pt-3 flex justify-end shrink-0">
                                <button
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setCertificateModalOpen(true);
                                  }}
                                  className="px-3 py-1 bg-white hover:bg-amber-50 border border-amber-255 text-amber-800 text-[10px] font-bold rounded-lg cursor-pointer"
                                >
                                  🔍 View Diploma
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT SIDEBAR COLUMN: RSVPS & STREAKS */}
                  <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* UPCOMING LIVE SESSIONS */}
                    <div className="bg-white rounded-2xl border border-gray-205 p-5 space-y-3.5">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
                          Upcoming Live Sessions
                        </h3>
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      </div>

                      <div className="space-y-3">
                        {liveSessions.map((session) => {
                          const isRSVPd = rsvps[session.id] === true;
                          return (
                            <div key={session.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2 relative transition hover:border-gray-250">
                              {session.isLiveSoon && (
                                <span className="absolute top-2.5 right-2 px-1.5 py-0.2 bg-rose-50 text-rose-700 font-bold font-mono text-[7.5px] rounded animate-pulse uppercase">
                                  LIVE
                                </span>
                              )}
                              <div>
                                <h4 className="text-xs font-bold text-gray-850 pr-8">{session.title}</h4>
                                <p className="text-[9px] text-indigo-650 font-semibold font-mono mt-0.5">{session.date}</p>
                                <p className="text-[9.5px] text-gray-450 leading-relaxed mt-1 font-sans">{session.desc}</p>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-100/40 font-mono text-[10px] text-gray-350 mt-1 shrink-0">
                                <span>👥 RSVPs: {session.attendees + (isRSVPd ? 1 : 0)}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRsvps(prev => ({ ...prev, [session.id]: !isRSVPd }));
                                  }}
                                  className={`px-2 py-0.5 border rounded font-mono font-bold uppercase transition text-[8.5px] cursor-pointer ${
                                    isRSVPd
                                      ? "bg-emerald-50 border-emerald-250 text-emerald-850 animate-bounce"
                                      : "bg-white border-gray-255 hover:bg-slate-50 text-gray-650"
                                  }`}
                                >
                                  {isRSVPd ? "✓ Enrolled" : "🎟️ RSVP"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* RECENTLY VIEWED LESSONS FEED */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3.5">
                      <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider border-b border-gray-100 pb-2">
                        Recently Viewed Lessons
                      </h3>

                      {recentlyViewed.length === 0 ? (
                        <p className="text-[10px] text-gray-400 font-mono italic text-center py-4">
                          No matching viewed history found.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {recentlyViewed.map((item, index) => {
                            const matchedCourse = localCourses.find(c => c.id === item.courseId);
                            
                            return (
                              <div key={index} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between gap-1 hover:border-indigo-150 transition">
                                <div className="min-w-0 pr-1 select-text">
                                  <span className="text-[10px] font-bold text-gray-800 truncate block">
                                    {item.title}
                                  </span>
                                  <span className="text-[8px] text-indigo-500 font-mono font-semibold block mt-0.5 truncate uppercase">
                                    {item.courseName}
                                  </span>
                                </div>
                                
                                {matchedCourse ? (
                                  <button
                                    onClick={() => {
                                      setSelectedCourse(matchedCourse);
                                      if (matchedCourse.modules) {
                                        for (const mod of matchedCourse.modules) {
                                          const matchedL = mod.lessons?.find(l => l.id === item.id);
                                          if (matchedL) {
                                            setActiveLesson(matchedL);
                                            break;
                                          }
                                        }
                                      }
                                    }}
                                    className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-150 text-indigo-700 rounded-lg text-[8.5px] font-mono font-bold uppercase shrink-0"
                                  >
                                    Resume
                                  </button>
                                ) : (
                                  <span className="text-[8px] text-gray-355 select-none">Void</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* STREAKS CARD */}
                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-5 space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Award className="w-16 h-16 text-indigo-100" />
                      </div>
                      <div>
                        <span className="text-[8px] font-mono bg-indigo-650 text-indigo-200 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                          Rhythm Multiplier
                        </span>
                        <h4 className="text-sm font-extrabold text-white mt-1.5">Learning Streaks</h4>
                        <p className="text-[10px] text-indigo-200 leading-normal mt-0.5">
                          Completed lectures consecutive days in a row to earn Level boosts!
                        </p>
                      </div>
                      <div className="flex justify-between items-center py-1 mt-1 font-mono text-xs text-indigo-100 shrink-0 select-none">
                        <span>🔥 Your Active Streak:</span>
                        <strong className="text-amber-400 font-bold">5 Days</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* STUDENT COURSE REGISTRY / BROWSER CATALOG */
                <div id="student-courses-catalog" className="space-y-6">
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                      <div className="p-6 sm:p-8">
                        <div className="mb-5 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Classroom
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Modules first
                          </span>
                        </div>
                        <h2 className="max-w-2xl text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                          Pick a classroom path, then move through each module like a Skool course.
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                          Courses should feel like community learning hubs: clear modules, visible progress, lessons, resources, and discussion prompts all in one place.
                        </p>
                      </div>

                      <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-xl bg-white/10 p-3">
                            <span className="block text-xl font-bold">{localCourses.length}</span>
                            <span className="text-[10px] text-slate-400">Courses</span>
                          </div>
                          <div className="rounded-xl bg-white/10 p-3">
                            <span className="block text-xl font-bold">
                              {localCourses.reduce((sum, course) => sum + (course.modules?.length || 0), 0)}
                            </span>
                            <span className="text-[10px] text-slate-400">Modules</span>
                          </div>
                          <div className="rounded-xl bg-white/10 p-3">
                            <span className="block text-xl font-bold">
                              {localCourses.reduce((sum, course) => sum + (course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0), 0)}
                            </span>
                            <span className="text-[10px] text-slate-400">Lessons</span>
                          </div>
                        </div>
                        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs font-semibold text-slate-200">Frontend recommendation</p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-400">
                            Keep this page learner-facing. Put buying, enrollment, module previews, and progress here; keep editing in Course Builder.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {localCourses.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
                      <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                      <h4 className="text-sm font-bold text-slate-800">No courses yet</h4>
                      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                        Courses will appear here once they are created and published.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                      {localCourses.map((course) => {
                        const courseStatus = (course.status || "draft") as CourseStatus;
                        const progress = getCourseProgress(course);
                        const lessonCount = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
                        const firstLesson = course.modules?.[0]?.lessons?.[0] || null;

                        return (
                          <article
                            key={course.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                            id={`course-grid-card-${course.id}`}
                          >
                            <div className="grid lg:grid-cols-[230px_1fr]">
                              <div className="relative min-h-[220px] overflow-hidden bg-slate-100">
                                <img
                                  src={course.coverUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"}
                                  alt={course.name}
                                  referrerPolicy="no-referrer"
                                  className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${getStatusColor(courseStatus)}`}>
                                    {getStatusLabel(courseStatus)}
                                  </span>
                                  {course.isPremiumOnly && (
                                    <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-900">
                                      Premium
                                    </span>
                                  )}
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                                    {course.category || getCourseTypeLabel(course.courseType)}
                                  </p>
                                  <h3 className="mt-1 line-clamp-2 text-lg font-extrabold leading-tight">{course.name}</h3>
                                </div>
                              </div>

                              <div className="flex flex-col gap-5 p-5">
                                <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                                  {course.description || "A focused classroom path with lessons, resources, and community discussion."}
                                </p>

                                <div className="grid grid-cols-3 gap-2">
                                  <div className="rounded-xl bg-slate-50 p-3">
                                    <span className="block text-base font-bold text-slate-950">{course.modules?.length || 0}</span>
                                    <span className="text-[10px] font-medium text-slate-500">Modules</span>
                                  </div>
                                  <div className="rounded-xl bg-slate-50 p-3">
                                    <span className="block text-base font-bold text-slate-950">{lessonCount}</span>
                                    <span className="text-[10px] font-medium text-slate-500">Lessons</span>
                                  </div>
                                  <div className="rounded-xl bg-slate-50 p-3">
                                    <span className="block text-base font-bold text-slate-950">{course.enrolledCount || 0}</span>
                                    <span className="text-[10px] font-medium text-slate-500">Members</span>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-500">Course progress</span>
                                    <span className="font-bold text-slate-950">{progress}%</span>
                                  </div>
                                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600 transition-all duration-500"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  {(course.modules || []).slice(0, 4).map((mod, modIdx) => {
                                    const moduleLessons = mod.lessons || [];
                                    const doneCount = moduleLessons.filter((lesson) => completedLessons.includes(lesson.id)).length;
                                    const moduleProgress = moduleLessons.length ? Math.round((doneCount / moduleLessons.length) * 100) : 0;

                                    return (
                                      <button
                                        key={mod.id}
                                        type="button"
                                        onClick={() => {
                                          handleSelectCourse(course);
                                          if (moduleLessons[0]) setActiveLesson(moduleLessons[0]);
                                        }}
                                        className="group/module rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-200 hover:bg-white"
                                      >
                                        <div className="flex items-start gap-2">
                                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-slate-700 shadow-sm">
                                            {modIdx + 1}
                                          </span>
                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-slate-900 group-hover/module:text-indigo-700">
                                              {mod.title}
                                            </p>
                                            <p className="mt-0.5 text-[10px] text-slate-500">
                                              {moduleLessons.length} lessons / {moduleProgress}% done
                                            </p>
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="text-xs text-slate-500">
                                    {course.price > 0 ? (
                                      <span className="font-semibold text-emerald-700">${course.price}/mo</span>
                                    ) : (
                                      <span>Included in community</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => {
                                      handleSelectCourse(course);
                                      if (firstLesson) setActiveLesson(firstLesson);
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                                  >
                                    Open Classroom <ChevronRight className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* CREATE MANUAL COURSE DIALOG INLINE MODAL */}
          {showCreateCourseModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-md w-full space-y-4 animate-in zoom-in-95 font-sans">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-bold text-gray-950 font-mono uppercase tracking-wider">Create New Course</h3>
                  <button onClick={() => setShowCreateCourseModal(false)} className="text-gray-450 hover:text-gray-700 cursor-pointer border-0 bg-transparent">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-gray-500 font-mono uppercase block">Course Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NextJS Multi-Tenant Boilerplate"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-350"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-gray-500 font-mono uppercase block">Acumen Description</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Deep dive setup handling routing mechanisms, edge databases, Stripe popups..."
                      value={newCourseDesc}
                      onChange={(e) => setNewCourseDesc(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-350"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-gray-500 font-mono uppercase block">Cover Picture URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newCourseCover}
                      onChange={(e) => setNewCourseCover(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-350 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-gray-500 font-mono uppercase block">Course Type</label>
                      <select
                        value={newCourseType}
                        onChange={(e) => setNewCourseType(e.target.value as CourseType)}
                        className="w-full p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-350 text-xs"
                      >
                        <option value="mini_course">Mini Course</option>
                        <option value="flagship">Flagship</option>
                        <option value="workshop">Workshop</option>
                        <option value="membership">Membership</option>
                        <option value="coaching">Coaching</option>
                        <option value="challenge">Challenge</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-gray-500 font-mono uppercase block">Difficulty</label>
                      <select
                        value={newCourseDifficulty}
                        onChange={(e) => setNewCourseDifficulty(e.target.value as DifficultyLevel)}
                        className="w-full p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-350 text-xs"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-gray-500 font-mono uppercase block">Price ($)</label>
                      <input
                        type="number"
                        min={0}
                        value={newCoursePrice}
                        onChange={(e) => setNewCoursePrice(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-350 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-gray-500 font-mono uppercase block">Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Web Development"
                        value={newCourseCategory}
                        onChange={(e) => setNewCourseCategory(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-350 text-xs"
                      />
                    </div>
                  </div>

                </div>

                <div className="flex gap-2.5 justify-end border-t border-gray-100 pt-3 shrink-0">
                  <button
                    onClick={() => setShowCreateCourseModal(false)}
                    className="px-4 py-2 hover:bg-slate-50 text-gray-500 rounded-xl text-xs font-mono font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeployNewCourse(newCourseName, newCourseDesc, newCourseCover, false)}
                    disabled={!newCourseName.trim()}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-mono font-bold uppercase cursor-pointer disabled:opacity-40"
                  >
                    ✓ Create Course
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* COURSE VIDEO PLAYER & MODULES INDEX - 3 PANEL LAYOUT */
        <div className="space-y-4">
          
          {/* Top navigation path */}
          <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-xs">
            <button
              onClick={() => setSelectedCourse(null)}
              className="text-xs font-bold text-gray-500 hover:text-indigo-600 transition flex items-center gap-1 cursor-pointer font-sans"
            >
              ← Back
            </button>
            <h3 className="text-xs font-bold text-gray-800 font-display truncate max-w-sm">
              {selectedCourse.name}
            </h3>
          </div>

          {/* Progress header card */}
          <div className="bg-gradient-to-r from-gray-950 to-indigo-950 border border-indigo-900/40 text-white flex flex-col md:flex-row p-5 rounded-2xl items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center font-bold">
                <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-wider text-orange-400 uppercase">Streak</span>
                  <span className="bg-orange-500/20 text-orange-300 text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                    {currentUser?.streak || 5} days
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Complete a lesson every day to keep your streak going.
                </p>
              </div>
            </div>

            {/* Level/XP Status info */}
            <div className="flex items-center gap-4 text-xs font-mono shrink-0">
              <div className="text-right">
                <span className="text-gray-400 block text-[9px] uppercase font-bold">Level</span>
                <span className="text-indigo-300 font-bold">{currentUser?.level || 1} ({currentUser?.xp || 0} XP)</span>
              </div>
              <div className="w-2.5 h-8 bg-gray-800 rounded-sm overflow-hidden flex flex-col justify-end">
                <div 
                  className="bg-indigo-500 w-full rounded-sm transition-all duration-500" 
                  style={{ height: `${((currentUser?.xp || 0) % 200) / 2}%` }}
                ></div>
              </div>
            </div>

            {/* Completion metrics */}
            <div className="flex flex-col flex-1 max-w-xs shrink-0 w-full">
              <div className="flex justify-between items-center text-xs font-mono mb-1">
                <span className="text-gray-450 text-[10px] uppercase font-bold">Course Progress</span>
                <span className="text-emerald-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 100% Master Certificate Header Award banner */}
          {progressPercent === 100 && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-250 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md animate-in pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center animate-spin duration-1000 shrink-0 shadow-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 font-display">Course Completed!</h4>
                  <p className="text-[11.5px] text-amber-700 leading-relaxed mt-0.5">
                    You completed this course. Claim your certificate.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCertificateModalOpen(true)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold font-sans transition shrink-0 cursor-pointer shadow-md shadow-amber-200"
              >
                Claim Certificate
              </button>
            </div>
          )}

          {/* SKOOL-STYLE MODULE MAP */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  <BookOpen className="h-3.5 w-3.5" />
                  Course path
                </span>
                <h3 className="mt-3 text-lg font-extrabold tracking-tight text-slate-950">
                  Modules
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Browse the course like a Skool classroom: modules first, lesson cards inside each module, progress always visible.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <span className="block text-base font-extrabold text-slate-950">{selectedCourse.modules?.length || 0}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Modules</span>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <span className="block text-base font-extrabold text-slate-950">{courseSyllabusLessons.length}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Lessons</span>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <span className="block text-base font-extrabold text-slate-950">{progressPercent}%</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Done</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {selectedCourse.modules?.map((mod, moduleIndex) => {
                const moduleLessons = mod.lessons || [];
                const doneCount = moduleLessons.filter((lesson) => completedLessons.includes(lesson.id)).length;
                const moduleProgress = moduleLessons.length ? Math.round((doneCount / moduleLessons.length) * 100) : 0;
                const activeInModule = moduleLessons.some((lesson) => lesson.id === activeLesson?.id);

                return (
                  <article
                    key={mod.id}
                    className={`rounded-2xl border p-4 transition ${
                      activeInModule
                        ? "border-indigo-200 bg-indigo-50/60 shadow-sm"
                        : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (moduleLessons[0]) setActiveLesson(moduleLessons[0]);
                      }}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                        activeInModule ? "bg-indigo-600 text-white" : "bg-white text-slate-700 shadow-sm"
                      }`}>
                        {moduleIndex + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-extrabold text-slate-950">{mod.title}</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500">
                          {doneCount}/{moduleLessons.length} lessons complete
                        </span>
                      </span>
                    </button>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600"
                        style={{ width: `${moduleProgress}%` }}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {moduleLessons.map((ls, lessonIndex) => {
                        const isActive = activeLesson?.id === ls.id;
                        const isDone = completedLessons.includes(ls.id);
                        return (
                          <button
                            key={ls.id}
                            type="button"
                            onClick={() => setActiveLesson(ls)}
                            className={`min-h-[82px] rounded-xl border p-3 text-left transition ${
                              isActive
                                ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${
                                isActive ? "bg-white/20 text-white" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                              }`}>
                                {isDone ? <CheckCircle className="h-3 w-3" /> : lessonIndex + 1}
                              </span>
                              {ls.isLocked ? (
                                <Lock className={`h-3.5 w-3.5 ${isActive ? "text-white/80" : "text-amber-500"}`} />
                              ) : (
                                <PlayCircle className={`h-3.5 w-3.5 ${isActive ? "text-white/80" : "text-slate-400"}`} />
                              )}
                            </div>
                            <span className="mt-2 line-clamp-2 block text-[11px] font-bold leading-snug">
                              {ls.title}
                            </span>
                            <span className={`mt-1 block text-[8px] font-bold uppercase ${
                              isActive ? "text-white/70" : "text-slate-400"
                            }`}>
                              {ls.contentType || "video"} / {ls.durationMinutes}m
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* FULL-WIDTH MODULE GRID */}
          {selectedCourse?.modules && selectedCourse.modules.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900">Course modules</h3>
                <span className="text-[10px] text-gray-400 font-medium">
                  {completedInActiveCourse.length}/{courseSyllabusLessons.length} completed
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {selectedCourse.modules.map((mod, modIdx) => {
                  const moduleLessons = mod.lessons || [];
                  const doneCount = moduleLessons.filter((l) => completedLessons.includes(l.id)).length;
                  const moduleProgress = moduleLessons.length ? Math.round((doneCount / moduleLessons.length) * 100) : 0;
                  const isActiveModule = moduleLessons.some((l) => l.id === activeLesson?.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        const firstUnfinished = moduleLessons.find((l) => !completedLessons.includes(l.id)) || moduleLessons[0];
                        if (firstUnfinished) setActiveLesson(firstUnfinished);
                      }}
                      className={`group text-left rounded-xl border p-4 transition hover:shadow-md ${
                        isActiveModule 
                          ? "border-indigo-200 bg-indigo-50/50 shadow-sm" 
                          : "border-gray-200 bg-white hover:border-indigo-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          moduleProgress === 100
                            ? "bg-emerald-100 text-emerald-700"
                            : isActiveModule
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-gray-100 text-gray-500"
                        }`}>
                          {moduleProgress === 100 ? <CheckCircle className="w-4 h-4" /> : modIdx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${
                            isActiveModule ? "text-indigo-700" : "text-gray-900 group-hover:text-indigo-700"
                          }`}>
                            {mod.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {doneCount}/{moduleLessons.length} lessons
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            moduleProgress === 100 ? "bg-emerald-500" : "bg-indigo-500"
                          }`}
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* LESSON CONTENT + NOTES + COMMENTS + RESOURCES */}
          <div className="space-y-5">
            {/* Lesson content (video/quiz/assignment/text) */}
            {activeLesson && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Media viewer or blocked panel */}
                <div className="bg-gray-950 aspect-video rounded-2xl overflow-hidden relative border border-gray-900 shadow-md">
                  {isFetchingLesson ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/60 backdrop-blur-xs">
                      <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
                      <span className="text-xs font-mono text-indigo-200">Loading lesson...</span>
                    </div>
                  ) : lessonFetchError ? (
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
                      <Lock className="w-12 h-12 text-rose-500 mb-3" />
                      <h4 className="text-sm font-bold font-display text-rose-450 mb-1">Access Denied</h4>
                      <p className="text-[11px] text-gray-400 max-w-sm mt-1 mb-4 leading-relaxed">
                        {lessonFetchError}
                      </p>
                      <button
                        onClick={() => setSelectedCourse(null)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Back to Courses
                      </button>
                    </div>
                  ) : activeLessonDetails ? (
                    activeLessonDetails.isLocked && !hasStaffOverride ? (
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
                        <Lock className="w-10 h-10 text-amber-500 mb-3 animate-bounce" />
                        <h4 className="text-sm font-bold font-display text-amber-400">Lesson Locked</h4>
                        <p className="text-[11px] text-gray-400 max-w-sm mt-1 mb-4 leading-relaxed">
                          Complete previous lessons to unlock this lesson.
                        </p>
                        <button
                          onClick={() => handleToggleCompleted(activeLessonDetails.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Unlock Lesson
                        </button>
                      </div>
                    ) : activeLessonDetails.contentType === "video" && activeLessonDetails.videoUrl ? (
                      (activeLessonDetails.videoUrl.includes("youtube.com") || activeLessonDetails.videoUrl.includes("embed") || activeLessonDetails.videoUrl.includes("movie.mp4")) ? (
                        <iframe
                          src={activeLessonDetails.videoUrl.includes("movie.mp4") ? "https://www.youtube.com/embed/dQw4w9WgXcQ" : activeLessonDetails.videoUrl}
                          title="Course Player Clip"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={`/api/lessons/${activeLessonDetails.id}/stream`}
                          controls
                          controlsList="nodownload"
                          onContextMenu={(e) => e.preventDefault()}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-900 flex flex-col justify-center items-center p-6 text-center text-white">
                        {activeLessonDetails.contentType === "quiz" ? (
                          <>
                            <ClipboardList className="w-12 h-12 text-purple-400 mb-3 animate-pulse" />
                            <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-purple-200">Quiz</h4>
                            <p className="text-[11px] text-indigo-200/80 max-w-sm mt-1">
                              Complete the quiz below to test your knowledge.
                            </p>
                          </>
                        ) : activeLessonDetails.contentType === "assignment" ? (
                          <>
                            <PenTool className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
                            <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-amber-200">Assignment</h4>
                            <p className="text-[11px] text-amber-200/85 max-w-sm mt-1">
                              Complete the assignment below to demonstrate your skills.
                            </p>
                          </>
                        ) : activeLessonDetails.contentType === "download" ? (
                          <>
                            <Download className="w-12 h-12 text-emerald-400 mb-3 animate-bounce" />
                            <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-emerald-200">Resources</h4>
                            <p className="text-[11px] text-emerald-250/80 max-w-sm mt-1">
                              Downloadable resources for this lesson.
                            </p>
                          </>
                        ) : (
                          <>
                            <FileText className="w-12 h-12 text-indigo-400 mb-3" />
                            <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-indigo-200">Reading</h4>
                            <p className="text-[11px] text-indigo-200/80 max-w-sm mt-1">
                              Read through the lesson material below.
                            </p>
                          </>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <PlayCircle className="w-12 h-12 text-gray-700 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Lesson details panel */}
                {activeLessonDetails && (
                  <div className="p-6 space-y-6">
                    {/* Title and navigation */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-mono tracking-widest bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                            Lesson {courseSyllabusLessons.findIndex(l => l.id === activeLessonDetails.id) + 1}
                          </span>
                          <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400">
                            ⏱️ {activeLessonDetails.durationMinutes} min
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 leading-tight font-display mt-1">{activeLessonDetails.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            const allLessons = courseSyllabusLessons;
                            const idx = allLessons.findIndex(l => l.id === activeLessonDetails.id);
                            if (idx > 0) setActiveLesson(allLessons[idx - 1]);
                          }}
                          disabled={courseSyllabusLessons.findIndex(l => l.id === activeLessonDetails.id) === 0}
                          className="px-3 py-2 rounded-xl border border-gray-250 text-gray-700 hover:bg-gray-50 text-[11px] font-bold font-sans transition disabled:opacity-45 cursor-pointer"
                        >
                          ← Previous
                        </button>

                        {activeLessonDetails.contentType !== "quiz" && activeLessonDetails.contentType !== "assignment" && (
                          <button
                            onClick={() => handleToggleCompleted(activeLessonDetails.id)}
                            disabled={completedLessons.includes(activeLessonDetails.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              completedLessons.includes(activeLessonDetails.id)
                                ? "bg-green-50 text-green-700 border border-green-200 cursor-not-allowed font-medium"
                                : "bg-indigo-600 hover:bg-indigo-750 text-white cursor-pointer shadow-md shadow-indigo-100"
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                            {completedLessons.includes(activeLessonDetails.id) ? "Completed" : "Mark Complete"}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const allLessons = courseSyllabusLessons;
                            const idx = allLessons.findIndex(l => l.id === activeLessonDetails.id);
                            if (idx < allLessons.length - 1) setActiveLesson(allLessons[idx + 1]);
                          }}
                          disabled={courseSyllabusLessons.findIndex(l => l.id === activeLessonDetails.id) >= courseSyllabusLessons.length - 1}
                          className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-indigo-650 text-[11px] font-bold font-sans transition disabled:opacity-45 cursor-pointer"
                        >
                          Next →
                        </button>
                      </div>
                    </div>

                    {/* Lesson Content */}
                    <div>
                      <h4 className="text-[10px] font-bold text-indigo-950 font-mono uppercase tracking-wider mb-2">Lesson Content</h4>
                      <div className="space-y-2 border-l-2 border-indigo-100 pl-4 py-1">
                        {renderRichTextPlaybook(activeLessonDetails.textContent)}
                      </div>
                    </div>

                    {/* Quiz section */}
                    {activeLessonDetails.contentType === "quiz" && (
                      <div className="bg-purple-50/40 p-5 rounded-2xl border border-purple-100 space-y-4">
                        <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                          <h4 className="text-xs font-bold font-mono text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                            <ClipboardList className="w-4 h-4 text-purple-600" /> Quiz
                          </h4>
                          <span className="text-[9.5px] font-bold font-mono text-purple-700">70% to pass</span>
                        </div>

                        <div className="space-y-4 text-xs font-sans">
                          {(activeLessonDetails.quizQuestions || []).map((q, qIdx) => {
                            const isCurrectAnswerSubmitted = quizSubmitted && (quizResults?.results?.[qIdx]?.isCorrect === true);
                            const isWrongAnswerSubmitted = quizSubmitted && (quizResults?.results?.[qIdx]?.isCorrect === false);
                            return (
                              <div key={qIdx} className="space-y-2 bg-white p-4 rounded-xl border border-purple-50">
                                <p className="font-bold text-gray-800 leading-snug">
                                  Q{qIdx + 1}: {q.question}
                                </p>
                                <div className="space-y-1.5 pt-1">
                                  {q.options.map((opt, optIdx) => {
                                    const isSelected = quizSelectedAnswers[qIdx] === optIdx;
                                    const isTheCorrectIndex = quizSubmitted && optIdx === q.answerIndex;
                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        disabled={quizSubmitted}
                                        onClick={() => setQuizSelectedAnswers({ ...quizSelectedAnswers, [qIdx]: optIdx })}
                                        className={`w-full text-left p-2.5 rounded-lg border text-[11px] transition flex items-center justify-between gap-2 ${
                                          isTheCorrectIndex 
                                            ? "bg-emerald-50 border-emerald-250 text-emerald-850 font-semibold"
                                            : isSelected
                                              ? quizSubmitted && isWrongAnswerSubmitted
                                                ? "bg-rose-50 border-rose-250 text-rose-850 font-medium"
                                                : "bg-purple-100 border-purple-400 text-purple-900 font-bold"
                                              : "hover:bg-gray-50 border-gray-150 text-gray-650"
                                        }`}
                                      >
                                        <span>{opt}</span>
                                        {isTheCorrectIndex && <span className="text-[9px] font-mono font-bold text-emerald-600">Correct</span>}
                                        {isSelected && !isTheCorrectIndex && quizSubmitted && <span className="text-[9px] font-mono font-bold text-rose-500">Your answer</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {quizSubmitted && quizResults && (
                          <div className={`p-4 rounded-xl border ${
                            quizResults.passed 
                              ? "bg-emerald-50/50 border-emerald-200 text-emerald-950" 
                              : "bg-rose-50/50 border-rose-150 text-rose-950"
                          } text-xs leading-relaxed space-y-1`}>
                            <div className="flex justify-between items-center font-bold">
                              <span>Results</span>
                              <span className={`text-sm font-mono font-bold uppercase ${quizResults.passed ? "text-emerald-700" : "text-rose-700"}`}>
                                {quizResults.passed ? "Passed" : "Failed"}
                              </span>
                            </div>
                            <p className="text-[11px] mt-1 text-gray-600">
                              You scored <strong>{Math.round(quizResults.percent)}%</strong> ({quizResults.correctCount} / {quizResults.totalQuestions}).
                              {quizResults.passed ? " You passed the quiz!" : " Review the material and try again."}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 justify-end pt-2">
                          {quizSubmitted ? (
                            <button
                              type="button"
                              onClick={() => { setQuizSubmitted(false); setQuizSelectedAnswers({}); setQuizResults(null); }}
                              className="px-4 py-2 bg-white hover:bg-gray-55 shadow-xs border border-purple-200 text-purple-750 font-bold text-[11px] rounded-xl transition cursor-pointer"
                            >
                              Retake
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleQuizSubmit}
                              disabled={isSubmittingQuiz || Object.keys(quizSelectedAnswers).length < (activeLessonDetails.quizQuestions?.length || 0)}
                              className="px-5 py-2 bg-purple-650 hover:bg-purple-750 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                            >
                              {isSubmittingQuiz ? "Submitting..." : "Submit Answers"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Assignment section */}
                    {activeLessonDetails.contentType === "assignment" && (
                      <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100 space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-150 pb-1.5">
                          <h4 className="text-xs font-bold font-mono text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                            <ClipboardList className="w-4 h-4 text-amber-600" /> Assignment
                          </h4>
                        </div>

                        <div className="bg-white border rounded-xl p-4 text-xs shadow-xs space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest font-bold text-gray-400">Instructions</label>
                          <p className="font-semibold text-gray-750 font-sans leading-relaxed whitespace-pre-line">
                            {activeLessonDetails.assignmentInstructions || activeLessonDetails.textContent}
                          </p>
                        </div>

                        {assignmentSubmission ? (
                          <div className="space-y-4">
                            <div className="bg-white border-2 border-amber-400 rounded-xl p-4 shadow-sm space-y-2 relative">
                              <span className="absolute top-3 right-3 text-sm font-mono font-bold text-amber-500 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md shadow-lg rotate-3 uppercase">
                                Grade {assignmentSubmission.grade || "A+"}
                              </span>
                              <h5 className="font-bold text-gray-900 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-emerald-500" /> Assignment Graded
                              </h5>
                              <div className="pt-2 border-t border-gray-50 text-[11px] text-gray-500">
                                <strong className="text-gray-700 block mb-1">Your submission:</strong>
                                <p className="bg-gray-50 p-2.5 rounded-lg border italic">{assignmentSubmission.text}</p>
                              </div>
                              <div className="pt-3 border-t border-gray-50 leading-relaxed text-[11px] text-indigo-950">
                                <span className="text-[9px] font-mono font-bold block uppercase text-indigo-500 mb-0.5">Instructor feedback</span>
                                <p className="font-medium bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">{assignmentSubmission.feedback}</p>
                              </div>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <p className="text-[10.5px] text-emerald-850">Assignment submitted successfully (+20 XP).</p>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleAssignmentSubmit} className="space-y-4 font-sans text-xs">
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">Your response</label>
                              <textarea
                                rows={3}
                                required
                                placeholder="Write your answer here..."
                                value={assignmentText}
                                onChange={(e) => setAssignmentText(e.target.value)}
                                className="w-full bg-white border border-gray-250 px-3.5 py-2 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase">Attachment (optional):</label>
                                <select
                                  value={assignmentFile}
                                  onChange={(e) => setAssignmentFile(e.target.value)}
                                  className="w-full bg-white border border-gray-250 px-3 py-1.5 rounded-xl text-[11px] text-gray-700 focus:outline-none"
                                >
                                  <option value="redis_compaction_blueprint.pdf">redis_compaction_blueprint.pdf</option>
                                  <option value="sliding_context_window.ts">sliding_context_window.ts</option>
                                  <option value="starter_cookbox.md">starter_cookbox.md</option>
                                </select>
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="submit"
                                  disabled={isSubmittingAssignment || !assignmentText.trim()}
                                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                                >
                                  {isSubmittingAssignment ? "Submitting..." : "Submit Assignment"}
                                </button>
                              </div>
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                    {/* Attachments */}
                    {activeLessonDetails.attachments && activeLessonDetails.attachments.length > 0 && (
                      <div className="pt-5 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-805 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5 text-indigo-950">
                          <Download className="w-4 h-4 text-indigo-600" /> Attachments
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeLessonDetails.attachments.map((file, fIdx) => (
                            <div key={fIdx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-2 hover:bg-gray-100 transition">
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-gray-800 truncate block font-sans" title={file}>
                                  {file}
                                </span>
                                <span className="text-[9px] text-gray-450 font-mono block">Resource file</span>
                              </div>
                              <a
                                href={`/api/lessons/${activeLessonDetails.id}/downloads/${encodeURIComponent(file)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                              >
                                <Download className="w-3 h-3" /> Download
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Discussion + Notes + Resources grid */}
            {activeLesson && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Discussion */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col h-[480px]">
                  <div className="border-b border-gray-55 pb-2 mb-2 shrink-0">
                    <span className="text-[9px] uppercase font-mono tracking-widest font-bold text-indigo-600 block">Discussion</span>
                    <h4 className="text-xs font-bold text-gray-900 font-display flex items-center gap-1 mt-0.5">
                      💬 Discussion ({lessonComments.length})
                    </h4>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5">
                    {lessonComments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 flex flex-col items-center justify-center h-full">
                        <BookOpen className="w-6 h-6 text-gray-200 mb-1.5" />
                        <p className="text-[10px] font-medium">No comments yet</p>
                        <p className="text-[8.5px] text-gray-500 max-w-[160px] mx-auto mt-0.5 leading-normal">
                          Start a discussion about this lesson.
                        </p>
                      </div>
                    ) : (
                      lessonComments.map((comm) => {
                        const commentsLikesCount = commentLikes[comm.id] || 0;
                        const hasLiked = likedComments.includes(comm.id);
                        const commentSubReplies = commentReplies[comm.id] || [];
                        return (
                          <div key={comm.id} className="text-[10.5px] bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 relative transition">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <img
                                  src={comm.authorAvatar}
                                  alt={comm.authorName}
                                  referrerPolicy="no-referrer"
                                  className="w-5 h-5 rounded-full object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="font-bold text-gray-800 truncate block text-[10px]" title={comm.authorName}>
                                    {comm.authorName}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1 items-center shrink-0">
                                {pinnedComments.includes(comm.id) && (
                                  <span className="text-[7.5px] bg-indigo-100 text-indigo-850 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                                    📌 Pinned
                                  </span>
                                )}
                                {featuredComments.includes(comm.id) && (
                                  <span className="text-[7.5px] bg-amber-100 text-amber-850 px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0">
                                    ⭐ Featured
                                  </span>
                                )}
                                <span className="text-[7.5px] bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded font-mono font-bold scale-95 uppercase shrink-0">
                                  {comm.authorRole || "Student"}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-normal pl-0.5 whitespace-pre-wrap">{comm.content}</p>
                            <div className="flex items-center gap-3 pt-1 text-[9.5px] text-gray-450 font-mono shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  if (hasLiked) {
                                    setLikedComments(likedComments.filter(id => id !== comm.id));
                                    setCommentLikes(prev => ({ ...prev, [comm.id]: Math.max(0, (prev[comm.id] || 0) - 1) }));
                                  } else {
                                    setLikedComments([...likedComments, comm.id]);
                                    setCommentLikes(prev => ({ ...prev, [comm.id]: (prev[comm.id] || 0) + 1 }));
                                  }
                                }}
                                className={`flex items-center gap-1 hover:text-rose-600 transition font-bold shrink-0 ${hasLiked ? "text-rose-600" : ""}`}
                              >
                                ❤️ {commentsLikesCount + (comm.likesCount || 0)} likes
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveReplyInputId(activeReplyInputId === comm.id ? null : comm.id)}
                                className="font-bold hover:text-indigo-650 transition cursor-pointer"
                              >
                                💬 Reply ({commentSubReplies.length})
                              </button>
                              {hasStaffOverride && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (pinnedComments.includes(comm.id)) {
                                        setPinnedComments(pinnedComments.filter(id => id !== comm.id));
                                      } else {
                                        setPinnedComments([...pinnedComments, comm.id]);
                                      }
                                    }}
                                    className={`hover:text-indigo-655 font-bold transition cursor-pointer ${pinnedComments.includes(comm.id) ? "text-indigo-600" : ""}`}
                                  >
                                    📌 {pinnedComments.includes(comm.id) ? "Unpin" : "Pin"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (featuredComments.includes(comm.id)) {
                                        setFeaturedComments(featuredComments.filter(id => id !== comm.id));
                                      } else {
                                        setFeaturedComments([...featuredComments, comm.id]);
                                      }
                                    }}
                                    className={`hover:text-amber-655 font-bold transition cursor-pointer ${featuredComments.includes(comm.id) ? "text-amber-500" : ""}`}
                                  >
                                    ⭐ {featuredComments.includes(comm.id) ? "Unfeature" : "Feature"}
                                  </button>
                                </>
                              )}
                            </div>
                            {commentSubReplies.length > 0 && (
                              <div className="border-l-2 border-gray-200 pl-2.5 mt-2 space-y-1.5 ml-1">
                                {commentSubReplies.map((rep) => (
                                  <div key={rep.id} className="bg-white/80 rounded-lg p-2 border border-gray-100 space-y-0.5 text-[9.5px]">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-gray-800">{rep.authorName}</span>
                                      <span className="text-[7.5px] font-mono text-gray-400">
                                        {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-gray-650 leading-normal">{rep.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {activeReplyInputId === comm.id && (
                              <form
                                onSubmit={(e) => { e.preventDefault(); const text = commentReplyText[comm.id]?.trim(); if (!text) return; setCommentReplies(prev => ({ ...prev, [comm.id]: [...(prev[comm.id] || []), { id: `rep_${Date.now()}`, authorName: currentUser?.fullName || "Student", authorAvatar: currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80", content: text, createdAt: new Date().toISOString() }] })); setCommentReplyText(prev => ({ ...prev, [comm.id]: "" })); setActiveReplyInputId(null); }}
                                className="mt-2.5 flex gap-1 items-center bg-white border border-gray-150 p-1 rounded-xl shrink-0"
                              >
                                <input
                                  type="text"
                                  required
                                  placeholder="Write a reply..."
                                  value={commentReplyText[comm.id] || ""}
                                  onChange={(e) => setCommentReplyText(prev => ({ ...prev, [comm.id]: e.target.value }))}
                                  className="flex-1 px-2.5 py-1 text-[9.5px] bg-transparent text-gray-800 focus:outline-none min-w-0"
                                />
                                <button type="submit" className="p-1 bg-indigo-650 text-white rounded-lg hover:bg-indigo-750 transition"><Send className="w-2.5 h-2.5" /></button>
                              </form>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <form onSubmit={handlePostLessonComment} className="pt-2 shrink-0 border-t border-gray-100">
                    <div className="flex gap-1">
                      <input
                        type="text"
                        required
                        placeholder="Add a comment..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[10px] placeholder-gray-400 text-gray-850 focus:outline-none focus:ring-1 focus:ring-indigo-550"
                      />
                      <button
                        type="submit"
                        disabled={isSendingComment || !newCommentText.trim() || !activeLesson}
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer disabled:opacity-40"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Notes + Resources stacked */}
                <div className="space-y-4">
                  {/* Notes */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col h-[200px]">
                    <div className="flex justify-between items-center mb-1.5 shrink-0">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400">Notes</span>
                      <span className="text-[8px] px-1.5 py-0.2 font-mono bg-emerald-50 text-emerald-700 rounded font-bold uppercase">Auto-saved</span>
                    </div>
                    <textarea
                      value={activeNotes}
                      onChange={(e) => handleSaveNotes(e.target.value)}
                      placeholder="Write your notes for this lesson..."
                      className="flex-1 bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 text-[10.5px] placeholder-gray-400 text-gray-800 leading-normal font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium resize-none min-h-0"
                    />
                  </div>

                  {/* Resources */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 block">Resources</span>
                    {activeLessonDetails?.attachments && activeLessonDetails.attachments.length > 0 ? (
                      <div className="space-y-1.5">
                        {activeLessonDetails.attachments.map((file, fIdx) => (
                          <div key={fIdx} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between gap-1.5 hover:border-indigo-150 transition">
                            <div className="min-w-0 pr-1">
                              <span className="text-[10.5px] font-bold text-gray-850 truncate block" title={file}>{file}</span>
                              <span className="text-[8.5px] text-indigo-500 font-mono block mt-0.5">Resource file</span>
                            </div>
                            <a
                              href={`/api/lessons/${activeLessonDetails.id}/downloads/${encodeURIComponent(file)}`}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-150 text-indigo-700 rounded-lg text-[9px] font-mono font-bold uppercase shrink-0"
                            >
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center text-[10px] text-gray-400 font-mono italic">
                        No resources for this lesson.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LUXURIOUS CERTIFICATE MODAL */}
      {certificateModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative border-8 border-amber-500 p-8 sm:p-12 space-y-6 text-center animate-in zoom-in-95 duration-300 select-none">
            
            {/* Background design elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rotate-45 transform -translate-x-16 -translate-y-16 border-2 border-amber-500/20 rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rotate-45 transform translate-x-16 translate-y-16 border-2 border-amber-500/20 rounded-full"></div>

            {/* Close modal header action */}
            <div className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <button onClick={() => setCertificateModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Header Banner */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-amber-600 tracking-widest uppercase block animate-pulse">
                Professional Accreditations Certificate of Complete Syllabus Mastering
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-indigo-950 italic font-semibold">
                Syllabus Accomplishment Credential
              </h2>
              <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2"></div>
            </div>

            {/* Certification Statement bodies */}
            <div className="space-y-5 font-sans pt-3">
              <p className="text-xs text-gray-500 italic">This document officially accredits and certifies that</p>
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 max-w-md mx-auto">
                {currentUser?.fullName || "Distinguished Classroom Student"}
              </h3>

              <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed italic">
                has successfully completed all lectures, workbook checklists, downloadable companion sheets, assignments, and MCQ quiz examinations for the training program
              </p>

              <h4 className="text-md font-extrabold text-indigo-900 bg-indigo-50/50 border border-indigo-100 p-3 rounded-2xl max-w-xl mx-auto">
                {selectedCourse.name}
              </h4>

              <p className="text-[10.5px] text-gray-450 leading-relaxed max-w-sm mx-auto">
                Given on this day of {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} under authorization of <strong>{activeCommunity?.name || "AI Collective"} Workspace Community</strong>.
              </p>
            </div>

            {/* Signatures & Accreditation Seal Column row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center pt-6 border-t border-gray-100">
              
              {/* Signature 1 */}
              <div className="text-center font-sans">
                <span className="font-serif italic text-sm text-gray-700 block select-text">Alex Rivera</span>
                <div className="w-32 h-px bg-gray-200 mx-auto my-1"></div>
                <span className="text-[9px] font-mono text-gray-400 uppercase font-bold uppercase">Alex Rivera (Creator/Founder)</span>
              </div>

              {/* Accreditation Seal Graphics */}
              <div className="flex justify-center shrink-0">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500 bg-amber-50 flex items-center justify-center font-bold text-amber-600 shadow-md">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-tighter">VERIFIED</span>
                </div>
              </div>

              {/* Signature 2 */}
              <div className="text-center font-sans">
                <span className="font-serif italic text-sm text-gray-700 block select-text">Academics Board</span>
                <div className="w-32 h-px bg-gray-200 mx-auto my-1"></div>
                <span className="text-[9px] font-mono text-gray-400 uppercase font-bold uppercase">Syllabus Accreditation Committee</span>
              </div>

            </div>

            {/* Verification Serial ID code block */}
            <div className="text-center bg-gray-50 border p-2.5 rounded-xl max-w-xs mx-auto animate-pulse">
              <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest block font-bold">SHA-256 ACCREDITATION ID SERIAL</span>
              <span className="text-[10px] font-mono text-gray-600 block">
                cert-sha256-{Date.now().toString(16).substring(0, 8)}-{currentUser?.id?.substring(0, 4)}
              </span>
            </div>

            {/* Print trigger actions */}
            <div className="pt-4 flex gap-3 justify-center shrink-0 font-sans">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                🖨️ PDF / Print Accreditations
              </button>
              <button
                onClick={() => setCertificateModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition"
              >
                Close Certificate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MANUAL COURSE CREATOR POPUP OVERLAY */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-indigo-950 p-6 text-white shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase font-mono bg-indigo-500/30 px-3 py-1 rounded-full font-bold">
                  🛠️ Course Builder
                </span>
                <button onClick={() => setShowManualModal(false)} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold font-display mt-2 text-white">Create Course</h3>
              <p className="text-sm text-indigo-200 mt-1">
                Design custom modules, leverage our smart plaintext course outline editor, utilize preset structural templates, and construct active MCQ quizzes.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveManualCourse(); }} className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
              
              {/* Course Identity Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-indigo-950 font-mono uppercase tracking-wider border-b pb-1">1. Curriculum Identity</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans">
                  <div>
                    <label className="block font-semibold text-gray-750 mb-1.5 text-sm">Course Name / Title <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Masterclass in Scalable Architecture"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-250 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-505 bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-750 mb-1.5 text-sm">Cover Photo Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={manualCover}
                      onChange={(e) => setManualCover(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-250 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-505 bg-gray-50/50"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block font-semibold text-gray-750 mb-1.5 text-sm">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief summary of the course."
                      value={manualDesc}
                      onChange={(e) => setManualDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-250 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-505 bg-gray-50/50"
                    />
                  </div>

                </div>
              </div>

              {/* Syllabus Outline Builder */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950 font-mono uppercase tracking-wider">Modules & Lessons</h4>
                    <p className="text-sm text-gray-500 mt-0.5">Organize your course content into modules and lessons.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleOpenStudioNewModule}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100"
                    >
                      ✨ + Add Module via Studio
                    </button>
                  </div>
                </div>

                <div className="space-y-5 text-sm font-sans border-gray-100">
                  {manualModules.length === 0 ? (
                    <div className="text-center py-10 border border-dashed rounded-2xl border-gray-300 text-sm text-gray-500 bg-gray-50/50">
                      <p className="font-semibold text-gray-700 text-sm">No modules compiled yet.</p>
                      <p className="text-sm text-gray-400 mt-1 mb-3">Click "+ Add Module via Studio" to import outlines, write freehand, or build lessons instantly.</p>
                      <button
                        type="button"
                        onClick={handleOpenStudioNewModule}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white text-sm font-bold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        ⚡ Open Interactive Builder Studio
                      </button>
                    </div>
                  ) : (
                    manualModules.map((mod, modIdx) => (
                      <div key={modIdx} className="border border-gray-200 rounded-3xl p-5 bg-gray-50/60 space-y-4 relative">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-3">
                          <div className="flex-1">
                            <span className="text-sm font-mono font-bold text-indigo-600 uppercase">Module {modIdx + 1} Profile Configuration</span>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                required
                                placeholder="e.g. Fundamentals of Syntax"
                                value={mod.title}
                                onChange={(e) => handleModuleTitleChange(modIdx, e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-505"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleOpenStudioExistingModule(modIdx)}
                              className="bg-indigo-100 hover:bg-indigo-600 hover:text-white text-indigo-700 px-3.5 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              ✨ Open in Studio
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveModuleField(modIdx)}
                              className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 px-3.5 py-2 rounded-xl text-sm transition font-bold cursor-pointer"
                            >
                              Delete Module
                            </button>
                          </div>
                        </div>

                        {/* Lessons inside Module */}
                        <div className="pl-4 border-l-2 border-indigo-150 space-y-4">
                          <span className="text-sm font-mono font-bold text-indigo-500 uppercase block">Active Lessons Within Module ({mod.lessons?.length || 0})</span>
                          
                          {mod.lessons.map((ls, lsIdx) => (
                            <div key={lsIdx} className="bg-white border text-sm rounded-2xl p-4 shadow-sm space-y-3.5 relative text-sm font-sans">
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                
                                <div className="md:col-span-4 space-y-1">
                                  <label className="text-sm font-bold text-gray-700 font-sans">Lecture Title Name <span className="text-red-550">*</span></label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Structural layout of models"
                                    value={ls.title}
                                    onChange={(e) => handleLessonChange(modIdx, lsIdx, "title", e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-sm text-gray-800"
                                  />
                                </div>

                                <div className="md:col-span-3 space-y-1">
                                  <label className="text-sm font-bold text-gray-700 font-sans">Lecture Format Type <span className="text-red-550">*</span></label>
                                  <select
                                    value={ls.contentType}
                                    onChange={(e) => handleLessonChange(modIdx, lsIdx, "contentType", e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-sm text-gray-800"
                                  >
                                    <option value="video">🎥 Video Lesson</option>
                                    <option value="text">📖 Notion Text Playbook</option>
                                    <option value="download">📥 Companion PDF Downloads</option>
                                    <option value="quiz">📝 Interactive MCQ Quiz</option>
                                    <option value="assignment">💼 Portfolio Assignment</option>
                                  </select>
                                </div>

                                <div className="md:col-span-2 space-y-1">
                                  <label className="text-sm font-bold text-gray-700">Duration (Minutes) <span className="text-red-550">*</span></label>
                                  <input
                                    type="number"
                                    required
                                    min="1"
                                    value={ls.durationMinutes}
                                    onChange={(e) => handleLessonChange(modIdx, lsIdx, "durationMinutes", Number(e.target.value))}
                                    className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-sm text-gray-800"
                                  />
                                </div>

                                <div className="md:col-span-3 space-y-1">
                                  <label className="text-sm font-bold text-gray-700">Attachment Title (Optional)</label>
                                  <input
                                    type="text"
                                    placeholder="WorkbookPrerequisite.pdf"
                                    value={ls.attachments?.[0] || ""}
                                    onChange={(e) => handleLessonChange(modIdx, lsIdx, "attachments", e.target.value ? [e.target.value] : [])}
                                    className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-sm text-gray-800"
                                  />
                                </div>

                                {ls.contentType === "video" && (
                                  <div className="md:col-span-12 space-y-1 animate-in slide-in-from-top-1.5 duration-100">
                                    <label className="text-sm font-bold text-gray-700">Video Embed HTML / Source Link</label>
                                    <input
                                      type="text"
                                      placeholder="https://www.youtube.com/embed/..."
                                      value={ls.videoUrl}
                                      onChange={(e) => handleLessonChange(modIdx, lsIdx, "videoUrl", e.target.value)}
                                      className="w-full px-3 py-1.5 border border-gray-250 rounded-xl text-sm text-gray-850 font-mono"
                                    />
                                  </div>
                                )}

                                <div className="md:col-span-12 space-y-1">
                                  <label className="text-sm font-bold text-gray-700">
                                    {ls.contentType === "assignment" 
                                      ? "Assignment Student Work Instructions (Markdown)" 
                                      : "Lesson Reference Workbook Study Text (Markdown)"}
                                  </label>
                                  <textarea
                                    rows={2}
                                    placeholder="Support writing formulas, reference diagrams, rules or guide links..."
                                    value={ls.textContent}
                                    onChange={(e) => handleLessonChange(modIdx, lsIdx, "textContent", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-250 rounded-xl text-sm text-gray-800"
                                  />
                                </div>

                                {/* MCQ QUIZ NESTED CREATOR */}
                                {ls.contentType === "quiz" && (
                                  <div className="md:col-span-12 bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-3 font-sans text-sm">
                                    <div className="flex justify-between items-center border-b pb-2">
                                      <span className="text-sm font-mono font-bold text-purple-750 uppercase">MCQ Quiz Builder Portal</span>
                                      <button
                                        type="button"
                                        onClick={() => handleAddQuizQuestionField(modIdx, lsIdx)}
                                        className="text-sm font-bold text-purple-800 bg-white border border-purple-200 px-3.5 py-2 rounded-xl cursor-pointer hover:bg-purple-100 transition shadow-sm"
                                      >
                                        + Add Quiz Question
                                      </button>
                                    </div>

                                    <div className="space-y-4 text-sm">
                                      {(ls.quizQuestions || []).map((q, qIdx) => (
                                        <div key={qIdx} className="bg-white p-4 rounded-xl border border-purple-100 space-y-3">
                                          <div className="flex justify-between items-center">
                                            <span className="font-bold text-purple-900 font-mono text-sm">Question #{qIdx + 1}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = [...manualModules];
                                                updated[modIdx].lessons[lsIdx].quizQuestions = updated[modIdx].lessons[lsIdx].quizQuestions?.filter((_, idx) => idx !== qIdx);
                                                setManualModules(updated);
                                              }}
                                              className="text-sm text-rose-600 font-bold cursor-pointer"
                                            >
                                              × Remove Q
                                            </button>
                                          </div>

                                          <div className="space-y-1.5">
                                            <input
                                              type="text"
                                              required
                                              placeholder="Type the validation query..."
                                              value={q.question}
                                              onChange={(e) => handleQuizQuestionChange(modIdx, lsIdx, qIdx, "question", e.target.value)}
                                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium"
                                            />
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {q.options.map((opt, optIdx) => (
                                              <div key={optIdx} className="flex gap-2 items-center">
                                                <span className="text-sm font-mono text-gray-500 mr-0.5">{optIdx + 1}:</span>
                                                <input
                                                  type="text"
                                                  required
                                                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                                  value={opt}
                                                  onChange={(e) => handleQuizQuestionOptionChange(modIdx, lsIdx, qIdx, optIdx, e.target.value)}
                                                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                                                />
                                              </div>
                                            ))}
                                          </div>

                                          <div className="pt-2 flex items-center gap-3">
                                            <label className="text-sm font-bold text-gray-600">Which is the CORRECT answer option?</label>
                                            <select
                                              value={q.answerIndex}
                                              onChange={(e) => handleQuizQuestionChange(modIdx, lsIdx, qIdx, "answerIndex", Number(e.target.value))}
                                              className="bg-purple-100/60 border border-purple-250 text-purple-950 rounded-xl px-3.5 py-2 font-semibold text-sm focus:outline-none cursor-pointer"
                                            >
                                              <option value={0}>Option 1</option>
                                              <option value={1}>Option 2</option>
                                              <option value={2}>Option 3</option>
                                              <option value={3}>Option 4</option>
                                            </select>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLessonField(modIdx, lsIdx)}
                                  className="text-sm font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                                >
                                  × Delete Lesson node
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddLessonField(modIdx)}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-2 cursor-pointer py-1"
                          >
                            + Add Syllabus Lecture Lesson Node
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>

            </form>

            <div className="p-6 bg-gray-50 border-t border-gray-150 flex gap-3 justify-end shrink-0 rounded-b-3xl text-sm">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Discard Drafts
              </button>
              <button
                type="button"
                onClick={handleSaveManualCourse}
                disabled={isManualSaving || !manualName.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-md shadow-indigo-100 flex items-center gap-1 disabled:opacity-50"
              >
                {isManualSaving ? "Compiling..." : "Save Custom Curriculum"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* INTERACTIVE MODULE STUDIO (IMS) OVERLAY */}
      {showStudioModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col h-[85vh] max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 text-sm">
            
            {/* Header */}
            <div className="bg-slate-950 p-6 border-b border-slate-800/80 shrink-0 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] uppercase font-mono bg-indigo-500/25 text-indigo-300 px-3 py-1 rounded-full font-bold tracking-wider">
                    ✨ Interactive Module Studio
                  </span>
                  <span className="text-[12px] bg-slate-850 text-emerald-400 border border-slate-750 px-2.5 py-0.5 rounded-md font-mono">
                    {studioModuleIndex === null ? "Adding New Module" : `Editing Module #${studioModuleIndex + 1}`}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-display mt-2 text-white">Advanced Module Outline Architect & Copilot</h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  Type, paste raw text documents, choose elegant preset structures, or let AI generate comprehensive custom lessons automatically.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowStudioModal(false)}
                className="bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white p-2 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selectors */}
            <div className="bg-slate-900/40 px-6 py-3 border-b border-slate-800 flex gap-2 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setStudioTab("paste")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                  studioTab === "paste"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30 font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-755 hover:text-white"
                }`}
              >
                📋 Type / Paste Outline
              </button>
              <button
                type="button"
                onClick={() => setStudioTab("prompt")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                  studioTab === "prompt"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30 font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-755 hover:text-white"
                }`}
              >
                🤖 AI Copilot Generator
              </button>
              <button
                type="button"
                onClick={() => setStudioTab("templates")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                  studioTab === "templates"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30 font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-755 hover:text-white"
                }`}
              >
                📂 Preset Course Templates
              </button>
              <button
                type="button"
                onClick={() => setStudioTab("form")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                  studioTab === "form"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30 font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-755 hover:text-white"
                }`}
              >
                ✍️ Bento Lesson Editor
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
              
              {/* Left Pane (Interaction Zone) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {studioTab === "paste" && (
                  <div className="space-y-4 h-full flex flex-col">
                    
                    {/* WYSIWYG Tab Selector Toggles */}
                    <div className="flex justify-between items-center bg-slate-950 p-2 border border-slate-800 rounded-2xl shrink-0">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={handleSwitchToWysiwyg}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            editorMode === "wysiwyg"
                              ? "bg-indigo-650 text-white shadow-md shadow-indigo-900/45"
                              : "bg-transparent text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          ✍️ Visual WYSIWYG Blocks
                        </button>
                        <button
                          type="button"
                          onClick={handleSwitchToRaw}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            editorMode === "raw"
                              ? "bg-indigo-650 text-white shadow-md shadow-indigo-900/45"
                              : "bg-transparent text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          💻 Plain Outline Code
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const outline = "Module Title: Mastering React State Lifecycle\n" +
                            "- Lecture 01: Core Render Hooks & Sinks (video, 15 mins)\n" +
                            "- Lecture 02: Advanced Context & Store Decoupling (text, 25 mins)\n" +
                            "- Core Hooks Knowledge Check (quiz, 10 mins)\n" +
                            "  ? Which statement represents true React rendering rules?\n" +
                            "  o: State updates trigger synchronized sweeps, Virtual DOM renders bypass side-effects, Effects sync post-commit, none of the above\n" +
                            "  a: 3\n" +
                            "- Custom Storage Syncloop Project (assignment, 45 mins)";
                          setStudioOutlineText(outline);
                          const parsed = parseModuleOutline(outline);
                          setStudioModuleTitle(parsed.title);
                          setStudioLessons(parsed.lessons);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer mr-1"
                      >
                        ⚡ Insert Sample Outline
                      </button>
                    </div>

                    {editorMode === "raw" ? (
                      <div className="flex-1 flex flex-col space-y-3 min-h-[300px]">
                        <p className="text-sm text-slate-400 leading-relaxed font-sans">
                          Format outline structure below. Watch it live parse and format into real structured lessons on the right panel! Use syntax keys <code className="text-xs font-mono text-indigo-400 font-bold">-</code> for lessons, <code className="text-xs font-mono text-indigo-400 font-bold">?</code> for quiz questions, <code className="text-xs font-mono text-indigo-400 font-bold">o:</code> for choices, and <code className="text-xs font-mono text-indigo-400 font-bold">a:</code> for answer indexes.
                        </p>
                        <div className="flex-1 relative">
                          <textarea
                            value={studioOutlineText}
                            onChange={(e) => setStudioOutlineText(e.target.value)}
                            placeholder="Module Title: [Module title text]\n- Live Video 1 (video, 15m)\n- Notion playbook notes (text, 25m)\n..."
                            className="w-full h-full p-4 bg-slate-950 border border-slate-800 rounded-3xl text-sm font-mono leading-relaxed text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      // DETAILED VISUAL WYSIWYG BLOCK EDITOR
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px] max-h-[500px]">
                        
                        {/* 1. Module Title Block */}
                        <div className="bg-slate-950/60 p-4 border border-indigo-900/30 rounded-2xl space-y-2 relative">
                          <div className="absolute top-3 right-4 flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-mono bg-indigo-950 text-indigo-300 border border-indigo-900 px-2 py-0.5 rounded-md font-bold">
                              Core Header Node
                            </span>
                          </div>
                          <label className="text-xs font-bold text-indigo-300 font-mono tracking-wider block">📂 MODULE SYLLABUS TITLE</label>
                          <input
                            type="text"
                            value={studioModuleTitle}
                            onChange={(e) => handleUpdateBlockEditor(e.target.value, studioLessons)}
                            placeholder="Enter Module Title (e.g., Advanced Backend Routing & Storage)..."
                            className="w-full bg-transparent border-b border-slate-800 pb-2 text-md font-extrabold text-white focus:outline-none focus:border-indigo-500 transition font-sans placeholder:text-slate-500 mt-1"
                          />
                        </div>

                        {/* 2. Visual Lesson Block Stack */}
                        <div className="space-y-3.5">
                          {studioLessons.length === 0 ? (
                            <div className="text-center py-12 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
                              <span className="text-2xl">📝</span>
                              <p className="text-sm font-semibold text-slate-400">All Blocks Cleared</p>
                              <p className="text-xs text-slate-500">Insert custom visual elements below to build the syllabus.</p>
                            </div>
                          ) : (
                            studioLessons.map((ls, idx) => (
                              <div key={idx} className="bg-slate-950/45 p-4 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700/60 transition relative group animate-in slide-in-from-top-2 duration-150">
                                
                                {/* Card Control Bar */}
                                <div className="flex justify-between items-center pb-2 border-b border-slate-900 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 flex items-center justify-center bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-indigo-400 font-extrabold">
                                      {idx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-300 font-sans tracking-wide">
                                      {ls.contentType === "video" ? "🎥 Video Lecture Block" :
                                       ls.contentType === "text" ? "📖 Notion Playbook Block" :
                                       ls.contentType === "download" ? "📥 PDF Handout Block" :
                                       ls.contentType === "quiz" ? "❓ MCQ Quiz Knowledge Check" : "💼 Portfolio Assignment Block"}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 bg-slate-900/60 p-0.5 rounded-lg border border-slate-805">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => reorderLessonBlock(idx, "up")}
                                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                      title="Move Block Up"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === studioLessons.length - 1}
                                      onClick={() => reorderLessonBlock(idx, "down")}
                                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                                      title="Move Block Down"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-px h-3 bg-slate-850 block mx-0.5" />
                                    <button
                                      type="button"
                                      onClick={() => deleteLessonBlock(idx)}
                                      className="p-1 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                                      title="Delete Block Element"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Content Fields Grid Row */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-sm font-sans pt-1">
                                  <div className="md:col-span-6 space-y-1">
                                    <label className="text-[11px] font-bold text-slate-405 block uppercase tracking-wider">Lesson / Lecture Title</label>
                                    <input
                                      type="text"
                                      value={ls.title || ""}
                                      onChange={(e) => updateLessonBlockField(idx, "title", e.target.value)}
                                      placeholder="e.g. Masterclass in spec routing..."
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-505 focus:ring-1 focus:ring-indigo-500 transition"
                                    />
                                  </div>

                                  <div className="md:col-span-4 space-y-1">
                                    <label className="text-[11px] font-bold text-slate-405 block uppercase tracking-wider">Lecture content Type</label>
                                    <select
                                      value={ls.contentType || "video"}
                                      onChange={(e) => updateLessonBlockField(idx, "contentType", e.target.value)}
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-505 focus:ring-1 focus:ring-indigo-500 transition cursor-pointer"
                                    >
                                      <option value="video">🎥 Video Lesson</option>
                                      <option value="text">📖 Notion Text Playbook</option>
                                      <option value="quiz">❓ Interactive MCQ Quiz</option>
                                      <option value="download">📥 PDF Resources Workbook</option>
                                      <option value="assignment">💼 Homework Assignment</option>
                                    </select>
                                  </div>

                                  <div className="md:col-span-2 space-y-1">
                                    <label className="text-[11px] font-bold text-slate-405 block uppercase tracking-wider">Duration (Mins)</label>
                                    <input
                                      type="number"
                                      value={ls.durationMinutes || 10}
                                      onChange={(e) => updateLessonBlockField(idx, "durationMinutes", Number(e.target.value))}
                                      placeholder="Mins"
                                      min={1}
                                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-505 focus:ring-1 focus:ring-indigo-500 text-center font-mono"
                                    />
                                  </div>
                                </div>

                                {/* Content-Type Specific visual configurations option */}
                                {ls.contentType === "video" && (
                                  <div className="bg-slate-950/80 p-3.5 border border-slate-900 rounded-xl space-y-1.5 animate-in slide-in-from-top-1.5 duration-100">
                                    <label className="text-[11px] font-semibold text-indigo-300 block uppercase font-mono tracking-wider">YouTube / Vimeo Embed URL Block</label>
                                    <input
                                      type="text"
                                      value={ls.videoUrl || ""}
                                      onChange={(e) => updateLessonBlockField(idx, "videoUrl", e.target.value)}
                                      placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                )}

                                {ls.contentType === "text" && (
                                  <div className="bg-slate-950/80 p-3.5 border border-slate-900 rounded-xl space-y-1.5 animate-in slide-in-from-top-1.5 duration-100">
                                    <label className="text-[11px] font-semibold text-emerald-400 block uppercase font-mono tracking-wider">Playbook Notebook Study text (Markdown supported)</label>
                                    <textarea
                                      rows={2}
                                      value={ls.textContent || ""}
                                      onChange={(e) => updateLessonBlockField(idx, "textContent", e.target.value)}
                                      placeholder="Write markdown lists: # Rules, **Highlight Key Points**, code segments..."
                                      className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs font-sans text-slate-200 focus:outline-none focus:border-indigo-505 resize-y"
                                    />
                                  </div>
                                )}

                                {ls.contentType === "download" && (
                                  <div className="bg-slate-950/80 p-3.5 border border-slate-900 rounded-xl space-y-1.5 animate-in slide-in-from-top-1.5 duration-100 flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <label className="text-[11px] font-semibold text-cyan-300 block uppercase font-mono tracking-wider">Attachment PDF Filename parameter</label>
                                      <input
                                        type="text"
                                        value={ls.attachments && ls.attachments.length > 0 ? ls.attachments[0] : "ResourceWorkbook.pdf"}
                                        onChange={(e) => updateLessonBlockField(idx, "attachments", e.target.value ? [e.target.value] : ["ResourceWorkbook.pdf"])}
                                        placeholder="e.g., cheatsheet.pdf"
                                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
                                      />
                                    </div>
                                    <span className="text-xl bg-slate-900 p-2 rounded-xl border border-slate-850 block shrink-0">📥</span>
                                  </div>
                                )}

                                {ls.contentType === "assignment" && (
                                  <div className="bg-slate-950/80 p-3.5 border border-slate-900 rounded-xl space-y-1.5 animate-in slide-in-from-top-1.5 duration-100">
                                    <label className="text-[11px] font-semibold text-amber-400 block uppercase font-mono tracking-wider">Detailed Portfolio Project Instructions</label>
                                    <textarea
                                      rows={2}
                                      value={ls.textContent || ""}
                                      onChange={(e) => updateLessonBlockField(idx, "textContent", e.target.value)}
                                      placeholder="Explain requirements or sandbox repositories student must fork and accomplish..."
                                      className="w-full px-3 py-2 bg-slate-900 border border-slate-855 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-500 resize-y"
                                    />
                                  </div>
                                )}

                                {ls.contentType === "quiz" && (
                                  <div className="bg-slate-950/80 p-3.5 border border-purple-900/30 rounded-xl space-y-3.5 animate-in slide-in-from-top-1.5 duration-100 font-sans text-xs">
                                    <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                                      <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1">
                                        ⚡ NESTED VISUAL MCQ BUILDER
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const qs = [...(ls.quizQuestions || [])];
                                          qs.push({
                                            question: "Question: What is our primary benchmark metric?",
                                            options: ["Response compaction", "Latency under tension", "Cold start cold-lock timing", "Thread scheduling"],
                                            answerIndex: 0
                                          });
                                          updateLessonBlockField(idx, "quizQuestions", qs);
                                        }}
                                        className="text-[10px] font-bold text-purple-300 bg-purple-950/60 border border-purple-900 px-2 py-1 rounded-md cursor-pointer hover:bg-purple-900 hover:text-white transition"
                                      >
                                        + Add Question
                                      </button>
                                    </div>

                                    <div className="space-y-4">
                                      {(!ls.quizQuestions || ls.quizQuestions.length === 0) ? (
                                        <div className="text-center py-4 text-slate-500 scale-95 font-sans">
                                          No MCQ Questions defined. Add one above.
                                        </div>
                                      ) : (
                                        ls.quizQuestions.map((q: any, qIdx: number) => (
                                          <div key={qIdx} className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-2 relative">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const remainingQs = ls.quizQuestions.filter((_: any, rI: number) => rI !== qIdx);
                                                updateLessonBlockField(idx, "quizQuestions", remainingQs);
                                              }}
                                              className="absolute top-2.5 right-2 text-[10px] text-rose-500 hover:text-white hover:bg-rose-955 p-1 rounded transition border border-transparent hover:border-rose-900 cursor-pointer"
                                              title="Remove Question Row"
                                            >
                                              ✕ Remove
                                            </button>

                                            {/* Question Prompt */}
                                            <div className="space-y-1">
                                              <span className="text-[10px] font-bold text-purple-400 font-mono">Q{qIdx + 1}: QUESTION FORMULATION</span>
                                              <input
                                                type="text"
                                                value={q.question || ""}
                                                onChange={(e) => {
                                                  const qs = [...ls.quizQuestions];
                                                  qs[qIdx] = { ...qs[qIdx], question: e.target.value };
                                                  updateLessonBlockField(idx, "quizQuestions", qs);
                                                }}
                                                className="w-full bg-slate-955 border border-slate-805 px-2.5 py-1.5 rounded-md text-xs text-white"
                                                placeholder="e.g. Which of the following defines thread lock rules?"
                                              />
                                            </div>

                                            {/* Choice Option Strings */}
                                            <div className="space-y-1">
                                              <span className="text-[10px] font-bold text-purple-400 font-mono block">CHOICE LIST OPTIONS (Comma separated)</span>
                                              <input
                                                type="text"
                                                value={q.options ? q.options.join(", ") : ""}
                                                onChange={(e) => {
                                                  const qs = [...ls.quizQuestions];
                                                  qs[qIdx] = { ...qs[qIdx], options: e.target.value.split(",").map(ch => ch.trim()) };
                                                  updateLessonBlockField(idx, "quizQuestions", qs);
                                                }}
                                                className="w-full bg-slate-955 border border-slate-805 px-2.5 py-1.5 rounded-md text-xs text-white font-sans"
                                                placeholder="Option 1, Option 2, Option 3, Option 4..."
                                              />
                                            </div>

                                            {/* Correct Choice Index select */}
                                            <div className="flex items-center gap-2 pt-1 justify-between">
                                              <span className="text-[10px] text-slate-450 italic">
                                                Separate values above using commas. Maximum 4 choices.
                                              </span>
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-slate-350">CORRECT ANSWER:</span>
                                                <select
                                                  value={q.answerIndex !== undefined ? q.answerIndex : 0}
                                                  onChange={(e) => {
                                                    const qs = [...ls.quizQuestions];
                                                    qs[qIdx] = { ...qs[qIdx], answerIndex: Number(e.target.value) };
                                                    updateLessonBlockField(idx, "quizQuestions", qs);
                                                  }}
                                                  className="bg-slate-955 border border-slate-800 text-[10px] text-emerald-400 font-mono px-2 py-1 rounded cursor-pointer focus:outline-none"
                                                >
                                                  {(q.options || []).map((o: string, oIdx: number) => (
                                                    <option key={oIdx} value={oIdx}>
                                                      Opt {oIdx + 1}: {o.substring(0, 18)}...
                                                    </option>
                                                  ))}
                                                </select>
                                              </div>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                )}

                              </div>
                            ))
                          )}
                        </div>

                        {/* Inserter Bar: Fast Block Insertion UI */}
                        <div className="bg-slate-950/65 border border-dashed border-slate-800 p-4 rounded-2xl space-y-2.5 shrink-0 select-none">
                          <label className="text-[10.5px] font-bold text-slate-400 block uppercase font-mono tracking-widest text-center">
                            ➕ QUICK BLOCK INSERTION CONSOLE
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => addLessonBlock("video")}
                              className="px-3 py-2.5 bg-indigo-900/15 hover:bg-indigo-900/35 border border-indigo-900/35 text-indigo-300 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              🎥 + Video Block
                            </button>
                            <button
                              type="button"
                              onClick={() => addLessonBlock("text")}
                              className="px-3 py-2.5 bg-emerald-900/15 hover:bg-emerald-900/35 border border-emerald-900/35 text-emerald-300 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              📖 + Playbook
                            </button>
                            <button
                              type="button"
                              onClick={() => addLessonBlock("quiz")}
                              className="px-3 py-2.5 bg-purple-900/15 hover:bg-purple-900/35 border border-purple-900/35 text-purple-300 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm col-span-2 sm:col-span-1"
                            >
                              ❓ + MCQ Quiz
                            </button>
                            <button
                              type="button"
                              onClick={() => addLessonBlock("download")}
                              className="px-3 py-2.5 bg-cyan-900/15 hover:bg-cyan-900/35 border border-cyan-900/35 text-cyan-300 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              📥 + PDF Download
                            </button>
                            <button
                              type="button"
                              onClick={() => addLessonBlock("assignment")}
                              className="px-3 py-2.5 bg-amber-900/15 hover:bg-amber-900/35 border border-amber-900/35 text-amber-300 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              💼 + Homework
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )}

                {studioTab === "prompt" && (
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-200 block">AI Copilot Prompt Planner</label>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Tell the AI copilot what subjects to construct. It will automatically compile multi-lesson syllabi, including quizzes, attachment guidelines, reading blocks, and videos!
                    </p>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={studioPromptText}
                        onChange={(e) => setStudioPromptText(e.target.value)}
                        placeholder="e.g. Create a 3-lesson intermediate topic on Docker Networking..."
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      <div className="flex gap-2 flex-wrap text-sm">
                        <button
                          type="button"
                          onClick={() => setStudioPromptText("AWS Lambda Serverless Microservices Deployment")}
                          className="px-3 py-1.5 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded-lg text-sm cursor-pointer border border-slate-800"
                        >
                          🌥️ AWS Lambda
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudioPromptText("SQL Database Query Performance Tuning & Explain Analysis")}
                          className="px-3 py-1.5 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded-lg text-sm cursor-pointer border border-slate-800"
                        >
                          🗄️ SQL Optimization
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudioPromptText("Next.js Server Actions with Progressive Enhancements")}
                          className="px-3 py-1.5 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded-lg text-sm cursor-pointer border border-slate-800"
                        >
                          ⚛️ Next.js Framework
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleRunStudioAI}
                        disabled={isStudioRunningAI || !studioPromptText.trim()}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isStudioRunningAI ? (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            AI Copilot Compiling Curriculum...
                          </div>
                        ) : (
                          "✨ Generate Module Syllabus Structure"
                        )}
                      </button>
                    </div>

                    {isStudioRunningAI && (
                      <div className="bg-slate-950 p-4 border border-indigo-950 rounded-xl space-y-2 animate-pulse text-sm font-mono text-indigo-400">
                        <p>🚀 &gt; Launching context synthesis kernels...</p>
                        <p>🤖 &gt; Formatting lecture modules for prompt: "{studioPromptText}"</p>
                        <p>📝 &gt; Compiling MCQ quizzes and active feedback sheets...</p>
                      </div>
                    )}
                  </div>
                )}

                {studioTab === "templates" && (
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-200 block">Select Professional Module Preset Templates</label>
                    <p className="text-sm text-slate-400">
                      Instantly populate your curriculum using certified pedagogic layouts. Customize titles later in the raw outline model or bento list.
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStudioModuleTitle("Professional Software Design & Testing Bootcamp");
                          const templateLss = [
                            {
                              title: "Phase 1: Architecture Blueprint Specifications",
                              durationMinutes: 15,
                              contentType: "video",
                              textContent: "Interactive walk-through of class diagrams, component architectures, and dataflows.",
                              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
                            },
                            {
                              title: "Phase 2: Solid Principles Comprehensive Reading Guide",
                              durationMinutes: 25,
                              contentType: "text",
                              textContent: "A comprehensive Notion-style textbook reference listing clean structures."
                            },
                            {
                              title: "Syllabus Compliance Quiz",
                              durationMinutes: 10,
                              contentType: "quiz",
                              quizQuestions: [
                                {
                                  question: "Which pattern encapsulates requests as parameter objects?",
                                  options: ["Command Pattern", "Factory Method", "Observer Pattern", "Adapter Pattern"],
                                  answerIndex: 0
                                }
                              ]
                            }
                          ];
                          setStudioLessons(templateLss);
                          setStudioTab("form");
                        }}
                        className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group active:scale-[0.98] cursor-pointer"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition">🚀 High-Intensity Dev Bootcamp Pack</span>
                          <span className="text-sm bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full font-bold font-mono border border-indigo-900/45">3 Lessons</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1.5">
                          Covers high-level design specifications, a complete markdown reading assignment, and custom MCQ assessment.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStudioModuleTitle("Advanced Case-Study & Homework Evaluation Module");
                          const templateLss = [
                            {
                              title: "Case Analysis Case Files: Distributed Consensus",
                              durationMinutes: 30,
                              contentType: "text",
                              textContent: "Theoretical evaluation regarding Paxos vs Raft consensus algorithms.",
                              attachments: ["raft_consensus_handout.pdf"]
                            },
                            {
                              title: "Interactive System Design Submission Node",
                              durationMinutes: 45,
                              contentType: "assignment",
                              textContent: "Complete a custom system design blueprint, diagramming failure nodes under database segmentation. Upload PDFs."
                            }
                          ];
                          setStudioLessons(templateLss);
                          setStudioTab("form");
                        }}
                        className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group active:scale-[0.98] cursor-pointer"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition">📝 Academic Essay & Case Study Pack</span>
                          <span className="text-sm bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full font-bold font-mono border border-emerald-900/45">2 Lessons</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1.5">
                          Prioritizes structured literature, active case-study downloads, and portfolio assignment assessment hands-on validation.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStudioModuleTitle("Fast-track Video Masterclass Playbook");
                          const templateLss = [
                            {
                              title: "Step 1: Introduction Foundations",
                              durationMinutes: 10,
                              contentType: "video",
                              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
                            },
                            {
                              title: "Step 2: Core Mechanics Sandbox Live Playground",
                              durationMinutes: 15,
                              contentType: "video",
                              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
                            },
                            {
                              title: "Step 3: Advanced Optimization Speed-run",
                              durationMinutes: 20,
                              contentType: "video",
                              videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
                            }
                          ];
                          setStudioLessons(templateLss);
                          setStudioTab("form");
                        }}
                        className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition group active:scale-[0.98] cursor-pointer"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition">🎥 Triple Video Crash Course Preset</span>
                          <span className="text-sm bg-amber-950 text-amber-300 px-3 py-1 rounded-full font-bold font-mono border border-amber-900/45">3 Videos</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1.5">
                          Three sequential streamlined high-resolution lecture streams for rapid onboarding on complex software tools.
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {studioTab === "form" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <label className="text-sm font-bold text-slate-200">Lesson Structure</label>
                      <button
                        type="button"
                        onClick={() => {
                          const current = [...studioLessons];
                          current.push({
                            title: `Lesson ${current.length + 1}`,
                            durationMinutes: 15,
                            contentType: "video",
                            textContent: "Lesson content.",
                            videoUrl: "",
                            attachments: []
                          });
                          setStudioLessons(current);
                        }}
                        className="text-sm bg-indigo-500/25 text-indigo-300 px-3.5 py-2 rounded-xl font-bold transition hover:bg-indigo-500/35 cursor-pointer"
                      >
                        + Add Lecture Node
                      </button>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed mb-1.5">
                      Modify fields, choose formats, or edit video attachments in 14px elements:
                    </p>

                    <div className="space-y-4 max-h-[38vh] overflow-y-auto pr-1">
                      {studioLessons.map((ls, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-3 text-sm">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-sm">
                            <div className="sm:col-span-6">
                              <label className="block text-sm font-bold text-slate-300 mb-1.5">Lecture Title:</label>
                              <input
                                type="text"
                                value={ls.title}
                                onChange={(e) => {
                                  const current = [...studioLessons];
                                  current[idx].title = e.target.value;
                                  setStudioLessons(current);
                                }}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <label className="block text-sm font-bold text-slate-300 mb-1.5">Content Type:</label>
                              <select
                                value={ls.contentType}
                                onChange={(e) => {
                                  const current = [...studioLessons];
                                  current[idx].contentType = e.target.value;
                                  setStudioLessons(current);
                                }}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                              >
                                <option value="video">🎥 Video Lesson</option>
                                <option value="text">📖 Notion Text Playbook</option>
                                <option value="download">📥 PDF Companion</option>
                                <option value="quiz">📝 Interactive MCQ Quiz</option>
                                <option value="assignment">💼 Portfolio Assignment</option>
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-sm font-bold text-slate-300 mb-1.5">Mins:</label>
                              <input
                                type="number"
                                value={ls.durationMinutes}
                                onChange={(e) => {
                                  const current = [...studioLessons];
                                  current[idx].durationMinutes = Number(e.target.value);
                                  setStudioLessons(current);
                                }}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const current = [...studioLessons];
                                setStudioLessons(current.filter((_, i) => i !== idx));
                              }}
                              className="text-xs text-rose-400 hover:text-rose-350 font-bold cursor-pointer"
                            >
                              × Delete Lecture Node
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Pane (Live Dynamic Visualizer) */}
              <div className="w-full md:w-[420px] bg-slate-950/70 p-6 overflow-y-auto space-y-5 flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold uppercase text-indigo-400 tracking-wider">
                      Preview
                    </span>
                    <h4 className="text-sm font-bold text-white font-display mt-0.5">Module Preview</h4>
                  </div>

                  {/* Module Card */}
                  <div className="bg-slate-900 border-2 border-indigo-900/40 rounded-2xl p-4 shadow-xl space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="text-xs font-mono bg-indigo-900/60 text-indigo-300 px-2.5 py-0.5 rounded-full uppercase font-bold">
                          Active Module Preview
                        </span>
                        <h4 className="text-sm font-bold text-white font-sans mt-2 truncate">
                          {studioModuleTitle.trim() || "Module Title"}
                        </h4>
                      </div>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-705 font-mono whitespace-nowrap shrink-0">
                        ⏱️ {studioLessons.reduce((acc, current) => acc + (current.durationMinutes || 0), 0)} mins
                      </span>
                    </div>

                    {/* Lessons Visual Loop */}
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {studioLessons.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-sm">
                          No structured lessons compiled yet. Type in outline parameters or select templates.
                        </div>
                      ) : (
                        studioLessons.map((lss, lIdx) => (
                          <div key={lIdx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 relative animate-in slide-in-from-bottom-2 duration-150">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] uppercase font-mono font-bold text-emerald-400 block">
                                Lesson {lIdx + 1}
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                {lss.durationMinutes || 10} mins
                              </span>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <span className="text-lg bg-indigo-950 p-1.5 rounded-lg border border-indigo-900/40 text-indigo-400 block shrink-0">
                                {lss.contentType === "video" ? "🎥" :
                                 lss.contentType === "text" ? "📖" :
                                 lss.contentType === "download" ? "📥" :
                                 lss.contentType === "quiz" ? "📝" : "💼"}
                              </span>
                              <div className="min-w-0">
                                <h5 className="text-sm font-semibold text-white leading-snug truncate" title={lss.title}>
                                  {lss.title || `Lecture Node #${lIdx + 1}`}
                                </h5>
                                <span className="text-xs text-slate-400 block capitalize font-mono mt-0.5">
                                  {lss.contentType || "video"} Lecture File
                                </span>
                              </div>
                            </div>

                            {/* Additional nested quiz preview */}
                            {lss.contentType === "quiz" && lss.quizQuestions && lss.quizQuestions.length > 0 && (
                              <div className="bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-900/20 text-xs text-indigo-200 mt-2 space-y-1.5">
                                <span className="text-[11px] uppercase font-mono font-bold text-indigo-400 block">MCQ Audit Questions ({lss.quizQuestions.length})</span>
                                {lss.quizQuestions.map((q: any, qIdx: number) => (
                                  <div key={qIdx} className="border-t border-indigo-900/20 pt-1">
                                    <p className="font-semibold text-slate-350">Q: {q.question}</p>
                                    <p className="text-xs text-slate-450 italic">Options: {q.options.join(" | ")}</p>
                                    <p className="text-xs text-emerald-400 font-mono mt-0.5">Correct Ans index: Option {q.answerIndex + 1}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Additional nested assignment instructions */}
                            {lss.contentType === "assignment" && (
                              <div className="bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/10 text-xs text-amber-200 mt-2 space-y-1">
                                <span className="text-[11px] uppercase font-mono font-bold text-amber-500 block">Portfolio Assignment Project</span>
                                <p className="text-slate-350 italic scale-95 origin-left">Interactive submission widget built for classroom accreditation on build.</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Confirm actions */}
                <div className="pt-4 border-t border-slate-800 space-y-2.5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowStudioModal(false)}
                      className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStudioModule}
                      className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm transition cursor-pointer shadow-md shadow-emerald-900 flex items-center justify-center gap-1.5"
                    >
                      Assemble Module ✨
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
