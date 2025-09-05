-- Enhanced Micronutrient Profile Tables for IBD Patients
-- This includes basic profile, lab results, and supplements tracking

-- Main micronutrient profiles table
CREATE TABLE IF NOT EXISTS micronutrient_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    height DECIMAL(10,2),
    gender VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Lab results table for tracking micronutrient test results
CREATE TABLE IF NOT EXISTS micronutrient_lab_results (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    nutrient VARCHAR(255) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    reference_range VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('normal', 'low', 'high', 'critical')),
    test_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES micronutrient_profiles(id) ON DELETE CASCADE
);

-- Supplements table for tracking micronutrient supplements
CREATE TABLE IF NOT EXISTS micronutrient_supplements (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('vitamin', 'mineral', 'trace_element', 'other')),
    dosage DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'twice_daily', 'weekly', 'monthly', 'as_needed')),
    start_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES micronutrient_profiles(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_micronutrient_profiles_user_id ON micronutrient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_micronutrient_lab_results_profile_id ON micronutrient_lab_results(profile_id);
CREATE INDEX IF NOT EXISTS idx_micronutrient_lab_results_nutrient ON micronutrient_lab_results(nutrient);
CREATE INDEX IF NOT EXISTS idx_micronutrient_lab_results_test_date ON micronutrient_lab_results(test_date);
CREATE INDEX IF NOT EXISTS idx_micronutrient_supplements_profile_id ON micronutrient_supplements(profile_id);
CREATE INDEX IF NOT EXISTS idx_micronutrient_supplements_category ON micronutrient_supplements(category);
CREATE INDEX IF NOT EXISTS idx_micronutrient_supplements_is_active ON micronutrient_supplements(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_micronutrient_profiles_updated_at 
    BEFORE UPDATE ON micronutrient_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_micronutrient_lab_results_updated_at 
    BEFORE UPDATE ON micronutrient_lab_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_micronutrient_supplements_updated_at 
    BEFORE UPDATE ON micronutrient_supplements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
