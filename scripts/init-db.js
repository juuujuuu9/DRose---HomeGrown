#!/usr/bin/env node
/**
 * Database initialization script
 * 
 * This script initializes the database schema by creating the necessary tables.
 * Run this script after setting up your DATABASE_URL environment variable.
 * 
 * Usage:
 *   npm run init-db
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🚀 Initializing database schema...\n');

  // Check if DATABASE_URL is set
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    console.error('   Please set DATABASE_URL in your .env file');
    process.exit(1);
  }

  console.log('✅ Database connection string found');
  console.log('   Connecting to database...\n');

  // Create connection pool
  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();

  try {
    // Initialize player submissions table
    console.log('📋 Creating submissions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        alternative_contact_name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        top_size VARCHAR(10) NOT NULL,
        bottom_size VARCHAR(10) NOT NULL,
        jacket_size VARCHAR(10) NOT NULL,
        tight_size VARCHAR(10) NOT NULL,
        shoe_size VARCHAR(10) NOT NULL,
        checked_in BOOLEAN DEFAULT FALSE
      )
    `);
    
    // Add checked_in column if it doesn't exist (migration for existing databases)
    console.log('   🔄 Checking for checked_in column...');
    await client.query(`
      ALTER TABLE submissions 
      ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE
    `);
    console.log('   ✅ Submissions table ready\n');

    // Initialize non-player submissions table
    console.log('📋 Creating non_player_submissions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS non_player_submissions (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        ticket_count INTEGER NOT NULL CHECK (ticket_count >= 1 AND ticket_count <= 5),
        additional_tickets JSONB DEFAULT '[]'::jsonb
      )
    `);
    console.log('   ✅ Non-player submissions table ready\n');

    console.log('🎉 Database schema initialized successfully!');
    console.log('\nTables created:');
    console.log('  - submissions');
    console.log('  - non_player_submissions');
    console.log('\n✅ You can now start using the application');

  } catch (error) {
    console.error('\n❌ Error initializing database:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      if (error.stack) {
        console.error('   Stack:', error.stack);
      }
    }
    process.exit(1);
  } finally {
    // Release client and close pool
    client.release();
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

main();

