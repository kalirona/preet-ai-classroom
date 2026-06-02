import React, { useState, useEffect, useCallback } from "react";
import { User, Community, Space, Post } from "../types";
import { MessageSquare, Heart, Send, Pin, Search, Plus, Hash, Lock, Users, Sparkles, ChevronDown, X } from "lucide-react";

interface CommunityFeedProps {
  currentUser: User | null;
  activeCommunity: Community | null;
  posts: Post[];
  onLikePost: (id: string) => void;
  onAddPost: (title: string, content: string, category: string, tags: string[]) => Promise<any>;
  onPinPost?: (id: string) => void;
}

const SPACE_ICONS: Record<string, string> = {
  "general": "💬", "introductions": "👋", "support": "🆘",
  "wins": "🎉", "courses": "📚", "premium": "⭐", "challenges": "🏅",
  "events": "📅", "random": "🎲", "feedback": "💡",
};

const SPACE_COLORS: Record<string, string> = {
  "general": "gray", "introductions": "emerald", "support": "amber",
  "wins": "yellow", "courses": "blue", "premium": "purple",
  "challenges": "orange", "events": "pink", "random": "teal", "feedback": "indigo",
};

export default function CommunityFeed({ currentUser, activeCommunity, posts, onLikePost, onAddPost, onPinPost }: CommunityFeedProps) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreator, setShowCreator] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newTags, setNewTags] = useState("");
  const [showSpacePicker, setShowSpacePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!activeCommunity) return;
    const storedSpaces = sessionStorage.getItem(`spaces-${activeCommunity.id}`);
    if (storedSpaces) {
      setSpaces(JSON.parse(storedSpaces));
      return;
    }
    fetch(`/api/spaces?workspaceId=${activeCommunity.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.spaces?.length) {
          setSpaces(data.spaces);
          sessionStorage.setItem(`spaces-${activeCommunity.id}`, JSON.stringify(data.spaces));
        } else {
          const defaultSpaces: Space[] = (activeCommunity.categories || []).map((cat, i) => ({
            id: `space-${cat.toLowerCase().replace(/\s+/g, "-")}`,
            workspaceId: activeCommunity.id, name: cat, description: "",
            icon: SPACE_ICONS[cat.toLowerCase().replace(/\s+/g, "")] || "💬",
            color: SPACE_COLORS[cat.toLowerCase().replace(/\s+/g, "")] || "indigo",
            accessType: "public", sortOrder: i, postCount: 0, isArchived: false,
          }));
          setSpaces(defaultSpaces);
        }
      })
      .catch(() => {});
  }, [activeCommunity]);

  const filteredPosts = posts.filter(p => {
    const matchesSpace = !activeSpace || p.category === spaces.find(s => s.id === activeSpace)?.name || p.category === activeSpace;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpace && matchesSearch;
  });

  const handleSubmitPost = async () => {
    if (!newTitle.trim() || submitting) return;
    setSubmitting(true);
    try {
      const tagsArr = newTags.split(",").map(t => t.trim()).filter(Boolean);
      await onAddPost(newTitle, newContent, newCategory, tagsArr);
      setNewTitle(""); setNewContent(""); setNewCategory("General"); setNewTags("");
      setShowCreator(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="h-full flex bg-[#F8F9FB] overflow-hidden">
      {/* Spaces sidebar */}
      <div className="w-52 bg-white border-r border-[#E5E7EB] flex flex-col shrink-0 overflow-y-auto">
        <div className="p-3 border-b border-[#E5E7EB]">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">Spaces</div>
        </div>
        <div className="p-2 space-y-0.5 flex-1">
          <button
            onClick={() => setActiveSpace(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
              !activeSpace ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            All Posts
          </button>
          {spaces.map(space => (
            <button
              key={space.id}
              onClick={() => setActiveSpace(space.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                activeSpace === space.id ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{space.icon || "💬"}</span>
              <span className="truncate flex-1">{space.name}</span>
              {space.accessType !== "public" && <Lock className="w-3 h-3 text-gray-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main feed */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text" placeholder="Search posts..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowCreator(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Post
          </button>
        </div>

        {/* Posts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-900 mb-1">No posts yet</p>
              <p className="text-xs text-gray-500 mb-4">Be the first to start a discussion</p>
              <button
                onClick={() => setShowCreator(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 cursor-pointer"
              >
                Create Post
              </button>
            </div>
          ) : (
            filteredPosts.map(post => {
              const isLiked = post.likedByUserIds?.includes(currentUser?.id || "");
              return (
                <div key={post.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition">
                  {post.isPinned && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mb-2">
                      <Pin className="w-3 h-3" /> Pinned
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">
                      {post.authorAvatar ? <img src={post.authorAvatar} className="w-full h-full rounded-full object-cover" /> : getInitials(post.authorName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-900">{post.authorName}</span>
                        <span className="text-[9px] text-gray-400">{post.authorRole}</span>
                        <span className="text-[9px] text-gray-300">·</span>
                        <span className="text-[9px] text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{post.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mt-1">{post.title}</h3>
                      <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap line-clamp-3">{post.content}</p>
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map(tag => (
                            <span key={tag} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">#{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-50">
                        <button
                          onClick={() => onLikePost(post.id)}
                          className={`flex items-center gap-1 text-xs font-semibold transition cursor-pointer ${
                            isLiked ? "text-indigo-600" : "text-gray-400 hover:text-indigo-600"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-indigo-600" : ""}`} />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition cursor-pointer">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.commentsCount}
                        </button>
                        {onPinPost && (
                          <button onClick={() => onPinPost(post.id)} className="text-xs text-gray-400 hover:text-amber-600 transition cursor-pointer ml-auto">
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreator && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreator(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Create Post</h2>
              <button onClick={() => setShowCreator(false)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setShowSpacePicker(!showSpacePicker)}
                    className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-semibold"
                  >
                    {spaces.find(s => s.id === activeSpace)?.name || newCategory} <ChevronDown className="w-3 h-3" />
                  </button>
                  {showSpacePicker && (
                    <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-10 w-44">
                      {spaces.map(space => (
                        <button
                          key={space.id}
                          onClick={() => { setNewCategory(space.name); setShowSpacePicker(false); }}
                          className="w-full text-left px-2 py-1.5 text-xs rounded-lg hover:bg-gray-50"
                        >
                          {space.icon} {space.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <input
                type="text" placeholder="Post title..." value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
              />
              <textarea
                placeholder="Share something with the community..." value={newContent}
                onChange={e => setNewContent(e.target.value)} rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
              <input
                type="text" placeholder="Tags (comma separated)" value={newTags}
                onChange={e => setNewTags(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreator(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer">Cancel</button>
              <button
                onClick={handleSubmitPost}
                disabled={!newTitle.trim() || submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {submitting ? "Posting..." : <><Send className="w-3.5 h-3.5" /> Post</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
