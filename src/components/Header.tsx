import React, { useState, useEffect } from "react";
import { User, UserRole, Notification } from "../types";
import { Bell, Sparkles, User as UserIcon, ShieldCheck, HelpCircle, Trophy, Globe, Layers, Menu, LogOut } from "lucide-react";

interface HeaderProps {
  user: User | null;
  onRoleChange: (role: UserRole) => void;
  activeCommunity: any;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
  openOnboarding: () => void;
  openCreateCommunity: () => void;
  onToggleSidebar: () => void;
  onLogout?: () => void;
}

export default function Header({
  user,
  onRoleChange,
  activeCommunity,
  notifications,
  onMarkNotificationsRead,
  openOnboarding,
  openCreateCommunity,
  onToggleSidebar,
  onLogout
}: HeaderProps) {
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 z-30 sticky top-0" id="app-header">
      {/* Community Branding & Status */}
      <div className="flex items-center gap-4">
        {/* Toggle Button for Mobile Navigation Menu */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          id="btn-mobile-sidebar-toggle"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-sm font-display text-lg">
            {activeCommunity?.branding?.logoUrl || "⚡"}
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight font-display tracking-tight flex items-center gap-2">
              {activeCommunity?.name || "Skool Sandbox Workspace"}
              {activeCommunity?.isPremium && (
                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md border border-indigo-200 uppercase tracking-wider">
                  Pro
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-500" />
              {activeCommunity?.subdomain || "sandbox"}.yourapp.com
            </p>
          </div>
        </div>
      </div>

      {/* Center Onboarding Assistance & Community Creator Action */}
      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={openCreateCommunity}
          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          id="btn-create-subdomain"
        >
          <Layers className="w-3.5 h-3.5" />
          Create Community
        </button>

        <button
          onClick={openOnboarding}
          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-amber-200"
          id="btn-onboarding-wizard"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Onboarding Guide
        </button>
      </div>

      {/* Right Controls: Notifications, Role-Switcher & Profiles */}
      <div className="flex items-center gap-5">
        
        {/* Testing Role Switcher */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase px-2 font-mono hidden sm:inline">Role Switcher:</span>
          <select
            value={user?.role || UserRole.MEMBER}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="text-xs bg-white text-gray-800 border-none rounded-lg py-1 px-2 font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            id="role-picker-testing"
          >
            <option value={UserRole.SUPER_ADMIN}>1. Super Admin</option>
            <option value={UserRole.CREATOR}>2. Creator</option>
            <option value={UserRole.ADMIN}>3. Admin</option>
            <option value={UserRole.MODERATOR}>4. Moderator</option>
            <option value={UserRole.MEMBER}>5. Member (Student)</option>
          </select>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowBellMenu(!showBellMenu);
              if (!showBellMenu && unreadCount > 0) {
                onMarkNotificationsRead();
              }
            }}
            className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
            id="bell-notification-btn"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-bounce border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showBellMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-100" id="notification-bell-menu">
              <div className="px-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900 font-display">Notifications</span>
                <span className="text-xs text-gray-400 font-mono">Real-time Feed</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Your pipeline shows no current unread alerts.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3 border-b border-gray-50 flex gap-2 hover:bg-gray-50 transition ${!n.isRead ? "bg-indigo-50/40" : ""}`}>
                      <div className="text-sm mt-0.5">
                        {n.type === "level_up" ? "🎉" : n.type === "like" ? "👍" : n.type === "comment" ? "💬" : "📣"}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-900 leading-tight">{n.title}</div>
                        <div className="text-[11px] text-gray-600 mt-0.5">{n.message}</div>
                        <div className="text-[9px] text-gray-400 font-mono mt-1">
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

        {/* User Profile Info Card */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition text-left"
            id="user-profile-toggle"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-100">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-bold text-gray-900 leading-tight">{user?.fullName || "Lincoln Flores"}</div>
              <div className="text-[10px] text-gray-400 font-mono capitalize">
                Level {user?.level || 4} student
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl py-2 z-50 font-sans" id="profile-expand-popup">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                <span className="block text-xs font-bold text-gray-900 leading-tight">{user?.fullName}</span>
                <span className="block text-[10px] text-gray-400 font-mono mt-0.5">{user?.email}</span>
              </div>
              <div className="p-2 space-y-1">
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 font-medium">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>XP Balance: {user?.xp} XP</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Role: {user?.role}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 p-1 mt-1 space-y-0.5">
                <button
                  onClick={() => {
                    openOnboarding();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg font-medium flex items-center gap-2 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                  Profile Wizard
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-semibold flex items-center gap-2 cursor-pointer"
                    id="btn-logout-sandbox"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
