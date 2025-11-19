-- Migration: Add phone_number column to users table if it doesn't exist
-- This migration ensures the phone_number column exists for SMS verification

DO $$ 
BEGIN
    -- Add phone_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'phone_number') THEN
        ALTER TABLE users ADD COLUMN phone_number TEXT;
        RAISE NOTICE 'Added phone_number column to users table';
    ELSE
        RAISE NOTICE 'phone_number column already exists in users table';
    END IF;
END $$;

-- Create index for faster phone number lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number) WHERE phone_number IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN users.phone_number IS 'User phone number in E.164 format for SMS verification';

