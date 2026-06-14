import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import { verify as verifyTOTP } from "otplib";
import { Server as SocketServer } from "socket.io";

import {
  findUserByEmail, findUserById, findUserByUsername, createUser, updateUser,
  findWorkspacesAccessibleByUser, findWorkspaceById, findWorkspaceBySubdomain,
  createWorkspace, updateWorkspace, findWorkspaceMember, createWorkspaceMember,
  updateWorkspaceMember, findWorkspaceMembers, findUserWorkspaceRoles,
  findPostsByWorkspace, findPostById, createPost, updatePost,
  findCommentsByPost, createComment, findCoursesWithContent, findCourseById,
  createCourse, updateCourse, deleteCourse, findModulesByCourse, createModule,
  findLessonsByModule, findLessonById, createLesson,
  findEventsByWorkspace, findEventById, createEvent, updateEvent,
  findMessages, createMessage, findNotificationsByUser, createNotification,
  markAllNotificationsRead, createTransaction, findUserTransactions,
  findUserTransactionsByWorkspace, createAuditLog, findAuditLogsByWorkspace,
  findAllAuditLogs, createSession, findSessionByTokenHash, deleteUserSessions,
  findChannelsByWorkspace, createChannel, deleteChannel,
  getLoginAttempts, upsertLoginAttempts, resetLoginAttempts,
  findWorkspaceUserIds, findUsersByIds, findAllUsers, query, transaction,
  isDatabaseSeeded, createSchema, cleanupExpiredSessions, cleanupExpiredResetTokens, getPool,
} from "./server/db.js";
import {
  findSpacesByWorkspace, findSpaceById, createSpace, updateSpace, deleteSpace,
  findPostsBySpace, createPostWithSpace, togglePostReaction, getPostReactions,
  findCommentsThreaded, toggleCommentReaction,
  addXp, getXpHistory, getWorkspaceLeaderboard,
  findLessonDiscussions, createLessonDiscussion,
  upsertLessonNote, findLessonNote,
  findMemberActivity, findUserActivity, logActivity,
  findCommunityFeed, getCommunityHealthScore, awardBadge,
} from "./server/community-db.js";
import { sendPasswordResetEmail } from "./server/email.js";

import { createOrder, captureOrder, verifyWebhook } from "./server/paypal.js";

import {
  User, Community, Post, Comment, Course, Module, Lesson, LiveEvent,
  DirectMessage, Notification, Transaction, PlatformRole,
  WorkspaceRole, PlatformPermission, WorkspacePermission,
  PLATFORM_ROLE_PERMISSIONS, WORKSPACE_ROLE_PERMISSIONS, can,
} from "./src/types";

const app = express();

const SESSION_SECRET = (() => {
  const env = process.env.SESSION_SECRET;
  if (env && env.length >= 32) return env;
  const generated = crypto.randomBytes(64).toString("hex");
  console.warn("WARNING: No SESSION_SECRET env var set. Generated a temporary one. Set SESSION_SECRET for persistence across restarts.");
  return generated;
})();

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://www.paypal.com", "https://*.youtube.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://www.paypalobjects.com", "https://*.youtube.com", "https://i.ytimg.com"],
      connectSrc: ["'self'", "https://www.paypal.com"],
      frameSrc: ["'self'", "https://www.paypal.com", "https://www.youtube.com", "https://*.youtube.com", "https://*.vimeo.com"],
      objectSrc: ["'none'"],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: "1mb" }));
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api", generalLimiter);

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim();
}

function sanitize(obj: any): any {
  if (typeof obj === "string") return stripHtml(obj);
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, val] of Object.entries(obj)) {
      sanitized[key] = sanitize(val);
    }
    return sanitized;
  }
  return obj;
}

app.use((req, _res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    req.body = sanitize(req.body);
  }
  next();
});

app.set("trust proxy", 1);

if (process.env.NODE_ENV === "production") {
  app.use((_req: any, res: any, next: any) => {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    next();
  });
}

function timingSafeCompare(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

async function hashPassword(pwd: string): Promise<string> {
  return bcrypt.hash(pwd, 12);
}

async function verifyPassword(pwd: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pwd, hash);
}

function generateTokenString(): string {
  return crypto.randomBytes(48).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getTokenExpiry(rememberMe: boolean): Date {
  const ms = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

function rowToUser(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    fullName: row.full_name,
    role: row.role,
    platformRole: row.platform_role,
    avatarUrl: row.avatar_url,
    xp: row.xp,
    level: row.level,
    streak: row.streak,
    badges: row.badges || [],
    joinedCommunities: row.joined_communities || [],
    joinedAt: row.joined_at,
    bio: row.bio,
    earnings: row.earnings,
    referredBy: row.referred_by,
    mfaEnabled: row.mfa_enabled,
    mfaSecret: row.mfa_secret,
    mfaBackupCodes: row.mfa_backup_codes || [],
    completedLessons: row.completed_lessons || [],
    password: row.password_hash,
  };
}

function rowToCommunity(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    subdomain: row.subdomain,
    description: row.description,
    branding: typeof row.branding === "string" ? JSON.parse(row.branding) : row.branding,
    membersCount: row.members_count,
    ownerId: row.owner_id,
    isPremium: row.is_premium,
    priceMonthly: parseFloat(row.price_monthly) || 0,
    isFeatured: row.is_featured,
    landingHeroTitle: row.landing_hero_title,
    landingHeroSubtitle: row.landing_hero_subtitle,
    categories: row.categories || [],
    faqs: typeof row.faqs === "string" ? JSON.parse(row.faqs) : row.faqs || [],
    testimonials: typeof row.testimonials === "string" ? JSON.parse(row.testimonials) : row.testimonials || [],
    isPrivate: row.is_private,
    createdAt: row.created_at,
  };
}

function rowToPost(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    communityId: row.workspace_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    authorRole: row.author_role,
    title: row.title,
    content: row.content,
    category: row.category,
    likes: row.likes,
    likedByUserIds: row.liked_by_user_ids || [],
    commentsCount: row.comments_count,
    isPinned: row.is_pinned,
    isAnnouncement: row.is_announcement,
    tags: row.tags || [],
    createdAt: row.created_at,
  };
}

function rowToComment(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    postId: row.post_id,
    parentId: row.parent_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    authorRole: row.author_role,
    content: row.content,
    createdAt: row.created_at,
  };
}

function rowToCourse(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    communityId: row.workspace_id,
    name: row.name,
    description: row.description,
    coverUrl: row.cover_url,
    isPremiumOnly: row.is_premium_only,
    modulesCount: row.modules_count,
    enrolledCount: row.enrolled_count,
    modules: [],
  };
}

function rowToLesson(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    moduleId: row.module_id,
    title: row.title,
    durationMinutes: row.duration_minutes,
    videoUrl: row.video_url,
    textContent: row.text_content,
    index: row.index,
    isLocked: row.is_locked,
    attachments: row.attachments || [],
    contentType: row.content_type,
    quizQuestions: typeof row.quiz_questions === "string" ? JSON.parse(row.quiz_questions) : row.quiz_questions || [],
    assignmentInstructions: row.assignment_instructions,
  };
}

function rowToEvent(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    communityId: row.workspace_id,
    title: row.title,
    description: row.description,
    startAt: row.start_at,
    endAt: row.end_at,
    platform: row.platform,
    platformUrl: row.platform_url,
    category: row.category,
    hostName: row.host_name,
    hostAvatar: row.host_avatar,
    timezone: row.timezone,
    attendees: row.attendees || [],
  };
}

function rowToMessage(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderAvatar: row.sender_avatar,
    recipientId: row.recipient_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

function rowToNotification(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

function rowToTransaction(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    communityId: row.workspace_id,
    communityName: row.workspace_name,
    amount: parseFloat(row.amount) || 0,
    type: row.type,
    status: row.status,
    createdAt: row.created_at,
  };
}

function rowToAuditLog(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    userName: row.user_name,
    action: row.action,
    details: row.details,
    createdAt: row.created_at,
  };
}

async function getSessionUser(req: any): Promise<any | null> {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(/skool_token=([^;]+)/);
  if (!match) return null;

  const token = decodeURIComponent(match[1].trim());
  const tokenHash = hashToken(token);

  const session = await findSessionByTokenHash(tokenHash);
  if (!session) return null;

  const user = await findUserById(session.user_id);
  if (!user) return null;

  const workspaceRoles = await findUserWorkspaceRoles(user.id);
  return { ...rowToUser(user), workspaceRoles };
}

async function authenticateUser(req: any, res: any, next: any) {
  const user = await getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized. Please sign in." });
  }
  req.user = user;
  next();
}

function extractWorkspaceId(req: any): string | null {
  const id = req.params.id;
  if (id) {
    if (id.startsWith("comm-")) return id;
  }
  return req.params.workspaceId || req.params.communityId ||
    req.headers["x-workspace-id"] || req.headers["x-community-id"] ||
    req.query.workspaceId || req.query.communityId ||
    req.body.workspaceId || req.body.communityId || null;
}

function hasPlatformPermission(user: any, permission: PlatformPermission): boolean {
  return can(permission, user);
}

function requirePlatformPermission(permission: PlatformPermission) {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Authentication required." });

    if (hasPlatformPermission(user, permission)) return next();

    createAuditLog({
      user_id: user.id, user_name: user.fullName,
      action: "SECURITY_VIOLATION",
      details: `Denied platform permission: '${permission}'.`,
    });

    return res.status(403).json({ error: `Forbidden. Missing permission: ${permission}` });
  };
}

function requireWorkspacePermission(permission: WorkspacePermission) {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Authentication required." });

    if (user.platformRole === PlatformRole.SUPER_ADMIN) return next();

    const workspaceId = extractWorkspaceId(req);
    if (!workspaceId) {
      return res.status(400).json({ error: "Missing workspace tenant context." });
    }

    const userWithRoles = {
      ...user,
      platformRole: user.platformRole,
      workspaceRoles: user.workspaceRoles || {},
    };

    if (can(permission, userWithRoles, workspaceId)) return next();

    createAuditLog({
      workspace_id: workspaceId, user_id: user.id, user_name: user.fullName,
      action: "SECURITY_VIOLATION",
      details: `Access denied to workspace resource. Missing: ${permission}.`,
    });

    return res.status(403).json({ error: `Forbidden. Insufficient permissions: ${permission}` });
  };
}

async function formatUserForResponse(userId: string): Promise<any> {
  const user = await findUserById(userId);
  if (!user) return null;
  const workspaceRoles = await findUserWorkspaceRoles(userId);
  return { ...rowToUser(user), workspaceRoles };
}

async function addAuditLog(userId: string, userName: string, action: string, details: string, workspaceId?: string) {
  return createAuditLog({
    user_id: userId, user_name: userName, action, details,
    workspace_id: workspaceId || null,
  });
}

async function awardXp(userId: string, amount: number) {
  const user = await findUserById(userId);
  if (!user) return;
  const newXp = (user.xp || 0) + amount;
  const newLevel = Math.floor(newXp / 200) + 1;
  await updateUser(userId, { xp: newXp, level: newLevel });

  if (newLevel > (user.level || 1)) {
    await createNotification({
      user_id: userId, title: "Level Up! 🎉",
      message: `You advanced to Level ${newLevel}!`,
      type: "level_up",
    });
  }
}

let aiInstance: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "skool-saas" } },
    });
  }
  return aiInstance;
}

async function ensureSchema() {
  try {
    await createSchema();
    const seeded = await isDatabaseSeeded();
    if (!seeded) {
      console.log("Database is empty. Run `npm run migrate` to seed with demo data.");
    }
  } catch (err) {
    console.error("Schema initialization error:", err);
  }
}

app.get("/api/auth/session", async (req, res) => {
  const user = await getSessionUser(req);
  res.json({ user: user || null });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, username, fullName, password, bio, avatarUrl, rememberMe } = req.body;

    if (!email || !username || !fullName || !password) {
      return res.status(400).json({ error: "Email, username, full name, and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const emailLower = email.toLowerCase().trim();
    const usernameLower = username.toLowerCase().trim();

    const emailExists = await findUserByEmail(emailLower);
    if (emailExists) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const userExists = await findUserByUsername(usernameLower);
    if (userExists) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await createUser({
      email: emailLower,
      username: usernameLower,
      full_name: fullName,
      password_hash: passwordHash,
      role: "member",
      platform_role: "user",
      avatar_url: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      xp: 0, level: 1, streak: 1,
      badges: ["Daily Habit"],
      joined_communities: ["comm-ai"],
      bio: bio || "Enthusiastic new student.",
    });

    const commAi = await findWorkspaceById("comm-ai");
    if (commAi) {
      await updateWorkspace("comm-ai", { members_count: (commAi.members_count || 0) + 1 });
      await createWorkspaceMember({
        workspace_id: "comm-ai", user_id: newUser.id,
        role: "member", status: "active",
      });
    }

    const tokenStr = generateTokenString();
    const tokenHash = hashToken(tokenStr);
    await createSession({
      user_id: newUser.id, token_hash: tokenHash,
      remember_me: !!rememberMe, expires_at: getTokenExpiry(!!rememberMe),
    });

    const maxAge = rememberMe ? 2592000 : 86400;
    res.setHeader("Set-Cookie", `skool_token=${encodeURIComponent(tokenStr)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly;${process.env.NODE_ENV === "production" ? " Secure;" : ""}`);
    const userResponse = await formatUserForResponse(newUser.id);
    res.json({ success: true, user: userResponse });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const emailLower = email.toLowerCase().trim();

    // Demo accounts bypass lockout
    const demoEmails = [
      "creator@example.com",
      "instructor@example.com", 
      "lincolnflores223@gmail.com",
      "moderator@example.com",
      "admin@example.com"
    ];
    const isDemoAccount = demoEmails.includes(emailLower);

    const attempt = await getLoginAttempts(emailLower);
    if (!isDemoAccount && attempt && attempt.locked_until && new Date(attempt.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(attempt.locked_until).getTime() - Date.now()) / 60000);
      return res.status(423).json({ error: `Account locked. Try again in ${minutesLeft} minutes.` });
    }

    const user = await findUserByEmail(emailLower);
    if (!user) {
      if (!isDemoAccount) await upsertLoginAttempts(emailLower, null);
      return res.status(400).json({ error: "No account found with this email." });
    }

    if (!user.password_hash) {
      if (!isDemoAccount) await upsertLoginAttempts(emailLower, null);
      return res.status(400).json({ error: "Account has no password set. Use Google sign-in." });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      if (!isDemoAccount) {
        const lockedUntil = (attempt?.count || 0) >= 4 ? new Date(Date.now() + 5 * 60 * 1000) : null;
        await upsertLoginAttempts(emailLower, lockedUntil);
      }
      return res.status(400).json({ error: "Invalid password." });
    }

    await resetLoginAttempts(emailLower);
    await deleteUserSessions(user.id);

    const tokenStr = generateTokenString();
    const tokenHash = hashToken(tokenStr);
    await createSession({
      user_id: user.id, token_hash: tokenHash,
      remember_me: !!rememberMe, expires_at: getTokenExpiry(!!rememberMe),
    });

    const maxAge = rememberMe ? 2592000 : 86400;
    res.setHeader("Set-Cookie", `skool_token=${encodeURIComponent(tokenStr)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly;${process.env.NODE_ENV === "production" ? " Secure;" : ""}`);
    const userResponse = await formatUserForResponse(user.id);
    res.json({ success: true, user: userResponse });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(/skool_token=([^;]+)/);
  if (match) {
    const token = decodeURIComponent(match[1].trim());
    const tokenHash = hashToken(token);
    try {
      const session = await findSessionByTokenHash(tokenHash);
      if (session) {
        await query("DELETE FROM sessions WHERE id = $1", [session.id]);
      }
    } catch { /* ignore */ }
  }

  res.setHeader("Set-Cookie", "skool_token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly;");
  res.json({ success: true });
});

app.post("/api/auth/reset-password-request", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  const emailLower = email.toLowerCase().trim();
  const user = await findUserByEmail(emailLower);

  if (user) {
    const resetToken = generateTokenString();
    const resetTokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
      [user.id, resetTokenHash, expiresAt]
    );

    const resetLink = `${req.protocol}://${req.headers.host || "localhost:3000"}/auth/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink, user.full_name || user.username);

    await addAuditLog(user.id, user.full_name, "RESET_REQUESTED", `Password reset requested for ${user.email}.`);
  }

  res.json({ success: true, message: "If an account exists, a reset link has been generated." });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: "Token and password are required." });
  if (newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

  const tokenHash = hashToken(token);
  const result = await query(
    "SELECT * FROM password_reset_tokens WHERE token_hash = $1 AND expires_at > NOW()",
    [tokenHash]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ error: "Invalid or expired reset token." });
  }

  const resetRow = result.rows[0];
  const passwordHash = await hashPassword(newPassword);
  await updateUser(resetRow.user_id, { password_hash: passwordHash });
  await deleteUserSessions(resetRow.user_id);
  await query("DELETE FROM password_reset_tokens WHERE id = $1", [resetRow.id]);

  const user = await findUserById(resetRow.user_id);
  if (user) {
    await addAuditLog(user.id, user.full_name, "PASSWORD_CHANGED", "Password reset and sessions invalidated.");
  }

  res.json({ success: true, message: "Password has been reset. Please log in." });
});

app.get("/api/auth/mfa/status", authenticateUser, async (req: any, res: any) => {
  const { mfaEnabled, mfaSecret, mfaBackupCodes } = req.user;
  res.json({
    mfaEnabled: mfaEnabled || false,
    mfaSecret: mfaSecret || null,
    backupCodesLeft: mfaBackupCodes?.length || 0,
  });
});

app.post("/api/auth/mfa/enable", authenticateUser, async (req: any, res: any) => {
  try {
    const mfaSecret = crypto.randomBytes(20).toString("base64").replace(/[^A-Z2-7]/g, "").slice(0, 16);
    const backupCodes = Array.from({ length: 8 }, () =>
      `${crypto.randomInt(1000, 9999)}-${crypto.randomInt(1000, 9999)}`
    );

    await updateUser(req.user.id, {
      mfa_enabled: true, mfa_secret: mfaSecret, mfa_backup_codes: backupCodes,
    });

    await addAuditLog(req.user.id, req.user.fullName, "MFA_ENABLED", "Multi-factor authentication enabled.");

    res.json({
      success: true,
      mfaEnabled: true,
      mfaSecret,
      qrCodeUri: `otpauth://totp/skoolSaaS:${req.user.email}?secret=${mfaSecret}&issuer=skoolSaaS`,
      backupCodes,
    });
  } catch (err) {
    console.error("MFA enable error:", err);
    res.status(500).json({ error: "Failed to enable MFA." });
  }
});

app.post("/api/auth/mfa/verify", authenticateUser, async (req: any, res: any) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required." });

    const user = await findUserById(req.user.id);
    if (!user?.mfa_secret) {
      return res.status(400).json({ error: "MFA is not configured." });
    }

    const isValid = verifyTOTP({ token, secret: user.mfa_secret });

    if (!isValid) {
      return res.status(400).json({ error: "Invalid MFA token." });
    }

    res.json({ success: true, verified: true });
  } catch (err) {
    console.error("MFA verify error:", err);
    res.status(500).json({ error: "Failed to verify MFA token." });
  }
});

app.get("/auth/google-simulated", (_req, res) => {
  res.send(`
    <!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Sign in - Google Accounts</title><script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
    <style>body{font-family:'Roboto',sans-serif;background-color:#f0f4f9}</style></head>
    <body class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
      <h1 class="text-2xl font-normal text-gray-900 text-center mb-6">Choose an account</h1>
      <div class="space-y-2 mb-6">
        <button onclick="selectAccount('lincolnflores223@gmail.com','Lincoln Flores','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')" class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border transition text-left cursor-pointer">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" class="w-10 h-10 rounded-full">
          <div><div class="text-sm font-medium">Lincoln Flores</div><div class="text-xs text-gray-500">lincolnflores223@gmail.com</div></div>
        </button>
        <button onclick="showCustom()" class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border transition text-left cursor-pointer">
          <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">+</div>
          <div><div class="text-sm font-medium">Use another account</div></div>
        </button>
      </div>
      <div id="custom-form" class="hidden border p-4 rounded-xl mb-4 bg-gray-50">
        <input id="custom-email" type="email" placeholder="email@gmail.com" class="w-full text-sm p-2 border rounded mb-2">
        <input id="custom-name" type="text" placeholder="Name" class="w-full text-sm p-2 border rounded mb-2">
        <button onclick="submitCustom()" class="w-full bg-blue-600 text-white py-2 rounded text-sm cursor-pointer">Sign in</button>
      </div>
    </div>
    <script>
      function showCustom(){document.getElementById('custom-form').classList.toggle('hidden')}
      async function selectAccount(email,name,avatar){
        const r=await fetch('/api/auth/google-callback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,fullName:name,avatarUrl:avatar})});
        const d=await r.json();if(d.success&&window.opener){window.opener.postMessage({type:'OAUTH_AUTH_SUCCESS',user:d.user},'*');window.close()}
        else{alert(d.error||'Error')}}
      function submitCustom(){const e=document.getElementById('custom-email').value;const n=document.getElementById('custom-name').value||e.split('@')[0];if(e)selectAccount(e,n,'')}
    </script></body></html>
  `);
});

app.post("/api/auth/google-callback", async (req, res) => {
  try {
    const { email, fullName, avatarUrl } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const emailLower = email.toLowerCase().trim();
    let user = await findUserByEmail(emailLower);

    if (!user) {
      const handleValue = emailLower.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
      user = await createUser({
        email: emailLower, username: `${handleValue}_google`, full_name: fullName || "Google Member",
        role: "member", platform_role: "user",
        avatar_url: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        xp: 20, level: 1, streak: 1, badges: ["Daily Habit", "Google Verified"],
        joined_communities: ["comm-ai"], bio: "Google Authenticated Builder.",
      });

      const commAi = await findWorkspaceById("comm-ai");
      if (commAi) {
        await updateWorkspace("comm-ai", { members_count: (commAi.members_count || 0) + 1 });
        await createWorkspaceMember({ workspace_id: "comm-ai", user_id: user.id, role: "member", status: "active" });
      }
    }

    const tokenStr = generateTokenString();
    const tokenHash = hashToken(tokenStr);
    await createSession({
      user_id: user.id, token_hash: tokenHash,
      remember_me: true, expires_at: getTokenExpiry(true),
    });

    res.setHeader("Set-Cookie", `skool_token=${encodeURIComponent(tokenStr)}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly;${process.env.NODE_ENV === "production" ? " Secure;" : ""}`);
    const userResponse = await formatUserForResponse(user.id);
    res.json({ success: true, user: userResponse });
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).json({ error: "Authentication failed." });
  }
});

app.put("/api/auth/profile", authenticateUser, async (req: any, res: any) => {
  try {
    const { username, fullName, bio, avatarUrl } = req.body;
    const fields: Record<string, any> = {};
    if (username) fields.username = username;
    if (fullName) fields.full_name = fullName;
    if (bio !== undefined) fields.bio = bio;
    if (avatarUrl) fields.avatar_url = avatarUrl;

    if (Object.keys(fields).length > 0) {
      await updateUser(req.user.id, fields);
      await addAuditLog(req.user.id, req.user.fullName, "PROFILE_UPDATED", "User updated profile.");
    }

    const userResponse = await formatUserForResponse(req.user.id);
    res.json({ success: true, user: userResponse });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// Self-service role switch for testing (no Super Admin required)
app.post("/api/auth/switch-role", authenticateUser, async (req: any, res: any) => {
  try {
    const { role, userId } = req.body;
    const targetId = userId || req.user.id;
    if (!role) return res.status(400).json({ error: "Role is required." });

    // Accept both WorkspaceRole and UserRole values
    const validRoles = ["owner", "admin", "instructor", "moderator", "member", "super_admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    // Super Admin role still requires Super Admin platform role
    if (role === "super_admin" && req.user.platformRole !== PlatformRole.SUPER_ADMIN) {
      return res.status(403).json({ error: "Only super admins can assign super_admin role." });
    }

    const target = await findUserById(targetId);
    if (!target) return res.status(404).json({ error: "User not found." });

    let platformRole = "user";
    if (role === "super_admin") platformRole = "super_admin";

    await updateUser(target.id, { role, platform_role: platformRole });

    const workspaceId = req.headers["x-workspace-id"] || null;
    if (workspaceId) {
      let wsRole = "member";
      if (role === "super_admin") wsRole = "owner";
      else if (role === "admin") wsRole = "admin";
      else if (role === "instructor") wsRole = "instructor";
      else if (role === "moderator") wsRole = "moderator";
      else wsRole = "member";

      const existing = await findWorkspaceMember(workspaceId, target.id);
      if (existing) {
        await updateWorkspaceMember(workspaceId, target.id, { role: wsRole });
      } else {
        await createWorkspaceMember({ workspace_id: workspaceId, user_id: target.id, role: wsRole, status: "active" });
      }
    }

    await addAuditLog(req.user.id, req.user.fullName, "ROLE_UPDATED", `User '${target.full_name}' role set to '${role}'.`, workspaceId || undefined);

    const userResponse = await formatUserForResponse(target.id);
    res.json({ success: true, user: userResponse });
  } catch (err) {
    console.error("Role switch error:", err);
    res.status(500).json({ error: "Failed to switch role." });
  }
});

app.post("/api/auth/onboarding", authenticateUser, async (req: any, res: any) => {
  try {
    const { role, bio, targetCommunityId } = req.body;
    const fields: Record<string, any> = { role };
    if (bio) fields.bio = bio;

    let platformRole = "user";
    if (role === "super_admin") platformRole = "super_admin";
    fields.platform_role = platformRole;

    await updateUser(req.user.id, fields);

    if (targetCommunityId) {
      const user = await findUserById(req.user.id);
      const joined = user?.joined_communities || [];
      if (!joined.includes(targetCommunityId)) {
        joined.push(targetCommunityId);
        await updateUser(req.user.id, { joined_communities: joined });

        const comm = await findWorkspaceById(targetCommunityId);
        if (comm) await updateWorkspace(targetCommunityId, { members_count: (comm.members_count || 0) + 1 });

        let wsRole = "member";
        if (role === "super_admin") wsRole = "owner";
        else if (role === "admin") wsRole = "admin";
        else if (role === "instructor") wsRole = "instructor";
        else if (role === UserRole.MODERATOR) wsRole = "moderator";

        const existing = await findWorkspaceMember(targetCommunityId, req.user.id);
        if (!existing) {
          await createWorkspaceMember({ workspace_id: targetCommunityId, user_id: req.user.id, role: wsRole, status: "active" });
        }
      }
    }

    await addAuditLog(req.user.id, req.user.fullName, "USER_ONBOARDED", `Onboarding completed as '${role}'.`);

    const userResponse = await formatUserForResponse(req.user.id);
    res.json({ success: true, user: userResponse });
  } catch (err) {
    console.error("Onboarding error:", err);
    res.status(500).json({ error: "Onboarding failed." });
  }
});

app.post("/api/auth/change-password", authenticateUser, async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }

    const user = await findUserById(req.user.id);
    if (!user?.password_hash) {
      return res.status(400).json({ error: "No password set on this account." });
    }

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const newHash = await hashPassword(newPassword);
    await updateUser(req.user.id, { password_hash: newHash });
    await deleteUserSessions(req.user.id);

    await addAuditLog(req.user.id, req.user.fullName, "PASSWORD_CHANGED", "Password changed and all sessions invalidated.");

    res.json({ success: true, message: "Password changed. Please log in again." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to change password." });
  }
});

app.get("/api/communities", authenticateUser, async (req: any, res: any) => {
  try {
    const isSuperAdmin = req.user.platformRole === "super_admin";
    const communities = await findWorkspacesAccessibleByUser(req.user.id, isSuperAdmin);
    res.json({ communities: communities.map(rowToCommunity) });
  } catch (err) {
    console.error("Error fetching communities:", err);
    res.status(500).json({ error: "Failed to fetch communities." });
  }
});

app.post("/api/communities", authenticateUser, async (req: any, res: any) => {
  try {
    const { name, subdomain, description, primaryColor, priceMonthly, isPremium, isPrivate, logoUrl, categories } = req.body;
    if (!name || !subdomain) return res.status(400).json({ error: "Name and subdomain are required." });

    const existing = await findWorkspaceBySubdomain(subdomain);
    if (existing) return res.status(400).json({ error: "Subdomain is already taken." });

    const colors = ["emerald-600", "indigo-600", "blue-700", "rose-600", "amber-500", "slate-800"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Parse categories from client (comma-separated string) or use defaults
    const parsedCategories = categories 
      ? (typeof categories === 'string' ? categories.split(',').map(c => c.trim()).filter(Boolean) : categories)
      : ["Introductions", "General Discussions", "Resource Vault", "Action Plan"];

    const newComm = await createWorkspace({
      id: `comm-${Date.now()}`,
      name,
      subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      description: description || "Welcome to our new community!",
      branding: {
        logoUrl: logoUrl || name.substring(0, 2).toUpperCase(),
        primaryColor: primaryColor || randomColor,
        secondaryColor: "slate-900", accentColor: "indigo-400",
        bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
      },
      members_count: 1,
      owner_id: req.user.id,
      is_premium: isPremium || false,
      price_monthly: parseFloat(priceMonthly) || 0,
      categories: parsedCategories,
      is_private: isPrivate || false,
    });

    await createWorkspaceMember({ workspace_id: newComm.id, user_id: req.user.id, role: "owner", status: "active" });

    const user = await findUserById(req.user.id);
    if (user) {
      const joined = user.joined_communities || [];
      if (!joined.includes(newComm.id)) {
        joined.push(newComm.id);
        await updateUser(req.user.id, { joined_communities: joined });
      }
    }

    await awardXp(req.user.id, 100);
    await addAuditLog(req.user.id, req.user.fullName, "WORKSPACE_CREATED", `Created workspace '${newComm.name}'.`, newComm.id);

    await createPost({
      workspace_id: newComm.id, author_id: req.user.id, author_name: req.user.fullName,
      author_avatar: req.user.avatarUrl, author_role: "Founder",
      title: `Welcome to ${newComm.name}!`,
      content: "Welcome to our new community! Let's build something great together.",
      category: "Introductions", likes: 1, liked_by_user_ids: [req.user.id],
      is_pinned: true, is_announcement: true, tags: ["welcome", "launch"],
    });

    res.json({ success: true, community: rowToCommunity(newComm) });
  } catch (err) {
    console.error("Create community error:", err);
    res.status(500).json({ error: "Failed to create community." });
  }
});

app.put("/api/communities/:id", authenticateUser, requireWorkspacePermission(WorkspacePermission.MANAGE_WORKSPACE), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, description, branding, landingHeroTitle, landingHeroSubtitle, faqs, testimonials } = req.body;

    const fields: Record<string, any> = {};
    if (name) fields.name = name;
    if (description) fields.description = description;
    if (branding) fields.branding = branding;
    if (landingHeroTitle !== undefined) fields.landing_hero_title = landingHeroTitle;
    if (landingHeroSubtitle !== undefined) fields.landing_hero_subtitle = landingHeroSubtitle;
    if (faqs) fields.faqs = faqs;
    if (testimonials) fields.testimonials = testimonials;

    const updated = await updateWorkspace(id, fields);
    if (!updated) return res.status(404).json({ error: "Community not found." });

    res.json({ success: true, community: rowToCommunity(updated) });
  } catch (err) {
    console.error("Update community error:", err);
    res.status(500).json({ error: "Failed to update community." });
  }
});

app.post("/api/communities/:id/join", authenticateUser, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const comm = await findWorkspaceById(id);
    if (!comm) return res.status(404).json({ error: "Community not found." });

    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const joined = user.joined_communities || [];
    if (joined.includes(id)) {
      return res.status(400).json({ error: "Already a member of this community." });
    }

    joined.push(id);
    await updateUser(req.user.id, { joined_communities: joined });
    await updateWorkspace(id, { members_count: (comm.members_count || 0) + 1 });
    await createWorkspaceMember({ workspace_id: id, user_id: req.user.id, role: "member", status: "active" });

    await addAuditLog(req.user.id, req.user.fullName, "USER_JOINED", `Joined workspace '${comm.name}'.`, id);

    if (comm.is_premium) {
      await createTransaction({
        user_id: req.user.id, user_name: req.user.fullName, user_email: user.email,
        workspace_id: id, workspace_name: comm.name,
        amount: comm.price_monthly || 0, type: "subscription", status: "completed", payment_provider: "paypal",
      });

      const owner = await findUserById(comm.owner_id);
      if (owner) {
        await updateUser(comm.owner_id, { earnings: (owner.earnings || 0) + (comm.price_monthly || 0) });
      }
    }

    await awardXp(req.user.id, 25);

    const updatedUser = await formatUserForResponse(req.user.id);
    const updatedComm = await findWorkspaceById(id);
    res.json({ success: true, user: updatedUser, community: rowToCommunity(updatedComm) });
  } catch (err) {
    console.error("Join community error:", err);
    res.status(500).json({ error: "Failed to join community." });
  }
});

app.post("/api/communities/:id/leave", authenticateUser, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const joined = user.joined_communities || [];
    const idx = joined.indexOf(id);
    if (idx !== -1) {
      joined.splice(idx, 1);
      await updateUser(req.user.id, { joined_communities: joined });
      const comm = await findWorkspaceById(id);
      if (comm) {
        await updateWorkspace(id, { members_count: Math.max(1, (comm.members_count || 1) - 1) });
      }
    }

    const updatedUser = await formatUserForResponse(req.user.id);
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Leave community error:", err);
    res.status(500).json({ error: "Failed to leave community." });
  }
});

app.get("/api/communities/:id/subscription-status", authenticateUser, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const comm = await findWorkspaceById(id);
    if (!comm) return res.status(404).json({ error: "Community not found." });

    if (req.user.platformRole === "super_admin" || comm.owner_id === req.user.id) {
      return res.json({ subscribed: true, isStaff: true });
    }

    if (!comm.is_premium) {
      const member = await findWorkspaceMember(id, req.user.id);
      return res.json({ subscribed: !!member, isPremium: false });
    }

    const txs = await findUserTransactionsByWorkspace(req.user.id, id);
    const completed = txs.filter((tx: any) => tx.status === "completed" && tx.type === "subscription")
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (completed.length === 0) {
      return res.json({ subscribed: false, expired: false, error: "Requires active subscription." });
    }

    const latestTx = completed[0];
    const txTime = new Date(latestTx.created_at).getTime();
    const nowTime = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    if (nowTime - txTime > thirtyDays) {
      return res.json({ subscribed: false, expired: true, error: "Subscription expired." });
    }

    const daysLeft = Math.ceil((thirtyDays - (nowTime - txTime)) / (24 * 60 * 60 * 1000));
    res.json({ subscribed: true, expired: false, remainsDays: daysLeft });
  } catch (err) {
    console.error("Subscription status error:", err);
    res.status(500).json({ error: "Failed to check subscription." });
  }
});

app.get("/api/posts", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const communityId = req.query.communityId as string || extractWorkspaceId(req);
    if (!communityId) return res.status(400).json({ error: "Missing workspace context." });

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const { rows, total } = await findPostsByWorkspace(communityId, {
      category: req.query.category as string,
      search: req.query.search as string,
      limit, offset,
    });

    res.json({
      posts: rows.map(rowToPost),
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

app.post("/api/posts", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const communityId = req.body.communityId || extractWorkspaceId(req);
    if (!communityId) return res.status(400).json({ error: "Missing workspace context." });
    const { title, content, category, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content are required." });

    const ai = getAIClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `Analyze for toxic/spam. Reply EXACTLY "SAFE" or "SPAM". Title: ${title}\nContent: ${content}`,
        });
        if (response.text?.trim() === "SPAM") {
          return res.status(400).json({ error: "Post rejected by AI spam filter." });
        }
      } catch { /* skip AI check on failure */ }
    }

    const wsRole = req.user.workspaceRoles?.[communityId] || "member";
    const authorRoleLabel = wsRole === "owner" ? "Owner" : wsRole === "admin" ? "Admin" : wsRole === "moderator" ? "Moderator" : "Member";

    const newPost = await createPost({
      workspace_id: communityId, author_id: req.user.id, author_name: req.user.fullName,
      author_avatar: req.user.avatarUrl,
      author_role: authorRoleLabel,
      title, content, category: category || "General Discussions",
      tags: tags || [],
    });

    await awardXp(req.user.id, 15);
    res.json({ success: true, post: rowToPost(newPost) });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: "Failed to create post." });
  }
});

app.post("/api/posts/:id/pin", authenticateUser, requireWorkspacePermission(WorkspacePermission.REMOVE_POSTS), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const post = await findPostById(id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const updated = await updatePost(id, { is_pinned: !post.is_pinned });
    res.json({ success: true, post: rowToPost(updated) });
  } catch (err) {
    console.error("Pin post error:", err);
    res.status(500).json({ error: "Failed to toggle pin." });
  }
});

app.post("/api/posts/:id/like", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const post = await findPostById(id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const member = await findWorkspaceMember(post.workspace_id, req.user.id);
    if (!member || member.status !== "active") {
      return res.status(403).json({ error: "Not a member of this workspace." });
    }

    const likedBy = post.liked_by_user_ids || [];
    const idx = likedBy.indexOf(req.user.id);

    if (idx === -1) {
      likedBy.push(req.user.id);
      await updatePost(id, { liked_by_user_ids: likedBy, likes: (post.likes || 0) + 1 });

      if (post.author_id !== req.user.id) {
        await createNotification({
          user_id: post.author_id, title: "New Like 👍",
          message: `${req.user.fullName} liked "${(post.title || "").substring(0, 30)}..."`,
          type: "like",
        });
        await awardXp(post.author_id, 5);
      }
    } else {
      likedBy.splice(idx, 1);
      await updatePost(id, { liked_by_user_ids: likedBy, likes: Math.max(0, (post.likes || 0) - 1) });
    }

    const updated = await findPostById(id);
    res.json({ success: true, post: rowToPost(updated) });
  } catch (err) {
    console.error("Like post error:", err);
    res.status(500).json({ error: "Failed to toggle like." });
  }
});

app.get("/api/posts/:id/comments", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const post = await findPostById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const member = await findWorkspaceMember(post.workspace_id, req.user.id);
    if (!member || member.status !== "active") {
      return res.status(403).json({ error: "Not a member of this workspace." });
    }

    const comments = await findCommentsByPost(req.params.id);
    res.json({ comments: comments.map(rowToComment) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments." });
  }
});

app.post("/api/posts/:id/comments", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required." });

    const post = await findPostById(id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const member = await findWorkspaceMember(post.workspace_id, req.user.id);
    if (!member || member.status !== "active") {
      return res.status(403).json({ error: "Not a member of this workspace." });
    }

    const wsRole = req.user.workspaceRoles?.[post.workspace_id] || "member";
    const authorRoleLabel = wsRole === "owner" ? "Owner" : wsRole === "admin" ? "Admin" : wsRole === "moderator" ? "Moderator" : "Member";

    const comment = await createComment({
      post_id: id, parent_id: parentId || null, author_id: req.user.id,
      author_name: req.user.fullName, author_avatar: req.user.avatarUrl,
      author_role: authorRoleLabel,
      content,
    });

    await updatePost(id, { comments_count: (post.comments_count || 0) + 1 });
    await awardXp(req.user.id, 10);

    if (post.author_id !== req.user.id) {
      await createNotification({
        user_id: post.author_id, title: "New reply 💬",
        message: `${req.user.fullName} commented: "${content.substring(0, 40)}..."`,
        type: "comment",
      });
    }

    res.json({ success: true, comment: rowToComment(comment) });
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ error: "Failed to create comment." });
  }
});

app.get("/api/courses", authenticateUser, requireWorkspacePermission(WorkspacePermission.JOIN_CLASSROOM), async (req: any, res: any) => {
  try {
    const communityId = req.query.communityId as string || extractWorkspaceId(req);
    if (!communityId) return res.status(400).json({ error: "Missing workspace context." });

    const courses = await findCoursesWithContent(communityId);
    res.json({ courses });
  } catch (err) {
    console.error("Fetch courses error:", err);
    res.status(500).json({ error: "Failed to fetch courses." });
  }
});

app.post("/api/courses", authenticateUser, requireWorkspacePermission(WorkspacePermission.MANAGE_COURSES), async (req: any, res: any) => {
  try {
    const { id, communityId, name, description, coverUrl, modules, status } = req.body;
    if (!communityId || !name) return res.status(400).json({ error: "communityId and name are required." });

    const courseId = id || `course-${Date.now()}`;
    const course = await createCourse({
      id: courseId, workspace_id: communityId, name,
      description: description || "", cover_url: coverUrl || null,
      is_premium_only: false, modules_count: (modules || []).length, enrolled_count: 0,
    });

    for (const mod of modules || []) {
      const savedMod = await createModule({
        id: mod.id || `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        course_id: courseId, title: mod.title, index: mod.index || 0,
      });
      for (const lesson of mod.lessons || []) {
        await createLesson({
          id: lesson.id || `les-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          module_id: savedMod.id, workspace_id: communityId,
          title: lesson.title, duration_minutes: lesson.durationMinutes || 10,
          content_type: lesson.contentType || "video",
          video_url: lesson.videoUrl || "", text_content: lesson.textContent || "",
          index: lesson.index || 0, is_locked: lesson.isLocked || false,
          attachments: lesson.attachments || [],
          quiz_questions: lesson.quizQuestions || [],
          assignment_instructions: lesson.assignmentInstructions || "",
        });
      }
    }

    await addAuditLog(req.user.id, req.user.fullName, "COURSE_CREATED", `Created course '${name}'`, communityId);
    const saved = await findCoursesWithContent(communityId);
    const created = saved.find((c: any) => c.id === courseId);
    res.json({ success: true, course: created });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ error: "Failed to create course." });
  }
});

app.put("/api/courses/:id", authenticateUser, requireWorkspacePermission(WorkspacePermission.MANAGE_COURSES), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, description, coverUrl, modules, status } = req.body;

    const existing = await findCourseById(id);
    if (!existing) return res.status(404).json({ error: "Course not found." });

    await updateCourse(id, {
      name, description, cover_url: coverUrl,
      modules_count: (modules || []).length,
    });

    if (modules) {
      const existingMods = await findModulesByCourse(id);
      for (const mod of modules) {
        let savedMod = existingMods.find((m: any) => m.id === mod.id);
        if (savedMod) {
          savedMod = await query(
            "UPDATE modules SET title = $1, index = $2 WHERE id = $3 RETURNING *",
            [mod.title, mod.index || 0, mod.id]
          ).then((r) => r.rows[0]);
        } else {
          savedMod = await createModule({
            id: mod.id || `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            course_id: id, title: mod.title, index: mod.index || 0,
          });
        }
        for (const lesson of mod.lessons || []) {
          const existingLessons = await findLessonsByModule(savedMod.id);
          const existingLesson = existingLessons.find((l: any) => l.id === lesson.id);
          if (existingLesson) {
            await query(
              `UPDATE lessons SET title = $1, duration_minutes = $2, content_type = $3,
               video_url = $4, text_content = $5, index = $6, is_locked = $7
               WHERE id = $8`,
              [lesson.title, lesson.durationMinutes || 10, lesson.contentType || "video",
               lesson.videoUrl || "", lesson.textContent || "",
               lesson.index || 0, lesson.isLocked || false, lesson.id]
            );
          } else {
            await createLesson({
              id: lesson.id || `les-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              module_id: savedMod.id, workspace_id: existing.workspace_id,
              title: lesson.title, duration_minutes: lesson.durationMinutes || 10,
              content_type: lesson.contentType || "video",
              video_url: lesson.videoUrl || "", text_content: lesson.textContent || "",
              index: lesson.index || 0, is_locked: lesson.isLocked || false,
              attachments: lesson.attachments || [],
              quiz_questions: lesson.quizQuestions || [],
              assignment_instructions: lesson.assignmentInstructions || "",
            });
          }
        }
      }
    }

    await addAuditLog(req.user.id, req.user.fullName, "COURSE_UPDATED", `Updated course '${name || existing.name}'`, existing.workspace_id);
    const updated = await findCoursesWithContent(existing.workspace_id);
    const found = updated.find((c: any) => c.id === id);
    res.json({ success: true, course: found });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ error: "Failed to update course." });
  }
});

app.delete("/api/courses/:id", authenticateUser, requireWorkspacePermission(WorkspacePermission.MANAGE_COURSES), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const course = await findCourseById(id);
    if (!course) return res.status(404).json({ error: "Course not found." });
    await deleteCourse(id);
    await addAuditLog(req.user.id, req.user.fullName, "COURSE_DELETED", `Deleted course '${course.name}'`, course.workspace_id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ error: "Failed to delete course." });
  }
});

app.post("/api/courses/generate-ai", authenticateUser, requireWorkspacePermission(WorkspacePermission.MANAGE_COURSES), async (req: any, res: any) => {
  try {
    const { prompt, communityId } = req.body;
    if (!prompt || !communityId) return res.status(400).json({ error: "Prompt and communityId required." });

    const course = await (async () => {
      const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/ai/generate-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, communityId }),
      });
      return response.json();
    })();

    res.json(course);
  } catch (err) {
    console.error("AI generate course error:", err);
    res.status(500).json({ error: "Failed to generate course with AI." });
  }
});

app.get("/api/lessons/:id", authenticateUser, requireWorkspacePermission(WorkspacePermission.JOIN_CLASSROOM), async (req: any, res: any) => {
  try {
    const lesson = await findLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found." });

    const courseResult = await query(
      "SELECT c.* FROM courses c JOIN modules m ON m.course_id = c.id WHERE m.id = $1",
      [lesson.module_id]
    );
    if (courseResult.rows.length === 0) return res.status(404).json({ error: "Course not found." });

    const course = courseResult.rows[0];
    const member = await findWorkspaceMember(course.workspace_id, req.user.id);
    if (!member || member.status !== "active") {
      return res.status(403).json({ error: "Access denied. Not a member." });
    }

    const isStaff = req.user.platformRole === "super_admin" ||
      ["owner", "admin"].includes(member.role);
    if (lesson.is_locked && !isStaff) {
      return res.status(403).json({ error: "Lesson is locked. Complete previous lessons first." });
    }

    res.json({
      lesson: {
        ...rowToLesson(lesson),
        videoUrl: lesson.video_url ? `/api/lessons/${lesson.id}/stream` : "",
      },
    });
  } catch (err) {
    console.error("Fetch lesson error:", err);
    res.status(500).json({ error: "Failed to fetch lesson." });
  }
});

app.get("/api/lessons/:id/stream", authenticateUser, requireWorkspacePermission(WorkspacePermission.JOIN_CLASSROOM), async (req: any, res: any) => {
  try {
    const lesson = await findLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found." });

    const courseResult = await query(
      "SELECT c.* FROM courses c JOIN modules m ON m.course_id = c.id WHERE m.id = $1",
      [lesson.module_id]
    );
    if (courseResult.rows.length === 0) return res.status(404).json({ error: "Course not found." });

    const course = courseResult.rows[0];
    const member = await findWorkspaceMember(course.workspace_id, req.user.id);
    if (!member || member.status !== "active") {
      return res.status(403).json({ error: "Access denied." });
    }

    let videoUrl = lesson.video_url || "";
    if (!videoUrl) {
      videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
    }

    try {
      const parsedUrl = new URL(videoUrl);
      const allowedHosts = [
        "www.w3schools.com", "w3schools.com",
        "www.youtube.com", "youtube.com", "youtu.be",
        "vimeo.com", "player.vimeo.com",
        "*.bunnycdn.com", "*.bunny.net",
        "*.cloudflare.com",
      ];
      const isAllowed = allowedHosts.some((host) => {
        if (host.startsWith("*.")) {
          return parsedUrl.hostname.endsWith(host.slice(1));
        }
        return parsedUrl.hostname === host;
      });
      if (!isAllowed) {
        return res.status(400).json({ error: "Video URL host not allowed." });
      }

      const response = await fetch(videoUrl, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) return res.status(response.status).json({ error: "Video unavailable." });

      res.setHeader("Content-Type", response.headers.get("content-type") || "video/mp4");
      if (response.headers.get("content-length")) {
        res.setHeader("Content-Length", response.headers.get("content-length")!);
      }
      res.setHeader("Accept-Ranges", "bytes");

      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
      }
      res.end();
    } catch {
      res.redirect(videoUrl);
    }
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).json({ error: "Stream failed." });
  }
});

app.post("/api/lessons/:id/toggle-completed", authenticateUser, requireWorkspacePermission(WorkspacePermission.JOIN_CLASSROOM), async (req: any, res: any) => {
  try {
    const lesson = await findLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found." });

    const user = await findUserById(req.user.id);
    const completed = user?.completed_lessons || [];
    if (!completed.includes(req.params.id)) {
      completed.push(req.params.id);
      await updateUser(req.user.id, { completed_lessons: completed });
      await awardXp(req.user.id, 10);

      const badges = user?.badges || [];
      if (!badges.includes("First Lesson")) {
        badges.push("First Lesson");
        await updateUser(req.user.id, { badges });
      }
    }

    res.json({ success: true, completedLessons: completed });
  } catch (err) {
    console.error("Toggle lesson error:", err);
    res.status(500).json({ error: "Failed to toggle lesson." });
  }
});

app.post("/api/lessons/:id/quiz-submit", authenticateUser, requireWorkspacePermission(WorkspacePermission.JOIN_CLASSROOM), async (req: any, res: any) => {
  try {
    const lesson = await findLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found." });

    const questions = lesson.quiz_questions || [];
    const { answers } = req.body;
    let correctCount = 0;

    const results = questions.map((q: any, idx: number) => {
      const attemptedIndex = answers?.[idx];
      const isCorrect = attemptedIndex === q.answerIndex;
      if (isCorrect) correctCount++;
      return {
        question: q.question, options: q.options,
        submittedIndex: attemptedIndex, correctIndex: q.answerIndex, isCorrect,
      };
    });

    const percent = questions.length > 0 ? (correctCount / questions.length) * 100 : 100;
    const passed = percent >= 70;

    if (passed) {
      const user = await findUserById(req.user.id);
      const completed = user?.completed_lessons || [];
      if (!completed.includes(req.params.id)) {
        completed.push(req.params.id);
        await updateUser(req.user.id, { completed_lessons: completed });
        await awardXp(req.user.id, 15);
      }
    }

    res.json({ success: true, correctCount, totalQuestions: questions.length, percent, passed, results });
  } catch (err) {
    console.error("Quiz submit error:", err);
    res.status(500).json({ error: "Failed to submit quiz." });
  }
});

app.post("/api/lessons/:id/assignment-submit", authenticateUser, requireWorkspacePermission(WorkspacePermission.JOIN_CLASSROOM), async (req: any, res: any) => {
  try {
    const lesson = await findLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found." });

    const { submissionText } = req.body;

    const user = await findUserById(req.user.id);
    const completed = user?.completed_lessons || [];
    if (!completed.includes(req.params.id)) {
      completed.push(req.params.id);
      await updateUser(req.user.id, { completed_lessons: completed });
      await awardXp(req.user.id, 20);
    }

    res.json({
      success: true,
      submission: {
        text: submissionText, feedback: "Excellent work! Approved.",
        status: "approved", grade: "A+", graded: true,
      },
    });
  } catch (err) {
    console.error("Assignment submit error:", err);
    res.status(500).json({ error: "Failed to submit assignment." });
  }
});

app.get("/api/events", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const communityId = req.query.communityId as string || extractWorkspaceId(req);
    if (!communityId) return res.status(400).json({ error: "Missing workspace context." });

    const events = await findEventsByWorkspace(communityId);
    res.json({ events: events.map(rowToEvent) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events." });
  }
});

app.post("/api/events", authenticateUser, requireWorkspacePermission(WorkspacePermission.MANAGE_WORKSPACE), async (req: any, res: any) => {
  try {
    const { communityId, title, description, startAt, endAt, platform, platformUrl, category } = req.body;
    if (!communityId || !title || !startAt) {
      return res.status(400).json({ error: "CommunityId, title, and startAt are required." });
    }

    const event = await createEvent({
      workspace_id: communityId, title, description, start_at: startAt,
      end_at: endAt || new Date(new Date(startAt).getTime() + 60 * 60 * 1000).toISOString(),
      platform: platform || "Zoom", platform_url: platformUrl,
      category: category || "Class",
      host_name: req.user.fullName, host_avatar: req.user.avatarUrl,
    });

    res.json({ success: true, event: rowToEvent(event) });
  } catch (err) {
    console.error("Create event error:", err);
    res.status(500).json({ error: "Failed to create event." });
  }
});

app.post("/api/events/:id/rsvp", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const event = await findEventById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found." });

    const attendees = event.attendees || [];
    const idx = attendees.indexOf(req.user.id);

    if (idx === -1) {
      attendees.push(req.user.id);
      await updateEvent(req.params.id, { attendees });
      await awardXp(req.user.id, 20);
    } else {
      attendees.splice(idx, 1);
      await updateEvent(req.params.id, { attendees });
    }

    const updated = await findEventById(req.params.id);
    res.json({ success: true, event: rowToEvent(updated) });
  } catch (err) {
    console.error("RSVP error:", err);
    res.status(500).json({ error: "Failed to RSVP." });
  }
});

app.get("/api/chat", authenticateUser, requireWorkspacePermission(WorkspacePermission.CHAT_PARTICIPATION), async (req: any, res: any) => {
  try {
    const { recipientId } = req.query;
    if (!recipientId) return res.status(400).json({ error: "Missing recipient." });

    const messages = await findMessages(recipientId as string, req.user.id);
    res.json({ messages: messages.map(rowToMessage) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

app.post("/api/chat", authenticateUser, requireWorkspacePermission(WorkspacePermission.CHAT_PARTICIPATION), async (req: any, res: any) => {
  try {
    const { recipientId, content } = req.body;
    if (!recipientId || !content) return res.status(400).json({ error: "Content and recipient required." });

    if (recipientId.startsWith("user-")) {
      const exists = await findUserById(recipientId);
      if (!exists) return res.status(400).json({ error: "Recipient not found." });
    }

    const msg = await createMessage({
      sender_id: req.user.id, sender_name: req.user.fullName,
      sender_avatar: req.user.avatarUrl, recipient_id: recipientId, content,
    });

    res.json({ success: true, message: rowToMessage(msg) });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// ─── Channel Routes ─────────────────────────────────────────
app.get("/api/channels", authenticateUser, requireWorkspacePermission(WorkspacePermission.CHAT_PARTICIPATION), async (req: any, res: any) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    if (!workspaceId) return res.status(400).json({ error: "Missing workspaceId." });
    const channels = await findChannelsByWorkspace(workspaceId);
    res.json({ channels });
  } catch (err) {
    console.error("Get channels error:", err);
    res.status(500).json({ error: "Failed to fetch channels." });
  }
});

app.post("/api/channels", authenticateUser, requireWorkspacePermission(WorkspacePermission.MODERATE_CHAT), async (req: any, res: any) => {
  try {
    const { workspaceId, name, description } = req.body;
    if (!workspaceId || !name) return res.status(400).json({ error: "workspaceId and name required." });
    const channel = await createChannel({
      workspace_id: workspaceId,
      name: name.startsWith("#") ? name : `# ${name}`,
      description: description || "",
      created_by: req.user.id,
    });
    res.json({ success: true, channel });
  } catch (err) {
    console.error("Create channel error:", err);
    res.status(500).json({ error: "Failed to create channel." });
  }
});

app.delete("/api/channels/:id", authenticateUser, requireWorkspacePermission(WorkspacePermission.MODERATE_CHAT), async (req: any, res: any) => {
  try {
    await deleteChannel(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete channel error:", err);
    res.status(500).json({ error: "Failed to delete channel." });
  }
});

app.get("/api/gamification/leaderboard", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const workspaceId = req.query.workspaceId as string || req.query.communityId as string;
    if (!workspaceId) return res.status(400).json({ error: "Missing workspace context." });

    const userIds = await findWorkspaceUserIds(workspaceId);
    const users = await findUsersByIds(userIds);

    const ranked = users
      .sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0))
      .map((u: any, i: number) => ({
        rank: i + 1, id: u.id, fullName: u.full_name, username: u.username,
        avatarUrl: u.avatar_url, xp: u.xp, level: u.level,
        badges: u.badges || [], streak: u.streak,
      }));

    res.json({ leaderboard: ranked });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard." });
  }
});

app.get("/api/notifications", authenticateUser, async (req: any, res: any) => {
  try {
    const notifications = await findNotificationsByUser(req.user.id);
    res.json({ notifications: notifications.map(rowToNotification) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

app.post("/api/notifications/read-all", authenticateUser, async (req: any, res: any) => {
  try {
    await markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notifications read." });
  }
});

app.post("/api/payments/create-order", authenticateUser, async (req: any, res: any) => {
  try {
    const { communityId, amount } = req.body;
    if (!communityId || !amount) return res.status(400).json({ error: "CommunityId and amount required." });

    const order = await createOrder(amount);

    await createTransaction({
      user_id: req.user.id, user_name: req.user.fullName, user_email: req.user.email,
      workspace_id: communityId, amount, type: "subscription", status: "pending",
      payment_provider: "paypal", payment_id: order?.id,
    });

    res.json({ success: true, orderId: order?.id });
  } catch (err) {
    console.error("PayPal create order error:", err);
    res.status(500).json({ error: "Failed to create payment order." });
  }
});

app.post("/api/payments/capture-order", authenticateUser, async (req: any, res: any) => {
  try {
    const { orderId, communityId } = req.body;
    if (!orderId) return res.status(400).json({ error: "Order ID required." });

    const capture = await captureOrder(orderId);

    await createTransaction({
      user_id: req.user.id, user_name: req.user.fullName, user_email: req.user.email,
      workspace_id: communityId || null, amount: 0, type: "subscription",
      status: capture?.status === "COMPLETED" ? "completed" : "failed",
      payment_provider: "paypal", payment_id: capture?.captureId || orderId,
    });

    if (capture?.status === "COMPLETED" && communityId) {
      const comm = await findWorkspaceById(communityId);
      if (comm) {
        const user = await findUserById(req.user.id);
        const joined = user?.joined_communities || [];
        if (!joined.includes(communityId)) {
          joined.push(communityId);
          await updateUser(req.user.id, { joined_communities: joined });
          await updateWorkspace(communityId, { members_count: (comm.members_count || 0) + 1 });
        }
        const owner = await findUserById(comm.owner_id);
        if (owner) {
          await updateUser(comm.owner_id, { earnings: (owner.earnings || 0) + (comm.price_monthly || 0) });
        }
      }
      await awardXp(req.user.id, 50);
    }

    res.json({ success: true, status: capture?.status });
  } catch (err) {
    console.error("PayPal capture error:", err);
    res.status(500).json({ error: "Failed to capture payment." });
  }
});

app.post("/api/payments/webhook", async (req: any, res: any) => {
  try {
    const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body);
    const verified = await verifyWebhook(req.headers as Record<string, string>, rawBody);
    if (!verified) {
      return res.status(400).json({ error: "Webhook signature verification failed." });
    }

    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const capture = event.resource;
      const orderId = capture.supplementary_data?.related_ids?.order_id;
      if (orderId) {
        await query(
          "UPDATE transactions SET status = 'completed' WHERE payment_id = $1",
          [orderId]
        );
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook processing failed." });
  }
});

app.post("/api/payments/checkout", authenticateUser, async (req: any, res: any) => {
  try {
    const { communityId, amount, planName } = req.body;
    const comm = communityId ? await findWorkspaceById(communityId) : null;

    const tx = await createTransaction({
      user_id: req.user.id, user_name: req.user.fullName, user_email: req.user.email,
      workspace_id: communityId || null, workspace_name: comm?.name || planName || "Premium Plan",
      amount: amount || 49, type: "subscription", status: "completed", payment_provider: "paypal",
    });

    if (comm) {
      const user = await findUserById(req.user.id);
      const joined = user?.joined_communities || [];
      if (!joined.includes(communityId)) {
        joined.push(communityId);
        await updateUser(req.user.id, { joined_communities: joined });
        await updateWorkspace(communityId, { members_count: (comm.members_count || 0) + 1 });
      }
      const owner = await findUserById(comm.owner_id);
      if (owner) {
        await updateUser(comm.owner_id, { earnings: (owner.earnings || 2400) + (amount || 49) });
      }
    }

    res.json({ success: true, transaction: rowToTransaction(tx) });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Checkout failed." });
  }
});

app.get("/api/payments/mrr-stats", authenticateUser, async (req: any, res: any) => {
  try {
    const isSuperAdmin = req.user.platformRole === "super_admin";
    const members = await findWorkspaceMembers("");
    const isOwner = members.some(
      (m: any) => m.user_id === req.user.id && ["owner", "admin"].includes(m.role)
    );

    if (!isSuperAdmin && !isOwner) {
      return res.status(403).json({ error: "Access denied. Owner/Admin only." });
    }

    const commsCount = (await query("SELECT COUNT(*) as c FROM workspaces WHERE owner_id = $1", [req.user.id])).rows[0]?.c || 0;
    const users = await findAllUsers();
    const userTxs = await findUserTransactions(req.user.id);

    const stats = {
      mrr: commsCount * 1490 + 380,
      arr: (commsCount * 1490 + 380) * 12,
      activeStudents: users.length + 1500,
      churnRate: "2.8%",
      salesHistory: userTxs.map(rowToTransaction),
      chartData: [
        { month: "Jan", sales: 1200 }, { month: "Feb", sales: 1900 },
        { month: "Mar", sales: 2500 }, { month: "Apr", sales: 3400 },
        { month: "May", sales: commsCount * 1490 + 380 },
      ],
    };

    res.json({ stats });
  } catch (err) {
    console.error("MRR stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

app.get("/api/payments/transactions", authenticateUser, async (req: any, res: any) => {
  try {
    const txs = await findUserTransactions(req.user.id);
    res.json({ transactions: txs.map(rowToTransaction) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
});

app.get("/api/rbac/audit-logs", authenticateUser, async (req: any, res: any) => {
  try {
    const workspaceId = req.query.workspaceId as string;

    if (!workspaceId) {
      if (req.user.platformRole === "super_admin") {
        const logs = await findAllAuditLogs();
        return res.json({ auditLogs: logs.map(rowToAuditLog) });
      }
      return res.status(403).json({ error: "Access denied." });
    }

    const userWithRoles = { ...req.user, platformRole: req.user.platformRole, workspaceRoles: req.user.workspaceRoles || {} };
    if (can(WorkspacePermission.VIEW_ANALYTICS as any, userWithRoles, workspaceId)) {
      const logs = await findAuditLogsByWorkspace(workspaceId);
      return res.json({ auditLogs: logs.map(rowToAuditLog) });
    }

    return res.status(403).json({ error: "Access denied." });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit logs." });
  }
});

app.get("/api/rbac/workspaces/:workspaceId/members", authenticateUser, async (req: any, res: any) => {
  try {
    const { workspaceId } = req.params;

    const member = await findWorkspaceMember(workspaceId, req.user.id);
    if (!member && req.user.platformRole !== "super_admin") {
      return res.status(403).json({ error: "Not a member of this workspace." });
    }

    const isPrivileged = req.user.platformRole === "super_admin" ||
      ["owner", "admin", "moderator"].includes(member?.role);

    const members = await findWorkspaceMembers(workspaceId);
    const enriched = [];

    for (const m of members) {
      const user = await findUserById(m.user_id);
      enriched.push({
        id: m.id, workspaceId: m.workspace_id, userId: m.user_id,
        role: m.role, status: m.status, joinedAt: m.joined_at,
        fullName: user?.full_name || "Deleted User",
        username: user?.username || "deleted",
        avatarUrl: user?.avatar_url || "",
        email: isPrivileged ? user?.email || "" : "Hidden for Privacy",
      });
    }

    res.json({ members: enriched });
  } catch (err) {
    console.error("Fetch members error:", err);
    res.status(500).json({ error: "Failed to fetch members." });
  }
});

app.post("/api/rbac/workspaces/:workspaceId/members/:userId/role", authenticateUser, async (req: any, res: any) => {
  try {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(WorkspaceRole).includes(role as WorkspaceRole)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    const userWithRoles = { ...req.user, platformRole: req.user.platformRole, workspaceRoles: req.user.workspaceRoles || {} };
    if (!can(WorkspacePermission.MANAGE_MEMBERS as any, userWithRoles, workspaceId)) {
      return res.status(403).json({ error: "Forbidden. Missing MANAGE_MEMBERS permission." });
    }

    const target = await findWorkspaceMember(workspaceId, userId);
    if (!target) return res.status(404).json({ error: "Member not found." });

    if (target.role === "owner" && req.user.platformRole !== "super_admin") {
      return res.status(403).json({ error: "Cannot alter owner role." });
    }

    const oldRole = target.role;
    await updateWorkspaceMember(workspaceId, userId, { role });

    await addAuditLog(req.user.id, req.user.fullName, "ROLE_UPDATED", `Changed user ${userId} role from '${oldRole}' to '${role}'.`, workspaceId);

    let legacyRole = "member";
    if (role === "owner") legacyRole = "owner";
    else if (role === "admin") legacyRole = "admin";
    else if (role === "instructor") legacyRole = "instructor";
    else if (role === "moderator") legacyRole = "moderator";
    await updateUser(userId, { role: legacyRole });

    const updated = await findWorkspaceMember(workspaceId, userId);
    res.json({ success: true, member: updated });
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ error: "Failed to update role." });
  }
});

app.post("/api/rbac/workspaces/:workspaceId/invitations", authenticateUser, async (req: any, res: any) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) return res.status(400).json({ error: "Email and role required." });

    const userWithRoles = { ...req.user, platformRole: req.user.platformRole, workspaceRoles: req.user.workspaceRoles || {} };
    if (!can(WorkspacePermission.MANAGE_MEMBERS as any, userWithRoles, workspaceId)) {
      return res.status(403).json({ error: "Forbidden." });
    }

    let invitee = await findUserByEmail(email);
    if (!invitee) {
      invitee = await createUser({
        email, username: email.split("@")[0].replace(/[^a-zA-Z0-9]/g, ""),
        full_name: email.split("@")[0], role: "member", platform_role: "user",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        joined_communities: [workspaceId],
      });
    }

    const existing = await findWorkspaceMember(workspaceId, invitee.id);
    if (existing) {
      await updateWorkspaceMember(workspaceId, invitee.id, { role, status: "active" });
    } else {
      await createWorkspaceMember({ workspace_id: workspaceId, user_id: invitee.id, role, status: "active" });
    }

    await addAuditLog(req.user.id, req.user.fullName, "TEAM_INVITED", `Invited '${email}' as '${role}'.`, workspaceId);
    res.json({ success: true, message: `Invited ${email} as ${role}.` });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ error: "Failed to invite user." });
  }
});

app.post("/api/rbac/workspaces/:workspaceId/members/:userId/ban", authenticateUser, async (req: any, res: any) => {
  try {
    const { workspaceId, userId } = req.params;
    const { status } = req.body;

    if (!["banned", "muted", "active"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be banned, muted, or active." });
    }

    const userWithRoles = { ...req.user, platformRole: req.user.platformRole, workspaceRoles: req.user.workspaceRoles || {} };
    if (!can(WorkspacePermission.MUTE_BAN_USERS as any, userWithRoles, workspaceId)) {
      return res.status(403).json({ error: "Forbidden." });
    }

    const target = await findWorkspaceMember(workspaceId, userId);
    if (!target) return res.status(404).json({ error: "Member not found." });
    if (target.role === "owner") return res.status(403).json({ error: "Cannot ban owner." });

    await updateWorkspaceMember(workspaceId, userId, { status });
    await addAuditLog(req.user.id, req.user.fullName, status === "banned" ? "MEMBER_BANNED" : "MEMBER_MUTED", `Member ${userId} status set to '${status}'.`, workspaceId);

    const updated = await findWorkspaceMember(workspaceId, userId);
    res.json({ success: true, member: updated });
  } catch (err) {
    console.error("Ban/mute error:", err);
    res.status(500).json({ error: "Failed to update member status." });
  }
});

app.post("/api/rbac/users/:userId/platform-role", authenticateUser, requirePlatformPermission(PlatformPermission.MANAGE_USERS), async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { platformRole } = req.body;

    if (!platformRole || !Object.values(PlatformRole).includes(platformRole as PlatformRole)) {
      return res.status(400).json({ error: "Invalid platform role." });
    }

    const target = await findUserById(userId);
    if (!target) return res.status(404).json({ error: "User not found." });
    if (target.id === req.user.id) return res.status(400).json({ error: "Cannot modify own role." });

    await updateUser(userId, { platform_role: platformRole });
    await addAuditLog(req.user.id, req.user.fullName, "PLATFORM_ROLE_UPDATED", `User '${target.full_name}' role set to '${platformRole}'.`);

    const userResponse = await formatUserForResponse(userId);
    res.json({ success: true, user: userResponse });
  } catch (err) {
    console.error("Update platform role error:", err);
    res.status(500).json({ error: "Failed to update platform role." });
  }
});

app.post("/api/security/failed-routing-violation", authenticateUser, async (req: any, res: any) => {
  try {
    const { attemptedTab, path, hash } = req.body;
    const details = `SUSPICIOUS_ROUTING_TAMPER: User '${req.user.fullName}' (ID: ${req.user.id}) attempted unauthorized route to tab '${attemptedTab}' path '${path}' hash '${hash}'.`;

    await addAuditLog(req.user.id, req.user.fullName, "SUSPICIOUS_ACCESS", details);
    console.warn(details);
    res.json({ success: true, message: "Violation logged." });
  } catch (err) {
    res.status(500).json({ error: "Failed to log violation." });
  }
});

const securePaths = ["/admin/*", "/platform/*", "/enterprise/*", "/security/*", "/global-analytics/*"];
securePaths.forEach((pathPattern) => {
  app.all(pathPattern, authenticateUser, (req: any, res: any, next: any) => {
    if (req.user.platformRole !== "super_admin") {
      addAuditLog(req.user.id, req.user.fullName, "SUSPICIOUS_ACCESS", `BLOCKED: Attempted access to '${req.originalUrl}'.`);
      return res.status(403).json({ error: "Access denied. Super Admin only." });
    }
    next();
  });
});

app.post("/api/ai/assistant", authenticateUser, async (req: any, res: any) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required." });

  const ai = getAIClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a helpful Skool assistant. Provide actionable coaching advice for community creators.",
        },
      });
      return res.json({ response: response.text });
    } catch { /* fallback */ }
  }

  const mockResponses = [
    "To skyrocket engagement, try 3 badges for Top members on Monday mornings.",
    "Structure premium courses with short 12-minute modules and worksheet attachments.",
    "View your MRR metrics directly from your creator dashboard!",
  ];
  res.json({ response: `[Simulation] ${mockResponses[Math.floor(Math.random() * mockResponses.length)]}` });
});

app.post("/api/ai/write-post", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic required." });

  const ai = getAIClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Write an engaging community post about: "${topic}". End with a question to inspire discussion.`,
      });
      return res.json({ title: `Master ${topic}`, content: response.text });
    } catch { /* fallback */ }
  }

  res.json({
    title: `Launching: ${topic}`,
    content: `Hey everyone! I've been working on ${topic} and wanted to share my insights. What's your experience with ${topic}?`,
  });
});

app.post("/api/ai/generate-course", authenticateUser, requireWorkspacePermission(WorkspacePermission.MANAGE_COURSES), async (req: any, res: any) => {
  try {
    const { prompt, communityId } = req.body;
    if (!prompt || !communityId) return res.status(400).json({ error: "Prompt and communityId required." });

    const ai = getAIClient();
    let curriculum: any = null;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `Create a curriculum about: "${prompt}"`,
          config: {
            systemInstruction: `You are an expert curriculum designer. Output valid JSON matching:
            {"name":"Course Title","description":"...","modules":[{"title":"Module Title","lessons":[{"title":"Lesson title","durationMinutes":15,"textContent":"..."}]}]}`,
            responseMimeType: "application/json",
          },
        });
        curriculum = JSON.parse(response.text.replace(/```json/g, "").replace(/```/g, "").trim());
      } catch { /* fallback */ }
    }

    if (!curriculum) {
      curriculum = {
        name: `The Ultimate Guide to ${prompt}`,
        description: `A fast-track curriculum to master ${prompt}.`,
        modules: [
          {
            title: "Module 1: Fundamentals",
            lessons: [
              { title: `Core concepts of ${prompt}`, durationMinutes: 12, textContent: `Introduction to ${prompt}.` },
              { title: "Your first workbook", durationMinutes: 15, textContent: "Step-by-step guide." },
            ],
          },
          {
            title: "Module 2: Advanced Strategies",
            lessons: [
              { title: "CI/CD Workflow", durationMinutes: 18, textContent: "Automate your pipelines." },
            ],
          },
        ],
      };
    }

    const courseId = `course-ai-${Date.now()}`;
    const course = await createCourse({
      id: courseId, workspace_id: communityId,
      name: curriculum.name, description: curriculum.description,
      cover_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
      is_premium_only: false, modules_count: curriculum.modules.length, enrolled_count: 1,
    });

    for (let mIdx = 0; mIdx < curriculum.modules.length; mIdx++) {
      const m = curriculum.modules[mIdx];
      const mod = await createModule({ course_id: courseId, title: m.title, index: mIdx });

      for (let lIdx = 0; lIdx < m.lessons.length; lIdx++) {
        const l = m.lessons[lIdx];
        await createLesson({
          module_id: mod.id, workspace_id: communityId,
          title: l.title, duration_minutes: l.durationMinutes || 12,
          text_content: l.textContent || "Content coming soon.",
          index: lIdx, is_locked: mIdx > 0, content_type: "video",
          video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
        });
      }
    }

    res.json({ success: true, course: { ...rowToCourse(course), modules: curriculum.modules } });
  } catch (err) {
    console.error("AI course generation error:", err);
    res.status(500).json({ error: "Failed to generate course." });
  }
});

app.get("/api/users/me", authenticateUser, async (req: any, res: any) => {
  try {
    const userResponse = await formatUserForResponse(req.user.id);
    res.json({ user: userResponse });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

app.get("/api/users", authenticateUser, requirePlatformPermission(PlatformPermission.MANAGE_USERS), async (_req: any, res: any) => {
  try {
    const users = await findAllUsers();
    res.json({ users: users.map(rowToUser) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

app.get("/api/database/status", async (_req, res) => {
  try {
    await query("SELECT 1 as ok");
    const userCount = await query("SELECT COUNT(*) as count FROM users");
    const wsCount = await query("SELECT COUNT(*) as count FROM workspaces");
    res.json({
      configured: true,
      connected: true,
      type: "PostgreSQL",
      usersCount: parseInt(userCount.rows[0]?.count || "0", 10),
      workspacesCount: parseInt(wsCount.rows[0]?.count || "0", 10),
      message: "PostgreSQL connected and operational.",
    });
  } catch (err: any) {
    res.json({
      configured: !!process.env.DATABASE_URL,
      connected: false,
      type: "PostgreSQL",
      message: `Connection error: ${err.message}`,
    });
  }
});

app.post("/api/database/migrate", authenticateUser, async (req: any, res: any) => {
  if (req.user.platformRole !== "super_admin") {
    return res.status(403).json({ error: "Super Admin only." });
  }
  await ensureSchema();
  const seeded = await isDatabaseSeeded();
  res.json({ success: true, message: `PostgreSQL schema verified. Seeded: ${seeded}` });
});

// ═══════════════════════════════════════════════════════════════
// COMMUNITY TRANSFORMATION ROUTES
// ═══════════════════════════════════════════════════════════════

// ─── Spaces ──────────────────────────────────────────

app.get("/api/spaces", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_RESOURCES), async (req: any, res: any) => {
  try {
    const communityId = req.query.workspaceId as string || extractWorkspaceId(req);
    if (!communityId) return res.status(400).json({ error: "Missing workspace context." });
    const spaces = await findSpacesByWorkspace(communityId);
    res.json({ spaces });
  } catch (err) {
    console.error("Fetch spaces error:", err);
    res.status(500).json({ error: "Failed to fetch spaces." });
  }
});

app.post("/api/spaces", authenticateUser, requireWorkspacePermission(WorkspacePermission.MANAGE_RESOURCES), async (req: any, res: any) => {
  try {
    const communityId = req.query.workspaceId as string || extractWorkspaceId(req);
    if (!communityId) return res.status(400).json({ error: "Missing workspace context." });
    const { name, description, icon, color, accessType } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required." });
    const space = await createSpace({ workspace_id: communityId, name, description, icon, color, access_type: accessType || "public" });
    await addAuditLog(req.user.id, req.user.fullName, "SPACE_CREATED", `Created space '${name}'`, communityId);
    res.json({ success: true, space });
  } catch (err) {
    console.error("Create space error:", err);
    res.status(500).json({ error: "Failed to create space." });
  }
});

app.put("/api/spaces/:id", authenticateUser, requireWorkspacePermission(WorkspacePermission.MANAGE_RESOURCES), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const space = await updateSpace(id, req.body);
    if (!space) return res.status(404).json({ error: "Space not found." });
    res.json({ success: true, space });
  } catch (err) {
    console.error("Update space error:", err);
    res.status(500).json({ error: "Failed to update space." });
  }
});

app.delete("/api/spaces/:id", authenticateUser, requireWorkspacePermission(WorkspacePermission.MANAGE_RESOURCES), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await deleteSpace(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete space error:", err);
    res.status(500).json({ error: "Failed to delete space." });
  }
});

// ─── Posts (spaces-aware) ────────────────────────────

app.get("/api/community/posts", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const workspaceId = req.query.workspaceId as string || extractWorkspaceId(req);
    if (!workspaceId) return res.status(400).json({ error: "Missing workspace context." });
    const { spaceId, search, limit, offset } = req.query;
    const result = await findPostsBySpace(workspaceId, spaceId as string, {
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      search: search as string,
    });
    res.json({ posts: result.rows, total: result.total });
  } catch (err) {
    console.error("Fetch community posts error:", err);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

app.post("/api/community/posts", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const workspaceId = req.body.workspaceId || extractWorkspaceId(req);
    if (!workspaceId) return res.status(400).json({ error: "Missing workspace context." });

    const { title, content, spaceId, category, tags } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required." });

    const member = await findWorkspaceMember(workspaceId, req.user.id);
    if (!member || member.status !== "active") return res.status(403).json({ error: "Not a member of this workspace." });

    const post = await createPostWithSpace({
      workspace_id: workspaceId, space_id: spaceId || null,
      author_id: req.user.id, author_name: req.user.fullName,
      author_avatar: req.user.avatarUrl, author_role: req.user.role,
      title, content: content || "", category: category || "General",
      tags: tags || [],
    });

    await logActivity(workspaceId, req.user.id, "post_created", `Created post "${title}"`, "post", post.id);
    const xpResult = await addXp(req.user.id, workspaceId, 10, "Created a post", "post", post.id);
    if (xpResult.leveledUp) {
      await createNotification({ user_id: req.user.id, title: `Level Up! You're now level ${xpResult.level}`, message: "Keep contributing to earn more XP!", type: "level_up" });
    }

    // Award First Post badge
    const userPosts = (await query("SELECT COUNT(*) as c FROM posts WHERE author_id = $1 AND workspace_id = $2", [req.user.id, workspaceId])).rows[0];
    if (parseInt(userPosts?.c || "0") === 1) {
      await awardBadge(req.user.id, "First Post", workspaceId);
    }

    res.json({ success: true, post });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: "Failed to create post." });
  }
});

// ─── Reactions ───────────────────────────────────────

app.post("/api/community/posts/:id/reactions", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;
    const result = await togglePostReaction(id, req.user.id, reaction || "like");
    if (result.reacted) {
      const post = await findPostById(id);
      if (post && post.author_id !== req.user.id) {
        await createNotification({ user_id: post.author_id, title: `${req.user.fullName} reacted to your post`, message: "", type: "like" });
      }
    }
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Toggle reaction error:", err);
    res.status(500).json({ error: "Failed to toggle reaction." });
  }
});

app.get("/api/community/posts/:id/reactions", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const counts = await getPostReactions(req.params.id);
    res.json({ reactions: counts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reactions." });
  }
});

// ─── Threaded Comments ───────────────────────────────

app.get("/api/community/posts/:postId/comments", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const comments = await findCommentsThreaded(req.params.postId);
    res.json({ comments });
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
});

app.post("/api/community/comments/:id/reactions", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;
    const result = await toggleCommentReaction(id, req.user.id, reaction || "like");
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Toggle comment reaction error:", err);
    res.status(500).json({ error: "Failed to toggle comment reaction." });
  }
});

// ─── XP System ───────────────────────────────────────

app.get("/api/community/xp/history", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const history = await getXpHistory(req.user.id);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch XP history." });
  }
});

app.get("/api/community/leaderboard", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const workspaceId = req.query.workspaceId as string || extractWorkspaceId(req);
    const period = (req.query.period as string) || "all";
    if (!workspaceId) return res.status(400).json({ error: "Missing workspace context." });
    const leaderboard = await getWorkspaceLeaderboard(workspaceId, period as "weekly" | "monthly" | "all");
    res.json({ leaderboard });
  } catch (err) {
    console.error("Fetch leaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard." });
  }
});

// ─── Lesson Discussions ──────────────────────────────

app.get("/api/lessons/:id/discussions", authenticateUser, requireWorkspacePermission(WorkspacePermission.JOIN_CLASSROOM), async (req: any, res: any) => {
  try {
    const discussions = await findLessonDiscussions(req.params.id);
    res.json({ discussions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch discussions." });
  }
});

app.post("/api/lessons/:id/discussions", authenticateUser, requireWorkspacePermission(WorkspacePermission.JOIN_CLASSROOM), async (req: any, res: any) => {
  try {
    const { content, parentId } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required." });
    const discussion = await createLessonDiscussion({
      lesson_id: req.params.id, user_id: req.user.id, content, parent_id: parentId || null,
    });
    res.json({ success: true, discussion });
  } catch (err) {
    console.error("Create discussion error:", err);
    res.status(500).json({ error: "Failed to create discussion." });
  }
});

app.get("/api/lessons/:id/notes", authenticateUser, requireWorkspacePermission(WorkspacePermission.JOIN_CLASSROOM), async (req: any, res: any) => {
  try {
    const note = await findLessonNote(req.params.id, req.user.id);
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch note." });
  }
});

app.put("/api/lessons/:id/notes", authenticateUser, requireWorkspacePermission(WorkspacePermission.JOIN_CLASSROOM), async (req: any, res: any) => {
  try {
    const { content, timestampSeconds } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required." });
    const note = await upsertLessonNote(req.params.id, req.user.id, content, timestampSeconds);
    res.json({ success: true, note });
  } catch (err) {
    console.error("Save note error:", err);
    res.status(500).json({ error: "Failed to save note." });
  }
});

// ─── Community Feed ──────────────────────────────────

app.get("/api/community/feed", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const workspaceId = req.query.workspaceId as string || extractWorkspaceId(req);
    if (!workspaceId) return res.status(400).json({ error: "Missing workspace context." });
    const { limit, offset } = req.query;
    const posts = await findCommunityFeed(workspaceId, req.user.id, limit ? parseInt(limit) : 30, offset ? parseInt(offset) : 0);
    res.json({ posts });
  } catch (err) {
    console.error("Fetch feed error:", err);
    res.status(500).json({ error: "Failed to fetch community feed." });
  }
});

// ─── Member Activity ─────────────────────────────────

app.get("/api/community/activity", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_FEED), async (req: any, res: any) => {
  try {
    const workspaceId = req.query.workspaceId as string || extractWorkspaceId(req);
    if (!workspaceId) return res.status(400).json({ error: "Missing workspace context." });
    const { userId, limit } = req.query;
    const activity = userId
      ? await findUserActivity(userId as string, workspaceId, limit ? parseInt(limit) : 30)
      : await findMemberActivity(workspaceId, limit ? parseInt(limit) : 50);
    res.json({ activity });
  } catch (err) {
    console.error("Fetch activity error:", err);
    res.status(500).json({ error: "Failed to fetch activity." });
  }
});

// ─── Creator Analytics ───────────────────────────────

app.get("/api/analytics/community-health", authenticateUser, requireWorkspacePermission(WorkspacePermission.VIEW_ANALYTICS), async (req: any, res: any) => {
  try {
    const workspaceId = req.query.workspaceId as string || extractWorkspaceId(req);
    if (!workspaceId) return res.status(400).json({ error: "Missing workspace context." });

    const health = await getCommunityHealthScore(workspaceId);
    res.json({ health });
  } catch (err) {
    console.error("Fetch community health error:", err);
    res.status(500).json({ error: "Failed to fetch community health." });
  }
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

async function startServer() {
  await ensureSchema();

  const PORT = parseInt(process.env.PORT || "3000", 10);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const cleanupInterval = setInterval(async () => {
    try {
      const sessionsCleaned = await cleanupExpiredSessions();
      const tokensCleaned = await cleanupExpiredResetTokens();
      if (sessionsCleaned > 0 || tokensCleaned > 0) {
        console.log(`Cleanup: removed ${sessionsCleaned} expired sessions, ${tokensCleaned} reset tokens`);
      }
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  }, 15 * 60 * 1000);

  const server = http.createServer(app);
  const io = new SocketServer(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // ─── Socket.io Real-Time Chat ─────────────────────────────
  const onlineUsers = new Map<string, Set<string>>(); // channelId -> Set<socketId>
  const userSocketMap = new Map<string, string>(); // userId -> socketId

  io.on("connection", (socket) => {
    let currentUserId: string | null = null;

    socket.on("identify", (userId: string) => {
      currentUserId = userId;
      userSocketMap.set(userId, socket.id);
    });

    socket.on("join_channel", (channelId: string) => {
      socket.join(channelId);
      if (!onlineUsers.has(channelId)) onlineUsers.set(channelId, new Set());
      onlineUsers.get(channelId)!.add(socket.id);

      // Broadcast online count to room
      io.to(channelId).emit("online_count", onlineUsers.get(channelId)?.size || 0);

      // Broadcast user joined
      if (currentUserId) {
        socket.to(channelId).emit("user_joined", { userId: currentUserId, channelId });
      }
    });

    socket.on("leave_channel", (channelId: string) => {
      socket.leave(channelId);
      onlineUsers.get(channelId)?.delete(socket.id);
      io.to(channelId).emit("online_count", onlineUsers.get(channelId)?.size || 0);
      if (currentUserId) {
        socket.to(channelId).emit("user_left", { userId: currentUserId, channelId });
      }
    });

    socket.on("send_message", async (data: { channelId: string; content: string; senderName: string; senderAvatar: string }) => {
      try {
        const msg = await createMessage({
          sender_id: currentUserId || "unknown",
          sender_name: data.senderName,
          sender_avatar: data.senderAvatar,
          recipient_id: data.channelId,
          content: data.content,
        });
        const message = rowToMessage(msg);
        io.to(data.channelId).emit("new_message", message);
      } catch (err) {
        console.error("Socket send_message error:", err);
      }
    });

    socket.on("typing", (data: { channelId: string; userName: string }) => {
      socket.to(data.channelId).emit("user_typing", { userId: currentUserId, userName: data.userName, channelId: data.channelId });
    });

    socket.on("stop_typing", (data: { channelId: string }) => {
      socket.to(data.channelId).emit("user_stop_typing", { userId: currentUserId, channelId: data.channelId });
    });

    socket.on("disconnect", () => {
      if (currentUserId) userSocketMap.delete(currentUserId);
      // Clean up online users
      for (const [channelId, sockets] of onlineUsers.entries()) {
        if (sockets.delete(socket.id)) {
          io.to(channelId).emit("online_count", sockets.size);
          io.to(channelId).emit("user_left", { userId: currentUserId, channelId });
        }
      }
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Socket.io attached for real-time chat`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    clearInterval(cleanupInterval);
    server.close(async () => {
      try {
        await getPool().end();
      } catch { /* ignore */ }
      console.log("Server shut down.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forced shutdown after timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
