import React, { useState } from "react";
import { Eye, EyeOff, Monitor, Smartphone, Undo2, Redo2, Save, Sparkles, Palette, Type, Layout, Image, Globe, Menu, X, Plus, ChevronRight, ChevronDown, Settings, Trash2, GripVertical } from "lucide-react";

interface BuilderSection {
  id: string;
  type: "hero" | "features" | "cta" | "pricing" | "testimonials" | "faq" | "stats" | "custom";
  title: string;
  visible: boolean;
}

interface BuilderConfig {
  logo: string;
  primaryColor: string;
  font: string;
  heroHeadline: string;
  heroSubheadline: string;
  ctaText: string;
  sections: BuilderSection[];
}

const defaultConfig: BuilderConfig = {
  logo: "SkoolClone",
  primaryColor: "#111827",
  font: "Inter",
  heroHeadline: "Build, Teach, and Grow Your Community",
  heroSubheadline: "The all-in-one platform for creators.",
  ctaText: "Get Started Free",
  sections: [
    { id: "hero", type: "hero", title: "Hero Section", visible: true },
    { id: "features", type: "features", title: "Features Grid", visible: true },
    { id: "stats", type: "stats", title: "Stats Bar", visible: true },
    { id: "cta", type: "cta", title: "Call to Action", visible: true },
    { id: "pricing", type: "pricing", title: "Pricing", visible: true },
    { id: "testimonials", type: "testimonials", title: "Testimonials", visible: true },
    { id: "faq", type: "faq", title: "FAQ", visible: true },
  ],
};

export default function WebsiteBuilder() {
  const [config, setConfig] = useState<BuilderConfig>(defaultConfig);
  const [preview, setPreview] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [activePanel, setActivePanel] = useState<"content" | "design" | "sections">("content");

  const updateConfig = (updates: Partial<BuilderConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const toggleSection = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => s.id === id ? { ...s, visible: !s.visible } : s),
    }));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...config.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setConfig((prev) => ({ ...prev, sections: newSections }));
  };

  if (preview) {
    const bgColor = config.primaryColor;
    return (
      <div className={`min-h-screen bg-white ${mobilePreview ? "max-w-sm mx-auto border-x border-gray-200" : ""}`}>
        {/* Builder preview bar */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2">
          <button onClick={() => setPreview(false)} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100">
            <EyeOff className="w-3.5 h-3.5" /> Exit Preview
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobilePreview(!mobilePreview)} className={`p-1.5 rounded-lg ${mobilePreview ? "bg-gray-200 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
              <Smartphone className="w-4 h-4" />
            </button>
            <button onClick={() => setMobilePreview(false)} className={`p-1.5 rounded-lg ${!mobilePreview ? "bg-gray-200 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview content */}
        <div className={`px-6 py-16 text-center`}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{config.heroHeadline}</h1>
          <p className="text-gray-500 mb-6">{config.heroSubheadline}</p>
          <button className="text-sm font-semibold text-white px-6 py-3 rounded-xl" style={{ backgroundColor: bgColor }}>
            {config.ctaText}
          </button>
        </div>
        <div className="text-center py-8 text-xs text-gray-400">[{config.sections.filter((s) => s.visible).length - 1} more sections]</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Preview pane */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-gray-200 max-w-4xl mx-auto min-h-[70vh] p-8">
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{config.heroHeadline}</h1>
            <p className="text-gray-500 mb-6">{config.heroSubheadline}</p>
            <button className="text-sm font-semibold text-white px-6 py-3 rounded-xl" style={{ backgroundColor: config.primaryColor }}>
              {config.ctaText}
            </button>
          </div>
          <div className="text-center py-8 text-xs text-gray-300">
            <Layout className="w-8 h-8 mx-auto mb-2" />
            Preview will show all visible sections
          </div>
        </div>
      </div>

      {/* Builder panel */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Page Builder</h3>
          <button className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
            <Save className="w-3.5 h-3.5" /> Publish
          </button>
        </div>

        {/* Panel tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { id: "content" as const, label: "Content" },
            { id: "design" as const, label: "Design" },
            { id: "sections" as const, label: "Sections" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className={`flex-1 text-xs font-medium py-2.5 text-center transition-colors ${
                activePanel === tab.id ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {/* Content Panel */}
          {activePanel === "content" && (
            <>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Logo Text</label>
                <input type="text" value={config.logo} onChange={(e) => updateConfig({ logo: e.target.value })} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Hero Headline</label>
                <textarea value={config.heroHeadline} onChange={(e) => updateConfig({ heroHeadline: e.target.value })} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Hero Subheadline</label>
                <textarea value={config.heroSubheadline} onChange={(e) => updateConfig({ heroSubheadline: e.target.value })} rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">CTA Button Text</label>
                <input type="text" value={config.ctaText} onChange={(e) => updateConfig({ ctaText: e.target.value })} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10" />
              </div>
            </>
          )}

          {/* Design Panel */}
          {activePanel === "design" && (
            <>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.primaryColor} onChange={(e) => updateConfig({ primaryColor: e.target.value })} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  <input type="text" value={config.primaryColor} onChange={(e) => updateConfig({ primaryColor: e.target.value })} className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10 font-mono" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Font</label>
                <select value={config.font} onChange={(e) => updateConfig({ font: e.target.value })} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10">
                  <option value="Inter">Inter</option>
                  <option value="System UI">System UI</option>
                  <option value="Georgia">Georgia</option>
                  <option value="SF Pro">SF Pro</option>
                </select>
              </div>
            </>
          )}

          {/* Sections Panel */}
          {activePanel === "sections" && (
            <div className="space-y-1">
              {config.sections.map((section, i) => (
                <div key={section.id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 group">
                  <button onClick={() => moveSection(i, "up")} className="p-0.5 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronDown className="w-3.5 h-3.5 rotate-180" /></button>
                  <button onClick={() => moveSection(i, "down")} className="p-0.5 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronDown className="w-3.5 h-3.5" /></button>
                  <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                  <span className="flex-1 text-xs font-medium text-gray-700">{section.title}</span>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                      section.visible ? "text-emerald-700 bg-emerald-50" : "text-gray-400 bg-gray-100"
                    }`}
                  >
                    {section.visible ? "ON" : "OFF"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview toggle */}
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={() => setPreview(true)}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gray-900 px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
          >
            <Eye className="w-4 h-4" />
            Preview Page
          </button>
        </div>
      </div>
    </div>
  );
}
