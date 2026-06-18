import React, { useState, useEffect } from "react";
import { Check, ArrowRight, BookOpen, Sparkles } from "lucide-react";

interface CourseThankYouProps {
  slug?: string;
}

export default function CourseThankYou({ slug }: CourseThankYouProps) {
  const navigate = (path: string) => { window.location.pathname = path; };
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/courses/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.course) setCourseName(data.course.name);
        else setCourseName(slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      })
      .catch(() => setCourseName(slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())));
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard!</h1>
        <p className="text-gray-500 mb-2">You're now enrolled in</p>
        <p className="text-lg font-semibold text-gray-900 mb-6">{courseName || "your course"}</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 text-emerald-600 mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Getting Started</span>
          </div>
          <ul className="text-left space-y-2">
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>Check the curriculum and start with Module 1</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>Introduce yourself in the community</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Go to My Courses
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
