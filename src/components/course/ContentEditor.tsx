import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, GripVertical, Heading1, Heading2, Type, Code, Video, Image, FileText, HelpCircle, PenTool, Minus, Quote, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { ContentBlock, BlockType } from "./CourseTypes";
import { v4 as uuidv4 } from "uuid";

interface ContentEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  lessonTitle: string;
  onLessonTitleChange: (title: string) => void;
  contentType: string;
  onContentTypeChange: (type: string) => void;
}

const BLOCK_TYPES: { type: BlockType; icon: React.ReactNode; label: string }[] = [
  { type: "heading", icon: <Heading1 className="w-3.5 h-3.5" />, label: "Heading" },
  { type: "paragraph", icon: <Type className="w-3.5 h-3.5" />, label: "Text" },
  { type: "video", icon: <Video className="w-3.5 h-3.5" />, label: "Video" },
  { type: "image", icon: <Image className="w-3.5 h-3.5" />, label: "Image" },
  { type: "quiz", icon: <HelpCircle className="w-3.5 h-3.5" />, label: "Quiz" },
  { type: "assignment", icon: <PenTool className="w-3.5 h-3.5" />, label: "Assignment" },
  { type: "callout", icon: <Quote className="w-3.5 h-3.5" />, label: "Callout" },
  { type: "code", icon: <Code className="w-3.5 h-3.5" />, label: "Code" },
  { type: "divider", icon: <Minus className="w-3.5 h-3.5" />, label: "Divider" },
  { type: "file", icon: <FileText className="w-3.5 h-3.5" />, label: "File" },
];

function BlockRenderer({ block, isSelected, onSelect, onChange, onDelete, onMoveUp, onMoveDown }: {
  block: ContentBlock;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  const renderEditor = () => {
    switch (block.type) {
      case "heading":
        return (
          <input
            ref={inputRef as any}
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Type heading..."
            className="w-full text-xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder-gray-300"
          />
        );
      case "paragraph":
        return (
          <textarea
            ref={inputRef as any}
            value={block.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Type / to add blocks, or start writing..."
            rows={Math.max(2, block.content.split("\n").length)}
            className="w-full text-sm text-gray-700 bg-transparent border-none outline-none resize-none placeholder-gray-300"
          />
        );
      case "video":
        return (
          <div className="space-y-2">
            <input
              value={block.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="Paste video URL (YouTube, Vimeo)..."
              className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 placeholder-gray-300"
            />
            {block.content && (
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                <Video className="w-4 h-4 mr-1" /> Video Player — {block.content}
              </div>
            )}
          </div>
        );
      case "image":
        return (
          <div className="space-y-2">
            <input
              value={block.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="Paste image URL..."
              className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 placeholder-gray-300"
            />
            {block.content && (
              <div className="rounded-lg overflow-hidden bg-gray-50">
                <img src={block.content} alt="" className="max-h-48 object-contain mx-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>
        );
      case "quiz":
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-medium text-amber-700 mb-1">Quiz Question</p>
            <textarea
              value={block.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="Enter quiz question..."
              rows={2}
              className="w-full text-sm bg-white border border-amber-200 rounded px-2 py-1.5 outline-none focus:border-amber-400"
            />
            {block.meta?.options && (
              <div className="mt-2 space-y-1">
                {(block.meta.options as string[]).map((opt: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "assignment":
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs font-medium text-purple-700 mb-1">Assignment Instructions</p>
            <textarea
              value={block.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="Describe the assignment task..."
              rows={3}
              className="w-full text-sm bg-white border border-purple-200 rounded px-2 py-1.5 outline-none focus:border-purple-400"
            />
          </div>
        );
      case "callout":
        return (
          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3">
            <textarea
              value={block.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="Type a callout or tip..."
              rows={2}
              className="w-full text-sm text-blue-800 bg-transparent border-none outline-none resize-none placeholder-blue-300"
            />
          </div>
        );
      case "code":
        return (
          <div className="bg-gray-900 rounded-lg p-3">
            <textarea
              value={block.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="// Type or paste code..."
              rows={4}
              className="w-full text-xs font-mono text-green-400 bg-transparent border-none outline-none resize-none placeholder-gray-500"
            />
          </div>
        );
      case "divider":
        return <hr className="border-gray-200 my-2" />;
      case "file":
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <input
              value={block.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="File name or resource title..."
              className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none placeholder-gray-300"
            />
          </div>
        );
    }
  };

  const label = BLOCK_TYPES.find((b) => b.type === block.type)?.label || block.type;

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl border-2 transition-all cursor-pointer ${
        isSelected ? "border-indigo-400 bg-white shadow-sm" : "border-transparent hover:border-gray-200 hover:bg-gray-50/50"
      }`}
    >
      {/* Block controls - visible on hover */}
      <div className={`absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? "opacity-100" : ""}`}>
        <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600">
          <ChevronUp className="w-3 h-3" />
        </button>
        <GripVertical className="w-3 h-3 text-gray-300" />
        <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600">
          <ChevronDown className="w-3 h-3" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-0.5 hover:bg-red-100 rounded text-red-400 hover:text-red-600 mt-1">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
        {renderEditor()}
      </div>
    </div>
  );
}

export default function ContentEditor({
  blocks, onChange, selectedBlockId, onSelectBlock,
  lessonTitle, onLessonTitleChange, contentType, onContentTypeChange,
}: ContentEditorProps) {
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [blockPickerIndex, setBlockPickerIndex] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowBlockPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addBlock = (type: BlockType, atIndex: number) => {
    const newBlock: ContentBlock = {
      id: `block-${uuidv4().slice(0, 8)}`,
      type,
      content: "",
      meta: type === "heading" ? { level: 2 } : type === "quiz" ? { options: ["Option A", "Option B", "Option C", "Option D"] } : undefined,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(atIndex, 0, newBlock);
    onChange(newBlocks);
    onSelectBlock(newBlock.id);
    setShowBlockPicker(false);
  };

  const updateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    onChange(blocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)));
  };

  const deleteBlock = (blockId: string) => {
    onChange(blocks.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) onSelectBlock(null);
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (direction === "up" && idx > 0) {
      const newBlocks = [...blocks];
      [newBlocks[idx - 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx - 1]];
      onChange(newBlocks);
    } else if (direction === "down" && idx < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[idx + 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx + 1]];
      onChange(newBlocks);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Lesson header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Lesson</span>
          <div className="flex items-center gap-1.5">
            {["video", "text", "quiz", "assignment", "download"].map((type) => (
              <button
                key={type}
                onClick={() => onContentTypeChange(type)}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize transition-colors ${
                  contentType === type ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <input
          value={lessonTitle}
          onChange={(e) => onLessonTitleChange(e.target.value)}
          placeholder="Lesson title..."
          className="w-full text-lg font-semibold text-gray-900 bg-transparent border-none outline-none placeholder-gray-300"
        />
      </div>

      {/* Blocks */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {blocks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400 mb-4">This lesson is empty. Start adding content blocks.</p>
            </div>
          )}
          {blocks.map((block, i) => (
            <React.Fragment key={block.id}>
              <BlockRenderer
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => onSelectBlock(block.id)}
                onChange={(updates) => updateBlock(block.id, updates)}
                onDelete={() => deleteBlock(block.id)}
                onMoveUp={() => moveBlock(block.id, "up")}
                onMoveDown={() => moveBlock(block.id, "down")}
              />
              {/* Add block button between blocks */}
              <div className="relative group">
                <button
                  onClick={() => { setBlockPickerIndex(i + 1); setShowBlockPicker(true); }}
                  className="w-full h-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:h-6 hover:opacity-100"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-colors">
                    <Plus className="w-3 h-3 text-indigo-500" />
                  </div>
                </button>
              </div>
            </React.Fragment>
          ))}
          {/* Add block at end */}
          <div className="pt-2">
            <button
              onClick={() => { setBlockPickerIndex(blocks.length); setShowBlockPicker(true); }}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Block
            </button>
          </div>
        </div>
      </div>

      {/* Block picker popover */}
      {showBlockPicker && (
        <div
          ref={pickerRef}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3"
        >
          <div className="grid grid-cols-5 gap-1">
            {BLOCK_TYPES.map((bt) => (
              <button
                key={bt.type}
                onClick={() => blockPickerIndex !== null && addBlock(bt.type, blockPickerIndex)}
                className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  {bt.icon}
                </div>
                <span className="text-[10px] text-gray-500">{bt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
