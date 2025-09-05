const fs = require('fs');
const path = require('path');
const db = require('./database/db');

async function runMigration() {
    try {
        console.log('✅ Connected to hosted Neon database');
        console.log('🔄 Running enhanced micronutrient profile table migration...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'database', 'create_micronutrient_profile_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the migration
        await db.query(sql);
        
        console.log('✅ Enhanced micronutrient profile tables created successfully!');
        console.log('📊 Tables created:');
        console.log('   - micronutrient_profiles (basic profile info)');
        console.log('   - micronutrient_lab_results (lab test results)');
        console.log('   - micronutrient_supplements (supplement tracking)');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Error code:', error.code);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runMigration();
