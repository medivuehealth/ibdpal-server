-- Create IBD Support Organizations table
CREATE TABLE IF NOT EXISTS ibd_support_organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    website VARCHAR(255),
    email VARCHAR(255),
    description TEXT,
    services TEXT[],
    support_groups BOOLEAN DEFAULT false,
    educational_programs BOOLEAN DEFAULT false,
    advocacy BOOLEAN DEFAULT false,
    research_funding BOOLEAN DEFAULT false,
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert IBD Support Organizations data
INSERT INTO ibd_support_organizations (name, type, address, city, state, zip_code, latitude, longitude, phone, website, email, description, services, support_groups, educational_programs, advocacy, research_funding, rating) VALUES
-- Crohn's & Colitis Foundation Chapters
('Crohn''s & Colitis Foundation - Carolinas Chapter', 'support_organization', '4701 Hedgemore Dr, Suite 200', 'Charlotte', 'NC', '28209', 35.2271, -80.8431, '(704) 377-0440', 'https://www.crohnscolitisfoundation.org/chapters/carolinas', 'carolinas@crohnscolitisfoundation.org', 'Local chapter providing support, education, and advocacy for IBD patients and families', ARRAY['Support Groups', 'Educational Programs', 'Advocacy', 'Patient Resources'], true, true, true, true, 4.8),
('Crohn''s & Colitis Foundation - Greater Washington DC Chapter', 'support_organization', '4550 Montgomery Ave, Suite 700N', 'Bethesda', 'MD', '20814', 38.9847, -77.0947, '(301) 263-9000', 'https://www.crohnscolitisfoundation.org/chapters/greater-washington-dc', 'dc@crohnscolitisfoundation.org', 'Serving the DC metro area with IBD support and resources', ARRAY['Support Groups', 'Educational Programs', 'Advocacy', 'Patient Resources'], true, true, true, true, 4.7),
('Crohn''s & Colitis Foundation - New York Chapter', 'support_organization', '733 Third Ave, Suite 510', 'New York', 'NY', '10017', 40.7505, -73.9934, '(212) 685-3440', 'https://www.crohnscolitisfoundation.org/chapters/new-york', 'newyork@crohnscolitisfoundation.org', 'Largest chapter providing comprehensive IBD support services', ARRAY['Support Groups', 'Educational Programs', 'Advocacy', 'Patient Resources', 'Research Funding'], true, true, true, true, 4.9),
('Crohn''s & Colitis Foundation - California Chapter', 'support_organization', '1320 Willow Pass Rd, Suite 600', 'Concord', 'CA', '94520', 37.9735, -122.0311, '(925) 685-3440', 'https://www.crohnscolitisfoundation.org/chapters/california', 'california@crohnscolitisfoundation.org', 'Serving California with IBD support and education programs', ARRAY['Support Groups', 'Educational Programs', 'Advocacy', 'Patient Resources'], true, true, true, true, 4.6),
('Crohn''s & Colitis Foundation - Texas Chapter', 'support_organization', '13140 Coit Rd, Suite 400', 'Dallas', 'TX', '75240', 32.9267, -96.7789, '(972) 386-1440', 'https://www.crohnscolitisfoundation.org/chapters/texas', 'texas@crohnscolitisfoundation.org', 'Supporting Texans with IBD through education and advocacy', ARRAY['Support Groups', 'Educational Programs', 'Advocacy', 'Patient Resources'], true, true, true, true, 4.5),

-- Other IBD Support Organizations
('IBD Support Foundation', 'support_organization', '123 Main St', 'Raleigh', 'NC', '27601', 35.7796, -78.6382, '(919) 555-0123', 'https://www.ibdsupport.org', 'info@ibdsupport.org', 'Local IBD support organization providing resources and community', ARRAY['Support Groups', 'Educational Programs', 'Patient Resources'], true, true, false, false, 4.3),
('Pediatric IBD Network', 'support_organization', '456 Oak Ave', 'Durham', 'NC', '27701', 36.0016, -78.9382, '(919) 555-0456', 'https://www.pediatricibd.org', 'contact@pediatricibd.org', 'Specialized support for families with children affected by IBD', ARRAY['Pediatric Support', 'Family Resources', 'Educational Programs'], true, true, false, false, 4.4),
('IBD Warriors', 'support_organization', '789 Pine St', 'Chapel Hill', 'NC', '27514', 35.9042, -79.0469, '(919) 555-0789', 'https://www.ibdwarriors.org', 'hello@ibdwarriors.org', 'Peer support network for IBD patients and caregivers', ARRAY['Peer Support', 'Mentoring', 'Community Events'], true, false, false, false, 4.2);

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_ibd_support_organizations_location ON ibd_support_organizations (latitude, longitude); 