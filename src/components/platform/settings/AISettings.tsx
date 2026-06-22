import React, { useState } from "react";
import { CheckCircle, Key, Eye, EyeOff, Power, Cpu, Coins, BookOpen, FileEdit, HelpCircle, MessageSquare, Sparkles } from "lucide-react";

const STORAGE_KEY = "platform_ai_settings";

type Provider = "openai" | "gemini" | "claude";

const PROVIDERS: { key: Provider; label: string; color: string }[] = [
  { key: "openai", label: "OpenAI", color: "bg-emerald-500" },
  { key: "gemini", label: "Gemini", color: "bg-blue-500" },
  { key: "claude", label: "Claude", color: "bg-purple-500" },
];

const INITIAL_KEYS: Record<Provider, string> = { openai: "", gemini: "", claude: "" };
const INITIAL_ENABLED: Record<Provider, boolean> = { openai: false, gemini: false, claude: false };

const FEATURES = [
  { key: "courseGenerator", label: "AI Course Generator", icon: BookOpen, desc: "Generate full course structures from a topic." },
  { key: "lessonWriter", label: "AI Lesson Writer", icon: FileEdit, desc: "Write lesson content, quizzes, and assignments." },
  { key: "quizGenerator", label: "AI Quiz Generator", icon: HelpCircle, desc: "Auto-generate quizzes from lesson material." },
  { key: "communityAssistant", label: "AI Community Assistant", icon: MessageSquare, desc: "Answer member questions and moderate discussions." },
];

export default function AISettings() {
  const loadSaved = () => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  };
  const initial = loadSaved();
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>(initial.apiKeys || INITIAL_KEYS);
  const [enabled, setEnabled] = useState<Record<Provider, boolean>>(initial.enabled || INITIAL_ENABLED);
  const [visible, setVisible] = useState<Record<Provider, boolean>>({ openai: false, gemini: false, claude: false });
  const [features, setFeatures] = useState<Record<string, boolean>>(initial.features || {});
  const [monthlyBudget, setMonthlyBudget] = useState(initial.monthlyBudget || "50");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKeys, enabled, features, monthlyBudget }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Providers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-lg font-semibold text-slate-900">AI Providers</h3>
          {saved && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Saved</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROVIDERS.map(({ key, label, color }) => (
            <div key={key} className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-sm font-bold text-slate-800">{label}</span>
                </div>
                <button
                  onClick={() => setEnabled((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${enabled[key] ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${enabled[key] ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              <div className="relative">
                <input
                  type={visible[key] ? "text" : "password"}
                  value={apiKeys[key]}
                  onChange={(e) => setApiKeys((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={key === "openai" ? "sk-..." : key === "gemini" ? "AIza..." : "sk-ant-..."}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                />
                <button
                  onClick={() => setVisible((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {visible[key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className={`flex items-center gap-1 text-[10px] font-bold ${enabled[key] ? "text-emerald-600" : "text-slate-400"}`}>
                <Power className="w-3 h-3" />
                {enabled[key] ? "Active" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">AI Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FEATURES.map(({ key, label, icon: Icon, desc }) => (
            <div key={key} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-2.5">
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${features[key] ? "text-indigo-500" : "text-slate-300"}`} />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">{label}</span>
                  <span className="text-[10px] text-slate-400">{desc}</span>
                </div>
              </div>
              <button
                onClick={() => setFeatures((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ml-3 ${features[key] ? "bg-indigo-500" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${features[key] ? "translate-x-5 left-0.5" : "translate-x-0 left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-500" />
          Cost Controls
        </h3>
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Monthly AI Budget</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-500">$</span>
              <input
                type="number"
                min={0}
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
              />
              <span className="text-xs text-slate-400">/ month</span>
            </div>
          </div>
          <div className="flex-1" />
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Current usage</p>
            <p className="text-sm font-bold text-slate-700">$0.00</p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-4 h-4" /> AI settings saved.
        </div>
      )}
      <button
        onClick={handleSave}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
      >
        <Cpu className="w-3.5 h-3.5" />
        Save AI Settings
      </button>
    </div>
  );
}
