const { Client } = require('pg');

// Neon database connection string
const DATABASE_URL = 'postgresql://neondb_owner:npg_ILP7Oz0VhYKj@ep-lucky-wildflower-ae5uww1l-pooler.c-2.us-east-2.aws.neon.tech/medivue?sslmode=require&channel_binding=require';

const testSimpleInsert = async () => {
  console.log('🧪 Testing simple INSERT statement...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database');

    // Test with just the essential columns
    const testQuery = `
        INSERT INTO journal_entries (
            user_id, entry_date, breakfast, breakfast_calories
        )
        VALUES ($1, $2, $3, $4)
        RETURNING entry_id;
    `;

    const testValues = ['test-user', '2025-07-20', 'Test meal', 500];

    console.log('📝 Testing simple INSERT with 4 columns...');
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

testSimpleInsert(); 