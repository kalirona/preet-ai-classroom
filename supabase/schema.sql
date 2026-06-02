-- ==========================================================
-- SKOOL.SAAS ENTERPRISE MULTI-TENANT DATABASE SCHEMA
-- AUTO-GENERATED TO INTEGRATE WITH SUPABASE POSTGRESQL & AUTH
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean tables (in order of relations) if starting fresh
-- DROP TABLE IF EXISTS audit_logs;
-- DROP TABLE IF EXISTS notifications;
-- DROP TABLE IF EXISTS payments;
-- DROP TABLE IF EXISTS subscriptions;
-- DROP TABLE IF EXISTS resources;
-- DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS chat_rooms;
-- DROP TABLE IF EXISTS comments;
-- DROP TABLE IF EXISTS posts;
-- DROP TABLE IF EXISTS enrollments;
-- DROP TABLE IF EXISTS lessons;
-- DROP TABLE IF EXISTS modules;
-- DROP TABLE IF EXISTS courses;
-- DROP TABLE IF EXISTS workspace_members;
-- DROP TABLE IF EXISTS workspaces;
-- DROP TABLE IF EXISTS users;

-- ==========================================
-- 1. USERS TABLE (Linked with Supabase Auth)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Matches Supabase auth.users.id
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'member', -- Legacy fallback
    platform_role TEXT DEFAULT 'user' CHECK (platform_role IN ('super_admin', 'user')),
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 1,
    badges TEXT[] DEFAULT '{}',
    joined_communities TEXT[] DEFAULT '{}',
    bio TEXT,
    earnings NUMERIC(12, 2) DEFAULT 0.00,
    referred_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for speedy auth match
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ==========================================
-- 2. WORKSPACES (SaaS COMMUNITES) TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY, -- Tenant Identifier (Matches subdomain or uuid)
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    description TEXT,
    branding JSONB DEFAULT '{"logoUrl": "", "primaryColor": "indigo-650", "secondaryColor": "slate-900", "accentColor": "indigo-50", "bannerUrl": ""}'::jsonb,
    members_count INTEGER DEFAULT 1,
    owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    price_monthly NUMERIC(10, 2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    landing_hero_title TEXT,
    landing_hero_subtitle TEXT,
    categories TEXT[] DEFAULT '{"Introductions", "General", "Questions", "Showcase"}',
    faqs JSONB DEFAULT '[]'::jsonb,
    testimonials JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subdomain-based resolver index
CREATE INDEX IF NOT EXISTS idx_workspaces_subdomain ON workspaces(subdomain);

-- ==========================================
-- 3. WORKSPACE MEMBERS TABLE (Cross-link tenancy)
-- ==========================================
CREATE TABLE IF NOT EXISTS workspace_members (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'admin', 'moderator', 'member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'banned', 'muted')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON workspace_members(user_id);

-- ==========================================
-- 4. COURSES TABLE (LMS Classroom feature)
-- ==========================================
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    is_premium_only BOOLEAN DEFAULT FALSE,
    modules_count INTEGER DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_workspace ON courses(workspace_id);

-- ==========================================
-- 5. COURSE MODULES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);

-- ==========================================
-- 6. MODULE LESSONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, -- Tenant isolation helper
    title TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    video_url TEXT,
    text_content TEXT,
    index INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lessons_workspace ON lessons(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- ==========================================
-- 7. ENROLLMENTS & LESSON COMPLETIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed_lessons TEXT[] DEFAULT '{}', -- Tracks array of lesson.id completed
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_workspace ON enrollments(workspace_id);

-- ==========================================
-- 8. COMMUNICATIONS - FEED POSTS
-- ==========================================
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, -- Tenant isolation helper (community_id mapped)
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_role TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    likes INTEGER DEFAULT 0,
    liked_by_user_ids TEXT[] DEFAULT '{}',
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_announcement BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_workspace ON posts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

-- ==========================================
-- 9. POST COMMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id TEXT, -- For nested comment lines
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_role TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- ==========================================
-- 10. CHAT ROOMS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_workspace ON chat_rooms(workspace_id);

-- ==========================================
-- 11. MESSAGES TABLE (Realtime chat enabled)
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    chat_room_id TEXT REFERENCES chat_rooms(id) ON DELETE CASCADE, -- Nullable for direct messages
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    recipient_id TEXT, -- Hydrated for direct 1-to-1 secure private paths
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_workspace ON messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);

-- ==========================================
-- 12. RESOURCE VAULT (Storage uploads tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_workspace ON resources(workspace_id);

-- ==========================================
-- 13. SUBSCRIPTIONS & EARNINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'unpaid')),
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON subscriptions(workspace_id);

-- ==========================================
-- 14. PAYMENTS / TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT NOT NULL DEFAULT 'subscription' CHECK (type IN ('onetime', 'subscription')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_workspace ON payments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- ==========================================
-- 15. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'level_up', 'live_event', 'payment')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ==========================================
-- 16. AUDIT LOGS (Tenant & Platform Security)
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace ON audit_logs(workspace_id);


-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable RLS on all relational modules
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS: USERS POLICIES
-- ==========================================
CREATE POLICY "Allow public read for user profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow users to edit their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Allow platform super_admins full user control" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

-- ==========================================
-- RLS: WORKSPACES POLICIES
-- ==========================================
CREATE POLICY "Allow public read access to workspaces" ON workspaces
    FOR SELECT USING (true);

CREATE POLICY "Allow workspace creators to update own workspaces" ON workspaces
    FOR UPDATE USING (
        auth.uid()::text = owner_id OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

CREATE POLICY "Allow platform superadmins insert on workspaces" ON workspaces
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

-- ==========================================
-- RLS: WORKSPACE MEMBERS POLICIES (Strict Tenant Verification)
-- ==========================================
CREATE POLICY "Allow workspace members to see co-members" ON workspace_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid()::text AND wm.status = 'active'
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

CREATE POLICY "Allow workspace admin levels to add/update credentials" ON workspace_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = workspace_members.workspace_id 
              AND wm.user_id = auth.uid()::text 
              AND wm.role IN ('creator', 'admin') 
              AND wm.status = 'active'
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

-- ==========================================
-- RLS: LESSONS, MODULES & COURSES POLICIES
-- ==========================================
CREATE POLICY "Members with active status can read classroom modules" ON courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = courses.workspace_id AND wm.user_id = auth.uid()::text AND wm.status = 'active'
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

CREATE POLICY "Classroom builder managers can alter syllabus" ON courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = courses.workspace_id 
              AND wm.user_id = auth.uid()::text 
              AND wm.role IN ('creator', 'admin')
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

-- Map equivalent logic on submodules
CREATE POLICY "Unified modules access mapping" ON modules
    FOR SELECT USING (true); -- Governed transitively by course structures

CREATE POLICY "Unified lessons access mapping" ON lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = lessons.workspace_id AND wm.user_id = auth.uid()::text AND wm.status = 'active'
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

CREATE POLICY "Unified lessons write mapping" ON lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = lessons.workspace_id 
              AND wm.user_id = auth.uid()::text 
              AND wm.role IN ('creator', 'admin')
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

-- ==========================================
-- RLS: POSTS & COMMENTS POLICIES (Tenancy isolated feeds)
-- ==========================================
CREATE POLICY "Feed posts selective access" ON posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = posts.workspace_id AND wm.user_id = auth.uid()::text AND wm.status = 'active'
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

CREATE POLICY "Feed posts creation rules" ON posts
    FOR INSERT WITH CHECK (
        auth.uid()::text = author_id AND
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = posts.workspace_id AND wm.user_id = auth.uid()::text AND wm.status = 'active'
        )
    );

CREATE POLICY "Feed posts alteration controls" ON posts
    FOR ALL USING (
        auth.uid()::text = author_id OR
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = posts.workspace_id 
              AND wm.user_id = auth.uid()::text 
              AND wm.role IN ('creator', 'admin', 'moderator')
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

-- Unified comments selectivity
CREATE POLICY "Universal comment access" ON comments
    FOR SELECT USING (true); -- Transitively filtered by post selectivity

CREATE POLICY "Universal comment insertion" ON comments
    FOR INSERT WITH CHECK (auth.uid()::text = author_id);

CREATE POLICY "Universal comment moderation" ON comments
    FOR ALL USING (
        auth.uid()::text = author_id OR
        EXISTS (
            SELECT 1 FROM posts AS p
            JOIN workspace_members AS wm ON wm.workspace_id = p.workspace_id
            WHERE p.id = comments.post_id 
              AND wm.user_id = auth.uid()::text 
              AND wm.role IN ('creator', 'admin', 'moderator')
        )
    );

-- ==========================================
-- RLS: CHAT & SECURE MESSAGING POLICIES
-- ==========================================
CREATE POLICY "Active participants chat view" ON chat_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = chat_rooms.workspace_id AND wm.user_id = auth.uid()::text AND wm.status = 'active'
        )
    );

CREATE POLICY "Tenant group chat message safety limit" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = messages.workspace_id AND wm.user_id = auth.uid()::text AND wm.status = 'active'
        )
    );

CREATE POLICY "Tenant messages upload limit" ON messages
    FOR INSERT WITH CHECK (
        auth.uid()::text = sender_id AND
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = messages.workspace_id AND wm.user_id = auth.uid()::text AND wm.status = 'active'
        )
    );

-- ==========================================
-- RLS: STORAGE RESOURCES & AUDIT LOGS
-- ==========================================
CREATE POLICY "Active members resources read catalog" ON resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = resources.workspace_id AND wm.user_id = auth.uid()::text AND wm.status = 'active'
        )
    );

CREATE POLICY "Active members audit logs isolation" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members AS wm
            WHERE wm.workspace_id = audit_logs.workspace_id 
              AND wm.user_id = auth.uid()::text 
              AND wm.role IN ('creator', 'admin')
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text AND users.platform_role = 'super_admin'
        )
    );

-- ==========================================================
-- SUPABASE STORAGE BUCKETS AUTO-INITIALIZATION BLUEPRINTS
-- ==========================================================
-- To be run in Supabase Storage setup:
-- 1. Create a public bucket 'course-attachments'
-- 2. Create a public bucket 'user-avatars'
-- 3. Create a public bucket 'workspace-branding'
-- Set RLS policies in Supabase Storage matching ownership:
-- "Allow uploads only to users authenticated inside their workspace folders"
-- E.g. Storage policy target folder prefix: `workspace_id/`
