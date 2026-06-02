import React, { useState } from "react";
import { User } from "../types";
import { UserCheck, Sparkles, Mail, Laptop, Globe, Heart } from "lucide-react";

interface ProfileViewProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
}

export default function ProfileView({ user, onUpdateUser }: ProfileViewProps) {
  const [fullName, setFullName] = useState(user?.fullName || "Lincoln Flores");
  const [bio, setBio] = useState(user?.bio || "Passionate SaaS builder.");
  const [avatar, setAvatar] = useState(user?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150");
  const [username, setUsername] = useState(user?.username || "LincolnCode");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/auth/profile", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            fullName,
            username,
            bio,
            avatarUrl: avatar
         })
      });
      const data = await res.json();
      if (data.success && data.user) {
         onUpdateUser(data.user);
         setSaveSuccess(true);
         setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-[#F8F9FB] overflow-y-auto" id="profile-customizer">
      <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          
          <img
            src={avatar}
            alt="User avatar preview"
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-indigo-100 shadow-sm mt-4"
          />
          
          <h2 className="text-base font-bold text-gray-900 font-display mt-3">{fullName}</h2>
          <p className="text-xs text-gray-400 font-mono">@{username}</p>
          
          <div className="flex justify-center items-center gap-1.5 mt-3 text-xs text-indigo-700 font-semibold select-none bg-indigo-50 px-3 py-1 rounded-full w-fit mx-auto border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Account Level {user?.level || 4} ({user?.xp || 680} XP)</span>
          </div>
        </div>

        {/* Configurations Form */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-gray-400 mb-1">Customize details</h3>
            <p className="text-[11px] text-gray-450">These credentials determine your presence inside the community leaderboards.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Username Handle</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Custom Avatar URL link</label>
              <input
                type="url"
                required
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-750 focus:ring-1 focus:ring-indigo-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Short biography bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-510 leading-relaxed font-sans text-gray-800"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {saveSuccess && (
               <span className="text-xs font-bold text-emerald-600 animate-pulse flex items-center gap-1">
                  ✓ Profile coordinates synced!
               </span>
            )}
            
            <button
              type="submit"
              disabled={isSaving}
              className="ml-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
