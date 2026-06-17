import { useState } from "react";
import { User } from "../types";
import { Sparkles, Save, Check, Camera } from "lucide-react";

interface ProfileViewProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
}

export default function ProfileView({ user, onUpdateUser }: ProfileViewProps) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatarUrl || "");
  const [username, setUsername] = useState(user?.username || "");
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
        body: JSON.stringify({ fullName, username, bio, avatarUrl: avatar }),
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
    <div className="h-full bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600" />
          <div className="px-6 pb-6 -mt-10 text-center">
            <div className="relative inline-block">
              <img
                src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff&size=160`}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white cursor-pointer">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-3">{fullName}</h2>
            <p className="text-xs text-slate-400 font-mono">@{username}</p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-200/80">
              <Sparkles className="w-3 h-3" />
              Level {user?.level || 1} · {user?.xp || 0} XP
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mb-1">Profile Settings</h3>
            <p className="text-[11px] text-slate-400">Update your display information.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Avatar URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 leading-relaxed transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="ml-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
