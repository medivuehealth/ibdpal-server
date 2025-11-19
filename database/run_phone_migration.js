const db = require('./db');
const fs = require('fs');
const path = require('path');

async function runPhoneMigration() {
  try {
    console.log('🔍 Checking if phone_number column exists...');
    
    // First, check if the column exists
    const checkResult = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone_number'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ phone_number column already exists in users table');
    } else {
      console.log('📝 phone_number column does not exist. Adding it...');
    }
    
    // Read and run the migration
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migration_add_phone_number.sql'), 
      'utf8'
    );
    
    await db.query(migrationSQL);
    console.log('✅ Migration completed successfully');
    
    // Verify the column exists now
    const verifyResult = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone_number'
    `);
    
    if (verifyResult.rows.length > 0) {
      const column = verifyResult.rows[0];
      console.log('\n📊 Column Details:');
      console.log(`   Column Name: ${column.column_name}`);
      console.log(`   Data Type: ${column.data_type}`);
      console.log(`   Nullable: ${column.is_nullable}`);
    }
    
    // Check if index exists
    const indexResult = await db.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users' AND indexname = 'idx_users_phone_number'
    `);
    
    if (indexResult.rows.length > 0) {
      console.log('✅ Index idx_users_phone_number exists');
    } else {
      console.log('⚠️  Index idx_users_phone_number does not exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

runPhoneMigration();

