import React from "react";
import { Users, BookOpen, ArrowRight } from "lucide-react";

interface CommunityCardProps {
  name: string;
  description: string;
  memberCount: number;
  courseCount: number;
  coverUrl?: string;
  slug: string;
  category?: string;
}

export default function CommunityCard({ name, description, memberCount, courseCount, coverUrl, slug }: CommunityCardProps) {
  return (
    <div
      onClick={() => window.location.pathname = `/community/${slug}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all"
    >
      {/* Cover */}
      <div className="relative h-36 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        {coverUrl && <img src={coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description || "Community description"}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{memberCount.toLocaleString()}</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{courseCount} courses</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
