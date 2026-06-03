import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, BookOpen, Globe, Users, Check, ArrowRight, ArrowLeft, Layout, Film, FileText, HelpCircle, PenTool } from "lucide-react";
import CourseTemplates from "./CourseTemplates";
import { CourseTemplate, CourseDraft, CourseDraftModule, CourseDraftLesson } from "./CourseTypes";
import { v4 as uuidv4 } from "uuid";

interface CourseCreationWizardProps {
  communityId: string;
  onComplete: (draft: CourseDraft) => void;
  onCancel: () => void;
}

type CourseType = "free" | "community";

const STEPS = ["Type", "Template", "Details", "Review"];

const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <Film className="w-3 h-3" />,
  text: <FileText className="w-3 h-3" />,
  quiz: <HelpCircle className="w-3 h-3" />,
  assignment: <PenTool className="w-3 h-3" />,
  file: <FileText className="w-3 h-3" />,
};

function templateToDraft(template: CourseTemplate, communityId: string, name: string, description: string, coverUrl: string): CourseDraft {
  const modules: CourseDraftModule[] = template.modules.map((m, mi) => ({
    id: `mod-${uuidv4().slice(0, 8)}`,
    title: m.title,
    index: mi,
    lessons: m.lessons.map((l, li) => ({
      id: `les-${uuidv4().slice(0, 8)}`,
      title: l.title,
      durationMinutes: 10,
      contentType: l.contentType as CourseDraftLesson["contentType"],
      blocks: [
        { id: `block-${uuidv4().slice(0, 8)}`, type: "heading", content: l.title },
        { id: `block-${uuidv4().slice(0, 8)}`, type: "paragraph", content: l.contentType === "video" ? "Video content goes here." : l.contentType === "quiz" ? "Quiz content goes here." : l.contentType === "assignment" ? "Assignment instructions go here." : "Content goes here." },
      ],
      isLocked: mi > 0,
      status: "draft",
    })),
  }));

  return {
    id: `course-${Date.now()}`,
    communityId,
    name,
    description,
    coverUrl,
    category: template.category,
    modules,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    templateId: template.id,
  };
}

function createBlankDraft(communityId: string, name: string, description: string, coverUrl: string): CourseDraft {
  const firstModule: CourseDraftModule = {
    id: `mod-${uuidv4().slice(0, 8)}`,
    title: "Module 1: Getting Started",
    index: 0,
    lessons: [
      {
        id: `les-${uuidv4().slice(0, 8)}`,
        title: "Welcome to the Course",
        durationMinutes: 5,
        contentType: "video",
        blocks: [
          { id: `block-${uuidv4().slice(0, 8)}`, type: "heading", content: "Welcome to the Course" },
          { id: `block-${uuidv4().slice(0, 8)}`, type: "paragraph", content: "We're excited to have you here. This course will guide you through everything you need to know." },
        ],
        isLocked: false,
        status: "draft",
      },
    ],
  };

  return {
    id: `course-${Date.now()}`,
    communityId,
    name,
    description,
    coverUrl,
    category: "General",
    modules: [firstModule],
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function CourseCreationWizard({ communityId, onComplete, onCancel }: CourseCreationWizardProps) {
  const [step, setStep] = useState(0);
  const [courseType, setCourseType] = useState<CourseType>("free");
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);
  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCover, setCourseCover] = useState("");

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return selectedTemplate !== null;
      case 2: return courseName.trim().length >= 3;
      case 3: return true;
      default: return false;
    }
  };

  const handleFinish = () => {
    if (!selectedTemplate) return;
    const draft = templateToDraft(selectedTemplate, communityId, courseName, courseDesc, courseCover);
    onComplete(draft);
  };

  const handleSkipTemplate = () => {
    const blank: CourseTemplate = {
      id: "blank",
      name: "Start from Scratch",
      description: "",
      category: "General",
      coverUrl: "",
      moduleCount: 0,
      lessonCount: 0,
      difficulty: "beginner",
      isPremium: false,
      modules: [],
    };
    setSelectedTemplate(blank);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">What type of course is this?</h3>
            <p className="text-sm text-gray-500 mb-6">Choose how students will access your course.</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCourseType("free")}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  courseType === "free" ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200" : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <BookOpen className="w-8 h-8 text-indigo-500 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Free Course</h4>
                <p className="text-sm text-gray-500">Available to all community members at no cost.</p>
              </button>
              <button
                onClick={() => setCourseType("community")}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  courseType === "community" ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200" : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <Users className="w-8 h-8 text-emerald-500 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Community Course</h4>
                <p className="text-sm text-gray-500">For members only. Great for cohort-based programs.</p>
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <CourseTemplates
            onSelect={(t) => setSelectedTemplate(t)}
            selectedId={selectedTemplate?.id || null}
          />
        );

      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Course Details</h3>
            <p className="text-sm text-gray-500 mb-6">Give your course a name and description.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., Advanced AI Engineering"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Describe what students will learn..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={courseCover}
                  onChange={(e) => setCourseCover(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                {courseCover && (
                  <div className="mt-2 rounded-lg overflow-hidden h-28">
                    <img src={courseCover} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Review & Start Building</h3>
            <p className="text-sm text-gray-500 mb-6">Here's what your course will look like.</p>
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                {courseCover ? (
                  <img src={courseCover} alt="" className="w-20 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{courseName || "Untitled Course"}</h4>
                  <p className="text-sm text-gray-500 line-clamp-1">{courseDesc || "No description yet."}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="capitalize flex items-center gap-1"><Globe className="w-3 h-3" />{courseType}</span>
                    <span className="flex items-center gap-1"><Layout className="w-3 h-3" />{selectedTemplate?.name || "Custom"}</span>
                  </div>
                </div>
              </div>
              {selectedTemplate && selectedTemplate.modules.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Course Structure ({selectedTemplate.modules.length} modules, {selectedTemplate.lessonCount} lessons)</h5>
                  <div className="space-y-2">
                    {selectedTemplate.modules.map((mod, mi) => (
                      <div key={mi} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          {mod.title}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {mod.lessons.map((les, li) => (
                            <span key={li} className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {contentTypeIcons[les.contentType] || null}
                              {les.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const stepLabels = STEPS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4"
      >
        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
              <p className="text-sm text-gray-500">Set up your course structure in a few steps</p>
            </div>
            <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    i < step ? "bg-indigo-600 text-white" : i === step ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500" : "bg-gray-100 text-gray-400"
                  }`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-indigo-700" : i < step ? "text-indigo-600" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < step ? "bg-indigo-500" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={step === 0 ? onCancel : () => setStep(step - 1)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <div className="flex items-center gap-3">
            {step === 1 && (
              <button
                onClick={handleSkipTemplate}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Skip, start blank
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canProceed() && setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 text-sm font-medium bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 text-sm font-medium bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Start Building
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
