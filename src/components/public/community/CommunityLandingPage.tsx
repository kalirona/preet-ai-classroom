import React from "react";
import { Users, BookOpen, Calendar, MessageSquare, ArrowRight, Check, Star, Globe, Lock, Clock, Sparkles, Share2 } from "lucide-react";
import CourseCard from "../shared/CourseCard";
import TestimonialCard from "../shared/TestimonialCard";
import StatsBar from "../shared/StatsBar";

interface CommunityLandingPageProps {
  slug?: string;
}

export default function CommunityLandingPage({ slug = "ai-builders-collective" }: CommunityLandingPageProps) {
  const navigate = (path: string) => { window.location.pathname = path; };

  // Mock data based on slug
  const community = {
    "ai-builders-collective": {
      name: "AI Builders Collective",
      tagline: "Build the future with AI",
      description: "A community for AI enthusiasts, developers, and innovators to share knowledge, collaborate on projects, and build the next generation of AI-powered applications. Whether you're a beginner or an expert, you'll find your tribe here.",
      bannerUrl: "",
      logoUrl: "",
      memberCount: 2847,
      courseCount: 12,
      eventCount: 8,
      category: "Technology",
      createdBy: "Sarah Chen",
    },
    "design-masters": {
      name: "Design Masters",
      tagline: "Where designers level up",
      description: "Premium design community for UI/UX designers, brand strategists, and creative professionals. Master Figma, learn design systems, and build a portfolio that lands dream jobs.",
      bannerUrl: "",
      logoUrl: "",
      memberCount: 1532,
      courseCount: 8,
      eventCount: 5,
      category: "Design",
      createdBy: "Marcus Johnson",
    },
    "saas-founders-hub": {
      name: "SaaS Founders Hub",
      tagline: "Build. Launch. Scale.",
      description: "Connect with fellow SaaS founders from around the world. Share strategies, get honest feedback, find co-founders, and grow your startup with people who understand the journey.",
      bannerUrl: "",
      logoUrl: "",
      memberCount: 3621,
      courseCount: 15,
      eventCount: 12,
      category: "Business",
      createdBy: "Alex Rivera",
    },
  }[slug] || {
    name: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    tagline: "Join the community",
    description: "Welcome to this community. Connect with like-minded people, learn new skills, and grow together.",
    bannerUrl: "",
    logoUrl: "",
    memberCount: 1000,
    courseCount: 5,
    eventCount: 3,
    category: "General",
    createdBy: "A Creator",
  };

  const courses = [
    { title: "Getting Started with AI", description: "A beginner-friendly introduction to artificial intelligence and machine learning concepts.", instructor: "Sarah Chen", students: 847, rating: 4.7, price: 0, isFree: true, duration: "3 hours", slug: "getting-started-with-ai" },
    { title: "Advanced Prompt Engineering", description: "Master the art of crafting prompts that get extraordinary results from LLMs.", instructor: "Sarah Chen", students: 523, rating: 4.9, price: 79, isFree: false, duration: "6 hours", slug: "advanced-prompt-engineering" },
  ];

  const events = [
    { title: "Weekly AI Builders Standup", date: "Every Tuesday 12pm EST", attendees: 45, type: "Recurring" },
    { title: "Workshop: Building with LangChain", date: "Jun 15, 2026 at 2pm EST", attendees: 128, type: "Workshop" },
  ];

  const testimonials = [
    { name: "Emily Watson", role: "AI Engineer", content: "This community completely transformed how I approach AI development. The feedback and support are incredible.", rating: 5 },
    { name: "James Liu", role: "Product Manager", content: "The courses alone are worth joining. But the community discussions take learning to a whole new level.", rating: 5 },
  ];

  return (
    <div className="bg-white">
      {/* Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        {community.bannerUrl && <img src={community.bannerUrl} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white shadow-xl flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-white">{community.name.charAt(0)}</span>
          </div>
          <div className="flex-1 pt-4 sm:pt-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{community.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{community.tagline} · {community.category}</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button
              onClick={() => navigate("/register")}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gray-900 px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
            >
              <Sparkles className="w-4 h-4" />
              Join Community
            </button>
          </div>
        </div>

        {/* Stats + Description */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{community.description}</p>
            <StatsBar
              stats={[
                { value: `${community.memberCount.toLocaleString()}`, label: "Members", icon: Users },
                { value: `${community.courseCount}`, label: "Courses", icon: BookOpen },
                { value: `${community.eventCount}`, label: "Events/mo", icon: Calendar },
              ]}
            />
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Why join?</h3>
            <ul className="space-y-3">
              {[
                "Connect with 2,800+ AI builders",
                "Access exclusive courses & workshops",
                "Get feedback on your projects",
                "Weekly live events & AMAs",
                "Job board & collaboration opportunities",
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Featured Courses */}
        <section className="mb-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Featured Courses</h2>
              <p className="text-sm text-gray-500">Exclusive courses for community members</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {courses.map((c) => (
              <CourseCard key={c.slug} {...c} />
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {events.map((evt, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">{evt.type}</span>
                  <span className="text-xs text-gray-500">{evt.attendees} attending</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{evt.title}</h3>
                <p className="text-xs text-gray-500">{evt.date}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">What members say</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </section>

        {/* Join CTA */}
        <section className="mb-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Join {community.name}
          </h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">Connect with {community.memberCount.toLocaleString()} members and start building today.</p>
          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 bg-white px-6 py-3 rounded-xl hover:bg-gray-100 transition-all shadow-2xl"
          >
            <Sparkles className="w-4 h-4" />
            Join Free
          </button>
        </section>
      </div>
    </div>
  );
}
