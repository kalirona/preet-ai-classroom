import React from "react";
import { ArrowRight, Play } from "lucide-react";

interface HeroSectionProps {
  badge?: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  image?: string;
  imageAlt?: string;
  onCtaClick?: () => void;
  onSecondaryClick?: () => void;
}

export default function HeroSection({
  badge,
  title,
  subtitle,
  ctaText = "Get Started Free",
  ctaHref,
  secondaryCtaText = "Watch Demo",
  secondaryCtaHref,
  image,
  imageAlt = "Hero",
  onCtaClick,
  onSecondaryClick,
}: HeroSectionProps) {
  const handleCta = () => {
    if (onCtaClick) onCtaClick();
    else if (ctaHref) window.location.pathname = ctaHref;
  };
  const handleSecondary = () => {
    if (onSecondaryClick) onSecondaryClick();
    else if (secondaryCtaHref) window.location.pathname = secondaryCtaHref;
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-100/50 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            {badge && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full mb-6">
                {badge}
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
              {title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-8 max-w-lg">
              {subtitle}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleCta}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gray-900 px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 hover:shadow-gray-900/30 hover:-translate-y-0.5"
              >
                {ctaText}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSecondary}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-5 py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Play className="w-4 h-4" />
                {secondaryCtaText}
              </button>
            </div>
          </div>
          <div className="relative">
            {image ? (
              <img src={image} alt={imageAlt} className="w-full rounded-2xl shadow-2xl border border-gray-200" />
            ) : (
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Play className="w-7 h-7 text-gray-900 ml-0.5" />
                  </div>
                  <p className="text-sm text-gray-500">Product Demo</p>
                </div>
              </div>
            )}
            {/* Floating stats */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl border border-gray-200 shadow-lg px-4 py-3 hidden sm:block">
              <p className="text-xs text-gray-500">Join</p>
              <p className="text-lg font-bold text-gray-900">10,000+</p>
              <p className="text-[10px] text-gray-400">active creators</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
