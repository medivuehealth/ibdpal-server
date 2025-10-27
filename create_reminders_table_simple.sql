-- Drop table if exists (for development)
DROP TABLE IF EXISTS reminders CASCADE;

-- Create reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    time TIME NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    repeat_days JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_type ON reminders(type);
CREATE INDEX idx_reminders_enabled ON reminders(is_enabled);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reminders_updated_at 
    BEFORE UPDATE ON reminders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
