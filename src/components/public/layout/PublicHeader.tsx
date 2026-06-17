import React, { useState } from "react";
import { Menu, X, LogIn, UserPlus, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/communities", label: "Communities" },
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
];

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (path: string) => {
    window.location.pathname = path;
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">SkoolClone</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
            >
              <UserPlus className="w-4 h-4" />
              Get Started
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-gray-100 my-2" />
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
