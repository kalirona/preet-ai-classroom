import React from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";

interface PricingCardProps {
  name: string;
  description: string;
  price: number;
  period?: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  onCta?: () => void;
  icon?: React.ElementType;
}

export default function PricingCard({
  name, description, price, period = "/month", features, highlighted, ctaText = "Get Started", onCta, icon: Icon
}: PricingCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
      highlighted ? "border-gray-900 shadow-lg shadow-gray-900/10" : "border-gray-200 hover:border-gray-300"
    }`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          Most Popular
        </div>
      )}

      <div className="mb-6">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <Icon className="w-5 h-5 text-gray-900" />
          </div>
        )}
        <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">${price}</span>
        <span className="text-sm text-gray-500 ml-1">{period}</span>
      </div>

      <button
        onClick={onCta}
        className={`w-full flex items-center justify-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all mb-6 ${
          highlighted
            ? "text-white bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20"
            : "text-gray-700 bg-gray-100 hover:bg-gray-200"
        }`}
      >
        {ctaText}
        <ArrowRight className="w-4 h-4" />
      </button>

      <ul className="space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
