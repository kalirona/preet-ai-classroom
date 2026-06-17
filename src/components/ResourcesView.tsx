import { Download, FileText, FileCode, FileSpreadsheet, FileImage, Search } from "lucide-react";
import { useState } from "react";

export default function ResourcesView() {
  const [search, setSearch] = useState("");

  const resourceCards = [
    {
      id: "res-1",
      title: "speculative-parsing-proxy-starter.zip",
      size: "2.4 MB",
      category: "AI Engineering",
      unlockedAtLevel: 1,
      downloads: 412,
      icon: FileCode,
      iconColor: "from-indigo-500 to-indigo-600",
      desc: "Complete speculative streaming response compiler for Node.js Express. Ready to drop in with optimized JSON routing patterns.",
    },
    {
      id: "res-2",
      title: "stripe-multi-tenant-metadata-hook.js",
      size: "46 KB",
      category: "SaaS Scaling",
      unlockedAtLevel: 4,
      downloads: 180,
      icon: FileCode,
      iconColor: "from-emerald-500 to-emerald-600",
      desc: "Stripe webhook listener with signature validation, metadata parsing, and automatic client database dispatch.",
    },
    {
      id: "res-3",
      title: "marketing-conversion-opt-matrix.xlsx",
      size: "1.2 MB",
      category: "MRR Growth",
      unlockedAtLevel: 1,
      downloads: 290,
      icon: FileSpreadsheet,
      iconColor: "from-amber-500 to-amber-600",
      desc: "Retention calculators, CAC boundaries, viral loop trackers, and high-converting metrics spreadsheet.",
    },
    {
      id: "res-4",
      title: "diaphragmatic-loops-biomechanics.pdf",
      size: "8.9 MB",
      category: "Zen Mindset",
      unlockedAtLevel: 2,
      downloads: 94,
      icon: FileImage,
      iconColor: "from-rose-500 to-rose-600",
      desc: "Illustrated blueprint of respiratory volume cycles, spine decompression shifts, and restorative posture checks.",
    },
  ];

  const filtered = resourceCards.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 font-display">Resources</h1>
            <p className="text-xs text-slate-400">Downloadable templates, code snippets, and guides.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((res) => {
            const Icon = res.icon;
            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-indigo-200/80 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${res.iconColor} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-slate-100 text-slate-500">
                        {res.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{res.size}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 truncate">{res.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{res.desc}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">{res.downloads} downloads</span>
                  <button
                    onClick={() => alert(`Downloading ${res.title}...`)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <FileText className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-xs text-slate-400">No resources match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
