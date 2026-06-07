import React from "react";
import { Users, Star, Clock, ArrowRight } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  students: number;
  rating: number;
  price: number;
  isFree: boolean;
  duration?: string;
  thumbnail?: string;
  slug: string;
  category?: string;
}

export default function CourseCard({
  title, description, instructor, instructorAvatar, students, rating, price, isFree, duration, thumbnail, slug, category
}: CourseCardProps) {
  return (
    <div
      onClick={() => window.location.pathname = `/course/${slug}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/30 text-xs font-medium uppercase tracking-wider">{category || "Course"}</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3">
          {isFree ? (
            <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full shadow-sm">Free</span>
          ) : (
            <span className="text-[11px] font-semibold text-gray-700 bg-white px-2 py-0.5 rounded-full shadow-sm">${price}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description}</p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-3">
          {instructorAvatar ? (
            <img src={instructorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-[9px] font-semibold text-gray-500">{instructor.charAt(0)}</span>
            </div>
          )}
          <span className="text-xs text-gray-600">{instructor}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{students.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" />{rating.toFixed(1)}</span>
          {duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{duration}</span>}
        </div>
      </div>
    </div>
  );
}
