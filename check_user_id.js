const { Client } = require('pg');

// Neon database connection string
const DATABASE_URL = 'postgresql://neondb_owner:npg_ILP7Oz0VhYKj@ep-lucky-wildflower-ae5uww1l-pooler.c-2.us-east-2.aws.neon.tech/medivue?sslmode=require&channel_binding=require';

const checkUserId = async () => {
  console.log('🔍 Checking user_id for aryan.skumar17@gmail.com...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database');

    // Find user by email
    const userQuery = `SELECT user_id, email, username FROM users WHERE email = 'aryan.skumar17@gmail.com';`;
    const userResult = await client.query(userQuery);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('✅ User found:');
      console.log('   User ID:', user.user_id);
      console.log('   Email:', user.email);
      console.log('   Username:', user.username);
      
      // Test journal entry creation with this user_id
      console.log('\n🧪 Testing journal entry creation...');
      const testQuery = `
          INSERT INTO journal_entries (
              user_id, entry_date, breakfast, breakfast_calories
          )
          VALUES ($1, $2, $3, $4)
          RETURNING entry_id;
      `;
      
      const testValues = [user.user_id, '2025-07-23', 'Test breakfast', 300];
      const result = await client.query(testQuery, testValues);
      console.log('✅ Test insert successful! Entry ID:', result.rows[0].entry_id);
      
    } else {
      console.log('❌ User not found with email: aryan.skumar17@gmail.com');
      
      // List all users
      const allUsersQuery = `SELECT user_id, email, username FROM users LIMIT 10;`;
      const allUsersResult = await client.query(allUsersQuery);
      console.log('\n📋 Available users:');
      allUsersResult.rows.forEach(user => {
        console.log(`   ${user.user_id} - ${user.email} (${user.username})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
};

checkUserId(); 