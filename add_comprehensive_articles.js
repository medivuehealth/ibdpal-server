const { Pool } = require('pg');

// Database connection - will use Railway DATABASE_URL from environment
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/ibdpal'
});

const medicationArticles = [
    {
        title: "Biologics for IBD: Understanding Treatment Options",
        excerpt: "Learn about biologic medications used to treat inflammatory bowel disease, including how they work and what to expect.",
        content: "Biologic medications are a class of drugs that target specific proteins in the immune system to reduce inflammation. For IBD patients, biologics like infliximab, adalimumab, and vedolizumab can help achieve and maintain remission. These medications are typically administered by injection or infusion and work by blocking inflammatory pathways. Common side effects include injection site reactions, increased risk of infections, and potential allergic reactions. Regular monitoring is essential to ensure safety and effectiveness.",
        category: "ibd", // Use existing category
        source: "American Gastroenterological Association",
        source_url: "https://gastro.org/practice-guidance/gi-patient-center/topic/inflammatory-bowel-disease",
        read_time_minutes: 8,
        tags: ["biologics", "IBD", "treatment", "inflammation", "remission"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Corticosteroids in IBD Management: Short-term vs Long-term Use",
        excerpt: "Understanding when and how corticosteroids are used in IBD treatment, including risks and benefits.",
        content: "Corticosteroids like prednisone are powerful anti-inflammatory medications used to quickly reduce IBD symptoms during flares. They work by suppressing the immune system's inflammatory response. While effective for short-term use, long-term corticosteroid use can lead to serious side effects including bone loss, diabetes, cataracts, and increased infection risk. Doctors typically prescribe corticosteroids for 2-8 weeks to control acute symptoms, then taper the dose while transitioning to maintenance medications.",
        category: "ibd", // Use existing category
        source: "Crohn's & Colitis Foundation",
        source_url: "https://www.crohnscolitisfoundation.org/what-is-ibd/medication",
        read_time_minutes: 6,
        tags: ["corticosteroids", "prednisone", "flare", "side effects", "tapering"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Immunomodulators: Long-term IBD Treatment Options",
        excerpt: "Explore immunomodulator medications that help maintain remission and reduce inflammation in IBD.",
        content: "Immunomodulators like azathioprine, 6-mercaptopurine, and methotrexate work by modifying the immune system to reduce inflammation. These medications are typically used for long-term maintenance therapy to prevent flares and maintain remission. They take 2-3 months to become fully effective, so they're often started while tapering off corticosteroids. Regular blood monitoring is required to check for potential side effects including liver problems and low blood cell counts.",
        category: "ibd", // Use existing category
        source: "Mayo Clinic",
        source_url: "https://www.mayoclinic.org/diseases-conditions/inflammatory-bowel-disease/diagnosis-treatment/drc-20353320",
        read_time_minutes: 7,
        tags: ["immunomodulators", "azathioprine", "maintenance", "remission", "monitoring"],
        is_public: true,
        is_featured: true
    },
    {
        title: "JAK Inhibitors: New Treatment Options for IBD",
        excerpt: "Discover the latest JAK inhibitor medications and their role in treating moderate to severe IBD.",
        content: "JAK inhibitors like tofacitinib and upadacitinib are newer oral medications that block specific enzymes involved in inflammation. They offer an alternative to biologic medications and can be effective for patients who haven't responded to other treatments. JAK inhibitors work quickly, often showing benefits within 2-4 weeks. However, they carry risks including increased risk of blood clots, infections, and certain cancers. Regular monitoring is essential.",
        category: "ibd", // Use existing category
        source: "Harvard Health Publishing",
        source_url: "https://www.health.harvard.edu/diseases-and-conditions/inflammatory-bowel-disease",
        read_time_minutes: 5,
        tags: ["JAK inhibitors", "tofacitinib", "oral medication", "new treatment", "monitoring"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication Adherence: Tips for IBD Treatment Success",
        excerpt: "Learn strategies to maintain medication adherence and maximize treatment effectiveness for IBD.",
        content: "Medication adherence is crucial for successful IBD treatment. Missing doses can lead to flare-ups and reduced medication effectiveness. Strategies for better adherence include setting reminders, using pill organizers, understanding your medication schedule, and communicating openly with your healthcare team about any concerns or side effects. It's also important to understand why each medication is prescribed and how it helps your condition.",
        category: "ibd", // Use existing category
        source: "Cleveland Clinic",
        source_url: "https://my.clevelandclinic.org/health/diseases/15587-inflammatory-bowel-disease-overview",
        read_time_minutes: 4,
        tags: ["adherence", "compliance", "reminders", "communication", "effectiveness"],
        is_public: true,
        is_featured: true
    }
];

const lifestyleArticles = [
    {
        title: "Stress Management Techniques for IBD Patients",
        excerpt: "Discover effective stress management strategies that can help reduce IBD symptoms and improve quality of life.",
        content: "Stress can significantly impact IBD symptoms and may trigger flares. Effective stress management techniques include mindfulness meditation, deep breathing exercises, progressive muscle relaxation, and regular physical activity. Cognitive behavioral therapy (CBT) can help develop coping strategies for managing stress and anxiety related to IBD. It's important to identify personal stress triggers and develop a personalized stress management plan with your healthcare team.",
        category: "gut_health", // Use existing category
        source: "American Psychological Association",
        source_url: "https://www.apa.org/topics/stress",
        read_time_minutes: 7,
        tags: ["stress", "meditation", "CBT", "coping", "flare prevention"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Exercise and IBD: Safe Physical Activity Guidelines",
        excerpt: "Learn how to safely incorporate exercise into your routine while managing IBD symptoms and energy levels.",
        content: "Regular exercise can improve overall health, reduce stress, and help maintain a healthy weight for IBD patients. Low-impact activities like walking, swimming, yoga, and gentle cycling are generally well-tolerated. During flares, focus on gentle stretching and light activities. Listen to your body and adjust intensity based on symptoms. Always consult your healthcare team before starting a new exercise program, especially if you have complications like strictures or fistulas.",
        category: "gut_health", // Use existing category
        source: "American College of Sports Medicine",
        source_url: "https://www.acsm.org/read-research/resource-library",
        read_time_minutes: 6,
        tags: ["exercise", "physical activity", "low-impact", "flare management", "energy"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Sleep Hygiene for IBD: Improving Rest and Recovery",
        excerpt: "Understand the importance of quality sleep for IBD management and learn strategies to improve sleep hygiene.",
        content: "Quality sleep is essential for immune function and overall health, especially for IBD patients. Poor sleep can worsen symptoms and increase inflammation. Good sleep hygiene practices include maintaining a consistent sleep schedule, creating a relaxing bedtime routine, keeping the bedroom cool and dark, avoiding screens before bed, and limiting caffeine and alcohol. If IBD symptoms interfere with sleep, discuss this with your healthcare team as it may indicate the need for treatment adjustments.",
        category: "gut_health", // Use existing category
        source: "National Sleep Foundation",
        source_url: "https://www.sleepfoundation.org/sleep-hygiene",
        read_time_minutes: 5,
        tags: ["sleep", "hygiene", "immune function", "inflammation", "bedtime routine"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Social Support and IBD: Building Your Support Network",
        excerpt: "Learn how to build and maintain a strong support network to help manage the emotional challenges of IBD.",
        content: "Living with IBD can be emotionally challenging, and having a strong support network is crucial. This includes family, friends, healthcare providers, and support groups. Open communication about your condition helps others understand your needs. Consider joining IBD support groups, either in-person or online, to connect with others who understand your experience. Professional counseling can also help develop coping strategies for the emotional aspects of chronic illness.",
        category: "gut_health", // Use existing category
        source: "Mental Health America",
        source_url: "https://www.mhanational.org/conditions/chronic-illness-and-mental-health",
        read_time_minutes: 6,
        tags: ["support network", "communication", "support groups", "counseling", "emotional health"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Travel Tips for IBD Patients: Planning and Preparation",
        excerpt: "Essential tips for traveling safely and comfortably with IBD, including medication management and emergency planning.",
        content: "Traveling with IBD requires careful planning but doesn't have to be limiting. Key considerations include packing medications in carry-on luggage with prescriptions, researching healthcare facilities at your destination, planning bathroom locations along your route, and bringing emergency supplies. Consider travel insurance that covers pre-existing conditions. Communicate with your healthcare team about travel plans, especially for international travel that may require additional vaccinations or medications.",
        category: "gut_health", // Use existing category
        source: "International Foundation for Gastrointestinal Disorders",
        source_url: "https://iffgd.org/living-with-digestive-disorders/travel-tips",
        read_time_minutes: 8,
        tags: ["travel", "medication", "emergency planning", "insurance", "preparation"],
        is_public: true,
        is_featured: true
    }
];

const researchArticles = [
    {
        title: "Gut Microbiome Research: New Insights into IBD",
        excerpt: "Explore the latest research on how the gut microbiome influences IBD development and treatment.",
        content: "Recent research has revealed the crucial role of the gut microbiome in IBD development and progression. Studies show that IBD patients often have reduced microbial diversity and altered bacterial populations compared to healthy individuals. Fecal microbiota transplantation (FMT) is being investigated as a potential treatment, though more research is needed. Probiotic and prebiotic therapies are also being studied for their potential to restore healthy gut bacteria and reduce inflammation.",
        category: "gut_health", // Use existing category
        source: "Nature Reviews Gastroenterology & Hepatology",
        source_url: "https://www.nature.com/nrgastro/",
        read_time_minutes: 9,
        tags: ["microbiome", "FMT", "probiotics", "research", "inflammation"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Genetic Research in IBD: Understanding Risk Factors",
        excerpt: "Learn about genetic research that has identified risk factors and potential targets for IBD treatment.",
        content: "Genetic research has identified over 200 genetic variants associated with IBD risk. These discoveries have helped researchers understand the biological pathways involved in IBD development, including immune system regulation, barrier function, and microbial recognition. While genetics alone don't cause IBD, they interact with environmental factors to influence disease risk. This research is leading to the development of more targeted treatments and personalized medicine approaches.",
        category: "gut_health", // Use existing category
        source: "Nature Genetics",
        source_url: "https://www.nature.com/ng/",
        read_time_minutes: 7,
        tags: ["genetics", "risk factors", "personalized medicine", "immune system", "targeted treatment"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Novel Drug Development: Emerging Therapies for IBD",
        excerpt: "Discover promising new drug therapies currently in development for treating IBD.",
        content: "The pipeline for new IBD treatments includes several promising approaches. Small molecule drugs targeting specific inflammatory pathways, stem cell therapies for tissue repair, and novel biologic agents are all under investigation. Some therapies aim to restore the intestinal barrier, while others target specific immune cells or inflammatory molecules. Clinical trials are essential for evaluating safety and effectiveness, and patients may consider participating in trials to access cutting-edge treatments.",
        category: "gut_health", // Use existing category
        source: "Journal of Crohn's and Colitis",
        source_url: "https://academic.oup.com/ecco-jcc",
        read_time_minutes: 8,
        tags: ["drug development", "clinical trials", "stem cells", "biologics", "novel therapies"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Environmental Factors in IBD: The Role of Diet and Lifestyle",
        excerpt: "Review current research on how environmental factors influence IBD development and progression.",
        content: "Environmental factors play a significant role in IBD development, particularly in genetically susceptible individuals. Research suggests that Western diet patterns, antibiotic use, and reduced exposure to certain microbes may contribute to IBD risk. Studies are investigating the impact of specific dietary components, such as fiber, fats, and food additives, on gut health and inflammation. Understanding these environmental triggers may lead to prevention strategies and dietary interventions.",
        category: "gut_health", // Use existing category
        source: "Gastroenterology",
        source_url: "https://www.gastrojournal.org/",
        read_time_minutes: 6,
        tags: ["environmental factors", "diet", "antibiotics", "prevention", "dietary intervention"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Precision Medicine in IBD: Personalized Treatment Approaches",
        excerpt: "Learn about precision medicine approaches that tailor IBD treatment to individual patient characteristics.",
        content: "Precision medicine aims to match treatments to individual patient characteristics, including genetic profile, disease subtype, and response patterns. Biomarkers are being developed to predict treatment response and disease progression. This approach may help avoid ineffective treatments and reduce side effects. Research is ongoing to identify reliable biomarkers and develop algorithms for treatment selection. The goal is to improve outcomes while reducing healthcare costs.",
        category: "gut_health", // Use existing category
        source: "Science Translational Medicine",
        source_url: "https://stm.sciencemag.org/",
        read_time_minutes: 7,
        tags: ["precision medicine", "biomarkers", "personalized treatment", "treatment response", "outcomes"],
        is_public: true,
        is_featured: true
    }
];

async function addArticles() {
    try {
        console.log('Starting to add comprehensive articles...');
        
        // Add medication articles
        console.log('Adding medication articles...');
        for (const article of medicationArticles) {
            const query = `
                INSERT INTO nutrition_articles 
                (title, excerpt, content, category, source, source_url, read_time_minutes, tags, is_public, is_featured, published_date, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            `;
            
            await pool.query(query, [
                article.title,
                article.excerpt,
                article.content,
                article.category,
                article.source,
                article.source_url,
                article.read_time_minutes,
                `{${article.tags.map(tag => `"${tag}"`).join(',')}}`, // PostgreSQL array format
                article.is_public,
                article.is_featured,
                new Date().toISOString().split('T')[0]
            ]);
        }
        
        // Add lifestyle articles
        console.log('Adding lifestyle articles...');
        for (const article of lifestyleArticles) {
            const query = `
                INSERT INTO nutrition_articles 
                (title, excerpt, content, category, source, source_url, read_time_minutes, tags, is_public, is_featured, published_date, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            `;
            
            await pool.query(query, [
                article.title,
                article.excerpt,
                article.content,
                article.category,
                article.source,
                article.source_url,
                article.read_time_minutes,
                `{${article.tags.map(tag => `"${tag}"`).join(',')}}`, // PostgreSQL array format
                article.is_public,
                article.is_featured,
                new Date().toISOString().split('T')[0]
            ]);
        }
        
        // Add research articles
        console.log('Adding research articles...');
        for (const article of researchArticles) {
            const query = `
                INSERT INTO nutrition_articles 
                (title, excerpt, content, category, source, source_url, read_time_minutes, tags, is_public, is_featured, published_date, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            `;
            
            await pool.query(query, [
                article.title,
                article.excerpt,
                article.content,
                article.category,
                article.source,
                article.source_url,
                article.read_time_minutes,
                `{${article.tags.map(tag => `"${tag}"`).join(',')}}`, // PostgreSQL array format
                article.is_public,
                article.is_featured,
                new Date().toISOString().split('T')[0]
            ]);
        }
        
        console.log('All articles added successfully!');
        
        // Check final counts
        const countQuery = 'SELECT category, COUNT(*) as count FROM nutrition_articles GROUP BY category ORDER BY category';
        const result = await pool.query(countQuery);
        console.log('\nFinal article counts by category:');
        result.rows.forEach(row => {
            console.log(`${row.category}: ${row.count} articles`);
        });
        
    } catch (error) {
        console.error('Error adding articles:', error);
    } finally {
        await pool.end();
    }
}

addArticles(); 