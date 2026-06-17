import React from "react";
import { MessageSquare, BookOpen, Users, DollarSign, Zap, BarChart3, Shield, Globe, Layers, Sparkles, ArrowRight, Check, Monitor, Smartphone, Puzzle, Lock, Cloud, Headphones } from "lucide-react";
import HeroSection from "../shared/HeroSection";
import FeatureCard from "../shared/FeatureCard";

const featuresMain = [
  { icon: MessageSquare, title: "Community Hub", description: "Build engaged communities with threaded discussions, announcements, polls, and direct messaging. Members can connect, share, and collaborate in real-time.", gradient: "from-indigo-500 to-indigo-600" as const },
  { icon: BookOpen, title: "Course Platform", description: "Create beautiful courses with our Notion-like block editor. Support for video, quizzes, assignments, AI-generated content, certificates, and drip scheduling.", gradient: "from-purple-500 to-purple-600" as const },
  { icon: Users, title: "Live Events", description: "Host webinars, workshops, Q&A sessions, and cohort-based courses. Built-in scheduling, reminders, and auto-recording for on-demand replays.", gradient: "from-rose-500 to-rose-600" as const },
  { icon: DollarSign, title: "Monetization", description: "Multiple revenue streams: subscriptions, one-time purchases, bundles, coaching, and affiliate programs. Keep 100% of your revenue.", gradient: "from-emerald-500 to-emerald-600" as const },
  { icon: Zap, title: "AI-Powered Tools", description: "Generate course outlines, lesson content, quiz questions, and practice exercises with AI. Smart recommendations help students discover relevant content.", gradient: "from-cyan-500 to-cyan-600" as const },
  { icon: BarChart3, title: "Analytics & Insights", description: "Track revenue, engagement, completion rates, and student progress. Identify at-risk students and optimize your content with data-driven decisions.", gradient: "from-amber-500 to-amber-600" as const },
];

const extendedFeatures = [
  { icon: Shield, title: "Role-Based Access", description: "Granular permissions for creators, admins, moderators, and students. Keep your community safe and organized.", gradient: "from-teal-500 to-teal-600" },
  { icon: Globe, title: "Custom Domain", description: "Brand your community and courses with your own domain. Full white-label options on Business plans.", gradient: "from-blue-500 to-blue-600" },
  { icon: Layers, title: "Multi-Community", description: "Create and manage multiple communities from one account. Each with its own branding, members, and content.", gradient: "from-violet-500 to-violet-600" },
  { icon: Monitor, title: "Beautiful Pages", description: "Landing pages, sales pages, and community pages that look professional without any design skills needed.", gradient: "from-orange-500 to-orange-600" },
  { icon: Smartphone, title: "Mobile First", description: "Fully responsive design that works beautifully on every device. Native apps available on Pro plans.", gradient: "from-pink-500 to-pink-600" },
  { icon: Puzzle, title: "Integrations", description: "Connect with Stripe, PayPal, Zoom, Google Calendar, Slack, Discord, and 100+ tools via Zapier.", gradient: "from-indigo-500 to-indigo-600" },
  { icon: Lock, title: "Enterprise Security", description: "SOC 2 compliant, end-to-end encryption, SSO/SAML, and audit logs. Your data is safe with us.", gradient: "from-gray-600 to-gray-700" },
  { icon: Headphones, title: "24/7 Support", description: "Priority support on all paid plans. Average response time under 2 hours. Enterprise includes a dedicated success manager.", gradient: "from-emerald-500 to-emerald-600" },
];

export default function FeaturesPage() {
  const navigate = (path: string) => { window.location.pathname = path; };

  return (
    <div className="bg-white">
      <HeroSection
        title="Everything you need to build a thriving creator business"
        subtitle="Community, courses, events, monetization, and AI tools — all in one beautiful platform. No coding required."
        ctaText="Start Building Free"
        ctaHref="/register"
        secondaryCtaText="See Pricing"
        secondaryCtaHref="/pricing"
      />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Core Features</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Everything you need in one platform, nothing you don't.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuresMain.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} gradient={f.gradient} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">And so much more</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Every feature designed to help you grow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {extendedFeatures.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} gradient={f.gradient as string} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Ready to get started?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto">Join 10,000+ creators already building on SkoolClone.</p>
          <button onClick={() => navigate("/register")} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 bg-white px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5">
            <Sparkles className="w-4 h-4" />
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}
