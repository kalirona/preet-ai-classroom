import React, { useState } from "react";
import { Shield, LogIn, Key, Clock, Timer, Lock, Smartphone, AlertTriangle } from "lucide-react";

export default function SecuritySettings() {
  const [googleLogin, setGoogleLogin] = useState(true);
  const [emailLogin, setEmailLogin] = useState(true);
  const [rateLimit, setRateLimit] = useState("5");
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [force2FA, setForce2FA] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Authentication */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <LogIn className="w-4 h-4 text-slate-500" />
          Authentication Methods
        </h3>
        <div className="space-y-3">
          {[
            { key: "googleLogin", label: "Google Login", desc: "Allow users to sign in with Google OAuth.", checked: googleLogin, set: setGoogleLogin },
            { key: "emailLogin", label: "Email Login", desc: "Allow users to sign in with email and password.", checked: emailLogin, set: setEmailLogin },
          ].map(({ key, label, desc, checked, set }) => (
            <div key={key} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-2.5">
                <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${checked ? "text-indigo-500" : "text-slate-300"}`} />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">{label}</span>
                  <span className="text-[10px] text-slate-400">{desc}</span>
                </div>
              </div>
              <button
                onClick={() => set(!checked)}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ml-3 ${checked ? "bg-indigo-500" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-5 left-0.5" : "translate-x-0 left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Protection */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500" />
          Protection
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono flex items-center gap-1">
              <Timer className="w-3 h-3" /> Login Rate Limit
            </label>
            <div className="flex items-center gap-2">
              <input type="number" min={1} max={60} value={rateLimit} onChange={(e) => setRateLimit(e.target.value)}
                className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
              <span className="text-xs text-slate-400">attempts / 5 min</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 block uppercase font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" /> Session Timeout
            </label>
            <div className="flex items-center gap-2">
              <input type="number" min={1} max={720} value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition" />
              <span className="text-xs text-slate-400">hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Security */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-slate-500" />
          Admin Security
        </h3>
        <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-start gap-2.5">
            <Key className={`w-4 h-4 mt-0.5 shrink-0 ${force2FA ? "text-amber-500" : "text-slate-300"}`} />
            <div>
              <span className="text-xs font-bold text-slate-700 block">Force 2FA for Super Admin</span>
              <span className="text-[10px] text-slate-400">Require two-factor authentication for all super admin accounts.</span>
            </div>
          </div>
          <button
            onClick={() => setForce2FA(!force2FA)}
            className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ml-3 ${force2FA ? "bg-amber-500" : "bg-slate-300"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${force2FA ? "translate-x-5 left-0.5" : "translate-x-0 left-0.5"}`} />
          </button>
        </div>
      </div>

      <button onClick={handleSave}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5" />
        Save Security Settings
      </button>
    </div>
  );
}
