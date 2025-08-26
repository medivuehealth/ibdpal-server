const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const runMigration = async () => {
  // Use DATABASE_URL if available, otherwise fall back to individual variables
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/medivue`;
  
  const client = new Client({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'database', 'migration_add_email_verification_simple.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running email verification migration...');
    await client.query(migrationSQL);
    console.log('✅ Email verification migration completed successfully');

    // Verify the migration
    console.log('🔍 Verifying migration...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('email_verified', 'verification_code', 'verification_code_expires', 'verification_attempts', 'last_verification_attempt')
      ORDER BY column_name
    `);

    console.log('📊 Migration verification results:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });

    console.log('🎉 Email verification system is ready!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

runMigration(); 