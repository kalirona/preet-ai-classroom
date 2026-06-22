import React, { useState, useEffect, useRef } from "react";
import { User, WorkspaceRole, PlatformRole, Notification } from "../types";
import { Bell, Trophy, ShieldCheck, Menu, LogOut, Settings, Palette, User as UserIcon, Plus, Search, Shield, Sparkles, Monitor, LayoutDashboard } from "lucide-react";

interface HeaderProps {
  user: User | null;
  onRoleChange: (role: string) => void;
  activeCommunity: any;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
  openOnboarding: () => void;
  openCreateCommunity: () => void;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
  onLogout?: () => void;
  platformMode?: boolean;
  onTogglePlatformMode?: () => void;
  previewWsRole?: string | null;
}

const roleLabel: Record<string, string> = {
  owner: "Creator",
  admin: "Admin",
  instructor: "Instructor",
  moderator: "Moderator",
  member: "Member",
  super_admin: "Super Admin",
};

const roleColor: Record<string, string> = {
  owner: "bg-emerald-100 text-emerald-700",
  admin: "bg-amber-100 text-amber-700",
  instructor: "bg-cyan-100 text-cyan-700",
  moderator: "bg-purple-100 text-purple-700",
  member: "bg-slate-100 text-slate-600",
  super_admin: "bg-red-100 text-red-700",
};

export default function Header({
  user,
  onRoleChange,
  activeCommunity,
  notifications,
  onMarkNotificationsRead,
  openOnboarding,
  openCreateCommunity,
  onTabChange,
  onToggleSidebar,
  onLogout,
  platformMode = false,
  onTogglePlatformMode,
  previewWsRole = null
}: HeaderProps) {
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayRole = previewWsRole
    ? previewWsRole
    : user?.platformRole === PlatformRole.SUPER_ADMIN
      ? "super_admin"
      : user?.workspaceRoles?.[activeCommunity?.id] || "member";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowBellMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-18 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 z-30 sticky top-0" id="app-header">
      {/* Left: Brand + Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          id="btn-mobile-sidebar-toggle"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shadow-sm text-base">
            {activeCommunity?.branding?.logoUrl || "⚡"}
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight flex items-center gap-2">
              {activeCommunity?.name || "My Community"}
              {activeCommunity?.isPremium && (
                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md">
                  Pro
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              {activeCommunity?.subdomain || "sandbox"}.yourapp.com
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Platform Mode Toggle (Super Admin only) */}
        {(user?.platformRole === PlatformRole.SUPER_ADMIN) && (
          <div className="relative group hidden sm:block">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => { if (platformMode && onTogglePlatformMode) onTogglePlatformMode(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  !platformMode
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Workspace
              </button>
              <button
                onClick={() => { if (!platformMode && onTogglePlatformMode) onTogglePlatformMode(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  platformMode
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Platform
              </button>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
              Toggle between Platform and Workspace view
            </div>
          </div>
        )}

        {/* Role Switcher */}
        <div className="relative group hidden sm:block">
          <select
            value={previewWsRole || user?.workspaceRoles?.[activeCommunity?.id] || WorkspaceRole.MEMBER}
            onChange={(e) => onRoleChange(e.target.value)}
            className="text-sm bg-slate-50 text-slate-700 border border-slate-200 rounded-lg py-1.5 px-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 cursor-pointer"
            id="role-picker-testing"
          >
        {(user?.platformRole === PlatformRole.SUPER_ADMIN) && (
              <option value="super_admin">Super Admin</option>
            )}
            <option value={WorkspaceRole.OWNER}>Creator</option>
            <option value={WorkspaceRole.ADMIN}>Admin</option>
            <option value={WorkspaceRole.INSTRUCTOR}>Instructor</option>
            <option value={WorkspaceRole.MODERATOR}>Moderator</option>
            <option value={WorkspaceRole.MEMBER}>Member</option>
          </select>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
            Switch roles to see different views
          </div>
        </div>

        {/* New Community Button */}
        <button
          onClick={openCreateCommunity}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition"
          id="btn-create-subdomain"
        >
          <Plus className="w-4 h-4" />
          New Community
        </button>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => {
              setShowBellMenu(!showBellMenu);
              if (!showBellMenu && unreadCount > 0) {
                onMarkNotificationsRead();
              }
            }}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            id="bell-notification-btn"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showBellMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50" id="notification-bell-menu">
              <div className="px-4 pb-2 border-b border-slate-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-slate-400">{unreadCount} new</span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">
                    You're all caught up
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`px-4 py-3 flex gap-3 hover:bg-slate-50 transition ${!n.isRead ? "bg-indigo-50/30" : ""}`}>
                      <div className="text-base mt-0.5">
                        {n.type === "level_up" ? "🎉" : n.type === "like" ? "👍" : n.type === "comment" ? "💬" : "📣"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 leading-snug">{n.title}</div>
                        <div className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.message}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition text-left"
            id="user-profile-toggle"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-3xl shadow-xl z-50 overflow-hidden" id="profile-expand-popup">
              {/* Profile Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 ring-2 ring-slate-100">
                    <img
                      src={user?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-slate-900 truncate">{user?.fullName || "User"}</div>
                    <div className="text-sm text-slate-400 truncate mt-0.5">{user?.email}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${roleColor[displayRole] || "bg-slate-100 text-slate-600"}`}>
                        {roleLabel[displayRole] || "Member"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Trophy className="w-3 h-3" />
                        <span className="font-medium">{user?.xp || 0} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="px-3 pb-3 space-y-0.5">
                <button
                  onClick={() => {
                    onTabChange("profile");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl font-medium flex items-center gap-3 cursor-pointer transition"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Profile
                </button>
                <button
                  className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl font-medium flex items-center gap-3 cursor-pointer transition"
                  onClick={() => {
                    onTabChange("settings");
                    setShowProfileMenu(false);
                  }}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings
                </button>
                <button
                  className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl font-medium flex items-center gap-3 cursor-pointer transition"
                  onClick={() => {
                    openOnboarding();
                    setShowProfileMenu(false);
                  }}
                >
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  Onboarding Guide
                </button>
                <button
                  className="w-full text-left px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl font-medium flex items-center gap-3 cursor-pointer transition"
                  onClick={() => {
                    window.location.hash = "settings?tab=appearance";
                    onTabChange("settings");
                    setShowProfileMenu(false);
                  }}
                >
                  <Palette className="w-4 h-4 text-slate-400" />
                  Appearance
                </button>
              </div>

              {/* Logout */}
              <div className="px-3 pb-3">
                <div className="border-t border-slate-100 pt-2">
                  {onLogout && (
                    <button
                      onClick={() => {
                        onLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium flex items-center gap-3 cursor-pointer transition"
                      id="btn-logout-sandbox"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
