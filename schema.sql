-- Supabase Database Schema Setup Script
-- Run this script in the Supabase SQL Editor (https://supabase.com -> Project -> SQL Editor)

-- 1. Create users table (without foreign keys to avoid circular dependency)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    suc_number TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    section TEXT NOT NULL,
    class TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    campus TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    role TEXT DEFAULT 'None',
    team_id UUID,
    linkedin_score INTEGER DEFAULT 0,
    linkedin_submission_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    lead_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    join_code TEXT UNIQUE NOT NULL,
    max_size INTEGER NOT NULL DEFAULT 5,
    problem_statement_id UUID REFERENCES problem_statements(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Establish mutual reference: Add foreign key constraint to users table
ALTER TABLE users 
ADD CONSTRAINT fk_users_team_id 
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- 4. Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('Mini', 'Main')),
    submitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    github_link TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create problem_statements table
CREATE TABLE IF NOT EXISTS problem_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create linkedin_posts table
CREATE TABLE IF NOT EXISTS linkedin_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
