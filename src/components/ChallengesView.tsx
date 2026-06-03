import React, { useState, useEffect } from "react";
import { User, Community, Challenge, ChallengeTask } from "../types";
import { Trophy, Target, Flame, Calendar, Users, CheckCircle, ChevronRight, ArrowLeft, Plus, X, Loader2, Sparkles } from "lucide-react";

interface ChallengesViewProps {
  currentUser: User | null;
  activeCommunity: Community | null;
}

export default function ChallengesView({ currentUser, activeCommunity }: ChallengesViewProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [tasks, setTasks] = useState<ChallengeTask[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", durationDays: 7, xpReward: 100, icon: "🏅", color: "indigo" });
  const [taskInputs, setTaskInputs] = useState<string[]>([""]);

  useEffect(() => {
    if (!activeCommunity) return;
    loadChallenges();
  }, [activeCommunity]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/challenges?workspaceId=${activeCommunity?.id}`);
      const data = await res.json();
      setChallenges(data.challenges || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openChallenge = async (ch: Challenge) => {
    setSelectedChallenge(ch);
    try {
      const res = await fetch(`/api/challenges/${ch.id}`);
      const data = await res.json();
      if (data.challenge) {
        setSelectedChallenge(data.challenge as any);
        setTasks(data.tasks || []);
        setParticipants(data.participants || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async (challengeId: string) => {
    setJoining(challengeId);
    try {
      await fetch(`/api/challenges/${challengeId}/join`, { method: "POST" });
      loadChallenges();
      if (selectedChallenge?.id === challengeId) {
        const res = await fetch(`/api/challenges/${challengeId}`);
        const data = await res.json();
        setParticipants(data.participants || []);
      }
    } catch (e) { console.error(e); }
    finally { setJoining(null); }
  };

  const handleCompleteTask = async (challengeId: string, taskId: string) => {
    setCompleting(taskId);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/tasks/${taskId}/complete`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        loadChallenges();
        if (selectedChallenge?.id === challengeId) openChallenge(selectedChallenge);
      }
    } catch (e) { console.error(e); }
    finally { setCompleting(null); }
  };

  const handleCreateChallenge = async () => {
    if (!form.title.trim()) return;
    try {
      const tasks = taskInputs.filter(t => t.trim()).map((t, i) => ({
        title: t, day: Math.floor(i / 3) + 1, xpPerCompletion: 10,
      }));
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, workspaceId: activeCommunity?.id, tasks }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm({ title: "", description: "", durationDays: 7, xpReward: 100, icon: "🏅", color: "indigo" });
        setTaskInputs([""]);
        loadChallenges();
      }
    } catch (e) { console.error(e); }
  };

  const daysRemaining = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (selectedChallenge) {
    const isParticipant = participants.some(p => p.user_id === currentUser?.id);
    const myParticipation = participants.find(p => p.user_id === currentUser?.id);
    const completedCount = myParticipation ? (myParticipation.completed_tasks || []).length : 0;
    const totalTasks = tasks.length;

    return (
      <div className="h-full flex flex-col bg-[#F8F9FB] overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4">
          <button onClick={() => setSelectedChallenge(null)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Challenges
          </button>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedChallenge.icon}</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedChallenge.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">{selectedChallenge.description}</p>
                </div>
              </div>
              {!isParticipant ? (
                <button
                  onClick={() => handleJoin(selectedChallenge.id)}
                  disabled={joining === selectedChallenge.id}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {joining === selectedChallenge.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Join Challenge"}
                </button>
              ) : (
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Joined
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {daysRemaining(selectedChallenge.endsAt)} days left</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {selectedChallenge.participantCount || participants.length} participants</span>
              <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {selectedChallenge.xpReward} XP reward</span>
            </div>

            {/* Progress */}
            {isParticipant && totalTasks > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{completedCount} / {totalTasks} tasks</span>
                  <span>{Math.round((completedCount / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${(completedCount / totalTasks) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono px-1">Tasks</h3>
            {tasks.map(task => {
              const isDone = myParticipation?.completed_tasks?.includes(task.id);
              return (
                <div key={task.id} className={`bg-white rounded-xl border p-4 shadow-sm transition ${isDone ? "border-emerald-200 bg-emerald-50/30" : "border-[#E5E7EB]"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 ${isDone ? "bg-emerald-100" : "bg-gray-100"}`}>
                        {isDone ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Target className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isDone ? "text-gray-400 line-through" : "text-gray-900"}`}>{task.title}</h4>
                        {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                        <span className="text-[10px] text-gray-400 font-mono mt-1 block">Day {task.day} · {task.xpPerCompletion} XP</span>
                      </div>
                    </div>
                    {isParticipant && !isDone && (
                      <button
                        onClick={() => handleCompleteTask(selectedChallenge.id, task.id)}
                        disabled={completing === task.id}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                      >
                        {completing === task.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Complete"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leaderboard */}
          {participants.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono mb-3">Leaderboard</h3>
              <div className="space-y-2">
                {participants.slice(0, 10).map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-3 p-2 rounded-xl ${p.user_id === currentUser?.id ? "bg-indigo-50" : ""}`}>
                    <span className="w-5 text-center text-xs font-bold text-gray-400">{i + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full rounded-full object-cover" /> : p.full_name?.[0]}
                    </div>
                    <span className="flex-1 text-xs font-semibold text-gray-900">{p.full_name}</span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-gray-400">{p.tasks_completed || 0} tasks</span>
                      {p.is_completed && <span className="text-emerald-600 font-bold">✓ Done</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-orange-200 mb-1">Community Challenges</div>
              <h2 className="text-xl font-bold">Complete challenges, earn XP, unlock badges</h2>
            </div>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Challenge
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-900 mb-1">No active challenges</p>
            <p className="text-xs text-gray-500">Create your first challenge to engage the community</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map(ch => (
              <button
                key={ch.id}
                onClick={() => openChallenge(ch)}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition text-left cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{ch.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900">{ch.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ch.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ch.durationDays}d · {daysRemaining(ch.endsAt)}d left</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ch.participantCount || 0}</span>
                      <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {ch.xpReward} XP</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">Create Challenge</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input type="text" placeholder="Icon (emoji)" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-16 border border-gray-200 rounded-xl px-2 py-2 text-xs text-center" />
                  <input type="text" placeholder="Challenge title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Duration (days)</label>
                    <input type="number" min={1} max={90} value={form.durationDays} onChange={e => setForm({ ...form, durationDays: parseInt(e.target.value) || 7 })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">XP Reward</label>
                    <input type="number" min={0} max={10000} value={form.xpReward} onChange={e => setForm({ ...form, xpReward: parseInt(e.target.value) || 100 })} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Daily Tasks</label>
                  {taskInputs.map((t, i) => (
                    <div key={i} className="flex gap-1 mb-1">
                      <input
                        type="text" placeholder={`Task ${i + 1}`} value={t}
                        onChange={e => { const next = [...taskInputs]; next[i] = e.target.value; setTaskInputs(next); }}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {taskInputs.length > 1 && (
                        <button onClick={() => setTaskInputs(taskInputs.filter((_, j) => j !== i))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setTaskInputs([...taskInputs, ""])} className="text-[10px] text-indigo-600 font-bold hover:text-indigo-700 mt-1">+ Add task</button>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer">Cancel</button>
                <button onClick={handleCreateChallenge} disabled={!form.title.trim()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer">Create Challenge</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
