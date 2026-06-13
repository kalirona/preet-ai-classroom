import { useState } from "react";
import { Post } from "../types";
import { Bookmark, MessageSquare, ThumbsUp, Trash2 } from "lucide-react";

interface SavedPostsViewProps {
  posts: Post[];
}

export default function SavedPostsView({ posts }: SavedPostsViewProps) {
  const [savedIds, setSavedIds] = useState<string[]>(["post-1"]);

  const bookmarkedPosts = posts.filter((p) => savedIds.includes(p.id));

  const handleRemoveBookmark = (id: string) => {
    setSavedIds(savedIds.filter((savedId) => savedId !== id));
  };

  return (
    <div className="h-full bg-[#F8F9FB] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 font-display">Saved Posts</h1>
            <p className="text-xs text-slate-400">Bookmarked discussions and articles.</p>
          </div>
        </div>

        {/* Bookmarked posts */}
        {bookmarkedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <Bookmark className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-xs text-slate-400">No saved posts yet.</p>
            <p className="text-[10px] text-slate-300 mt-1">Bookmark posts from the feed to save them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarkedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-indigo-50 text-indigo-600 border border-indigo-200/80">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1">{post.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.content}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveBookmark(post.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {post.commentsCount}
                  </span>
                  <span className="ml-auto font-medium">
                    {post.authorName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
