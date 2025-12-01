import { Pool } from 'pg';

// Create a connection pool with validation
const connectionString = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  console.error('   Please set DATABASE_URL in your .env file or Vercel dashboard');
  throw new Error('DATABASE_URL is required');
}

console.log('✅ Database connection string found');

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Database schema interface
export interface Submission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  alternative_contact_name: string;
  address: string;
  top_size: string;
  bottom_size: string;
  jacket_size: string;
  tight_size: string;
  shoe_size: string;
}

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
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
        shoe_size VARCHAR(10) NOT NULL
      )
    `);
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Create a new submission
export async function createSubmission(data: {
  name: string;
  email: string;
  phone: string;
  alternative_contact_name: string;
  address: string;
  top_size: string;
  bottom_size: string;
  jacket_size: string;
  tight_size: string;
  shoe_size: string;
}): Promise<Submission> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO submissions (
        name, email, phone, alternative_contact_name, address,
        top_size, bottom_size, jacket_size, tight_size, shoe_size
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id::text, created_at::text, name, email, phone,
        alternative_contact_name, address, top_size, bottom_size,
        jacket_size, tight_size, shoe_size
    `, [
      data.name,
      data.email,
      data.phone,
      data.alternative_contact_name,
      data.address,
      data.top_size,
      data.bottom_size,
      data.jacket_size,
      data.tight_size,
      data.shoe_size
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all submissions
export async function getAllSubmissions(): Promise<Submission[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        id::text, created_at::text, name, email, phone,
        alternative_contact_name, address, top_size, bottom_size,
        jacket_size, tight_size, shoe_size
      FROM submissions 
      ORDER BY created_at DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Close the connection pool
export async function closeDatabase(): Promise<void> {
  await pool.end();
}