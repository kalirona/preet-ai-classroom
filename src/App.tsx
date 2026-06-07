import React, { useState, useEffect } from "react";
import { User, Community, Post, LiveEvent, Notification, UserRole, Course, PlatformRole, WorkspaceRole } from "./types";

// Strict Client-Side Role-Based Tab Guard
export function canAccessTab(tab: string, user: User | null, activeCommunityId: string): boolean {
  if (!user) return false;
  const pfRole = user.platformRole || PlatformRole.USER;
  
  // Super Admin bypass / ultimate clearance
  if (pfRole === PlatformRole.SUPER_ADMIN) {
    return true;
  }

  // Workspace-specific role resolution
  const wsRole = user.workspaceRoles?.[activeCommunityId] || WorkspaceRole.MEMBER;

  switch (tab) {
    case "superadmin":
    case "cloudpanel":
      // Restricted strictly to super_admin (who has already returned true above)
      return false;

    case "creator":
    case "sales":
    case "subscriptions":
    case "coupons":
    case "affiliate":
      // Billing infrastructure and SaaS analytics are restricted to the Workspace Creator/Owner
      return wsRole === WorkspaceRole.CREATOR;

    case "settings":
      // Workspace settings (platform-level info) is restricted strictly to the Workspace Creator
      return wsRole === WorkspaceRole.CREATOR;

    case "course-builder":
    case "analytics":
      // Restricted to Workspace Creator / Admin
      return wsRole === WorkspaceRole.CREATOR || wsRole === WorkspaceRole.ADMIN;

    case "reports":
    case "moderation":
    case "audit_logs_tab":
      // Reports, Moderation queue, and Audit logs are restricted to Workspace Staff (Creator, Admin, Moderator)
      return wsRole === WorkspaceRole.CREATOR || wsRole === WorkspaceRole.ADMIN || wsRole === WorkspaceRole.MODERATOR;

    case "challenges":
    case "dashboard":
    case "marketplace":
      // Standard members (students) do not access dashboard or marketplace for a distraction-free learning experience
      return wsRole !== WorkspaceRole.MEMBER;

    default:
      // Standard tabs like feed, courses, etc. are always accessible
      return true;
  }
}
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FeedView from "./components/FeedView";
import PublicWebsite from "./components/public/PublicWebsite";
import ClassroomView from "./components/ClassroomView";
import CalendarView from "./components/CalendarView";
import LeaderboardView from "./components/LeaderboardView";
import CreatorDashboard from "./components/CreatorDashboard";
import MembersView from "./components/MembersView";
import ChatView from "./components/ChatView";
import ResourcesView from "./components/ResourcesView";
import MarketplaceView from "./components/MarketplaceView";
import SavedPostsView from "./components/SavedPostsView";
import SettingsView from "./components/SettingsView";
import SuperAdminView from "./components/SuperAdminView";
import CloudPanelDashboard from "./components/CloudPanelDashboard";
import WorkspaceAuditLogsView from "./components/WorkspaceAuditLogsView";
import ProfileView from "./components/ProfileView";
import ErrorBoundary from "./components/ErrorBoundary";

// Added Creator specialized subcomponents
import WorkspaceDashboardView from "./components/WorkspaceDashboardView";
import CreatorSalesView from "./components/CreatorSalesView";
import CreatorSubscriptionsView from "./components/CreatorSubscriptionsView";
import CreatorCouponsView from "./components/CreatorCouponsView";
import CreatorAffiliateView from "./components/CreatorAffiliateView";
import CreatorModerationView from "./components/CreatorModerationView";
import CreatorReportsView from "./components/CreatorReportsView";
import ChallengesView from "./components/ChallengesView";

import { Sparkles, HelpCircle, UserCheck, Layers, BookOpen, Clock, Lightbulb, Check, X, ShieldAlert, Laptop, ArrowRight, Bell } from "lucide-react";

export default function App() {
  // Global Workspace states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunityId, setActiveCommunityId] = useState<string>("");
  
  // Tab syncs corresponding to Skool navbar
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Data array state
  const [posts, setPosts] = useState<Post[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Enterprise Tenant Isolation Audit states
  const [workspaceLogs, setWorkspaceLogs] = useState<any[]>([]);
  const [loadingWsLogs, setLoadingWsLogs] = useState(false);

  // UX modal triggers
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);

  // New community wizard inputs
  const [newCommName, setNewCommName] = useState("");
  const [newCommSub, setNewCommSub] = useState("");
  const [newCommLogo, setNewCommLogo] = useState("🚀");
  const [newCommPrice, setNewCommPrice] = useState(49);
  const [newCommCategoryInput, setNewCommCategoryInput] = useState("AI Builders, General discussions");
  const [isCreatingComm, setIsCreatingComm] = useState(false);

  // Core boot loader
  useEffect(() => {
    async function initPlatform() {
      try {
        // 1. Fetch current session user info
        const authRes = await fetch("/api/auth/session");
        const authData = await authRes.json();
        if (authData.user) {
          setCurrentUser(authData.user);
        }

        // 2. Fetch communities (only if authenticated)
        if (authData.user) {
          const commRes = await fetch("/api/communities");
          const commData = await commRes.json();
          if (commData.communities && commData.communities.length > 0) {
            setCommunities(commData.communities);
            setActiveCommunityId(commData.communities[0].id);
          }
        }

        // 3. Fetch user notifications (only if authenticated)
        if (authData.user) {
          const notifRes = await fetch("/api/notifications");
          const notifData = await notifRes.json();
          if (notifData.notifications) {
            setNotifications(notifData.notifications);
          }
        }

      } catch (err) {
        console.error("Platform workspace boot initialization error:", err);
      }
    }
    initPlatform();
  }, []);

  // Sync feed, courses, and events on activeCommunityId state shift
  useEffect(() => {
    if (!activeCommunityId) return;

    async function syncCommunityData() {
      try {
        // Fetch posts
        const postRes = await fetch(`/api/posts?communityId=${activeCommunityId}`);
        const postData = await postRes.json();
        if (postData.posts) {
          setPosts(postData.posts);
        }

        // Fetch courses
        const courseRes = await fetch(`/api/courses?communityId=${activeCommunityId}`);
        const courseData = await courseRes.json();
        if (courseData.courses) {
          setCourses(courseData.courses);
        }

        // Fetch events
        const eventRes = await fetch(`/api/events?communityId=${activeCommunityId}`);
        const eventData = await eventRes.json();
        if (eventData.events) {
          setEvents(eventData.events);
        }

      } catch (err) {
        console.error("Community feed and courses sync error:", err);
      }
    }
    syncCommunityData();
  }, [activeCommunityId]);

  // Synchronic URL state mapping with loop protection and functional state updates
  useEffect(() => {
    let ignore = false;
    
    const handleUrlRouteSync = () => {
      if (!currentUser || ignore) return;

      const path = window.location.pathname;
      const hash = window.location.hash;
      
      // Select appropriate tab based on route
      let targetTab: string | null = null;
      if (path.startsWith("/admin") || path.startsWith("/platform") || path.startsWith("/enterprise") || path.startsWith("/security") || path.startsWith("/global-analytics") || hash === "#superadmin" || hash === "#platform" || hash === "#admin") {
        targetTab = "superadmin";
      } else if (path.startsWith("/creator") || hash === "#creator") {
        targetTab = "creator";
      } else if (path.startsWith("/settings") || hash === "#settings") {
        targetTab = "settings";
      } else if (hash) {
        const potentialTab = hash.substring(1);
        if (potentialTab) targetTab = potentialTab;
      }

      if (targetTab) {
        if (canAccessTab(targetTab, currentUser, activeCommunityId)) {
          // Functional state check to prevent loop triggers
          setActiveTab(prev => {
            if (prev !== targetTab) {
              return targetTab!;
            }
            return prev;
          });
        } else {
          // If the user has NO permission, reset the hash to #feed and update tab to "feed" safely
          if (window.location.hash !== "#feed") {
            window.location.hash = "feed";
          }
          setActiveTab(prev => {
            if (prev !== "feed") {
              return "feed";
            }
            return prev;
          });
          
          fetch("/api/security/failed-routing-violation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attemptedTab: targetTab, path, hash })
          }).catch(err => console.error("Logged routing violation failed:", err));
        }
      }
    };

    window.addEventListener("hashchange", handleUrlRouteSync);
    window.addEventListener("popstate", handleUrlRouteSync);

    // Run the initial check
    handleUrlRouteSync();

    return () => {
      ignore = true;
      window.removeEventListener("hashchange", handleUrlRouteSync);
      window.removeEventListener("popstate", handleUrlRouteSync);
    };
  }, [currentUser, activeCommunityId]);

  // Tab permission-enforcing guard effect
  useEffect(() => {
    if (currentUser && activeCommunityId) {
      if (!canAccessTab(activeTab, currentUser, activeCommunityId)) {
        setActiveTab("feed");
      }
    }
  }, [activeTab, currentUser, activeCommunityId]);

  // Handle log out action
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setCurrentUser(null);
        window.location.reload();
      }
    } catch (err) {
      console.error("Logout error occurred: ", err);
    }
  };

  // Handle Role Switcher changes
  const handleRoleChange = async (newRole: UserRole) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-workspace-id": activeCommunityId
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success && data.user) {
        const updatedUser = data.user;
        setCurrentUser(updatedUser);
        
        // Push a fresh level alert notification for testing verification
        const mockNotif: Notification = {
          id: `notif-role-${Date.now()}`,
          userId: updatedUser.id,
          title: `Role Switched: ${newRole} 🔒`,
          message: `Your testing coordinates updated to ${newRole} access parameters successfully.`,
          type: "level_up",
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications([mockNotif, ...notifications]);

        // Auto-revert tab back to feed if switching away and current tab lacks clearance
        if (!canAccessTab(activeTab, updatedUser, activeCommunityId)) {
          setActiveTab("feed");
          window.location.hash = "feed";
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mark all notifications read
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Upvote / Like Post
  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return { ...p, likes: p.likes + 1 };
          }
          return p;
        }));
        
        // Smoothly boost user XP state locally (+10 upvote participation XP!)
        if (currentUser) {
          setCurrentUser({ ...currentUser, xp: currentUser.xp + 10 });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pin Post toggle (Creator Privilege)
  const handlePinPost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/pin`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return { ...p, isPinned: !p.isPinned };
          }
          return p;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Dynamic Post Discussions
  const handleAddPost = async (title: string, content: string, category: string, tags: string[]) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: activeCommunityId,
          title,
          content,
          category,
          tags
        })
      });
      const data = await res.json();
      if (data.success && data.post) {
        // Prepend new post
        setPosts([data.post, ...posts]);
        
        // Award XP!
        if (currentUser) {
          const updatedXp = currentUser.xp + 15;
          const updatedLevel = Math.floor(updatedXp / 200) > currentUser.level ? currentUser.level + 1 : currentUser.level;
          setCurrentUser({ ...currentUser, xp: updatedXp, level: updatedLevel });
        }
        
        // Trigger alert notifications locally
        const freshAlert: Notification = {
          id: `n-${Date.now()}`,
          userId: currentUser?.id || "user-student",
          title: "Discussion Created Key (+15 XP) 🎉",
          message: `Your channel subject "${title}" has been successfully drafted to PostgreSQL.`,
          type: "comment",
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications([freshAlert, ...notifications]);
      }
    } catch (e) {
      console.error("Drafting post error", e);
    }
  };

  // Register Event RSVP RSVP
  const handleRsvpEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.event) {
        // Update local events list
        setEvents(events.map(e => e.id === eventId ? data.event : e));
        
        // Boost user XP
        if (currentUser) {
          const updatedXp = currentUser.xp + 20;
          const updatedLevel = Math.floor(updatedXp / 200) > currentUser.level ? currentUser.level + 1 : currentUser.level;
          setCurrentUser({ ...currentUser, xp: updatedXp, level: updatedLevel });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAwardXp = (amount: number) => {
    if (!currentUser) return;
    const updatedXp = currentUser.xp + amount;
    const updatedLevel = Math.floor(updatedXp / 200) > currentUser.level ? currentUser.level + 1 : currentUser.level;
    setCurrentUser({ ...currentUser, xp: updatedXp, level: updatedLevel });

    const freshAlert: Notification = {
      id: `n-custom-xp-${Date.now()}`,
      userId: currentUser.id,
      title: `Quest Completed (+${amount} XP) 🏅`,
      message: `Successfully resolved dynamic workspace challenge! Level progress increased.`,
      type: "level_up",
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([freshAlert, ...notifications]);
  };

  // Dynamic Syllabus creator hook for Classroom
  const handleAddCourse = (newCourse: any) => {
    setCourses([newCourse, ...courses]);
    
    // Auto-award level badge
    if (currentUser && !currentUser.badges.includes("Course Master")) {
      setCurrentUser({
        ...currentUser,
        badges: [...currentUser.badges, "Course Master"],
        xp: currentUser.xp + 30
      });
    }
  };

  // Custom multi-tenant Community maker action
  const handleCreateCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim() || !newCommSub.trim()) return;

    setIsCreatingComm(true);
    try {
      const cats = newCommCategoryInput.split(",").map(c => c.trim()).filter(Boolean);
      
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCommName,
          subdomain: newCommSub.toLowerCase().replace(/\s+/g, "-"),
          logoUrl: newCommLogo,
          priceMonthly: newCommPrice,
          categories: cats
        })
      });
      const data = await res.json();
      if (data.success && data.community) {
        setCommunities([...communities, data.community]);
        setActiveCommunityId(data.community.id);
        
        // Reset states
        setNewCommName("");
        setNewCommSub("");
        setNewCommLogo("🚀");
        setNewCommPrice(49);
        setNewCommCategoryInput("AI Builders, General discussions");
        setShowCreateCommunity(false);

        // Notify user about multi-tenant workspace spin up
        const targetNotif: Notification = {
          id: `comm-notif-${Date.now()}`,
          userId: currentUser?.id || "user-student",
          title: "Subdomain Sub-tier Launched! 🌐",
          message: `Created dynamic space "${data.community.name}" securely. Check the sub-menu left rail channel views!`,
          type: "level_up",
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications([targetNotif, ...notifications]);
      }
    } catch (ex) {
      console.error("Multi-tenant subdomain deployment failed:", ex);
    } finally {
      setIsCreatingComm(false);
    }
  };

  // Community landing custom updates
  const handleUpdateActiveCommunity = async (updatedFields: Partial<Community>) => {
    try {
      const res = await fetch(`/api/communities/${activeCommunityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success && data.community) {
        // Sync modified fields locally
        setCommunities(communities.map(c => c.id === activeCommunityId ? { ...c, ...updatedFields } : c));
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const activeCommunity = communities.find(c => c.id === activeCommunityId) || null;

  // Fetch tenant-isolated security logs whenever the active tab pivots
  useEffect(() => {
    if (activeTab === "audit_logs_tab" && activeCommunityId) {
      setLoadingWsLogs(true);
      fetch(`/api/rbac/audit-logs?workspaceId=${activeCommunityId}`)
        .then(res => res.json())
        .then(data => {
          if (data.auditLogs) setWorkspaceLogs(data.auditLogs);
        })
        .catch(err => console.error("Error fetching workspace secure timeline:", err))
        .finally(() => setLoadingWsLogs(false));
    }
  }, [activeTab, activeCommunityId]);

  if (!currentUser) {
    return (
      <PublicWebsite
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-[#1A1A1A] font-sans overflow-hidden" id="workspace-viewport">
      
      {/* Dynamic Left Admin Sidebar */}
      <Sidebar
        user={currentUser}
        communities={communities}
        activeCommunityId={activeCommunityId}
        onSelectCommunity={(id) => {
          setActiveCommunityId(id);
          // When switching workspaces, revert tab back to dashboard
          setActiveTab("dashboard");
          setIsMobileSidebarOpen(false); // Auto-dismiss on workspace change
        }}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false); // Auto-dismiss on tab click
        }}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Right Content Section Viewport */}
      <div className="flex-1 flex flex-col min-w-0" id="main-content-canvas">
        
        {/* Global branding & role notification Header */}
        <Header
          user={currentUser}
          onRoleChange={handleRoleChange}
          activeCommunity={activeCommunity}
          notifications={notifications}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          openOnboarding={() => setShowOnboarding(true)}
          openCreateCommunity={() => setShowCreateCommunity(true)}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onLogout={handleLogout}
        />

        {/* Tab Route Content Mount */}
        <main className="flex-1 overflow-hidden">
          {activeTab === "dashboard" && (
            <ErrorBoundary>
              <WorkspaceDashboardView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                communities={communities}
                onChangeTab={setActiveTab}
                onAddXp={handleAwardXp}
              />
            </ErrorBoundary>
          )}

          {activeTab === "feed" && (
            <ErrorBoundary>
              <FeedView
                userRole={currentUser?.role || UserRole.MEMBER}
                activeCommunity={activeCommunity}
                posts={posts}
                onLikePost={handleLikePost}
                onAddPost={handleAddPost}
                onPinPost={handlePinPost}
              />
            </ErrorBoundary>
          )}

          {activeTab === "courses" && (
            <ErrorBoundary>
              <ClassroomView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                courses={courses}
                onAddCourse={handleAddCourse}
                onRefreshCourses={() => {}}
              />
            </ErrorBoundary>
          )}

          {activeTab === "course-builder" && (
            <ErrorBoundary>
              <ClassroomView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                courses={courses}
                onAddCourse={handleAddCourse}
                onRefreshCourses={() => {}}
                isCourseBuilderOnly={true}
              />
            </ErrorBoundary>
          )}

          {activeTab === "analytics" && (
            <ErrorBoundary>
              <ClassroomView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                courses={courses}
                onAddCourse={handleAddCourse}
                onRefreshCourses={() => {}}
                isAnalyticsOnly={true}
              />
            </ErrorBoundary>
          )}

          {activeTab === "calendar" && (
            <ErrorBoundary>
              <CalendarView
                userRole={currentUser?.role || UserRole.MEMBER}
                activeCommunityId={activeCommunityId}
                events={events}
                onAddEvent={(evt) => setEvents([evt, ...events])}
                onRsvpEvent={handleRsvpEvent}
              />
            </ErrorBoundary>
          )}

          {activeTab === "members" && (
            <ErrorBoundary>
              <MembersView
                currentUser={currentUser}
                activeCommunityId={activeCommunityId}
              />
            </ErrorBoundary>
          )}

          {activeTab === "leaderboard" && (
            <ErrorBoundary>
              <LeaderboardView
                currentUser={currentUser}
              />
            </ErrorBoundary>
          )}

          {activeTab === "challenges" && (
            <ErrorBoundary>
              <ChallengesView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
              />
            </ErrorBoundary>
          )}

          {activeTab === "chat" && (
            <ErrorBoundary>
              <ChatView
                currentUser={currentUser}
              />
            </ErrorBoundary>
          )}

          {activeTab === "resources" && (
            <ErrorBoundary>
              <ResourcesView />
            </ErrorBoundary>
          )}

          {activeTab === "marketplace" && (
            <ErrorBoundary>
              <MarketplaceView
                currentUser={currentUser}
                communities={communities}
                onJoinCommunityLocal={(id, amount) => {
                  if (!currentUser) return;
                  const updatedCommunities = [...currentUser.joinedCommunities, id];
                  setCurrentUser({ ...currentUser, joinedCommunities: updatedCommunities });
                  setCommunities(communities.map(c => c.id === id ? { ...c, membersCount: c.membersCount + 1 } : c));
                  const transacNotif: Notification = {
                    id: `n-transact-${Date.now()}`,
                    userId: currentUser.id,
                    title: `Multi-tenant Seat Purchased! 💳`,
                    message: `Assigned secure database index rows + subscription access for space ID ${id}.`,
                    type: "payment",
                    isRead: false,
                    createdAt: new Date().toISOString()
                  };
                  setNotifications([transacNotif, ...notifications]);
                }}
              />
            </ErrorBoundary>
          )}

          {activeTab === "notifications_tab" && (
            <div className="h-full bg-[#F8F9FB] overflow-y-auto p-4 sm:p-6" id="notifications-expanded-inbox">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm flex items-center justify-between flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-750 flex items-center justify-center font-bold">
                      <Bell className="w-5 h-5 text-indigo-650" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 font-display">System Notifications Center</h2>
                      <p className="text-xs text-gray-450 mt-0.5">Keep track of community upvotes, replies, level ups, and simulated transactions.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleMarkNotificationsRead}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                  >
                    Clear All Alerts
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center text-xs text-gray-400 shadow-sm">
                      You are all caught up! No recent activity logs discovered.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex gap-3.5 items-start shadow-sm justify-between transition hover:border-gray-300">
                        <div className="flex gap-3">
                          <span className="text-lg mt-0.5">{n.type === "level_up" ? "🎉" : n.type === "like" ? "👍" : n.type === "comment" ? "💬" : "💳"}</span>
                          <div>
                            <span className="font-bold text-gray-900 text-xs block">{n.title}</span>
                            <p className="text-xs text-gray-650 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-gray-400 font-mono mt-1.5 block">Dispatched {new Date(n.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        {!n.isRead && (
                          <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full mt-1.5 shrink-0"></span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "saved" && (
            <ErrorBoundary>
              <SavedPostsView posts={posts} />
            </ErrorBoundary>
          )}

          {activeTab === "profile" && (
            <ErrorBoundary>
              <ProfileView 
                user={currentUser}
                onUpdateUser={(updatedStudent) => {
                  setCurrentUser(updatedStudent);
                }}
              />
            </ErrorBoundary>
          )}

          {activeTab === "settings" && canAccessTab("settings", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <SettingsView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                onUpdateCommunity={handleUpdateActiveCommunity}
              />
            </ErrorBoundary>
          ) : activeTab === "settings" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6" id="unauthorized-settings-blocked">
              🛑 403 Forbidden - Workspace Settings are restricted to Owner and Admins.
            </div>
          ) : null}

          {activeTab === "audit_logs_tab" && canAccessTab("audit_logs_tab", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <WorkspaceAuditLogsView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                workspaceLogs={workspaceLogs}
                loadingWsLogs={loadingWsLogs}
                onRefresh={() => {
                  setLoadingWsLogs(true);
                  fetch(`/api/rbac/audit-logs?workspaceId=${activeCommunityId}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.auditLogs) setWorkspaceLogs(data.auditLogs);
                    })
                    .catch(err => console.error("Error fetching workspace secure timeline:", err))
                    .finally(() => setLoadingWsLogs(false));
                }}
              />
            </ErrorBoundary>
          ) : activeTab === "audit_logs_tab" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6" id="unauthorized-audit-blocked">
              🛑 403 Forbidden - Workspace Analytics and active Audit Trails are restricted.
            </div>
          ) : null}

          {activeTab === "sales" && canAccessTab("sales", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorSalesView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
              />
            </ErrorBoundary>
          ) : activeTab === "sales" ? (
            <div className="p-8 text-center text-red-650 font-bold bg-red-50/55 border border-red-200 rounded-3xl m-6" id="unauthorized-sales-blocked">
              🛑 403 Forbidden - Workspace Sales Logs are restricted strictly to the Workspace Creator.
            </div>
          ) : null}

          {activeTab === "subscriptions" && canAccessTab("subscriptions", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorSubscriptionsView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
              />
            </ErrorBoundary>
          ) : activeTab === "subscriptions" ? (
            <div className="p-8 text-center text-red-650 font-bold bg-[#FAF1F2] border border-red-200 rounded-3xl m-6" id="unauthorized-subscriptions-blocked">
              🛑 403 Forbidden - Workspace Subscription Schedules are restricted strictly to the Workspace Creator.
            </div>
          ) : null}

          {activeTab === "coupons" && canAccessTab("coupons", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorCouponsView />
            </ErrorBoundary>
          ) : activeTab === "coupons" ? (
            <div className="p-8 text-center text-red-650 font-bold bg-red-50/55 border border-red-200 rounded-3xl m-6" id="unauthorized-coupons-blocked">
              🛑 403 Forbidden - Workspace Promotional Coupons are restricted strictly to the Workspace Creator.
            </div>
          ) : null}

          {activeTab === "affiliate" && canAccessTab("affiliate", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorAffiliateView />
            </ErrorBoundary>
          ) : activeTab === "affiliate" ? (
            <div className="p-8 text-center text-red-650 font-bold bg-red-50/55 border border-red-200 rounded-3xl m-6" id="unauthorized-affiliate-blocked">
              🛑 403 Forbidden - Affiliate Commission Programs are restricted strictly to the Workspace Creator.
            </div>
          ) : null}

          {activeTab === "reports" && canAccessTab("reports", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorReportsView />
            </ErrorBoundary>
          ) : activeTab === "reports" ? (
            <div className="p-8 text-center text-red-650 font-bold bg-red-50/55 border border-red-200 rounded-3xl m-6" id="unauthorized-reports-blocked">
              🛑 403 Forbidden - Security Reports of the workspace are restricted to Workspace Staff.
            </div>
          ) : null}

          {activeTab === "moderation" && canAccessTab("moderation", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorModerationView />
            </ErrorBoundary>
          ) : activeTab === "moderation" ? (
            <div className="p-8 text-center text-red-650 font-bold bg-red-50/55 border border-red-200 rounded-3xl m-6" id="unauthorized-moderation-blocked">
              🛑 403 Forbidden - Moderation privileges are restricted to Workspace Staff.
            </div>
          ) : null}

          {activeTab === "creator" && canAccessTab("creator", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorDashboard
                activeCommunity={activeCommunity}
                onUpdateCommunity={handleUpdateActiveCommunity}
              />
            </ErrorBoundary>
          ) : activeTab === "creator" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6" id="unauthorized-creator-blocked">
              🛑 403 Forbidden - Workspace Creator MRR Dashboard is restricted.
            </div>
          ) : null}

          {activeTab === "superadmin" && canAccessTab("superadmin", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <SuperAdminView
                currentUser={currentUser}
                communities={communities}
              />
            </ErrorBoundary>
          ) : activeTab === "superadmin" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6" id="unauthorized-superadmin-blocked">
              🛑 403 Forbidden - Platform Security Suite / Admin Gateway is restricted.
            </div>
          ) : null}

          {activeTab === "cloudpanel" && canAccessTab("cloudpanel", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CloudPanelDashboard
                currentUser={currentUser}
              />
            </ErrorBoundary>
          ) : activeTab === "cloudpanel" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6" id="unauthorized-cloudpanel-blocked">
              🛑 403 Forbidden - CloudPanel Database Administration Suite is restricted.
            </div>
          ) : null}
        </main>

      </div>

      {/* 4. SEED ONBOARDING INSTRUCTION GUIDE OVERLAY */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal branding */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-purple-950 text-white relative">
              <button
                onClick={() => setShowOnboarding(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
                <span className="text-[9px] uppercase font-mono tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                  Sandbox Guide
                </span>
              </div>
              <h3 className="text-base font-bold font-display mt-2 leading-tight">
                Skool Community Sandbox Accelerator
              </h3>
              <p className="text-[11px] text-indigo-200 mt-1">
                A fully responsive production architecture configured to launch premium multi-tenant subdomains.
              </p>
            </div>

            {/* Stepper details */}
            <div className="p-6 space-y-4 max-h-[380px] overflow-y-auto">
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Explore Multi-Tenant Communities</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-sans leading-relaxed">
                    Toggle different spaces from the sidebar left-rail or click <strong>"Create Community"</strong> to spin up custom subdomains with special color schemes and logos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 font-sans">Experience both Student & Creator Roles</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-sans leading-relaxed">
                    Use our **Role Picker** in the top navigation bar to instant-switch between <strong>Creator</strong> and <strong>Student</strong> views. This reveals creator-exclusive MRR charts, event schedules, and custom pricing plans!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 font-sans">Deep Gemini AI Integration</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-sans leading-relaxed">
                    Harness AI inside multiple loops: write complex posts using <strong>AI Post Helpers</strong> or curate detailed multi-module syllabuses instantly under the <strong>Classroom Tab</strong>!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 font-sans">Simulate Premium Stripe Subscriptions</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-sans leading-relaxed">
                    Under the <strong>"Creator MRR Stats"</strong> tab, click <strong>"Simulate Paid Join"</strong> to emulate premium Stripe checkouts. This boosts owner MRR and adds dynamic coordinate points to sales diagrams.
                  </p>
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setShowOnboarding(false)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-sans transition cursor-pointer shadow-sm flex items-center gap-1"
                id="btn-close-onboarding-banner"
              >
                Launch Sandbox Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. MULTI-TENANT COMMUNITY GENERATOR DIALOG */}
      {showCreateCommunity && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono">Multi-Tenant Setup</h3>
                <h2 className="text-base font-bold text-gray-900 font-display mt-1">Deploy Custom Subdomain</h2>
              </div>
              <button
                onClick={() => setShowCreateCommunity(false)}
                className="p-1 rounded-full hover:bg-gray-150 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunitySubmit}>
              <div className="p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Community Space Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next.js Mastermind Lab"
                    value={newCommName}
                    onChange={(e) => setNewCommName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Subdomain Prefix</label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-gray-50">
                      <input
                        type="text"
                        required
                        placeholder="nextjs-lab"
                        value={newCommSub}
                        onChange={(e) => setNewCommSub(e.target.value)}
                        className="w-full bg-transparent border-none py-2 text-xs text-gray-950 focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-gray-400 font-mono">.skool</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Branding Icon Symbol</label>
                    <select
                      value={newCommLogo}
                      onChange={(e) => setNewCommLogo(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-950 focus:outline-none"
                    >
                      <option value="🚀">🚀 Spaceship Rocket</option>
                      <option value="⚛️">⚛️ Quantum React Model</option>
                      <option value="🧘">🧘 Zenith Mindfulness</option>
                      <option value="💡">💡 Intelligent Concept</option>
                      <option value="🎓">🎓 Educator Cap</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Subscription Support ($)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newCommPrice}
                      onChange={(e) => setNewCommPrice(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Course categories (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Nextjs, AI, DB"
                      value={newCommCategoryInput}
                      onChange={(e) => setNewCommCategoryInput(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-950 focus:outline-none"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 font-mono leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  ⚡ Adding a premium price automatically enables dynamic checkout simulation charges! Students must pay this before access to classroom resources lockouts.
                </p>

              </div>

              <div className="p-6 bg-gray-50/50 border-t border-[#E5E7EB] flex justify-end gap-3 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setShowCreateCommunity(false)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingComm}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
                  id="final-deploy-comm-btn"
                >
                  {isCreatingComm ? "Installing modules..." : "Deploy Community Domain"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
