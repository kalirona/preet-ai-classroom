import React, { useState } from "react";
import { X, BookOpen, Users, Target, Award, Sparkles, Zap, DollarSign, Image as ImageIcon, Tag, ChevronRight, ChevronLeft, GraduationCap, BarChart3, Globe, FileText } from "lucide-react";
import { CourseDraft, CourseDraftModule, CourseDraftLesson, CourseTemplate } from "./CourseTypes";
import { courseTemplates } from "./CourseTemplates";

interface CourseCreationWizardProps {
  communityId: string;
  onComplete: (draft: CourseDraft) => void;
  onCancel: () => void;
}

const courseTypes = [
  { id: "standard", label: "Standard Course", description: "Self-paced with modules and lessons — the all-rounder", icon: BookOpen, color: "from-indigo-500 to-indigo-600" },
  { id: "cohort", label: "Cohort-Based Course", description: "Live cohorts, weekly modules, community-driven with start dates", icon: Users, color: "from-purple-500 to-purple-600" },
  { id: "challenge", label: "Challenge / Workshop", description: "Time-boxed lesson drip with daily tasks", icon: Target, color: "from-rose-500 to-rose-600" },
  { id: "certification", label: "Certification Program", description: "Assessment gate with final exam and certificate", icon: Award, color: "from-amber-500 to-amber-600" },
  { id: "ai_generated", label: "AI Generated", description: "Let AI scaffold your course from a single prompt", icon: Sparkles, color: "from-cyan-500 to-cyan-600" },
];

const categories = ["Web Development", "Data Science", "Design", "Marketing", "Business", "Photography", "Music", "Health", "Personal Development", "Other"];

function buildModulesFromTemplate(template: CourseTemplate, courseType: string): CourseDraftModule[] {
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
  const [courseType, setCourseType] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [coverUrl, setCoverUrl] = useState("");
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!name.trim()) { setError("Course name is required"); return; }

    // Pick template (or build minimal one)
    const template = selectedTemplate || courseTemplates[0];
    const modules = buildModulesFromTemplate(template, courseType);

    const draft: CourseDraft = {
      id: `course-${Date.now()}`,
      communityId,
      name: name.trim(),
      description: description.trim(),
      coverUrl,
      category,
      modules,
      status: "draft",
      price: isFree ? 0 : price,
      isFree,
      instructorName: "Your Name",
      instructorAvatar: "",
      enrolledCount: 0,
      completionRate: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateId: template?.id,
    };
    onComplete(draft);
  };

  const handleGenerateAI = () => {
    if (!name.trim()) return;
    // Simulate AI generation: pick a random template
    const t = courseTemplates[Math.floor(Math.random() * courseTemplates.length)];
    setSelectedTemplate(t);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Create New Course</h2>
              <p className="text-xs text-gray-500">Step {step + 1} of 4</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 px-6 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
          {["Type", "Template", "Details", "Launch"].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? "text-gray-900" : "text-gray-400"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step ? "bg-gray-900 text-white" : i === step ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"
                }`}>
                  {i + 1}
                </div>
                <span className="text-sm font-medium">{s}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-px mx-3 ${i < step ? "bg-gray-900" : "bg-gray-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Choose Course Type</h3>
              <p className="text-sm text-gray-500 mb-5">Select the type of course you want to create</p>
              <div className="grid grid-cols-2 gap-3">
                {courseTypes.map((ct) => {
                  const Icon = ct.icon;
                  const selected = courseType === ct.id;
                  return (
                    <button
                      key={ct.id}
                      onClick={() => setCourseType(ct.id)}
                      className={`relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        selected ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ct.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">{ct.label}</div>
                        <p className="text-xs text-gray-500 mt-0.5">{ct.description}</p>
                      </div>
                      {selected && <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                    </button>
                  );
                })}
              </div>
              {!courseType && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">Select a course type to continue</p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Choose a Template</h3>
              <p className="text-sm text-gray-500 mb-5">Start with a pre-built structure or <button onClick={() => { setSelectedTemplate(null); setStep(2); }} className="text-gray-900 underline underline-offset-2 hover:text-gray-700">skip to blank</button></p>
              <div className="grid grid-cols-2 gap-3">
                {courseTemplates.map((t) => {
                  const selected = selectedTemplate?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t)}
                      className={`relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        selected ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
                          <span>{t.moduleCount} modules</span>
                          <span>·</span>
                          <span>{t.lessonCount} lessons</span>
                          <span>·</span>
                          <span className="capitalize">{t.difficulty}</span>
                        </div>
                      </div>
                      {selected && <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Course Details</h3>
              <p className="text-sm text-gray-500 mb-5">Name, describe, categorize, and price your course</p>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Course Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. The Complete SEO Masterclass"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                  />
                  {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief description of your course..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900">
                      {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cover Image URL</label>
                    <input
                      type="text"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Pricing</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsFree(true)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isFree ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      Free
                    </button>
                    <button
                      onClick={() => setIsFree(false)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!isFree ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      Paid
                    </button>
                    {!isFree && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                        <input
                          type="number"
                          min={0}
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-24 pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Ready to Launch!</h3>
              <p className="text-sm text-gray-500 mb-2">Your course is nearly ready to build</p>
              <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700">
                <FileText className="w-4 h-4" />
                {selectedTemplate ? selectedTemplate.name : "Blank course"}
                <span className="text-gray-300">|</span>
                <span className="font-medium">{name || "Untitled Course"}</span>
              </div>
              {courseType === "ai_generated" && (
                <div className="mt-4 p-4 bg-cyan-50 border border-cyan-200 rounded-xl max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-sm font-medium text-cyan-800 mb-1">
                    <Sparkles className="w-4 h-4" />
                    AI Generation in Progress
                  </div>
                  <p className="text-xs text-cyan-700">Your course structure is being generated based on the name "{name}". You'll be able to edit everything in the builder.</p>
                </div>
              )}
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
          {step === 0 && (
            <button
              disabled={!courseType}
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Template
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Next: Details
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === 2 && (
            <button
              onClick={() => {
                if (!name.trim()) { setError("Course name is required"); return; }
                setError("");
                if (courseType === "ai_generated") { handleGenerateAI(); return; }
                setStep(3);
              }}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
            >
              {courseType === "ai_generated" ? "Generate with AI" : "Next: Launch"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === 3 && !courseType?.startsWith("ai") && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Open Builder
            </button>
          )}
          {step === 3 && courseType === "ai_generated" && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-cyan-600 px-6 py-2.5 rounded-xl hover:bg-cyan-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Open Builder
            </button>
          )}
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
