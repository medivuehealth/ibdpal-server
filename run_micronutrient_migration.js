const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const runMicronutrientMigration = async () => {
    // Use the same connection string as the main database config
    const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ILP7Oz0VhYKj@ep-lucky-wildflower-ae5uww1l-pooler.c-2.us-east-2.aws.neon.tech/medivue?sslmode=require&channel_binding=require';
    
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to hosted Neon database');

        // Read the micronutrient profile table creation script
        const migrationPath = path.join(__dirname, 'database', 'create_micronutrient_profile_table.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('🔄 Running micronutrient profile table migration...');
        await client.query(migrationSQL);
        console.log('✅ Micronutrient profile tables created successfully');

        // Verify tables were created
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('micronutrient_profiles', 'micronutrient_supplements')
            ORDER BY table_name
        `);

        console.log('📋 Created tables:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        // Check if tables have the expected structure
        const profileColumns = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'micronutrient_profiles'
            ORDER BY ordinal_position
        `);

        console.log('📊 Micronutrient profiles table structure:');
        profileColumns.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Database connection closed');
    }
};

runMicronutrientMigration();
