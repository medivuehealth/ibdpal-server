-- Simple Migration: Add Email Verification Fields to Users Table
-- This migration adds fields needed for email verification functionality

-- Add email verification fields to users table
DO $$ 
BEGIN
    -- Add email_verified column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add verification_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verification_code') THEN
        ALTER TABLE users ADD COLUMN verification_code VARCHAR(6);
    END IF;
    
    -- Add verification_code_expires column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verification_code_expires') THEN
        ALTER TABLE users ADD COLUMN verification_code_expires TIMESTAMP;
    END IF;
    
    -- Add verification_attempts column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verification_attempts') THEN
        ALTER TABLE users ADD COLUMN verification_attempts INTEGER DEFAULT 0;
    END IF;
    
    -- Add last_verification_attempt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_verification_attempt') THEN
        ALTER TABLE users ADD COLUMN last_verification_attempt TIMESTAMP;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_verification_code ON users(verification_code) WHERE verification_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Update existing users to have verified email (for backward compatibility)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL; 