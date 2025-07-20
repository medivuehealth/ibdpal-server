const { Client } = require('pg');

// Neon database connection string
const DATABASE_URL = 'postgresql://neondb_owner:npg_ILP7Oz0VhYKj@ep-lucky-wildflower-ae5uww1l-pooler.c-2.us-east-2.aws.neon.tech/medivue?sslmode=require&channel_binding=require';

const fixSequence = async () => {
  console.log('🔧 Checking and fixing entry_id sequence...');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database');

    // Check current sequence value
    const sequenceQuery = `SELECT last_value FROM journal_entries_entry_id_seq;`;
    const sequenceResult = await client.query(sequenceQuery);
    console.log('📊 Current sequence value:', sequenceResult.rows[0].last_value);

    // Check max entry_id in table
    const maxIdQuery = `SELECT MAX(entry_id) as max_id FROM journal_entries;`;
    const maxIdResult = await client.query(maxIdQuery);
    const maxId = maxIdResult.rows[0].max_id || 0;
    console.log('📊 Max entry_id in table:', maxId);

    // Fix sequence if needed
    if (sequenceResult.rows[0].last_value <= maxId) {
      console.log('🔧 Fixing sequence...');
      const fixQuery = `SELECT setval('journal_entries_entry_id_seq', ${maxId + 1}, true);`;
      await client.query(fixQuery);
      console.log('✅ Sequence fixed to:', maxId + 1);
    } else {
      console.log('✅ Sequence is already correct');
    }

    // Test a new insert
    console.log('🧪 Testing new insert...');
    const testQuery = `
        INSERT INTO journal_entries (
            user_id, entry_date, breakfast, breakfast_calories
        )
        VALUES ($1, $2, $3, $4)
        RETURNING entry_id;
    `;
    
    const testValues = ['test-sequence-fix', '2025-07-23', 'Test breakfast', 300];
    const result = await client.query(testQuery, testValues);
    console.log('✅ Test insert successful! Entry ID:', result.rows[0].entry_id);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
};

fixSequence(); 