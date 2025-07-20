const { Client } = require('pg');

// Neon database connection string
const DATABASE_URL = 'postgresql://neondb_owner:npg_ILP7Oz0VhYKj@ep-lucky-wildflower-ae5uww1l-pooler.c-2.us-east-2.aws.neon.tech/medivue?sslmode=require&channel_binding=require';

const testParameterCount = async () => {
  console.log('🧪 Testing parameter count in INSERT statement...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database');

    // Test the exact INSERT statement from the server
    const testQuery = `
        INSERT INTO journal_entries (
            entry_id, user_id, entry_date, calories, protein, carbs, fiber,
            has_allergens, meals_per_day, hydration_level, bowel_frequency,
            bristol_scale, urgency_level, blood_present, pain_location,
            pain_severity, pain_time, medication_taken, medication_type,
            dosage_level, sleep_hours, stress_level, fatigue_level, notes,
            created_at, menstruation, breakfast, lunch, dinner, snacks,
            updated_at, breakfast_calories, breakfast_protein, breakfast_carbs, breakfast_fiber, breakfast_fat,
            lunch_calories, lunch_protein, lunch_carbs, lunch_fiber, lunch_fat,
            dinner_calories, dinner_protein, dinner_carbs, dinner_fiber, dinner_fat,
            snack_calories, snack_protein, snack_carbs, snack_fiber, snack_fat
        )
        VALUES (
            DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, DEFAULT, $25, $26, $27, $28, $29,
            DEFAULT, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49
        )
        RETURNING entry_id;
    `;

    // Count the parameters
    const parameterMatches = testQuery.match(/\$(\d+)/g);
    const maxParameter = Math.max(...parameterMatches.map(match => parseInt(match.substring(1))));
    console.log(`📊 Parameter count: ${maxParameter}`);
    console.log(`📋 Parameters found: ${parameterMatches.join(', ')}`);

    // Create test values array
    const testValues = Array.from({length: maxParameter}, (_, i) => {
      if (i === 0) return 'test-user'; // user_id
      if (i === 1) return '2025-07-20'; // entry_date
      if (i >= 2 && i <= 5) return 0; // calories, protein, carbs, fiber
      if (i === 6) return false; // has_allergens
      if (i >= 7 && i <= 10) return 0; // meals_per_day, hydration_level, bowel_frequency
      if (i === 11) return 4; // bristol_scale
      if (i === 12) return 0; // urgency_level
      if (i === 13) return false; // blood_present
      if (i === 14) return 'None'; // pain_location
      if (i === 15) return 0; // pain_severity
      if (i === 16) return 'None'; // pain_time
      if (i === 17) return false; // medication_taken
      if (i === 18) return 'None'; // medication_type
      if (i === 19) return '0'; // dosage_level
      if (i >= 20 && i <= 22) return 0; // sleep_hours, stress_level, fatigue_level
      if (i === 23) return ''; // notes
      if (i === 24) return 'not_applicable'; // menstruation
      if (i >= 25 && i <= 28) return ''; // breakfast, lunch, dinner, snacks
      if (i >= 29 && i <= 48) return 0; // all nutrition values
      return 0; // default
    });

    console.log(`📝 Testing INSERT with ${maxParameter} parameters...`);
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

testParameterCount(); 