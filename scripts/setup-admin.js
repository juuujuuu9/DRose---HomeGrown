#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { config } from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}

// Generate secure random credentials
const generateSecurePassword = (length = 16) => {
  return randomBytes(length).toString('base64').slice(0, length);
};

// Use command line arguments first, then environment variables, then defaults
const username = process.argv[2] || process.env.ADMIN_USERNAME || 'admin';
const password = process.argv[3] || process.env.ADMIN_PASSWORD || generateSecurePassword(16);

console.log('🔐 Setting up admin credentials...\n');

// Database connection
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

const envExamplePath = join(process.cwd(), 'env.example');

let envContent = '';

// Read existing .env file or create from template
if (existsSync(envPath)) {
  console.log('📝 Found existing .env file');
  envContent = readFileSync(envPath, 'utf-8');
} else if (existsSync(envExamplePath)) {
  console.log('📝 Creating .env from env.example template');
  envContent = readFileSync(envExamplePath, 'utf-8');
} else {
  console.log('⚠️  No .env or env.example found. Creating new .env file...');
  envContent = `# Environment variables for Landing Page Template

# Admin credentials
ADMIN_USERNAME=${username}
ADMIN_PASSWORD=${password}

# Session secret (change this in production - use a strong random string)
SESSION_SECRET=change-this-in-production-use-a-strong-random-string

# Resend email service configuration
RESEND_API_KEY=re_1234567890abcdef

# Database configuration (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Site configuration
SITE_URL=https://your-domain.vercel.app

# Admin email addresses (update these with your actual admin emails)
ADMIN_EMAIL_1=admin1@yourdomain.com
ADMIN_EMAIL_2=admin2@yourdomain.com
ADMIN_EMAIL_3=admin3@yourdomain.com
ADMIN_EMAIL_4=admin4@yourdomain.com

# Email configuration
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Company Name
`;
}

// Update or add ADMIN_USERNAME
if (envContent.includes('ADMIN_USERNAME=')) {
  envContent = envContent.replace(/ADMIN_USERNAME=.*/g, `ADMIN_USERNAME=${username}`);
  console.log(`✅ Updated ADMIN_USERNAME to: ${username}`);
} else {
  envContent = `ADMIN_USERNAME=${username}\n${envContent}`;
  console.log(`✅ Added ADMIN_USERNAME: ${username}`);
}

// Update or add ADMIN_PASSWORD
if (envContent.includes('ADMIN_PASSWORD=')) {
  envContent = envContent.replace(/ADMIN_PASSWORD=.*/g, `ADMIN_PASSWORD=${password}`);
  console.log(`✅ Updated ADMIN_PASSWORD`);
} else {
  envContent = `ADMIN_PASSWORD=${password}\n${envContent}`;
  console.log(`✅ Added ADMIN_PASSWORD`);
}

// Write the updated .env file
writeFileSync(envPath, envContent, 'utf-8');

// Add admin to database
async function addAdminToDatabase() {
  const client = await pool.connect();
  try {
    // Initialize admin table
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

    // Insert or update admin
    const result = await client.query(`
      INSERT INTO admins (username, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id, username, created_at
    `, [username, passwordHash]);

    console.log('\n✅ Admin added to database successfully!');
    console.log(`   Admin ID: ${result.rows[0].id}`);
    console.log(`   Username: ${result.rows[0].username}`);
    console.log(`   Created: ${result.rows[0].created_at}`);
  } catch (error) {
    console.error('❌ Error adding admin to database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the database setup
addAdminToDatabase()
  .then(() => {
    console.log('\n✅ Admin credentials configured successfully!');
    console.log(`\n📋 Login credentials:`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Important:');
    console.log('   - Admin is stored in the database (password is hashed)');
    console.log('   - Make sure to set other environment variables in .env');
    console.log('   - For production (Vercel), set DATABASE_URL in your Vercel dashboard');
    console.log('   - Never commit .env file to version control');
    console.log('\n🚀 You can now log in at /login with these credentials');
  })
  .catch((error) => {
    console.error('❌ Failed to set up admin:', error);
    process.exit(1);
  });

