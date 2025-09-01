const { Pool } = require('pg');

// Database connection - will use Railway DATABASE_URL from environment
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/ibdpal'
});

// NUTRITION ARTICLES (20+ articles)
const nutritionArticles = [
    {
        title: "Low FODMAP Diet for IBS: Complete Guide",
        excerpt: "Learn how the low FODMAP diet can help manage IBS symptoms. This evidence-based approach eliminates fermentable carbohydrates that trigger digestive distress.",
        content: "The low FODMAP diet is a three-phase elimination diet that helps identify which foods trigger IBS symptoms. FODMAPs are fermentable oligosaccharides, disaccharides, monosaccharides, and polyols that can cause bloating, gas, and abdominal pain in sensitive individuals. Phase 1 involves eliminating all high-FODMAP foods for 2-6 weeks, followed by systematic reintroduction to identify triggers.",
        category: "nutrition",
        source: "Monash University FODMAP Research",
        source_url: "https://www.monashfodmap.com/",
        read_time_minutes: 8,
        tags: ["FODMAP", "IBS", "diet", "elimination", "digestive health"],
        is_public: true,
        is_featured: true
    },
    {
        title: "IBD Diet: What to Eat During Flares vs. Remission",
        excerpt: "Discover the best foods to eat during IBD flares and remission periods. Learn which foods can soothe inflammation and which to avoid.",
        content: "During IBD flares, focus on easily digestible foods like white rice, bananas, applesauce, and toast (BRAT diet). Avoid high-fiber foods, dairy, spicy foods, and caffeine. During remission, gradually reintroduce fiber-rich foods, lean proteins, and healthy fats. Always work with your healthcare team to develop a personalized nutrition plan.",
        category: "nutrition",
        source: "Crohn's & Colitis Foundation",
        source_url: "https://www.crohnscolitisfoundation.org/diet-and-nutrition",
        read_time_minutes: 7,
        tags: ["IBD", "flare", "remission", "diet", "inflammation"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Anti-Inflammatory Diet for Crohn's Disease",
        excerpt: "Explore an anti-inflammatory diet approach specifically designed for Crohn's disease management and symptom relief.",
        content: "An anti-inflammatory diet for Crohn's focuses on omega-3 fatty acids, antioxidants, and anti-inflammatory compounds. Include fatty fish, leafy greens, berries, turmeric, ginger, and olive oil. Avoid processed foods, refined sugars, and trans fats. This approach may help reduce inflammation and promote gut healing.",
        category: "nutrition",
        source: "Harvard Health Publishing",
        source_url: "https://www.health.harvard.edu/staying-healthy/foods-that-fight-inflammation",
        read_time_minutes: 6,
        tags: ["Crohn's", "anti-inflammatory", "omega-3", "antioxidants", "gut healing"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Gut Health: Probiotics and Prebiotics for IBD",
        excerpt: "Understand the role of probiotics and prebiotics in maintaining gut health and potentially improving IBD symptoms.",
        content: "Probiotics are beneficial bacteria that can help restore gut microbiome balance. Prebiotics are fiber compounds that feed these good bacteria. For IBD patients, specific strains like Bifidobacterium and Lactobacillus may be beneficial. However, timing and strain selection are crucial, especially during flares.",
        category: "nutrition",
        source: "American Gastroenterological Association",
        source_url: "https://gastro.org/practice-guidance/gi-patient-center/topic/probiotics",
        read_time_minutes: 5,
        tags: ["probiotics", "prebiotics", "microbiome", "gut health", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Elimination Diet for Food Sensitivities in IBD",
        excerpt: "Learn how to identify food triggers through systematic elimination diets tailored for IBD patients.",
        content: "An elimination diet helps identify specific foods that worsen IBD symptoms. Start by removing common triggers like dairy, gluten, soy, eggs, and nuts for 2-4 weeks. Then reintroduce one food at a time, monitoring symptoms for 3-5 days. Keep a detailed food and symptom diary throughout the process.",
        category: "nutrition",
        source: "Cleveland Clinic",
        source_url: "https://my.clevelandclinic.org/health/treatments/21660-elimination-diet",
        read_time_minutes: 9,
        tags: ["elimination diet", "food sensitivities", "IBD", "food triggers", "symptom management"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Mediterranean Diet Benefits for IBD Patients",
        excerpt: "Discover how the Mediterranean diet can support IBD management through its anti-inflammatory properties and gut-friendly foods.",
        content: "The Mediterranean diet emphasizes fruits, vegetables, whole grains, legumes, nuts, olive oil, and fish while limiting red meat and processed foods. This approach provides anti-inflammatory omega-3s, antioxidants, and fiber that may benefit IBD patients. The diet is also associated with improved gut microbiome diversity.",
        category: "nutrition",
        source: "Mayo Clinic",
        source_url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/mediterranean-diet/art-20047801",
        read_time_minutes: 6,
        tags: ["Mediterranean diet", "anti-inflammatory", "omega-3", "gut microbiome", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "High-Protein Diet for IBD Weight Management",
        excerpt: "Learn how to maintain adequate protein intake during IBD flares and remission to support healing and prevent muscle loss.",
        content: "IBD patients often need increased protein intake to support tissue repair and prevent muscle wasting. Good protein sources include lean meats, fish, eggs, dairy alternatives, and plant-based proteins like tofu and legumes. Aim for 1.2-1.5g of protein per kg of body weight daily.",
        category: "nutrition",
        source: "Academy of Nutrition and Dietetics",
        source_url: "https://www.eatright.org/health/diseases-and-conditions/digestive-and-gastrointestinal-disorders/inflammatory-bowel-disease",
        read_time_minutes: 5,
        tags: ["protein", "weight management", "muscle preservation", "tissue repair", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Fiber Management in IBD: Soluble vs. Insoluble",
        excerpt: "Understand the difference between soluble and insoluble fiber and how to safely incorporate fiber into your IBD diet.",
        content: "Soluble fiber dissolves in water and forms a gel, making it easier to digest. Good sources include oats, bananas, apples, and carrots. Insoluble fiber adds bulk and may irritate inflamed intestines. During flares, focus on soluble fiber and avoid insoluble fiber. Gradually increase fiber as symptoms improve.",
        category: "nutrition",
        source: "University of Chicago Medicine",
        source_url: "https://www.uchicagomedicine.org/forefront/gastroenterology-articles/fiber-and-inflammatory-bowel-disease",
        read_time_minutes: 7,
        tags: ["fiber", "soluble", "insoluble", "IBD", "digestive health"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Vitamin D and IBD: Sunshine Vitamin for Gut Health",
        excerpt: "Explore the connection between vitamin D deficiency and IBD, and learn how to safely increase your vitamin D levels.",
        content: "Vitamin D plays a crucial role in immune function and gut health. Many IBD patients are deficient due to malabsorption, limited sun exposure, or dietary restrictions. Safe sun exposure, fatty fish, egg yolks, and fortified foods can help. Consider supplementation under medical supervision.",
        category: "nutrition",
        source: "National Institutes of Health",
        source_url: "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/",
        read_time_minutes: 5,
        tags: ["vitamin D", "immune function", "gut health", "IBD", "supplementation"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Hydration Strategies for IBD Patients",
        excerpt: "Learn effective hydration strategies to manage IBD symptoms and prevent dehydration during flares.",
        content: "Proper hydration is crucial for IBD patients, especially during flares when fluid loss is increased. Drink water throughout the day, avoid caffeine and alcohol, and consider electrolyte replacement during severe symptoms. Monitor urine color and frequency to assess hydration status.",
        category: "nutrition",
        source: "International Foundation for Gastrointestinal Disorders",
        source_url: "https://iffgd.org/gi-disorders/irritable-bowel-syndrome-ibs/",
        read_time_minutes: 4,
        tags: ["hydration", "dehydration", "electrolytes", "IBD", "flare management"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Gluten-Free Diet for IBD: When It's Necessary",
        excerpt: "Understand when a gluten-free diet might be beneficial for IBD patients and how to implement it safely.",
        content: "While IBD is not caused by gluten, some patients may benefit from a gluten-free diet if they have celiac disease or gluten sensitivity. Gluten can trigger inflammation in sensitive individuals. Work with a dietitian to ensure nutritional adequacy when eliminating gluten-containing grains.",
        category: "nutrition",
        source: "Celiac Disease Foundation",
        source_url: "https://celiac.org/about-celiac-disease/what-is-celiac-disease/",
        read_time_minutes: 6,
        tags: ["gluten-free", "celiac", "inflammation", "IBD", "diet"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Dairy-Free Alternatives for IBD Patients",
        excerpt: "Discover nutritious dairy alternatives that are easier to digest for IBD patients with lactose intolerance.",
        content: "Many IBD patients experience lactose intolerance. Nutritious dairy alternatives include almond milk, coconut milk, oat milk, and soy milk. These provide calcium and vitamin D without the digestive discomfort. Choose fortified varieties for maximum nutritional benefit.",
        category: "nutrition",
        source: "Academy of Nutrition and Dietetics",
        source_url: "https://www.eatright.org/food/nutrition/dietary-guidelines-and-myplate/vegetarian-diet",
        read_time_minutes: 4,
        tags: ["dairy-free", "lactose intolerance", "calcium", "vitamin D", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Omega-3 Fatty Acids for IBD Inflammation",
        excerpt: "Learn how omega-3 fatty acids can help reduce inflammation and support IBD management.",
        content: "Omega-3 fatty acids have anti-inflammatory properties that may benefit IBD patients. Good sources include fatty fish, flaxseeds, chia seeds, and walnuts. Consider fish oil supplements under medical supervision. Aim for 1-2 servings of fatty fish per week.",
        category: "nutrition",
        source: "American Heart Association",
        source_url: "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/fish-and-omega-3-fatty-acids",
        read_time_minutes: 5,
        tags: ["omega-3", "anti-inflammatory", "fish oil", "inflammation", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Iron-Rich Foods for IBD Anemia Management",
        excerpt: "Discover iron-rich foods that are gentle on the digestive system for IBD patients with anemia.",
        content: "IBD patients often develop anemia due to blood loss and malabsorption. Iron-rich foods include lean red meat, dark leafy greens, legumes, and fortified cereals. Vitamin C enhances iron absorption, so pair iron-rich foods with citrus fruits or bell peppers.",
        category: "nutrition",
        source: "National Institutes of Health",
        source_url: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/",
        read_time_minutes: 6,
        tags: ["iron", "anemia", "absorption", "vitamin C", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Zinc and IBD: Essential Mineral for Healing",
        excerpt: "Understand the importance of zinc for IBD patients and how to maintain adequate levels.",
        content: "Zinc is essential for immune function and tissue repair, making it crucial for IBD patients. Good sources include oysters, lean meats, legumes, and nuts. Zinc deficiency can impair wound healing and immune response. Consider supplementation if levels are low.",
        category: "nutrition",
        source: "National Institutes of Health",
        source_url: "https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/",
        read_time_minutes: 4,
        tags: ["zinc", "immune function", "tissue repair", "healing", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "B Vitamins for IBD Energy and Metabolism",
        excerpt: "Learn how B vitamins support energy production and metabolism in IBD patients.",
        content: "B vitamins are essential for energy production, nerve function, and red blood cell formation. IBD patients may be deficient due to malabsorption. Good sources include whole grains, lean meats, eggs, and leafy greens. Consider B-complex supplements if needed.",
        category: "nutrition",
        source: "National Institutes of Health",
        source_url: "https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/",
        read_time_minutes: 5,
        tags: ["B vitamins", "energy", "metabolism", "absorption", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Antioxidant-Rich Foods for IBD Protection",
        excerpt: "Discover antioxidant-rich foods that can help protect against oxidative stress in IBD.",
        content: "Antioxidants help protect cells from oxidative damage, which is increased in IBD. Good sources include berries, dark chocolate, nuts, and colorful vegetables. Focus on whole foods rather than supplements for maximum benefit.",
        category: "nutrition",
        source: "American Institute for Cancer Research",
        source_url: "https://www.aicr.org/cancer-prevention/food-facts/",
        read_time_minutes: 4,
        tags: ["antioxidants", "oxidative stress", "protection", "berries", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Low-Residue Diet for IBD Flares",
        excerpt: "Learn about low-residue diets that can help reduce symptoms during IBD flares.",
        content: "A low-residue diet limits fiber and other indigestible materials to reduce bowel movements and irritation. Include white bread, white rice, lean meats, and well-cooked vegetables. Avoid raw fruits, vegetables, and whole grains during flares.",
        category: "nutrition",
        source: "University of Michigan Health",
        source_url: "https://www.uofmhealth.org/health-library/aa130313",
        read_time_minutes: 6,
        tags: ["low-residue", "flare", "fiber", "digestion", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Food Safety for IBD Patients",
        excerpt: "Essential food safety guidelines to prevent infections that can worsen IBD symptoms.",
        content: "IBD patients are more susceptible to foodborne illness. Practice proper food safety: wash hands frequently, cook foods thoroughly, avoid raw seafood and undercooked meats, and refrigerate foods promptly. Be extra cautious during flares when the immune system is compromised.",
        category: "nutrition",
        source: "Centers for Disease Control and Prevention",
        source_url: "https://www.cdc.gov/foodsafety/index.html",
        read_time_minutes: 5,
        tags: ["food safety", "infection", "immune system", "prevention", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Meal Planning Strategies for IBD",
        excerpt: "Learn effective meal planning strategies to maintain nutrition and reduce stress for IBD patients.",
        content: "Meal planning can help IBD patients maintain adequate nutrition and reduce stress around eating. Plan meals ahead, keep a food diary, prepare easy-to-digest options, and have backup meals ready. Work with a dietitian to create personalized meal plans.",
        category: "nutrition",
        source: "Academy of Nutrition and Dietetics",
        source_url: "https://www.eatright.org/food/planning-and-prep/meal-prep",
        read_time_minutes: 7,
        tags: ["meal planning", "nutrition", "stress reduction", "preparation", "IBD"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Supplements for IBD: What You Need to Know",
        excerpt: "Understand which supplements may be beneficial for IBD patients and how to use them safely.",
        content: "Supplements can help address nutritional deficiencies in IBD patients. Common supplements include vitamin D, B12, iron, and calcium. Always consult your healthcare team before starting supplements, as some can interact with medications or worsen symptoms.",
        category: "nutrition",
        source: "National Center for Complementary and Integrative Health",
        source_url: "https://www.nccih.nih.gov/health/dietary-supplements",
        read_time_minutes: 6,
        tags: ["supplements", "vitamins", "minerals", "safety", "IBD"],
        is_public: true,
        is_featured: true
    }
];

// MEDICATION ARTICLES (20+ articles)
const medicationArticles = [
    {
        title: "Biologics for IBD: Understanding Treatment Options",
        excerpt: "Learn about biologic medications used to treat inflammatory bowel disease, including how they work and what to expect.",
        content: "Biologic medications are a class of drugs that target specific proteins in the immune system to reduce inflammation. For IBD patients, biologics like infliximab, adalimumab, and vedolizumab can help achieve and maintain remission. These medications are typically administered by injection or infusion and work by blocking inflammatory pathways. Common side effects include injection site reactions, increased risk of infections, and potential allergic reactions. Regular monitoring is essential to ensure safety and effectiveness.",
        category: "ibd",
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
        category: "ibd",
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
        category: "ibd",
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
        category: "ibd",
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
        category: "ibd",
        source: "Cleveland Clinic",
        source_url: "https://my.clevelandclinic.org/health/diseases/15587-inflammatory-bowel-disease-overview",
        read_time_minutes: 4,
        tags: ["adherence", "compliance", "reminders", "communication", "effectiveness"],
        is_public: true,
        is_featured: true
    },
    {
        title: "5-ASA Medications: First-Line Treatment for Ulcerative Colitis",
        excerpt: "Understand how 5-aminosalicylic acid medications work to treat ulcerative colitis and maintain remission.",
        content: "5-ASA medications like mesalamine are often the first-line treatment for mild to moderate ulcerative colitis. They work by reducing inflammation in the colon and can be taken orally or as suppositories/enemas. These medications are generally well-tolerated with minimal side effects. They're most effective for treating the colon and are not typically used for Crohn's disease.",
        category: "ibd",
        source: "American College of Gastroenterology",
        source_url: "https://gi.org/guideline/ulcerative-colitis-in-adults/",
        read_time_minutes: 6,
        tags: ["5-ASA", "mesalamine", "ulcerative colitis", "inflammation", "first-line"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Antibiotics in IBD: When and How They're Used",
        excerpt: "Learn about the role of antibiotics in treating IBD complications and infections.",
        content: "Antibiotics are used in IBD to treat infections, fistulas, and pouchitis. Common antibiotics include metronidazole, ciprofloxacin, and rifaximin. They may also be used to treat small intestinal bacterial overgrowth (SIBO) that can occur in IBD. Long-term antibiotic use should be avoided due to the risk of developing resistance and disrupting the gut microbiome.",
        category: "ibd",
        source: "Inflammatory Bowel Diseases Journal",
        source_url: "https://academic.oup.com/ibdjournal",
        read_time_minutes: 5,
        tags: ["antibiotics", "infection", "fistulas", "SIBO", "microbiome"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Pain Management in IBD: Safe and Effective Options",
        excerpt: "Discover safe pain management strategies for IBD patients, including medication and non-medication approaches.",
        content: "Pain management in IBD requires a careful approach. Acetaminophen is generally safe, while NSAIDs should be avoided as they can worsen inflammation. Opioids should be used sparingly and only for short-term relief. Non-medication approaches include heat therapy, relaxation techniques, and physical therapy. Always work with your healthcare team to develop a safe pain management plan.",
        category: "ibd",
        source: "American Pain Society",
        source_url: "https://americanpainsociety.org/",
        read_time_minutes: 7,
        tags: ["pain management", "acetaminophen", "NSAIDs", "opioids", "non-medication"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Biosimilars: Cost-Effective Alternatives to Biologic Medications",
        excerpt: "Understand what biosimilars are and how they can provide cost-effective treatment options for IBD.",
        content: "Biosimilars are highly similar versions of biologic medications that can offer significant cost savings. They undergo rigorous testing to ensure safety and effectiveness. While they may have slight differences from the original biologic, they provide the same clinical benefits. Biosimilars can help make biologic treatment more accessible to patients.",
        category: "ibd",
        source: "FDA",
        source_url: "https://www.fda.gov/drugs/biosimilars",
        read_time_minutes: 6,
        tags: ["biosimilars", "cost-effective", "biologics", "accessibility", "FDA"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication Interactions: What IBD Patients Need to Know",
        excerpt: "Learn about potential drug interactions and how to safely manage multiple medications for IBD.",
        content: "IBD patients often take multiple medications, increasing the risk of drug interactions. Common interactions include those between immunomodulators and other medications, as well as interactions with over-the-counter supplements. Always inform your healthcare team about all medications and supplements you're taking. Regular monitoring can help identify and prevent potential interactions.",
        category: "ibd",
        source: "Drugs.com",
        source_url: "https://www.drugs.com/drug_interactions.html",
        read_time_minutes: 5,
        tags: ["drug interactions", "multiple medications", "supplements", "monitoring", "safety"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Topical Medications for IBD: Enemas, Suppositories, and Foams",
        excerpt: "Explore topical medication options for treating IBD, including their benefits and proper administration.",
        content: "Topical medications like enemas, suppositories, and foams deliver medication directly to the affected area. They're particularly useful for treating distal disease in ulcerative colitis. These medications can provide rapid relief with fewer systemic side effects. Proper administration technique is important for effectiveness.",
        category: "ibd",
        source: "Crohn's & Colitis Foundation",
        source_url: "https://www.crohnscolitisfoundation.org/what-is-ibd/medication",
        read_time_minutes: 4,
        tags: ["topical", "enemas", "suppositories", "foams", "distal disease"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication Monitoring: Blood Tests and Safety Checks",
        excerpt: "Understand the importance of regular monitoring when taking IBD medications and what tests are needed.",
        content: "Regular monitoring is essential for many IBD medications. Blood tests check for liver function, blood cell counts, and medication levels. Imaging tests may be needed to monitor disease activity and medication effectiveness. Regular monitoring helps ensure medication safety and allows for timely adjustments to treatment.",
        category: "ibd",
        source: "American Gastroenterological Association",
        source_url: "https://gastro.org/practice-guidance/gi-patient-center/topic/inflammatory-bowel-disease",
        read_time_minutes: 6,
        tags: ["monitoring", "blood tests", "liver function", "safety", "effectiveness"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication Side Effects: Recognition and Management",
        excerpt: "Learn to recognize common medication side effects and when to seek medical attention.",
        content: "All medications can cause side effects. Common IBD medication side effects include nausea, fatigue, and injection site reactions. Serious side effects may include infections, liver problems, or allergic reactions. Know the signs of serious side effects and when to contact your healthcare team immediately.",
        category: "ibd",
        source: "Mayo Clinic",
        source_url: "https://www.mayoclinic.org/diseases-conditions/inflammatory-bowel-disease/diagnosis-treatment/drc-20353320",
        read_time_minutes: 5,
        tags: ["side effects", "recognition", "management", "allergic reactions", "safety"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication Storage and Handling: Best Practices",
        excerpt: "Learn proper storage and handling techniques for IBD medications to maintain effectiveness and safety.",
        content: "Proper storage and handling of IBD medications is crucial for effectiveness and safety. Some medications require refrigeration, while others should be kept at room temperature. Always check expiration dates and never use medications that appear discolored or have changed consistency. Follow specific storage instructions for each medication.",
        category: "ibd",
        source: "FDA",
        source_url: "https://www.fda.gov/drugs/safe-disposal-medicines/disposal-unused-medicines-what-you-should-know",
        read_time_minutes: 4,
        tags: ["storage", "handling", "refrigeration", "expiration", "safety"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication Travel Tips: Planning for Trips with IBD",
        excerpt: "Essential tips for traveling with IBD medications, including storage, documentation, and emergency planning.",
        content: "Traveling with IBD medications requires careful planning. Keep medications in carry-on luggage with proper documentation. Research local healthcare facilities at your destination. Consider time zone changes for medication schedules. Always carry extra medication and have a plan for emergencies.",
        category: "ibd",
        source: "International Foundation for Gastrointestinal Disorders",
        source_url: "https://iffgd.org/living-with-digestive-disorders/travel-tips",
        read_time_minutes: 6,
        tags: ["travel", "medications", "documentation", "emergency planning", "time zones"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication Cost Management: Affording IBD Treatment",
        excerpt: "Strategies for managing the high cost of IBD medications and accessing financial assistance.",
        content: "IBD medications can be expensive, but there are ways to manage costs. Check with pharmaceutical companies for patient assistance programs. Look into insurance coverage and appeal denials if necessary. Consider generic alternatives when available. Work with your healthcare team to find cost-effective treatment options.",
        category: "ibd",
        source: "Patient Advocate Foundation",
        source_url: "https://www.patientadvocate.org/",
        read_time_minutes: 7,
        tags: ["cost management", "financial assistance", "insurance", "generic alternatives", "patient programs"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication and Pregnancy: Managing IBD During Pregnancy",
        excerpt: "Guidelines for managing IBD medications during pregnancy and breastfeeding.",
        content: "Many IBD medications are safe during pregnancy, but some should be avoided. Work closely with your healthcare team to develop a safe treatment plan. Some medications may need to be adjusted or discontinued during pregnancy. Regular monitoring is important to ensure both maternal and fetal health.",
        category: "ibd",
        source: "American College of Obstetricians and Gynecologists",
        source_url: "https://www.acog.org/",
        read_time_minutes: 8,
        tags: ["pregnancy", "breastfeeding", "maternal health", "fetal health", "medication safety"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication and Surgery: Perioperative Management",
        excerpt: "Understanding how IBD medications are managed before, during, and after surgery.",
        content: "IBD medications may need to be adjusted around surgery. Some medications increase infection risk and should be stopped before surgery. Others may need to be continued to prevent disease flares. Work with your surgical team to develop a perioperative medication plan.",
        category: "ibd",
        source: "American Society of Colon and Rectal Surgeons",
        source_url: "https://www.fascrs.org/",
        read_time_minutes: 6,
        tags: ["surgery", "perioperative", "infection risk", "disease flares", "medication management"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication and Vaccinations: What IBD Patients Need to Know",
        excerpt: "Important information about vaccinations for IBD patients taking immunosuppressive medications.",
        content: "IBD patients on immunosuppressive medications may need special vaccination considerations. Live vaccines should generally be avoided. Ensure all routine vaccinations are up to date before starting immunosuppressive therapy. Annual flu shots and other recommended vaccines are important for preventing infections.",
        category: "ibd",
        source: "Centers for Disease Control and Prevention",
        source_url: "https://www.cdc.gov/vaccines/adults/rec-vac/health-conditions.html",
        read_time_minutes: 5,
        tags: ["vaccinations", "immunosuppressive", "live vaccines", "infection prevention", "CDC"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication and Alternative Therapies: Complementary Approaches",
        excerpt: "Understanding how alternative therapies may interact with conventional IBD medications.",
        content: "Some alternative therapies may interact with conventional IBD medications. Always discuss alternative therapies with your healthcare team before starting them. Some supplements and herbal remedies can affect medication absorption or effectiveness. Evidence-based complementary approaches may be beneficial when used appropriately.",
        category: "ibd",
        source: "National Center for Complementary and Integrative Health",
        source_url: "https://www.nccih.nih.gov/",
        read_time_minutes: 6,
        tags: ["alternative therapies", "complementary", "supplements", "herbal remedies", "interactions"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication and Mental Health: Addressing Psychological Side Effects",
        excerpt: "Recognizing and managing the psychological side effects that can occur with IBD medications.",
        content: "Some IBD medications can affect mood and mental health. Corticosteroids, in particular, can cause mood changes, anxiety, and depression. Be aware of these potential side effects and seek help if needed. Mental health support is an important part of comprehensive IBD care.",
        category: "ibd",
        source: "Mental Health America",
        source_url: "https://www.mhanational.org/",
        read_time_minutes: 5,
        tags: ["mental health", "mood changes", "anxiety", "depression", "psychological effects"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Medication and Bone Health: Preventing Osteoporosis in IBD",
        excerpt: "Understanding the impact of IBD medications on bone health and prevention strategies.",
        content: "Some IBD medications, particularly corticosteroids, can affect bone health and increase the risk of osteoporosis. Regular bone density testing may be recommended. Calcium and vitamin D supplementation, along with weight-bearing exercise, can help maintain bone health. Work with your healthcare team to develop a bone health plan.",
        category: "ibd",
        source: "National Osteoporosis Foundation",
        source_url: "https://www.nof.org/",
        read_time_minutes: 6,
        tags: ["bone health", "osteoporosis", "calcium", "vitamin D", "exercise"],
        is_public: true,
        is_featured: true
    }
];

// LIFESTYLE ARTICLES (20+ articles)
const lifestyleArticles = [
    {
        title: "Stress Management Techniques for IBD Patients",
        excerpt: "Discover effective stress management strategies that can help reduce IBD symptoms and improve quality of life.",
        content: "Stress can significantly impact IBD symptoms and may trigger flares. Effective stress management techniques include mindfulness meditation, deep breathing exercises, progressive muscle relaxation, and regular physical activity. Cognitive behavioral therapy (CBT) can help develop coping strategies for managing stress and anxiety related to IBD. It's important to identify personal stress triggers and develop a personalized stress management plan with your healthcare team.",
        category: "gut_health",
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
        category: "gut_health",
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
        category: "gut_health",
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
        category: "gut_health",
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
        category: "gut_health",
        source: "International Foundation for Gastrointestinal Disorders",
        source_url: "https://iffgd.org/living-with-digestive-disorders/travel-tips",
        read_time_minutes: 8,
        tags: ["travel", "medication", "emergency planning", "insurance", "preparation"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Workplace Accommodations for IBD: Your Rights and Options",
        excerpt: "Understanding your rights to workplace accommodations and how to advocate for your needs with IBD.",
        content: "IBD patients have rights to reasonable workplace accommodations under the Americans with Disabilities Act. Common accommodations include flexible work schedules, access to restrooms, and the ability to work from home when needed. Open communication with your employer about your condition can help create a supportive work environment. Document your needs and work with HR to implement appropriate accommodations.",
        category: "gut_health",
        source: "U.S. Equal Employment Opportunity Commission",
        source_url: "https://www.eeoc.gov/",
        read_time_minutes: 7,
        tags: ["workplace", "accommodations", "ADA", "rights", "advocacy"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Relationships and IBD: Communicating with Partners and Family",
        excerpt: "Learn strategies for maintaining healthy relationships while managing the challenges of IBD.",
        content: "IBD can affect relationships with partners, family, and friends. Open communication about your condition, needs, and limitations is essential. Educate your loved ones about IBD to help them understand what you're going through. Set boundaries and ask for help when needed. Remember that your condition doesn't define you or your relationships.",
        category: "gut_health",
        source: "American Psychological Association",
        source_url: "https://www.apa.org/topics/relationships",
        read_time_minutes: 6,
        tags: ["relationships", "communication", "family", "partners", "boundaries"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Body Image and IBD: Embracing Your Changing Body",
        excerpt: "Strategies for maintaining positive body image and self-esteem while living with IBD.",
        content: "IBD can cause physical changes that affect body image and self-esteem. Weight fluctuations, scars from surgery, and symptoms like bloating can be challenging. Focus on what your body can do rather than how it looks. Practice self-compassion and surround yourself with supportive people. Consider working with a therapist if body image issues significantly impact your quality of life.",
        category: "gut_health",
        source: "National Eating Disorders Association",
        source_url: "https://www.nationaleatingdisorders.org/",
        read_time_minutes: 5,
        tags: ["body image", "self-esteem", "self-compassion", "physical changes", "therapy"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Financial Planning for IBD: Managing Healthcare Costs",
        excerpt: "Learn strategies for managing the financial impact of IBD and planning for long-term healthcare needs.",
        content: "IBD can be expensive to manage, with costs including medications, doctor visits, and potential surgeries. Create a budget that accounts for healthcare expenses. Look into health savings accounts and flexible spending accounts. Consider disability insurance and long-term care planning. Work with a financial advisor who understands chronic illness to develop a comprehensive financial plan.",
        category: "gut_health",
        source: "Financial Planning Association",
        source_url: "https://www.financialplanningassociation.org/",
        read_time_minutes: 8,
        tags: ["financial planning", "healthcare costs", "budgeting", "insurance", "long-term planning"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Sexual Health and IBD: Maintaining Intimacy",
        excerpt: "Addressing sexual health concerns and maintaining intimacy while managing IBD symptoms.",
        content: "IBD can affect sexual health and intimacy due to symptoms, medications, and emotional factors. Open communication with your partner is essential. Some medications may affect libido or sexual function. Work with your healthcare team to address any medication-related issues. Remember that intimacy can take many forms and doesn't always require sexual activity.",
        category: "gut_health",
        source: "American Sexual Health Association",
        source_url: "https://www.ashasexualhealth.org/",
        read_time_minutes: 6,
        tags: ["sexual health", "intimacy", "communication", "medications", "relationships"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Pregnancy and IBD: Planning for a Healthy Pregnancy",
        excerpt: "Comprehensive guide to managing IBD during pregnancy and preparing for parenthood.",
        content: "Many women with IBD can have healthy pregnancies with proper planning and care. Work with a high-risk obstetrician and your gastroenterologist to develop a pregnancy plan. Most IBD medications are safe during pregnancy, but some adjustments may be needed. Regular monitoring is important to ensure both maternal and fetal health. Plan for postpartum care and potential flare-ups.",
        category: "gut_health",
        source: "American College of Obstetricians and Gynecologists",
        source_url: "https://www.acog.org/",
        read_time_minutes: 9,
        tags: ["pregnancy", "parenthood", "high-risk", "postpartum", "flare-ups"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Aging with IBD: Managing the Condition as You Get Older",
        excerpt: "Understanding how IBD affects aging and strategies for managing the condition in older adults.",
        content: "IBD affects people of all ages, including older adults. Aging can bring additional challenges like increased medication interactions and decreased mobility. Regular health screenings become even more important. Work with your healthcare team to adjust treatment plans as needed. Stay active and engaged in your care to maintain quality of life.",
        category: "gut_health",
        source: "National Institute on Aging",
        source_url: "https://www.nia.nih.gov/",
        read_time_minutes: 7,
        tags: ["aging", "older adults", "medication interactions", "health screenings", "quality of life"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Alternative Therapies for IBD: Complementary Approaches",
        excerpt: "Explore evidence-based alternative therapies that may complement conventional IBD treatment.",
        content: "Some alternative therapies may help manage IBD symptoms and improve quality of life. These include acupuncture, massage therapy, and mind-body techniques like yoga and tai chi. Always discuss alternative therapies with your healthcare team before starting them. Remember that these should complement, not replace, conventional medical treatment.",
        category: "gut_health",
        source: "National Center for Complementary and Integrative Health",
        source_url: "https://www.nccih.nih.gov/",
        read_time_minutes: 6,
        tags: ["alternative therapies", "acupuncture", "massage", "yoga", "complementary"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Technology and IBD: Apps and Tools for Management",
        excerpt: "Discover helpful apps and technology tools for managing IBD symptoms and treatment.",
        content: "Technology can be a valuable tool for IBD management. Apps can help track symptoms, medications, and appointments. Telemedicine platforms provide convenient access to healthcare. Online support groups and forums offer community and information. Choose tools that work for you and integrate them into your daily routine.",
        category: "gut_health",
        source: "Digital Health",
        source_url: "https://www.digitalhealth.net/",
        read_time_minutes: 5,
        tags: ["technology", "apps", "telemedicine", "support groups", "tracking"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Environmental Factors and IBD: Creating a Healthy Living Space",
        excerpt: "Learn how environmental factors can affect IBD and strategies for creating a healthy living environment.",
        content: "Environmental factors like air quality, water quality, and exposure to certain chemicals may affect IBD. Consider using air purifiers, drinking filtered water, and choosing natural cleaning products. Create a calm, stress-free living environment. Pay attention to how your environment affects your symptoms and make adjustments as needed.",
        category: "gut_health",
        source: "Environmental Protection Agency",
        source_url: "https://www.epa.gov/",
        read_time_minutes: 6,
        tags: ["environmental factors", "air quality", "water quality", "chemicals", "healthy living"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Pets and IBD: The Benefits of Animal Companionship",
        excerpt: "Explore the benefits of pet ownership for IBD patients and considerations for choosing the right pet.",
        content: "Pets can provide emotional support and companionship for IBD patients. They can help reduce stress and provide motivation for physical activity. Consider your energy levels and living situation when choosing a pet. Some pets may require more care than others. Remember that pets can also be a source of joy and unconditional love.",
        category: "gut_health",
        source: "American Veterinary Medical Association",
        source_url: "https://www.avma.org/",
        read_time_minutes: 4,
        tags: ["pets", "companionship", "emotional support", "stress reduction", "motivation"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Hobbies and IBD: Finding Joy in Activities You Love",
        excerpt: "Discover how engaging in hobbies and activities can improve quality of life for IBD patients.",
        content: "Hobbies and activities can provide distraction, stress relief, and a sense of accomplishment for IBD patients. Choose activities that you enjoy and can do regardless of your energy levels. Consider both indoor and outdoor activities. Don't be afraid to try new things and adapt activities to your needs. Remember that hobbies can be a source of joy and fulfillment.",
        category: "gut_health",
        source: "American Psychological Association",
        source_url: "https://www.apa.org/topics/leisure",
        read_time_minutes: 5,
        tags: ["hobbies", "activities", "stress relief", "joy", "fulfillment"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Advocacy and IBD: Making Your Voice Heard",
        excerpt: "Learn how to become an advocate for IBD awareness and research, and make a difference in the community.",
        content: "Advocacy can be empowering for IBD patients and help raise awareness about the condition. You can advocate at the local, state, or national level. Join patient advocacy organizations and participate in awareness events. Share your story to help others understand what it's like to live with IBD. Remember that your voice matters and can make a difference.",
        category: "gut_health",
        source: "Crohn's & Colitis Foundation",
        source_url: "https://www.crohnscolitisfoundation.org/advocacy",
        read_time_minutes: 6,
        tags: ["advocacy", "awareness", "research", "community", "empowerment"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Education and IBD: Managing School and Learning",
        excerpt: "Strategies for managing IBD while pursuing education, from elementary school to higher education.",
        content: "IBD can affect education at any level, but with proper planning and accommodations, students can succeed. Work with teachers and school administrators to develop accommodation plans. Consider online or hybrid learning options when needed. Don't be afraid to ask for help and advocate for your needs. Remember that your education is important and worth fighting for.",
        category: "gut_health",
        source: "U.S. Department of Education",
        source_url: "https://www.ed.gov/",
        read_time_minutes: 7,
        tags: ["education", "accommodations", "advocacy", "online learning", "success"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Spirituality and IBD: Finding Meaning and Purpose",
        excerpt: "Explore the role of spirituality and faith in coping with IBD and finding meaning in the journey.",
        content: "Spirituality and faith can provide comfort, meaning, and purpose for many IBD patients. Whether through organized religion, meditation, or personal reflection, spiritual practices can help with coping and resilience. Find what works for you and integrate it into your daily routine. Remember that spirituality is a personal journey and can take many forms.",
        category: "gut_health",
        source: "American Psychological Association",
        source_url: "https://www.apa.org/topics/religion-spirituality",
        read_time_minutes: 5,
        tags: ["spirituality", "faith", "meaning", "purpose", "coping"],
        is_public: true,
        is_featured: true
    },
    {
        title: "End-of-Life Planning for IBD: Preparing for the Future",
        excerpt: "Important considerations for end-of-life planning and advance care directives for IBD patients.",
        content: "While IBD is not typically life-threatening, it's important to plan for the future. Consider creating advance care directives and discussing your wishes with loved ones. Work with your healthcare team to understand your prognosis and treatment options. Remember that planning ahead can provide peace of mind and ensure your wishes are respected.",
        category: "gut_health",
        source: "National Institute on Aging",
        source_url: "https://www.nia.nih.gov/health/advance-care-planning",
        read_time_minutes: 6,
        tags: ["end-of-life planning", "advance directives", "prognosis", "peace of mind", "future"],
        is_public: true,
        is_featured: true
    }
];

// RESEARCH ARTICLES (20+ articles)
const researchArticles = [
    {
        title: "Gut Microbiome Research: New Insights into IBD",
        excerpt: "Explore the latest research on how the gut microbiome influences IBD development and treatment.",
        content: "Recent research has revealed the crucial role of the gut microbiome in IBD development and progression. Studies show that IBD patients often have reduced microbial diversity and altered bacterial populations compared to healthy individuals. Fecal microbiota transplantation (FMT) is being investigated as a potential treatment, though more research is needed. Probiotic and prebiotic therapies are also being studied for their potential to restore healthy gut bacteria and reduce inflammation.",
        category: "gut_health",
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
        category: "gut_health",
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
        category: "gut_health",
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
        category: "gut_health",
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
        category: "gut_health",
        source: "Science Translational Medicine",
        source_url: "https://stm.sciencemag.org/",
        read_time_minutes: 7,
        tags: ["precision medicine", "biomarkers", "personalized treatment", "treatment response", "outcomes"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Stem Cell Therapy for IBD: Regenerative Medicine Approaches",
        excerpt: "Explore the potential of stem cell therapy for treating IBD and promoting tissue regeneration.",
        content: "Stem cell therapy is being investigated as a potential treatment for IBD, particularly for fistulas and tissue damage. Mesenchymal stem cells have shown promise in reducing inflammation and promoting tissue repair. Clinical trials are evaluating the safety and effectiveness of various stem cell approaches. While still experimental, stem cell therapy may offer new options for patients who haven't responded to conventional treatments.",
        category: "gut_health",
        source: "Cell Stem Cell",
        source_url: "https://www.cell.com/cell-stem-cell",
        read_time_minutes: 8,
        tags: ["stem cells", "regenerative medicine", "fistulas", "tissue repair", "clinical trials"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Immunotherapy for IBD: Harnessing the Immune System",
        excerpt: "Learn about immunotherapy approaches that modulate the immune system to treat IBD.",
        content: "Immunotherapy approaches for IBD aim to restore immune balance rather than suppress the immune system. This includes therapies that target specific immune cells, cytokines, or signaling pathways. Some approaches focus on inducing tolerance to gut bacteria, while others target specific inflammatory molecules. These treatments may offer more targeted and potentially safer alternatives to current immunosuppressive therapies.",
        category: "gut_health",
        source: "Nature Reviews Immunology",
        source_url: "https://www.nature.com/nri/",
        read_time_minutes: 7,
        tags: ["immunotherapy", "immune system", "tolerance", "cytokines", "targeted therapy"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Nanotechnology in IBD Treatment: Novel Drug Delivery Systems",
        excerpt: "Discover how nanotechnology is being used to develop more effective drug delivery systems for IBD.",
        content: "Nanotechnology offers new possibilities for IBD treatment through targeted drug delivery and improved bioavailability. Nanoparticles can be designed to release drugs specifically in inflamed areas of the intestine, reducing side effects and improving effectiveness. Research is also exploring the use of nanoparticles for imaging and monitoring disease activity. These approaches may lead to more precise and effective treatments.",
        category: "gut_health",
        source: "Nature Nanotechnology",
        source_url: "https://www.nature.com/nnano/",
        read_time_minutes: 6,
        tags: ["nanotechnology", "drug delivery", "targeted therapy", "bioavailability", "imaging"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Artificial Intelligence in IBD: Machine Learning for Diagnosis and Treatment",
        excerpt: "Explore how artificial intelligence and machine learning are transforming IBD diagnosis and treatment.",
        content: "Artificial intelligence is being applied to IBD in various ways, from improving diagnosis accuracy to predicting treatment response. Machine learning algorithms can analyze medical images, patient data, and genetic information to provide more personalized care. AI may help identify patients at risk for complications and optimize treatment strategies. These technologies are still in development but show promise for improving IBD care.",
        category: "gut_health",
        source: "Nature Machine Intelligence",
        source_url: "https://www.nature.com/natmachintell/",
        read_time_minutes: 7,
        tags: ["artificial intelligence", "machine learning", "diagnosis", "prediction", "personalized care"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Epigenetics and IBD: Understanding Gene Regulation",
        excerpt: "Learn about epigenetic research and how it may influence IBD development and treatment.",
        content: "Epigenetics refers to changes in gene expression that don't involve changes to the DNA sequence. Research suggests that epigenetic modifications may play a role in IBD development and response to treatment. Environmental factors like diet and stress can influence epigenetic changes. Understanding these mechanisms may lead to new treatment approaches that target epigenetic modifications.",
        category: "gut_health",
        source: "Nature Reviews Genetics",
        source_url: "https://www.nature.com/nrg/",
        read_time_minutes: 6,
        tags: ["epigenetics", "gene regulation", "environmental factors", "treatment", "mechanisms"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Microbiome Engineering: Synthetic Biology Approaches",
        excerpt: "Explore cutting-edge research on engineering the gut microbiome to treat IBD.",
        content: "Synthetic biology approaches aim to engineer beneficial bacteria or create synthetic microbial communities to treat IBD. This includes developing bacteria that can produce anti-inflammatory compounds or compete with harmful microbes. While still experimental, these approaches may offer new ways to manipulate the gut microbiome for therapeutic benefit. Safety and regulatory considerations are important for these novel therapies.",
        category: "gut_health",
        source: "Nature Biotechnology",
        source_url: "https://www.nature.com/nbt/",
        read_time_minutes: 8,
        tags: ["synthetic biology", "microbiome engineering", "beneficial bacteria", "anti-inflammatory", "therapeutic"],
        is_public: true,
        is_featured: true
    },
    {
        title: "CRISPR Gene Editing in IBD Research",
        excerpt: "Learn about how CRISPR gene editing technology is being used in IBD research.",
        content: "CRISPR gene editing technology is being used in IBD research to study gene function and develop potential treatments. Researchers can use CRISPR to modify genes in cell and animal models to understand their role in IBD. This technology may also be used to develop cell-based therapies or modify the microbiome. While still in early stages, CRISPR offers new possibilities for understanding and treating IBD.",
        category: "gut_health",
        source: "Nature Methods",
        source_url: "https://www.nature.com/nmeth/",
        read_time_minutes: 7,
        tags: ["CRISPR", "gene editing", "research", "cell therapy", "microbiome"],
        is_public: true,
        is_featured: true
    },
    {
        title: "3D Organoids: Modeling IBD in the Laboratory",
        excerpt: "Discover how 3D organoid technology is advancing IBD research and drug development.",
        content: "3D organoids are miniature versions of organs grown in the laboratory from stem cells. These models can be used to study IBD in a controlled environment and test potential treatments. Organoids can be created from patient cells, allowing for personalized drug testing. This technology is helping researchers understand disease mechanisms and develop new therapies without relying solely on animal models.",
        category: "gut_health",
        source: "Nature Reviews Molecular Cell Biology",
        source_url: "https://www.nature.com/nrm/",
        read_time_minutes: 6,
        tags: ["organoids", "3D models", "laboratory research", "drug testing", "personalized medicine"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Metabolomics in IBD: Understanding Metabolic Changes",
        excerpt: "Learn about metabolomics research and how it's revealing metabolic changes in IBD.",
        content: "Metabolomics studies the small molecules produced by cellular processes. Research shows that IBD patients have distinct metabolic profiles compared to healthy individuals. These changes may reflect altered gut microbiome function, inflammation, or dietary modifications. Understanding these metabolic changes may lead to new biomarkers for diagnosis and monitoring, as well as potential therapeutic targets.",
        category: "gut_health",
        source: "Nature Reviews Gastroenterology & Hepatology",
        source_url: "https://www.nature.com/nrgastro/",
        read_time_minutes: 5,
        tags: ["metabolomics", "metabolic changes", "biomarkers", "diagnosis", "therapeutic targets"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Proteomics in IBD: Protein Biomarkers and Therapeutic Targets",
        excerpt: "Explore proteomics research and its potential for identifying new biomarkers and treatment targets.",
        content: "Proteomics studies the proteins present in cells and tissues. IBD research is using proteomics to identify protein biomarkers for diagnosis and disease monitoring. This approach may also reveal new therapeutic targets and help understand disease mechanisms. Proteomic analysis of blood, stool, and tissue samples is providing insights into IBD pathophysiology and treatment response.",
        category: "gut_health",
        source: "Nature Reviews Gastroenterology & Hepatology",
        source_url: "https://www.nature.com/nrgastro/",
        read_time_minutes: 6,
        tags: ["proteomics", "protein biomarkers", "therapeutic targets", "diagnosis", "pathophysiology"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Single-Cell Analysis in IBD: Cellular Heterogeneity",
        excerpt: "Learn about single-cell analysis techniques and their application to understanding IBD.",
        content: "Single-cell analysis allows researchers to study individual cells rather than bulk tissue samples. This approach is revealing cellular heterogeneity in IBD, showing that different cell types and states contribute to disease. Single-cell technologies are helping identify new cell types involved in IBD and understand how they change during disease progression. This may lead to more targeted treatments.",
        category: "gut_health",
        source: "Nature Methods",
        source_url: "https://www.nature.com/nmeth/",
        read_time_minutes: 7,
        tags: ["single-cell analysis", "cellular heterogeneity", "cell types", "disease progression", "targeted treatment"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Systems Biology in IBD: Integrating Multiple Data Types",
        excerpt: "Discover how systems biology approaches are integrating multiple data types to understand IBD.",
        content: "Systems biology integrates data from genomics, proteomics, metabolomics, and other sources to create comprehensive models of biological systems. This approach is being applied to IBD to understand how different components interact to cause disease. Systems biology may help identify key regulatory networks and predict how interventions will affect the system. This could lead to more effective treatment strategies.",
        category: "gut_health",
        source: "Nature Reviews Genetics",
        source_url: "https://www.nature.com/nrg/",
        read_time_minutes: 8,
        tags: ["systems biology", "data integration", "regulatory networks", "prediction", "treatment strategies"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Digital Pathology in IBD: AI-Powered Diagnosis",
        excerpt: "Learn about digital pathology and how artificial intelligence is improving IBD diagnosis.",
        content: "Digital pathology involves scanning tissue samples to create digital images that can be analyzed by computer algorithms. AI-powered analysis of these images can help pathologists diagnose IBD more accurately and consistently. This technology may also help predict disease progression and treatment response. Digital pathology is becoming increasingly important in IBD research and clinical practice.",
        category: "gut_health",
        source: "Nature Reviews Gastroenterology & Hepatology",
        source_url: "https://www.nature.com/nrgastro/",
        read_time_minutes: 6,
        tags: ["digital pathology", "AI diagnosis", "tissue analysis", "disease progression", "clinical practice"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Real-World Evidence in IBD: Learning from Clinical Practice",
        excerpt: "Explore how real-world evidence is complementing clinical trials in IBD research.",
        content: "Real-world evidence comes from data collected during routine clinical practice, including electronic health records, patient registries, and claims data. This information complements clinical trial data by providing insights into how treatments work in diverse patient populations. Real-world evidence is helping researchers understand treatment effectiveness, safety, and cost-effectiveness in real-world settings.",
        category: "gut_health",
        source: "Nature Reviews Gastroenterology & Hepatology",
        source_url: "https://www.nature.com/nrgastro/",
        read_time_minutes: 5,
        tags: ["real-world evidence", "clinical practice", "effectiveness", "safety", "cost-effectiveness"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Patient-Reported Outcomes in IBD Research",
        excerpt: "Understand the importance of patient-reported outcomes in IBD research and treatment development.",
        content: "Patient-reported outcomes (PROs) measure how patients feel and function, providing important information about treatment effectiveness from the patient perspective. PROs are increasingly being incorporated into clinical trials and routine care. These measures help ensure that treatments address issues that matter most to patients. PROs may include measures of symptoms, quality of life, and treatment satisfaction.",
        category: "gut_health",
        source: "Nature Reviews Gastroenterology & Hepatology",
        source_url: "https://www.nature.com/nrgastro/",
        read_time_minutes: 6,
        tags: ["patient-reported outcomes", "clinical trials", "quality of life", "treatment satisfaction", "patient perspective"],
        is_public: true,
        is_featured: true
    },
    {
        title: "Global IBD Research: International Collaboration and Data Sharing",
        excerpt: "Learn about international collaboration in IBD research and the importance of data sharing.",
        content: "IBD research benefits from international collaboration and data sharing. Large consortia are pooling data from multiple countries to increase study power and diversity. This approach is helping identify genetic and environmental factors that vary across populations. International collaboration also facilitates the development of standardized research protocols and outcome measures. Data sharing accelerates research progress and benefits patients worldwide.",
        category: "gut_health",
        source: "Nature Reviews Gastroenterology & Hepatology",
        source_url: "https://www.nature.com/nrgastro/",
        read_time_minutes: 7,
        tags: ["international collaboration", "data sharing", "genetic factors", "environmental factors", "standardization"],
        is_public: true,
        is_featured: true
    }
];

async function addAllArticles() {
    try {
        console.log('Starting to add comprehensive articles v2...');
        
        // Add nutrition articles
        console.log('Adding nutrition articles...');
        for (const article of nutritionArticles) {
            await addArticle(article);
        }
        
        // Add medication articles
        console.log('Adding medication articles...');
        for (const article of medicationArticles) {
            await addArticle(article);
        }
        
        // Add lifestyle articles
        console.log('Adding lifestyle articles...');
        for (const article of lifestyleArticles) {
            await addArticle(article);
        }
        
        // Add research articles
        console.log('Adding research articles...');
        for (const article of researchArticles) {
            await addArticle(article);
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

async function addArticle(article) {
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

addAllArticles(); 