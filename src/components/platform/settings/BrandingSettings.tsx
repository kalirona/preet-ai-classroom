import React, { useState } from "react";
import { Palette, Image } from "lucide-react";

const PRESET_COLORS = [
  { label: "Indigo", value: "#4f46e5" },
  { label: "Blue", value: "#2563eb" },
  { label: "Emerald", value: "#059669" },
  { label: "Amber", value: "#d97706" },
  { label: "Rose", value: "#e11d48" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Slate", value: "#475569" },
  { label: "Orange", value: "#ea580c" },
];

export default function BrandingSettings() {
  const [platformName, setPlatformName] = useState("Skool Platform");
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [logoUrl, setLogoUrl] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Branding</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Customize the platform name, logo, and color scheme.</p>
        </div>
        {saved && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Saved</span>
        )}
      </div>

      {/* Platform Name */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Platform Name</label>
        <input
          type="text"
          value={platformName}
          onChange={(e) => setPlatformName(e.target.value)}
          className="w-full max-w-md bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
        />
      </div>

      {/* Logo */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Logo URL</label>
        <div className="flex items-center gap-3">
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
          />
          {logoUrl && (
            <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
              <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
          {!logoUrl && (
            <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
              <Image className="w-4 h-4 text-slate-300" />
            </div>
          )}
        </div>
      </div>

      {/* Primary Color */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Primary Color</label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer bg-transparent p-0.5"
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">{primaryColor}</span>
        </div>
        <div className="flex gap-2 mt-2">
          {PRESET_COLORS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPrimaryColor(value)}
              title={label}
              className={`w-7 h-7 rounded-full border-2 transition ${
                primaryColor === value ? "border-slate-800 scale-110" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: value }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-900 rounded-xl p-5 space-y-3">
        <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">Brand Preview</span>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-8 h-8 rounded-lg object-contain bg-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: primaryColor }}>
              {platformName.charAt(0)}
            </div>
          )}
          <span className="text-white font-bold text-lg" style={{ color: primaryColor }}>
            {platformName}
          </span>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
      >
        <Palette className="w-3.5 h-3.5" />
        Save Branding
      </button>
    </div>
  );
}
