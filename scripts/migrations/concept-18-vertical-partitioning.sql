-- =============================================================================
-- EduPress LMS: Phase 3 Database & Scaling Architecture
-- Concept #18: Vertical Partitioning Migration Script
-- =============================================================================
-- RATIONALE:
-- Split monolithic 'users' table into two specialized partitions:
-- 1. 'users_auth': Narrow (~110 bytes/row), queried on EVERY request/auth check.
-- 2. 'users_profile': Wide & variable (~650 bytes/row), queried ONLY on profile views.
-- =============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. VERTICAL PARTITION 1: High-Frequency, Narrow Authentication Records
CREATE TABLE IF NOT EXISTS public.users_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'INSTRUCTOR', 'ADMIN')),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. VERTICAL PARTITION 2: Low-Frequency, Bulky Profile & Preference Records
CREATE TABLE IF NOT EXISTS public.users_profile (
  user_id UUID PRIMARY KEY REFERENCES public.users_auth(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  preferences JSONB NOT NULL DEFAULT '{"theme": "light", "emailNotifications": true, "language": "en", "twoFactorEnabled": false}'::jsonb,
  social_links JSONB NOT NULL DEFAULT '{"twitter": "", "github": "", "linkedin": ""}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Optimized B-Tree Indexes for Sub-Millisecond Authentication Lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_email ON public.users_auth(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_role ON public.users_auth(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_status ON public.users_auth(status);
CREATE INDEX IF NOT EXISTS idx_users_profile_username ON public.users_profile(username);

-- 4. Sample Seed Data Demonstrating Vertical Partition Isolation
INSERT INTO public.users_auth (id, email, password_hash, role, status, last_login_at)
VALUES 
  ('a1111111-1111-4111-a111-111111111111', 'student@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz012345', 'STUDENT', 'ACTIVE', NOW()),
  ('b2222222-2222-4222-b222-222222222222', 'john.doe@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz012345', 'INSTRUCTOR', 'ACTIVE', NOW()),
  ('c3333333-3333-4333-c333-333333333333', 'admin@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz012345', 'ADMIN', 'ACTIVE', NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.users_profile (user_id, username, full_name, bio, avatar_url, preferences, social_links)
VALUES 
  (
    'a1111111-1111-4111-a111-111111111111', 
    'student_pro', 
    'Alex Student', 
    'Passionate Full-Stack Developer learning Next.js 16, Distributed Systems, and Microservices.', 
    'https://api.dicebear.com/7.x/avataaars/svg?seed=student_pro',
    '{"theme": "dark", "emailNotifications": true, "language": "en"}'::jsonb,
    '{"github": "https://github.com/student", "linkedin": "https://linkedin.com/in/student"}'::jsonb
  ),
  (
    'b2222222-2222-4222-b222-222222222222', 
    'john_doe', 
    'Dr. John Doe', 
    'Lead Instructor with 12+ years in Cloud Computing, Microservices, and Polyglot Persistence architectures.', 
    'https://api.dicebear.com/7.x/avataaars/svg?seed=john_doe',
    '{"theme": "light", "emailNotifications": true, "language": "en"}'::jsonb,
    '{"github": "https://github.com/johndoe", "twitter": "https://twitter.com/johndoe"}'::jsonb
  ),
  (
    'c3333333-3333-4333-c333-333333333333', 
    'sys_admin', 
    'Global Administrator', 
    'EduPress LMS Cluster Administrator.', 
    'https://api.dicebear.com/7.x/avataaars/svg?seed=sys_admin',
    '{"theme": "system", "emailNotifications": true, "language": "en"}'::jsonb,
    '{}'::jsonb
  )
ON CONFLICT (user_id) DO NOTHING;
