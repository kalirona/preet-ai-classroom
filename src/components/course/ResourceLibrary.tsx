import React, { useState } from "react";
import {
  Search, FolderOpen, FileText, Video, Headphones, Image, File,
  Tag, Plus, Upload, X, Grid3X3, List, BarChart3, ExternalLink,
  MoreHorizontal, Copy, Trash2, Download
} from "lucide-react";
import { ResourceItem } from "./CourseTypes";

const demoResources: ResourceItem[] = [
  { id: "r1", title: "Introduction to Algorithms.pdf", type: "pdf", url: "/resources/algorithms.pdf", tags: ["algorithms", "basics"], folder: "PDFs", usageCount: 3, createdAt: "2026-05-10", size: "2.4 MB" },
  { id: "r2", title: "Course Intro Video.mp4", type: "video", url: "/resources/intro.mp4", tags: ["video", "intro"], folder: "Videos", usageCount: 5, createdAt: "2026-05-12", size: "45 MB" },
  { id: "r3", title: "Background Music.mp3", type: "audio", url: "/resources/bg.mp3", tags: ["audio", "music"], folder: "Audio", usageCount: 2, createdAt: "2026-05-15", size: "8.1 MB" },
  { id: "r4", title: "Course Thumbnail.png", type: "image", url: "/resources/thumb.png", tags: ["image", "cover"], folder: "Images", usageCount: 7, createdAt: "2026-05-08", size: "1.2 MB" },
  { id: "r5", title: "Assignment Template.docx", type: "file", url: "/resources/template.docx", tags: ["assignment", "template"], folder: "Documents", usageCount: 4, createdAt: "2026-05-20", size: "56 KB" },
  { id: "r6", title: "Advanced Topics Guide.pdf", type: "pdf", url: "/resources/advanced.pdf", tags: ["advanced", "guide"], folder: "PDFs", usageCount: 1, createdAt: "2026-06-01", size: "3.7 MB" },
];

const folders = ["All Resources", "Videos", "Audio", "Images", "PDFs", "Documents"];

const typeIcons: Record<string, React.ElementType> = { video: Video, audio: Headphones, image: Image, pdf: FileText, file: File };

export default function ResourceLibrary() {
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("All Resources");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);

  const allTags = [...new Set(demoResources.flatMap((r) => r.tags))];

  const filtered = demoResources.filter((r) => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    const matchFolder = activeFolder === "All Resources" || r.folder === activeFolder;
    const matchTag = !activeTag || r.tags.includes(activeTag);
    return matchSearch && matchFolder && matchTag;
  });

  const totalUsage = demoResources.reduce((s, r) => s + r.usageCount, 0);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Resource Library</h2>
          <p className="text-xs text-gray-500">{demoResources.length} resources, used {totalUsage} times across all courses</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 text-sm font-medium text-white bg-gray-900 px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Folders */}
        <div className="w-48 border-r border-gray-200 p-3 space-y-1 shrink-0">
          {folders.map((f) => (
            <button key={f} onClick={() => setActiveFolder(f)} className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors ${
              activeFolder === f ? "bg-gray-100 font-semibold text-gray-900" : "text-gray-600 hover:bg-gray-50"
            }`}>
              <FolderOpen className="w-3.5 h-3.5" />
              {f}
            </button>
          ))}
        </div>

        {/* Center: Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & filters */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-gray-200 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-gray-200 text-gray-700" : "text-gray-400 hover:text-gray-600"}`}><List className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-gray-100 overflow-x-auto shrink-0">
            <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {allTags.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition-colors whitespace-nowrap ${
                activeTag === tag ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}>
                {tag}
              </button>
            ))}
          </div>

          {/* Resource grid/list */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No resources found</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((r) => {
                  const Icon = typeIcons[r.type] || File;
                  return (
                    <div key={r.id} className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm hover:border-gray-300 transition-all">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{r.size} &middot; Used {r.usageCount}x</p>
                      <div className="flex items-center gap-1 mt-2">
                        {r.tags.map((t) => <span key={t} className="px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-500 rounded">{t}</span>)}
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-400"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((r) => {
                  const Icon = typeIcons[r.type] || File;
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{r.title}</p>
                        <p className="text-[10px] text-gray-400">{r.size} &middot; {r.folder}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span>Used {r.usageCount}x</span>
                        {r.tags.map((t) => <span key={t} className="px-1.5 py-0.5 bg-gray-100 rounded">{t}</span>)}
                      </div>
                      <button className="p-1 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upload Resource</h3>
              <button onClick={() => setShowUpload(false)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Drop files here or click to browse</p>
              <p className="text-[10px] text-gray-400 mt-1">Supports: MP4, PDF, MP3, PNG, JPG, DOCX (max 100MB)</p>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Folder</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10">
                  {folders.filter((f) => f !== "All Resources").map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Tags</label>
                <input type="text" placeholder="Add tags separated by commas..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10" />
              </div>
              <button className="w-full py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
