import React from "react";
import { Settings, Type, Video, Image, HelpCircle, PenTool, FileText, Quote, Code } from "lucide-react";
import { ContentBlock, BlockType } from "./CourseTypes";

interface BlockSettingsProps {
  block: ContentBlock | null;
  onChange: (updates: Partial<ContentBlock>) => void;
}

const BLOCK_STYLES: { type: BlockType; label: string; color: string; icon: React.ReactNode }[] = [
  { type: "heading", label: "Heading", color: "text-gray-900", icon: <Type className="w-4 h-4" /> },
  { type: "paragraph", label: "Paragraph", color: "text-gray-600", icon: <Type className="w-4 h-4" /> },
  { type: "video", label: "Video", color: "text-rose-600", icon: <Video className="w-4 h-4" /> },
  { type: "image", label: "Image", color: "text-sky-600", icon: <Image className="w-4 h-4" /> },
  { type: "quiz", label: "Quiz", color: "text-amber-600", icon: <HelpCircle className="w-4 h-4" /> },
  { type: "assignment", label: "Assignment", color: "text-purple-600", icon: <PenTool className="w-4 h-4" /> },
  { type: "callout", label: "Callout", color: "text-blue-600", icon: <Quote className="w-4 h-4" /> },
  { type: "code", label: "Code", color: "text-emerald-600", icon: <Code className="w-4 h-4" /> },
  { type: "file", label: "File", color: "text-gray-600", icon: <FileText className="w-4 h-4" /> },
  { type: "divider", label: "Divider", color: "text-gray-400", icon: <Type className="w-4 h-4" /> },
];

export default function BlockSettings({ block, onChange }: BlockSettingsProps) {
  if (!block) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Block Settings</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Settings className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Select a block to edit its settings</p>
          </div>
        </div>
      </div>
    );
  }

  const style = BLOCK_STYLES.find((s) => s.type === block.type);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Block Settings</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Block Type */}
        <div>
          <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 block">Type</label>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            {style?.icon}
            <span className={`text-sm font-medium ${style?.color || "text-gray-600"}`}>{style?.label || block.type}</span>
          </div>
        </div>

        {/* Content */}
        {block.type !== "divider" && (
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 block">Content</label>
            <textarea
              value={block.content}
              onChange={(e) => onChange({ content: e.target.value })}
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 resize-none"
              placeholder="Content..."
            />
          </div>
        )}

        {/* Heading level */}
        {block.type === "heading" && (
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 block">Heading Level</label>
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => onChange({ meta: { ...block.meta, level } })}
                  className={`flex-1 text-sm font-semibold py-1.5 rounded-lg border transition-colors ${
                    block.meta?.level === level ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  H{level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quiz options editor */}
        {block.type === "quiz" && block.meta?.options && (
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 block">Answer Options</label>
            <div className="space-y-1.5">
              {(block.meta.options as string[]).map((opt: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-5">{String.fromCharCode(65 + i)}.</span>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(block.meta!.options as string[])];
                      newOpts[i] = e.target.value;
                      onChange({ meta: { ...block.meta, options: newOpts } });
                    }}
                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-indigo-300"
                  />
                </div>
              ))}
            </div>
            {block.meta?.answerIndex !== undefined && (
              <div className="mt-3">
                <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Correct Answer</label>
                <select
                  value={block.meta.answerIndex}
                  onChange={(e) => onChange({ meta: { ...block.meta, answerIndex: parseInt(e.target.value) } })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-300"
                >
                  {(block.meta.options as string[]).map((_: string, i: number) => (
                    <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Alignment / style for specific types */}
        {block.type === "image" && (
          <div>
            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2 block">Alignment</label>
            <div className="flex gap-1">
              {["left", "center", "right"].map((align) => (
                <button
                  key={align}
                  onClick={() => onChange({ meta: { ...block.meta, align } })}
                  className={`flex-1 text-xs capitalize py-1.5 rounded-lg border transition-colors ${
                    block.meta?.align === align ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Block ID (debug info) */}
        <div className="pt-4 border-t border-gray-100">
          <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 block">Block ID</label>
          <p className="text-[10px] text-gray-300 font-mono truncate">{block.id}</p>
        </div>
      </div>
    </div>
  );
}
