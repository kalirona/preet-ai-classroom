import React from "react";
import { Calendar, User, ArrowRight, Clock, BookOpen } from "lucide-react";

const posts = [
  { title: "How to Build a Thriving Online Community in 2026", excerpt: "Learn the proven framework for building engaged communities that drive real value for members and creators alike.", author: "Sarah Chen", date: "Jun 5, 2026", readTime: "8 min", category: "Community Building", slug: "build-thriving-online-community" },
  { title: "AI in Education: The Complete Guide for Course Creators", excerpt: "Discover how AI is transforming online education and how you can leverage it to create better courses.", author: "Marcus Johnson", date: "Jun 3, 2026", readTime: "12 min", category: "AI & Education", slug: "ai-education-guide-course-creators" },
  { title: "Pricing Strategies for Online Courses: What Actually Works", excerpt: "Data-driven pricing strategies that maximize revenue without sacrificing enrollment.", author: "Alex Rivera", date: "May 28, 2026", readTime: "10 min", category: "Monetization", slug: "pricing-strategies-online-courses" },
  { title: "The Creator's Guide to Cohort-Based Courses", excerpt: "Why cohort-based courses are taking over and how to launch your own successful cohort program.", author: "Emily Watson", date: "May 20, 2026", readTime: "7 min", category: "Course Creation", slug: "guide-cohort-based-courses" },
  { title: "10 Proven Ways to Increase Course Completion Rates", excerpt: "Practical strategies to keep students engaged and motivated throughout your course.", author: "David Kim", date: "May 15, 2026", readTime: "6 min", category: "Student Success", slug: "increase-course-completion-rates" },
  { title: "From Zero to Paid: Launching Your First Community", excerpt: "A step-by-step guide to launching a paid community that people actually want to join.", author: "James Liu", date: "May 8, 2026", readTime: "11 min", category: "Community Building", slug: "launching-first-paid-community" },
];

export default function BlogPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Blog</h1>
          <p className="text-gray-500 max-w-lg mx-auto">Insights, strategies, and stories from the creator economy.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
              onClick={() => window.location.pathname = `/blog/${post.slug}`}
            >
              <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-gray-300" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">{post.category}</span>
                  <span className="text-[10px] text-gray-400">{post.readTime}</span>
                </div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3.5 h-3.5" />
                    {post.author}
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
