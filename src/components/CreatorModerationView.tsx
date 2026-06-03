import React, { useState } from "react";
import { ShieldCheck, Flag, ShieldAlert, Plus, CheckCircle, Trash2, Shield, Settings, Slash } from "lucide-react";

export default function CreatorModerationView() {
  const [toast, setToast] = useState<string | null>(null);

  // Toxic custom word blacklist state
  const [blacklistWords, setBlacklistWords] = useState(["scam", "crypto-bot", "spam-promos", "buy-followers"]);
  const [newWord, setNewWord] = useState("");

  // Flagged posts/replies queuing
  const [flaggedQueue, setFlaggedQueue] = useState([
    { id: "flag-1", type: "POST", author: "Spammy McSpam", content: "Hey guys! Buy cheap followers, crypto coins, and fast cash at follow.com!", reason: "Spam / Unsolicited Marketing Link", date: "2026-05-28" },
    { id: "flag-2", type: "REPLY", author: "Troll King", content: "That is the stupidest code I have ever seen. Go back to kindergarten you dummy.", reason: "Harassment / Toxicity Filter Triggered", date: "2026-05-27" },
  ]);

  // Banned members database log
  const [bannedMembers, setBannedMembers] = useState([
    { id: "ban-1", name: "Malicious Actor", email: "phish@gmail.com", date: "2026-05-20", reason: "Attempted phishing on student group chat channels" },
    { id: "ban-2", name: "Bot Account 45", email: "bot45@spambinder.ru", date: "2026-05-15", reason: "Automated API spam script detected" },
  ]);

  const handleAddBlacklistWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    const cleaned = newWord.trim().toLowerCase();
    if (blacklistWords.includes(cleaned)) {
      setNewWord("");
      return;
    }
    setBlacklistWords([...blacklistWords, cleaned]);
    setNewWord("");
    setToast(`🛡️ Custom word "${cleaned}" added to active automatic regex blacklist filters!`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemoveBlacklistWord = (word: string) => {
    setBlacklistWords(prev => prev.filter(w => w !== word));
  };

  const handleResolveFlag = (id: string, action: "DISMISS" | "DELETE") => {
    const item = flaggedQueue.find(f => f.id === id);
    setFlaggedQueue(prev => prev.filter(f => f.id !== id));
    if (action === "DELETE") {
      setToast(`🗑️ Flagged content by "${item?.author}" deleted permanently from databases.`);
    } else {
      setToast(`✅ Content from "${item?.author}" approved & flags dismissed.`);
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleBanUserFromFlag = (id: string) => {
    const item = flaggedQueue.find(f => f.id === id);
    if (!item) return;
    setFlaggedQueue(prev => prev.filter(f => f.id !== id));
    
    const newBan = {
      id: `ban-${Math.random().toString(36).substring(2, 6)}`,
      name: item.author,
      email: `${item.author.toLowerCase().replace(/\s+/g, "")}@restricted.io`,
      date: new Date().toISOString().split("T")[0],
      reason: `${item.reason} - Triggered via manual moderator action`
    };

    setBannedMembers([newBan, ...bannedMembers]);
    setToast(`🚫 Student "${item.author}" has been banned, session tokens invalidated, & IP blocks assigned.`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleUnbanUser = (id: string, name: string) => {
    setBannedMembers(prev => prev.filter(b => b.id !== id));
    setToast(`🔓 Ban rescinded for "${name}". Student can login and join forums.`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full bg-[#F8F9FB]" id="ws-moderation-view">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-xl font-extrabold font-display text-gray-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-650" />
          Workspace Moderation Suite
        </h1>
        <p className="text-xs text-gray-450 mt-0.5">Moderate flagged comments, write word blacklist filters, and handle community blocks safely.</p>
      </div>

      {toast && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in zoom-in-95 duration-150">
          <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* MODERATION GRID BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FLAGGED CONTENT QUEUE (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1">
              <Flag className="w-4 h-4 text-amber-500" />
              Content Moderation Queue ({flaggedQueue.length})
            </h3>
            <p className="text-[10.5px] text-gray-400 mt-0.5">Posts or student comments flagged by members or identified by custom word blacklist rules.</p>
          </div>

          <div className="space-y-3.5">
            {flaggedQueue.length === 0 ? (
              <div className="bg-slate-50/50 rounded-2xl p-10 border border-dashed border-gray-200 text-center text-xs text-gray-400 font-medium">
                🎉 Excellent work! No flagged content in queue. Workspace is safe.
              </div>
            ) : (
              flaggedQueue.map((item) => (
                <div key={item.id} className="bg-slate-55 border border-gray-200 rounded-2xl p-4 space-y-3 relative overflow-hidden bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block text-[8.5px] font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">
                        {item.type} Flagged
                      </span>
                      <strong className="text-xs font-bold text-slate-800 block mt-1">Author: {item.author}</strong>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{item.date}</span>
                  </div>

                  <p className="text-xs bg-white border border-gray-150 rounded-xl p-3 text-slate-700 italic">
                    "{item.content}"
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-2 pt-1 border-t border-gray-100 mt-2">
                    <span className="text-[10px] text-rose-600 font-bold font-mono">⚠️ Reason: {item.reason}</span>
                    
                    <div className="flex items-center gap-1.5 self-end">
                      <button 
                        onClick={() => handleResolveFlag(item.id, "DISMISS")}
                        className="px-2.5 py-1 text-[10px] uppercase font-mono font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        Dismiss Flag
                      </button>
                      <button 
                        onClick={() => handleResolveFlag(item.id, "DELETE")}
                        className="px-2.5 py-1 text-[10px] uppercase font-mono font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        Delete Content
                      </button>
                      <button 
                        onClick={() => handleBanUserFromFlag(item.id)}
                        className="px-2.5 py-1 text-[10px] uppercase font-mono font-black text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-sm"
                      >
                        Ban Student User
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AUTOMATIC WORD FILTERS BLACKLIST */}
        <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Word Filter List</h3>
            <p className="text-[10.5px] text-gray-400 mt-0.5">Posts containing these exact words will be automatically flagged and held in queue immediately.</p>
          </div>

          <form onSubmit={handleAddBlacklistWord} className="flex gap-1.5 pt-1">
            <input 
              type="text" 
              value={newWord} 
              onChange={(e) => setNewWord(e.target.value)} 
              placeholder="Enter blacklisted term..." 
              className="w-full border border-gray-200 rounded-xl p-2 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
            />
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Word tags container */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {blacklistWords.length === 0 ? (
              <span className="text-[11px] text-gray-400 italic">No blacklisted words set.</span>
            ) : (
              blacklistWords.map(word => (
                <span 
                  key={word} 
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold font-mono text-[9px] px-2 py-1 rounded-lg border border-gray-200 group transition hover:border-red-300 hover:bg-red-50"
                >
                  {word}
                  <button 
                    onClick={() => handleRemoveBlacklistWord(word)} 
                    className="text-gray-400 group-hover:text-red-600 font-sans font-bold leading-none pl-0.5"
                    title="Remove filter"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

      </div>

      {/* BANNED MEMBERS DIRECTORY FILE LOGS */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-150 bg-gray-50/50 flex justify-between items-center text-xs">
          <span className="font-extrabold uppercase tracking-wider text-slate-500 font-mono">Banned Students Blacklist Table</span>
          <span className="text-[10px] text-gray-400 font-mono">Protected DB registry audit</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-400 uppercase font-mono border-b border-gray-150 text-[10px] tracking-wider font-extrabold">
                <th className="py-2.5 px-4">Banned Account</th>
                <th className="py-2.5 px-4">Banned On</th>
                <th className="py-2.5 px-4">Reason for Eviction</th>
                <th className="py-2.5 px-4 text-right">Settings Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {bannedMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 font-sans font-medium">
                    No users have been banned in this workspace index.
                  </td>
                </tr>
              ) : (
                bannedMembers.map((actor) => (
                  <tr key={actor.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <strong className="font-bold text-slate-850 block">{actor.name}</strong>
                        <span className="text-gray-400 text-[10px] font-mono leading-none">{actor.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[10px] font-mono text-gray-400">
                      {actor.date}
                    </td>
                    <td className="py-3 px-4 text-rose-750 font-bold font-sans">
                      {actor.reason}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleUnbanUser(actor.id, actor.name)}
                        className="text-indigo-650 hover:text-indigo-850 font-mono font-bold cursor-pointer"
                      >
                        Pardon & Unban
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
