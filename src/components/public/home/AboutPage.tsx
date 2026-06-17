import React from "react";
import { Heart, Target, Users, Lightbulb, ArrowRight, Sparkles } from "lucide-react";
import StatsBar from "../shared/StatsBar";

export default function AboutPage() {
  const navigate = (path: string) => { window.location.pathname = path; };

  return (
    <div className="bg-white">
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full mb-4">Our Story</span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">Empowering creators to build thriving communities</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            We believe the future of education is community-driven. Our platform gives creators everything they need to build engaged communities, create stunning courses, and grow a sustainable business — all in one place.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <StatsBar
            stats={[
              { value: "10,000+", label: "Creators" },
              { value: "500K+", label: "Students" },
              { value: "50,000+", label: "Courses" },
              { value: "$12M+", label: "Revenue Generated" },
            ]}
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Heart, title: "Our Mission", description: "To democratize online education by giving every creator the tools to build, teach, and grow — without technical barriers." },
              { icon: Target, title: "Our Vision", description: "A world where anyone with expertise can build a thriving community and share knowledge on their own terms." },
              { icon: Users, title: "Our Community", description: "10,000+ creators and 500,000+ students across 150+ countries. From solo creators to enterprise teams." },
              { icon: Lightbulb, title: "Our Values", description: "Creator-first, simplicity, inclusivity, transparency, and continuous innovation. We build for the people who build." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-gray-900" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Join us on this journey</h2>
          <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto">Whether you're a first-time creator or scaling an existing business, we're here to help you succeed.</p>
          <button onClick={() => navigate("/register")} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 bg-white px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-0.5">
            <Sparkles className="w-4 h-4" />
            Start Creating Free
          </button>
        </div>
      </section>
    </div>
  );
}
