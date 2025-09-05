-- Update existing micronutrient_supplements table to add missing columns
ALTER TABLE micronutrient_supplements 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create micronutrient_lab_results table if it doesn't exist
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

-- Create indexes for lab results
CREATE INDEX IF NOT EXISTS idx_micronutrient_lab_results_profile_id ON micronutrient_lab_results(profile_id);
CREATE INDEX IF NOT EXISTS idx_micronutrient_lab_results_nutrient ON micronutrient_lab_results(nutrient);
CREATE INDEX IF NOT EXISTS idx_micronutrient_lab_results_test_date ON micronutrient_lab_results(test_date);

-- Create updated_at trigger for lab results
CREATE TRIGGER update_micronutrient_lab_results_updated_at 
    BEFORE UPDATE ON micronutrient_lab_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
