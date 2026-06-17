import React from "react";
import { BookOpen, Layers, Clock, Sparkles, Users, Zap } from "lucide-react";
import { CourseTemplate } from "./CourseTypes";

const PRESET_TEMPLATES: CourseTemplate[] = [
  {
    id: "blank",
    name: "Start from Scratch",
    description: "Build your course from a blank canvas. Add modules and lessons as you go.",
    category: "Getting Started",
    coverUrl: "",
    moduleCount: 0,
    lessonCount: 0,
    difficulty: "beginner",
    isPremium: false,
    modules: [],
  },
  {
    id: "mini-course",
    name: "Mini Course",
    description: "A short 3-lesson course perfect for a quick win or single topic deep-dive.",
    category: "Quick Start",
    coverUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    moduleCount: 1,
    lessonCount: 3,
    difficulty: "beginner",
    isPremium: false,
    modules: [
      {
        title: "Core Content",
        lessons: [
          { title: "Welcome & Overview", contentType: "video" },
          { title: "Key Concepts", contentType: "text" },
          { title: "Quiz & Action Steps", contentType: "quiz" },
        ],
      },
    ],
  },
  {
    id: "standard-course",
    name: "Standard Course",
    description: "A comprehensive 4-module course with video, text, quizzes, and assignments.",
    category: "Popular",
    coverUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
    moduleCount: 4,
    lessonCount: 12,
    difficulty: "intermediate",
    isPremium: false,
    modules: [
      {
        title: "Module 1: Foundations",
        lessons: [
          { title: "Introduction & Welcome", contentType: "video" },
          { title: "Core Principles", contentType: "text" },
          { title: "Foundations Quiz", contentType: "quiz" },
        ],
      },
      {
        title: "Module 2: Core Skills",
        lessons: [
          { title: "Deep Dive Workshop", contentType: "video" },
          { title: "Practical Examples", contentType: "text" },
          { title: "Skills Assignment", contentType: "assignment" },
        ],
      },
      {
        title: "Module 3: Advanced Topics",
        lessons: [
          { title: "Advanced Strategies", contentType: "video" },
          { title: "Case Studies", contentType: "text" },
          { title: "Advanced Quiz", contentType: "quiz" },
        ],
      },
      {
        title: "Module 4: Mastery",
        lessons: [
          { title: "Final Project Overview", contentType: "video" },
          { title: "Project Resources", contentType: "file" },
          { title: "Course Wrap-Up", contentType: "video" },
        ],
      },
    ],
  },
  {
    id: "workshop",
    name: "Workshop Series",
    description: "A hands-on workshop format with assignments and project-based learning.",
    category: "Engaging",
    coverUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400",
    moduleCount: 3,
    lessonCount: 9,
    difficulty: "intermediate",
    isPremium: false,
    modules: [
      {
        title: "Prep Work",
        lessons: [
          { title: "Workshop Overview", contentType: "video" },
          { title: "Materials Checklist", contentType: "file" },
          { title: "Pre-Workshop Quiz", contentType: "quiz" },
        ],
      },
      {
        title: "Live Workshop",
        lessons: [
          { title: "Session 1: Core Concepts", contentType: "video" },
          { title: "Session 2: Hands-On Practice", contentType: "video" },
          { title: "Session 3: Q&A", contentType: "text" },
        ],
      },
      {
        title: "Post-Workshop",
        lessons: [
          { title: "Project Assignment", contentType: "assignment" },
          { title: "Peer Review", contentType: "text" },
          { title: "Certificate & Next Steps", contentType: "video" },
        ],
      },
    ],
  },
  {
    id: "challenge",
    name: "Challenge / Cohort",
    description: "A time-bound challenge format with daily lessons and community engagement.",
    category: "Trending",
    coverUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
    moduleCount: 5,
    lessonCount: 10,
    difficulty: "beginner",
    isPremium: false,
    modules: [
      { title: "Day 1: Kickoff", lessons: [{ title: "Welcome & Challenge Rules", contentType: "video" }, { title: "Day 1 Task", contentType: "assignment" }] },
      { title: "Day 2: Build Momentum", lessons: [{ title: "Daily Inspiration", contentType: "video" }, { title: "Day 2 Task", contentType: "assignment" }] },
      { title: "Day 3: Deep Work", lessons: [{ title: "Expert Tips", contentType: "text" }, { title: "Day 3 Task", contentType: "assignment" }] },
      { title: "Day 4: Push Further", lessons: [{ title: "Community Spotlight", contentType: "video" }, { title: "Day 4 Task", contentType: "assignment" }] },
      { title: "Day 5: Finish Strong", lessons: [{ title: "Wrap-Up & Results", contentType: "video" }] },
    ],
  },
  {
    id: "masterclass",
    name: "Masterclass",
    description: "A premium deep-dive with expert-led video sessions and comprehensive resources.",
    category: "Premium Feel",
    coverUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400",
    moduleCount: 6,
    lessonCount: 18,
    difficulty: "advanced",
    isPremium: false,
    modules: [
      { title: "Introduction", lessons: [{ title: "Meet Your Instructor", contentType: "video" }, { title: "Course Roadmap", contentType: "text" }, { title: "Prerequisites", contentType: "file" }] },
      { title: "Module 1: Fundamentals", lessons: [{ title: "Core Concepts Deep Dive", contentType: "video" }, { title: "Reading & Resources", contentType: "text" }, { title: "Knowledge Check", contentType: "quiz" }] },
      { title: "Module 2: Application", lessons: [{ title: "Real-World Case Study", contentType: "video" }, { title: "Hands-On Exercise", contentType: "assignment" }, { title: "Group Discussion", contentType: "text" }] },
      { title: "Module 3: Advanced", lessons: [{ title: "Expert Techniques", contentType: "video" }, { title: "Advanced Reading", contentType: "file" }, { title: "Advanced Quiz", contentType: "quiz" }] },
      { title: "Module 4: Integration", lessons: [{ title: "Putting It All Together", contentType: "video" }, { title: "Final Project", contentType: "assignment" }] },
      { title: "Graduation", lessons: [{ title: "Course Review", contentType: "video" }, { title: "Certificate", contentType: "text" }] },
    ],
  },
];

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700",
};

interface CourseTemplatesProps {
  onSelect: (template: CourseTemplate) => void;
  selectedId: string | null;
}

export default function CourseTemplates({ onSelect, selectedId }: CourseTemplatesProps) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Choose a Template</h3>
        <p className="text-sm text-gray-500">Start with a pre-built structure or create a blank course.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESET_TEMPLATES.map((template) => {
          const isSelected = selectedId === template.id;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`relative text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                isSelected
                  ? "border-indigo-500 ring-2 ring-indigo-200 shadow-md"
                  : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
              }`}
            >
              {template.coverUrl ? (
                <div className="h-28 bg-gray-100 overflow-hidden">
                  <img src={template.coverUrl} alt={template.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-28 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-indigo-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{template.name}</h4>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${difficultyColors[template.difficulty]}`}>
                    {template.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {template.moduleCount} {template.moduleCount === 1 ? "module" : "modules"}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {template.lessonCount} {template.lessonCount === 1 ? "lesson" : "lessons"}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { PRESET_TEMPLATES };
