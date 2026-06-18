import React, { useState, useRef, useEffect } from "react";
import { Plus, Heading1, Heading2, Type, Video, Image, FileQuestion, ClipboardList, Paperclip, Quote, Minus, Code, Headphones, FileText, BarChart3, Lightbulb, Sparkles, Bot, PenSquare, MessageSquare, Users, MousePointerClick, ArrowUpRight, Calendar, GripVertical, Trash2, ChevronDown, Download, Pointer, ExternalLink } from "lucide-react";
import { ContentBlock, BlockType } from "./CourseTypes";

interface ContentEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
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
          {block.content && (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 border border-gray-200">
              <Video className="w-8 h-8 text-gray-300 mr-2" />
              Video embed
            </div>
          )}
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
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-amber-300 flex items-center justify-center text-[10px] font-medium text-amber-600">{String.fromCharCode(65 + i)}</div>
                <input type="text" placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1 text-xs bg-white border border-amber-200 rounded px-2 py-1.5 outline-none" />
              </div>
            ))}
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

export default function ContentEditor({ blocks, onChange, selectedBlockId, onSelectBlock }: ContentEditorProps) {
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: "",
    };
    const idx = selectedBlockId ? blocks.findIndex((b) => b.id === selectedBlockId) : blocks.length - 1;
    const updated = [...blocks];
    updated.splice(idx + 1, 0, newBlock);
    onChange(updated);
    onSelectBlock(newBlock.id);
    setShowBlockPicker(false);
  };

  const updateBlockContent = (id: string, content: string) => {
    onChange(blocks.map((b) => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return;
    const filtered = blocks.filter((b) => b.id !== id);
    onChange(filtered);
    if (selectedBlockId === id) {
      const idx = blocks.findIndex((b) => b.id === id);
      onSelectBlock(filtered[Math.min(idx, filtered.length - 1)]?.id || null);
    }
  };

  const changeBlockType = (id: string, newType: BlockType) => {
    onChange(blocks.map((b) => b.id === id ? { ...b, type: newType } : b));
    setShowTypeMenu(null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Simple paste handler: if pasting a URL, could auto-create video/image block
    const text = e.clipboardData.getData("text");
    if (text.startsWith("http") && selectedBlockId) {
      const block = blocks.find((b) => b.id === selectedBlockId);
      if (block && (block.type === "paragraph" || block.type === "heading")) {
        e.preventDefault();
        updateBlockContent(selectedBlockId, text);
      }
    }
  };

  return (
    <div
      ref={editorRef}
      className="h-full flex flex-col bg-white"
      onClick={() => setShowBlockPicker(false)}
    >
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="font-medium text-gray-600">{blocks.length} blocks</span>
        </div>
        <button
          onClick={() => addBlock("paragraph")}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Block
        </button>
      </div>

      {/* Blocks */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
        {blocks.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400 mb-4">No blocks yet. Add your first block.</p>
            <button
              onClick={() => addBlock("paragraph")}
              className="text-sm font-medium text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              + Add Block
            </button>
          </div>
        )}

        {blocks.map((block, idx) => (
          <div
            key={block.id}
            className={`group relative rounded-xl transition-all ${
              selectedBlockId === block.id
                ? "ring-2 ring-gray-900/10 bg-gray-50/50 shadow-sm"
                : "hover:bg-gray-50/30"
            }`}
            onClick={() => onSelectBlock(block.id)}
          >
            {/* Block label bar */}
            <div className={`flex items-center justify-between px-4 py-1.5 ${
              selectedBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } transition-opacity`}>
              <div className="flex items-center gap-2">
                <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab" />
                <span className={`text-[10px] font-medium ${getBlockColor(block.type)} flex items-center gap-1`}>
                  <BlockIcon type={block.type} className="w-3.5 h-3.5" />
                  {blockTypeConfig.find((b) => b.type === block.type)?.label || block.type}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                {/* Block type switcher */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowTypeMenu(showTypeMenu === block.id ? null : block.id); }}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    title="Change block type"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showTypeMenu === block.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowTypeMenu(null)} />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-1 max-h-60 overflow-y-auto">
                        {blockTypeConfig.map((cfg) => {
                          const Icon = cfg.icon;
                          return (
                            <button
                              key={cfg.type}
                              onClick={() => changeBlockType(block.id, cfg.type)}
                              className={`flex items-center gap-2.5 w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 ${
                                block.type === cfg.type ? "bg-gray-50 font-semibold text-gray-900" : "text-gray-700"
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Delete block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Block content */}
            <div className="px-4 pb-3">
              {renderBlockContent(block, (content) => updateBlockContent(block.id, content), (key, value) => {
                const updated = blocks.map((b) => b.id === block.id ? { ...b, meta: { ...b.meta, [key]: value } } : b);
                onChange(updated);
              })}
            </div>
          </div>
        ))}

        {/* Add block button at bottom */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowBlockPicker(true); }}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 w-full transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add a block
          </button>
          {showBlockPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowBlockPicker(false)} />
              <div className="absolute left-4 bottom-full mb-1 w-56 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-2 max-h-72 overflow-y-auto">
                <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Content Blocks</p>
                {blockTypeConfig.slice(0, 10).map((cfg) => {
                  const Icon = cfg.icon;
                  return (
                    <button key={cfg.type} onClick={() => addBlock(cfg.type)} className="flex items-center gap-2.5 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />{cfg.label}
                    </button>
                  );
                })}
                <div className="border-t border-gray-100 my-1" />
                <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">AI & Community</p>
                {blockTypeConfig.slice(10).map((cfg) => {
                  const Icon = cfg.icon;
                  return (
                    <button key={cfg.type} onClick={() => addBlock(cfg.type)} className="flex items-center gap-2.5 w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />{cfg.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
