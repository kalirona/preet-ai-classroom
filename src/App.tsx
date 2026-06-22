import React, { useState, useEffect, useMemo, Suspense } from "react";
import { User, Community, Post, LiveEvent, Notification, Course, PlatformRole, WorkspaceRole } from "./types";

// Strict Client-Side Role-Based Tab Guard
export function canAccessTab(tab: string, user: User | null, activeCommunityId: string): boolean {
  if (!user) return false;
  const pfRole = user.platformRole === PlatformRole.SUPER_ADMIN
    ? PlatformRole.SUPER_ADMIN
    : (user.platformRole || PlatformRole.USER);
  
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
    case "security":
    case "logs":
    case "inbox":
      return false;

    // Owner-only workspace tabs
    case "monetization":
      return wsRole === WorkspaceRole.OWNER;

    // Owner, Admin, or Instructor
    case "courses":
      return wsRole === WorkspaceRole.OWNER || wsRole === WorkspaceRole.ADMIN || wsRole === WorkspaceRole.INSTRUCTOR;

    // Owner or Instructor (NOT Admin — Admin runs community, doesn't build courses)
    case "course-studio":
      return wsRole === WorkspaceRole.OWNER || wsRole === WorkspaceRole.INSTRUCTOR;

    // Super Admin platform analytics (handled by super admin early return)
    case "analytics":
      return false;

    // Owner, Admin, or Moderator
    case "members":
    case "moderation":
    case "reports":
      return wsRole === WorkspaceRole.OWNER || wsRole === WorkspaceRole.ADMIN || wsRole === WorkspaceRole.MODERATOR;

    // Creator/Instructor tabs (progress tracking)
    case "students":
      return wsRole === WorkspaceRole.OWNER || wsRole === WorkspaceRole.ADMIN || wsRole === WorkspaceRole.INSTRUCTOR;

    // Owner payout management
    case "payouts":
      return wsRole === WorkspaceRole.OWNER;

    // Staff tabs (any role above basic member)
    case "dashboard":
    case "community":
      return wsRole !== WorkspaceRole.MEMBER;

    // Instructor course-related tabs
    case "course-analytics":
    case "assignments":
    case "certificates":
      return wsRole === WorkspaceRole.OWNER || wsRole === WorkspaceRole.INSTRUCTOR;

    // Settings — Owner/Admin only (no Instructor, no Member)
    case "settings":
      return wsRole === WorkspaceRole.OWNER || wsRole === WorkspaceRole.ADMIN;

    // Anyone can access (feed, classroom, calendar, resources, profile, chat, saved, notifications_tab)
    default:
      return true;
  }
}
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FeedView from "./components/FeedView";
import PublicWebsite from "./components/public/PublicWebsite";
import ClassroomView from "./components/classroom/ClassroomView";
import CourseBuilder from "./components/course/CourseBuilder";
import CalendarView from "./components/CalendarView";
import CreatorDashboard from "./components/CreatorDashboard";
import MembersView from "./components/MembersView";
import ChatView from "./components/ChatView";
import ResourcesView from "./components/ResourcesView";
import SavedPostsView from "./components/SavedPostsView";
import SettingsView from "./components/SettingsView";
const PlatformOverview = React.lazy(() => import("./components/platform/PlatformOverview"));
const PlatformWorkspaces = React.lazy(() => import("./components/platform/PlatformWorkspaces"));
const PlatformUsers = React.lazy(() => import("./components/platform/PlatformUsers"));
const PlatformRevenue = React.lazy(() => import("./components/platform/PlatformRevenue"));
const PlatformPayouts = React.lazy(() => import("./components/platform/PlatformPayouts"));
const PlatformAnalytics = React.lazy(() => import("./components/platform/PlatformAnalytics"));
const PlatformSecurity = React.lazy(() => import("./components/platform/PlatformSecurity"));
const PlatformAuditLogs = React.lazy(() => import("./components/platform/PlatformAuditLogs"));
const PlatformSettings = React.lazy(() => import("./components/platform/PlatformSettings"));
const PlatformInbox = React.lazy(() => import("./components/platform/PlatformInbox"));
import ProfileView from "./components/ProfileView";
import ErrorBoundary from "./components/ErrorBoundary";
import BootstrapAdmin from "./components/BootstrapAdmin";

// Added Creator specialized subcomponents
import WorkspaceDashboardView from "./components/WorkspaceDashboardView";
import ModerationCenter from "./components/ModerationCenter";
import ReportsView from "./components/ReportsView";
import NotificationsView from "./components/NotificationsView";
import StudentProgressView from "./components/courses/StudentProgressView";
import CourseAnalyticsView from "./components/courses/CourseAnalyticsView";
import AssignmentsView from "./components/courses/AssignmentsView";
import CertificatesView from "./components/courses/CertificatesView";
import CoursesListView from "./components/courses/CoursesListView";
import CreatorPayoutsView from "./components/courses/CreatorPayoutsView";
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
  const [settingsSubTab, setSettingsSubTab] = useState<string>("");
  const [previewWsRole, setPreviewWsRole] = useState<string | null>(null);
  const [platformMode, setPlatformMode] = useState(false);

  // Super Admin always starts on platform overview
  const [initialTabSet, setInitialTabSet] = useState(false);
  useEffect(() => {
    if (currentUser && !initialTabSet) {
      const hashTab = window.location.hash?.substring(1);
      const isSa = currentUser.platformRole === PlatformRole.SUPER_ADMIN;
      if (isSa && (!hashTab || hashTab === "dashboard")) {
        setActiveTab("superadmin");
        setPlatformMode(true);
        window.location.hash = "superadmin";
      }
      setInitialTabSet(true);
    }
  }, [currentUser, initialTabSet]);

  // Check if current path is a public course/preview route
  const isPublicRoute = typeof window !== "undefined" && (
    window.location.pathname.startsWith("/course/") ||
    window.location.pathname.startsWith("/preview/course/") ||
    window.location.pathname.startsWith("/community/") ||
    window.location.pathname.startsWith("/creator/") ||
    window.location.pathname.startsWith("/communities") ||
    window.location.pathname.startsWith("/courses") ||
    window.location.pathname.startsWith("/features") ||
    window.location.pathname.startsWith("/pricing") ||
    window.location.pathname.startsWith("/blog") ||
    window.location.pathname.startsWith("/about") ||
    window.location.pathname.startsWith("/contact") ||
    window.location.pathname.startsWith("/faq") ||
    window.location.pathname.startsWith("/builder") ||
    window.location.pathname.startsWith("/c/")
  );
  
  // Data array state
  const [posts, setPosts] = useState<Post[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // UX modal triggers
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("skool_onboarding_dismissed"));
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

    let ignore = false;

    async function syncCommunityData() {
      try {
        // Fetch posts
        const postRes = await fetch(`/api/posts?communityId=${activeCommunityId}`);
        const postData = await postRes.json();
        if (!ignore && postData.posts) {
          setPosts(postData.posts);
        }

        // Fetch courses
        const courseRes = await fetch(`/api/courses?communityId=${activeCommunityId}`);
        const courseData = await courseRes.json();
        if (!ignore && courseData.courses) {
          setCourses(courseData.courses);
        }

        // Fetch events
        const eventRes = await fetch(`/api/events?communityId=${activeCommunityId}`);
        const eventData = await eventRes.json();
        if (!ignore && eventData.events) {
          setEvents(eventData.events);
        }

      } catch (err) {
        if (!ignore) console.error("Community feed and courses sync error:", err);
      }
    }
    syncCommunityData();

    return () => { ignore = true; };
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
      if (path.startsWith("/admin") || path.startsWith("/platform") || path.startsWith("/enterprise") || path.startsWith("/security") || path.startsWith("/global-analytics") || hash?.startsWith("#superadmin") || hash?.startsWith("#platform") || hash?.startsWith("#admin")) {
        targetTab = "superadmin";
      } else if (path.startsWith("/creator") || hash?.startsWith("#mrr")) {
        targetTab = "monetization";
      } else if (path.startsWith("/settings") || hash?.startsWith("#settings")) {
        targetTab = "settings";
        const qIdx = hash ? hash.indexOf("?") : -1;
        if (qIdx >= 0) {
          const qs = hash.substring(qIdx + 1);
          const params = new URLSearchParams(qs);
          setSettingsSubTab(params.get("tab") || "");
        }
      } else if (path.startsWith("/preview/course/") || path.startsWith("/course/")) {
        // Public course pages should load the public website, not the dashboard
        return; // Let the SPA fall through to PublicWebsite
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
        if (window.location.hash !== "#feed") {
          window.location.hash = "feed";
        }
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
  const handleRoleChange = async (newRole: string) => {
    if (!currentUser) return;

    // If switching to Super Admin, clear preview and redirect to platform view
    if (newRole === "super_admin") {
      setPreviewWsRole(null);
      setActiveTab("superadmin");
      window.location.hash = "superadmin";
      return;
    }

    // For Super Admin users, use preview role to simulate workspace role views
    const isSa = currentUser.platformRole === PlatformRole.SUPER_ADMIN;
    if (isSa) {
      setPreviewWsRole(newRole);
      return;
    }

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
        setNotifications(prev => [mockNotif, ...prev]);

        // Auto-revert tab back to feed if switching away and current tab lacks clearance
        if (!canAccessTab(activeTab, updatedUser, activeCommunityId)) {
          setActiveTab("feed");
          window.location.hash = "feed";
        }
      }
    } catch (e) {
      console.error("Role switch failed:", e);
    }
  };

  // Toggle between Platform Mode and Workspace Mode (Super Admin only)
  const handleTogglePlatformMode = () => {
    const newMode = !platformMode;
    setPlatformMode(newMode);
    if (newMode) {
      setPreviewWsRole(null);
      setActiveTab("superadmin");
      window.location.hash = "superadmin";
    } else {
      setActiveTab("dashboard");
      window.location.hash = "dashboard";
    }
  };

  // Mark all notifications read
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all notifications read failed:", err);
    }
  };

  // Upvote / Like Post
  const handleLikePost = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to like post.");
    if (data.success && data.post) {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likes: data.post.likes, likedByUserIds: data.post.likedByUserIds || p.likedByUserIds };
        }
        return p;
      }));
    }
  };

  // Pin Post toggle (Creator Privilege)
  const handlePinPost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/pin`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { console.error("Failed to pin post:", data.error); return; }
      if (data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) return { ...p, isPinned: !p.isPinned };
          return p;
        }));
      }
    } catch (err) {
      console.error("Failed to pin post:", err);
    }
  };

  // Add Dynamic Post Discussions
  const handleAddPost = async (title: string, content: string, category: string, tags: string[]) => {
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
    if (!res.ok) throw new Error(data.error || "Failed to create post.");
    if (data.success && data.post) {
      setPosts(prev => [data.post, ...prev]);
      setCurrentUser(prev => {
        if (!prev) return prev;
        const updatedXp = prev.xp + 15;
        const updatedLevel = Math.floor(updatedXp / 200) > prev.level ? prev.level + 1 : prev.level;
        return { ...prev, xp: updatedXp, level: updatedLevel };
      });
      const freshAlert: Notification = {
        id: `n-${Date.now()}`,
        userId: currentUser?.id || "user-student",
        title: "Discussion Created Key (+15 XP) 🎉",
        message: `Your channel subject "${title}" has been successfully drafted to PostgreSQL.`,
        type: "comment",
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [freshAlert, ...prev]);
    }
  };

  // Register Event RSVP
  const handleRsvpEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { console.error("Failed to RSVP:", data.error); return; }
      if (data.success && data.event) {
        setEvents(prev => prev.map(e => e.id === eventId ? data.event : e));
        setCurrentUser(prev => {
          if (!prev) return prev;
          const updatedXp = prev.xp + 20;
          const updatedLevel = Math.floor(updatedXp / 200) > prev.level ? prev.level + 1 : prev.level;
          return { ...prev, xp: updatedXp, level: updatedLevel };
        });
      }
    } catch (err) {
      console.error("Failed to RSVP:", err);
    }
  };

  const handleAwardXp = (amount: number) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const updatedXp = prev.xp + amount;
      const updatedLevel = Math.floor(updatedXp / 200) > prev.level ? prev.level + 1 : prev.level;
      return { ...prev, xp: updatedXp, level: updatedLevel };
    });

    const freshAlert: Notification = {
      id: `n-custom-xp-${Date.now()}`,
      userId: currentUser?.id || "",
      title: `Quest Completed (+${amount} XP) 🏅`,
      message: `Successfully resolved dynamic workspace challenge! Level progress increased.`,
      type: "level_up",
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [freshAlert, ...prev]);
  };

  const handleRefreshCourses = async () => {
    if (!activeCommunityId) return;
    try {
      const res = await fetch(`/api/courses?communityId=${activeCommunityId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch courses.");
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
      if (!res.ok) throw new Error(data.error || "Failed to create community.");
      if (data.success && data.community) {
        setCommunities(prev => [...prev, data.community]);
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

        const targetNotif: Notification = {
          id: `comm-notif-${Date.now()}`,
          userId: currentUser?.id || "user-student",
          title: "Subdomain Sub-tier Launched! 🌐",
          message: `Created dynamic space "${data.community.name}" securely. Check the sub-menu left rail channel views!`,
          type: "level_up",
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [targetNotif, ...prev]);
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
      if (!res.ok) throw new Error(data.error || "Failed to update community.");
      if (data.success && data.community) {
        setCommunities(prev => prev.map(c => c.id === activeCommunityId ? { ...c, ...updatedFields } : c));
        return true;
      }
    } catch (err) {
      console.error("Update community failed:", err);
    }
    return false;
  };

  const activeCommunity = communities.find(c => c.id === activeCommunityId) || null;

  // Fetch tenant-isolated security logs whenever the active tab pivots
  useEffect(() => {
    if (activeTab !== "audit_logs_tab" || !activeCommunityId) return;
    const controller = new AbortController();
    fetch(`/api/rbac/audit-logs?workspaceId=${activeCommunityId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (!controller.signal.aborted && data.auditLogs) console.debug("ws audit logs", data.auditLogs);
      })
      .catch((err: unknown) => console.debug("Audit log fetch failed:", err));
    return () => controller.abort();
  }, [activeTab, activeCommunityId]);

  const platformTotalMRR = useMemo(() => communities.reduce((sum, c) => sum + (c.isPremium ? (c.priceMonthly || 0) : 0), 0), [communities]);
  const platformCommissionFee = 3;

  if (!currentUser || isPublicRoute) {
    return <PublicWebsite
      onAuthSuccess={(user) => {
        setCurrentUser(user);
        window.location.href = "/";
      }}
    />;
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
          window.location.hash = "dashboard";
          setIsMobileSidebarOpen(false); // Auto-dismiss on workspace change
        }}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.location.hash = tab;
          setIsMobileSidebarOpen(false); // Auto-dismiss on tab click
        }}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        previewWsRole={previewWsRole}
        platformMode={platformMode}
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
          openOnboarding={() => { localStorage.removeItem("skool_onboarding_dismissed"); setShowOnboarding(true); }}
          openCreateCommunity={() => setShowCreateCommunity(true)}
          onTabChange={(tab) => {
            if (canAccessTab(tab, currentUser, activeCommunityId)) {
              setActiveTab(tab);
              window.location.hash = tab;
            } else if (tab !== activeTab) {
              setActiveTab("feed");
              window.location.hash = "feed";
            }
          }}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onLogout={handleLogout}
          platformMode={platformMode}
          onTogglePlatformMode={handleTogglePlatformMode}
          previewWsRole={previewWsRole}
        />

        {/* Bootstrap Super Admin (shown when no super admin exists) */}
        <BootstrapAdmin
          currentUser={currentUser}
          onAdminClaimed={(user) => {
            setCurrentUser(user);
            setPlatformMode(true);
            setActiveTab("superadmin");
            window.location.hash = "superadmin";
          }}
        />

        {/* Tab Route Content Mount */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          {activeTab === "dashboard" && (
            <ErrorBoundary>
              <WorkspaceDashboardView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                communities={communities}
                onChangeTab={(tab) => { setActiveTab(tab); window.location.hash = tab; }}
                onAddXp={handleAwardXp}
              />
            </ErrorBoundary>
          )}

          {/* Feed and Community both render FeedView */}
          {(activeTab === "feed" || activeTab === "community") && (
            <ErrorBoundary>
              <FeedView
                userRole={currentUser?.workspaceRoles?.[activeCommunityId] || WorkspaceRole.MEMBER}
                currentUserId={currentUser?.id}
                activeCommunity={activeCommunity}
                posts={posts}
                onLikePost={handleLikePost}
                onAddPost={handleAddPost}
                onPinPost={handlePinPost}
                onUpdateCommunity={handleUpdateActiveCommunity}
              />
            </ErrorBoundary>
          )}

          {activeTab === "classroom" && (
            <ErrorBoundary>
              <ClassroomView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                courses={courses}
              />
            </ErrorBoundary>
          )}

          {activeTab === "courses" && canAccessTab("courses", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CoursesListView workspaceId={activeCommunityId} />
            </ErrorBoundary>
          ) : activeTab === "courses" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Courses is restricted.
            </div>
          ) : null}

          {activeTab === "course-studio" && canAccessTab("course-studio", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CourseBuilder
                communityId={activeCommunityId}
                initialCourses={courses.map(c => ({
                  id: c.id,
                  communityId: c.communityId || activeCommunityId,
                  name: c.name || "Untitled",
                  description: c.description || "",
                  coverUrl: c.coverUrl || "",
                  category: "General",
                  modules: (c.modules || []).map(m => ({
                    id: m.id || `mod-${Math.random().toString(36).slice(2, 6)}`,
                    title: m.title || "Module",
                    index: m.index || 0,
                    lessons: (m.lessons || []).map(l => ({
                      id: l.id || `lesson-${Math.random().toString(36).slice(2, 6)}`,
                      title: l.title || "Lesson",
                      durationMinutes: l.durationMinutes || 10,
                      contentType: l.contentType || "text" as const,
                      blocks: [
                        { id: `block-${Date.now()}`, type: "heading" as const, content: l.title || "Lesson" },
                        { id: `block-${Date.now() + 1}`, type: "paragraph" as const, content: "Content goes here." },
                      ],
                      isLocked: l.isLocked || false,
                      status: "draft" as const,
                      videoUrl: l.videoUrl || "",
                      textContent: l.textContent || "",
                      quizQuestions: l.quizQuestions || [],
                      assignmentInstructions: l.assignmentInstructions || "",
                      attachments: l.attachments || [],
                    })),
                  })),
                  status: (c.status || "draft") as "draft" | "published" | "archived",
                  price: 0,
                  isFree: true,
                  instructorName: "",
                  instructorAvatar: "",
                  enrolledCount: c.enrolledCount || 0,
                  completionRate: 0,
                  revenue: 0,
                  createdAt: c.createdAt || new Date().toISOString(),
                  updatedAt: c.updatedAt || new Date().toISOString(),
                }))}
                onCoursesChange={(updated) => {
                  setCourses(prev => {
                    const courseMap = new Map(prev.map(c => [c.id, c]));
                    updated.forEach((d: any) => {
                      courseMap.set(d.id, {
                        id: d.id,
                        communityId: d.communityId || activeCommunityId,
                        name: d.name,
                        description: d.description,
                        coverUrl: d.coverUrl,
                        isPremiumOnly: false,
                        modulesCount: d.modules?.length || 0,
                        enrolledCount: d.enrolledCount || 0,
                        status: d.status,
                        modules: (d.modules || []).map((m: any) => ({
                          id: m.id,
                          courseId: d.id,
                          title: m.title,
                          index: m.index,
                          lessons: (m.lessons || []).map((l: any) => ({
                            id: l.id,
                            moduleId: m.id,
                            title: l.title,
                            durationMinutes: l.durationMinutes,
                            videoUrl: l.videoUrl,
                            textContent: l.textContent,
                            index: 0,
                            isLocked: l.isLocked,
                            contentType: l.contentType,
                            attachments: l.attachments || [],
                            quizQuestions: l.quizQuestions || [],
                            assignmentInstructions: l.assignmentInstructions || "",
                          })),
                        })),
                        createdAt: d.createdAt,
                        updatedAt: d.updatedAt,
                      });
                    });
                    return Array.from(courseMap.values());
                  });
                  // Award badge once
                  if (currentUser && !currentUser.badges.includes("Course Master")) {
                    setCurrentUser({ ...currentUser, badges: [...currentUser.badges, "Course Master"], xp: currentUser.xp + 30 });
                  }
                }}
                currentUser={currentUser}
              />
            </ErrorBoundary>
          ) : activeTab === "course-studio" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
               403 Forbidden - Course Studio is restricted to Owner, Admin, or Instructor.
            </div>
          ) : null}

          {activeTab === "calendar" && (
            <ErrorBoundary>
              <CalendarView
                userRole={currentUser?.workspaceRoles?.[activeCommunityId] || WorkspaceRole.MEMBER}
                activeCommunityId={activeCommunityId}
                events={events}
                onAddEvent={(evt) => setEvents(prev => [evt, ...prev])}
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
              <StudentProgressView workspaceId={activeCommunityId} />
            </ErrorBoundary>
          ) : activeTab === "students" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Students is restricted.
            </div>
          ) : null}

          {activeTab === "course-analytics" && canAccessTab("course-analytics", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CourseAnalyticsView workspaceId={activeCommunityId} />
            </ErrorBoundary>
          ) : activeTab === "course-analytics" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Course Analytics is restricted.
            </div>
          ) : null}

          {activeTab === "assignments" && canAccessTab("assignments", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <AssignmentsView workspaceId={activeCommunityId} />
            </ErrorBoundary>
          ) : activeTab === "assignments" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Assignments is restricted.
            </div>
          ) : null}

          {activeTab === "certificates" && canAccessTab("certificates", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CertificatesView workspaceId={activeCommunityId} />
            </ErrorBoundary>
          ) : activeTab === "certificates" ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Certificates is restricted.
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

          {activeTab === "payouts" && (currentUser?.platformRole !== PlatformRole.SUPER_ADMIN || previewWsRole) && canAccessTab("payouts", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <CreatorPayoutsView
                workspaceId={activeCommunityId}
                workspaceName={activeCommunity?.name}
              />
            </ErrorBoundary>
          ) : activeTab === "payouts" && (currentUser?.platformRole !== PlatformRole.SUPER_ADMIN || previewWsRole) ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden
            </div>
          ) : activeTab === "payouts" && currentUser?.platformRole === PlatformRole.SUPER_ADMIN && !previewWsRole ? (
            <div className="p-8 text-center text-amber-700 font-bold bg-amber-50 border border-amber-200 rounded-2xl m-6">
              Switch to Platform View to manage platform payouts.
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

          {activeTab === "settings" && (currentUser?.platformRole !== PlatformRole.SUPER_ADMIN || previewWsRole) && canAccessTab("settings", currentUser, activeCommunityId) ? (
            <ErrorBoundary>
              <SettingsView
                currentUser={currentUser}
                activeCommunity={activeCommunity}
                onUpdateCommunity={handleUpdateActiveCommunity}
                wsRole={currentUser?.workspaceRoles?.[activeCommunityId] || WorkspaceRole.MEMBER}
                onUpdateUser={setCurrentUser}
                onTabChange={setActiveTab}
                initialSubTab={settingsSubTab}
              />
            </ErrorBoundary>
          ) : activeTab === "settings" && (currentUser?.platformRole !== PlatformRole.SUPER_ADMIN || previewWsRole) ? (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded-2xl m-6">
              403 Forbidden - Settings is restricted to Owner or Admin.
            </div>
          ) : activeTab === "settings" && currentUser?.platformRole === PlatformRole.SUPER_ADMIN && !previewWsRole ? (
            <div className="p-8 text-center text-amber-700 font-bold bg-amber-50 border border-amber-200 rounded-2xl m-6">
              Switch to Platform View to manage platform settings.
            </div>
          ) : null}

          {/* Platform Mode routing: individual platform components */}
          {(() => {
            if (!platformMode || previewWsRole || !canAccessTab("superadmin", currentUser, activeCommunityId)) return null;

            return (
              <div className="max-w-7xl mx-auto px-6 py-6 w-full">
                <div className="bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-2xl p-4 border border-indigo-100/50 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                      P
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">Platform Control Center</span>
                      <span className="text-[10px] text-slate-400">Global administration and system configuration</span>
                    </div>
                  </div>
                </div>
                <Suspense fallback={<div className="py-12 text-center text-slate-400 font-mono text-xs">Loading...</div>}>
                  {activeTab === "superadmin" && (
                    <ErrorBoundary>
                      <PlatformOverview currentUser={currentUser} communities={communities} />
                    </ErrorBoundary>
                  )}
                  {activeTab === "workspaces" && (
                    <ErrorBoundary>
                      <PlatformWorkspaces communities={communities} />
                    </ErrorBoundary>
                  )}
                  {activeTab === "users" && (
                    <ErrorBoundary>
                      <PlatformUsers currentUser={currentUser} />
                    </ErrorBoundary>
                  )}
                  {activeTab === "revenue" && (
                    <ErrorBoundary>
                      <PlatformRevenue totalMRR={platformTotalMRR} platformCommissionFee={platformCommissionFee} />
                    </ErrorBoundary>
                  )}
                  {activeTab === "payouts" && (
                    <ErrorBoundary>
                      <PlatformPayouts />
                    </ErrorBoundary>
                  )}
                  {activeTab === "analytics" && (
                    <ErrorBoundary>
                      <PlatformAnalytics totalMRR={platformTotalMRR} platformCommissionFee={platformCommissionFee} />
                    </ErrorBoundary>
                  )}
                  {activeTab === "security" && (
                    <ErrorBoundary>
                      <PlatformSecurity />
                    </ErrorBoundary>
                  )}
                  {activeTab === "logs" && (
                    <ErrorBoundary>
                      <PlatformAuditLogs />
                    </ErrorBoundary>
                  )}
                  {activeTab === "settings" && (
                    <ErrorBoundary>
                      <PlatformSettings currentUser={currentUser} />
                    </ErrorBoundary>
                  )}
                  {activeTab === "inbox" && (
                    <ErrorBoundary>
                      <PlatformInbox />
                    </ErrorBoundary>
                  )}
                </Suspense>
              </div>
            );
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

        </main>

      </div>

      {/* 4. SEED ONBOARDING INSTRUCTION GUIDE OVERLAY */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal branding */}
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => { localStorage.setItem("skool_onboarding_dismissed", "1"); setShowOnboarding(false); }}
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
                onClick={() => { localStorage.setItem("skool_onboarding_dismissed", "1"); setShowOnboarding(false); }}
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
