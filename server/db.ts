import pg from "pg";
import { v4 as uuidv4 } from "uuid";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    pool.on("error", (err) => console.error("PG pool error:", err));
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function createSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      platform_role TEXT NOT NULL DEFAULT 'user',
      avatar_url TEXT,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 1,
      badges TEXT[] DEFAULT '{}',
      joined_communities TEXT[] DEFAULT '{}',
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      earnings DECIMAL(10,2) DEFAULT 0,
      bio TEXT,
      referred_by TEXT,
      mfa_enabled BOOLEAN DEFAULT false,
      mfa_secret TEXT,
      mfa_backup_codes TEXT[] DEFAULT '{}',
      completed_lessons TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subdomain TEXT UNIQUE NOT NULL,
      description TEXT,
      branding JSONB DEFAULT '{}',
      members_count INTEGER DEFAULT 0,
      owner_id TEXT NOT NULL REFERENCES users(id),
      is_premium BOOLEAN DEFAULT false,
      price_monthly DECIMAL(10,2) DEFAULT 0,
      is_featured BOOLEAN DEFAULT false,
      landing_hero_title TEXT,
      landing_hero_subtitle TEXT,
      categories TEXT[] DEFAULT '{}',
      faqs JSONB DEFAULT '[]',
      testimonials JSONB DEFAULT '[]',
      is_private BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      status TEXT NOT NULL DEFAULT 'active',
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(workspace_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES users(id),
      author_name TEXT NOT NULL,
      author_avatar TEXT,
      author_role TEXT,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT DEFAULT 'General',
      likes INTEGER DEFAULT 0,
      liked_by_user_ids TEXT[] DEFAULT '{}',
      comments_count INTEGER DEFAULT 0,
      is_pinned BOOLEAN DEFAULT false,
      is_announcement BOOLEAN DEFAULT false,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES users(id),
      author_name TEXT NOT NULL,
      author_avatar TEXT,
      author_role TEXT,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      cover_url TEXT,
      is_premium_only BOOLEAN DEFAULT false,
      modules_count INTEGER DEFAULT 0,
      enrolled_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      course_type TEXT DEFAULT 'flagship',
      scheduled_at TIMESTAMPTZ,
      published_at TIMESTAMPTZ,
      archived_at TIMESTAMPTZ,
      price DECIMAL(10,2) DEFAULT 0,
      certificate_enabled BOOLEAN DEFAULT false,
      estimated_hours DECIMAL(5,1) DEFAULT 0,
      difficulty_level TEXT DEFAULT 'beginner',
      max_enrollments INTEGER,
      tags TEXT[] DEFAULT '{}',
      category TEXT,
      creator_name TEXT,
      creator_avatar TEXT,
      average_rating DECIMAL(3,2) DEFAULT 0,
      completion_rate DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      index INTEGER DEFAULT 0,
      is_free_preview BOOLEAN DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 0,
      video_url TEXT,
      text_content TEXT,
      index INTEGER DEFAULT 0,
      is_locked BOOLEAN DEFAULT false,
      is_free_preview BOOLEAN DEFAULT false,
      attachments TEXT[] DEFAULT '{}',
      content_type TEXT DEFAULT 'video',
      quiz_questions JSONB DEFAULT '[]',
      assignment_instructions TEXT,
      passing_score INTEGER DEFAULT 70,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS course_enrollments (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'active',
      progress DECIMAL(5,2) DEFAULT 0,
      completed_lessons TEXT[] DEFAULT '{}',
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
      certificate_issued BOOLEAN DEFAULT false,
      certificate_url TEXT,
      grade TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(course_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS course_resources (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER,
      download_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS course_certificates (
      id TEXT PRIMARY KEY,
      enrollment_id TEXT NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      issued_at TIMESTAMPTZ DEFAULT NOW(),
      certificate_url TEXT,
      credential_id TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      start_at TIMESTAMPTZ NOT NULL,
      end_at TIMESTAMPTZ,
      platform TEXT DEFAULT 'Zoom',
      platform_url TEXT,
      category TEXT DEFAULT 'Class',
      host_name TEXT,
      host_avatar TEXT,
      timezone TEXT DEFAULT 'UTC',
      attendees TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL REFERENCES users(id),
      sender_name TEXT NOT NULL,
      sender_avatar TEXT,
      recipient_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      created_by TEXT REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_channels_workspace ON channels(workspace_id);

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT NOT NULL DEFAULT 'info',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      user_name TEXT,
      user_email TEXT,
      workspace_id TEXT REFERENCES workspaces(id),
      workspace_name TEXT,
      amount DECIMAL(10,2) NOT NULL,
      type TEXT NOT NULL DEFAULT 'subscription',
      status TEXT NOT NULL DEFAULT 'completed',
      payment_provider TEXT DEFAULT 'paypal',
      payment_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT REFERENCES workspaces(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      user_name TEXT,
      action TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      remember_me BOOLEAN DEFAULT false,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      locked_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_posts_workspace ON posts(workspace_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace ON audit_logs(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_workspace_members_ws ON workspace_members(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_workspace ON lessons(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_events_workspace ON events(workspace_id, start_at);
    CREATE INDEX IF NOT EXISTS idx_courses_workspace ON courses(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(workspace_id, status);
    CREATE INDEX IF NOT EXISTS idx_courses_type ON courses(course_type);
    CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_workspace ON course_enrollments(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_resources_module ON course_resources(module_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_user ON course_certificates(user_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_course ON course_certificates(course_id);

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);

    -- Community Transformation: Spaces
    CREATE TABLE IF NOT EXISTS spaces (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '💬',
      color TEXT DEFAULT 'indigo',
      access_type TEXT NOT NULL DEFAULT 'public',
      sort_order INTEGER DEFAULT 0,
      post_count INTEGER DEFAULT 0,
      is_archived BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_spaces_workspace ON spaces(workspace_id, sort_order);

    ALTER TABLE posts ADD COLUMN IF NOT EXISTS space_id TEXT REFERENCES spaces(id) ON DELETE SET NULL;

    -- Community Transformation: Post Reactions (per-user, per-reaction-type)
    CREATE TABLE IF NOT EXISTS post_reactions (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reaction TEXT NOT NULL DEFAULT 'like',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(post_id, user_id, reaction)
    );
    CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);

    -- Community Transformation: Comment Reactions
    CREATE TABLE IF NOT EXISTS comment_reactions (
      id TEXT PRIMARY KEY,
      comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reaction TEXT NOT NULL DEFAULT 'like',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(comment_id, user_id, reaction)
    );

    -- Community Transformation: XP History
    CREATE TABLE IF NOT EXISTS xp_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      reason TEXT NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_transactions(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_xp_workspace ON xp_transactions(workspace_id);

    -- Community Transformation: Badge Definitions
    CREATE TABLE IF NOT EXISTS badge_definitions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      icon TEXT DEFAULT '🏆',
      category TEXT DEFAULT 'achievement',
      xp_reward INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Community Transformation: User Badges (awarded)
    CREATE TABLE IF NOT EXISTS user_badges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge_id TEXT NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
      workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
      awarded_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, badge_id)
    );
    CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

    -- Community Transformation: Challenges
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '🏅',
      color TEXT DEFAULT 'indigo',
      challenge_type TEXT NOT NULL DEFAULT 'daily',
      duration_days INTEGER NOT NULL DEFAULT 7,
      xp_reward INTEGER DEFAULT 100,
      starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ends_at TIMESTAMPTZ NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_by TEXT REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_challenges_workspace ON challenges(workspace_id, starts_at DESC);

    -- Community Transformation: Challenge Tasks
    CREATE TABLE IF NOT EXISTS challenge_tasks (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      day INTEGER NOT NULL DEFAULT 1,
      task_type TEXT DEFAULT 'custom',
      xp_per_completion INTEGER DEFAULT 10,
      sort_order INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_challenge_tasks_challenge ON challenge_tasks(challenge_id, day);

    -- Community Transformation: Challenge Participants
    CREATE TABLE IF NOT EXISTS challenge_participants (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMPTZ DEFAULT NOW(),
      completed_tasks TEXT[] DEFAULT '{}',
      is_completed BOOLEAN DEFAULT false,
      completed_at TIMESTAMPTZ,
      UNIQUE(challenge_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);

    -- Community Transformation: Lesson Discussions
    CREATE TABLE IF NOT EXISTS lesson_discussions (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      parent_id TEXT REFERENCES lesson_discussions(id) ON DELETE CASCADE,
      edited_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_lesson_discussions_lesson ON lesson_discussions(lesson_id, created_at ASC);

    -- Community Transformation: Lesson Notes
    CREATE TABLE IF NOT EXISTS lesson_notes (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      timestamp_seconds INTEGER,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(lesson_id, user_id)
    );

    -- Community Transformation: Member Activity Log
    CREATE TABLE IF NOT EXISTS member_activity (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_type TEXT NOT NULL,
      description TEXT DEFAULT '',
      reference_type TEXT,
      reference_id TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_member_activity_workspace ON member_activity(workspace_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_member_activity_user ON member_activity(user_id, created_at DESC);
  `);
}

export async function isDatabaseSeeded(): Promise<boolean> {
  const result = await query("SELECT COUNT(*) as count FROM users");
  return parseInt(result.rows[0]?.count || "0", 10) > 0;
}

export type DbRow = Record<string, any>;

export async function findUserByEmail(email: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function findUserByUsername(username: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username]);
  return result.rows[0] || null;
}

export async function createUser(user: Partial<DbRow>): Promise<DbRow> {
  const id = user.id || `user-${Date.now()}-${uuidv4().slice(0, 8)}`;
  const result = await query(
    `INSERT INTO users (id, email, username, full_name, password_hash, role, platform_role, avatar_url, xp, level, streak, badges, joined_communities, bio, joined_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      id, user.email, user.username, user.full_name,
      user.password_hash || null, user.role || "member",
      user.platform_role || "user", user.avatar_url || null,
      user.xp || 0, user.level || 1, user.streak || 1,
      user.badges || [], user.joined_communities || [],
      user.bio || null, user.joined_at || new Date().toISOString(),
    ]
  );
  return result.rows[0];
}

export async function updateUser(id: string, fields: Record<string, any>): Promise<DbRow | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) {
      setClauses.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
  }

  if (setClauses.length === 0) return findUserById(id);

  setClauses.push(`updated_at = NOW()`);
  values.push(id);
  const result = await query(
    `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function findWorkspacesAccessibleByUser(userId: string, isSuperAdmin: boolean): Promise<DbRow[]> {
  if (isSuperAdmin) {
    const result = await query("SELECT * FROM workspaces ORDER BY created_at DESC");
    return result.rows;
  }
  const result = await query(
    `SELECT w.* FROM workspaces w
     LEFT JOIN workspace_members m ON m.workspace_id = w.id AND m.user_id = $1
     WHERE w.is_private = false OR w.owner_id = $1 OR m.id IS NOT NULL
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function findWorkspaceById(id: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM workspaces WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function findWorkspaceBySubdomain(subdomain: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM workspaces WHERE LOWER(subdomain) = LOWER($1)", [subdomain]);
  return result.rows[0] || null;
}

export async function createWorkspace(ws: Partial<DbRow>): Promise<DbRow> {
  const id = ws.id || `ws-${Date.now()}`;
  const result = await query(
    `INSERT INTO workspaces (id, name, subdomain, description, branding, members_count, owner_id, is_premium, price_monthly, is_featured, landing_hero_title, landing_hero_subtitle, categories, faqs, testimonials, is_private)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING *`,
    [
      id, ws.name, ws.subdomain, ws.description || "",
      JSON.stringify(ws.branding || {}), ws.members_count || 1,
      ws.owner_id, ws.is_premium || false, ws.price_monthly || 0,
      ws.is_featured || false, ws.landing_hero_title || null,
      ws.landing_hero_subtitle || null, ws.categories || [],
      JSON.stringify(ws.faqs || []), JSON.stringify(ws.testimonials || []),
      ws.is_private || false,
    ]
  );
  return result.rows[0];
}

export async function updateWorkspace(id: string, fields: Record<string, any>): Promise<DbRow | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) {
      const dbKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
      setClauses.push(`${dbKey} = $${idx}`);
      values.push(val);
      idx++;
    }
  }

  if (setClauses.length === 0) return findWorkspaceById(id);

  setClauses.push(`updated_at = NOW()`);
  values.push(id);
  const result = await query(
    `UPDATE workspaces SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function findWorkspaceMember(workspaceId: string, userId: string): Promise<DbRow | null> {
  const result = await query(
    "SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2",
    [workspaceId, userId]
  );
  return result.rows[0] || null;
}

export async function createWorkspaceMember(member: Partial<DbRow>): Promise<DbRow> {
  const id = member.id || `wm-${Date.now()}`;
  const result = await query(
    `INSERT INTO workspace_members (id, workspace_id, user_id, role, status, joined_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = $4, status = $5
     RETURNING *`,
    [
      id, member.workspace_id, member.user_id,
      member.role || "member", member.status || "active",
      member.joined_at || new Date().toISOString(),
    ]
  );
  return result.rows[0];
}

export async function updateWorkspaceMember(workspaceId: string, userId: string, fields: Record<string, any>): Promise<DbRow | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) {
      setClauses.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
  }

  if (setClauses.length === 0) return findWorkspaceMember(workspaceId, userId);

  values.push(workspaceId, userId);
  const result = await query(
    `UPDATE workspace_members SET ${setClauses.join(", ")} WHERE workspace_id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function findWorkspaceMembers(workspaceId: string): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM workspace_members WHERE workspace_id = $1 ORDER BY joined_at ASC",
    [workspaceId]
  );
  return result.rows;
}

export async function findUserWorkspaceRoles(userId: string): Promise<Record<string, string>> {
  const result = await query(
    "SELECT workspace_id, role FROM workspace_members WHERE user_id = $1 AND status = 'active'",
    [userId]
  );
  const roles: Record<string, string> = {};
  for (const row of result.rows) {
    roles[row.workspace_id] = row.role;
  }
  return roles;
}

export async function findPostsByWorkspace(workspaceId: string, options?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<{ rows: DbRow[]; total: number }> {
  let where = "WHERE workspace_id = $1";
  const params: any[] = [workspaceId];
  let idx = 2;

  if (options?.category) {
    where += ` AND LOWER(category) = LOWER($${idx})`;
    params.push(options.category);
    idx++;
  }
  if (options?.search) {
    where += ` AND (LOWER(title) LIKE LOWER($${idx}) OR LOWER(content) LIKE LOWER($${idx}))`;
    params.push(`%${options.search}%`);
    idx++;
  }

  const countResult = await query(`SELECT COUNT(*) as total FROM posts ${where}`, params);
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  const result = await query(
    `SELECT * FROM posts ${where} ORDER BY is_pinned DESC, created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );

  return { rows: result.rows, total };
}

export async function findPostById(id: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM posts WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createPost(post: Partial<DbRow>): Promise<DbRow> {
  const id = post.id || `post-${Date.now()}`;
  const result = await query(
    `INSERT INTO posts (id, workspace_id, author_id, author_name, author_avatar, author_role, title, content, category, likes, liked_by_user_ids, comments_count, is_pinned, is_announcement, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      id, post.workspace_id, post.author_id, post.author_name,
      post.author_avatar || null, post.author_role || null,
      post.title, post.content || "", post.category || "General",
      post.likes || 0, post.liked_by_user_ids || [],
      post.comments_count || 0, post.is_pinned || false,
      post.is_announcement || false, post.tags || [],
    ]
  );
  return result.rows[0];
}

export async function updatePost(id: string, fields: Record<string, any>): Promise<DbRow | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) {
      setClauses.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
  }

  if (setClauses.length === 0) return findPostById(id);

  values.push(id);
  const result = await query(
    `UPDATE posts SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function findCommentsByPost(postId: string): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC",
    [postId]
  );
  return result.rows;
}

export async function createComment(comment: Partial<DbRow>): Promise<DbRow> {
  const id = comment.id || `comment-${Date.now()}`;
  const result = await query(
    `INSERT INTO comments (id, post_id, parent_id, author_id, author_name, author_avatar, author_role, content)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      id, comment.post_id, comment.parent_id || null,
      comment.author_id, comment.author_name,
      comment.author_avatar || null, comment.author_role || null,
      comment.content,
    ]
  );
  return result.rows[0];
}

export async function findCoursesByWorkspace(workspaceId: string): Promise<DbRow[]> {
  const result = await query("SELECT * FROM courses WHERE workspace_id = $1 ORDER BY created_at DESC", [workspaceId]);
  return result.rows;
}

export async function findCoursesWithContent(workspaceId: string): Promise<any[]> {
  const result = await query(
    `SELECT
      c.id AS course_id, c.workspace_id, c.name, c.description, c.cover_url,
      c.is_premium_only, c.modules_count, c.enrolled_count, c.created_at,
      c.status, c.course_type, c.scheduled_at, c.published_at, c.archived_at,
      c.price, c.certificate_enabled, c.estimated_hours, c.difficulty_level,
      c.max_enrollments, c.tags, c.category, c.creator_name, c.creator_avatar,
      c.average_rating, c.completion_rate,
      m.id AS module_id, m.title AS module_title, m.index AS module_index,
      m.description AS module_description, m.is_free_preview AS module_is_free_preview,
      l.id AS lesson_id, l.module_id AS lesson_module_id, l.title AS lesson_title,
      l.duration_minutes, l.video_url, l.text_content, l.index AS lesson_index,
      l.is_locked, l.is_free_preview, l.attachments, l.content_type, l.quiz_questions,
      l.assignment_instructions, l.passing_score
    FROM courses c
    LEFT JOIN modules m ON m.course_id = c.id
    LEFT JOIN lessons l ON l.module_id = m.id
    WHERE c.workspace_id = $1
    ORDER BY c.created_at DESC, m.index ASC, l.index ASC`,
    [workspaceId]
  );

  const courseMap = new Map<string, any>();
  for (const row of result.rows) {
    if (!courseMap.has(row.course_id)) {
      courseMap.set(row.course_id, {
        id: row.course_id,
        workspace_id: row.workspace_id,
        name: row.name,
        description: row.description,
        cover_url: row.cover_url,
        is_premium_only: row.is_premium_only,
        modules_count: row.modules_count,
        enrolled_count: row.enrolled_count,
        created_at: row.created_at,
        status: row.status || "draft",
        course_type: row.course_type || "flagship",
        scheduled_at: row.scheduled_at,
        published_at: row.published_at,
        archived_at: row.archived_at,
        price: parseFloat(row.price || "0"),
        certificate_enabled: row.certificate_enabled,
        estimated_hours: parseFloat(row.estimated_hours || "0"),
        difficulty_level: row.difficulty_level || "beginner",
        max_enrollments: row.max_enrollments,
        tags: row.tags || [],
        category: row.category,
        creator_name: row.creator_name,
        creator_avatar: row.creator_avatar,
        average_rating: parseFloat(row.average_rating || "0"),
        completion_rate: parseFloat(row.completion_rate || "0"),
        modules: [],
      });
    }
    if (!row.module_id) continue;

    const course = courseMap.get(row.course_id)!;
    let module = course.modules.find((m: any) => m.id === row.module_id);
    if (!module) {
      module = {
        id: row.module_id, title: row.module_title, index: row.module_index,
        description: row.module_description, isFreePreview: row.module_is_free_preview,
        lessons: [], resources: [],
      };
      course.modules.push(module);
    }
    if (row.lesson_id) {
      module.lessons.push({
        id: row.lesson_id, moduleId: row.lesson_module_id,
        title: row.lesson_title, durationMinutes: row.duration_minutes,
        videoUrl: row.video_url, textContent: row.text_content,
        index: row.lesson_index, isLocked: row.is_locked,
        isFreePreview: row.is_free_preview,
        attachments: row.attachments || [],
        contentType: row.content_type,
        quizQuestions: typeof row.quiz_questions === "string" ? JSON.parse(row.quiz_questions) : row.quiz_questions || [],
        assignmentInstructions: row.assignment_instructions,
        passingScore: row.passing_score,
      });
    }
  }

  return Array.from(courseMap.values());
}

export async function findCourseById(id: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM courses WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createCourse(course: Partial<DbRow>): Promise<DbRow> {
  const id = course.id || `course-${Date.now()}`;
  const result = await query(
    `INSERT INTO courses (id, workspace_id, name, description, cover_url, is_premium_only, modules_count, enrolled_count,
     status, course_type, scheduled_at, price, certificate_enabled, estimated_hours, difficulty_level,
     max_enrollments, tags, category, creator_name, creator_avatar)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
    [
      id, course.workspace_id, course.name, course.description || "",
      course.cover_url || null, course.is_premium_only || false,
      course.modules_count || 0, course.enrolled_count || 0,
      course.status || "draft", course.course_type || "flagship",
      course.scheduled_at || null, course.price || 0,
      course.certificate_enabled || false, course.estimated_hours || 0,
      course.difficulty_level || "beginner", course.max_enrollments || null,
      course.tags || [], course.category || null,
      course.creator_name || null, course.creator_avatar || null,
    ]
  );
  return result.rows[0];
}

export async function updateCourse(id: string, fields: Record<string, any>): Promise<DbRow | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) {
      setClauses.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
  }

  if (setClauses.length === 0) return findCourseById(id);

  values.push(id);
  const result = await query(
    `UPDATE courses SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteCourse(id: string): Promise<void> {
  await query("DELETE FROM courses WHERE id = $1", [id]);
}

// ═══════════════════════════════════════════════════════════════
// COURSE ENROLLMENTS
// ═══════════════════════════════════════════════════════════════

export async function findEnrollmentsByCourse(courseId: string): Promise<DbRow[]> {
  const result = await query(
    `SELECT ce.*, u.full_name, u.avatar_url, u.email
     FROM course_enrollments ce
     JOIN users u ON u.id = ce.user_id
     WHERE ce.course_id = $1
     ORDER BY ce.started_at DESC`,
    [courseId]
  );
  return result.rows;
}

export async function findEnrollmentsByUser(userId: string): Promise<DbRow[]> {
  const result = await query(
    `SELECT ce.*, c.name AS course_name, c.cover_url, c.course_type
     FROM course_enrollments ce
     JOIN courses c ON c.id = ce.course_id
     WHERE ce.user_id = $1
     ORDER BY ce.last_accessed_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function findEnrollment(courseId: string, userId: string): Promise<DbRow | null> {
  const result = await query(
    "SELECT * FROM course_enrollments WHERE course_id = $1 AND user_id = $2",
    [courseId, userId]
  );
  return result.rows[0] || null;
}

export async function createEnrollment(enrollment: Partial<DbRow>): Promise<DbRow> {
  const id = enrollment.id || `enroll-${Date.now()}`;
  const result = await query(
    `INSERT INTO course_enrollments (id, course_id, user_id, workspace_id, status, progress, completed_lessons)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (course_id, user_id) DO UPDATE SET last_accessed_at = NOW()
     RETURNING *`,
    [
      id, enrollment.course_id, enrollment.user_id, enrollment.workspace_id,
      enrollment.status || "active", enrollment.progress || 0,
      enrollment.completed_lessons || [],
    ]
  );
  return result.rows[0];
}

export async function updateEnrollment(id: string, fields: Record<string, any>): Promise<DbRow | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) {
      setClauses.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
  }
  if (setClauses.length === 0) return findEnrollment(fields.course_id, fields.user_id);
  values.push(id);
  const result = await query(
    `UPDATE course_enrollments SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

// ═══════════════════════════════════════════════════════════════
// COURSE RESOURCES
// ═══════════════════════════════════════════════════════════════

export async function findResourcesByModule(moduleId: string): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM course_resources WHERE module_id = $1 ORDER BY created_at ASC",
    [moduleId]
  );
  return result.rows;
}

export async function createResource(resource: Partial<DbRow>): Promise<DbRow> {
  const id = resource.id || `res-${Date.now()}`;
  const result = await query(
    `INSERT INTO course_resources (id, module_id, title, description, file_url, file_type, file_size)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      id, resource.module_id, resource.title, resource.description || null,
      resource.file_url, resource.file_type, resource.file_size || null,
    ]
  );
  return result.rows[0];
}

export async function deleteResource(id: string): Promise<void> {
  await query("DELETE FROM course_resources WHERE id = $1", [id]);
}

// ═══════════════════════════════════════════════════════════════
// COURSE CERTIFICATES
// ═══════════════════════════════════════════════════════════════

export async function findCertificateByEnrollment(enrollmentId: string): Promise<DbRow | null> {
  const result = await query(
    "SELECT * FROM course_certificates WHERE enrollment_id = $1",
    [enrollmentId]
  );
  return result.rows[0] || null;
}

export async function createCertificate(cert: Partial<DbRow>): Promise<DbRow> {
  const id = cert.id || `cert-${Date.now()}`;
  const credentialId = `CRED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const result = await query(
    `INSERT INTO course_certificates (id, enrollment_id, course_id, user_id, certificate_url, credential_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      id, cert.enrollment_id, cert.course_id, cert.user_id,
      cert.certificate_url || null, credentialId,
    ]
  );
  return result.rows[0];
}

export async function findCertificatesByUser(userId: string): Promise<DbRow[]> {
  const result = await query(
    `SELECT cc.*, c.name AS course_name, c.course_type
     FROM course_certificates cc
     JOIN courses c ON c.id = cc.course_id
     WHERE cc.user_id = $1
     ORDER BY cc.issued_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function findModulesByCourse(courseId: string): Promise<DbRow[]> {
  const result = await query("SELECT * FROM modules WHERE course_id = $1 ORDER BY index ASC", [courseId]);
  return result.rows;
}

export async function createModule(mod: Partial<DbRow>): Promise<DbRow> {
  const id = mod.id || `mod-${Date.now()}`;
  const result = await query(
    "INSERT INTO modules (id, course_id, title, description, index, is_free_preview) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [id, mod.course_id, mod.title, mod.description || null, mod.index || 0, mod.is_free_preview || false]
  );
  return result.rows[0];
}

export async function findLessonsByModule(moduleId: string): Promise<DbRow[]> {
  const result = await query("SELECT * FROM lessons WHERE module_id = $1 ORDER BY index ASC", [moduleId]);
  return result.rows;
}

export async function findLessonById(id: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM lessons WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createLesson(lesson: Partial<DbRow>): Promise<DbRow> {
  const id = lesson.id || `les-${Date.now()}`;
  const result = await query(
    `INSERT INTO lessons (id, module_id, workspace_id, title, duration_minutes, video_url, text_content, index, is_locked, is_free_preview, attachments, content_type, quiz_questions, assignment_instructions, passing_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
    [
      id, lesson.module_id, lesson.workspace_id, lesson.title,
      lesson.duration_minutes || 0, lesson.video_url || "",
      lesson.text_content || "", lesson.index || 0,
      lesson.is_locked || false, lesson.is_free_preview || false,
      lesson.attachments || [],
      lesson.content_type || "video",
      JSON.stringify(lesson.quiz_questions || []),
      lesson.assignment_instructions || null,
      lesson.passing_score || 70,
    ]
  );
  return result.rows[0];
}

export async function findEventsByWorkspace(workspaceId: string): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM events WHERE workspace_id = $1 ORDER BY start_at ASC",
    [workspaceId]
  );
  return result.rows;
}

export async function findEventById(id: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM events WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createEvent(event: Partial<DbRow>): Promise<DbRow> {
  const id = event.id || `event-${Date.now()}`;
  const result = await query(
    `INSERT INTO events (id, workspace_id, title, description, start_at, end_at, platform, platform_url, category, host_name, host_avatar, timezone, attendees)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [
      id, event.workspace_id, event.title, event.description || "",
      event.start_at, event.end_at || null, event.platform || "Zoom",
      event.platform_url || null, event.category || "Class",
      event.host_name || null, event.host_avatar || null,
      event.timezone || "UTC", event.attendees || [],
    ]
  );
  return result.rows[0];
}

export async function updateEvent(id: string, fields: Record<string, any>): Promise<DbRow | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) {
      setClauses.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
  }

  if (setClauses.length === 0) return findEventById(id);

  values.push(id);
  const result = await query(
    `UPDATE events SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function findMessages(recipientId: string, currentUserId?: string): Promise<DbRow[]> {
  let result;
  if (currentUserId && recipientId.startsWith("user-")) {
    result = await query(
      `SELECT * FROM messages WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1) ORDER BY created_at ASC`,
      [currentUserId, recipientId]
    );
  } else {
    result = await query(
      "SELECT * FROM messages WHERE recipient_id = $1 ORDER BY created_at DESC",
      [recipientId]
    );
  }
  return result.rows;
}

export async function createMessage(msg: Partial<DbRow>): Promise<DbRow> {
  const id = msg.id || `msg-${Date.now()}`;
  const result = await query(
    `INSERT INTO messages (id, sender_id, sender_name, sender_avatar, recipient_id, content)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, msg.sender_id, msg.sender_name, msg.sender_avatar || null, msg.recipient_id, msg.content]
  );
  return result.rows[0];
}

export async function findChannelsByWorkspace(workspaceId: string): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM channels WHERE workspace_id = $1 ORDER BY created_at ASC",
    [workspaceId]
  );
  return result.rows;
}

export async function createChannel(ch: Partial<DbRow>): Promise<DbRow> {
  const id = ch.id || `ch-${Date.now()}`;
  const result = await query(
    `INSERT INTO channels (id, workspace_id, name, description, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, ch.workspace_id, ch.name, ch.description || null, ch.created_by || null]
  );
  return result.rows[0];
}

export async function deleteChannel(id: string): Promise<void> {
  await query("DELETE FROM channels WHERE id = $1", [id]);
}

export async function findNotificationsByUser(userId: string): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100",
    [userId]
  );
  return result.rows;
}

export async function createNotification(notif: Partial<DbRow>): Promise<DbRow> {
  const id = notif.id || `n-${Date.now()}`;
  const result = await query(
    `INSERT INTO notifications (id, user_id, title, message, type, is_read)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, notif.user_id, notif.title, notif.message || "", notif.type || "info", notif.is_read || false]
  );
  return result.rows[0];
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await query("UPDATE notifications SET is_read = true WHERE user_id = $1", [userId]);
}

export async function createTransaction(tx: Partial<DbRow>): Promise<DbRow> {
  const id = tx.id || `tx-${Date.now()}`;
  const result = await query(
    `INSERT INTO transactions (id, user_id, user_name, user_email, workspace_id, workspace_name, amount, type, status, payment_provider, payment_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [
      id, tx.user_id, tx.user_name || "", tx.user_email || "",
      tx.workspace_id || null, tx.workspace_name || null,
      tx.amount || 0, tx.type || "subscription", tx.status || "completed",
      tx.payment_provider || "paypal", tx.payment_id || null,
    ]
  );
  return result.rows[0];
}

export async function findUserTransactions(userId: string): Promise<DbRow[]> {
  const result = await query("SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
  return result.rows;
}

export async function findUserTransactionsByWorkspace(userId: string, workspaceId: string): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM transactions WHERE user_id = $1 AND workspace_id = $2 ORDER BY created_at DESC",
    [userId, workspaceId]
  );
  return result.rows;
}

export async function createAuditLog(log: Partial<DbRow>): Promise<DbRow> {
  const id = log.id || `log-${Date.now()}`;
  const result = await query(
    `INSERT INTO audit_logs (id, workspace_id, user_id, user_name, action, details)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, log.workspace_id || null, log.user_id, log.user_name || "", log.action, log.details || ""]
  );
  return result.rows[0];
}

export async function findAuditLogsByWorkspace(workspaceId: string): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM audit_logs WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 200",
    [workspaceId]
  );
  return result.rows;
}

export async function findAllAuditLogs(): Promise<DbRow[]> {
  const result = await query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500");
  return result.rows;
}

export async function createSession(session: Partial<DbRow>): Promise<DbRow> {
  const id = session.id || uuidv4();
  const result = await query(
    `INSERT INTO sessions (id, user_id, token_hash, remember_me, expires_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, session.user_id, session.token_hash, session.remember_me || false, session.expires_at]
  );
  return result.rows[0];
}

export async function findSessionByTokenHash(tokenHash: string): Promise<DbRow | null> {
  const result = await query(
    "SELECT * FROM sessions WHERE token_hash = $1 AND expires_at > NOW()",
    [tokenHash]
  );
  return result.rows[0] || null;
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await query("DELETE FROM sessions WHERE user_id = $1", [userId]);
}

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await query("DELETE FROM sessions WHERE expires_at < NOW()");
  return result.rowCount || 0;
}

export async function cleanupExpiredResetTokens(): Promise<number> {
  const result = await query("DELETE FROM password_reset_tokens WHERE expires_at < NOW()");
  return result.rowCount || 0;
}

export async function getLoginAttempts(email: string): Promise<DbRow | null> {
  const result = await query(
    "SELECT * FROM login_attempts WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC LIMIT 1",
    [email]
  );
  return result.rows[0] || null;
}

export async function upsertLoginAttempts(email: string, lockedUntil: Date | null): Promise<void> {
  const existing = await getLoginAttempts(email);
  if (existing) {
    if (lockedUntil) {
      await query("UPDATE login_attempts SET count = count + 1, locked_until = $1 WHERE id = $2", [lockedUntil, existing.id]);
    } else {
      await query("UPDATE login_attempts SET count = count + 1 WHERE id = $1", [existing.id]);
    }
  } else {
    await query(
      "INSERT INTO login_attempts (email, count, locked_until) VALUES ($1, 1, $2)",
      [email, lockedUntil]
    );
  }
}

export async function resetLoginAttempts(email: string): Promise<void> {
  await query("DELETE FROM login_attempts WHERE LOWER(email) = LOWER($1)", [email]);
}

export async function findWorkspaceUserIds(workspaceId: string): Promise<string[]> {
  const result = await query(
    "SELECT user_id FROM workspace_members WHERE workspace_id = $1 AND status != 'banned'",
    [workspaceId]
  );
  return result.rows.map((r: DbRow) => r.user_id);
}

export async function findUsersByIds(ids: string[]): Promise<DbRow[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
  const result = await query(`SELECT * FROM users WHERE id IN (${placeholders})`, ids);
  return result.rows;
}

export async function findAllUsers(): Promise<DbRow[]> {
  const result = await query("SELECT * FROM users ORDER BY xp DESC");
  return result.rows;
}
