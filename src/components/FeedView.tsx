import React, { useState, useEffect } from "react";
import { Community, Post, Comment, WorkspaceRole } from "../types";
import { MessageSquare, ThumbsUp, Pin, Volume2, Search, ArrowRight, MessageCircle, Sparkles, Send, Eye, X, Loader2 } from "lucide-react";

interface FeedViewProps {
  userRole: WorkspaceRole;
  activeCommunity: Community | null;
  posts: Post[];
  onLikePost: (id: string) => void;
  onAddPost: (title: string, content: string, category: string, tags: string[]) => Promise<any>;
  onPinPost?: (id: string) => void;
}

export default function FeedView({
  userRole,
  activeCommunity,
  posts,
  onLikePost,
  onAddPost,
  onPinPost
}: FeedViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Post Creator state
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  
  // AI assist state inside post creator
  const [aiTopic, setAiTopic] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Active expanded comments drawer state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Filter posts
  const categories = ["All", ...(activeCommunity?.categories || [])];
  
  const filteredPosts = posts.filter(p => {
    const categoryMatches = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const searchMatches = searchQuery === "" || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && searchMatches;
  });

  // Fetch comments when dialog opens
  const fetchComments = async (postId: string) => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (e) {
      console.error("Error loading comment stream:", e);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    fetchComments(post.id);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newCommentText.trim()) return;

    try {
      const res = await fetch(`/api/posts/${selectedPost.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newCommentText })
      });
      const data = await res.json();
      if (data.success) {
        setNewCommentText("");
        fetchComments(selectedPost.id);
        // Sync local comments count increment
        selectedPost.commentsCount += 1;
      }
    } catch (e) {
      console.error("Comment submission error", e);
    }
  };

  const handleGenerateAiPost = async () => {
    if (!aiTopic.trim()) return;
    setIsAiGenerating(true);
    try {
      const res = await fetch("/api/ai/write-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic })
      });
      const data = await res.json();
      if (data.title && data.content) {
        setNewPostTitle(data.title);
        setNewPostContent(data.content);
        setAiTopic("");
      }
    } catch (er) {
      console.error("Gemini model execution error: ", er);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const cat = newPostCategory || activeCommunity?.categories[0] || "General Discussions";
    const tagsArr = newPostTags ? newPostTags.split(",").map(t => t.trim()) : [];
    
    await onAddPost(newPostTitle, newPostContent, cat, tagsArr);
    
    // Reset fields
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostCategory("");
    setNewPostTags("");
    setShowCreatorModal(false);
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-6 h-full overflow-y-auto" id="feed-view-main">
      
      {/* LEFT COLUMN: Categories (Bento Left Rail) */}
      <div className="col-span-12 md:col-span-3 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono mb-3">Channels</h3>
          <div className="space-y-1">
            {categories.map((cat) => {
              const count = cat === "All" 
                ? posts.length 
                : posts.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  id={`channel-filter-${cat}`}
                >
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] rounded font-mono ${
                    selectedCategory === cat ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tips & Guidelines Bento Row */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <h4 className="text-xs font-bold text-indigo-900">XP Rules</h4>
          </div>
          <p className="text-[11px] text-indigo-950 leading-relaxed">
            Gain high levels & badges inside our workspace:
          </p>
          <ul className="text-[10px] text-indigo-800 space-y-1 mt-2 list-disc list-inside">
            <li>Post new topics: <span className="font-bold">+15 XP</span></li>
            <li>Comment & discuss: <span className="font-bold">+10 XP</span></li>
            <li>Classroom completions: <span className="font-bold">+10 XP</span></li>
          </ul>
        </div>
      </div>

      {/* CENTER & RIGHT COLUMNS: The Feed Stream */}
      <div className="col-span-12 md:col-span-9 space-y-5">
        
        {/* Bento Top Header bar with search and publish actions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations, prompt archives, threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-950 focus:outline-none placeholder-gray-400"
              id="feed-search-input"
            />
          </div>
          <button
            onClick={() => setShowCreatorModal(true)}
            className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
            id="open-post-creator"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Write Discussion
          </button>
        </div>

        {/* FEED POSTS LISTING */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 py-16 text-center shadow-sm">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-800">No conversations here</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Be the founder of this channel! Write the first discussion post or try switching to "All" categories.
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-indigo-200 transition-all group" id={`post-item-${post.id}`}>
                
                {/* Post Metadata Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.authorAvatar} 
                      alt={post.authorName} 
                      className="w-9 h-9 rounded-full object-cover border border-gray-100" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{post.authorName}</span>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 font-medium text-[9px] rounded uppercase tracking-wider font-mono">
                          {post.authorRole}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString()} • in #{post.category}
                      </div>
                    </div>
                  </div>

                  {/* Badges: Pinned / Announcements */}
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-200">
                        <Pin className="w-2.5 h-2.5 fill-amber-500" />
                        Pinned
                      </span>
                    )}
                    {post.isAnnouncement && (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border border-rose-200">
                        <Volume2 className="w-2.5 h-2.5 text-rose-500" />
                        Announcement
                      </span>
                    )}
                    {onPinPost && (userRole === WorkspaceRole.ADMIN || userRole === WorkspaceRole.OWNER || userRole === WorkspaceRole.MODERATOR) && (
                      <button
                        onClick={() => onPinPost(post.id)}
                        className="text-gray-400 hover:text-amber-500 p-1"
                        title="Pin this Post"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <h4 className="text-sm font-bold text-gray-900 font-display mb-2 hover:text-indigo-600 transition truncate-3-lines">
                  {post.title}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap font-sans">
                  {post.content}
                </p>

                {/* Badges and tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 font-mono text-[9px] rounded uppercase font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Likes / Comments interactive grid */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => onLikePost(post.id)}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-indigo-600 transition"
                    id={`post-like-button-${post.id}`}
                  >
                    <ThumbsUp className="w-4 h-4 fill-none" />
                    <span>{post.likes} Upvotes</span>
                  </button>

                  <button
                    onClick={() => handleOpenComments(post)}
                    className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                    id={`post-comment-button-${post.id}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount} comments / discussions</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* AI & MANUAL POST CREATOR MODAL */}
      {showCreatorModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200/80 w-full max-w-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display">Create Discussion Subject</h3>
                <p className="text-xs text-gray-400">Share prompts, questions, check-ins, or engineering solutions.</p>
              </div>
              <button
                onClick={() => setShowCreatorModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Generator Panel Section */}
            <div className="p-4 bg-indigo-50/70 border-b border-indigo-100 flex flex-col md:flex-row items-center gap-3">
              <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs shrink-0 select-none">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                AI Post Helper:
              </div>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder="Ask Gemini model (e.g. 'Stripe integration mistakes' or 'Yoga recovery flow')..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateAiPost}
                  disabled={isAiGenerating || !aiTopic.trim()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Draft
                </button>
              </div>
            </div>

            {/* Main Form Fields */}
            <form onSubmit={handleCreatePostSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Post Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Provide a specific, descriptive key heading..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Channel Category</label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                    >
                      <option value="">-- Choose Category --</option>
                      {activeCommunity?.categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Hashtags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. routing, performance"
                      value={newPostTags}
                      onChange={(e) => setNewPostTags(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Post Body</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Provide detailed instructions, code blocks, checklists, or questions..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Form Actions footer */}
              <div className="p-6 bg-slate-50/50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreatorModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  Publish Topic
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* EXPANDED DISCUSSION COMMENTS DRAWER */}
      {selectedPost && (
        <div className="fixed inset-y-0 right-0 w-full sm:max-w-xl bg-white border-l border-slate-200/80 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex justify-between items-start">
            <div className="flex-1">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-mono font-bold rounded uppercase">
                Category: #{selectedPost.category}
              </span>
              <h3 className="text-sm font-bold text-gray-900 font-display mt-2 italic leading-tight">
                "{selectedPost.title}"
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Started by {selectedPost.authorName} • {new Date(selectedPost.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedPost(null)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comment Thread Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            
            {/* Main OP Post Block */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-xs leading-relaxed text-gray-700 shadow-sm">
              <div className="font-bold text-gray-900 mb-2">Original Post Discussion:</div>
              <p>{selectedPost.content}</p>
            </div>

            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
              Comment Feed Loop ({comments.length})
            </div>

            {isLoadingComments ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                Reading comments pipeline...
              </div>
            ) : comments.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs bg-white rounded-2xl border border-gray-200">
                🚀 No responses yet. Be the absolute first to answer Alex Rivera!
              </div>
            ) : (
              comments.map((comm) => (
                <div key={comm.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs" id={`comment-node-${comm.id}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center border border-indigo-200">
                      {comm.authorName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 leading-none">
                        {comm.authorName}
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{comm.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Submit Box Input */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form onSubmit={handleAddComment}>
              <div className="flex items-center gap-2 bg-gray-50 border border-slate-200 rounded-xl p-2 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:bg-white">
                <input
                  type="text"
                  required
                  placeholder="Type your polite educational reply..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xs text-gray-950 focus:outline-none placeholder-gray-400"
                  id="write-comment-input"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shrink-0 disabled:opacity-50 transition cursor-pointer"
                  id="submit-reply-comment"
                >
                  Reply
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
