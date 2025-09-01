const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ILP7Oz0VhYKj@ep-lucky-wildflower-ae5uww1l-pooler.c-2.us-east-2.aws.neon.tech/medivue?sslmode=require&channel_binding=require'
});

async function cleanupSupportOrganizations() {
    const client = await pool.connect();
    
    try {
        console.log('🧹 Starting cleanup of duplicate support organizations...');
        
        // Step 1: Check current count
        const countResult = await client.query('SELECT COUNT(*) FROM ibd_support_organizations');
        console.log(`📊 Current total records: ${countResult.rows[0].count}`);
        
        // Step 2: Find duplicates
        const duplicatesQuery = `
            SELECT name, COUNT(*) as count
            FROM ibd_support_organizations
            GROUP BY name
            HAVING COUNT(*) > 1
            ORDER BY count DESC
        `;
        
        const duplicatesResult = await client.query(duplicatesQuery);
        console.log(`🔍 Found ${duplicatesResult.rows.length} organizations with duplicates:`);
        
        duplicatesResult.rows.forEach(row => {
            console.log(`  - ${row.name}: ${row.count} copies`);
        });
        
        // Step 3: Keep only the first record for each organization
        console.log('\n🗑️ Removing duplicates...');
        
        const cleanupQuery = `
            DELETE FROM ibd_support_organizations
            WHERE id NOT IN (
                SELECT MIN(id)
                FROM ibd_support_organizations
                GROUP BY name
            )
        `;
        
        const deleteResult = await client.query(cleanupQuery);
        console.log(`✅ Removed ${deleteResult.rowCount} duplicate records`);
        
        // Step 4: Check final count
        const finalCountResult = await client.query('SELECT COUNT(*) FROM ibd_support_organizations');
        console.log(`📊 Final total records: ${finalCountResult.rows[0].count}`);
        
        // Step 5: Show remaining organizations
        const remainingQuery = `
            SELECT id, name, city, state, phone, website
            FROM ibd_support_organizations
            ORDER BY name
        `;
        
        const remainingResult = await client.query(remainingQuery);
        console.log('\n📋 Remaining organizations:');
        remainingResult.rows.forEach(row => {
            console.log(`  ${row.id}. ${row.name} (${row.city}, ${row.state})`);
            console.log(`     📞 ${row.phone || 'N/A'} | 🌐 ${row.website || 'N/A'}`);
        });
        
        console.log('\n✅ Cleanup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the cleanup
cleanupSupportOrganizations()
    .then(() => {
        console.log('🎉 Database cleanup finished');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Cleanup failed:', error);
        process.exit(1);
    }); 