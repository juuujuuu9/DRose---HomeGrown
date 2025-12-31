#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const username = 'derrick';
const password = 'monaco64mo';

console.log('🔐 Setting up admin credentials...\n');

const envPath = join(process.cwd(), '.env');
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

console.log('\n✅ Admin credentials configured successfully!');
console.log(`\n📋 Login credentials:`);
console.log(`   Username: ${username}`);
console.log(`   Password: ${password}`);
console.log('\n⚠️  Important:');
console.log('   - Make sure to set other environment variables in .env');
console.log('   - For production (Vercel), set these in your Vercel dashboard');
console.log('   - Never commit .env file to version control');
console.log('\n🚀 You can now log in at /login with these credentials');

