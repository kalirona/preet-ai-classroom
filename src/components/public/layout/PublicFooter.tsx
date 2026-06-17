import React from "react";
import { BookOpen, Heart, Github, Twitter } from "lucide-react";

const footerLinks = {
  Product: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/communities", label: "Communities" },
    { href: "/courses", label: "Courses" },
    { href: "/blog", label: "Blog" },
  ],
  Resources: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/creator/guide", label: "Creator Guide" },
    { href: "/faq", label: "FAQ" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ],
};

export default function PublicFooter() {
  const navigate = (path: string) => { window.location.pathname = path; };

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 group mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SkoolClone</span>
            </button>
            <p className="text-sm leading-relaxed mb-6">
              The all-in-one platform for creators to build communities, sell courses, and grow their audience.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Github, Heart].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => navigate(link.href)}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} SkoolClone. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-400" /> for creators worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
