const fs = require('fs');
const path = require('path');
const db = require('./database/db');

async function runUpdate() {
    try {
        console.log('✅ Connected to hosted Neon database');
        console.log('🔄 Updating micronutrient schema...');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'database', 'update_micronutrient_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute the update
        await db.query(sql);
        
        console.log('✅ Micronutrient schema updated successfully!');
        console.log('📊 Updates applied:');
        console.log('   - Added is_active column to micronutrient_supplements');
        console.log('   - Created micronutrient_lab_results table');
        console.log('   - Added indexes and triggers');
        
    } catch (error) {
        console.error('❌ Update failed:', error.message);
        console.error('Error code:', error.code);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runUpdate();
