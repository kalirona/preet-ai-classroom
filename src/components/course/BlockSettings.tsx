import React from "react";
import { Settings, Clock, Lock, CheckSquare, Eye, Tag, FileText, BookOpen, BarChart3, Globe, DollarSign, Upload, Info } from "lucide-react";
import { CourseDraft, CourseDraftLesson, ContentBlock, BlockType } from "./CourseTypes";

interface BlockSettingsProps {
  draft: CourseDraft;
  selectedLesson: CourseDraftLesson | null;
  selectedBlock: ContentBlock | null;
  onUpdateDraft: (updated: CourseDraft) => void;
  onUpdateLesson: (lessonId: string, updates: Partial<CourseDraftLesson>) => void;
}

export default function BlockSettings({ draft, selectedLesson, selectedBlock, onUpdateDraft, onUpdateLesson }: BlockSettingsProps) {
  if (!selectedLesson && !selectedBlock) {
    return (
      <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Settings className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Select a lesson or block to view settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 shrink-0 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {selectedBlock ? "Block Settings" : "Lesson Settings"}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedBlock && <BlockInspector block={selectedBlock} />}
        {selectedLesson && (
          <LessonSettings
            lesson={selectedLesson}
            draft={draft}
            onUpdate={onUpdateLesson}
            onUpdateDraft={onUpdateDraft}
          />
        )}
      </div>
    </div>
  );
}

function BlockInspector({ block }: { block: ContentBlock }) {
  const metaKeys = block.meta ? Object.keys(block.meta) : [];

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Block Type</label>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Info className="w-4 h-4 text-gray-400" />
          {block.type}
        </div>
      </div>
      <div>
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Block ID</label>
        <div className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono truncate">
          {block.id}
        </div>
      </div>
      <div>
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Characters</label>
        <div className="text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2">
          {block.content.length.toLocaleString()}
        </div>
      </div>
      {metaKeys.length > 0 && (
        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Metadata</label>
          <div className="space-y-1">
            {metaKeys.map((key) => (
              <div key={key} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2">
                <span className="font-medium text-gray-600">{key}:</span>{" "}
                <span className="text-gray-500">{JSON.stringify(block.meta![key])}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LessonSettings({
  lesson,
  draft,
  onUpdate,
  onUpdateDraft,
}: {
  lesson: CourseDraftLesson;
  draft: CourseDraft;
  onUpdate: (lessonId: string, updates: Partial<CourseDraftLesson>) => void;
  onUpdateDraft: (updated: CourseDraft) => void;
}) {
  return (
    <div className="p-4 space-y-5">
      {/* Lesson Info */}
      <Section label="Lesson Info" icon={FileText}>
        <div>
          <label className="text-[11px] font-medium text-gray-500 mb-1 block">Title</label>
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => onUpdate(lesson.id, { title: e.target.value })}
            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 mb-1 block">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            value={lesson.durationMinutes}
            onChange={(e) => onUpdate(lesson.id, { durationMinutes: Math.max(1, Number(e.target.value)) })}
            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 mb-1 block">Content Type</label>
          <select
            value={lesson.contentType}
            onChange={(e) => onUpdate(lesson.id, { contentType: e.target.value as CourseDraftLesson["contentType"] })}
            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="video">Video</option>
            <option value="text">Text</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
            <option value="download">Download</option>
          </select>
        </div>
        {lesson.videoUrl && (
          <div>
            <label className="text-[11px] font-medium text-gray-500 mb-1 block">Video URL</label>
            <input
              type="text"
              value={lesson.videoUrl}
              onChange={(e) => onUpdate(lesson.id, { videoUrl: e.target.value })}
              className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        )}
      </Section>

      {/* Access & Drip */}
      <Section label="Access & Drip" icon={Lock}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-700">Locked (drip content)</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={lesson.isLocked}
              onChange={(e) => onUpdate(lesson.id, { isLocked: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-900" />
          </label>
        </div>
        {lesson.isLocked && (
          <div>
            <label className="text-[11px] font-medium text-gray-500 mb-1 block">Unlock after (days)</label>
            <input
              type="number"
              min={0}
              defaultValue={0}
              className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-700">Require completion</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-900" />
          </label>
        </div>
      </Section>

      {/* Status & Visibility */}
      <Section label="Status" icon={Eye}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdate(lesson.id, { status: "draft" })}
            className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
              lesson.status === "draft" ? "bg-gray-200 text-gray-800" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => onUpdate(lesson.id, { status: "published" })}
            className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
              lesson.status === "published" ? "bg-emerald-200 text-emerald-800" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Published
          </button>
        </div>
      </Section>

      {/* Course Settings */}
      <Section label="Course Settings" icon={BookOpen}>
        <div>
          <label className="text-[11px] font-medium text-gray-500 mb-1 block">Course Name</label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => onUpdateDraft({ ...draft, name: e.target.value })}
            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 mb-1 block">Category</label>
          <input
            type="text"
            value={draft.category}
            onChange={(e) => onUpdateDraft({ ...draft, category: e.target.value })}
            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 mb-1 block">Pricing</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateDraft({ ...draft, isFree: true, price: 0 })}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                draft.isFree ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => onUpdateDraft({ ...draft, isFree: false })}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                !draft.isFree ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              Paid
            </button>
            {!draft.isFree && (
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                <input
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={(e) => onUpdateDraft({ ...draft, price: Number(e.target.value) })}
                  className="w-full pl-6 pr-2 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none"
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="text-[11px] font-medium text-gray-500 mb-1 block">Cover Image URL</label>
          <input
            type="text"
            value={draft.coverUrl}
            onChange={(e) => onUpdateDraft({ ...draft, coverUrl: e.target.value })}
            placeholder="https://..."
            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
      </Section>
    </div>
  );
}

function Section({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
