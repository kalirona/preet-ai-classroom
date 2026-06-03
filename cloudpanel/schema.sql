-- ==========================================================
-- SKOOL.SAAS ENTERPRISE MULTI-TENANT CLOUDPANEL DATABASE SCHEMA (MYSQL)
-- AUTO-GENERATED TO INTEGRATE WITH CLOUDPANEL MYSQL / MARIADB WORKLOADS
-- PROVIDES HIGH ACCESS PERFORMANCE WITH TENANT ISOLATION KEY INDICES
-- ==========================================================

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
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(191) PRIMARY KEY,
    email VARCHAR(191) UNIQUE NOT NULL,
    username VARCHAR(191) UNIQUE NOT NULL,
    full_name VARCHAR(191) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    platform_role VARCHAR(50) DEFAULT 'user',
    avatar_url TEXT,
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    streak INT DEFAULT 1,
    badges JSON, -- Stored as JSON array in MySQL
    joined_communities JSON, -- Stored as JSON array in MySQL
    bio TEXT,
    earnings DECIMAL(12, 2) DEFAULT 0.00,
    referred_by VARCHAR(191),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. WORKSPACES (SaaS COMMUNITIES) TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    subdomain VARCHAR(191) UNIQUE NOT NULL,
    description TEXT,
    branding JSON, -- Configuration map (PrimaryColor, logo, etc.)
    members_count INT DEFAULT 1,
    owner_id VARCHAR(191),
    is_premium BOOLEAN DEFAULT FALSE,
    price_monthly DECIMAL(10, 2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    landing_hero_title VARCHAR(255),
    landing_hero_subtitle VARCHAR(255),
    categories JSON, -- JSON array of active categories: ["General", etc]
    faqs JSON,
    testimonials JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_workspaces_subdomain (subdomain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. WORKSPACE MEMBERS TABLE (Tenant memberships)
-- ==========================================
CREATE TABLE IF NOT EXISTS workspace_members (
    id VARCHAR(191) PRIMARY KEY,
    workspace_id VARCHAR(191) NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    status VARCHAR(50) DEFAULT 'active',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_workspace_user (workspace_id, user_id),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_members_workspace (workspace_id),
    INDEX idx_members_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. COURSES TABLE (LMS Feature)
-- ==========================================
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(191) PRIMARY KEY,
    workspace_id VARCHAR(191) NOT NULL,
    name VARCHAR(191) NOT NULL,
    description TEXT,
    cover_url TEXT,
    is_premium_only BOOLEAN DEFAULT FALSE,
    modules_count INT DEFAULT 0,
    enrolled_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_courses_workspace (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. COURSE MODULES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(191) PRIMARY KEY,
    course_id VARCHAR(191) NOT NULL,
    title VARCHAR(191) NOT NULL,
    `index` INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_modules_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. MODULE LESSONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(191) PRIMARY KEY,
    module_id VARCHAR(191) NOT NULL,
    workspace_id VARCHAR(191) NOT NULL, -- Isolated tenant indexing helper
    title VARCHAR(191) NOT NULL,
    duration_minutes INT DEFAULT 0,
    video_url TEXT,
    text_content TEXT,
    `index` INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_lessons_workspace (workspace_id),
    INDEX idx_lessons_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. ENROLLMENTS & COMPLETIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS enrollments (
    id VARCHAR(191) PRIMARY KEY,
    workspace_id VARCHAR(191) NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    course_id VARCHAR(191) NOT NULL,
    completed_lessons JSON, -- Track arrays of lesson IDs
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_course (user_id, course_id),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_enrollments_user (user_id),
    INDEX idx_enrollments_workspace (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 8. COMMUNICATIONS - FEED POSTS
-- ==========================================
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(191) PRIMARY KEY,
    workspace_id VARCHAR(191) NOT NULL,
    author_id VARCHAR(191) NOT NULL,
    author_name VARCHAR(191) NOT NULL,
    author_avatar TEXT,
    author_role VARCHAR(50),
    title VARCHAR(191) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    likes INT DEFAULT 0,
    liked_by_user_ids JSON, -- Array of liker IDs
    comments_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_announcement BOOLEAN DEFAULT FALSE,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_posts_workspace (workspace_id),
    INDEX idx_posts_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 9. POST COMMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(191) PRIMARY KEY,
    post_id VARCHAR(191) NOT NULL,
    parent_id VARCHAR(191),
    author_id VARCHAR(191) NOT NULL,
    author_name VARCHAR(191) NOT NULL,
    author_avatar TEXT,
    author_role VARCHAR(50),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_comments_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 10. CHAT ROOMS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id VARCHAR(191) PRIMARY KEY,
    workspace_id VARCHAR(191) NOT NULL,
    name VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_chat_rooms_workspace (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 11. MESSAGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(191) PRIMARY KEY,
    workspace_id VARCHAR(191) NOT NULL,
    chat_room_id VARCHAR(191),
    sender_id VARCHAR(191) NOT NULL,
    sender_name VARCHAR(191) NOT NULL,
    sender_avatar TEXT,
    recipient_id VARCHAR(191),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_messages_workspace (workspace_id),
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_recipient (recipient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 12. RESOURCE VAULT (Upload tracks)
-- ==========================================
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(191) PRIMARY KEY,
    workspace_id VARCHAR(191) NOT NULL,
    title VARCHAR(191) NOT NULL,
    url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_resources_workspace (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 13. SUBSCRIPTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(191) PRIMARY KEY,
    workspace_id VARCHAR(191) NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    current_period_end TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subscriptions_user (user_id),
    INDEX idx_subscriptions_workspace (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 14. PAYMENTS / TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(191) PRIMARY KEY,
    workspace_id VARCHAR(191) NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    user_name VARCHAR(191) NOT NULL,
    user_email VARCHAR(191) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) DEFAULT 'subscription',
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payments_workspace (workspace_id),
    INDEX idx_payments_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 15. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(191) PRIMARY KEY,
    user_id VARCHAR(191) NOT NULL,
    title VARCHAR(191) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 16. AUDIT LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(191) PRIMARY KEY,
    workspace_id VARCHAR(191) NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    user_name VARCHAR(191) NOT NULL,
    action VARCHAR(191) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_audit_logs_workspace (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
