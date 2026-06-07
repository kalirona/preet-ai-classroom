import React from "react";
import { Users, BookOpen, MessageSquare, Globe, Twitter, Github, Linkedin, ArrowRight, Sparkles, Star } from "lucide-react";
import CourseCard from "../shared/CourseCard";
import CommunityCard from "../shared/CommunityCard";

interface CreatorLandingPageProps {
  username?: string;
}

export default function CreatorLandingPage({ username = "sarahchen" }: CreatorLandingPageProps) {
  const navigate = (path: string) => { window.location.pathname = path; };

  const creator = {
    username: "sarahchen",
    name: "Sarah Chen",
    title: "AI Engineer & Educator",
    bio: "I build AI systems at Google and teach 5,000+ students how to build production-ready AI agents. Passionate about making AI accessible to everyone.",
    avatar: "",
    followers: 12470,
    memberSince: "2024",
    location: "San Francisco, CA",
    socialLinks: [
      { icon: Twitter, href: "#", label: "Twitter" },
      { icon: Github, href: "#", label: "GitHub" },
      { icon: Linkedin, href: "#", label: "LinkedIn" },
    ],
    communities: [
      { name: "AI Builders Collective", description: "Community for AI builders", memberCount: 2847, courseCount: 12, slug: "ai-builders-collective", category: "Technology" },
    ],
    courses: [
      { title: "Advanced AI Agent Architecture", description: "Build production-ready AI agents.", instructor: "Sarah Chen", students: 1247, rating: 4.8, price: 199, isFree: false, duration: "8 hours", slug: "advanced-ai-agent-architecture", category: "AI Engineering" },
      { title: "Getting Started with AI", description: "A beginner-friendly introduction to AI.", instructor: "Sarah Chen", students: 847, rating: 4.7, price: 0, isFree: true, duration: "3 hours", slug: "getting-started-with-ai", category: "AI Engineering" },
    ],
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 border-4 border-white/50 shadow-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
              <span className="text-3xl font-bold text-white">{creator.name.charAt(0)}</span>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{creator.name}</h1>
              <p className="text-indigo-200 text-sm mb-2">{creator.title}</p>
              <p className="text-white/70 text-sm max-w-xl">{creator.bio}</p>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 text-sm font-semibold text-gray-900 bg-white px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-all shadow-xl"
            >
              <Sparkles className="w-4 h-4" />
              Follow
            </button>
          </div>

          {/* Stats & meta */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-6 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{creator.followers.toLocaleString()} followers</span>
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" />{creator.location}</span>
            <span className="text-white/50">Member since {creator.memberSince}</span>
            {creator.socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.label} href={link.href} className="text-white/60 hover:text-white transition-colors" title={link.label}>
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Communities */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Communities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {creator.communities.map((c) => (
              <CommunityCard key={c.slug} {...c} />
            ))}
          </div>
        </section>

        {/* Courses */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {creator.courses.map((c) => (
              <CourseCard key={c.slug} {...c} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
