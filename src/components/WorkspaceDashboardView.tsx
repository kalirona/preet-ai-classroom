import React, { useState } from "react";
import { User, Community } from "../types";
import { 
  Trophy, BookOpen, Calendar, HelpCircle, ArrowRight, MessageSquare, 
  Sparkles, Flame, CheckCircle, Plus, Send, Zap, Award
} from "lucide-react";

interface WorkspaceDashboardViewProps {
  currentUser: User | null;
  activeCommunity: Community | null;
  communities: Community[];
  onChangeTab: (tab: string) => void;
  onAddXp?: (amount: number) => void;
}

export default function WorkspaceDashboardView({
  currentUser,
  activeCommunity,
  communities,
  onChangeTab,
  onAddXp = () => {}
}: WorkspaceDashboardViewProps) {
  const [quickPostText, setQuickPostText] = useState("");
  const [xpTasks, setXpTasks] = useState([
    { id: "task-1", label: "Read active syllabus and guidelines", xp: 15, done: false },
    { id: "task-2", label: "Publish a clean introduction post in the Feed", xp: 40, done: false },
    { id: "task-3", label: "Help another student by commenting on a question", xp: 25, done: false },
    { id: "task-4", label: "Unlock Course Stage 1 under the Classroom tab", xp: 50, done: false },
  ]);

  const handleClaimXp = (taskId: string, amount: number) => {
    setXpTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: true } : t));
    onAddXp(amount);
  };

  const handleQuickPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPostText.trim()) return;
    alert("Simulated post submitted successfully! Redirecting you to the Home Feed to see it in action.");
    setQuickPostText("");
    onChangeTab("feed");
  };

  const level = currentUser?.level || 1;
  const xp = currentUser?.xp || 0;
  const nextBoundary = (level + 1) * 200;
  const currentMin = level * 200;
  const progressPercent = Math.min(100, Math.max(0, ((xp - currentMin) / (nextBoundary - currentMin)) * 100));

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-y-auto h-full bg-[#F8F9FB]" id="ws-dashboard-view">
      
      {/* 1. PERSONALIZED HERO BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold tracking-wider font-mono uppercase">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            Workspace Portal
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight leading-snug">
            Welcome back to {activeCommunity?.name || "the collective"}, {currentUser?.fullName || "Developer"}!
          </h1>
          <p className="text-xs text-indigo-200 leading-relaxed max-w-xl">
            You are currently plugged in as a <span className="font-bold text-white font-mono uppercase">{currentUser?.platformRole || "Member"}</span>. Unlock video certificates, complete daily quests, check the calendar events, and build your MRR business.
          </p>
        </div>
      </div>

      {/* 2. DYNAMIC WORKSPACE CHALLENGES & OVERVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* QUESTS PANEL */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Daily Gamification Quests</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Complete interactive workspace events to level up your status.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-xl">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>3 Day Streak!</span>
            </div>
          </div>

          {/* XP Progress indicator */}
          <div className="bg-[#F8F9FB] rounded-2xl p-4 border border-slate-200">
            <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
              <span className="font-bold text-gray-800">LVL {level} PROGRESS</span>
              <span className="font-mono text-indigo-700 font-bold">{xp} / {nextBoundary} XP</span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <span className="text-[9px] text-gray-400 block mt-1.5 font-mono">Next level unlock rewards: 🎓 Exclusive Community Certificate Shard in the Classroom.</span>
          </div>

          {/* XP Task blocks */}
          <div className="space-y-2.5">
            {xpTasks.map(task => (
              <div 
                key={task.id} 
                className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs ${
                  task.done 
                    ? "bg-slate-50/50 border-gray-200 text-gray-400" 
                    : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`p-1 rounded-lg ${task.done ? "bg-emerald-100 text-emerald-700" : "bg-indigo-50 text-indigo-700"}`}>
                    <Zap className="w-3.5 h-3.5" />
                  </span>
                  <span className={task.done ? "line-through text-gray-400 font-medium" : "font-semibold"}>
                    {task.label}
                  </span>
                </div>
                <div>
                  {task.done ? (
                    <span className="font-bold text-emerald-600 font-mono flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      +{task.xp} XP Claimed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimXp(task.id, task.xp)}
                      className="px-2.5 py-1 text-[10px] uppercase font-mono font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm cursor-pointer"
                    >
                      Complete (+{task.xp} XP)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDE BAR WIDGETS COLUMN */}
        <div className="space-y-6">
          
          {/* Calendar countdown card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Upcoming Live Stream</h3>
            <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                  Live Event
                </span>
                <span className="text-[10px] text-gray-500 font-mono">Starting in 4 hours</span>
              </div>
              <div>
                <span className="text-xs font-black text-gray-900 block leading-tight">Prompting Agent Shards for SaaS Growth</span>
                <p className="text-[10.5px] text-gray-500 mt-1 leading-snug">Private whiteboard zoom audit with custom template configurations.</p>
              </div>
              <button
                onClick={() => onChangeTab("calendar")}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              >
                Go to Calendar <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Mini Classroom progress check */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">My Classroom Index</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-800 block">SaaS Core Architecture</span>
                  <span className="text-[10px] text-gray-400 font-mono">8 of 12 Lessons finished</span>
                </div>
                <span className="font-mono text-indigo-700 font-bold">66%</span>
              </div>
              
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "66%" }} />
              </div>

              <button
                onClick={() => onChangeTab("courses")}
                className="w-full text-center text-[10px] uppercase font-mono font-black text-indigo-600 hover:text-indigo-850 hover:underline pt-1.5 cursor-pointer block"
              >
                Resume Learning Classroom →
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 3. QUICK POST WRITER & MINI LEADERBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick feed post dispatcher */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Simulate a Quick Feed Post</h3>
          <form onSubmit={handleQuickPostSubmit} className="space-y-3">
            <textarea
              rows={3}
              value={quickPostText}
              onChange={(e) => setQuickPostText(e.target.value)}
              placeholder="What software template or creator business project are you developing today?"
              className="w-full border border-gray-200 bg-[#F9FAFB] rounded-2xl p-3 text-xs focus:ring-1 focus:ring-indigo-650 focus:outline-none placeholder:text-gray-400 text-gray-800 font-sans"
              required
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 leading-relaxed">
                Posts on the feed automatically grant you up to <strong className="text-indigo-600">+40 XP</strong>!
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Send className="w-3 h-3" />
                Publish to Home Feed
              </button>
            </div>
          </form>
        </div>

        {/* Mini Leaderboards widget */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Workspace Leaderboard</h3>
            <span className="text-[10px] text-indigo-700 font-bold font-mono">Top Competitors</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-md">🥇</span>
                <span className="font-bold text-gray-900">Solidity Master</span>
              </div>
              <span className="font-mono text-gray-550">1,840 XP</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-md">🥈</span>
                <span className="font-bold text-gray-900">React Architect</span>
              </div>
              <span className="font-mono text-gray-550">1,410 XP</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-md">🥉</span>
                <span className="font-bold text-gray-900">Figma UI Maven</span>
              </div>
              <span className="font-mono text-gray-550">920 XP</span>
            </div>
          </div>

          <button
            onClick={() => onChangeTab("leaderboard")}
            className="w-full py-1.5 border border-indigo-100 hover:bg-indigo-50/50 text-indigo-700 text-xs font-bold rounded-xl transition cursor-pointer text-center block shadow-sm mt-3"
          >
            See Full Leaderboard
          </button>
        </div>

      </div>

    </div>
  );
}
