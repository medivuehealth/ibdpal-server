const db = require('./database/db');

async function setupNutritionArticles() {
  try {
    console.log('Setting up nutrition articles table...');
    
    // Create table
    await db.query(`
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
      )
    `);
    console.log('Table created');
    
    // Create indexes
    await db.query('CREATE INDEX IF NOT EXISTS idx_nutrition_articles_category ON nutrition_articles(category)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_nutrition_articles_public ON nutrition_articles(is_public)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_nutrition_articles_featured ON nutrition_articles(is_featured)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_nutrition_articles_view_count ON nutrition_articles(view_count DESC)');
    console.log('Indexes created');
    
    // Insert articles
    const articles = [
      {
        title: 'Low FODMAP Diet for IBS: Complete Guide',
        excerpt: 'Learn how the low FODMAP diet can help manage IBS symptoms. This evidence-based approach eliminates fermentable carbohydrates that trigger digestive distress.',
        content: 'The low FODMAP diet is a three-phase elimination diet that helps identify which foods trigger IBS symptoms.',
        category: 'fodmap',
        source: 'Monash University FODMAP Research',
        source_url: 'https://www.monashfodmap.com/',
        read_time_minutes: 8,
        is_featured: true,
        tags: ['FODMAP', 'IBS', 'diet', 'elimination', 'digestive health']
      },
      {
        title: 'IBD Diet: What to Eat During Flares vs. Remission',
        excerpt: 'Discover the best foods to eat during IBD flares and remission periods. Learn which foods can soothe inflammation and which to avoid.',
        content: 'During IBD flares, focus on easily digestible foods like white rice, bananas, applesauce, and toast (BRAT diet).',
        category: 'ibd',
        source: 'Crohn\'s & Colitis Foundation',
        source_url: 'https://www.crohnscolitisfoundation.org/diet-and-nutrition',
        read_time_minutes: 7,
        is_featured: true,
        tags: ['IBD', 'flare', 'remission', 'diet', 'inflammation']
      },
      {
        title: 'Anti-Inflammatory Diet for Crohn\'s Disease',
        excerpt: 'Explore an anti-inflammatory diet approach specifically designed for Crohn\'s disease management and symptom relief.',
        content: 'An anti-inflammatory diet for Crohn\'s focuses on omega-3 fatty acids, antioxidants, and anti-inflammatory compounds.',
        category: 'crohns',
        source: 'Harvard Health Publishing',
        source_url: 'https://www.health.harvard.edu/staying-healthy/foods-that-fight-inflammation',
        read_time_minutes: 6,
        is_featured: true,
        tags: ['Crohn\'s', 'anti-inflammatory', 'omega-3', 'antioxidants', 'gut healing']
      },
      {
        title: 'Gut Health: Probiotics and Prebiotics for IBD',
        excerpt: 'Understand the role of probiotics and prebiotics in maintaining gut health and potentially improving IBD symptoms.',
        content: 'Probiotics are beneficial bacteria that can help restore gut microbiome balance.',
        category: 'gut_health',
        source: 'American Gastroenterological Association',
        source_url: 'https://gastro.org/practice-guidance/gi-patient-center/topic/probiotics',
        read_time_minutes: 5,
        is_featured: true,
        tags: ['probiotics', 'prebiotics', 'microbiome', 'gut health', 'IBD']
      },
      {
        title: 'Elimination Diet for Food Sensitivities in IBD',
        excerpt: 'Learn how to identify food triggers through systematic elimination diets tailored for IBD patients.',
        content: 'An elimination diet helps identify specific foods that worsen IBD symptoms.',
        category: 'nutrition',
        source: 'Cleveland Clinic',
        source_url: 'https://my.clevelandclinic.org/health/treatments/21660-elimination-diet',
        read_time_minutes: 9,
        is_featured: true,
        tags: ['elimination diet', 'food sensitivities', 'IBD', 'food triggers', 'symptom management']
      }
    ];
    
    for (const article of articles) {
      await db.query(`
        INSERT INTO nutrition_articles (title, excerpt, content, category, source, source_url, read_time_minutes, is_featured, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        article.title, article.excerpt, article.content, article.category, 
        article.source, article.source_url, article.read_time_minutes, 
        article.is_featured, article.tags
      ]);
    }
    console.log('Articles inserted');
    
    // Verify the articles were created
    const result = await db.query('SELECT id, title, category, source FROM nutrition_articles ORDER BY id');
    console.log('\nCreated nutrition articles:');
    console.log(result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up nutrition articles:', error);
    process.exit(1);
  }
}

setupNutritionArticles();
