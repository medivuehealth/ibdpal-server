require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkMealEntries() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Checking meal entries for aryan.skumar17@gmail.com in last 7 days...\n');
        
        // First, get the user_id for this email
        const userQuery = `
            SELECT user_id, username, email 
            FROM users 
            WHERE email = $1
        `;
        
        const userResult = await client.query(userQuery, ['aryan.skumar17@gmail.com']);
        
        if (userResult.rows.length === 0) {
            console.log('❌ User not found: aryan.skumar17@gmail.com');
            return;
        }
        
        const user = userResult.rows[0];
        console.log(`✅ Found user: ${user.username} (ID: ${user.user_id})`);
        
        // Check for journal entries in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const entriesQuery = `
            SELECT 
                entry_id,
                entry_date,
                breakfast,
                breakfast_calories,
                breakfast_protein,
                breakfast_carbs,
                breakfast_fiber,
                breakfast_fat,
                lunch,
                lunch_calories,
                lunch_protein,
                lunch_carbs,
                lunch_fiber,
                lunch_fat,
                dinner,
                dinner_calories,
                dinner_protein,
                dinner_carbs,
                dinner_fiber,
                dinner_fat,
                snacks,
                snack_calories,
                snack_protein,
                snack_carbs,
                snack_fiber,
                snack_fat,
                notes,
                created_at
            FROM journal_entries 
            WHERE user_id = $1 
            AND entry_date >= $2
            ORDER BY entry_date DESC
        `;
        
        const entriesResult = await client.query(entriesQuery, [user.user_id, sevenDaysAgo.toISOString().split('T')[0]]);
        
        console.log(`\n📊 Found ${entriesResult.rows.length} journal entries in last 7 days:`);
        
        if (entriesResult.rows.length === 0) {
            console.log('❌ No journal entries found in the last 7 days');
        } else {
            entriesResult.rows.forEach((entry, index) => {
                console.log(`\n--- Entry ${index + 1} (${entry.entry_date}) ---`);
                console.log(`Entry ID: ${entry.entry_id}`);
                console.log(`Created: ${entry.created_at}`);
                
                // Check each meal type
                const meals = [];
                if (entry.breakfast) {
                    meals.push(`Breakfast: ${entry.breakfast} (${entry.breakfast_calories || 0} cal)`);
                }
                if (entry.lunch) {
                    meals.push(`Lunch: ${entry.lunch} (${entry.lunch_calories || 0} cal)`);
                }
                if (entry.dinner) {
                    meals.push(`Dinner: ${entry.dinner} (${entry.dinner_calories || 0} cal)`);
                }
                if (entry.snacks) {
                    meals.push(`Snacks: ${entry.snacks} (${entry.snack_calories || 0} cal)`);
                }
                
                if (meals.length > 0) {
                    meals.forEach(meal => console.log(`  ✅ ${meal}`));
                } else {
                    console.log('  ❌ No meals recorded');
                }
                
                if (entry.notes) {
                    console.log(`  📝 Notes: ${entry.notes}`);
                }
            });
        }
        
        // Also check for any entries in the last 30 days to see if there's a pattern
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentQuery = `
            SELECT COUNT(*) as total_entries,
                   COUNT(CASE WHEN breakfast IS NOT NULL AND breakfast != '' THEN 1 END) as breakfast_count,
                   COUNT(CASE WHEN lunch IS NOT NULL AND lunch != '' THEN 1 END) as lunch_count,
                   COUNT(CASE WHEN dinner IS NOT NULL AND dinner != '' THEN 1 END) as dinner_count,
                   COUNT(CASE WHEN snacks IS NOT NULL AND snacks != '' THEN 1 END) as snacks_count
            FROM journal_entries 
            WHERE user_id = $1 
            AND entry_date >= $2
        `;
        
        const recentResult = await client.query(recentQuery, [user.user_id, thirtyDaysAgo.toISOString().split('T')[0]]);
        const stats = recentResult.rows[0];
        
        console.log(`\n📈 Last 30 days summary:`);
        console.log(`  Total entries: ${stats.total_entries}`);
        console.log(`  Entries with breakfast: ${stats.breakfast_count}`);
        console.log(`  Entries with lunch: ${stats.lunch_count}`);
        console.log(`  Entries with dinner: ${stats.dinner_count}`);
        console.log(`  Entries with snacks: ${stats.snacks_count}`);
        
    } catch (error) {
        console.error('❌ Error checking meal entries:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkMealEntries(); 