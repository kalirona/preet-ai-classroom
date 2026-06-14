import React, { useState } from "react";
import { Community, User, UserRole } from "../types";
import { 
  Settings, Sliders, ShieldCheck, Mail, Link2, Award, Clock, Users, Database, Sparkles, Check, 
  Palette, Shield, CreditCard, ChevronRight, PlayCircle, PlusCircle, Trash, RefreshCw, AlertCircle
} from "lucide-react";

interface SettingsViewProps {
  currentUser: User | null;
  activeCommunity: Community | null;
  onUpdateCommunity: (fields: Partial<Community>) => Promise<boolean>;
}

export default function SettingsView({ currentUser, activeCommunity, onUpdateCommunity }: SettingsViewProps) {
  // A to I setting navigation
  const tabs = [
    { id: "general", name: "Community branding", icon: Palette },
    { id: "membership", name: "Membership & Plans", icon: CreditCard },
    { id: "courses", name: "Course unlock & certificates", icon: PlayCircle },
    { id: "community", name: "Feed channels", icon: Sliders },
    { id: "gamification", name: "XP settings", icon: Award },
    { id: "integrations", name: "Payment settings", icon: Link2 },
    { id: "email", name: "Email settings", icon: Mail },
    { id: "security", name: "Security & privacy", icon: ShieldCheck },
    { id: "team", name: "Team roles", icon: Users },
  ];

  const [activeSubTab, setActiveSubTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General States
  const [commName, setCommName] = useState(activeCommunity?.name || "The AI Builders Collective");
  const [commDesc, setCommDesc] = useState(activeCommunity?.description || "");
  const [commSubdomain, setCommSubdomain] = useState(activeCommunity?.subdomain || "");
  const [commLogo, setCommLogo] = useState(activeCommunity?.branding?.logoUrl || "⚡");
  const [commPrimary, setCommPrimary] = useState(activeCommunity?.branding?.primaryColor || "indigo-600");
  const [customDomain, setCustomDomain] = useState(activeCommunity?.branding?.domain || "");

  // Membership States
  const [isPaidJoint, setIsPaidJoint] = useState(activeCommunity?.isPremium || false);
  const [subPrice, setSubPrice] = useState(activeCommunity?.priceMonthly || 49);
  const [trialDays, setTrialDays] = useState(7);

  // Course completion / drip content states
  const [dripEnabled, setDripEnabled] = useState(true);
  const [dripIntervalDays, setDripIntervalDays] = useState(7);
  const [provideCertificates, setProvideCertificates] = useState(true);

  // Channels state
  const [communityChannels, setCommunityChannels] = useState([
    { id: "chan-1", name: "general-discussions", role: "Student" },
    { id: "chan-2", name: "announcements", role: "Moderator" },
    { id: "chan-3", name: "showcase-work", role: "Student" }
  ]);
  const [newChanName, setNewChanName] = useState("");

  // Gamification rules
  const [xpPerLike, setXpPerLike] = useState(5);
  const [xpPerComment, setXpPerComment] = useState(10);
  const [xpPerPost, setXpPerPost] = useState(15);

  // Integration credentials
  const [stripeLiveKey, setStripeLiveKey] = useState("sk_live_51Mpw92...");
  const [webhookUrl, setWebhookUrl] = useState("https://api.my-applet.com/callbacks/stripe");

  // Email SMTP
  const [smtpHost, setSmtpHost] = useState("smtp.resend.com");
  const [smtpPort, setSmtpPort] = useState(465);
  const [senderEmail, setSenderEmail] = useState("notifications@ai-builders.com");

  // Security logs mock
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const sessionLogs = [
    { ip: "64.233.160.1", device: "Chrome / macOS (Active IP)", time: "Just now" },
    { ip: "66.249.66.12", device: "Safari / iOS", time: "2 hours ago" }
  ];

  // Team Assignment State
  const [teamInvites, setTeamInvites] = useState([
    { email: "sarah@example.com", assignedRole: "Moderator", status: "Active" },
    { email: "mike@example.com", assignedRole: "Instructor", status: "Pending" }
  ]);
  const [newTeamEmail, setNewTeamEmail] = useState("");
  const [newTeamRole, setNewTeamRole] = useState("Moderator");

  // Submit master update to API
  const handleSaveGeneralSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    const outcome = await onUpdateCommunity({
      name: commName,
      description: commDesc,
      subdomain: commSubdomain,
      isPremium: isPaidJoint,
      priceMonthly: subPrice,
      branding: {
        logoUrl: commLogo,
        primaryColor: commPrimary,
        secondaryColor: "slate-900",
        accentColor: "indigo-400",
        bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
        domain: customDomain
      }
    });

    setIsSaving(false);
    if (outcome) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleAddChannel = () => {
    if (!newChanName.trim()) return;
    setCommunityChannels([
      ...communityChannels,
      { id: `chan-${Date.now()}`, name: newChanName.replace(/\s+/g, "-").toLowerCase(), role: "Student" }
    ]);
    setNewChanName("");
  };

  const handleRemoveChannel = (id: string) => {
    setCommunityChannels(communityChannels.filter(c => c.id !== id));
  };

  const handleAddTeamInvite = () => {
    if (!newTeamEmail.trim()) return;
    setTeamInvites([...teamInvites, { email: newTeamEmail, assignedRole: newTeamRole, status: "Pending" }]);
    setNewTeamEmail("");
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#F8F9FB] overflow-hidden" id="deep-settings-dashboard">
      
      {/* Settings left tab navigator */}
      <div className="w-full lg:w-72 border-r border-slate-200/80 bg-white flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-200/80">
          <h3 className="text-lg font-semibold text-slate-900">Platform Admin</h3>
          <h2 className="text-lg font-bold text-slate-900 font-display mt-0.5">SaaS System parameters</h2>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Multi-tenant configurations supporting enterprise white-label variables.
          </p>
        </div>
        
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((t) => {
            const isSel = t.id === activeSubTab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-left transition cursor-pointer ${
                  isSel 
                    ? "bg-indigo-50/70 border border-indigo-100/60 text-indigo-900" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isSel ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{t.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings parameter panel cards */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* Active view header metadata */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs bg-indigo-50 px-2 py-0.5 rounded text-indigo-700 font-bold border border-indigo-100">
              Active community: {activeCommunity?.name}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              {tabs.find(t => t.id === activeSubTab)?.name} Configuration Card
            </h3>
          </div>
          
          <button
            onClick={handleSaveGeneralSettings}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            {isSaving ? "Publishing updates..." : saveSuccess ? "🚀 System Swapped" : "Save Configurations"}
          </button>
        </div>

        {/* Content Tabs switches */}
        {activeSubTab === "general" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
            <div>
              <h4 className="text-sm font-medium text-slate-600 mb-1">Community branding</h4>
              <p className="text-sm text-slate-400">Change your community name, URL handles, theme colors, and custom domains.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Community name</label>
                <input
                  type="text"
                  value={commName}
                  onChange={(e) => setCommName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-3 py-2.5">
                  <input
                    type="text"
                    value={commSubdomain}
                    onChange={(e) => setCommSubdomain(e.target.value)}
                    className="w-full bg-transparent border-none text-sm text-slate-900 focus:outline-none"
                  />
                  <span className="text-sm text-slate-400 font-mono">.skool.sh</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branding Icon</label>
                <input
                  type="text"
                  value={commLogo}
                  onChange={(e) => setCommLogo(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Theme Accent</label>
                <select
                  value={commPrimary}
                  onChange={(e) => setCommPrimary(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-2.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                >
                  <option value="indigo-600">Indigo</option>
                  <option value="emerald-600">Emerald</option>
                  <option value="blue-700">Blue</option>
                  <option value="rose-600">Rose</option>
                  <option value="amber-600">Amber</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom Domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="your-custom.skool.io"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5">
              <h5 className="text-sm font-semibold text-slate-900 mb-3">Theme Colors</h5>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { name: "Indigo", value: "indigo-600" },
                  { name: "Emerald", value: "emerald-600" },
                  { name: "Blue", value: "blue-700" },
                  { name: "Rose", value: "rose-600" },
                  { name: "Amber", value: "amber-600" }
                ].map(color => (
                  <button
                    key={color.name}
                    onClick={() => setCommPrimary(color.value)}
                    className={`h-10 rounded-lg border-2 transition-all ${commPrimary === color.value ? "border-slate-900 scale-105" : "border-slate-200 hover:border-slate-300"}`}
                    style={{ backgroundColor: color.value === "indigo-600" ? "#4F46E5" : 
                                           color.value === "emerald-600" ? "#10B981" :
                                           color.value === "blue-700" ? "#2563EB" :
                                           color.value === "rose-600" ? "#E11D48" :
                                           color.value === "amber-600" ? "#D97706" : "#6B7280" }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={commDesc}
                onChange={(e) => setCommDesc(e.target.value)}
                placeholder="Brief description of your community..."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {activeSubTab === "membership" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono mb-1">B. Membership matrix & Plans</h4>
              <p className="text-[11px] text-slate-400">Set up price tiering structures, subscription logic, and trial period variables.</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Require Paid Subscription to join</span>
                <p className="text-[10px] text-gray-500 mt-0.5">Students must execute payment checkout before viewing community feed or syllabus files.</p>
              </div>
              <input
                type="checkbox"
                checked={isPaidJoint}
                onChange={(e) => setIsPaidJoint(e.target.checked)}
                className="w-4.5 h-4.5 accent-indigo-650 cursor-pointer"
              />
            </div>

            {isPaidJoint && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SaaS Monthly Subscription price (USD)</label>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 px-3 py-2">
                    <span className="text-gray-400 font-bold mr-1">$</span>
                    <input
                      type="number"
                      value={subPrice}
                      onChange={(e) => setSubPrice(Number(e.target.value))}
                      className="w-full bg-transparent border-none text-xs text-gray-950 focus:outline-none font-mono"
                    />
                    <span className="text-slate-400 text-[10px] uppercase font-mono">/ Month</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">simulated checkout Trial Limits</label>
                  <select
                    value={trialDays}
                    onChange={(e) => setTrialDays(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-2.5 py-2.5 text-xs text-gray-950 focus:outline-none cursor-pointer"
                  >
                    <option value={0}>No free trials (charge instantly)</option>
                    <option value={7}>7-day trial limit</option>
                    <option value={14}>14-day trial limit</option>
                    <option value={30}>30-day extended support</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === "courses" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono mb-1">C. Syllabus lock and certificate triggers</h4>
              <p className="text-[11px] text-slate-400">Set rules for drip lesson distributions, final course completion conditions, and certificate generations.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Drip Content distribution (Module by Module)</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">Subsequent curriculum modules unlock dynamically based on registration duration intervals.</p>
                </div>
                <input
                  type="checkbox"
                  checked={dripEnabled}
                  onChange={(e) => setDripEnabled(e.target.checked)}
                  className="w-4.5 h-4.5 accent-indigo-650 cursor-pointer"
                />
              </div>

              {dripEnabled && (
                <div className="pl-4 border-l-2 border-indigo-200 animate-in slide-in-from-left duration-150">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Drip unlock interval (Days per Module)</label>
                  <input
                    type="number"
                    value={dripIntervalDays}
                    onChange={(e) => setDripIntervalDays(Number(e.target.value))}
                    className="w-32 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Deploy dynamic PDF Student Certificates</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">Students automatically receive an official completion credentials cert when all videos are cleared.</p>
                </div>
                <input
                  type="checkbox"
                  checked={provideCertificates}
                  onChange={(e) => setProvideCertificates(e.target.checked)}
                  className="w-4.5 h-4.5 accent-indigo-650 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "community" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono mb-1">D. Feed space channel routing</h4>
              <p className="text-[11px] text-slate-400">Add new sidebar discussion tags and restrict posting roles.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700">Active tags/channels registry</label>
              <div className="space-y-2.5 max-h-48 overflow-y-auto border border-gray-100 p-3 rounded-2xl bg-gray-55/40">
                {communityChannels.map((c) => (
                  <div key={c.id} className="flex justify-between items-center bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs">
                    <span className="font-bold text-gray-800"># {c.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] rounded font-mono font-medium">Allows: {c.role}</span>
                      <button 
                        onClick={() => handleRemoveChannel(c.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. feedback-vault, developer-snaps"
                  value={newChanName}
                  onChange={(e) => setNewChanName(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddChannel}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add tag
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "gamification" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono mb-1">E. Experience Point (XP) Matrix</h4>
              <p className="text-[11px] text-slate-400">Set up community participation metrics to accelerate engagement pacing automatically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">XP per like receipt</label>
                <input
                  type="number"
                  value={xpPerLike}
                  onChange={(e) => setXpPerLike(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-center font-mono focus:ring-1 focus:ring-indigo-550"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">XP per discussion reply</label>
                <input
                  type="number"
                  value={xpPerComment}
                  onChange={(e) => setXpPerComment(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-center font-mono focus:ring-1 focus:ring-indigo-550"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">XP per active post</label>
                <input
                  type="number"
                  value={xpPerPost}
                  onChange={(e) => setXpPerPost(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-center font-mono focus:ring-1 focus:ring-indigo-550"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "integrations" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono mb-1">F. Payment processor bindings</h4>
              <p className="text-[11px] text-slate-400">Stripe configurations for White-label domains and webhook dispatch hooks.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Stripe secret key credential</label>
                <input
                  type="password"
                  value={stripeLiveKey}
                  onChange={(e) => setStripeLiveKey(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 font-mono focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Outgoing active registration Webhooks Callback URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 font-mono focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">A POST payload will be dispatched to this webhook endpoint on registration checkout failures.</span>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "email" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono mb-1">G. SMTP resend & System Email configs</h4>
              <p className="text-[11px] text-slate-400">Configure email integrations so notifications arrive in inbox folders instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <label className="block text-xs font-bold text-gray-700 mb-1">SMTP Outgoing Host Server</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-gray-700 mb-1">SMTP Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Default transmitter From Coordinates</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {activeSubTab === "security" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono mb-1">H. Session privacy logs & 2FA checks</h4>
              <p className="text-[11px] text-slate-400">Audits current security vectors, session telemetry logs, and developer credentials.</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Enforce 2-Factor authentication (2FA)</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Prompt administrative credentials keys validation on creator payout requests.</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="w-4.5 h-4.5 accent-indigo-650 cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">Active account sessions IP log</label>
              <div className="divide-y divide-gray-100 bg-gray-55/35 border border-gray-100 rounded-2xl p-3 space-y-2.5">
                {sessionLogs.map((log, i) => (
                  <div key={i} className="flex justify-between text-xs py-1">
                    <div className="font-mono text-[11px] text-gray-800">
                      📟 IP: {log.ip}
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block text-[10px]">{log.device}</span>
                      <span className="text-gray-400 text-[9px]">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "team" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest font-mono mb-1">I. Team roles editor</h4>
              <p className="text-[11px] text-slate-400">Invite colleagues to take over instructor or moderator privileges in your workspace.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {teamInvites.map((inv, idx) => (
                  <div key={idx} className="flex justify-between items-center px-4 py-2 bg-slate-50/60 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-900 font-bold block">{inv.email}</span>
                      <span className="text-[10px] text-gray-400 font-mono">Assigned Role: {inv.assignedRole}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded ${
                      inv.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Invite team email</label>
                  <input
                    type="email"
                    placeholder="teammember@domain.com"
                    value={newTeamEmail}
                    onChange={(e) => setNewTeamEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Role</label>
                  <select
                    value={newTeamRole}
                    onChange={(e) => setNewTeamRole(e.target.value)}
                    className="border border-gray-200 rounded-xl px-2 py-2 text-xs text-gray-950 focus:outline-none cursor-pointer"
                  >
                    <option value="Moderator">Moderator</option>
                    <option value="Instructor">Instructor</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddTeamInvite}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center transition cursor-pointer"
                >
                  Invite
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
