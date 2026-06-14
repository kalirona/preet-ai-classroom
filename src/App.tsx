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
    // Platform-only tabs - super admin already returned true above
    case "superadmin":
    case "workspaces":
    case "users":
    case "revenue":
    case "payouts":
    case "security":
    case "logs":
      return false;

    // Owner-only workspace tabs
    case "monetization":
    case "mrr":
    case "sales":
    case "subscriptions":
    case "coupons":
    case "settings":
      return wsRole === WorkspaceRole.OWNER;

    // Owner or Admin
    case "analytics":
    case "course-builder":
      return wsRole === WorkspaceRole.OWNER || wsRole === WorkspaceRole.ADMIN;

    // Owner, Admin, or Moderator
    case "members":
    case "moderation":
    case "audit_logs_tab":
    case "reports":
      return wsRole === WorkspaceRole.OWNER || wsRole === WorkspaceRole.ADMIN || wsRole === WorkspaceRole.MODERATOR;

    // Instructor-only tabs
    case "students":
      return wsRole === WorkspaceRole.INSTRUCTOR;

    // Staff tabs (any role above basic member)
    case "dashboard":
    case "community":
      return wsRole !== WorkspaceRole.MEMBER;

    // Anyone can access (feed, courses, calendar, resources, profile, chat, saved, notifications_tab, home)
    default:
      return true;
  }
}
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FeedView from "./components/FeedView";
import PublicWebsite from "./components/public/PublicWebsite";
import ClassroomView from "./components/ClassroomView";
import CalendarView from "./components/CalendarView";
import CreatorDashboard from "./components/CreatorDashboard";
import MembersView from "./components/MembersView";
import ChatView from "./components/ChatView";
import ResourcesView from "./components/ResourcesView";
import SavedPostsView from "./components/SavedPostsView";
import SettingsView from "./components/SettingsView";
import SuperAdminView from "./components/SuperAdminView";
import WorkspaceAuditLogsView from "./components/WorkspaceAuditLogsView";
import ProfileView from "./components/ProfileView";
import ErrorBoundary from "./components/ErrorBoundary";

// Added Creator specialized subcomponents
import WorkspaceDashboardView from "./components/WorkspaceDashboardView";
import CreatorSalesView from "./components/CreatorSalesView";
import CreatorSubscriptionsView from "./components/CreatorSubscriptionsView";
import CreatorCouponsView from "./components/CreatorCouponsView";
import ModerationCenter from "./components/ModerationCenter";
import ReportsView from "./components/ReportsView";
import NotificationsView from "./components/NotificationsView";
import SupportView from "./components/SupportView";
import { SocketProvider } from "./components/SocketProvider";

import { Sparkles, X, ArrowRight } from "lucide-react";

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
  const [newCommDesc, setNewCommDesc] = useState("");
  const [newCommPrimary, setNewCommPrimary] = useState("indigo-600");
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

        // 2. Fetch communities
        const commRes = await fetch("/api/communities");
        const commData = await commRes.json();
        if (commData.communities && commData.communities.length > 0) {
          setCommunities(commData.communities);
          // Pick first community matching user's workspace roles, fallback to first
          const matchedComm = commData.communities.find((c: any) => 
            authData.user?.workspaceRoles?.[c.id]
          ) || commData.communities[0];
          setActiveCommunityId(matchedComm.id);
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
      } else if (path.startsWith("/creator") || hash === "#mrr") {
        targetTab = "mrr";
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

  const handleRefreshCourses = async () => {
    if (!activeCommunityId) return;
    try {
      const res = await fetch(`/api/courses?communityId=${activeCommunityId}`);
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } catch (err) {
      console.error("Failed to refresh courses:", err);
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
          description: newCommDesc,
          primaryColor: newCommPrimary,
          priceMonthly: newCommPrice,
          logoUrl: newCommLogo,
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
        setNewCommDesc("");
        setNewCommLogo("🚀");
        setNewCommPrice(49);
        setNewCommPrimary("indigo-600");
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
    <SocketProvider currentUser={currentUser}>
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
          onTabChange={(tab) => {
            if (canAccessTab(tab, currentUser, activeCommunityId)) {
              setActiveTab(tab);
              window.location.hash = tab;
            }
          }}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onLogout={handleLogout}
        />

        {/* Tab Route Content Mount */}
        <main className="flex-1 overflow-hidden">
          {activeTab === "dashboard" && currentUser?.platformRole !== PlatformRole.SUPER_ADMIN && (
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

          {/* Feed, Home, Community all render FeedView */}
          {(activeTab === "home" || activeTab === "feed" || activeTab === "community") && (
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
                onRefreshCourses={handleRefreshCourses}
              />
            </ErrorBoundary>
          )}

          {activeTab === "course-builder" && canAccessTab("course-builder", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <ClassroomView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                courses={courses}
                onAddCourse={handleAddCourse}
                onRefreshCourses={handleRefreshCourses}
                isCourseBuilderOnly={true}
              />
            </ErrorBoundary>
          ) : activeTab === "course-builder" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Course Builder is restricted to Owner or Admin.
            </div>
          ) : null}

          {activeTab === "analytics" && canAccessTab("analytics", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <ClassroomView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                courses={courses}
                onAddCourse={handleAddCourse}
                onRefreshCourses={handleRefreshCourses}
                isAnalyticsOnly={true}
              />
            </ErrorBoundary>
          ) : activeTab === "analytics" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Analytics is restricted to Owner or Admin.
            </div>
          ) : null}

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

          {activeTab === "members" && canAccessTab("members", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <MembersView
                currentUser={currentUser}
                activeCommunityId={activeCommunityId}
              />
            </ErrorBoundary>
          ) : activeTab === "members" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Members is restricted to Owner, Admin, or Moderator.
            </div>
          ) : null}

          {activeTab === "students" && canAccessTab("students", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <MembersView
                currentUser={currentUser}
                activeCommunityId={activeCommunityId}
              />
            </ErrorBoundary>
          ) : activeTab === "students" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Students is restricted to Instructor.
            </div>
          ) : null}

          {activeTab === "chat" && (
            <ErrorBoundary>
              <ChatView
                currentUser={currentUser}
                activeCommunityId={activeCommunityId}
              />
            </ErrorBoundary>
          )}

          {activeTab === "resources" && (
            <ErrorBoundary>
              <ResourcesView />
            </ErrorBoundary>
          )}

          {activeTab === "monetization" && canAccessTab("monetization", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorDashboard
                activeCommunity={activeCommunity}
                onUpdateCommunity={handleUpdateActiveCommunity}
              />
            </ErrorBoundary>
          ) : activeTab === "monetization" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Monetization is restricted to the Workspace Owner.
            </div>
          ) : null}

          {activeTab === "notifications_tab" && (
            <ErrorBoundary>
              <NotificationsView
                notifications={notifications}
                onMarkAllRead={handleMarkNotificationsRead}
              />
            </ErrorBoundary>
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
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Workspace Settings are restricted to the Owner.
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
                    .catch(err => console.error("Error fetching workspace audit logs:", err))
                    .finally(() => setLoadingWsLogs(false));
                }}
              />
            </ErrorBoundary>
          ) : activeTab === "audit_logs_tab" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Audit Logs are restricted to Owner, Admin, or Moderator.
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
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Sales are restricted to the Owner.
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
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Subscriptions are restricted to the Owner.
            </div>
          ) : null}

          {activeTab === "coupons" && canAccessTab("coupons", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorCouponsView />
            </ErrorBoundary>
          ) : activeTab === "coupons" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Coupons are restricted to the Owner.
            </div>
          ) : null}

          {activeTab === "mrr" && canAccessTab("mrr", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorDashboard
                activeCommunity={activeCommunity}
                onUpdateCommunity={handleUpdateActiveCommunity}
              />
            </ErrorBoundary>
          ) : activeTab === "mrr" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - MRR Dashboard is restricted to the Owner.
            </div>
          ) : null}

          {/* Super Admin routing: all super admin tabs render SuperAdminView */}
          {(() => {
            const superAdminTabs: Record<string, string> = {
              superadmin: "dashboard",
              workspaces: "workspaces",
              users: "users",
              revenue: "revenue",
              payouts: "payouts",
              analytics: "analytics",
              security: "security",
              logs: "logs",
              settings: "settings",
            };
            const section = superAdminTabs[activeTab];
            if (section && canAccessTab("superadmin", currentUser, activeCommunityId)) {
              return (
                <ErrorBoundary>
                  <SuperAdminView
                    currentUser={currentUser}
                    communities={communities}
                    activeSection={section}
                  />
                </ErrorBoundary>
              );
            }
            if (section) {
              return (
                <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
                  403 Forbidden - Platform Admin is restricted.
                </div>
              );
            }
            return null;
          })()}

          {activeTab === "reports" && canAccessTab("reports", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <ReportsView currentUser={currentUser} activeCommunityId={activeCommunityId} />
            </ErrorBoundary>
          ) : activeTab === "reports" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Reports are restricted to Owner, Admin, or Moderator.
            </div>
          ) : null}

          {activeTab === "moderation" && canAccessTab("moderation", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <ModerationCenter currentUser={currentUser} activeCommunityId={activeCommunityId} />
            </ErrorBoundary>
          ) : activeTab === "moderation" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Moderation is restricted to Owner, Admin, or Moderator.
            </div>
          ) : null}

          {activeTab === "support" && (
            <ErrorBoundary>
              <SupportView currentUser={currentUser} activeCommunityId={activeCommunityId} />
            </ErrorBoundary>
          )}
        </main>

      </div>

      {/* 4. SEED ONBOARDING INSTRUCTION GUIDE OVERLAY */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal branding */}
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => setShowOnboarding(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-medium text-slate-300">
                  Getting Started
                </span>
              </div>
              <h3 className="text-xl font-semibold mt-2 leading-tight">
                Welcome to Skool
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Everything you need to build and run your community.
              </p>
            </div>

            {/* Stepper details */}
            <div className="p-6 space-y-5 max-h-[420px] overflow-y-auto">
              
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-base font-medium text-slate-900">Explore the Feed</h4>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    The <strong>Feed</strong> is where community members share posts, ask questions, and discuss topics. Try creating a post or reacting to one.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-base font-medium text-slate-900">Browse Courses</h4>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    Head to <strong>Classroom</strong> to see available courses. Each course has modules and lessons. As an admin, you can also create new courses from the Course Builder.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-base font-medium text-slate-900">Create Your Community</h4>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    Click <strong>"+ New Community"</strong> in the header to set up your own space — choose a name, URL, and theme colors.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h4 className="text-base font-medium text-slate-900">Try Different Roles</h4>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    Use the <strong>role switcher</strong> in the header to see how each role experiences the platform — from creator tools to student view.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex items-center justify-center shrink-0">
                  5
                </div>
                <div>
                  <h4 className="text-base font-medium text-slate-900">Use the AI Assistant</h4>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    Open <strong>Chat</strong> and try the AI Copilot to draft posts, build course outlines, or get help with content creation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm flex items-center justify-center shrink-0">
                  6
                </div>
                <div>
                  <h4 className="text-base font-medium text-slate-900">Track Your Progress</h4>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    Earn XP by participating. Check your <strong>Profile</strong> to see your level and achievements. Visit <strong>Settings</strong> to customize your community.
                  </p>
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-3xl">
              <button
                type="button"
                onClick={() => setShowOnboarding(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-2"
                id="btn-close-onboarding-banner"
              >
                Got it
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
            
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">New Community</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Set up a space for your community</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateCommunity(false);
                    // Reset form
                    setNewCommName("");
                    setNewCommSub("");
                    setNewCommDesc("");
                    setNewCommLogo("🚀");
                    setNewCommPrice(49);
                    setNewCommPrimary("indigo-600");
                    setNewCommCategoryInput("AI Builders, General discussions");
                  }}
                  className="p-1 rounded-full hover:bg-gray-150 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            <form onSubmit={handleCreateCommunitySubmit}>
              <div className="p-6 space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Community Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React Mastery"
                    value={newCommName}
                    onChange={(e) => setNewCommName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of your community..."
                    value={newCommDesc}
                    onChange={(e) => setNewCommDesc(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL Handle</label>
                    <div className="flex items-center border border-slate-200 rounded-xl px-3 bg-slate-50">
                      <input
                        type="text"
                        required
                        placeholder="react-mastery"
                        value={newCommSub}
                        onChange={(e) => setNewCommSub(e.target.value)}
                        className="w-full bg-transparent border-none py-2.5 text-sm text-slate-900 focus:outline-none"
                      />
                      <span className="text-sm text-slate-400">.skool</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                    <select
                      value={newCommLogo}
                      onChange={(e) => setNewCommLogo(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                    >
                      <option value="🚀">🚀 Rocket</option>
                      <option value="⚛️">⚛️ React</option>
                      <option value="🧘">🧘 Zen</option>
                      <option value="💡">💡 Ideas</option>
                      <option value="🎓">🎓 Education</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Price ($)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newCommPrice}
                      onChange={(e) => setNewCommPrice(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Theme Color</label>
                    <select
                      value={newCommPrimary}
                      onChange={(e) => setNewCommPrimary(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                    >
                      <option value="indigo-600">Indigo</option>
                      <option value="emerald-600">Emerald</option>
                      <option value="blue-700">Blue</option>
                      <option value="rose-600">Rose</option>
                      <option value="amber-500">Amber</option>
                      <option value="slate-800">Slate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Topics (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="React, Next.js, AI"
                    value={newCommCategoryInput}
                    onChange={(e) => setNewCommCategoryInput(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  />
                </div>

                <p className="text-sm text-slate-400 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Setting a price enables paid memberships. Members will need to subscribe before accessing your content.
                </p>

              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCommunity(false);
                    // Reset form
                    setNewCommName("");
                    setNewCommSub("");
                    setNewCommDesc("");
                    setNewCommLogo("🚀");
                    setNewCommPrice(49);
                    setNewCommPrimary("indigo-600");
                    setNewCommCategoryInput("AI Builders, General discussions");
                  }}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingComm}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  id="final-deploy-comm-btn"
                >
                  {isCreatingComm ? "Creating..." : "Create Community"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
    </SocketProvider>
  );
}
