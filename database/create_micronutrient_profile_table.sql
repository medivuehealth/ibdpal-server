-- Create micronutrient profile table for personalized nutrition recommendations
CREATE TABLE IF NOT EXISTS micronutrient_profiles (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0 AND weight < 1000), -- in kg
    height DECIMAL(5,2) CHECK (height > 0 AND height < 300), -- in cm, optional
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')), -- optional
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one profile per user
    UNIQUE(user_id)
);

-- Create micronutrient supplements table
CREATE TABLE IF NOT EXISTS micronutrient_supplements (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL REFERENCES micronutrient_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Vitamins', 'Minerals', 'Probiotics', 'Omega-3', 'Antioxidants', 'Other')),
    dosage VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('mg', 'mcg', 'g', 'ml', 'IU', 'capsules', 'tablets', 'drops', 'tsp', 'tbsp')),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('Daily', 'Twice Daily', 'Weekly', 'As Needed', 'Other')),
    start_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_micronutrient_profiles_user_id ON micronutrient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_micronutrient_supplements_profile_id ON micronutrient_supplements(profile_id);
CREATE INDEX IF NOT EXISTS idx_micronutrient_supplements_category ON micronutrient_supplements(category);

-- Create trigger to update updated_at timestamp for profiles
CREATE OR REPLACE FUNCTION update_micronutrient_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_micronutrient_profiles_updated_at 
    BEFORE UPDATE ON micronutrient_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_micronutrient_profile_updated_at();

-- Create trigger to update updated_at timestamp for supplements
CREATE OR REPLACE FUNCTION update_micronutrient_supplement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_micronutrient_supplements_updated_at 
    BEFORE UPDATE ON micronutrient_supplements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_micronutrient_supplement_updated_at();

-- Add comments for documentation
COMMENT ON TABLE micronutrient_profiles IS 'User biometric and demographic data for personalized nutrition recommendations';
COMMENT ON TABLE micronutrient_supplements IS 'Individual micronutrient supplements and dosages for each user profile';

COMMENT ON COLUMN micronutrient_profiles.age IS 'User age in years (required for nutrition calculations)';
COMMENT ON COLUMN micronutrient_profiles.weight IS 'User weight in kilograms (required for nutrition calculations)';
COMMENT ON COLUMN micronutrient_profiles.height IS 'User height in centimeters (optional, for BMI calculations)';
COMMENT ON COLUMN micronutrient_profiles.gender IS 'User gender (optional, for personalized recommendations)';

COMMENT ON COLUMN micronutrient_supplements.name IS 'Name of the supplement (e.g., Vitamin D3, Iron, Probiotics)';
COMMENT ON COLUMN micronutrient_supplements.category IS 'Category of supplement for organization and analysis';
COMMENT ON COLUMN micronutrient_supplements.dosage IS 'Amount of supplement taken';
COMMENT ON COLUMN micronutrient_supplements.unit IS 'Unit of measurement for dosage';
COMMENT ON COLUMN micronutrient_supplements.frequency IS 'How often the supplement is taken';
COMMENT ON COLUMN micronutrient_supplements.start_date IS 'When the user started taking this supplement';
COMMENT ON COLUMN micronutrient_supplements.notes IS 'Additional notes about the supplement';
