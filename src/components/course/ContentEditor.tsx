import React, { useState, useRef, useLayoutEffect, useEffect, useCallback, useMemo } from "react";
import { Plus, Heading1, Heading2, Type, Video, Image, FileQuestion, ClipboardList, Paperclip, Quote, Minus, Code, Headphones, FileText, BarChart3, Lightbulb, Sparkles, Bot, PenSquare, MessageSquare, Users, MousePointerClick, ArrowUpRight, Calendar, GripVertical, Trash2, ChevronDown, ChevronRight, Copy, Download, Pointer, ExternalLink, Search, X, Loader2, Zap, Layers, HelpCircle, Command } from "lucide-react";
import { ContentBlock, BlockType } from "./CourseTypes";

interface ContentEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  lessonTitle?: string;
  moduleTitle?: string;
}

const blockTypeConfig: { type: BlockType; label: string; icon: React.ElementType; color: string }[] = [
  { type: "heading", label: "Heading", icon: Heading1, color: "text-gray-900" },
  { type: "paragraph", label: "Paragraph", icon: Type, color: "text-gray-600" },
  { type: "video", label: "Video", icon: Video, color: "text-purple-600" },
  { type: "image", label: "Image", icon: Image, color: "text-blue-600" },
  { type: "quiz", label: "Quiz", icon: FileQuestion, color: "text-amber-600" },
  { type: "assignment", label: "Assignment", icon: ClipboardList, color: "text-emerald-600" },
  { type: "file", label: "File", icon: Paperclip, color: "text-rose-600" },
  { type: "callout", label: "Callout", icon: Quote, color: "text-indigo-600" },
  { type: "divider", label: "Divider", icon: Minus, color: "text-gray-400" },
  { type: "code", label: "Code", icon: Code, color: "text-cyan-600" },
  { type: "audio", label: "Audio", icon: Headphones, color: "text-pink-600" },
  { type: "pdf", label: "PDF", icon: FileText, color: "text-red-600" },
  { type: "button", label: "Button", icon: Pointer, color: "text-gray-900" },
  { type: "embed", label: "Embed", icon: ExternalLink, color: "text-cyan-600" },
  { type: "poll", label: "Poll", icon: BarChart3, color: "text-violet-600" },
  { type: "reflection", label: "Reflection", icon: Lightbulb, color: "text-yellow-600" },
  { type: "ai_summary", label: "AI Summary", icon: Sparkles, color: "text-cyan-600" },
  { type: "ai_tutor", label: "AI Tutor", icon: Bot, color: "text-indigo-600" },
  { type: "ai_practice", label: "AI Practice", icon: PenSquare, color: "text-emerald-600" },
  { type: "discussion_prompt", label: "Discussion", icon: MessageSquare, color: "text-orange-600" },
  { type: "ask_community", label: "Ask Community", icon: Users, color: "text-blue-600" },
  { type: "cta", label: "CTA Button", icon: MousePointerClick, color: "text-gray-900" },
  { type: "upgrade_offer", label: "Upgrade Offer", icon: ArrowUpRight, color: "text-amber-600" },
  { type: "booking", label: "Booking", icon: Calendar, color: "text-green-600" },
];

function BlockIcon({ type, className = "w-4 h-4" }: { type: BlockType; className?: string }) {
  const cfg = blockTypeConfig.find((b) => b.type === type);
  if (!cfg) return <Type className={className} />;
  const Icon = cfg.icon;
  return <Icon className={className} />;
}

function getBlockColor(type: BlockType): string {
  return blockTypeConfig.find((b) => b.type === type)?.color || "text-gray-600";
}

function renderBlockContent(block: ContentBlock, onChange: (content: string) => void, onMetaChange?: (key: string, value: any) => void) {
  switch (block.type) {
    case "heading":
      return (
        <input
          type="text"
          value={block.content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Heading text..."
          className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none p-0 placeholder:text-gray-300"
        />
      );
    case "paragraph":
      return (
        <textarea
          value={block.content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type / for commands, or start writing..."
          rows={Math.max(2, block.content.split("\n").length)}
          className="w-full text-sm text-gray-700 bg-transparent border-none outline-none resize-none p-0 placeholder:text-gray-300 leading-relaxed"
        />
      );
    case "video":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="YouTube/Vimeo URL or video embed URL..."
            className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
          />
          {block.content && (() => {
            const vidId = block.content.match(
              /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
            );
            const vimeoId = block.content.match(/vimeo\.com\/(\d+)/);
            const embedUrl = vidId
              ? `https://www.youtube.com/embed/${vidId[1]}`
              : vimeoId
              ? `https://player.vimeo.com/video/${vimeoId[1]}`
              : block.content;
            return (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video preview"
                />
              </div>
            );
          })()}
        </div>
      );
    case "image":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL..."
            className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
          />
          {block.content && (
            <img src={block.content} alt="" className="max-h-48 rounded-lg object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
        </div>
      );
    case "quiz":
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-3">
            <FileQuestion className="w-4 h-4" />
            Quiz Question
          </div>
          <input
            type="text"
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your question..."
            className="w-full text-sm text-gray-700 bg-white border border-amber-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/20 mb-2"
          />
          <div className="space-y-1.5">
            {[0, 1, 2, 3].map((i) => {
              const options = (block.meta?.options as string[]) || ["", "", "", ""];
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-amber-300 flex items-center justify-center text-[10px] font-medium text-amber-600">{String.fromCharCode(65 + i)}</div>
                  <input
                    type="text"
                    value={options[i] || ""}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[i] = e.target.value;
                      onMetaChange?.("options", newOptions);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 text-xs bg-white border border-amber-200 rounded px-2 py-1.5 outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    case "assignment":
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 mb-2">
            <ClipboardList className="w-4 h-4" />
            Assignment
          </div>
          <textarea
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder="Describe the assignment task..."
            className="w-full text-sm text-gray-700 bg-white border border-emerald-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
          />
        </div>
      );
    case "callout":
      return (
        <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-r-xl p-4">
          <textarea
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            placeholder="Callout / important note..."
            className="w-full text-sm text-gray-700 bg-transparent border-none outline-none resize-none p-0 placeholder:text-indigo-300"
          />
        </div>
      );
    case "code":
      return (
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-800">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-[10px] text-gray-400 ml-2">code</span>
          </div>
          <textarea
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            placeholder="// Write your code here..."
            className="w-full text-xs text-green-400 bg-transparent border-none outline-none resize-none p-4 font-mono placeholder:text-gray-600"
            spellCheck={false}
          />
        </div>
      );
    case "file":
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-800 mb-2">
            <Download className="w-4 h-4" />
            Download
          </div>
          <input
            type="text"
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="File URL or upload path..."
            className="w-full text-sm text-gray-700 bg-white border border-rose-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
      );
    case "audio":
      return (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-pink-800 mb-2">
            <Headphones className="w-4 h-4" />
            Audio
          </div>
          <input
            type="text"
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Audio file URL (MP3, WAV)..."
            className="w-full text-sm text-gray-700 bg-white border border-pink-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-pink-500/20"
          />
          {block.content && (
            <audio controls src={block.content} className="mt-2 w-full h-10 rounded-lg" />
          )}
        </div>
      );
    case "pdf":
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-800 mb-2">
            <FileText className="w-4 h-4" />
            PDF Document
          </div>
          <input
            type="text"
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="PDF URL..."
            className="w-full text-sm text-gray-700 bg-white border border-red-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500/20"
          />
          {block.content && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-white rounded-lg px-3 py-2 border border-red-100">
              <FileText className="w-4 h-4" />
              <span>PDF document linked</span>
            </div>
          )}
        </div>
      );
    case "button":
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
            <Pointer className="w-4 h-4" />
            Button
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={block.content}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Button text..."
              className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
            />
            <input
              type="text"
              value={block.meta?.url || ""}
              onChange={(e) => onMetaChange?.("url", e.target.value)}
              placeholder="Button URL..."
              className="w-full text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
          <div className="mt-3 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-xl">
              {block.content || "Button Text"}
            </div>
          </div>
        </div>
      );
    case "embed":
      return (
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-800 mb-2">
            <ExternalLink className="w-4 h-4" />
            Embed
          </div>
          <input
            type="text"
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste embed URL or code (YouTube, Vimeo, CodePen, etc.)..."
            className="w-full text-sm text-gray-700 bg-white border border-cyan-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          {block.content && (
            <div className="mt-2 aspect-video bg-white rounded-lg border border-cyan-100 flex items-center justify-center text-xs text-cyan-500">
              <ExternalLink className="w-6 h-6 mr-2" />
              Embed: {block.content.slice(0, 60)}{block.content.length > 60 ? "..." : ""}
            </div>
          )}
        </div>
      );
    case "divider":
      return <hr className="border-t border-gray-200 my-2" />;
    case "poll":
      return (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-800 mb-2">
            <BarChart3 className="w-4 h-4" />
            Poll
          </div>
          <input type="text" value={block.content} onChange={(e) => onChange(e.target.value)} placeholder="Ask a question..." className="w-full text-sm bg-white border border-violet-200 rounded-lg px-3 py-2 outline-none" />
        </div>
      );
    case "reflection":
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-yellow-800 mb-2">
            <Lightbulb className="w-4 h-4" />
            Reflection
          </div>
          <textarea value={block.content} onChange={(e) => onChange(e.target.value)} rows={2} placeholder="Prompt students to reflect..." className="w-full text-sm bg-white border border-yellow-200 rounded-lg px-3 py-2 outline-none resize-none" />
        </div>
      );
    case "ai_summary":
      return (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-800 mb-2">
            <Sparkles className="w-4 h-4" />
            AI Summary
          </div>
          <p className="text-xs text-cyan-700">AI will summarize the lesson content for students automatically.</p>
        </div>
      );
    case "ai_tutor":
      return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-800 mb-2">
            <Bot className="w-4 h-4" />
            AI Tutor
          </div>
          <p className="text-xs text-indigo-700">Students can ask questions to an AI tutor about this lesson.</p>
        </div>
      );
    case "ai_practice":
      return (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 mb-2">
            <PenSquare className="w-4 h-4" />
            AI Practice Questions
          </div>
          <p className="text-xs text-emerald-700">AI generates practice questions based on lesson content.</p>
        </div>
      );
    case "discussion_prompt":
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-orange-800 mb-2">
            <MessageSquare className="w-4 h-4" />
            Discussion Prompt
          </div>
          <input type="text" value={block.content} onChange={(e) => onChange(e.target.value)} placeholder="Start a discussion..." className="w-full text-sm bg-white border border-orange-200 rounded-lg px-3 py-2 outline-none" />
        </div>
      );
    case "ask_community":
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 mb-2">
            <Users className="w-4 h-4" />
            Ask the Community
          </div>
          <p className="text-xs text-blue-700">Students can post questions visible to the community.</p>
        </div>
      );
    case "cta":
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <input type="text" value={block.content} onChange={(e) => onChange(e.target.value)} placeholder="Button text (e.g. Enroll Now)" className="text-sm font-semibold text-center bg-white border border-gray-300 rounded-lg px-4 py-2 outline-none mx-auto max-w-xs w-full" />
          <p className="text-[10px] text-gray-400 mt-1">CTA button for students</p>
        </div>
      );
    case "upgrade_offer":
      return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-amber-800 mb-2">
            <ArrowUpRight className="w-4 h-4" />
            Upgrade Offer
          </div>
          <input type="text" value={block.content} onChange={(e) => onChange(e.target.value)} placeholder="Describe the upgrade offer..." className="w-full text-sm bg-white border border-amber-200 rounded-lg px-3 py-2 outline-none mx-auto max-w-sm" />
        </div>
      );
    case "booking":
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-2">
            <Calendar className="w-4 h-4" />
            Booking / Calendar
          </div>
          <p className="text-xs text-green-700">Students can book a 1:1 session with you.</p>
        </div>
      );
    default:
      return (
        <textarea
          value={block.content}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder="Type here..."
          className="w-full text-sm text-gray-700 bg-transparent border-none outline-none resize-none p-0"
        />
      );
  }
}

const blockCategories = [
  {
    name: "Text & Headings",
    types: ["heading", "paragraph", "divider", "quote", "code", "button"],
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    name: "Media & Files",
    types: ["image", "video", "audio", "file", "pdf", "embed"],
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    name: "Interactivity",
    types: ["quiz", "assignment", "poll", "discussion_prompt", "cta", "booking"],
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    name: "AI & Engagement",
    types: ["ai_summary", "ai_tutor", "ai_practice", "ask_community", "reflection", "upgrade_offer"],
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const favoriteBlocks: BlockType[] = ["paragraph", "heading", "video", "image", "quiz", "pdf", "ai_summary"];

export default function ContentEditor({ blocks, onChange, selectedBlockId, onSelectBlock, lessonTitle, moduleTitle }: ContentEditorProps) {
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState<string | null>(null);
  const [inlinePickerIdx, setInlinePickerIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragBlockId, setDragBlockId] = useState<string | null>(null);
  const [dragOverBlockIdx, setDragOverBlockIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const blocksContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const blockPickerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (selectedBlockId) {
      const el = blocksContainerRef.current?.querySelector(`[data-block-id="${selectedBlockId}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [blocks.length, selectedBlockId]);

  useEffect(() => {
    if (showBlockPicker && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [showBlockPicker]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!showBlockPicker) setSearchQuery("");
        setShowBlockPicker(prev => !prev);
      }
      if (e.key === "Escape") {
        setShowBlockPicker(false);
        setShowTypeMenu(null);
        setInlinePickerIdx(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showBlockPicker]);

  const addBlock = useCallback((type: BlockType, idx?: number) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: "",
    };
    let insertIdx = blocks.length - 1;
    if (idx !== undefined) {
      insertIdx = idx;
    } else if (selectedBlockId) {
      const found = blocks.findIndex((b) => b.id === selectedBlockId);
      if (found !== -1) insertIdx = found;
    }
    const updated = [...blocks];
    updated.splice(insertIdx + 1, 0, newBlock);
    onChange(updated);
    onSelectBlock(newBlock.id);
    setShowBlockPicker(false);
    setInlinePickerIdx(null);
    setSearchQuery("");
  }, [blocks, selectedBlockId, onChange, onSelectBlock]);

  const updateBlockContent = useCallback((id: string, content: string) => {
    onChange(blocks.map((b) => b.id === id ? { ...b, content } : b));
  }, [blocks, onChange]);

  const updateBlockMeta = useCallback((id: string, key: string, value: any) => {
    const updated = blocks.map((b) => b.id === id ? { ...b, meta: { ...b.meta, [key]: value } } : b);
    onChange(updated);
  }, [blocks, onChange]);

  const deleteBlock = useCallback((id: string) => {
    if (blocks.length <= 1) return;
    const filtered = blocks.filter((b) => b.id !== id);
    onChange(filtered);
    if (selectedBlockId === id) {
      const idx = blocks.findIndex((b) => b.id === id);
      onSelectBlock(filtered[Math.min(idx, filtered.length - 1)]?.id || null);
    }
  }, [blocks, onChange, onSelectBlock, selectedBlockId]);

  const changeBlockType = useCallback((id: string, newType: BlockType) => {
    onChange(blocks.map((b) => b.id === id ? { ...b, type: newType } : b));
    setShowTypeMenu(null);
  }, [blocks, onChange]);

  const moveBlock = useCallback((fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onChange(updated);
  }, [blocks, onChange]);

  const duplicateBlock = useCallback((id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    const idx = blocks.findIndex(b => b.id === id);
    const clone: ContentBlock = { ...block, id: `block-${Date.now()}` };
    const updated = [...blocks];
    updated.splice(idx + 1, 0, clone);
    onChange(updated);
    onSelectBlock(clone.id);
  }, [blocks, onChange, onSelectBlock]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    if (text.startsWith("http") && selectedBlockId) {
      const block = blocks.find((b) => b.id === selectedBlockId);
      if (block && (block.type === "paragraph" || block.type === "heading")) {
        e.preventDefault();
        updateBlockContent(selectedBlockId, text);
      }
    }
  }, [blocks, selectedBlockId, updateBlockContent]);

  const handleKeyDownBlock = useCallback((e: React.KeyboardEvent, blockId: string, idx: number) => {
    const block = blocks[idx];
    if (!block) return;
    if (e.key === "Enter" && !e.shiftKey && (block.type === "paragraph" || block.type === "heading")) {
      e.preventDefault();
      addBlock("paragraph", idx);
    }
    if (e.key === "Backspace" && !block.content && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(blockId);
    }
  }, [blocks, addBlock, deleteBlock]);

  const handleBlockDragStart = useCallback((blockId: string, e: React.DragEvent) => {
    setDragBlockId(blockId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleBlockDragOver = useCallback((idx: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverBlockIdx(idx);
  }, []);

  const handleBlockDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragBlockId && dragOverBlockIdx !== null) {
      const fromIdx = blocks.findIndex(b => b.id === dragBlockId);
      if (fromIdx !== -1) moveBlock(fromIdx, dragOverBlockIdx);
    }
    setDragBlockId(null);
    setDragOverBlockIdx(null);
    setIsDragging(false);
  }, [dragBlockId, dragOverBlockIdx, blocks, moveBlock]);

  const handleDragLeave = useCallback(() => {
    setDragOverBlockIdx(null);
  }, []);

  const filteredBlockTypes = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return blockTypeConfig.filter(cfg =>
      cfg.label.toLowerCase().includes(q) ||
      cfg.type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const addBlockFromSearch = useCallback((type: BlockType) => {
    addBlock(type);
  }, [addBlock]);

  const addBlockInline = useCallback((type: BlockType) => {
    addBlock(type, inlinePickerIdx ?? undefined);
    setInlinePickerIdx(null);
  }, [addBlock, inlinePickerIdx]);

  return (
    <div
      ref={editorRef}
      className="h-full flex flex-col bg-white"
      onClick={(e) => {
        if (!blockPickerRef.current?.contains(e.target as Node)) {
          setShowBlockPicker(false);
          setInlinePickerIdx(null);
        }
      }}
    >
      {/* Lesson breadcrumb */}
      {lessonTitle && (
        <div className="px-6 py-2 bg-gradient-to-r from-gray-50/80 to-white border-b border-gray-100 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="font-medium text-gray-500">{moduleTitle || "Course"}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-gray-700">{lessonTitle}</span>
            <span className="ml-auto font-medium text-gray-500">{blocks.length} {blocks.length === 1 ? "block" : "blocks"}</span>
          </div>
        </div>
      )}

      {/* Blocks area */}
      <div ref={blocksContainerRef} className="flex-1 overflow-y-auto" onPaste={handlePaste}>
        {/* Sticky floating Add Block button */}
        <div className="sticky top-0 z-10 px-6 pt-4 pb-2 bg-gradient-to-b from-white via-white/95 to-transparent">
          <button
            onClick={(e) => { e.stopPropagation(); setShowBlockPicker(!showBlockPicker); if (!showBlockPicker) setSearchQuery(""); }}
            className="group w-full flex items-center gap-3 px-5 py-3 rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors">
                Add a block
              </span>
              <span className="ml-2 text-xs text-gray-400">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono border border-gray-200">⌘K</kbd>
              </span>
            </div>
          </button>
        </div>

        {/* Block Picker Dropdown */}
        {showBlockPicker && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => { setShowBlockPicker(false); setSearchQuery(""); }} />
            <div
              ref={blockPickerRef}
              className="fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/4 w-[480px] max-w-[90vw] bg-white rounded-2xl border border-gray-200 shadow-2xl z-30 overflow-hidden"
            >
              {/* Search bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blocks by name..."
                  className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono border border-gray-100">⌘K</kbd>
                  <span>close</span>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[360px] overflow-y-auto p-3">
                {filteredBlockTypes ? (
                  <div className="grid grid-cols-2 gap-1">
                    {filteredBlockTypes.map((cfg) => {
                      const Icon = cfg.icon;
                      return (
                        <button key={cfg.type} onClick={() => addBlockFromSearch(cfg.type)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-medium">{cfg.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Favorites */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 px-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quick Add</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {favoriteBlocks.map((type) => {
                          const cfg = blockTypeConfig.find(b => b.type === type);
                          if (!cfg) return null;
                          const Icon = cfg.icon;
                          return (
                            <button key={type} onClick={() => addBlockFromSearch(type)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/50 transition-all">
                              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Categories */}
                    {blockCategories.map((cat) => (
                      <div key={cat.name}>
                        <div className="flex items-center gap-1.5 mb-1.5 px-1">
                          <Layers className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{cat.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {cat.types.map((type) => {
                            const cfg = blockTypeConfig.find(b => b.type === type);
                            if (!cfg) return null;
                            const Icon = cfg.icon;
                            return (
                              <button key={type} onClick={() => addBlockFromSearch(type)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400">
                <span><kbd className="px-1 py-0.5 bg-gray-100 rounded font-mono border border-gray-100">Tab</kbd> navigate</span>
                <span><kbd className="px-1 py-0.5 bg-gray-100 rounded font-mono border border-gray-100">Enter</kbd> select</span>
                <span><kbd className="px-1 py-0.5 bg-gray-100 rounded font-mono border border-gray-100">Esc</kbd> close</span>
              </div>
            </div>
          </>
        )}

        {/* Blocks */}
        <div className="px-6 pb-6 space-y-2">
          {blocks.length === 0 && !showBlockPicker && (
            <div className="text-center py-16 px-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start building your lesson</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
                Click "Add a block" above or press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-xs border border-gray-200">⌘K</kbd> to add your first block
              </p>
              <button onClick={() => addBlock("paragraph")} className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-lg">
                <Plus className="w-4 h-4" />
                Add Your First Block
              </button>
            </div>
          )}

          {blocks.map((block, idx) => (
            <div key={block.id}>
              {/* Inline add-block between blocks */}
              {idx > 0 && (
                <div className="flex items-center gap-2 group/add relative h-0 opacity-0 group-hover/add:opacity-100 hover:opacity-100 transition-opacity" style={{ marginTop: "-2px", marginBottom: "-2px" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setInlinePickerIdx(inlinePickerIdx === idx ? null : idx); }}
                    className="flex items-center gap-1 text-[10px] text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 px-2 py-0.5 rounded-full transition-all relative z-10"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">Add block</span>
                  </button>
                </div>
              )}

              {/* Inline block picker */}
              {inlinePickerIdx === idx && (
                <div className="ml-8 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap p-2 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                    {blockTypeConfig.slice(0, 8).map((cfg) => {
                      const Icon = cfg.icon;
                      return (
                        <button key={cfg.type} onClick={() => addBlockInline(cfg.type)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all" title={cfg.label}>
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          <span className="hidden sm:inline">{cfg.label}</span>
                        </button>
                      );
                    })}
                    <button onClick={() => { setShowBlockPicker(true); setInlinePickerIdx(null); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-indigo-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-indigo-200 transition-all">
                      <Search className="w-3 h-3" />
                      More...
                    </button>
                  </div>
                </div>
              )}

              {/* Block */}
              <div
                data-block-id={block.id}
                draggable
                onDragStart={(e) => handleBlockDragStart(block.id, e)}
                onDragOver={(e) => handleBlockDragOver(idx, e)}
                onDrop={handleBlockDrop}
                onDragLeave={handleDragLeave}
                className={`group relative rounded-xl transition-all ${
                  dragOverBlockIdx === idx ? "ring-2 ring-indigo-300 bg-indigo-50/30" : ""
                } ${
                  selectedBlockId === block.id
                    ? "ring-2 ring-indigo-200 bg-white shadow-sm border border-indigo-100"
                    : "hover:bg-gray-50/50 border border-transparent"
                }`}
                onClick={() => onSelectBlock(block.id)}
              >
                {/* Block label bar */}
                <div className={`flex items-center justify-between px-4 py-1.5 ${
                  selectedBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                } transition-opacity`}>
                  <div className="flex items-center gap-2">
                    <div className="cursor-grab active:cursor-grabbing p-0.5 text-gray-300 hover:text-gray-500">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-[10px] font-medium ${getBlockColor(block.type)} flex items-center gap-1`}>
                      <BlockIcon type={block.type} className="w-3.5 h-3.5" />
                      {blockTypeConfig.find((b) => b.type === block.type)?.label || block.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowTypeMenu(showTypeMenu === block.id ? null : block.id); }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Change block type"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      {showTypeMenu === block.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowTypeMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-2 max-h-72 overflow-y-auto">
                            <p className="px-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Change block type</p>
                            {blockTypeConfig.map((cfg) => {
                              const Icon = cfg.icon;
                              return (
                                <button key={cfg.type} onClick={() => changeBlockType(block.id, cfg.type)} className={`flex items-center gap-2.5 w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50 transition-colors ${block.type === cfg.type ? "bg-gray-50 font-semibold text-gray-900" : "text-gray-700"}`}>
                                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                                  {cfg.label}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" title="Duplicate block">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete block">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block content */}
                <div className="px-4 pb-3">
                  {renderBlockContent(block, (content) => updateBlockContent(block.id, content), (key, value) => updateBlockMeta(block.id, key, value))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom add block */}
        {blocks.length > 0 && (
          <div className="px-6 pb-8">
            <button
              onClick={(e) => { e.stopPropagation(); setShowBlockPicker(true); }}
              className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/30 border border-dashed border-transparent hover:border-indigo-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add a block</span>
              <span className="text-xs text-gray-300">
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono border border-gray-100">⌘K</kbd>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
