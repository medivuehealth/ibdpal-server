-- Migration to update stress and mood level constraints to 1-5 scale
-- This ensures the database constraints match the new frontend scale

-- Drop existing constraints if they exist
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS check_stress_level;
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS check_mood_level;

-- Add new constraints for 1-5 scale
ALTER TABLE journal_entries 
ADD CONSTRAINT check_stress_level CHECK (stress_level >= 1 AND stress_level <= 5);

ALTER TABLE journal_entries 
ADD CONSTRAINT check_mood_level CHECK (mood_level >= 1 AND mood_level <= 5);

-- Update any existing values that are outside the 1-5 range
-- Map old 1-10 scale to new 1-5 scale
UPDATE journal_entries 
SET stress_level = CASE 
    WHEN stress_level <= 2 THEN 1
    WHEN stress_level <= 4 THEN 2
    WHEN stress_level <= 6 THEN 3
    WHEN stress_level <= 8 THEN 4
    ELSE 5
END
WHERE stress_level > 5;

UPDATE journal_entries 
SET mood_level = CASE 
    WHEN mood_level <= 2 THEN 1
    WHEN mood_level <= 4 THEN 2
    WHEN mood_level <= 6 THEN 3
    WHEN mood_level <= 8 THEN 4
    ELSE 5
END
WHERE mood_level > 5;

-- Set default values for any null values
UPDATE journal_entries 
SET stress_level = 3 
WHERE stress_level IS NULL;

UPDATE journal_entries 
SET mood_level = 3 
WHERE mood_level IS NULL; 