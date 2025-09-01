-- Nutrition Articles Table for IBDPal
-- Stores top IBD/IBS nutrition articles and diet references

CREATE TABLE IF NOT EXISTS nutrition_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT,
    category VARCHAR(100) NOT NULL CHECK (category IN ('nutrition', 'diet', 'fodmap', 'ibd', 'ibs', 'gut_health', 'crohns')),
    source VARCHAR(200) NOT NULL,
    source_url VARCHAR(500) NOT NULL,
    read_time_minutes INTEGER DEFAULT 5,
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    tags TEXT[],
    published_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_nutrition_articles_category ON nutrition_articles(category);
CREATE INDEX IF NOT EXISTS idx_nutrition_articles_public ON nutrition_articles(is_public);
CREATE INDEX IF NOT EXISTS idx_nutrition_articles_featured ON nutrition_articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_nutrition_articles_view_count ON nutrition_articles(view_count DESC);

-- Insert top 10 IBD/IBS nutrition articles
INSERT INTO nutrition_articles (title, excerpt, content, category, source, source_url, read_time_minutes, is_featured, tags) VALUES
(
    'Low FODMAP Diet for IBS: Complete Guide',
    'Learn how the low FODMAP diet can help manage IBS symptoms. This evidence-based approach eliminates fermentable carbohydrates that trigger digestive distress.',
    'The low FODMAP diet is a three-phase elimination diet that helps identify which foods trigger IBS symptoms. FODMAPs are fermentable oligosaccharides, disaccharides, monosaccharides, and polyols that can cause bloating, gas, and abdominal pain in sensitive individuals. Phase 1 involves eliminating all high-FODMAP foods for 2-6 weeks, followed by systematic reintroduction to identify triggers.',
    'fodmap',
    'Monash University FODMAP Research',
    'https://www.monashfodmap.com/',
    8,
    TRUE,
    ARRAY['FODMAP', 'IBS', 'diet', 'elimination', 'digestive health']
),
(
    'IBD Diet: What to Eat During Flares vs. Remission',
    'Discover the best foods to eat during IBD flares and remission periods. Learn which foods can soothe inflammation and which to avoid.',
    'During IBD flares, focus on easily digestible foods like white rice, bananas, applesauce, and toast (BRAT diet). Avoid high-fiber foods, dairy, spicy foods, and caffeine. During remission, gradually reintroduce fiber-rich foods, lean proteins, and healthy fats. Always work with your healthcare team to develop a personalized nutrition plan.',
    'ibd',
    'Crohn''s & Colitis Foundation',
    'https://www.crohnscolitisfoundation.org/diet-and-nutrition',
    7,
    TRUE,
    ARRAY['IBD', 'flare', 'remission', 'diet', 'inflammation']
),
(
    'Anti-Inflammatory Diet for Crohn''s Disease',
    'Explore an anti-inflammatory diet approach specifically designed for Crohn''s disease management and symptom relief.',
    'An anti-inflammatory diet for Crohn''s focuses on omega-3 fatty acids, antioxidants, and anti-inflammatory compounds. Include fatty fish, leafy greens, berries, turmeric, ginger, and olive oil. Avoid processed foods, refined sugars, and trans fats. This approach may help reduce inflammation and promote gut healing.',
    'crohns',
    'Harvard Health Publishing',
    'https://www.health.harvard.edu/staying-healthy/foods-that-fight-inflammation',
    6,
    TRUE,
    ARRAY['Crohn''s', 'anti-inflammatory', 'omega-3', 'antioxidants', 'gut healing']
),
(
    'Gut Health: Probiotics and Prebiotics for IBD',
    'Understand the role of probiotics and prebiotics in maintaining gut health and potentially improving IBD symptoms.',
    'Probiotics are beneficial bacteria that can help restore gut microbiome balance. Prebiotics are fiber compounds that feed these good bacteria. For IBD patients, specific strains like Bifidobacterium and Lactobacillus may be beneficial. However, timing and strain selection are crucial, especially during flares.',
    'gut_health',
    'American Gastroenterological Association',
    'https://gastro.org/practice-guidance/gi-patient-center/topic/probiotics',
    5,
    TRUE,
    ARRAY['probiotics', 'prebiotics', 'microbiome', 'gut health', 'IBD']
),
(
    'Elimination Diet for Food Sensitivities in IBD',
    'Learn how to identify food triggers through systematic elimination diets tailored for IBD patients.',
    'An elimination diet helps identify specific foods that worsen IBD symptoms. Start by removing common triggers like dairy, gluten, soy, eggs, and nuts for 2-4 weeks. Then reintroduce one food at a time, monitoring symptoms for 3-5 days. Keep a detailed food and symptom diary throughout the process.',
    'nutrition',
    'Cleveland Clinic',
    'https://my.clevelandclinic.org/health/treatments/21660-elimination-diet',
    9,
    TRUE,
    ARRAY['elimination diet', 'food sensitivities', 'IBD', 'food triggers', 'symptom management']
),
(
    'Mediterranean Diet Benefits for IBD Patients',
    'Discover how the Mediterranean diet can support IBD management through its anti-inflammatory properties and gut-friendly foods.',
    'The Mediterranean diet emphasizes fruits, vegetables, whole grains, legumes, nuts, olive oil, and fish while limiting red meat and processed foods. This approach provides anti-inflammatory omega-3s, antioxidants, and fiber that may benefit IBD patients. The diet is also associated with improved gut microbiome diversity.',
    'diet',
    'Mayo Clinic',
    'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/mediterranean-diet/art-20047801',
    6,
    TRUE,
    ARRAY['Mediterranean diet', 'anti-inflammatory', 'omega-3', 'gut microbiome', 'IBD']
),
(
    'High-Protein Diet for IBD Weight Management',
    'Learn how to maintain adequate protein intake during IBD flares and remission to support healing and prevent muscle loss.',
    'IBD patients often need increased protein intake to support tissue repair and prevent muscle wasting. Good protein sources include lean meats, fish, eggs, dairy alternatives, and plant-based proteins like tofu and legumes. Aim for 1.2-1.5g of protein per kg of body weight daily.',
    'nutrition',
    'Academy of Nutrition and Dietetics',
    'https://www.eatright.org/health/diseases-and-conditions/digestive-and-gastrointestinal-disorders/inflammatory-bowel-disease',
    5,
    TRUE,
    ARRAY['protein', 'weight management', 'muscle preservation', 'tissue repair', 'IBD']
),
(
    'Fiber Management in IBD: Soluble vs. Insoluble',
    'Understand the difference between soluble and insoluble fiber and how to safely incorporate fiber into your IBD diet.',
    'Soluble fiber dissolves in water and forms a gel, making it easier to digest. Good sources include oats, bananas, apples, and carrots. Insoluble fiber adds bulk and may irritate inflamed intestines. During flares, focus on soluble fiber and avoid insoluble fiber. Gradually increase fiber as symptoms improve.',
    'nutrition',
    'University of Chicago Medicine',
    'https://www.uchicagomedicine.org/forefront/gastroenterology-articles/fiber-and-inflammatory-bowel-disease',
    7,
    TRUE,
    ARRAY['fiber', 'soluble', 'insoluble', 'IBD', 'digestive health']
),
(
    'Vitamin D and IBD: Sunshine Vitamin for Gut Health',
    'Explore the connection between vitamin D deficiency and IBD, and learn how to safely increase your vitamin D levels.',
    'Vitamin D plays a crucial role in immune function and gut health. Many IBD patients are deficient due to malabsorption, limited sun exposure, or dietary restrictions. Safe sun exposure, fatty fish, egg yolks, and fortified foods can help. Consider supplementation under medical supervision.',
    'nutrition',
    'National Institutes of Health',
    'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/',
    5,
    TRUE,
    ARRAY['vitamin D', 'immune function', 'gut health', 'IBD', 'supplementation']
),
(
    'Hydration Strategies for IBD Patients',
    'Learn effective hydration strategies to manage IBD symptoms and prevent dehydration during flares.',
    'Proper hydration is crucial for IBD patients, especially during flares when fluid loss is increased. Drink water throughout the day, avoid caffeine and alcohol, and consider electrolyte replacement during severe symptoms. Monitor urine color and frequency to assess hydration status.',
    'nutrition',
    'International Foundation for Gastrointestinal Disorders',
    'https://iffgd.org/gi-disorders/irritable-bowel-syndrome-ibs/',
    4,
    TRUE,
    ARRAY['hydration', 'dehydration', 'electrolytes', 'IBD', 'flare management']
);

-- Create a view for featured articles
CREATE OR REPLACE VIEW featured_nutrition_articles AS
SELECT * FROM nutrition_articles 
WHERE is_featured = TRUE AND is_public = TRUE 
ORDER BY view_count DESC, published_date DESC;

-- Create a function to increment view count
CREATE OR REPLACE FUNCTION increment_article_view_count(article_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE nutrition_articles 
    SET view_count = view_count + 1, 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;
