import React, { useState } from "react";
import { User } from "../types";
import { 
  KeyRound, Mail, User as UserIcon, Keyboard, Info, AlertCircle, Sparkles, 
  ArrowRight, ShieldCheck, HelpCircle, Trophy, Globe, Layers, Eye, EyeOff, Loader2
} from "lucide-react";

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Registration States
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status indicators
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Listen for Google Auth cross-origin success messages in our sandbox preview iframe
  React.useEffect(() => {
    const handleGoogleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      // Accept local development and secure sandbox Cloud Run origins
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.user) {
        setIsLoading(true);
        setSuccessMsg(`Google Authentication successful! Welcome, ${event.data.user.fullName}!`);
        setTimeout(() => {
          onAuthSuccess(event.data.user);
        }, 800);
      }
    };
    window.addEventListener("message", handleGoogleMessage);
    return () => window.removeEventListener("message", handleGoogleMessage);
  }, [onAuthSuccess]);

  // Open google-simulated login screen in popup
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      "/auth/google-simulated",
      "google_signin_popup",
      `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`
    );

    if (!popup) {
      setIsLoading(false);
      setErrorMsg("Popup blocked! Please allow popups for Google Authenticated flow.");
    }
  };

  // Demo standard pre-sets for quick evaluation
  const demoAccounts = [
    {
      id: "user-student",
      email: "lincolnflores223@gmail.com",
      password: "demo123",
      name: "Lincoln Flores",
      role: "Member",
      desc: "Student in comm-ai, Admin in comm-saas, Owner in comm-yoga. Tests multi-workspace roles.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      id: "user-creator",
      email: "creator@example.com",
      password: "demo123",
      name: "Alex Rivera",
      role: "Community Owner",
      desc: "Owner with full access to billing, courses, and settings.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    },
    {
      id: "user-instructor",
      email: "instructor@example.com",
      password: "demo123",
      name: "Michael Torres",
      role: "Instructor",
      desc: "Teaches courses, grades assignments, views analytics.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    },
    {
      id: "user-mod",
      email: "moderator@example.com",
      password: "demo123",
      name: "Sarah Chen",
      role: "Moderator",
      desc: "Moderates community, manages members and content.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      id: "user-admin",
      email: "admin@example.com",
      password: "admin123",
      name: "Platform Admin",
      role: "Super Admin",
      desc: "Full platform control, all workspaces, user management.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    }
  ];

  // Quick action for demo account login
  const handleQuickDemoLogin = async (demo: typeof demoAccounts[0]) => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demo.email, password: demo.password })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }
      
      setSuccessMsg(`Logged in successfully as ${demo.name}!`);
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 700);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during Demo connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit standard auth (login or register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = isLogin
      ? { email, password }
      : { email, fullName, username, password, bio, avatarUrl };

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed. Check your coordinates.");
      }

      setSuccessMsg(isLogin ? "Logged in successfully!" : "Account registered successfully!");
      
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 800);

    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans" id="auth-portal">
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Standard Credentials Form */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-sm md:col-span-7 space-y-6">
          <div className="text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold inline-flex items-center justify-center shadow-md text-xl mb-4">
              S
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-display tracking-tight">
              {isLogin ? "Welcome back to skool.SaaS" : "Create your student account"}
            </h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {isLogin ? "Sign in to access your course syllabus, community chats, and tracking matrices." : "Get a customized dashboard account, earn participation XP level-ups, and enroll in groups."}
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-xs text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Premium Google Auth Integration Trigger */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 border border-[#D5D9E2] rounded-xl text-xs transition duration-150 shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.99] transform"
              id="google-signin-btn"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>{isLogin ? "Sign in with Google Account" : "Sign up with Google Account"}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-150"></div>
              <span className="flex-shrink mx-4 text-gray-450 text-[9px] uppercase font-bold tracking-widest font-mono">or continue with email credentials</span>
              <div className="flex-grow border-t border-gray-150"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Coordinates</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-950 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Username Handle</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 w-4 h-4 text-xs font-semibold font-mono text-gray-400 leading-none">@</span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="johncode"
                        className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-950 font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Avatar Photo Link (Optional)</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-950 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brief bio (Introduction)</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="I am passionate about SaaS growth patterns..."
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-950 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Security Key (Password)</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-gray-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-gray-450 hover:text-gray-700 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing account details...
                </>
              ) : (
                <>
                  {isLogin ? "Authenticate credentials" : "Create student account now"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-gray-100 pt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg("");
              }}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-805 hover:underline transition"
            >
              {isLogin ? "Need a dynamic sandbox account? Create one" : "Already registered? Sign in here"}
            </button>
          </div>
        </div>

        {/* Right Side: Quick Evaluation Demo Accounts (Very polished sandbox assistant) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-gradient-to-r from-indigo-950 to-slate-900 text-indigo-100 rounded-3xl p-6 border border-indigo-900/30">
            <span className="text-[9px] uppercase font-mono bg-indigo-800/40 text-indigo-300 border border-indigo-700/30 px-2.5 py-1 rounded-full font-bold">
              ⚡ Evaluation Assist
            </span>
            <h3 className="text-sm font-bold text-white mt-3">High-signal multi-tenant testing</h3>
            <p className="text-[11px] text-indigo-200 mt-2 leading-relaxed">
              Skip registration! Evaluate all levels of the multi-tenant system by logging in as any preloaded persona below. Experience different access locks, MRR charts, or full super admin controls with 1-click.
            </p>
          </div>

          <div className="space-y-3">
            <span className="block text-[9.5px] font-bold text-gray-400 uppercase tracking-widest font-mono">
              Preseeded Sandbox Personas
            </span>
            
            {demoAccounts.map((demo) => (
              <button
                key={demo.id}
                onClick={() => handleQuickDemoLogin(demo)}
                disabled={isLoading}
                className="w-full bg-white border border-[#E5E7EB] rounded-2.5xl p-4 text-left shadow-sm hover:border-indigo-300 hover:shadow-sm transition duration-150 flex items-start gap-3.5 disabled:opacity-50 cursor-pointer group"
              >
                <img
                  src={demo.avatar}
                  alt={demo.name}
                  className="w-10 h-10 rounded-full border object-cover shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-700 transition leading-tight">
                      {demo.name}
                    </span>
                    <span className="text-[8px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 font-mono uppercase font-bold tracking-wider leading-none">
                      {demo.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{demo.email}</p>
                  <p className="text-[10.5px] text-gray-500 mt-2 leading-relaxed">{demo.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
