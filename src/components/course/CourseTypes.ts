export type BlockType =
  | "heading"
  | "paragraph"
  | "video"
  | "image"
  | "quiz"
  | "assignment"
  | "file"
  | "callout"
  | "divider"
  | "code"
  | "audio"
  | "pdf"
  | "button"
  | "embed"
  | "poll"
  | "reflection"
  | "ai_summary"
  | "ai_tutor"
  | "ai_practice"
  | "discussion_prompt"
  | "ask_community"
  | "cta"
  | "upgrade_offer"
  | "booking";

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  meta?: Record<string, any>;
}

export interface CourseDraftModule {
  id: string;
  title: string;
  index: number;
  lessons: CourseDraftLesson[];
}

export interface CourseDraftLesson {
  id: string;
  title: string;
  durationMinutes: number;
  contentType: "video" | "text" | "quiz" | "assignment" | "download";
  blocks: ContentBlock[];
  videoUrl?: string;
  textContent?: string;
  quizQuestions?: { question: string; options: string[]; answerIndex: number }[];
  assignmentInstructions?: string;
  attachments?: string[];
  isLocked: boolean;
  status: "draft" | "published";
}

export interface CourseSettings {
  certificate: boolean;
  dripContent: boolean;
  dripDays: number;
  prerequisites: string[];
  completionRules: "all_lessons" | "quiz_pass" | "assignment_submit";
  allowComments: boolean;
  allowDiscussions: boolean;
  allowDownloads: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface CourseDraft {
  id: string;
  communityId: string;
  name: string;
  slug: string;
  description: string;
  coverUrl: string;
  category: string;
  modules: CourseDraftModule[];
  status: "draft" | "published" | "archived" | "scheduled";
  price: number;
  isFree: boolean;
  instructorName: string;
  instructorAvatar: string;
  enrolledCount: number;
  completionRate: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
  sourceCourseId?: string;
  settings?: CourseSettings;
  scheduledDate?: string;
  visibility?: "public" | "private";
}

export interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  coverUrl: string;
  moduleCount: number;
  lessonCount: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  modules: { title: string; lessons: { title: string; contentType: string }[] }[];
}

export interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
}

export interface CourseStructureTreeProps {
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

export interface ResourceItem {
  id: string;
  title: string;
  type: "video" | "pdf" | "audio" | "image" | "file";
  url: string;
  tags: string[];
  folder: string;
  usageCount: number;
  createdAt: string;
  size: string;
}
