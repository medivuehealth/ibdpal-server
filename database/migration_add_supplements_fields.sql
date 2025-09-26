-- Migration to add supplements fields to journal_entries table
-- Run this migration to support daily supplement tracking

-- Add supplements-related fields
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS supplements_taken BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS supplements_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS supplement_details JSONB DEFAULT '[]'::jsonb;

-- Update existing records to have default values
UPDATE journal_entries 
SET 
    supplements_taken = COALESCE(supplements_taken, FALSE),
    supplements_count = COALESCE(supplements_count, 0),
    supplement_details = COALESCE(supplement_details, '[]'::jsonb)
WHERE 
    supplements_taken IS NULL 
    OR supplements_count IS NULL 
    OR supplement_details IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_supplements ON journal_entries(supplements_taken, supplements_count);

-- Add comment to document the supplement_details JSONB structure
COMMENT ON COLUMN journal_entries.supplement_details IS 'JSONB array of supplement intake details with structure: [{"supplement_id": "uuid", "supplement_name": "string", "category": "string", "dosage": "string", "unit": "string", "time_taken": "HH:mm", "notes": "string"}]';
