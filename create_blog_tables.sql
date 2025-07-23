-- Blog System Database Tables for IBDPal

-- Table for storing user blog stories
CREATE TABLE IF NOT EXISTS blog_stories (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_age INTEGER NOT NULL,
    disease_type VARCHAR(50) NOT NULL CHECK (disease_type IN ('crohns', 'ulcerative_colitis', 'indeterminate')),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[], -- Array of tags
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Table for storing story likes
CREATE TABLE IF NOT EXISTS blog_story_likes (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (story_id) REFERENCES blog_stories(id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate likes
    UNIQUE(story_id, username)
);

-- Table for storing comments on stories
CREATE TABLE IF NOT EXISTS blog_comments (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL,
    username VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (story_id) REFERENCES blog_stories(id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Table for storing comment likes
CREATE TABLE IF NOT EXISTS blog_comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (comment_id) REFERENCES blog_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate likes
    UNIQUE(comment_id, username)
);

-- Table for storing story views/reads (for analytics)
CREATE TABLE IF NOT EXISTS blog_story_views (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL,
    username VARCHAR(255), -- Can be NULL for anonymous views
    ip_address VARCHAR(45), -- IPv6 compatible
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (story_id) REFERENCES blog_stories(id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE SET NULL
);

-- Table for storing story reports (for moderation)
CREATE TABLE IF NOT EXISTS blog_story_reports (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL,
    reporter_username VARCHAR(255) NOT NULL,
    reason VARCHAR(100) NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'harassment', 'medical_advice', 'other')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    
    -- Foreign keys
    FOREIGN KEY (story_id) REFERENCES blog_stories(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(username) ON DELETE SET NULL
);

-- Table for storing comment reports
CREATE TABLE IF NOT EXISTS blog_comment_reports (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL,
    reporter_username VARCHAR(255) NOT NULL,
    reason VARCHAR(100) NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'harassment', 'medical_advice', 'other')),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    
    -- Foreign keys
    FOREIGN KEY (comment_id) REFERENCES blog_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(username) ON DELETE SET NULL
);

-- Table for storing user story drafts
CREATE TABLE IF NOT EXISTS blog_story_drafts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    content TEXT,
    disease_type VARCHAR(50) CHECK (disease_type IN ('crohns', 'ulcerative_colitis', 'indeterminate')),
    tags TEXT[],
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Table for storing popular tags (for suggestions)
CREATE TABLE IF NOT EXISTS blog_popular_tags (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(100) NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Triggers to update comment count on stories
CREATE OR REPLACE FUNCTION update_story_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_stories 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.story_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog_stories 
        SET comments_count = comments_count - 1 
        WHERE id = OLD.story_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_story_comment_count
    AFTER INSERT OR DELETE ON blog_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_story_comment_count();

-- Triggers to update like count on stories
CREATE OR REPLACE FUNCTION update_story_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_stories 
        SET likes = likes + 1 
        WHERE id = NEW.story_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog_stories 
        SET likes = likes - 1 
        WHERE id = OLD.story_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_story_like_count
    AFTER INSERT OR DELETE ON blog_story_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_story_like_count();

-- Triggers to update like count on comments
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_comments 
        SET likes = likes + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog_comments 
        SET likes = likes - 1 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_like_count
    AFTER INSERT OR DELETE ON blog_comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_like_count();

-- Function to update popular tags
CREATE OR REPLACE FUNCTION update_popular_tags()
RETURNS TRIGGER AS $$
DECLARE
    tag_item TEXT;
BEGIN
    -- Update popular tags when a story is created or updated
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        FOREACH tag_item IN ARRAY NEW.tags
        LOOP
            INSERT INTO blog_popular_tags (tag, usage_count, last_used)
            VALUES (tag_item, 1, CURRENT_TIMESTAMP)
            ON CONFLICT (tag) 
            DO UPDATE SET 
                usage_count = blog_popular_tags.usage_count + 1,
                last_used = CURRENT_TIMESTAMP;
        END LOOP;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_popular_tags
    AFTER INSERT OR UPDATE ON blog_stories
    FOR EACH ROW
    EXECUTE FUNCTION update_popular_tags();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_stories_username ON blog_stories(username);
CREATE INDEX IF NOT EXISTS idx_blog_stories_disease_type ON blog_stories(disease_type);
CREATE INDEX IF NOT EXISTS idx_blog_stories_created_at ON blog_stories(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_stories_likes ON blog_stories(likes);
CREATE INDEX IF NOT EXISTS idx_blog_stories_published ON blog_stories(is_published);

CREATE INDEX IF NOT EXISTS idx_blog_story_likes_story_id ON blog_story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_blog_story_likes_username ON blog_story_likes(username);

CREATE INDEX IF NOT EXISTS idx_blog_comments_story_id ON blog_comments(story_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_username ON blog_comments(username);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON blog_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_blog_comment_likes_comment_id ON blog_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_blog_comment_likes_username ON blog_comment_likes(username);

CREATE INDEX IF NOT EXISTS idx_blog_story_views_story_id ON blog_story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_blog_story_views_username ON blog_story_views(username);
CREATE INDEX IF NOT EXISTS idx_blog_story_views_viewed_at ON blog_story_views(viewed_at);

CREATE INDEX IF NOT EXISTS idx_blog_story_reports_story_id ON blog_story_reports(story_id);
CREATE INDEX IF NOT EXISTS idx_blog_story_reports_status ON blog_story_reports(status);
CREATE INDEX IF NOT EXISTS idx_blog_story_reports_created_at ON blog_story_reports(created_at);

CREATE INDEX IF NOT EXISTS idx_blog_comment_reports_comment_id ON blog_comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_blog_comment_reports_status ON blog_comment_reports(status);
CREATE INDEX IF NOT EXISTS idx_blog_comment_reports_created_at ON blog_comment_reports(created_at);

CREATE INDEX IF NOT EXISTS idx_blog_story_drafts_username ON blog_story_drafts(username);
CREATE INDEX IF NOT EXISTS idx_blog_story_drafts_updated_at ON blog_story_drafts(updated_at);

CREATE INDEX IF NOT EXISTS idx_blog_popular_tags_usage_count ON blog_popular_tags(usage_count);
CREATE INDEX IF NOT EXISTS idx_blog_popular_tags_last_used ON blog_popular_tags(last_used);

-- Insert some sample popular tags
INSERT INTO blog_popular_tags (tag, usage_count) VALUES 
('remission', 50),
('diet', 45),
('support', 40),
('medication', 35),
('exercise', 30),
('stress', 25),
('college', 20),
('work', 18),
('family', 15),
('travel', 12)
ON CONFLICT (tag) DO NOTHING; 