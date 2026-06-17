import { query, DbRow, filterAllowedFields } from "./db.js";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_SPACE_COLUMNS = ["name", "description", "icon", "color", "access_type", "sort_order", "is_archived"];

// ─── Spaces ───────────────────────────────────────────

export async function findSpacesByWorkspace(workspaceId: string): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM spaces WHERE workspace_id = $1 AND is_archived = false ORDER BY sort_order ASC, name ASC",
    [workspaceId]
  );
  return result.rows;
}

export async function findSpaceById(id: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM spaces WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createSpace(space: Partial<DbRow>): Promise<DbRow> {
  const id = space.id || `sp-${Date.now()}-${uuidv4().slice(0, 6)}`;
  const result = await query(
    `INSERT INTO spaces (id, workspace_id, name, description, icon, color, access_type, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      id, space.workspace_id, space.name, space.description || "",
      space.icon || "💬", space.color || "indigo",
      space.access_type || "public", space.sort_order || 0,
    ]
  );
  return result.rows[0];
}

export async function updateSpace(id: string, fields: Partial<DbRow>): Promise<DbRow | null> {
  const allowed = filterAllowedFields(fields, ALLOWED_SPACE_COLUMNS);
  const entries = Object.entries(allowed);
  if (entries.length === 0) return findSpaceById(id);
  const setClauses = entries.map((_, i) => `${entries[i][0]} = $${i + 1}`);
  const values = entries.map(([_, v]) => v);
  values.push(id);
  const result = await query(
    `UPDATE spaces SET ${setClauses.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteSpace(id: string): Promise<void> {
  await query("DELETE FROM spaces WHERE id = $1", [id]);
}

// ─── Posts (extended with space_id) ────────────────────

export async function findPostsBySpace(
  workspaceId: string,
  spaceId?: string,
  options?: { limit?: number; offset?: number; search?: string }
): Promise<{ rows: DbRow[]; total: number }> {
  const params: any[] = [workspaceId];
  let idx = 2;
  let where = "WHERE p.workspace_id = $1";

  if (spaceId) {
    where += ` AND p.space_id = $${idx}`;
    params.push(spaceId);
    idx++;
  }

  if (options?.search) {
    where += ` AND (LOWER(p.title) LIKE LOWER($${idx}) OR LOWER(p.content) LIKE LOWER($${idx}))`;
    params.push(`%${options.search}%`);
    idx++;
  }

  const countResult = await query(`SELECT COUNT(*) as total FROM posts p ${where}`, params);
  const total = parseInt(countResult.rows[0]?.total || "0", 10);

  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  const result = await query(
    `SELECT p.*, COALESCE(r.reaction_counts, '{}') as reaction_counts
     FROM posts p
     LEFT JOIN (
       SELECT post_id, jsonb_object_agg(reaction, cnt) as reaction_counts
       FROM (
         SELECT post_id, reaction, COUNT(*) as cnt
         FROM post_reactions
         GROUP BY post_id, reaction
       ) sub GROUP BY post_id
     ) r ON r.post_id = p.id
     ${where}
     ORDER BY p.is_pinned DESC, p.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );

  return { rows: result.rows, total };
}

export async function createPostWithSpace(post: Partial<DbRow>): Promise<DbRow> {
  const id = post.id || `post-${Date.now()}-${uuidv4().slice(0, 6)}`;
  const result = await query(
    `INSERT INTO posts (id, workspace_id, space_id, author_id, author_name, author_avatar, author_role, title, content, category, likes, liked_by_user_ids, comments_count, is_pinned, is_announcement, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
    [
      id, post.workspace_id, post.space_id || null,
      post.author_id, post.author_name,
      post.author_avatar || null, post.author_role || null,
      post.title, post.content || "", post.category || "General",
      post.likes || 0, post.liked_by_user_ids || [],
      post.comments_count || 0, post.is_pinned || false,
      post.is_announcement || false, post.tags || [],
    ]
  );
  return result.rows[0];
}

export async function awardBadge(userId: string, badgeName: string, workspaceId?: string): Promise<DbRow | null> {
  const badge = (await query("SELECT * FROM badge_definitions WHERE name = $1", [badgeName])).rows[0];
  if (!badge) return null;
  const existing = (await query(
    "SELECT * FROM user_badges WHERE user_id = $1 AND badge_id = $2",
    [userId, badge.id]
  )).rows[0];
  if (existing) return existing;

  const id = `ub-${Date.now()}-${uuidv4().slice(0, 6)}`;
  const result = await query(
    "INSERT INTO user_badges (id, user_id, badge_id, workspace_id) VALUES ($1, $2, $3, $4) RETURNING *",
    [id, userId, badge.id, workspaceId || null]
  );

  const userBadges = (await query("SELECT badges FROM users WHERE id = $1", [userId])).rows[0];
  const currentBadges = userBadges?.badges || [];
  if (!currentBadges.includes(badgeName)) {
    await query("UPDATE users SET badges = array_append(badges, $1) WHERE id = $2", [badgeName, userId]);
  }

  return result.rows[0];
}

// ─── Reactions ────────────────────────────────────────

export async function togglePostReaction(postId: string, userId: string, reaction: string = "like"): Promise<{ reacted: boolean; counts: Record<string, number> }> {
  const existing = (await query(
    "SELECT * FROM post_reactions WHERE post_id = $1 AND user_id = $2 AND reaction = $3",
    [postId, userId, reaction]
  )).rows[0];

  if (existing) {
    await query("DELETE FROM post_reactions WHERE id = $1", [existing.id]);
    const countResult = await query(
      "SELECT reaction, COUNT(*) as cnt FROM post_reactions WHERE post_id = $1 GROUP BY reaction",
      [postId]
    );
    const counts: Record<string, number> = {};
    for (const r of countResult.rows) counts[r.reaction] = parseInt(r.cnt);
    await query("UPDATE posts SET likes = $1 WHERE id = $2", [(counts["like"] || 0), postId]);
    return { reacted: false, counts };
  }

  const id = `pr-${Date.now()}-${uuidv4().slice(0, 6)}`;
  await query(
    "INSERT INTO post_reactions (id, post_id, user_id, reaction) VALUES ($1, $2, $3, $4)",
    [id, postId, userId, reaction]
  );

  const countResult = await query(
    "SELECT reaction, COUNT(*) as cnt FROM post_reactions WHERE post_id = $1 GROUP BY reaction",
    [postId]
  );
  const counts: Record<string, number> = {};
  for (const r of countResult.rows) counts[r.reaction] = parseInt(r.cnt);
  await query("UPDATE posts SET likes = $1 WHERE id = $2", [(counts["like"] || 0), postId]);

  return { reacted: true, counts };
}

export async function getPostReactions(postId: string): Promise<Record<string, number>> {
  const result = await query(
    "SELECT reaction, COUNT(*) as cnt FROM post_reactions WHERE post_id = $1 GROUP BY reaction",
    [postId]
  );
  const counts: Record<string, number> = {};
  for (const r of result.rows) counts[r.reaction] = parseInt(r.cnt);
  return counts;
}

// ─── Threaded Comments ────────────────────────────────

export async function findCommentsThreaded(postId: string): Promise<DbRow[]> {
  const result = await query(
    `SELECT c.*,
      COALESCE((SELECT jsonb_object_agg(reaction, cnt) FROM (
        SELECT reaction, COUNT(*) as cnt FROM comment_reactions WHERE comment_id = c.id GROUP BY reaction
      ) sub), '{}') as reaction_counts,
      (SELECT COUNT(*) FROM comment_reactions WHERE comment_id = c.id) as reactions_count
     FROM comments c
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return result.rows;
}

export async function toggleCommentReaction(commentId: string, userId: string, reaction: string = "like"): Promise<{ reacted: boolean; counts: Record<string, number> }> {
  const existing = (await query(
    "SELECT * FROM comment_reactions WHERE comment_id = $1 AND user_id = $2 AND reaction = $3",
    [commentId, userId, reaction]
  )).rows[0];

  if (existing) {
    await query("DELETE FROM comment_reactions WHERE id = $1", [existing.id]);
  } else {
    const id = `cr-${Date.now()}-${uuidv4().slice(0, 6)}`;
    await query(
      "INSERT INTO comment_reactions (id, comment_id, user_id, reaction) VALUES ($1, $2, $3, $4)",
      [id, commentId, userId, reaction]
    );
  }

  const counts: Record<string, number> = {};
  const result = await query(
    "SELECT reaction, COUNT(*) as cnt FROM comment_reactions WHERE comment_id = $1 GROUP BY reaction",
    [commentId]
  );
  for (const r of result.rows) counts[r.reaction] = parseInt(r.cnt);

  return { reacted: !existing, counts };
}

// ─── XP System ────────────────────────────────────────

export async function addXp(
  userId: string,
  workspaceId: string | null,
  amount: number,
  reason: string,
  referenceType?: string,
  referenceId?: string
): Promise<{ xp: number; level: number; leveledUp: boolean }> {
  const id = `xp-${Date.now()}-${uuidv4().slice(0, 6)}`;
  await query(
    `INSERT INTO xp_transactions (id, user_id, workspace_id, amount, reason, reference_type, reference_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, userId, workspaceId, amount, reason, referenceType || null, referenceId || null]
  );

  const user = await query("SELECT xp, level FROM users WHERE id = $1", [userId]);
  const currentXp = user.rows[0]?.xp || 0;
  const currentLevel = user.rows[0]?.level || 1;
  const newXp = currentXp + amount;

  const xpForNextLevel = (level: number) => level * 100;
  let newLevel = currentLevel;
  let leveledUp = false;
  while (newXp >= xpForNextLevel(newLevel)) {
    newLevel++;
    leveledUp = true;
  }

  await query("UPDATE users SET xp = $1, level = $2 WHERE id = $3", [newXp, newLevel, userId]);

  return { xp: newXp, level: newLevel, leveledUp };
}

export async function getXpHistory(userId: string, limit: number = 50): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM xp_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
    [userId, limit]
  );
  return result.rows;
}

export async function getWorkspaceLeaderboard(workspaceId: string, period: "weekly" | "monthly" | "all" = "all"): Promise<DbRow[]> {
  let dateFilter = "";
  if (period === "weekly") {
    dateFilter = "AND xt.created_at >= NOW() - INTERVAL '7 days'";
  } else if (period === "monthly") {
    dateFilter = "AND xt.created_at >= NOW() - INTERVAL '30 days'";
  }
  const result = await query(
    `SELECT u.id, u.full_name, u.username, u.avatar_url, u.level, u.xp as total_xp,
            COALESCE(SUM(xt.amount), 0) as period_xp
     FROM workspace_members wm
     JOIN users u ON u.id = wm.user_id
     LEFT JOIN xp_transactions xt ON xt.user_id = u.id AND xt.workspace_id = $1 ${dateFilter}
     WHERE wm.workspace_id = $1 AND wm.status = 'active'
     GROUP BY u.id, u.full_name, u.username, u.avatar_url, u.level, u.xp
     ORDER BY period_xp DESC, u.xp DESC
     LIMIT 100`,
    [workspaceId]
  );
  return result.rows;
}

// ─── Challenges ───────────────────────────────────────

export async function findChallengesByWorkspace(workspaceId: string): Promise<DbRow[]> {
  const result = await query(
    `SELECT c.*,
      (SELECT COUNT(*) FROM challenge_participants cp WHERE cp.challenge_id = c.id) as participant_count
     FROM challenges c WHERE c.workspace_id = $1 AND c.is_active = true
     ORDER BY c.starts_at DESC`,
    [workspaceId]
  );
  return result.rows;
}

export async function findChallengeById(id: string): Promise<DbRow | null> {
  const result = await query("SELECT * FROM challenges WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function createChallenge(ch: Partial<DbRow>): Promise<DbRow> {
  const id = ch.id || `ch-${Date.now()}-${uuidv4().slice(0, 6)}`;
  const result = await query(
    `INSERT INTO challenges (id, workspace_id, title, description, icon, color, challenge_type, duration_days, xp_reward, starts_at, ends_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [
      id, ch.workspace_id, ch.title, ch.description || "",
      ch.icon || "🏅", ch.color || "indigo",
      ch.challenge_type || "daily", ch.duration_days || 7,
      ch.xp_reward || 100, ch.starts_at, ch.ends_at,
      ch.created_by || null,
    ]
  );
  return result.rows[0];
}

export async function findChallengeTasks(challengeId: string): Promise<DbRow[]> {
  const result = await query(
    "SELECT * FROM challenge_tasks WHERE challenge_id = $1 ORDER BY day ASC, sort_order ASC",
    [challengeId]
  );
  return result.rows;
}

export async function createChallengeTask(task: Partial<DbRow>): Promise<DbRow> {
  const id = task.id || `ct-${Date.now()}-${uuidv4().slice(0, 6)}`;
  const result = await query(
    `INSERT INTO challenge_tasks (id, challenge_id, title, description, day, task_type, xp_per_completion, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      id, task.challenge_id, task.title, task.description || "",
      task.day || 1, task.task_type || "custom",
      task.xp_per_completion || 10, task.sort_order || 0,
    ]
  );
  return result.rows[0];
}

export async function joinChallenge(challengeId: string, userId: string): Promise<DbRow | null> {
  const existing = (await query(
    "SELECT * FROM challenge_participants WHERE challenge_id = $1 AND user_id = $2",
    [challengeId, userId]
  )).rows[0];
  if (existing) return existing;

  const id = `cp-${Date.now()}-${uuidv4().slice(0, 6)}`;
  const result = await query(
    "INSERT INTO challenge_participants (id, challenge_id, user_id) VALUES ($1, $2, $3) RETURNING *",
    [id, challengeId, userId]
  );
  return result.rows[0];
}

export async function completeChallengeTask(challengeId: string, userId: string, taskId: string): Promise<DbRow | null> {
  const participant = (await query(
    "SELECT * FROM challenge_participants WHERE challenge_id = $1 AND user_id = $2",
    [challengeId, userId]
  )).rows[0];
  if (!participant) return null;

  const completed = participant.completed_tasks || [];
  if (completed.includes(taskId)) return participant;

  const updated = [...completed, taskId];
  const tasks = await findChallengeTasks(challengeId);
  const isComplete = tasks.every((t: DbRow) => updated.includes(t.id));

  const result = await query(
    `UPDATE challenge_participants SET completed_tasks = $1, is_completed = $2,
      completed_at = CASE WHEN $2 THEN NOW() ELSE completed_at END
     WHERE id = $3 RETURNING *`,
    [updated, isComplete, participant.id]
  );
  return result.rows[0];
}

export async function getChallengeLeaderboard(challengeId: string): Promise<DbRow[]> {
  const result = await query(
    `SELECT cp.*, u.full_name, u.username, u.avatar_url, u.xp, u.level,
      array_length(cp.completed_tasks, 1) as tasks_completed
     FROM challenge_participants cp
     JOIN users u ON u.id = cp.user_id
     WHERE cp.challenge_id = $1
     ORDER BY cp.is_completed DESC,
       array_length(cp.completed_tasks, 1) DESC NULLS LAST,
       cp.joined_at ASC`,
    [challengeId]
  );
  return result.rows;
}

// ─── Lesson Discussions ───────────────────────────────

export async function findLessonDiscussions(lessonId: string): Promise<DbRow[]> {
  const result = await query(
    `SELECT ld.*, u.full_name, u.avatar_url, u.level
     FROM lesson_discussions ld
     JOIN users u ON u.id = ld.user_id
     WHERE ld.lesson_id = $1
     ORDER BY ld.created_at ASC`,
    [lessonId]
  );
  return result.rows;
}

export async function createLessonDiscussion(disc: Partial<DbRow>): Promise<DbRow> {
  const id = disc.id || `ld-${Date.now()}-${uuidv4().slice(0, 6)}`;
  const result = await query(
    `INSERT INTO lesson_discussions (id, lesson_id, user_id, content, parent_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, disc.lesson_id, disc.user_id, disc.content, disc.parent_id || null]
  );
  return result.rows[0];
}

// ─── Lesson Notes ─────────────────────────────────────

export async function upsertLessonNote(lessonId: string, userId: string, content: string, timestampSeconds?: number): Promise<DbRow> {
  const existing = (await query(
    "SELECT * FROM lesson_notes WHERE lesson_id = $1 AND user_id = $2",
    [lessonId, userId]
  )).rows[0];

  if (existing) {
    const result = await query(
      `UPDATE lesson_notes SET content = $1, timestamp_seconds = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [content, timestampSeconds ?? existing.timestamp_seconds, existing.id]
    );
    return result.rows[0];
  }

  const id = `ln-${Date.now()}-${uuidv4().slice(0, 6)}`;
  const result = await query(
    `INSERT INTO lesson_notes (id, lesson_id, user_id, content, timestamp_seconds)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, lessonId, userId, content, timestampSeconds || null]
  );
  return result.rows[0];
}

export async function findLessonNote(lessonId: string, userId: string): Promise<DbRow | null> {
  const result = await query(
    "SELECT * FROM lesson_notes WHERE lesson_id = $1 AND user_id = $2",
    [lessonId, userId]
  );
  return result.rows[0] || null;
}

// ─── Member Activity ──────────────────────────────────

export async function logActivity(
  workspaceId: string, userId: string, activityType: string,
  description: string, referenceType?: string, referenceId?: string, metadata?: Record<string, any>
): Promise<DbRow> {
  const id = `act-${Date.now()}-${uuidv4().slice(0, 6)}`;
  const result = await query(
    `INSERT INTO member_activity (id, workspace_id, user_id, activity_type, description, reference_type, reference_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      id, workspaceId, userId, activityType, description,
      referenceType || null, referenceId || null,
      JSON.stringify(metadata || {}),
    ]
  );
  return result.rows[0];
}

export async function findMemberActivity(workspaceId: string, limit: number = 50): Promise<DbRow[]> {
  const result = await query(
    `SELECT ma.*, u.full_name, u.avatar_url, u.level
     FROM member_activity ma
     JOIN users u ON u.id = ma.user_id
     WHERE ma.workspace_id = $1
     ORDER BY ma.created_at DESC LIMIT $2`,
    [workspaceId, limit]
  );
  return result.rows;
}

export async function findUserActivity(userId: string, workspaceId?: string, limit: number = 30): Promise<DbRow[]> {
  let where = "WHERE ma.user_id = $1";
  const params: any[] = [userId];
  if (workspaceId) {
    where += " AND ma.workspace_id = $2";
    params.push(workspaceId);
  }
  params.push(limit);
  const idx = params.length;
  const result = await query(
    `SELECT ma.*, w.name as workspace_name
     FROM member_activity ma
     LEFT JOIN workspaces w ON w.id = ma.workspace_id
     ${where}
     ORDER BY ma.created_at DESC LIMIT $${idx}`,
    params
  );
  return result.rows;
}

// ─── Community Feed (engagement-ranked) ──────────────

export async function findCommunityFeed(
  workspaceId: string,
  userId: string,
  limit: number = 30,
  offset: number = 0
): Promise<DbRow[]> {
  const result = await query(
    `SELECT p.*,
      COALESCE(pr.reaction_counts, '{}') as reaction_counts,
      COALESCE(pr.total_reactions, 0) as total_reactions,
      CASE WHEN pl.user_id IS NOT NULL THEN true ELSE false END as user_has_liked,
      u.full_name as author_full_name, u.avatar_url as author_avatar_url,
      u.level as author_level, u.badges as author_badges,
      s.name as space_name, s.icon as space_icon, s.color as space_color,
      (p.likes * 2 + p.comments_count * 3 + CASE WHEN p.is_pinned THEN 50 ELSE 0 END +
       CASE WHEN p.is_announcement THEN 30 ELSE 0 END +
       EXTRACT(EPOCH FROM p.created_at) / 3600) as engagement_score
     FROM posts p
     JOIN users u ON u.id = p.author_id
     LEFT JOIN spaces s ON s.id = p.space_id
     LEFT JOIN (
       SELECT post_id, jsonb_object_agg(reaction, cnt) as reaction_counts,
              SUM(cnt) as total_reactions
       FROM (SELECT post_id, reaction, COUNT(*) as cnt FROM post_reactions GROUP BY post_id, reaction) sub
       GROUP BY post_id
     ) pr ON pr.post_id = p.id
     LEFT JOIN post_reactions pl ON pl.post_id = p.id AND pl.user_id = $2 AND pl.reaction = 'like'
     WHERE p.workspace_id = $1
     ORDER BY engagement_score DESC, p.created_at DESC
     LIMIT $3 OFFSET $4`,
    [workspaceId, userId, limit, offset]
  );
  return result.rows;
}

// ─── Creator Analytics ────────────────────────────────

export async function getCommunityHealthScore(workspaceId: string): Promise<any> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const totalMembers = (await query(
    "SELECT COUNT(*) as c FROM workspace_members WHERE workspace_id = $1 AND status = 'active'",
    [workspaceId]
  )).rows[0]?.c || 0;

  const active30d = (await query(
    "SELECT COUNT(DISTINCT user_id) as c FROM member_activity WHERE workspace_id = $1 AND created_at >= $2",
    [workspaceId, thirtyDaysAgo]
  )).rows[0]?.c || 0;

  const active7d = (await query(
    "SELECT COUNT(DISTINCT user_id) as c FROM member_activity WHERE workspace_id = $1 AND created_at >= $2",
    [workspaceId, sevenDaysAgo]
  )).rows[0]?.c || 0;

  const newMembers30d = (await query(
    "SELECT COUNT(*) as c FROM workspace_members WHERE workspace_id = $1 AND joined_at >= $2",
    [workspaceId, thirtyDaysAgo]
  )).rows[0]?.c || 0;

  const posts30d = (await query(
    "SELECT COUNT(*) as c FROM posts WHERE workspace_id = $1 AND created_at >= $2",
    [workspaceId, thirtyDaysAgo]
  )).rows[0]?.c || 0;

  const comments30d = (await query(
    "SELECT COUNT(*) as c FROM comments c JOIN posts p ON p.id = c.post_id WHERE p.workspace_id = $1 AND c.created_at >= $2",
    [workspaceId, thirtyDaysAgo]
  )).rows[0]?.c || 0;

  const reactions30d = (await query(
    "SELECT COUNT(*) as c FROM post_reactions pr JOIN posts p ON p.id = pr.post_id WHERE p.workspace_id = $1 AND pr.created_at >= $2",
    [workspaceId, thirtyDaysAgo]
  )).rows[0]?.c || 0;

  const engagement30d = totalMembers > 0 ? (active30d / totalMembers) * 100 : 0;
  const retention30d = totalMembers > 0 ? ((totalMembers - newMembers30d + active30d) / totalMembers) * 100 : 0;

  const topContributors = (await query(
    `SELECT u.id, u.full_name, u.avatar_url, u.level, u.xp, u.badges,
      COUNT(DISTINCT p.id) as posts_count, COUNT(DISTINCT c.id) as comments_count
     FROM workspace_members wm
     JOIN users u ON u.id = wm.user_id
     LEFT JOIN posts p ON p.author_id = u.id AND p.workspace_id = $1
     LEFT JOIN comments c ON c.author_id = u.id
     LEFT JOIN posts cp ON cp.id = c.post_id AND cp.workspace_id = $1
     WHERE wm.workspace_id = $1 AND wm.status = 'active'
     GROUP BY u.id, u.full_name, u.avatar_url, u.level, u.xp, u.badges
     ORDER BY posts_count DESC, comments_count DESC
     LIMIT 20`,
    [workspaceId]
  )).rows;

  const churnRisk = (await query(
    `SELECT u.id, u.full_name, u.avatar_url, u.xp, u.level,
      MAX(ma.created_at) as last_active
     FROM workspace_members wm
     JOIN users u ON u.id = wm.user_id
     LEFT JOIN member_activity ma ON ma.user_id = u.id AND ma.workspace_id = $1
     WHERE wm.workspace_id = $1 AND wm.status = 'active'
     GROUP BY u.id, u.full_name, u.avatar_url, u.xp, u.level
     HAVING MAX(ma.created_at) IS NULL OR MAX(ma.created_at) < $2
     ORDER BY last_active ASC NULLS FIRST
     LIMIT 20`,
    [workspaceId, fourteenDaysAgo()]
  )).rows;

  return {
    totalMembers: parseInt(totalMembers),
    active30d: parseInt(active30d),
    active7d: parseInt(active7d),
    engagement30d: Math.round(engagement30d * 10) / 10,
    retention30d: Math.round(retention30d * 10) / 10,
    newMembers30d: parseInt(newMembers30d),
    posts30d: parseInt(posts30d),
    comments30d: parseInt(comments30d),
    reactions30d: parseInt(reactions30d),
    topContributors,
    churnRisk,
  };
}

function fourteenDaysAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  return d;
}
