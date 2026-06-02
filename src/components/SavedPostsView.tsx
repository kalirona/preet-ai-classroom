import React, { useState } from "react";
import { Post } from "../types";
import { Bookmark, MessageSquare, ThumbsUp, Tag, Heart, Trash2 } from "lucide-react";

interface SavedPostsViewProps {
  posts: Post[];
}

export default function SavedPostsView({ posts }: SavedPostsViewProps) {
  // Let's seed initial bookmarked post IDs if none exist dynamically
  const [savedIds, setSavedIds] = useState<string[]>(["post-1"]);

  const bookmarkedPosts = posts.filter(p => savedIds.includes(p.id));

  const handleRemoveBookmark = (id: string) => {
    setSavedIds(savedIds.filter(savedId => savedId !== id));
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] overflow-y-auto" id="saved-posts-view">
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Header Block */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <Bookmark className="w-6 h-6 text-amber-605 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 font-display">Your Saved Posts & Bookmarked Lessons</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review saved masterclass links, checklist articles, and valuable discussion board summaries.
            </p>
          </div>
        </div>

        {/* Bookmarked posts list */}
        {bookmarkedPosts.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center text-xs text-gray-500 shadow-sm">
            <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            No discussions bookmarked. To save a post, tap the bookmark trigger inside any discussion board.
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm hover:border-gray-300 transition relative">
                
                {/* Trash button */}
                <button
                  onClick={() => handleRemoveBookmark(post.id)}
                  className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Remove saved bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wide uppercase bg-indigo-50 text-indigo-700">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Created {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 font-sans tracking-tight mb-2 pr-8">
                  {post.title}
                </h3>
                
                <p className="text-xs text-gray-650 line-clamp-2 leading-relaxed mb-4">
                  {post.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
                      {post.likes} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      {post.commentsCount} replies
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400 font-medium">
                    By <strong>{post.authorName}</strong> ({post.authorRole})
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
