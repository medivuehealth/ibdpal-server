-- Migration to change last_gi_visit from VARCHAR to DATE
-- This will allow proper date storage and validation

-- First, add a new DATE column
ALTER TABLE user_diagnosis ADD COLUMN last_gi_visit_date DATE;

-- Update the new column with converted data from the old column
-- Convert frequency strings to reasonable dates
UPDATE user_diagnosis 
SET last_gi_visit_date = 
    CASE 
        WHEN last_gi_visit = 'Every 3 months' THEN CURRENT_DATE - INTERVAL '3 months'
        WHEN last_gi_visit = 'Every 6 months' THEN CURRENT_DATE - INTERVAL '6 months'
        WHEN last_gi_visit = 'Once a year' THEN CURRENT_DATE - INTERVAL '1 year'
        WHEN last_gi_visit = 'As needed' THEN CURRENT_DATE - INTERVAL '6 months'
        WHEN last_gi_visit = 'Never' THEN NULL
        ELSE CURRENT_DATE - INTERVAL '6 months' -- Default fallback
    END
WHERE last_gi_visit IS NOT NULL;

-- Drop the old column
ALTER TABLE user_diagnosis DROP COLUMN last_gi_visit;

-- Rename the new column to the original name
ALTER TABLE user_diagnosis RENAME COLUMN last_gi_visit_date TO last_gi_visit; 