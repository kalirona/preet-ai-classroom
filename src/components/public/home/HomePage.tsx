import React from "react";
import { ArrowRight, Users, BookOpen, MessageSquare, DollarSign, Zap, Shield, BarChart3, Globe, Layers, Play, Star, Sparkles, GraduationCap, Trophy, Heart, Target } from "lucide-react";
import HeroSection from "../shared/HeroSection";
import FeatureCard from "../shared/FeatureCard";
import CommunityCard from "../shared/CommunityCard";
import CourseCard from "../shared/CourseCard";
import TestimonialCard from "../shared/TestimonialCard";
import PricingCard from "../shared/PricingCard";
import StatsBar from "../shared/StatsBar";
import FaqSection from "../shared/FaqSection";

const features = [
  { icon: MessageSquare, title: "Community Hub", description: "Build engaged communities with discussions, events, and direct messaging — all in one place.", gradient: "from-indigo-500 to-indigo-600" as const },
  { icon: BookOpen, title: "Course Platform", description: "Create and sell stunning courses with a Notion-like builder, quizzes, assignments, and certificates.", gradient: "from-purple-500 to-purple-600" as const },
  { icon: Users, title: "Live Events", description: "Host webinars, workshops, and cohort-based courses with built-in scheduling and reminders.", gradient: "from-rose-500 to-rose-600" as const },
  { icon: DollarSign, title: "Monetization", description: "Multiple revenue streams: subscriptions, one-time courses, coaching, and affiliate programs.", gradient: "from-emerald-500 to-emerald-600" as const },
  { icon: Zap, title: "AI-Powered", description: "AI-generated course outlines, lesson content, practice questions, and smart recommendations.", gradient: "from-cyan-500 to-cyan-600" as const },
  { icon: BarChart3, title: "Analytics", description: "Track engagement, revenue, completion rates, and student progress with beautiful dashboards.", gradient: "from-amber-500 to-amber-600" as const },
];

const featuredCommunities = [
  { name: "AI Builders Collective", description: "A community for AI enthusiasts, developers, and innovators to share knowledge and build together.", memberCount: 2847, courseCount: 12, slug: "ai-builders-collective", category: "Technology" },
  { name: "Design Masters", description: "Premium design community for UI/UX designers, brand strategists, and creative professionals.", memberCount: 1532, courseCount: 8, slug: "design-masters", category: "Design" },
  { name: "SaaS Founders Hub", description: "Connect with fellow SaaS founders. Share strategies, get feedback, and grow your startup.", memberCount: 3621, courseCount: 15, slug: "saas-founders-hub", category: "Business" },
];

const featuredCourses = [
  { title: "Advanced AI Agent Architecture", description: "Build production-ready AI agents with multi-model orchestration, memory systems, and tool integration.", instructor: "Sarah Chen", students: 1247, rating: 4.8, price: 199, isFree: false, duration: "8 hours", slug: "advanced-ai-agent-architecture", category: "AI Engineering" },
  { title: "Complete SEO Masterclass 2026", description: "Rank #1 on Google with modern SEO strategies: technical SEO, content strategy, link building, and AI tools.", instructor: "Marcus Johnson", students: 893, rating: 4.9, price: 149, isFree: false, duration: "12 hours", slug: "complete-seo-masterclass-2026", category: "Marketing" },
  { title: "Rapid Prototyping with AI", description: "Turn ideas into working prototypes in hours using AI coding assistants, no-code tools, and modern stacks.", instructor: "Alex Rivera", students: 2156, rating: 4.7, price: 0, isFree: true, duration: "4 hours", slug: "rapid-prototyping-with-ai", category: "Development" },
];

const testimonials = [
  { name: "Jessica Torres", role: "Course Creator", content: "I've tried Kajabi, Thinkific, and Circle. This platform combines the best of all of them. My community engagement went up 3x after switching.", rating: 5 },
  { name: "David Kim", role: "SaaS Founder", content: "The course builder is incredible. I created my first course in an afternoon and had paying students by the weekend. The AI features are a game-changer.", rating: 5 },
  { name: "Priya Sharma", role: "Coach & Consultant", content: "Finally, a platform that understands creators. The cohort-based course format helped me launch my coaching program with zero friction.", rating: 5 },
  { name: "Ryan O'Brien", role: "Digital Creator", content: "The analytics alone are worth it. I can see exactly where students drop off and optimize my content. Revenue increased 40% in my first month.", rating: 4 },
];

const pricingPlans = [
  { name: "Starter", description: "Perfect for getting started", price: 29, period: "/month", features: ["Up to 500 members", "3 courses", "Basic analytics", "Community discussions", "Mobile access", "Email support"], ctaText: "Start Free Trial" },
  { name: "Creator", description: "For growing creators", price: 79, period: "/month", features: ["Up to 5,000 members", "Unlimited courses", "Advanced analytics", "AI course builder", "Live events & webinars", "Custom domain", "Priority support"], highlighted: true, ctaText: "Start Free Trial" },
  { name: "Business", description: "For teams & enterprises", price: 199, period: "/month", features: ["Unlimited members", "Unlimited courses", "White-label branding", "API access", "SSO & SAML", "Dedicated success manager", "Custom integrations", "99.9% uptime SLA"], ctaText: "Contact Sales" },
];

const faqItems = [
  { question: "How does the free trial work?", answer: "You get full access to all features for 14 days. No credit card required. If you don't love it, just cancel — no questions asked." },
  { question: "Can I migrate my existing content?", answer: "Yes! We support importing from Kajabi, Thinkific, Teachable, and Circle. Our migration team will handle the entire process for you." },
  { question: "What payment gateways do you support?", answer: "We integrate with Stripe, PayPal, and Lemon Squeezy. You keep 100% of your revenue minus payment processing fees." },
  { question: "Can I build a mobile app?", answer: "Your community and courses are accessible via our mobile-optimized web app. Native iOS and Android apps are available on Pro and Business plans." },
  { question: "Do you offer student analytics?", answer: "Yes. You can track completion rates, engagement, quiz scores, and identify at-risk students. Enterprise plans include cohort analysis and custom reports." },
  { question: "Is there a money-back guarantee?", answer: "Absolutely. If you're not satisfied within the first 30 days of your paid subscription, we'll refund you in full. No questions asked." },
];

export default function HomePage() {
  const navigate = (path: string) => { window.location.pathname = path; };

  return (
    <div className="bg-white">
      {/* Hero */}
      <HeroSection
        badge="🎉 Now in Public Beta"
        title="Build, Teach, and Grow Your Community"
        subtitle="The all-in-one platform for creators. Build engaged communities, sell stunning courses, host live events, and monetize your expertise — without any technical skills."
        ctaText="Start Creating Free"
        ctaHref="/register"
        onSecondaryClick={() => navigate("/features")}
        image=""
      />

      {/* Why Join */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Everything you need to succeed</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">One platform. Zero complexity. Unlimited possibilities.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} gradient={f.gradient} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <StatsBar
            stats={[
              { value: "10,000+", label: "Active Creators", icon: Users },
              { value: "50,000+", label: "Courses Created", icon: BookOpen },
              { value: "500K+", label: "Students Enrolled", icon: GraduationCap },
              { value: "$12M+", label: "Creator Revenue", icon: DollarSign },
            ]}
          />
        </div>
      </section>

      {/* Featured Communities */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Featured Communities</h2>
              <p className="text-gray-500">Join thriving communities led by top creators</p>
            </div>
            <button onClick={() => navigate("/communities")} className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
              Browse All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featuredCommunities.map((c) => (
              <CommunityCard key={c.slug} {...c} />
            ))}
          </div>
          <div className="text-center mt-6 sm:hidden">
            <button onClick={() => navigate("/communities")} className="text-sm font-medium text-gray-600 hover:text-gray-900">Browse All Communities →</button>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Top Courses</h2>
              <p className="text-gray-500">Learn from the best instructors in the world</p>
            </div>
            <button onClick={() => navigate("/courses")} className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">
              Browse All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featuredCourses.map((c) => (
              <CourseCard key={c.slug} {...c} />
            ))}
          </div>
          <div className="text-center mt-6 sm:hidden">
            <button onClick={() => navigate("/courses")} className="text-sm font-medium text-gray-600 hover:text-gray-900">Browse All Courses →</button>
          </div>
        </div>
      </section>

      {/* Creator Benefits */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-900 to-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Built for creators, by creators</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">Everything you need to turn your expertise into a thriving business</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: MessageSquare, title: "Community", description: "Foster discussions, share updates, and build a loyal audience with your own branded community." },
              { icon: BookOpen, title: "Courses", description: "Beautiful, interactive course builder with quizzes, assignments, certificates, and drip content." },
              { icon: Users, title: "Events", description: "Host live workshops, webinars, and Q&A sessions. Auto-record and repurpose as course content." },
              { icon: DollarSign, title: "Monetization", description: "Subscriptions, one-time purchases, coaching, affiliates — you name it. Keep what you earn." },
            ].map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Loved by creators worldwide</h2>
            <p className="text-gray-500">See what our community is saying</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24 bg-gray-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Simple, transparent pricing</h2>
            <p className="text-gray-500">No hidden fees. No surprises. Start free and upgrade as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <PricingCard key={i} {...plan} onCta={() => navigate("/register")} icon={i === 0 ? Zap : i === 1 ? Sparkles : Target} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Ready to build your community?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto">
            Join 10,000+ creators already using SkoolClone to teach, connect, and grow.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 bg-white px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            Start Your Free Trial
          </button>
          <p className="text-xs text-white/60 mt-3">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection items={faqItems} />
    </div>
  );
}
