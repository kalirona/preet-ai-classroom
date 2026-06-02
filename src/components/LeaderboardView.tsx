import React, { useState, useEffect } from "react";
import { User } from "../types";
import { Trophy, Star, Shield, Flame, Medal, Award, CheckCircle2, ChevronRight } from "lucide-react";

interface LeaderboardViewProps {
  currentUser: User | null;
}

export default function LeaderboardView({ currentUser }: LeaderboardViewProps) {
  const [board, setBoard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Available badges to showcase unlocking progress
  const badgesCatalog = [
    { title: "First Lesson", desc: "Unlock by finishing any classroom course slide.", icon: CheckCircle2, color: "emerald" },
    { title: "XP Guru", desc: "Unlock inside the network by reaching level 10.", icon: Award, color: "orange" },
    { title: "Community Builder", desc: "Submit 5 high-signal posts inside channels.", icon: Star, color: "indigo" },
    { title: "Daily Habit", desc: "Maintain a consecutive 5 days streak.", icon: Flame, color: "rose" }
  ];

  useEffect(() => {
    async function loadBoard() {
      try {
        const res = await fetch("/api/gamification/leaderboard");
        const data = await res.json();
        if (data.leaderboard) {
          setBoard(data.leaderboard);
        }
      } catch (e) {
        console.error("Leaderboard loading error", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadBoard();
  }, [currentUser]);

  return (
    <div className="p-6 h-full overflow-y-auto" id="leaderboard-workspace">
      
      {/* Bento Grid Header */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        
        {/* Banner Hero */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Trophy className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 font-display">Gamification Leaders Guild</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Participate inside discussions and complete curriculum lessons to stack real XP and unlock premium private sub-tiers.
            </p>
          </div>
        </div>

        {/* Personalized Stats Block */}
        <div className="col-span-12 lg:col-span-4 bg-gradient-to-r from-slate-900 to-slate-850 text-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#94A3B8]">Your standings</span>
            <div className="text-xl font-bold font-display mt-0.5">Level {currentUser?.level || 4}</div>
            <p className="text-[10px] text-gray-400 mt-1">
              Streak: {currentUser?.streak || 5} days consecutive
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl">
            🔥
          </div>
        </div>

      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* LEADERBOARD LIST - Left 8 Units */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 tracking-wider font-mono uppercase mb-4">Network Rankings</h3>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Processing realtime roll...
            </div>
          ) : (
            <div className="space-y-3">
              {board.map((student, idx) => {
                const isCurrentUser = student.id === currentUser?.id;
                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      isCurrentUser 
                        ? "bg-indigo-50/50 border-indigo-200" 
                        : "border-gray-50 hover:border-gray-200"
                    }`}
                    id={`leaderboard-row-${student.id}`}
                  >
                    <div className="flex items-center gap-3">
                      
                      {/* Rank numeric / trophy element */}
                      <span className="w-6 text-xs font-bold text-gray-400 text-center">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                      </span>

                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-gray-100">
                        <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                      </div>

                      <div>
                        <div className="text-xs font-bold text-gray-800 leading-tight">
                          {student.fullName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Streak: {student.streak} days • lvl {student.level}
                        </div>
                      </div>

                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-indigo-600 font-bold font-mono">
                        {student.xp} XP
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* REWARDS & ACHIEVEMENTS - Right 5 Units */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 tracking-wider font-mono uppercase mb-4">Core Badges Wallet</h3>
            <div className="space-y-4">
              {badgesCatalog.map((badge) => {
                const isUnlocked = currentUser?.badges?.includes(badge.title);
                const Icon = badge.icon;
                return (
                  <div key={badge.title} className={`flex items-start gap-3 p-3 rounded-xl transition ${
                    isUnlocked ? "bg-amber-50/30 border border-amber-100" : "bg-gray-50/50 border border-gray-100 opacity-60"
                  }`}>
                    <div className={`p-2 rounded-xl shrink-0 ${
                      isUnlocked ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-400"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-800 leading-none">{badge.title}</span>
                        {isUnlocked && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[8px] font-bold rounded uppercase">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                        {badge.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gamification breakdown widget */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5 shadow-sm">
            <h4 className="text-xs font-bold text-indigo-900 mb-1.5">Leaderboard Rules</h4>
            <p className="text-[11px] text-indigo-800 leading-relaxed font-sans">
              Ranks are real-time and computed according to dynamic XP logs inside our sandboxed PostgreSQL container. Achieve level 15 to secure absolute Super Mastermind credentials.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
