import React, { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import CourseCard from "../shared/CourseCard";

const allCourses = [
  { title: "Advanced AI Agent Architecture", description: "Build production-ready AI agents with multi-model orchestration and memory systems.", instructor: "Sarah Chen", students: 1247, rating: 4.8, price: 199, isFree: false, duration: "8 hours", slug: "advanced-ai-agent-architecture", category: "AI Engineering" },
  { title: "Complete SEO Masterclass 2026", description: "Rank #1 on Google with modern SEO strategies: technical SEO, content strategy, and link building.", instructor: "Marcus Johnson", students: 893, rating: 4.9, price: 149, isFree: false, duration: "12 hours", slug: "complete-seo-masterclass-2026", category: "Marketing" },
  { title: "Rapid Prototyping with AI", description: "Turn ideas into working prototypes in hours using AI coding assistants and no-code tools.", instructor: "Alex Rivera", students: 2156, rating: 4.7, price: 0, isFree: true, duration: "4 hours", slug: "rapid-prototyping-with-ai", category: "Development" },
  { title: "UI/UX Design Fundamentals", description: "Master the principles of great design. From wireframes to polished prototypes.", instructor: "Emily Watson", students: 1567, rating: 4.6, price: 89, isFree: false, duration: "10 hours", slug: "ui-ux-design-fundamentals", category: "Design" },
  { title: "Python for Data Science", description: "Learn Python, pandas, NumPy, and visualization libraries for data analysis and ML.", instructor: "David Kim", students: 3241, rating: 4.8, price: 0, isFree: true, duration: "15 hours", slug: "python-for-data-science", category: "Data Science" },
  { title: "SaaS Growth Playbook", description: "Proven strategies to acquire users, reduce churn, and scale your SaaS from 0 to 10M ARR.", instructor: "James Liu", students: 742, rating: 4.5, price: 249, isFree: false, duration: "6 hours", slug: "saas-growth-playbook", category: "Business" },
];

const categories = ["All", "AI Engineering", "Marketing", "Development", "Design", "Data Science", "Business"];
const instructors = ["All", "Sarah Chen", "Marcus Johnson", "Alex Rivera", "Emily Watson", "David Kim", "James Liu"];

export default function CoursesDirectory() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [instructor, setInstructor] = useState("All");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = allCourses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "All" && c.category !== category) return false;
    if (instructor !== "All" && c.instructor !== instructor) return false;
    if (priceFilter === "free" && !c.isFree) return false;
    if (priceFilter === "paid" && c.isFree) return false;
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Explore Courses</h1>
          <p className="text-gray-500">Discover courses taught by world-class instructors</p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${category === cat ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                {(["all", "free", "paid"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriceFilter(p)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors capitalize ${priceFilter === p ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-gray-500">{filtered.length} course{filtered.length !== 1 ? "s" : ""} found</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <CourseCard key={c.slug} {...c} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-2">No courses match your filters</p>
            <button onClick={() => { setSearch(""); setCategory("All"); setInstructor("All"); setPriceFilter("all"); }} className="text-sm font-medium text-gray-900 underline underline-offset-2">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
