import React, { useState } from "react";
import { Community, User, PlatformRole, WorkspaceRole } from "../types";
import { 
  MessageSquare, BookOpen, Calendar, Trophy, BarChart3, Star, Layers, Sparkles, X, ChevronDown, 
  Menu, Info, Users, ShieldAlert, LogOut, FileText, Settings, Bookmark, Bell, ShoppingCart, UserCheck, ChevronLeft, ChevronRight, HelpCircle, Shield, Database,
  LayoutDashboard, Receipt, Repeat, Ticket, HeartHandshake, ShieldCheck, ScrollText, Flag,
  Globe, DollarSign, CreditCard, Edit
} from "lucide-react";

interface SidebarProps {
  user: User | null;
  communities: Community[];
  activeCommunityId: string;
  onSelectCommunity: (id: string) => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
  onOpenCreateCommunity?: () => void;
}

export default function Sidebar({
  user,
  communities,
  activeCommunityId,
  onSelectCommunity,
  activeTab,
  onChangeTab,
  isMobileOpen = false,
  onClose = () => {},
  onOpenCreateCommunity = () => {},
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  const activeCommunity = communities.find(c => c.id === activeCommunityId) || null;

  // Resolve platform-level and workspace-level roles
  const pfRole = user?.platformRole || PlatformRole.USER;
  const wsRole = user?.platformRole === PlatformRole.SUPER_ADMIN 
    ? WorkspaceRole.OWNER 
    : (user?.workspaceRoles?.[activeCommunityId] || WorkspaceRole.MEMBER);

  const isGlobalSuperAdmin = pfRole === PlatformRole.SUPER_ADMIN;
  const isWsOwner = wsRole === WorkspaceRole.OWNER;
  const isWsAdmin = wsRole === WorkspaceRole.ADMIN;
  const isWsInstructor = wsRole === WorkspaceRole.INSTRUCTOR;
  const isWsModerator = wsRole === WorkspaceRole.MODERATOR;
  const isStudent = wsRole === WorkspaceRole.MEMBER;

  // Super Admin: Platform-only tabs (no workspace tabs)
  const platformNavigation = isGlobalSuperAdmin
    ? [
        { id: "superadmin", name: "Overview", icon: LayoutDashboard },
        { id: "workspaces", name: "Workspaces", icon: Globe },
        { id: "users", name: "Users", icon: Users },
        { id: "revenue", name: "Revenue", icon: DollarSign },
        { id: "payouts", name: "Payouts", icon: CreditCard },
        { id: "analytics", name: "Analytics", icon: BarChart3 },
        { id: "security", name: "Security Center", icon: Shield },
        { id: "logs", name: "Audit Logs", icon: ScrollText },
        { id: "settings", name: "Settings", icon: Settings },
      ]
    : [];

  // Creator (Owner): Full workspace control
  const creatorNavigation = (isWsOwner || isGlobalSuperAdmin)
    ? [
        { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
        { id: "community", name: "Community", icon: MessageSquare },
        { id: "classroom", name: "Classroom", icon: BookOpen },
        { id: "course-studio", name: "Course Studio", icon: Edit },
        { id: "students", name: "Students", icon: Users },
        { id: "calendar", name: "Calendar", icon: Calendar },
        { id: "members", name: "Members", icon: Users },
        { id: "resources", name: "Resources", icon: FileText },
        { id: "audit_logs_tab", name: "Audit Logs", icon: ScrollText },
        { id: "monetization", name: "Monetization", icon: DollarSign },
        { id: "sales", name: "Sales", icon: Receipt },
        { id: "subscriptions", name: "Subscriptions", icon: Repeat },
        { id: "coupons", name: "Coupons", icon: Ticket },
        { id: "payouts", name: "Payouts", icon: CreditCard },
        { id: "settings", name: "Settings", icon: Settings },
        { id: "chat", name: "Chat", icon: MessageSquare },
        { id: "support", name: "Support", icon: HelpCircle },
      ]
    : [];

  // Admin: Community manager
  const adminNavigation = isWsAdmin
    ? [
        { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
        { id: "community", name: "Community", icon: MessageSquare },
        { id: "classroom", name: "Classroom", icon: BookOpen },
        { id: "course-studio", name: "Course Studio", icon: Edit },
        { id: "students", name: "Students", icon: Users },
        { id: "members", name: "Members", icon: Users },
        { id: "calendar", name: "Calendar", icon: Calendar },
        { id: "resources", name: "Resources", icon: FileText },
        { id: "audit_logs_tab", name: "Audit Logs", icon: ScrollText },
        { id: "moderation", name: "Moderation", icon: ShieldCheck },
        { id: "chat", name: "Chat", icon: MessageSquare },
        { id: "support", name: "Support", icon: HelpCircle },
      ]
    : [];

  // Instructor: Teacher only
  const instructorNavigation = isWsInstructor
    ? [
        { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
        { id: "community", name: "Feed", icon: MessageSquare },
        { id: "classroom", name: "Classroom", icon: BookOpen },
        { id: "course-studio", name: "Course Studio", icon: Edit },
        { id: "students", name: "Students", icon: Users },
        { id: "calendar", name: "Calendar", icon: Calendar },
        { id: "resources", name: "Resources", icon: FileText },
        { id: "chat", name: "Chat", icon: MessageSquare },
        { id: "support", name: "Support", icon: HelpCircle },
      ]
    : [];

  // Moderator: Moderation center
  const moderatorNavigation = isWsModerator
    ? [
        { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
        { id: "community", name: "Community", icon: MessageSquare },
        { id: "members", name: "Members", icon: Users },
        { id: "moderation", name: "Moderation", icon: ShieldCheck },
        { id: "reports", name: "Reports", icon: Flag },
        { id: "chat", name: "Chat", icon: MessageSquare },
        { id: "support", name: "Support", icon: HelpCircle },
        { id: "calendar", name: "Calendar", icon: Calendar },
        { id: "resources", name: "Resources", icon: FileText },
      ]
    : [];

  // Student (Member): Learning focused
  const studentNavigation = isStudent
    ? [
        { id: "feed", name: "Feed", icon: LayoutDashboard },
        { id: "classroom", name: "Classroom", icon: BookOpen },
        { id: "calendar", name: "Calendar", icon: Calendar },
        { id: "resources", name: "Resources", icon: FileText },
        { id: "profile", name: "Profile", icon: UserCheck },
        { id: "chat", name: "Chat", icon: MessageSquare },
        { id: "support", name: "Support", icon: HelpCircle },
      ]
    : [];

  // Personal section (all roles)
  const personalNavigation = [
    { id: "notifications_tab", name: "Notifications", icon: Bell },
    { id: "saved", name: "Saved Posts", icon: Bookmark },
  ];

  // Calculations for dynamic XP
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const nextLevelXpBoundary = (level + 1) * 200;
  const currentLevelMinXp = level * 200;
  const xpEarnedInThisLevel = xp - currentLevelMinXp;
  const xpRequiredForThisLevel = nextLevelXpBoundary - currentLevelMinXp;
  const progressRatio = Math.min(100, Math.max(0, (xpEarnedInThisLevel / xpRequiredForThisLevel) * 100));

  const handleSelectSpace = (id: string) => {
    onSelectCommunity(id);
    setIsWorkspaceDropdownOpen(false);
  };

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-45 md:hidden transition-all duration-300"
          onClick={onClose}
          id="sidebar-mobile-backdrop"
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 md:z-auto bg-white border-r border-[#E5E7EB] flex flex-col h-full shrink-0 md:static transition-all duration-300 ${
          isCollapsed ? "w-[72px]" : "w-[260px]"
        } ${
          isMobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full md:translate-x-0"
        }`}
        id="app-sidebar"
      >
        
        {/* LOGO & Workspace Sweeper Block */}
        <div className="p-4 border-b border-[#E5E7EB] bg-gray-50/50 relative shrink-0">
          <div className="flex items-center justify-between gap-2.5">
            {!isCollapsed ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-650 flex items-center justify-center text-white font-bold text-sm">
                  S
                </div>
                <span className="font-bold text-gray-900 tracking-tight text-xs font-display flex items-center gap-1.5 selection:bg-indigo-100">
                  skool.SaaS
                  <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono uppercase font-black">PRO</span>
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center text-white font-bold text-sm mx-auto">
                S
              </div>
            )}

            {/* Sidebar collapse lever */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1 hover:bg-gray-150 rounded text-gray-400 hover:text-gray-600 transition"
              title={isCollapsed ? "Expand panel" : "Collapse panel"}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>

            {/* Mobile close trigger */}
            <button 
              onClick={onClose}
              className="md:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Compact Switcher Dropdown Popover */}
          <div className="mt-3 relative">
            <button
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className={`w-full flex items-center justify-between text-left p-2 rounded-xl text-xs font-semibold border transition ${
                isWorkspaceDropdownOpen 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-900" 
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
              id="workspace-switcher-action-btn"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-5 h-5 rounded-md bg-indigo-650 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  {activeCommunity?.branding?.logoUrl || "💡"}
                </div>
                {!isCollapsed && <span className="truncate">{activeCommunity?.name || "No space"}</span>}
              </div>
              {!isCollapsed && <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1 shrink-0" />}
            </button>

            {isWorkspaceDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 max-h-56 overflow-y-auto animate-in zoom-in-95 duration-100">
                <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest font-mono p-1">Active sharded spaces</span>
                {communities.filter(comm => isGlobalSuperAdmin || user?.joinedCommunities.includes(comm.id)).map((comm) => (
                  <button
                    key={comm.id}
                    onClick={() => handleSelectSpace(comm.id)}
                    className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg text-xs font-medium transition ${
                      comm.id === activeCommunityId 
                        ? "bg-indigo-50 text-indigo-900 font-bold" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs">{comm.branding?.logoUrl || "💡"}</span>
                      <span className="truncate">{comm.name}</span>
                    </div>
                    {comm.isPremium && (
                      <span className="text-[7.5px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-widest leading-none">
                        Paid
                      </span>
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-2.5 pt-2">
                  <button
                    onClick={() => {
                      setIsWorkspaceDropdownOpen(false);
                      onOpenCreateCommunity();
                    }}
                    className="w-full text-center py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] uppercase tracking-wider font-mono transition"
                  >
                    + Create community
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5" id="main-navigation-scroller">
          
          {/* MAIN NAVIGATION - Role-based */}
          {isGlobalSuperAdmin ? (
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="block text-[9px] font-bold uppercase text-gray-400 tracking-widest font-mono mb-1.5 px-3">
                  Platform
                </span>
              )}
              <nav className="space-y-0.5">
                {platformNavigation.map((m) => {
                  const isSel = activeTab === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onChangeTab(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                        isSel 
                          ? "bg-indigo-50/70 text-indigo-700 font-bold" 
                          : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      title={m.name}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isSel ? "text-indigo-650" : "text-gray-400"}`} />
                      {!isCollapsed && <span>{m.name}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          ) : isWsOwner ? (
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="block text-[9px] font-bold uppercase text-gray-400 tracking-widest font-mono mb-1.5 px-3">
                  Workspace
                </span>
              )}
              <nav className="space-y-0.5">
                {creatorNavigation.map((m) => {
                  const isSel = activeTab === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onChangeTab(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                        isSel 
                          ? "bg-indigo-50/70 text-indigo-700 font-bold" 
                          : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      title={m.name}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isSel ? "text-indigo-650" : "text-gray-400"}`} />
                      {!isCollapsed && <span>{m.name}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          ) : isWsAdmin ? (
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="block text-[9px] font-bold uppercase text-gray-400 tracking-widest font-mono mb-1.5 px-3">
                  Workspace
                </span>
              )}
              <nav className="space-y-0.5">
                {adminNavigation.map((m) => {
                  const isSel = activeTab === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onChangeTab(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                        isSel 
                          ? "bg-indigo-50/70 text-indigo-700 font-bold" 
                          : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      title={m.name}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isSel ? "text-indigo-650" : "text-gray-400"}`} />
                      {!isCollapsed && <span>{m.name}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          ) : isWsInstructor ? (
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="block text-[9px] font-bold uppercase text-gray-400 tracking-widest font-mono mb-1.5 px-3">
                  Teaching
                </span>
              )}
              <nav className="space-y-0.5">
                {instructorNavigation.map((m) => {
                  const isSel = activeTab === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onChangeTab(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                        isSel 
                          ? "bg-indigo-50/70 text-indigo-700 font-bold" 
                          : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      title={m.name}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isSel ? "text-indigo-650" : "text-gray-400"}`} />
                      {!isCollapsed && <span>{m.name}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          ) : isWsModerator ? (
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="block text-[9px] font-bold uppercase text-gray-400 tracking-widest font-mono mb-1.5 px-3">
                  Moderation
                </span>
              )}
              <nav className="space-y-0.5">
                {moderatorNavigation.map((m) => {
                  const isSel = activeTab === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onChangeTab(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                        isSel 
                          ? "bg-indigo-50/70 text-indigo-700 font-bold" 
                          : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      title={m.name}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isSel ? "text-indigo-650" : "text-gray-400"}`} />
                      {!isCollapsed && <span>{m.name}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          ) : (
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="block text-[9px] font-bold uppercase text-gray-400 tracking-widest font-mono mb-1.5 px-3">
                  Learning
                </span>
              )}
              <nav className="space-y-0.5">
                {studentNavigation.map((m) => {
                  const isSel = activeTab === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onChangeTab(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                        isSel 
                          ? "bg-indigo-50/70 text-indigo-700 font-bold" 
                          : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      title={m.name}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isSel ? "text-indigo-650" : "text-gray-400"}`} />
                      {!isCollapsed && <span>{m.name}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* PERSONAL - All roles except super admin */}
          {!isGlobalSuperAdmin && (
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="block text-[9px] font-bold uppercase text-gray-400 tracking-widest font-mono mb-1.5 px-3">
                  Personal
                </span>
              )}
              <nav className="space-y-0.5">
                {personalNavigation.map((m) => {
                  const isSel = activeTab === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onChangeTab(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                        isSel 
                          ? "bg-indigo-50/70 text-indigo-700 font-bold" 
                          : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      title={m.name}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isSel ? "text-indigo-650" : "text-gray-400"}`} />
                      {!isCollapsed && <span>{m.name}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* BOTTOM GAMIFICATION bento card */}
        {!isCollapsed ? (
          <div className="p-4 border-t border-gray-100 bg-gray-50/40 shrink-0">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase font-mono tracking-wider">Level {level} Creator</span>
                <span className="text-[10px] font-mono text-indigo-650 font-bold">{xp} XP</span>
              </div>
              
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${progressRatio}%` }} />
              </div>
              
              <div className="flex justify-between text-[8px] font-mono mt-1 text-gray-400">
                <span>Lvl {level}</span>
                <span>{xp}/{nextLevelXpBoundary} to {level + 1}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 border-t border-gray-100 text-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-650 font-bold flex items-center justify-center font-mono text-xs mx-auto" title={`Level ${level} (${xp} XP)`}>
              {level}
            </div>
          </div>
        )}

      </aside>
    </>
  );
}
