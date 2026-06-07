import React, { useState } from "react";
import { Play, Star, Users, Clock, Check, ChevronDown, BookOpen, Shield, Award, BarChart3, MessageSquare, FileText, Sparkles, ArrowRight, DollarSign, Gift, RefreshCw } from "lucide-react";
import TestimonialCard from "../shared/TestimonialCard";
import FaqSection from "../shared/FaqSection";

interface CourseSalesPageProps {
  slug?: string;
}

export default function CourseSalesPage({ slug = "advanced-ai-agent-architecture" }: CourseSalesPageProps) {
  const navigate = (path: string) => { window.location.pathname = path; };
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  const course = {
    title: "Advanced AI Agent Architecture",
    tagline: "Build production-ready AI agents",
    description: "Learn to design, build, and deploy sophisticated AI agents. This comprehensive course covers multi-model orchestration, memory systems, tool integration, observability, and deployment patterns used by top AI teams.",
    instructor: "Sarah Chen",
    instructorRole: "AI Engineer at Google, 10+ years experience",
    instructorBio: "Sarah has built AI systems used by millions. She previously led the ML infrastructure team at Google and has taught over 5,000 students worldwide.",
    rating: 4.8,
    reviewCount: 342,
    students: 1247,
    totalHours: 8,
    lessons: 42,
    difficulty: "Advanced" as const,
    price: 199,
    isFree: false,
    category: "AI Engineering",
    updatedAt: "June 2026",
    thumbnail: "",
    trailerUrl: "",
  };

  const learningOutcomes = [
    "Design multi-agent architectures using orchestration patterns",
    "Build memory systems (short-term, long-term, episodic) for agents",
    "Integrate 20+ tools and APIs into agent workflows",
    "Implement observability, logging, and monitoring for AI agents",
    "Deploy agents to production with proper scaling and cost management",
    "Handle edge cases, errors, and fallback strategies",
  ];

  const curriculum = [
    { module: 1, title: "Foundations of AI Agents", lessons: 6, duration: "1.5 hrs", items: ["What are AI agents?", "Agent loop architecture", "Planning & reasoning", "Memory systems overview", "Tool use patterns", "Exercise: First agent"], free: true },
    { module: 2, title: "Multi-Model Orchestration", lessons: 8, duration: "2 hrs", items: ["Router patterns", "Hierarchical agents", "Parallel execution", "Model selection strategies", "Cost optimization", "Fallback chains", "Ensemble methods", "Exercise: Router agent"], free: false },
    { module: 3, title: "Advanced Memory Systems", lessons: 6, duration: "1.5 hrs", items: ["Vector stores & embeddings", "Conversation memory", "Episodic memory", "Summarization strategies", "Memory persistence", "Exercise: Memory-augmented agent"], free: false },
    { module: 4, title: "Tool Integration & APIs", lessons: 8, duration: "2 hrs", items: ["Function calling deep dive", "Building custom tools", "API integrations", "Web search & browsing", "Code execution", "File operations", "Authentication patterns", "Exercise: Tool suite"], free: false },
    { module: 5, title: "Observability & Debugging", lessons: 6, duration: "1.5 hrs", items: ["Tracing agent calls", "Logging strategies", "Step-by-step debugging", "Performance monitoring", "Cost tracking", "Exercise: Debug session"], free: false },
    { module: 6, title: "Production Deployment", lessons: 8, duration: "2 hrs", items: ["Containerization", "Scaling strategies", "API serving", "Caching", "Rate limiting", "Monitoring & alerts", "CI/CD for agents", "Final project"], free: false },
  ];

  const reviews = [
    { name: "Michael Torres", role: "ML Engineer", content: "The best AI agents course I've taken. Sarah's explanations are crystal clear and the exercises are incredibly practical. I built my first production agent by week 2.", rating: 5 },
    { name: "Lisa Park", role: "Full-Stack Developer", content: "Went from zero knowledge to deploying agents in production. The module on memory systems alone is worth the price of the course.", rating: 5 },
    { name: "Andrew Kim", role: "AI Product Manager", content: "Finally, a course that bridges the gap between theory and production. The observability and debugging section saved me weeks of headaches.", rating: 4 },
  ];

  const faqItems = [
    { question: "What are the prerequisites?", answer: "Basic Python knowledge and familiarity with APIs. No prior AI agent experience required." },
    { question: "Is this course hands-on?", answer: "Absolutely. Each module includes practical exercises and you'll build a complete production agent as your final project." },
    { question: "Do I get a certificate?", answer: "Yes. Upon completing all modules and the final project, you'll receive a verified certificate." },
    { question: "How long do I have access?", answer: "Lifetime access. You can revisit any module anytime, including future updates." },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full w-fit mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                {course.category}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">{course.title}</h1>
              <p className="text-lg text-gray-400 mb-6">{course.tagline}</p>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">{course.description}</p>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap">
                <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />{course.rating} ({course.reviewCount})</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{course.students.toLocaleString()} students</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{course.totalHours} hours</span>
                <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" />{course.lessons} lessons</span>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{course.instructor.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{course.instructor}</p>
                  <p className="text-xs text-gray-400">{course.instructorRole}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 bg-white px-7 py-3 rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Enroll Now — ${course.price}
                </button>
                <button className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white px-5 py-3 rounded-xl hover:bg-white/10 transition-colors">
                  <Play className="w-4 h-4" />
                  Watch Trailer
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Gift className="w-3.5 h-3.5" />30-day refund</span>
                <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" />Lifetime access</span>
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />Certificate</span>
              </div>
            </div>

            {/* Video placeholder */}
            <div className="relative">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-700 flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 hover:bg-white/20 transition-colors cursor-pointer">
                    <Play className="w-7 h-7 text-white ml-0.5" />
                  </div>
                  <p className="text-sm text-gray-400">Course Trailer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">

            {/* Learning outcomes */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {learningOutcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    {outcome}
                  </div>
                ))}
              </div>
            </section>

            {/* Instructor */}
            <section className="bg-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-white">{course.instructor.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.instructor}</h3>
                  <p className="text-sm text-gray-500 mb-2">{course.instructorRole}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{course.instructorBio}</p>
                </div>
              </div>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
              <div className="space-y-2">
                {curriculum.map((mod) => {
                  const isOpen = expandedModule === mod.module - 1;
                  return (
                    <div key={mod.module} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setExpandedModule(isOpen ? null : mod.module - 1)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                            {mod.module}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{mod.title}</h4>
                            <p className="text-xs text-gray-500">{mod.lessons} lessons · {mod.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {mod.free && <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Free</span>}
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 border-t border-gray-100">
                          <ul className="mt-3 space-y-2">
                            {mod.items.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                <Play className="w-3 h-3 text-gray-400 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Student Reviews</h2>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(course.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">{course.rating}</span>
                <span className="text-sm text-gray-500">({course.reviewCount} reviews)</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {reviews.map((r) => (
                  <TestimonialCard key={r.name} {...r} />
                ))}
              </div>
            </section>

            {/* FAQ */}
            <FaqSection items={faqItems} title="Frequently Asked Questions" />

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Pricing card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                <div className="mb-4">
                  {course.isFree ? (
                    <span className="text-4xl font-bold text-gray-900">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900">${course.price}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">$299</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gray-900 px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 mb-3"
                >
                  <Sparkles className="w-4 h-4" />
                  Enroll Now
                </button>
                <p className="text-xs text-gray-500 text-center">30-day money-back guarantee</p>

                <div className="mt-6 space-y-3">
                  {[
                    { icon: Clock, label: "Duration", value: `${course.totalHours} hours` },
                    { icon: FileText, label: "Lessons", value: `${course.lessons} lessons` },
                    { icon: BarChart3, label: "Difficulty", value: course.difficulty },
                    { icon: Users, label: "Students", value: course.students.toLocaleString() },
                    { icon: Award, label: "Certificate", value: "Yes" },
                    { icon: RefreshCw, label: "Updated", value: course.updatedAt },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <Icon className="w-3.5 h-3.5" />
                          {item.label}
                        </span>
                        <span className="font-medium text-gray-700">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Includes */}
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">This course includes:</h3>
                <ul className="space-y-2.5">
                  {[
                    "42 on-demand video lessons",
                    "Downloadable resources & code",
                    "6 hands-on exercises",
                    "Final project with review",
                    "Certificate of completion",
                    "Lifetime access",
                    "Community discussion access",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
