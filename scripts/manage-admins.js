#!/usr/bin/env node

import { config } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';
import { Pool } from 'pg';
import { createInterface } from 'readline';

// Load environment variables
const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  console.error('   Please set DATABASE_URL in your .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
});

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function listAdmins() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, username, created_at
      FROM admins
      ORDER BY created_at DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('\n📋 No admins found in database.');
      return;
    }
    
    console.log('\n📋 Admins:');
    console.log('─'.repeat(60));
    result.rows.forEach((admin, index) => {
      console.log(`${index + 1}. ID: ${admin.id} | Username: ${admin.username} | Created: ${admin.created_at}`);
    });
    console.log('─'.repeat(60));
  } catch (error) {
    console.error('❌ Error listing admins:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function addAdmin() {
  const username = await question('\nEnter username: ');
  if (!username.trim()) {
    console.log('❌ Username cannot be empty');
    return;
  }
  
  const password = await question('Enter password: ');
  if (!password.trim()) {
    console.log('❌ Password cannot be empty');
    return;
  }
  
  const client = await pool.connect();
  try {
    // Initialize admin table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Hash password
    const bcryptModule = await import('bcryptjs');
    const passwordHash = await bcryptModule.default.hash(password, 10);

    // Insert admin
    const result = await client.query(`
      INSERT INTO admins (username, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id, username, created_at
    `, [username.trim(), passwordHash]);

    console.log('\n✅ Admin added successfully!');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Username: ${result.rows[0].username}`);
    console.log(`   Created: ${result.rows[0].created_at}`);
  } catch (error) {
    if (error.code === '23505') {
      console.log('✅ Admin updated successfully (username already existed)');
    } else {
      console.error('❌ Error adding admin:', error.message);
    }
  } finally {
    client.release();
  }
}

async function deleteAdmin() {
  await listAdmins();
  
  const idOrUsername = await question('\nEnter admin ID or username to delete: ');
  if (!idOrUsername.trim()) {
    console.log('❌ ID or username cannot be empty');
    return;
  }
  
  const client = await pool.connect();
  try {
    // Try to delete by ID first, then by username
    const isNumeric = /^\d+$/.test(idOrUsername.trim());
    const query = isNumeric
      ? 'DELETE FROM admins WHERE id = $1 RETURNING id, username'
      : 'DELETE FROM admins WHERE username = $1 RETURNING id, username';
    
    const result = await client.query(query, [idOrUsername.trim()]);
    
    if (result.rows.length === 0) {
      console.log('❌ Admin not found');
      return;
    }
    
    console.log('\n✅ Admin deleted successfully!');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Username: ${result.rows[0].username}`);
  } catch (error) {
    console.error('❌ Error deleting admin:', error.message);
  } finally {
    client.release();
  }
}

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'list':
        await listAdmins();
        break;
      case 'add':
        await addAdmin();
        break;
      case 'delete':
        await deleteAdmin();
        break;
      default:
        console.log('\n📋 Admin Management Tool\n');
        console.log('Usage:');
        console.log('  node scripts/manage-admins.js list     - List all admins');
        console.log('  node scripts/manage-admins.js add      - Add a new admin');
        console.log('  node scripts/manage-admins.js delete   - Delete an admin');
        console.log('\nExamples:');
        console.log('  npm run manage-admins list');
        console.log('  npm run manage-admins add');
        console.log('  npm run manage-admins delete');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

main();

