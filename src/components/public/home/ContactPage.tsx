import React, { useState } from "react";
import { Mail, MessageSquare, MapPin, Send, Check, ArrowRight, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white">
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3">Get in touch</h1>
            <p className="text-lg text-gray-500 max-w-lg mx-auto">Have a question, feedback, or want to partner with us? We'd love to hear from you.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Form */}
            <div>
              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Message sent!</h3>
                  <p className="text-sm text-gray-500 mb-4">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="text-sm font-medium text-gray-900 underline underline-offset-2">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                      <input type="text" required className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                      <input type="text" required className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" required className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                    <select className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none">
                      <option>General Inquiry</option>
                      <option>Sales Question</option>
                      <option>Technical Support</option>
                      <option>Partnership Opportunity</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                    <textarea rows={5} required className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none resize-none" />
                  </div>
                  <button type="submit" className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-white bg-gray-900 px-5 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20">
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {[
                { icon: Mail, title: "Email", value: "hello@skoolclone.com", description: "We respond within 24 hours" },
                { icon: MessageSquare, title: "Live Chat", value: "Available 9am-5pm EST", description: "Chat with our support team" },
                { icon: MapPin, title: "Location", value: "San Francisco, CA", description: "Remote-first team, worldwide" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.value}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                );
              })}

              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mt-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Prefer to explore first?</h3>
                <p className="text-xs text-gray-500 mb-4">Check out our documentation, FAQ, or community forums for quick answers.</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.location.pathname = "/features"} className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-white transition-colors border border-gray-200">
                    View Features <ArrowRight className="w-3 h-3" />
                  </button>
                  <button onClick={() => window.location.pathname = "/pricing"} className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-white transition-colors border border-gray-200">
                    See Pricing <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
