import React, { useState } from "react";
import { CheckCircle, Mail, Server, Send, FileText, Shield, ShoppingCart, Award, X } from "lucide-react";

const STORAGE_KEY = "platform_email_settings";
const TEMPLATES_KEY = "platform_email_templates";

const TEMPLATES = [
  { key: "welcome", label: "Welcome Email", icon: FileText, desc: "Sent to new users after registration.", defaultBody: "Welcome to {{platform_name}}! We're excited to have you on board." },
  { key: "purchase", label: "Purchase Confirmation", icon: ShoppingCart, desc: "Sent when a user purchases a course.", defaultBody: "Thank you for your purchase of {{course_name}}. Your enrollment is confirmed." },
  { key: "certificate", label: "Certificate Awarded", icon: Award, desc: "Sent when a user earns a certificate.", defaultBody: "Congratulations! You've earned a certificate for {{course_name}}." },
  { key: "passwordReset", label: "Password Reset", icon: Shield, desc: "Sent when a user requests a password reset.", defaultBody: "Click the link below to reset your password. This link expires in 1 hour." },
];

const defaultTemplates = () => Object.fromEntries(TEMPLATES.map((t) => [t.key, t.defaultBody]));

export default function EmailSettings() {
  const loadSaved = () => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  };
  const loadTemplates = () => {
    try { const s = localStorage.getItem(TEMPLATES_KEY); return s ? JSON.parse(s) : defaultTemplates(); }
    catch { return defaultTemplates(); }
  };
  const initial = loadSaved();
  const [host, setHost] = useState(initial.host || "");
  const [port, setPort] = useState(initial.port || "587");
  const [username, setUsername] = useState(initial.username || "");
  const [password, setPassword] = useState(initial.password || "");
  const [fromName, setFromName] = useState(initial.fromName || "Preet Digital Lab");
  const [fromEmail, setFromEmail] = useState(initial.fromEmail || "noreply@preetdigitallab.com");
  const [testSent, setTestSent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [templates, setTemplates] = useState<Record<string, string>>(loadTemplates);
  const [editing, setEditing] = useState<{ key: string; label: string; body: string } | null>(null);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ host, port, username, password, fromName, fromEmail }));
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleEditTemplate(key: string, label: string) {
    setEditing({ key, label, body: templates[key] || "" });
  }

  function handleSaveTemplate() {
    if (!editing) return;
    const next = { ...templates, [editing.key]: editing.body };
    setTemplates(next);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-4 h-4" /> Settings saved.
        </div>
      )}

      {/* SMTP Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-500" />
          SMTP Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">SMTP Host</label>
            <input type="text" value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.example.com"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Port</label>
            <input type="text" value={port} onChange={(e) => setPort(e.target.value)} placeholder="587"
              className="w-full max-w-[120px] bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="postmaster@example.com"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
          </div>
        </div>
      </div>

      {/* Sender Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Send className="w-4 h-4 text-slate-500" />
          Sender Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">From Name</label>
            <input type="text" value={fromName} onChange={(e) => setFromName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono">From Email</label>
            <input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          Email Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TEMPLATES.map(({ key, label, icon: Icon, desc }) => (
            <div key={key} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-2.5">
                <Icon className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">{label}</span>
                  <span className="text-[10px] text-slate-400">{desc}</span>
                </div>
              </div>
              <button onClick={() => handleEditTemplate(key, label)}
                className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-lg hover:bg-indigo-50 transition shrink-0 ml-3 cursor-pointer">
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          Save All Settings
        </button>
        <button onClick={() => { setTestSent(true); setTimeout(() => setTestSent(false), 3000); }}
          className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer">
          <Send className="w-3.5 h-3.5" />
          {testSent ? "Test Sent!" : "Send Test Email"}
        </button>
      </div>

      {/* Template Editor Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Edit: {editing.label}</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              rows={8}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-none"
            />
            <p className="text-[10px] text-slate-400">Use placeholders like {'{{platform_name}}'}, {'{{course_name}}'}, {'{{user_name}}'}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer">Cancel</button>
              <button onClick={handleSaveTemplate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer">Save Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
