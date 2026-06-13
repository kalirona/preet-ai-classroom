/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MODERATOR = "moderator",
  MEMBER = "member"
}

export enum PlatformRole {
  SUPER_ADMIN = "super_admin",
  USER = "user"
}

export enum WorkspaceRole {
  OWNER = "owner",
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  MODERATOR = "moderator",
  MEMBER = "member"
}

export enum PlatformPermission {
  ACCESS_PLATFORM_ADMIN = "access_platform_admin",
  VIEW_GLOBAL_ANALYTICS = "view_global_analytics",
  VIEW_OWNER_MRR = "view_owner_mrr",
  ENTERPRISE_SECURITY = "enterprise_security",
  MANAGE_USERS = "manage_users",
  BILLING_INFRASTRUCTURE = "billing_infrastructure"
}

export enum WorkspacePermission {
  MANAGE_WORKSPACE = "manage_workspace",
  MANAGE_COURSES = "manage_courses",
  MANAGE_LESSONS = "manage_lessons",
  MANAGE_MEMBERS = "manage_members",
  ACCESS_BILLING = "access_billing",
  VIEW_ANALYTICS = "view_analytics",
  MANAGE_RESOURCES = "manage_resources",
  GRADE_ASSIGNMENTS = "grade_assignments",
  MODERATE_COMMUNITY = "moderate_community",
  MODERATE_CHAT = "moderate_chat",
  REMOVE_POSTS = "remove_posts",
  MODERATE_COMMENTS = "moderate_comments",
  MUTE_BAN_USERS = "mute_ban_users",
  VIEW_REPORTS = "view_reports",
  MODERATE_CONTENT = "moderate_content",
  VIEW_FEED = "view_feed",
  JOIN_CLASSROOM = "join_classroom",
  VIEW_CALENDAR = "view_calendar",
  CHAT_PARTICIPATION = "chat_participation",
  VIEW_RESOURCES = "view_resources",
  VIEW_PROFILE = "view_profile"
}

export const PLATFORM_ROLE_PERMISSIONS: Record<PlatformRole, PlatformPermission[]> = {
  [PlatformRole.SUPER_ADMIN]: [
    PlatformPermission.ACCESS_PLATFORM_ADMIN,
    PlatformPermission.VIEW_GLOBAL_ANALYTICS,
    PlatformPermission.VIEW_OWNER_MRR,
    PlatformPermission.ENTERPRISE_SECURITY,
    PlatformPermission.MANAGE_USERS,
    PlatformPermission.BILLING_INFRASTRUCTURE
  ],
  [PlatformRole.USER]: []
};

export const WORKSPACE_ROLE_PERMISSIONS: Record<WorkspaceRole, WorkspacePermission[]> = {
  [WorkspaceRole.OWNER]: [
    WorkspacePermission.MANAGE_WORKSPACE,
    WorkspacePermission.MANAGE_COURSES,
    WorkspacePermission.MANAGE_LESSONS,
    WorkspacePermission.MANAGE_MEMBERS,
    WorkspacePermission.ACCESS_BILLING,
    WorkspacePermission.VIEW_ANALYTICS,
    WorkspacePermission.MANAGE_RESOURCES,
    WorkspacePermission.GRADE_ASSIGNMENTS,
    WorkspacePermission.MODERATE_COMMUNITY,
    WorkspacePermission.MODERATE_CHAT,
    WorkspacePermission.REMOVE_POSTS,
    WorkspacePermission.MODERATE_COMMENTS,
    WorkspacePermission.MUTE_BAN_USERS,
    WorkspacePermission.VIEW_REPORTS,
    WorkspacePermission.MODERATE_CONTENT,
    WorkspacePermission.VIEW_FEED,
    WorkspacePermission.JOIN_CLASSROOM,
    WorkspacePermission.VIEW_CALENDAR,
    WorkspacePermission.CHAT_PARTICIPATION,
    WorkspacePermission.VIEW_RESOURCES,
    WorkspacePermission.VIEW_PROFILE
  ],
  [WorkspaceRole.ADMIN]: [
    WorkspacePermission.MANAGE_COURSES,
    WorkspacePermission.MANAGE_LESSONS,
    WorkspacePermission.MANAGE_MEMBERS,
    WorkspacePermission.MANAGE_RESOURCES,
    WorkspacePermission.VIEW_ANALYTICS,
    WorkspacePermission.MODERATE_COMMUNITY,
    WorkspacePermission.MODERATE_CHAT,
    WorkspacePermission.REMOVE_POSTS,
    WorkspacePermission.MODERATE_COMMENTS,
    WorkspacePermission.MUTE_BAN_USERS,
    WorkspacePermission.VIEW_REPORTS,
    WorkspacePermission.MODERATE_CONTENT,
    WorkspacePermission.VIEW_FEED,
    WorkspacePermission.JOIN_CLASSROOM,
    WorkspacePermission.VIEW_CALENDAR,
    WorkspacePermission.CHAT_PARTICIPATION,
    WorkspacePermission.VIEW_RESOURCES,
    WorkspacePermission.VIEW_PROFILE
  ],
  [WorkspaceRole.INSTRUCTOR]: [
    WorkspacePermission.MANAGE_COURSES,
    WorkspacePermission.MANAGE_LESSONS,
    WorkspacePermission.GRADE_ASSIGNMENTS,
    WorkspacePermission.VIEW_ANALYTICS,
    WorkspacePermission.VIEW_FEED,
    WorkspacePermission.JOIN_CLASSROOM,
    WorkspacePermission.VIEW_CALENDAR,
    WorkspacePermission.VIEW_RESOURCES,
    WorkspacePermission.VIEW_PROFILE
  ],
  [WorkspaceRole.MODERATOR]: [
    WorkspacePermission.VIEW_FEED,
    WorkspacePermission.JOIN_CLASSROOM,
    WorkspacePermission.VIEW_CALENDAR,
    WorkspacePermission.CHAT_PARTICIPATION,
    WorkspacePermission.VIEW_RESOURCES,
    WorkspacePermission.VIEW_PROFILE,
    WorkspacePermission.MODERATE_CHAT,
    WorkspacePermission.REMOVE_POSTS,
    WorkspacePermission.MODERATE_COMMENTS,
    WorkspacePermission.MUTE_BAN_USERS,
    WorkspacePermission.VIEW_REPORTS,
    WorkspacePermission.MODERATE_CONTENT
  ],
  [WorkspaceRole.MEMBER]: [
    WorkspacePermission.VIEW_FEED,
    WorkspacePermission.JOIN_CLASSROOM,
    WorkspacePermission.VIEW_CALENDAR,
    WorkspacePermission.CHAT_PARTICIPATION,
    WorkspacePermission.VIEW_RESOURCES,
    WorkspacePermission.VIEW_PROFILE
  ]
};

export function getRoleDisplayLabel(role: WorkspaceRole): string {
  switch (role) {
    case WorkspaceRole.OWNER:
      return "Creator";
    case WorkspaceRole.ADMIN:
      return "Admin";
    case WorkspaceRole.INSTRUCTOR:
      return "Instructor";
    case WorkspaceRole.MODERATOR:
      return "Moderator";
    case WorkspaceRole.MEMBER:
      return "Member";
    default:
      return role;
  }
}

export function can(
  permission: WorkspacePermission | PlatformPermission | string,
  user: User | null,
  activeCommunityId?: string
): boolean {
  if (!user) return false;

  // Super Admin bypasses all checks
  if (user.platformRole === PlatformRole.SUPER_ADMIN) {
    return true;
  }

  // Check Platform Permission
  const platformPerms = PLATFORM_ROLE_PERMISSIONS[user.platformRole] || [];
  if (platformPerms.includes(permission as PlatformPermission)) {
    return true;
  }

  // Check Workspace Specific Permission
  if (activeCommunityId && user.workspaceRoles) {
    const wsRole = user.workspaceRoles[activeCommunityId];
    if (wsRole) {
      const wsPerms = WORKSPACE_ROLE_PERMISSIONS[wsRole] || [];
      if (wsPerms.includes(permission as WorkspacePermission)) {
        return true;
      }
    }
  }

  return false;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string; // Matches communityId
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  status: "active" | "invited" | "banned" | "muted";
}

export interface AuditLog {
  id: string;
  workspaceId?: string; // Tenant isolation (defined for local workspace actions)
  userId: string;
  userName: string;
  action: string; // "ROLE_UPDATED", "USER_BANNED", "POST_DELETED", "COURSE_CREATED", "BILLING_ACCESSED"
  details: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole; // Legacy fallback
  platformRole: PlatformRole; // Enterprise global platform role
  workspaceRoles?: Record<string, WorkspaceRole>; // Dictionary of active workspace membership roles
  avatarUrl: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  joinedCommunities: string[]; // List of community IDs
  joinedAt: string;
  earnings?: number; // Creator dashboard MRR earnings
  bio?: string;
  referredBy?: string;
  password?: string;
  mfaEnabled?: boolean;
  mfaSecret?: string;
  mfaBackupCodes?: string[];
  completedLessons?: string[]; // Persistent list of completed lesson IDs
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  content: string;
  rating: number;
}

export interface CommunityBranding {
  logoUrl: string;
  primaryColor: string; // Tailwind color, or Hex code
  secondaryColor: string;
  accentColor: string;
  bannerUrl: string;
  domain?: string;
}

export interface Community {
  id: string;
  name: string;
  subdomain: string;
  description: string;
  branding: CommunityBranding;
  membersCount: number;
  ownerId: string;
  isPremium: boolean;
  priceMonthly: number; // MRR in USD
  isFeatured?: boolean;
  landingHeroTitle?: string;
  landingHeroSubtitle?: string;
  faqs?: FAQItem[];
  testimonials?: TestimonialItem[];
  categories: string[]; // e.g. ["Introductions", "General", "Questions", "Showcase"]
  createdAt: string;
  isPrivate?: boolean;
}

export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  title: string;
  content: string;
  category: string;
  likes: number; // Likes count
  likedByUserIds: string[];
  commentsCount: number;
  isPinned: boolean;
  isAnnouncement: boolean;
  tags: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string; // If nested reply
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  durationMinutes: number;
  videoUrl: string; // Bunny Stream, Vimeo or placeholder YouTube
  textContent: string;
  index: number;
  isLocked: boolean;
  attachments?: string[]; // Array of strings (e.g. PDF names, resource titles)
  contentType?: "video" | "text" | "download" | "quiz" | "assignment";
  quizQuestions?: QuizQuestion[];
  assignmentInstructions?: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  index: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  communityId: string;
  name: string;
  description: string;
  coverUrl: string;
  isPremiumOnly: boolean;
  modulesCount: number;
  enrolledCount: number;
  modules: Module[];
}

export interface LiveEvent {
  id: string;
  communityId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  platform: "Zoom" | "Google Meet" | "YouTube Live" | "Vimeo";
  platformUrl: string;
  category: "Class" | "Q&A" | "Mastermind" | "Coaching";
  hostName: string;
  hostAvatar: string;
  timezone?: string;
  attendees: string[]; // User IDs attending
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string; // User ID or "group-chat-id" or "community-id"
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "like" | "comment" | "level_up" | "live_event" | "payment" | "challenge" | "badge" | "mention";
  isRead: boolean;
  createdAt: string;
}

export interface Space {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  accessType: "public" | "private" | "paid" | "invite_only";
  sortOrder: number;
  postCount: number;
  isArchived: boolean;
}

export interface Challenge {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  challengeType: "daily" | "weekly" | "sprint";
  durationDays: number;
  xpReward: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  participantCount: number;
  tasks: ChallengeTask[];
  participants: ChallengeParticipant[];
}

export interface ChallengeTask {
  id: string;
  challengeId: string;
  title: string;
  description: string;
  day: number;
  taskType: string;
  xpPerCompletion: number;
  sortOrder: number;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  xp: number;
  level: number;
  joinedAt: string;
  completedTasks: string[];
  isCompleted: boolean;
  completedAt: string;
  tasksCompleted: number;
}

export interface XpTransaction {
  id: string;
  userId: string;
  workspaceId: string;
  amount: number;
  reason: string;
  referenceType: string;
  referenceId: string;
  createdAt: string;
}

export interface MemberActivity {
  id: string;
  workspaceId: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  level: number;
  activityType: string;
  description: string;
  referenceType: string;
  referenceId: string;
  createdAt: string;
}

export interface CommunityHealth {
  totalMembers: number;
  active30d: number;
  active7d: number;
  engagement30d: number;
  retention30d: number;
  newMembers30d: number;
  posts30d: number;
  comments30d: number;
  reactions30d: number;
  topContributors: any[];
  churnRisk: any[];
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  communityId: string;
  communityName: string;
  amount: number;
  type: "onetime" | "subscription";
  status: "completed" | "pending";
  createdAt: string;
}

export interface GamificationLevel {
  level: number;
  requiredXp: number;
  title: string;
  badgeUrl?: string;
  rewardsDescription?: string;
}
