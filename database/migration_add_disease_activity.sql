-- Migration: Add Disease Activity Assessment Support
-- Adds columns to users table and creates disease_activity_history table

-- Add disease activity columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS disease_activity VARCHAR(20) DEFAULT 'remission',
ADD COLUMN IF NOT EXISTS last_assessment_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS assessment_confidence DECIMAL(3,2) DEFAULT 0.0;

-- Create disease activity history table
CREATE TABLE IF NOT EXISTS disease_activity_history (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    disease_activity VARCHAR(20) NOT NULL,
    assessment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    data_quality DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    source VARCHAR(50) NOT NULL DEFAULT 'ai_assessment',
    days_of_data INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_disease_activity_history_user_id 
ON disease_activity_history(user_id);

CREATE INDEX IF NOT EXISTS idx_disease_activity_history_date 
ON disease_activity_history(assessment_date);

CREATE INDEX IF NOT EXISTS idx_disease_activity_history_activity 
ON disease_activity_history(disease_activity);

-- Add constraints
ALTER TABLE disease_activity_history 
ADD CONSTRAINT chk_disease_activity_valid 
CHECK (disease_activity IN ('remission', 'mild', 'moderate', 'severe'));

ALTER TABLE disease_activity_history 
ADD CONSTRAINT chk_confidence_range 
CHECK (confidence >= 0.0 AND confidence <= 1.0);

ALTER TABLE disease_activity_history 
ADD CONSTRAINT chk_data_quality_range 
CHECK (data_quality >= 0.0 AND data_quality <= 1.0);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_disease_activity_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_disease_activity_history_updated_at
    BEFORE UPDATE ON disease_activity_history
    FOR EACH ROW
    EXECUTE FUNCTION update_disease_activity_history_updated_at();

-- Insert sample data for testing (optional)
-- INSERT INTO disease_activity_history (user_id, disease_activity, confidence, data_quality, source)
-- VALUES ('test_user', 'remission', 0.85, 0.90, 'ai_assessment');

COMMIT;
