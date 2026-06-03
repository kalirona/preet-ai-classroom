import "dotenv/config";
import { createSchema, isDatabaseSeeded, query, createUser, createWorkspace, createWorkspaceMember, findUserByEmail, createCourse, createModule, createLesson, createPost, createComment, createNotification, createEvent, createTransaction, createAuditLog, createMessage } from "./db.js";
import bcrypt from "bcryptjs";
import { createSpace, createChallenge, createChallengeTask } from "./community-db.js";

async function seed() {
  console.log("Running schema creation...");
  await createSchema();

  // Seed badge definitions
  const badges = [
    { id: "badge-first-post", name: "First Post", description: "Posted in the community for the first time", icon: "📝", category: "achievement", xp_reward: 10 },
    { id: "badge-helpful", name: "Helpful Member", description: "Received 10 likes on comments", icon: "💡", category: "engagement", xp_reward: 50 },
    { id: "badge-top-contributor", name: "Top Contributor", description: "Created 20 posts", icon: "⭐", category: "engagement", xp_reward: 100 },
    { id: "badge-course-grad", name: "Course Graduate", description: "Completed a full course", icon: "🎓", category: "learning", xp_reward: 200 },
    { id: "badge-champion", name: "Community Champion", description: "Reached level 20", icon: "👑", category: "milestone", xp_reward: 500 },
    { id: "badge-streak-7", name: "Week Warrior", description: "7 day streak", icon: "🔥", category: "streak", xp_reward: 30 },
    { id: "badge-streak-30", name: "Monthly Master", description: "30 day streak", icon: "💪", category: "streak", xp_reward: 150 },
    { id: "badge-challenge-complete", name: "Challenge Conqueror", description: "Completed a community challenge", icon: "🏆", category: "challenge", xp_reward: 100 },
    { id: "badge-event-attendee", name: "Event Goer", description: "Attended a live event", icon: "🎪", category: "events", xp_reward: 20 },
    { id: "badge-milestone-50", name: "50 Club", description: "Reached 50 XP in a single week", icon: "🚀", category: "milestone", xp_reward: 75 },
  ];
  for (const b of badges) {
    await query(
      `INSERT INTO badge_definitions (id, name, description, icon, category, xp_reward)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (name) DO NOTHING`,
      [b.id, b.name, b.description, b.icon, b.category, b.xp_reward]
    );
  }

  const seeded = await isDatabaseSeeded();
  if (seeded) {
    console.log("Database already seeded, skipping.");
    return;
  }

  console.log("Seeding database...");

  const hash = (pwd: string) => bcrypt.hashSync(pwd, 12);

  const creator = await createUser({
    email: "creator@example.com",
    username: "AlexCreator",
    full_name: "Alex Rivera",
    role: "creator",
    platform_role: "user",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    xp: 2450,
    level: 12,
    streak: 8,
    badges: ["Community Builder", "Course Master", "XP Guru"],
    joined_communities: ["comm-ai", "comm-yoga", "comm-saas"],
    bio: "AI educator and product strategist helping creators build thriving groups.",
    password_hash: hash("demo123"),
  });

  const student = await createUser({
    email: "lincolnflores223@gmail.com",
    username: "LincolnCode",
    full_name: "Lincoln Flores",
    role: "member",
    platform_role: "user",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    xp: 680,
    level: 4,
    streak: 5,
    badges: ["Daily Habit", "First Lesson", "Active Contributor"],
    joined_communities: ["comm-ai", "comm-saas"],
    bio: "Passionate developer exploring SaaS architectures.",
    password_hash: hash("demo123"),
  });

  const moderator = await createUser({
    email: "moderator@example.com",
    username: "ModSarah",
    full_name: "Sarah Chen",
    role: "moderator",
    platform_role: "user",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    xp: 1200,
    level: 7,
    streak: 14,
    badges: ["Peacekeeper", "Super Moderator"],
    joined_communities: ["comm-ai"],
    password_hash: hash("demo123"),
  });

  const admin = await createUser({
    email: "admin@example.com",
    username: "SuperAdmin",
    full_name: "Skool Platform Chief",
    role: "super_admin",
    platform_role: "super_admin",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    xp: 9999,
    level: 99,
    streak: 365,
    badges: ["Archon Badge", "Founder"],
    joined_communities: ["comm-ai", "comm-yoga", "comm-saas"],
    password_hash: hash("admin123"),
  });

  const wsAi = await createWorkspace({
    id: "comm-ai",
    name: "The AI Builders Collective",
    subdomain: "ai-builders",
    description: "Connect with world-class engineers creating next-generation LLM applications.",
    branding: {
      logoUrl: "⚡", primaryColor: "indigo-600", secondaryColor: "violet-700",
      accentColor: "cyan-400", bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
      domain: "ai-builders.com"
    },
    members_count: 1420,
    owner_id: creator.id,
    is_premium: true,
    price_monthly: 49,
    is_featured: true,
    landing_hero_title: "Level up your AI Engineering Career",
    landing_hero_subtitle: "Supercharge your tech workflow with advanced AI routing inside our private network.",
    categories: ["Introductions", "AI Engineering", "Vite & React", "Showcase your work", "Daily Q&A"],
    faqs: [
      { question: "Is this for beginners?", answer: "No, this community is for developers with experience." },
      { question: "Can I cancel anytime?", answer: "Absolutely. Cancel with one click." }
    ],
    testimonials: [
      { id: "t1", name: "Gabriel Soto", role: "Software Architect", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", content: "Joining this collective completely reconstructed how I deploy system proxies.", rating: 5 }
    ]
  });

  const wsYoga = await createWorkspace({
    id: "comm-yoga",
    name: "Zen Yoga Life Studio",
    subdomain: "zenyoga",
    description: "A gorgeous safe space for daily mindfulness and flexibility challenges.",
    branding: {
      logoUrl: "🌸", primaryColor: "emerald-600", secondaryColor: "teal-700",
      accentColor: "amber-400", bannerUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800"
    },
    members_count: 412,
    owner_id: creator.id,
    is_premium: false,
    price_monthly: 0,
    categories: ["Zen Routine", "Posture Check", "Mindful Breathing", "Daily Progress"]
  });

  const wsSaas = await createWorkspace({
    id: "comm-saas",
    name: "SaaS Scaling VIP Circles",
    subdomain: "saas-scale",
    description: "Maximize your recurring revenue flow. Master SEO, churn metrics, and high-converting billing.",
    branding: {
      logoUrl: "📈", primaryColor: "blue-700", secondaryColor: "slate-900",
      accentColor: "emerald-400", bannerUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800"
    },
    members_count: 620,
    owner_id: creator.id,
    is_premium: true,
    price_monthly: 99,
    categories: ["Revenue Audits", "Cold Outreach", "Ad Spend Secrets", "Show Off MRR"]
  });

  const wsPrivate = await createWorkspace({
    id: "comm-private-mastermind",
    name: "VIP Mastermind Circle",
    subdomain: "vip-mastermind",
    description: "Highly restricted research hub. Access is strictly by invite-only.",
    branding: {
      logoUrl: "🔒", primaryColor: "rose-950", secondaryColor: "slate-900", accentColor: "rose-500",
      bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
    },
    members_count: 1,
    owner_id: creator.id,
    is_premium: true,
    price_monthly: 499,
    categories: ["Introductions", "VIP Alpha", "Confidential"],
    is_private: true
  });

  await createWorkspaceMember({ workspace_id: "comm-ai", user_id: creator.id, role: "creator" });
  await createWorkspaceMember({ workspace_id: "comm-ai", user_id: student.id, role: "member" });
  await createWorkspaceMember({ workspace_id: "comm-ai", user_id: moderator.id, role: "moderator" });
  await createWorkspaceMember({ workspace_id: "comm-ai", user_id: admin.id, role: "member" });
  await createWorkspaceMember({ workspace_id: "comm-saas", user_id: creator.id, role: "creator" });
  await createWorkspaceMember({ workspace_id: "comm-saas", user_id: student.id, role: "admin" });
  await createWorkspaceMember({ workspace_id: "comm-yoga", user_id: student.id, role: "creator" });
  await createWorkspaceMember({ workspace_id: "comm-yoga", user_id: creator.id, role: "member" });
  await createWorkspaceMember({ workspace_id: "comm-private-mastermind", user_id: creator.id, role: "creator" });

  // Seed default spaces for comm-ai
  const aiSpaceDefs = [
    { name: "General Discussion", icon: "💬", color: "indigo", access_type: "public", sort_order: 0 },
    { name: "Introductions", icon: "👋", color: "emerald", access_type: "public", sort_order: 1 },
    { name: "AI Engineering", icon: "🤖", color: "blue", access_type: "public", sort_order: 2 },
    { name: "Show & Tell", icon: "🎨", color: "amber", access_type: "public", sort_order: 3 },
    { name: "Support", icon: "🆘", color: "orange", access_type: "public", sort_order: 4 },
    { name: "Premium Members", icon: "⭐", color: "purple", access_type: "paid", sort_order: 5 },
    { name: "Challenges", icon: "🏅", color: "rose", access_type: "public", sort_order: 6 },
  ];
  for (const s of aiSpaceDefs) {
    await query(
      `INSERT INTO spaces (id, workspace_id, name, description, icon, color, access_type, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
      [`sp-ai-${s.name.toLowerCase().replace(/\s+/g, "-")}`, "comm-ai", s.name, "", s.icon, s.color, s.access_type, s.sort_order]
    );
  }

  // Seed a demo challenge in comm-ai
  const challengeStart = new Date();
  const challengeEnd = new Date(challengeStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const demoChallenge = await createChallenge({
    workspace_id: "comm-ai", title: "7-Day AI Architecture Sprint",
    description: "Build a new AI agent feature every day for 7 days. Complete all tasks to earn the Challenge Conqueror badge!",
    icon: "🚀", color: "indigo", challenge_type: "sprint", duration_days: 7,
    xp_reward: 200, starts_at: challengeStart.toISOString(), ends_at: challengeEnd.toISOString(),
    created_by: creator.id,
  });
  const taskDefs = [
    { title: "Design your agent's system prompt", day: 1, xp_per_completion: 15 },
    { title: "Implement a custom tool function", day: 1, xp_per_completion: 15 },
    { title: "Build a memory buffer system", day: 2, xp_per_completion: 20 },
    { title: "Create a routing workflow", day: 2, xp_per_completion: 20 },
    { title: "Add structured output parsing", day: 3, xp_per_completion: 20 },
    { title: "Implement error handling & retries", day: 3, xp_per_completion: 20 },
    { title: "Write tests for your agent", day: 4, xp_per_completion: 25 },
    { title: "Optimize token usage", day: 4, xp_per_completion: 25 },
    { title: "Add logging & observability", day: 5, xp_per_completion: 25 },
    { title: "Create a demo video", day: 5, xp_per_completion: 30 },
    { title: "Share your agent in Show & Tell", day: 6, xp_per_completion: 30 },
    { title: "Review 3 other agents", day: 6, xp_per_completion: 20 },
    { title: "Final polish & deployment", day: 7, xp_per_completion: 35 },
    { title: "Submit completion form", day: 7, xp_per_completion: 35 },
  ];
  for (let i = 0; i < taskDefs.length; i++) {
    const t = taskDefs[i];
    await createChallengeTask({
      challenge_id: demoChallenge.id, title: t.title, day: t.day,
      task_type: "custom", xp_per_completion: t.xp_per_completion, sort_order: i, description: "",
    });
  }

  const courseAi = await createCourse({
    id: "course-ai-agent",
    workspace_id: "comm-ai",
    name: "Advanced AI Agent Architecture",
    description: "Implement multi-agent routers, structured output parsers, and custom tools.",
    cover_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600",
    is_premium_only: true,
    modules_count: 2,
    enrolled_count: 380,
  });

  const mod1 = await createModule({ id: "mod-ai-1", course_id: courseAi.id, title: "Module 1: Agent Foundations", index: 0 });
  const mod2 = await createModule({ id: "mod-ai-2", course_id: courseAi.id, title: "Module 2: Memory & Context Windows", index: 1 });

  await createLesson({
    id: "les-ai-1-1", module_id: mod1.id, workspace_id: "comm-ai",
    title: "Intro to ReAct Loop Protocols", duration_minutes: 14,
    video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
    text_content: "The Reasoning and Action (ReAct) paradigm allows LLMs to query external components sequentially.",
    index: 0, is_locked: false, attachments: ["Framework Overview PDF"], content_type: "video",
  });

  await createLesson({
    id: "les-ai-1-1b", module_id: mod1.id, workspace_id: "comm-ai",
    title: "Notion-Style Agent Cookbook", duration_minutes: 10,
    text_content: "Core Agent Design Patterns...",
    index: 1, is_locked: false, content_type: "text",
  });

  await createLesson({
    id: "les-ai-1-2", module_id: mod1.id, workspace_id: "comm-ai",
    title: "Crafting Perfect System Routing Instructions", duration_minutes: 18,
    text_content: "Take this quick MCQ assessment to prove mastery of routing parameters.",
    index: 2, is_locked: false, content_type: "quiz",
    quiz_questions: [
      { question: "Which defines the key benefit of ReAct?", options: ["A", "B", "C", "D"], answerIndex: 1 },
      { question: "What is a negative constraint?", options: ["A", "B", "C", "D"], answerIndex: 1 },
    ],
  });

  await createLesson({
    id: "les-ai-2-1", module_id: mod2.id, workspace_id: "comm-ai",
    title: "Redis-Backed Sliding Context Memory", duration_minutes: 22,
    text_content: "Write an architectural proposal explaining redis triggers and eviction criteria.",
    index: 0, is_locked: false, content_type: "assignment",
    assignment_instructions: "Write an architectural playbook explaining how to implement Redis chat history summarization.",
  });

  await createLesson({
    id: "les-ai-2-2", module_id: mod2.id, workspace_id: "comm-ai",
    title: "Companion Cheat Sheet Downloads", duration_minutes: 6,
    text_content: "Download verified production architectures below.",
    index: 1, is_locked: true, content_type: "download",
    attachments: ["Sliding_Compaction_Design_Sheet.pdf", "Compaction_NodeJS_Code_Sample.js"],
  });

  const courseYoga = await createCourse({
    id: "course-yoga-flex",
    workspace_id: "comm-yoga",
    name: "14-Day Morning Spine Flex Journey",
    description: "A fast, guided daily 15-minute spine fluid posture sequence.",
    cover_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600",
    is_premium_only: false,
    modules_count: 1,
    enrolled_count: 190,
  });

  const modYoga = await createModule({ id: "mod-yoga-1", course_id: courseYoga.id, title: "Week 1: Spine Extension Basics", index: 0 });

  await createLesson({
    id: "les-yoga-1-1", module_id: modYoga.id, workspace_id: "comm-yoga",
    title: "Day 1: Unlocking Cervical Rotation", duration_minutes: 10,
    video_url: "https://www.w3schools.com/html/movie.mp4",
    text_content: "Mindful neck circles combined with lateral posture shifts.",
    index: 0, is_locked: false,
  });

  await createPost({
    id: "post-1", workspace_id: "comm-ai", author_id: creator.id,
    author_name: "Alex Rivera", author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    author_role: "Founder", title: "How we optimized our server-side LLM pipelines from 3.4s to 0.9s",
    content: "We redesigned our proxy system using speculative streaming parsers.",
    category: "AI Engineering", likes: 42, liked_by_user_ids: [student.id, moderator.id],
    comments_count: 3, is_pinned: true, is_announcement: true,
    tags: ["performance", "LLM", "Proxy"],
  });

  await createPost({
    id: "post-2", workspace_id: "comm-ai", author_id: student.id,
    author_name: "Lincoln Flores", author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    author_role: "Student", title: "Hey guys, just joined the AI Builders Collective!",
    content: "Incredible onboarding experience so far.",
    category: "Introductions", likes: 12, liked_by_user_ids: [creator.id],
    comments_count: 1, is_pinned: false, is_announcement: false,
    tags: ["onboarding", "SaaS"],
  });

  await createPost({
    id: "post-3", workspace_id: "comm-yoga", author_id: creator.id,
    author_name: "Alex Rivera", author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    author_role: "Founder", title: "Breathing alignment: Avoid over-extending headers",
    content: "When initiating Morning Flex workouts, keep your back perfectly horizontal.",
    category: "Zen Routine", likes: 8, liked_by_user_ids: [],
    comments_count: 1, is_pinned: true, is_announcement: false,
    tags: ["beginner", "alignment"],
  });

  await createComment({ id: "c-1", post_id: "post-1", author_id: student.id, author_name: "Lincoln Flores", author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", author_role: "Student", content: "Does the pipeline handle fallback routing automatically?" });
  await createComment({ id: "c-2", post_id: "post-1", parent_id: "c-1", author_id: creator.id, author_name: "Alex Rivera", author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", author_role: "Founder", content: "We route to a secondary backup cluster on any 429 or 503." });
  await createComment({ id: "c-3", post_id: "post-1", author_id: moderator.id, author_name: "Sarah Chen", author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", author_role: "Moderator", content: "Pinned this! Huge value." });
  await createComment({ id: "c-4", post_id: "post-2", author_id: creator.id, author_name: "Alex Rivera", author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", author_role: "Founder", content: "Welcome! Check out Course Module 2." });

  await createEvent({
    id: "event-1", workspace_id: "comm-ai", title: "Masterclass: High-Concurrency Intelligent Pipelines",
    description: "Deep dive on streaming prompt logic and structured output models.",
    start_at: "2026-05-30T16:00:00Z", end_at: "2026-05-30T17:30:00Z",
    platform: "Zoom", platform_url: "https://zoom.us/j/919102919",
    category: "Class", host_name: "Alex Rivera", host_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    timezone: "UTC", attendees: [student.id, moderator.id],
  });

  await createEvent({
    id: "event-2", workspace_id: "comm-ai", title: "Weekly AI Hackathon Q&A Desk",
    description: "Bring your custom prompts and deployment logs to debug live.",
    start_at: "2026-06-03T18:00:00Z", end_at: "2026-06-03T19:00:00Z",
    platform: "Google Meet", platform_url: "https://meet.google.com/abc-defg-hij",
    category: "Q&A", host_name: "Sarah Chen", host_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    timezone: "EST", attendees: [],
  });

  await createMessage({
    id: "msg-1", sender_id: creator.id, sender_name: "Alex Rivera",
    sender_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    recipient_id: "comm-ai", content: "Great start to the week! Level 5 unlocks VIP Mastermind tomorrow.",
  });

  await createTransaction({
    id: "tx-1", user_id: student.id, user_name: "Lincoln Flores", user_email: "lincolnflores223@gmail.com",
    workspace_id: "comm-ai", workspace_name: "The AI Builders Collective", amount: 49, type: "subscription", status: "completed", payment_provider: "paypal",
  });

  await createTransaction({
    id: "tx-2", user_id: moderator.id, user_name: "Sarah Chen", user_email: "moderator@example.com",
    workspace_id: "comm-saas", workspace_name: "SaaS Scaling VIP Circles", amount: 99, type: "subscription", status: "completed", payment_provider: "paypal",
  });

  await createNotification({
    id: "n-1", user_id: student.id, title: "Level Up! 🎉",
    message: "Your contributions have boosted you to Level 4!", type: "level_up",
  });

  await createAuditLog({
    id: "log-1", workspace_id: "comm-ai", user_id: creator.id, user_name: "Alex Rivera",
    action: "WORKSPACE_CREATED", details: "Workspace 'The AI Builders Collective' initialized.",
  });
  await createAuditLog({
    id: "log-2", workspace_id: "comm-ai", user_id: student.id, user_name: "Lincoln Flores",
    action: "USER_JOINED", details: "Lincoln Flores joined workspace as a member.",
  });
  await createAuditLog({
    id: "log-3", workspace_id: "comm-saas", user_id: creator.id, user_name: "Alex Rivera",
    action: "WORKSPACE_CREATED", details: "Workspace 'SaaS Scaling VIP Circles' initialized.",
  });
  await createAuditLog({
    id: "log-4", workspace_id: "comm-saas", user_id: creator.id, user_name: "Alex Rivera",
    action: "ROLE_UPDATED", details: "Upgraded Lincoln Flores to 'admin' in SaaS Scaling VIP Circles.",
  });
  await createAuditLog({
    id: "log-5", workspace_id: "comm-yoga", user_id: student.id, user_name: "Lincoln Flores",
    action: "WORKSPACE_CREATED", details: "Lincoln Flores created Zen Yoga Life Studio.",
  });

  console.log("Database seeded successfully!");
  console.log("Demo accounts (password: 'demo123' or 'admin123' for admin):");
  console.log("  - creator@example.com (Creator)");
  console.log("  - lincolnflores223@gmail.com (Student)");
  console.log("  - moderator@example.com (Moderator)");
  console.log("  - admin@example.com (Super Admin)");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
