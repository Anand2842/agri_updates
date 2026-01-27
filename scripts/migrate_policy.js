require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function migrate() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const query = `
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS policy_rules JSONB DEFAULT NULL;
    `;

        await client.query(query);
        console.log('Migration successful: policy_rules column added');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
