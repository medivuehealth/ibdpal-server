-- Remove the foreign key constraint
ALTER TABLE micronutrient_profiles DROP CONSTRAINT IF EXISTS micronutrient_profiles_user_id_fkey;

-- Update existing data to use email instead of UUID
UPDATE micronutrient_profiles 
SET user_id = u.username 
FROM users u 
WHERE micronutrient_profiles.user_id = u.user_id;

-- Add a comment to document the change
COMMENT ON COLUMN micronutrient_profiles.user_id IS 'User email address for ML model compatibility';
