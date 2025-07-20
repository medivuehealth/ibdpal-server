const { Client } = require('pg');

// Railway database connection string (this should be the same as Neon)
const DATABASE_URL = 'postgresql://neondb_owner:npg_ILP7Oz0VhYKj@ep-lucky-wildflower-ae5uww1l-pooler.c-2.us-east-2.aws.neon.tech/medivue?sslmode=require&channel_binding=require';

const checkSchema = async () => {
  console.log('🔍 Checking Railway database schema...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Railway database');

    // Check all columns in journal_entries table
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'journal_entries' 
      ORDER BY ordinal_position;
    `;
    
    const columnsResult = await client.query(columnsQuery);
    console.log('📋 All columns in journal_entries table:');
    columnsResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    console.log(`\n📊 Total columns: ${columnsResult.rows.length}`);
    
    // Check specific columns we need
    const neededColumns = [
      'user_id', 'entry_date', 'calories', 'protein', 'carbs', 'fiber',
      'has_allergens', 'meals_per_day', 'hydration_level', 'bowel_frequency',
      'bristol_scale', 'urgency_level', 'blood_present', 'pain_location',
      'pain_severity', 'pain_time', 'medication_taken', 'medication_type',
      'dosage_level', 'sleep_hours', 'stress_level', 'menstruation',
      'fatigue_level', 'notes', 'breakfast', 'lunch', 'dinner', 'snacks',
      'breakfast_calories', 'breakfast_protein', 'breakfast_carbs', 'breakfast_fiber', 'breakfast_fat',
      'lunch_calories', 'lunch_protein', 'lunch_carbs', 'lunch_fiber', 'lunch_fat',
      'dinner_calories', 'dinner_protein', 'dinner_carbs', 'dinner_fiber', 'dinner_fat',
      'snack_calories', 'snack_protein', 'snack_carbs', 'snack_fiber', 'snack_fat'
    ];
    
    console.log('\n🔍 Checking for required columns:');
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    
    neededColumns.forEach(column => {
      const exists = existingColumns.includes(column);
      console.log(`${exists ? '✅' : '❌'} ${column}`);
    });
    
    const missingColumns = neededColumns.filter(column => !existingColumns.includes(column));
    if (missingColumns.length > 0) {
      console.log(`\n❌ Missing columns: ${missingColumns.join(', ')}`);
    } else {
      console.log('\n✅ All required columns exist!');
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
};

checkSchema(); 