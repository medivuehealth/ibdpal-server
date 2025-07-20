const { Client } = require('pg');

// Neon database connection string
const DATABASE_URL = 'postgresql://neondb_owner:npg_ILP7Oz0VhYKj@ep-lucky-wildflower-ae5uww1l-pooler.c-2.us-east-2.aws.neon.tech/medivue?sslmode=require&channel_binding=require';

const testFixedInsert = async () => {
  console.log('🧪 Testing fixed INSERT statement...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database');

    // Test the fixed INSERT statement from the server
    const testQuery = `
        INSERT INTO journal_entries (
            user_id, entry_date, calories, protein, carbs, fiber,
            has_allergens, meals_per_day, hydration_level, bowel_frequency,
            bristol_scale, urgency_level, blood_present, pain_location,
            pain_severity, pain_time, medication_taken, medication_type,
            dosage_level, sleep_hours, stress_level, menstruation,
            fatigue_level, notes, breakfast, lunch, dinner, snacks,
            breakfast_calories, breakfast_protein, breakfast_carbs, breakfast_fiber, breakfast_fat,
            lunch_calories, lunch_protein, lunch_carbs, lunch_fiber, lunch_fat,
            dinner_calories, dinner_protein, dinner_carbs, dinner_fiber, dinner_fat,
            snack_calories, snack_protein, snack_carbs, snack_fiber, snack_fat,
            created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
                $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45,
                NOW(), NOW())
        RETURNING entry_id;
    `;

    const testValues = [
        'test-user', '2025-07-20', 0, 0, 0, 0, false, 0, 0, 0, 4, 0, false, 'None', 0, 'None', false, 'None', '0', 0, 0, 'not_applicable', 0, '', '', '', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    console.log('📝 Testing INSERT with 47 columns (including timestamps)...');
    const result = await client.query(testQuery, testValues);
    console.log('✅ INSERT successful! Entry ID:', result.rows[0].entry_id);

  } catch (error) {
    console.error('❌ INSERT failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
};

testFixedInsert(); 