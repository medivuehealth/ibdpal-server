-- Create diagnosis table to store user diagnosis information
CREATE TABLE IF NOT EXISTS user_diagnosis (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    diagnosis VARCHAR(100) NOT NULL,
    diagnosis_year INTEGER,
    diagnosis_month VARCHAR(20),
    disease_location VARCHAR(100),
    disease_behavior VARCHAR(50),
    disease_severity VARCHAR(50),
    taking_medications VARCHAR(10),
    current_medications TEXT[], -- Array of medications
    medication_complications TEXT[], -- Array of complications
    is_anemic VARCHAR(10),
    anemia_severity VARCHAR(50),
    gi_specialist_frequency VARCHAR(50),
    last_gi_visit VARCHAR(50),
    family_history VARCHAR(10),
    surgery_history VARCHAR(10),
    hospitalizations VARCHAR(10),
    flare_frequency VARCHAR(50),
    current_symptoms TEXT[], -- Array of symptoms
    dietary_restrictions TEXT[], -- Array of restrictions
    comorbidities TEXT[], -- Array of comorbidities
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_diagnosis_username ON user_diagnosis(username);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_diagnosis_updated_at 
    BEFORE UPDATE ON user_diagnosis 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 