import React, { useState } from "react";
import { Flag, Save } from "lucide-react";

interface FeatureFlag {
  key: string;
  label: string;
  desc: string;
  defaultEnabled: boolean;
}

const FLAGS: FeatureFlag[] = [
  { key: "courseGeneration", label: "AI Course Generation", desc: "Allow creators to generate courses using AI.", defaultEnabled: true },
  { key: "liveStreaming", label: "Live Streaming", desc: "Enable live streaming in classrooms and communities.", defaultEnabled: true },
  { key: "communityChallenges", label: "Community Challenges", desc: "Allow creators to run challenges with leaderboards.", defaultEnabled: true },
  { key: "analyticsExport", label: "Analytics Export (CSV)", desc: "Allow exporting analytics data to CSV files.", defaultEnabled: true },
  { key: "badgeSystem", label: "Badge System", desc: "Enable achievement badges for community members.", defaultEnabled: false },
  { key: "discordIntegration", label: "Discord Integration", desc: "Sync community events and notifications to Discord.", defaultEnabled: false },
  { key: "waitlistMode", label: "Waitlist Mode", desc: "New workspaces require manual approval before going live.", defaultEnabled: false },
  { key: "publicApi", label: "Public API Access", desc: "Allow third-party apps to connect via API keys.", defaultEnabled: false },
];

export default function FeatureFlagsSettings() {
  const [flags, setFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(FLAGS.map((f) => [f.key, f.defaultEnabled]))
  );
  const [saved, setSaved] = useState(false);

  function handleToggle(key: string) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Feature Flags</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Enable or disable platform-wide features. Changes take effect immediately.</p>
        </div>
        {saved && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Saved</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FLAGS.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition"
          >
            <div className="flex items-start gap-2.5">
              <Flag className={`w-4 h-4 mt-0.5 shrink-0 ${flags[key] ? "text-indigo-500" : "text-slate-300"}`} />
              <div>
                <span className="text-xs font-bold text-slate-700 block">{label}</span>
                <span className="text-[10px] text-slate-400 leading-tight">{desc}</span>
              </div>
            </div>
            <button
              onClick={() => handleToggle(key)}
              className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ml-3 ${
                flags[key] ? "bg-indigo-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                  flags[key] ? "translate-x-5 left-0.5" : "translate-x-0 left-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
      >
        <Save className="w-3.5 h-3.5" />
        Save Feature Flags
      </button>
    </div>
  );
}
