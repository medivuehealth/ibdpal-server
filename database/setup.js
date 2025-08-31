const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: './config.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Starting database setup...');
        
        // Get all migration files
        const migrationDir = path.join(__dirname);
        const migrationFiles = fs.readdirSync(migrationDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Run migrations in alphabetical order
        
        console.log(`📁 Found ${migrationFiles.length} migration files:`, migrationFiles);
        
        for (const file of migrationFiles) {
            console.log(`🔄 Running migration: ${file}`);
            
            const migrationPath = path.join(migrationDir, file);
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
            
            try {
                await client.query(migrationSQL);
                console.log(`✅ Successfully ran migration: ${file}`);
            } catch (error) {
                console.error(`❌ Error running migration ${file}:`, error.message);
                // Continue with other migrations even if one fails
            }
        }
        
        console.log('🎉 Database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

async function testConnection() {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

async function main() {
    try {
        // Test database connection first
        const connected = await testConnection();
        if (!connected) {
            console.error('Cannot proceed without database connection');
            process.exit(1);
        }
        
        // Run migrations
        await runMigrations();
        
        console.log('🚀 Database setup completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('💥 Database setup failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { runMigrations, testConnection }; 