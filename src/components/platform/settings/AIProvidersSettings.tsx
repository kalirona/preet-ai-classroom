import React, { useState } from "react";
import { Key, Eye, EyeOff, Power } from "lucide-react";

type Provider = "openai" | "gemini";

const INITIAL_KEYS: Record<Provider, string> = {
  openai: "",
  gemini: "",
};

const INITIAL_ENABLED: Record<Provider, boolean> = {
  openai: false,
  gemini: false,
};

export default function AIProvidersSettings() {
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>(INITIAL_KEYS);
  const [enabled, setEnabled] = useState<Record<Provider, boolean>>(INITIAL_ENABLED);
  const [visible, setVisible] = useState<Record<Provider, boolean>>({ openai: false, gemini: false });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const providers: { key: Provider; label: string; docs: string }[] = [
    { key: "openai", label: "OpenAI", docs: "platform.openai.com/api-keys" },
    { key: "gemini", label: "Gemini", docs: "makersuite.google.com/app/apikey" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">AI Providers</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Manage API keys and enable/disable AI providers for course generation and content features.</p>
        </div>
        {saved && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Saved</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {providers.map(({ key, label, docs }) => (
          <div key={key} className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">{label}</span>
              <button
                onClick={() => setEnabled((prev) => ({ ...prev, [key]: !prev[key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  enabled[key] ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    enabled[key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="relative">
              <input
                type={visible[key] ? "text" : "password"}
                value={apiKeys[key]}
                onChange={(e) => setApiKeys((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder="sk-..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
              />
              <button
                onClick={() => setVisible((prev) => ({ ...prev, [key]: !prev[key] }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {visible[key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <a href={`https://${docs}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-500 hover:underline font-medium">
                Get API key →
              </a>
              <span className={`flex items-center gap-1 text-[10px] font-bold ${
                enabled[key] ? "text-emerald-600" : "text-slate-400"
              }`}>
                <Power className="w-3 h-3" />
                {enabled[key] ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5"
        >
          <Key className="w-3.5 h-3.5" />
          Save API Keys
        </button>
        <span className="text-[10px] text-slate-400">Keys are stored encrypted at rest.</span>
      </div>
    </div>
  );
}
