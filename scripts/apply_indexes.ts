
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load Env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const firstEquals = line.indexOf('=');
        if (firstEquals !== -1) {
            const key = line.substring(0, firstEquals).trim();
            const value = line.substring(firstEquals + 1).trim();
            if (key && !key.startsWith('#')) {
                process.env[key] = value.replace(/^["']|["']$/g, '');
            }
        }
    });
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MIGRATION_FILE = path.join(process.cwd(), 'supabase/migrations/20260113_add_performance_indexes.sql');

async function main() {
    console.log('Applying Migration:', MIGRATION_FILE);
    const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');


    // Connect using pg
    // We need the database connection string. Usually it's in .env as DATABASE_URL or we construct it.
    // Supabase URL: https://[project].supabase.co
    // Postgres URL: postgres://postgres:[password]@db.[project].supabase.co:5432/postgres

    // Check for DATABASE_URL first
    let dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        // Try to construct from SUPABASE_URL if possible, but PASSWORD is key.
        // If we don't have DATABASE_URL, check for SUPABASE_DB_PASSWORD and construct it.
        const dbPassword = process.env.SUPABASE_DB_PASSWORD;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (dbPassword && supabaseUrl) {
            const projectId = supabaseUrl.split('.')[0].replace('https://', '');
            dbUrl = `postgres://postgres:${dbPassword}@db.${projectId}.supabase.co:5432/postgres`;
        }
    }

    if (!dbUrl) {
        console.error('Error: DATABASE_URL or SUPABASE_DB_PASSWORD not found in .env.local');
        console.error('Please add DATABASE_URL="postgres://postgres:[password]@db.[project].supabase.co:5432/postgres" to .env.local');
        process.exit(1);
    }

    const { Client } = require('pg');
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false } // Supabase requires SSL
    });

    try {
        await client.connect();
        console.log('Connected to Database.');
        await client.query(sql);
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

main();
