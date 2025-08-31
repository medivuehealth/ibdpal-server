-- Migration: Add blog tables for story sharing functionality
-- This migration creates the necessary tables for the blog/story sharing feature

-- Create blog_stories table first (no dependencies)
CREATE TABLE IF NOT EXISTS blog_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    disease_type VARCHAR(50) NOT NULL CHECK (disease_type IN ('crohns', 'ulcerative_colitis', 'indeterminate')),
    tags TEXT[] DEFAULT '{}',
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_story_likes table for tracking user likes
CREATE TABLE IF NOT EXISTS blog_story_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, username)
);

-- Create blog_story_comments table
CREATE TABLE IF NOT EXISTS blog_story_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL,
    username VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_story_reports table for content moderation
CREATE TABLE IF NOT EXISTS blog_story_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL,
    reporter_username VARCHAR(255) NOT NULL,
    reason VARCHAR(100) NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'harassment', 'medical_advice', 'other')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, reporter_username)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_stories_username ON blog_stories(username);
CREATE INDEX IF NOT EXISTS idx_blog_stories_disease_type ON blog_stories(disease_type);
CREATE INDEX IF NOT EXISTS idx_blog_stories_created_at ON blog_stories(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_stories_is_published ON blog_stories(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_story_likes_story_id ON blog_story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_blog_story_likes_username ON blog_story_likes(username);
CREATE INDEX IF NOT EXISTS idx_blog_story_comments_story_id ON blog_story_comments(story_id);
CREATE INDEX IF NOT EXISTS idx_blog_story_reports_story_id ON blog_story_reports(story_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_stories_updated_at 
    BEFORE UPDATE ON blog_stories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_story_comments_updated_at 
    BEFORE UPDATE ON blog_story_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing
INSERT INTO blog_stories (username, title, content, disease_type, tags) VALUES
('test@example.com', 'My Journey with Crohn''s Disease', 'This is a sample story about living with Crohn''s disease...', 'crohns', ARRAY['journey', 'crohns', 'support']),
('test@example.com', 'Managing UC Symptoms', 'Here are some tips that helped me manage my ulcerative colitis symptoms...', 'ulcerative_colitis', ARRAY['tips', 'symptoms', 'management'])
ON CONFLICT DO NOTHING;

-- Update the likes and comments counts based on actual data
UPDATE blog_stories SET 
    likes = (SELECT COUNT(*) FROM blog_story_likes WHERE story_id = blog_stories.id),
    comments = (SELECT COUNT(*) FROM blog_story_comments WHERE story_id = blog_stories.id); 