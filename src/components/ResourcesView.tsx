import React from "react";
import { Download, FileText, CheckCircle2, Star, MessageSquare } from "lucide-react";

export default function ResourcesView() {
  const resourceCards = [
    {
      id: "res-1",
      title: "speculative-parsing-proxy-starter.zip",
      size: "2.4 MB",
      category: "AI Engineering",
      unlockedAtLevel: 1,
      downloads: 412,
      docUrl: "#",
      desc: "Complete speculative streaming response compiler code for Node.js Express. Ready to drop in. Fully optimized JSON routing patterns inside."
    },
    {
      id: "res-2",
      title: "stripe-multi-tenant-metadata-hook.js",
      size: "46 KB",
      category: "SaaS Scaling",
      unlockedAtLevel: 4,
      downloads: 180,
      docUrl: "#",
      desc: "SaaS webhook listener with safe Stripe signature validation, metadata domain parsing, and automatic client database level-up dispatch algorithms."
    },
    {
      id: "res-3",
      title: "marketing-conversion-opt-matrix.xlsx",
      size: "1.2 MB",
      category: "MRR Growth",
      unlockedAtLevel: 1,
      downloads: 290,
      docUrl: "#",
      desc: "High converting metrics, retention calculators, CAC boundaries, and viral loop gamification trackers."
    },
    {
      id: "res-4",
      title: "diaphragmatic-loops-biomechanics.pdf",
      size: "8.9 MB",
      category: "Zen Mindset",
      unlockedAtLevel: 2,
      downloads: 94,
      docUrl: "#",
      desc: "An illustrated detailed blueprint outlining respiratory volume cycles, spine decompression shifts, and restorative posture checks."
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] overflow-y-auto" id="resources-view">
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header Block */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 font-display">Resource Vault & Assets Download</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Access masterclasses spreadsheet configs, ZIP boilerplates, custom templates, and guides curated by Instructors.
            </p>
          </div>
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resourceCards.map((res) => (
            <div key={res.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase bg-indigo-50 text-indigo-700">
                    {res.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{res.size}</span>
                </div>
                
                <h3 className="text-xs font-bold font-sans text-gray-900 flex items-center gap-1.5 leading-tight">
                  <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                  {res.title}
                </h3>
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                  {res.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono">
                  📥 {res.downloads} downloads total
                </span>
                
                <button
                  type="button"
                  onClick={() => alert(`Initiating secure direct download of draft asset file: ${res.title}`)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider font-mono flex items-center gap-1 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Fetch Asset
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
