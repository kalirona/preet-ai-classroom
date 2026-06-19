import React, { useState } from "react";
import { Community, User, WorkspaceRole, PlatformRole } from "../types";
import { 
  Settings, Sliders, ShieldCheck, Mail, Link2, Award, Clock, Users, Database, Sparkles, Check, 
  Palette, Shield, CreditCard, ChevronRight, PlayCircle, PlusCircle, Trash, RefreshCw, AlertCircle,
  User as UserIcon, Bell, Moon, Globe
} from "lucide-react";

interface SettingsViewProps {
  currentUser: User | null;
  activeCommunity: Community | null;
  onUpdateCommunity: (fields: Partial<Community>) => Promise<boolean>;
  wsRole: string;
  onUpdateUser?: (user: User) => void;
  onTabChange?: (tab: string) => void;
  initialSubTab?: string;
}

export default function SettingsView({ currentUser, activeCommunity, onUpdateCommunity, wsRole, onUpdateUser, onTabChange, initialSubTab }: SettingsViewProps) {
  const isOwner = wsRole === WorkspaceRole.OWNER;

  const ownerTabs = [
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

  const userTabs = [
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "account", name: "Account", icon: Shield },
  ];

  const tabs = isOwner ? ownerTabs : userTabs;
  const defaultTab = isOwner ? "general" : "profile";
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab && userTabs.some(t => t.id === initialSubTab) ? initialSubTab : defaultTab);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General States (workspace)
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

  // User-level profile state
  const [userName, setUserName] = useState(currentUser?.fullName || "");
  const [userBio, setUserBio] = useState("");
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [themePref, setThemePref] = useState("light");

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
          {isOwner ? (
            <>
              <h3 className="text-lg font-semibold text-slate-900">Workspace Settings</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">Manage your community branding, membership, and workspace configuration.</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-slate-900">My Settings</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">Manage your profile, notifications, and appearance preferences.</p>
            </>
          )}
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

      {/* Settings panel */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">

        {isOwner ? (
          <>
            {/* Owner workspace settings */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs bg-indigo-50 px-2 py-0.5 rounded text-indigo-700 font-bold border border-indigo-100">
                  Active community: {activeCommunity?.name}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {ownerTabs.find(t => t.id === activeSubTab)?.name}
                </h3>
              </div>
              
              {activeSubTab !== "courses" && activeSubTab !== "team" && (
                <button
                  onClick={handleSaveGeneralSettings}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? "Saving..." : saveSuccess ? "Saved" : "Save Changes"}
                </button>
              )}
            </div>

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
                        style={{ backgroundColor: color.value === "indigo-600" ? "#4F46E5" : color.value === "emerald-600" ? "#10B981" : color.value === "blue-700" ? "#2563EB" : color.value === "rose-600" ? "#E11D48" : color.value === "amber-600" ? "#D97706" : "#6B7280" }}
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
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Membership & Plans</h4>
                  <p className="text-sm text-slate-400">Set up price tiering, subscription logic, and trial period variables.</p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-800 block">Require Paid Subscription to join</span>
                    <p className="text-sm text-gray-500 mt-0.5">Students must pay before viewing community feed or course content.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPaidJoint}
                    onChange={(e) => setIsPaidJoint(e.target.checked)}
                    className="w-4.5 h-4.5 accent-indigo-600 cursor-pointer"
                  />
                </div>

                {isPaidJoint && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Monthly subscription price (USD)</label>
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 px-3 py-2">
                        <span className="text-gray-400 font-medium mr-1">$</span>
                        <input
                          type="number"
                          value={subPrice}
                          onChange={(e) => setSubPrice(Number(e.target.value))}
                          className="w-full bg-transparent border-none text-sm text-slate-900 focus:outline-none font-mono"
                        />
                        <span className="text-slate-400 text-sm">/month</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Trial period</label>
                      <select
                        value={trialDays}
                        onChange={(e) => setTrialDays(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-xl px-2.5 py-2.5 text-sm text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value={0}>No free trial</option>
                        <option value={7}>7-day trial</option>
                        <option value={14}>14-day trial</option>
                        <option value={30}>30-day trial</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSubTab === "courses" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Course unlock & certificates</h4>
                  <p className="text-sm text-slate-400">Set rules for drip lesson distribution, completion conditions, and certificate generation.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-800 block">Drip Content distribution</span>
                      <p className="text-sm text-gray-500 mt-0.5">Modules unlock dynamically based on time intervals after enrollment.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={dripEnabled}
                      onChange={(e) => setDripEnabled(e.target.checked)}
                      className="w-4.5 h-4.5 accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {dripEnabled && (
                    <div className="pl-4 border-l-2 border-indigo-200 animate-in slide-in-from-left duration-150">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Days between module unlocks</label>
                      <input
                        type="number"
                        value={dripIntervalDays}
                        onChange={(e) => setDripIntervalDays(Number(e.target.value))}
                        className="w-32 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-800 block">Student Certificates</span>
                      <p className="text-sm text-gray-500 mt-0.5">Students receive a completion certificate when all lessons are completed.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={provideCertificates}
                      onChange={(e) => setProvideCertificates(e.target.checked)}
                      className="w-4.5 h-4.5 accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "community" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Feed channels</h4>
                  <p className="text-sm text-slate-400">Add sidebar discussion tags and restrict posting roles.</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">Active channels</label>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto border border-gray-100 p-3 rounded-2xl bg-gray-50/40">
                    {communityChannels.map((c) => (
                      <div key={c.id} className="flex justify-between items-center bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl text-sm">
                        <span className="font-medium text-slate-800"># {c.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded font-medium">Role: {c.role}</span>
                          <button onClick={() => handleRemoveChannel(c.id)} className="text-gray-400 hover:text-red-500 p-1 cursor-pointer">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. feedback, showcase"
                      value={newChanName}
                      onChange={(e) => setNewChanName(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddChannel}
                      className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-indigo-700 text-sm font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "gamification" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">XP settings</h4>
                  <p className="text-sm text-slate-400">Configure experience points for community engagement.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">XP per like</label>
                    <input
                      type="number"
                      value={xpPerLike}
                      onChange={(e) => setXpPerLike(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-center font-mono focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">XP per comment</label>
                    <input
                      type="number"
                      value={xpPerComment}
                      onChange={(e) => setXpPerComment(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-center font-mono focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">XP per post</label>
                    <input
                      type="number"
                      value={xpPerPost}
                      onChange={(e) => setXpPerPost(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-center font-mono focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "integrations" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Payment settings</h4>
                  <p className="text-sm text-slate-400">Configure Stripe and webhook endpoints.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stripe secret key</label>
                    <input
                      type="password"
                      value={stripeLiveKey}
                      onChange={(e) => setStripeLiveKey(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Webhook URL</label>
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "email" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Email settings</h4>
                  <p className="text-sm text-slate-400">Configure SMTP for sending notifications.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sender email</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeSubTab === "security" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Security & privacy</h4>
                  <p className="text-sm text-slate-400">Manage 2FA and review active sessions.</p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-800 block">Enforce 2FA</span>
                    <p className="text-sm text-gray-400 mt-0.5">Require two-factor authentication for creator payouts.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="w-4.5 h-4.5 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Active sessions</label>
                  <div className="divide-y divide-gray-100 bg-gray-50/35 border border-gray-100 rounded-2xl p-3 space-y-2.5">
                    {sessionLogs.map((log, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="font-mono text-sm text-slate-800">IP: {log.ip}</span>
                        <div className="text-right">
                          <span className="text-gray-500 block text-xs">{log.device}</span>
                          <span className="text-gray-400 text-xs">{log.time}</span>
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
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Team roles</h4>
                  <p className="text-sm text-slate-400">Invite colleagues as instructors or moderators.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {teamInvites.map((inv, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-2 bg-slate-50/60 rounded-xl border border-gray-100 text-sm">
                        <div>
                          <span className="text-slate-800 font-medium block">{inv.email}</span>
                          <span className="text-xs text-gray-400">Role: {inv.assignedRole}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          inv.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Invite by email</label>
                      <input
                        type="email"
                        placeholder="colleague@example.com"
                        value={newTeamEmail}
                        onChange={(e) => setNewTeamEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                      <select
                        value={newTeamRole}
                        onChange={(e) => setNewTeamRole(e.target.value)}
                        className="border border-gray-200 rounded-xl px-2 py-2 text-sm text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="Moderator">Moderator</option>
                        <option value="Instructor">Instructor</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTeamInvite}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center transition cursor-pointer"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Non-owner user-level settings */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <span className="text-xs bg-indigo-50 px-2 py-0.5 rounded text-indigo-700 font-bold border border-indigo-100">
                My Preferences
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {userTabs.find(t => t.id === activeSubTab)?.name}
              </h3>
            </div>

            {activeSubTab === "profile" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Profile</h4>
                  <p className="text-sm text-slate-400">Update your name and bio visible to the community.</p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 ring-2 ring-slate-100 shrink-0">
                    <img
                      src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                    Change photo
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={currentUser?.email || ""}
                      disabled
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 bg-slate-50 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                  <textarea
                    rows={3}
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    placeholder="Tell the community about yourself..."
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition cursor-pointer">
                    Save Profile
                  </button>
                </div>
              </div>
            )}

            {activeSubTab === "notifications" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Notification preferences</h4>
                  <p className="text-sm text-slate-400">Choose which activities trigger notifications.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { id: "likes", label: "Someone likes my post", state: notifyLikes, set: setNotifyLikes },
                    { id: "comments", label: "Someone comments on my post", state: notifyComments, set: setNotifyComments },
                    { id: "mentions", label: "Someone mentions me", state: notifyMentions, set: setNotifyMentions },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <span className="text-sm font-medium text-slate-800">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={(e) => item.set(e.target.checked)}
                        className="w-4.5 h-4.5 accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === "appearance" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Appearance</h4>
                  <p className="text-sm text-slate-400">Customize the look and feel of your experience.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Theme preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Light", icon: Sun, desc: "Clean light theme" },
                      { id: "dark", label: "Dark", icon: Moon, desc: "Dark mode" },
                      { id: "system", label: "System", icon: Globe, desc: "Follow device" },
                    ].map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setThemePref(opt.id)}
                          className={`p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                            themePref === opt.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-2 ${themePref === opt.id ? "text-indigo-600" : "text-slate-400"}`} />
                          <div className="text-sm font-medium text-slate-800">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === "account" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-1">Account</h4>
                  <p className="text-sm text-slate-400">Manage your account security and password.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current password</label>
                    <input
                      type="password"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
                    <input
                      type="password"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition cursor-pointer">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

function Sun(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
