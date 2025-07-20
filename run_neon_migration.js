const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Neon database connection string
const DATABASE_URL = 'postgresql://neondb_owner:npg_ILP7Oz0VhYKj@ep-lucky-wildflower-ae5uww1l-pooler.c-2.us-east-2.aws.neon.tech/medivue?sslmode=require&channel_binding=require';

const runNeonMigration = async () => {
  console.log('🚀 Starting Neon database migration for meal nutrition columns...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database');

    // Run the migration to add meal nutrition columns
    const migrationPath = path.join(__dirname, '..', 'IBDPal', 'database', 'migration_add_meal_nutrition.sql');
    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      console.log('📝 Adding meal nutrition columns to existing journal_entries table...');
      await client.query(migrationSQL);
      
      console.log('✅ Migration completed successfully!');
      console.log('📊 Added individual meal nutrition columns to journal_entries table');
      console.log('🔍 Added performance indexes for meal queries');
      
      // Verify the migration
      const verifyQuery = `
        SELECT column_name, data_type, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name LIKE '%_calories' 
        ORDER BY column_name;
      `;
      
      const verifyResult = await client.query(verifyQuery);
      console.log('📋 Verification - Added columns:');
      verifyResult.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} (default: ${row.column_default})`);
      });
      
      // Also check for other important columns
      const checkColumnsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name IN ('breakfast', 'lunch', 'dinner', 'snacks', 'medication_type', 'dosage_level', 'pain_location', 'pain_time')
        ORDER BY column_name;
      `;
      
      const checkResult = await client.query(checkColumnsQuery);
      console.log('📋 Important columns check:');
      checkResult.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
      
    } else {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
};

runNeonMigration(); 