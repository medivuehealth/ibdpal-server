-- Migration to add comprehensive stress, sleep, and hydration fields
-- Run this migration to enhance the journal_entries table

-- Add stress-related fields
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS stress_source TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS coping_strategies TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS mood_level INTEGER DEFAULT 5;

-- Add sleep-related fields  
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS sleep_quality INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS sleep_notes TEXT DEFAULT '';

-- Add hydration-related fields
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS water_intake NUMERIC(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_fluids NUMERIC(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fluid_type TEXT DEFAULT 'Water';

-- Update existing records to have default values
UPDATE journal_entries 
SET 
    stress_source = COALESCE(stress_source, ''),
    coping_strategies = COALESCE(coping_strategies, ''),
    mood_level = COALESCE(mood_level, 5),
    sleep_quality = COALESCE(sleep_quality, 5),
    sleep_notes = COALESCE(sleep_notes, ''),
    water_intake = COALESCE(water_intake, 0),
    other_fluids = COALESCE(other_fluids, 0),
    fluid_type = COALESCE(fluid_type, 'Water')
WHERE 
    stress_source IS NULL 
    OR coping_strategies IS NULL 
    OR mood_level IS NULL 
    OR sleep_quality IS NULL 
    OR sleep_notes IS NULL 
    OR water_intake IS NULL 
    OR other_fluids IS NULL 
    OR fluid_type IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_stress ON journal_entries(stress_level, mood_level);
CREATE INDEX IF NOT EXISTS idx_journal_entries_sleep ON journal_entries(sleep_hours, sleep_quality);
CREATE INDEX IF NOT EXISTS idx_journal_entries_hydration ON journal_entries(water_intake, other_fluids, hydration_level); 