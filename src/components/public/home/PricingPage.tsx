import React from "react";
import { Sparkles, Zap, Target, Check, ArrowRight } from "lucide-react";
import PricingCard from "../shared/PricingCard";
import FaqSection from "../shared/FaqSection";

const plans = [
  { name: "Starter", description: "Perfect for getting started", price: 29, period: "/month", features: ["Up to 500 members", "Up to 3 courses", "Community discussions", "Basic analytics", "Mobile-friendly", "Email support", "1 admin account"], ctaText: "Start Free Trial" },
  { name: "Creator", description: "For growing creators", price: 79, period: "/month", features: ["Up to 5,000 members", "Unlimited courses", "Advanced analytics", "AI course builder", "Live events & webinars", "Custom domain", "Priority support", "Certificate generation", "API access", "5 admin accounts"], highlighted: true, ctaText: "Start Free Trial", icon: Sparkles },
  { name: "Business", description: "For teams & enterprises", price: 199, period: "/month", features: ["Unlimited members", "Unlimited courses", "White-label branding", "SSO & SAML", "Dedicated success manager", "Custom integrations", "99.9% SLA", "Native mobile apps", "Bulk enrollment", "Unlimited admin accounts"], ctaText: "Contact Sales", icon: Target },
];

const faqItems = [
  { question: "Can I switch plans anytime?", answer: "Yes. You can upgrade or downgrade at any time. Changes take effect immediately." },
  { question: "Is there a free trial?", answer: "Yes! Every plan comes with a 14-day free trial. No credit card required." },
  { question: "What happens if I exceed member limits?", answer: "We'll notify you and give you 30 days to upgrade. No automatic overage charges." },
  { question: "Do you offer student discounts?", answer: "Yes. We offer 50% off for verified students and educational institutions." },
  { question: "Can I cancel anytime?", answer: "Absolutely. No long-term contracts. Cancel anytime with one click." },
  { question: "Is there a money-back guarantee?", answer: "Yes. 30-day money-back guarantee on all paid plans. No questions asked." },
];

export default function PricingPage() {
  const navigate = (path: string) => { window.location.pathname = path; };

  return (
    <div className="bg-white">
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full mb-4">Simple pricing</span>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3">Transparent pricing for every stage</h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Start free. Upgrade when you grow. No hidden fees, no surprise charges.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
            {plans.map((plan, i) => (
              <PricingCard key={i} {...plan} onCta={() => navigate("/register")} icon={i === 0 ? Zap : undefined} />
            ))}
          </div>

          {/* Feature comparison */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Compare plans in detail</h2>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {[
                { feature: "Members", starter: "500", creator: "5,000", business: "Unlimited" },
                { feature: "Courses", starter: "3", creator: "Unlimited", business: "Unlimited" },
                { feature: "Community Discussions", starter: "✓", creator: "✓", business: "✓" },
                { feature: "AI Course Builder", starter: "—", creator: "✓", business: "✓" },
                { feature: "Live Events", starter: "—", creator: "✓", business: "✓" },
                { feature: "Custom Domain", starter: "—", creator: "✓", business: "✓" },
                { feature: "Analytics", starter: "Basic", creator: "Advanced", business: "Advanced + Custom" },
                { feature: "API Access", starter: "—", creator: "✓", business: "✓" },
                { feature: "White-Label", starter: "—", creator: "—", business: "✓" },
                { feature: "SSO/SAML", starter: "—", creator: "—", business: "✓" },
                { feature: "Support", starter: "Email", creator: "Priority", business: "Dedicated Manager" },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-4 gap-4 px-6 py-3 text-sm ${i % 2 === 0 ? "bg-gray-50" : ""}`}>
                  <span className="font-medium text-gray-900">{row.feature}</span>
                  <span className="text-gray-600 text-center">{row.starter}</span>
                  <span className="text-gray-900 font-medium text-center">{row.creator}</span>
                  <span className="text-gray-600 text-center">{row.business}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FaqSection items={faqItems} title="Pricing FAQs" subtitle="Everything you need to know about our plans and billing." />
    </div>
  );
}
