-- Migration: Add feedback table for user feedback and ratings
-- Date: 2024-12-19

-- Create feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    nutrition_features_rating INTEGER NOT NULL CHECK (nutrition_features_rating >= 1 AND nutrition_features_rating <= 5),
    nutrition_helpful_managing_symptoms BOOLEAN NOT NULL,
    nutrition_helpful_managing_symptoms_notes TEXT,
    flareup_monitoring_helpful BOOLEAN NOT NULL,
    flareup_monitoring_helpful_notes TEXT,
    app_recommendations TEXT,
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    overall_rating_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_updated_at
    BEFORE UPDATE ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_updated_at();

-- Insert sample data for testing (optional)
-- INSERT INTO user_feedback (
--     user_id,
--     nutrition_features_rating,
--     nutrition_helpful_managing_symptoms,
--     nutrition_helpful_managing_symptoms_notes,
--     flareup_monitoring_helpful,
--     flareup_monitoring_helpful_notes,
--     app_recommendations,
--     overall_rating,
--     overall_rating_notes
-- ) VALUES (
--     'c5478c39-3cd3-4f4e-b65d-601fda614b9f',
--     4,
--     true,
--     'The nutrition tracking helped me identify trigger foods',
--     true,
--     'Monitoring symptoms helped me catch flares early',
--     'Would love to see more food options in the database',
--     4,
--     'Great app overall, very helpful for managing my IBD'
-- ); 