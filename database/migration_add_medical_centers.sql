-- Migration: Add medical centers and IBD specialists tables
-- Date: 2024-01-01

-- Create medical_centers table
CREATE TABLE IF NOT EXISTS medical_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'hospital', 'clinic', 'medical_center', 'specialty_center'
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(255),
    email VARCHAR(255),
    description TEXT,
    specialties TEXT[], -- Array of medical specialties
    ibd_services BOOLEAN DEFAULT false,
    emergency_services BOOLEAN DEFAULT false,
    insurance_accepted TEXT[], -- Array of accepted insurance providers
    hours_of_operation JSONB, -- Store hours as JSON
    rating DECIMAL(3, 2), -- Average rating (1.00 to 5.00)
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create ibd_specialists table
CREATE TABLE IF NOT EXISTS ibd_specialists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(100) NOT NULL, -- 'Dr.', 'MD', 'DO', etc.
    specialty VARCHAR(100) NOT NULL, -- 'Gastroenterologist', 'Colorectal Surgeon', etc.
    medical_center_id INTEGER REFERENCES medical_centers(id) ON DELETE SET NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    education TEXT[], -- Array of degrees and institutions
    certifications TEXT[], -- Array of board certifications
    languages TEXT[], -- Array of spoken languages
    insurance_accepted TEXT[],
    consultation_fee DECIMAL(10, 2),
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    years_experience INTEGER,
    ibd_focus_areas TEXT[], -- Array of IBD focus areas
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_centers_location ON medical_centers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_medical_centers_city_state ON medical_centers(city, state);
CREATE INDEX IF NOT EXISTS idx_medical_centers_ibd_services ON medical_centers(ibd_services);
CREATE INDEX IF NOT EXISTS idx_ibd_specialists_location ON ibd_specialists(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_ibd_specialists_medical_center ON ibd_specialists(medical_center_id);

-- Insert sample medical centers data
INSERT INTO medical_centers (name, type, address, city, state, zip_code, latitude, longitude, phone, website, description, specialties, ibd_services, emergency_services, insurance_accepted, hours_of_operation, rating) VALUES
('Mayo Clinic - Rochester', 'hospital', '200 First St SW', 'Rochester', 'MN', '55905', 44.0225, -92.4668, '(507) 284-2511', 'https://www.mayoclinic.org', 'World-renowned medical center specializing in complex cases', ARRAY['Gastroenterology', 'IBD', 'Colorectal Surgery'], true, true, ARRAY['Medicare', 'Medicaid', 'Blue Cross', 'Aetna'], '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}', 4.8),
('Cleveland Clinic', 'hospital', '9500 Euclid Ave', 'Cleveland', 'OH', '44195', 41.5048, -81.6067, '(216) 444-2200', 'https://my.clevelandclinic.org', 'Leading medical center with specialized IBD treatment programs', ARRAY['Gastroenterology', 'IBD', 'Inflammatory Bowel Disease'], true, true, ARRAY['Medicare', 'Medicaid', 'Blue Cross', 'UnitedHealth'], '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}', 4.7),
('Mount Sinai Hospital', 'hospital', '1 Gustave L Levy Pl', 'New York', 'NY', '10029', 40.7903, -73.9557, '(212) 241-6500', 'https://www.mountsinai.org', 'Academic medical center with comprehensive IBD care', ARRAY['Gastroenterology', 'IBD', 'Research'], true, true, ARRAY['Medicare', 'Medicaid', 'Blue Cross', 'Aetna'], '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}', 4.6),
('UCLA Medical Center', 'hospital', '757 Westwood Plaza', 'Los Angeles', 'CA', '90095', 34.0668, -118.4451, '(310) 825-9111', 'https://www.uclahealth.org', 'University medical center with advanced IBD treatment options', ARRAY['Gastroenterology', 'IBD', 'Clinical Trials'], true, true, ARRAY['Medicare', 'Medicaid', 'Blue Cross', 'Kaiser'], '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}', 4.5),
('Johns Hopkins Hospital', 'hospital', '1800 Orleans St', 'Baltimore', 'MD', '21287', 39.2976, -76.5928, '(410) 955-5000', 'https://www.hopkinsmedicine.org', 'Pioneering medical research and treatment for IBD', ARRAY['Gastroenterology', 'IBD', 'Research', 'Clinical Trials'], true, true, ARRAY['Medicare', 'Medicaid', 'Blue Cross', 'Aetna'], '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}', 4.7)
ON CONFLICT DO NOTHING;

-- Insert sample IBD specialists data
INSERT INTO ibd_specialists (name, title, specialty, medical_center_id, address, city, state, zip_code, latitude, longitude, phone, email, education, certifications, languages, insurance_accepted, consultation_fee, rating, years_experience, ibd_focus_areas) VALUES
('Dr. William Sandborn', 'MD', 'Gastroenterologist', 1, '200 First St SW', 'Rochester', 'MN', '55905', 44.0225, -92.4668, '(507) 284-2511', 'sandborn.william@mayo.edu', ARRAY['MD - Stanford University', 'Fellowship - Mayo Clinic'], ARRAY['Board Certified - Gastroenterology'], ARRAY['English', 'Spanish'], ARRAY['Medicare', 'Blue Cross'], 350.00, 4.9, 25, ARRAY['Crohn''s Disease', 'Ulcerative Colitis', 'Clinical Trials']),
('Dr. Bruce Sands', 'MD', 'Gastroenterologist', 2, '9500 Euclid Ave', 'Cleveland', 'OH', '44195', 41.5048, -81.6067, '(216) 444-2200', 'sands.bruce@ccf.org', ARRAY['MD - Harvard Medical School', 'Fellowship - Cleveland Clinic'], ARRAY['Board Certified - Gastroenterology'], ARRAY['English'], ARRAY['Medicare', 'Blue Cross', 'UnitedHealth'], 325.00, 4.8, 20, ARRAY['IBD Treatment', 'Biologic Therapy', 'Surgery Consultation']),
('Dr. Jean-Frederic Colombel', 'MD', 'Gastroenterologist', 3, '1 Gustave L Levy Pl', 'New York', 'NY', '10029', 40.7903, -73.9557, '(212) 241-6500', 'colombel.jf@mountsinai.org', ARRAY['MD - University of Paris', 'Fellowship - Mount Sinai'], ARRAY['Board Certified - Gastroenterology'], ARRAY['English', 'French'], ARRAY['Medicare', 'Blue Cross', 'Aetna'], 400.00, 4.7, 30, ARRAY['IBD Research', 'Clinical Trials', 'International Care']),
('Dr. Stephan Targan', 'MD', 'Gastroenterologist', 4, '757 Westwood Plaza', 'Los Angeles', 'CA', '90095', 34.0668, -118.4451, '(310) 825-9111', 'targan.stephan@ucla.edu', ARRAY['MD - UCLA', 'Fellowship - UCLA'], ARRAY['Board Certified - Gastroenterology'], ARRAY['English'], ARRAY['Medicare', 'Blue Cross', 'Kaiser'], 375.00, 4.6, 28, ARRAY['IBD Genetics', 'Personalized Medicine', 'Research']),
('Dr. Florian Rieder', 'MD', 'Gastroenterologist', 5, '1800 Orleans St', 'Baltimore', 'MD', '21287', 39.2976, -76.5928, '(410) 955-5000', 'rieder.florian@jhmi.edu', ARRAY['MD - University of Munich', 'Fellowship - Johns Hopkins'], ARRAY['Board Certified - Gastroenterology'], ARRAY['English', 'German'], ARRAY['Medicare', 'Blue Cross', 'Aetna'], 350.00, 4.8, 22, ARRAY['IBD Complications', 'Fibrosis Research', 'Clinical Trials'])
ON CONFLICT DO NOTHING; 