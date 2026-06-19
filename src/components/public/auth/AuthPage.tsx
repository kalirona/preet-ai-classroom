import React, { useState } from "react";
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, BookOpen } from "lucide-react";

interface AuthPageProps {
  initialMode?: "login" | "register";
  onAuthSuccess?: (user: any) => void;
}

export default function AuthPage({ initialMode = "login", onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const navigate = (path: string) => { window.location.pathname = path; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email, password } : { email, password, name, username: email.split("@")[0] };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onAuthSuccess?.(data.user);
        window.location.reload();
      } else {
        setError(data.error || "Authentication failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white items-center justify-center p-12">
        <div className="max-w-md">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">SkoolClone</span>
          </button>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Build, teach, and grow your community</h2>
          <p className="text-gray-400 mb-8">Join 10,000+ creators already using SkoolClone to turn their expertise into a thriving business.</p>
          <div className="space-y-4">
            {[
              "Create beautiful courses in minutes",
              "Build engaged communities",
              "Monetize your expertise",
              "AI-powered tools included",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {mode === "login" ? "Log in to continue building." : "Start your 14-day free trial. No credit card needed."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === "login" ? (
                <><LogIn className="w-4 h-4" /> Log In</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>

          {mode === "login" && (
            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-[10px] font-semibold text-amber-800 uppercase tracking-wide mb-1.5">Demo Accounts</p>
              <div className="space-y-1 text-[11px] text-amber-700">
                <p><span className="font-mono font-bold">admin@example.com</span> / <span className="font-mono">admin123</span> — Super Admin</p>
                <p><span className="font-mono font-bold">creator@example.com</span> / <span className="font-mono">demo123</span> — Creator</p>
                <p><span className="font-mono font-bold">instructor@example.com</span> / <span className="font-mono">demo123</span> — Instructor</p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-6 text-center">
            {mode === "login" ? (
              <>Don't have an account? <button onClick={() => { setMode("register"); setError(""); }} className="font-medium text-gray-900 underline underline-offset-2">Sign up free</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setMode("login"); setError(""); }} className="font-medium text-gray-900 underline underline-offset-2">Log in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
