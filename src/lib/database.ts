import { Pool } from 'pg';

// Create a connection pool with validation
// Handle both Astro (import.meta.env) and Node.js (process.env) environments
const connectionString = (typeof import.meta !== 'undefined' && import.meta.env?.DATABASE_URL) || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  console.error('   Please set DATABASE_URL in your .env file or Vercel dashboard');
  throw new Error('DATABASE_URL is required');
}

console.log('✅ Database connection string found');

// Configure pool for serverless environments (Vercel)
// Serverless functions need smaller connection pools and shorter timeouts
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  // Serverless-optimized settings
  max: 2, // Maximum number of clients in the pool (lower for serverless)
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

// Database schema interface
export interface Submission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  alternative_contact_name: string;
  alternative_contact_phone: string;
  alternative_contact_email: string;
  address: string;
  top_size: string;
  jersey_number?: string | null;
  preferred_jersey_number?: string | null;
  bottom_size: string;
  jacket_size: string;
  sports_bra_size?: string | null;
  tight_size: string;
  shoe_size: string;
  checked_in?: boolean;
}

// Non-player submission interface
export interface NonPlayerSubmission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  ticket_count: number;
  additional_tickets: Array<{ name: string; email: string; phone: string }>;
  allow_contact_from_derrick_rose?: boolean;
  checked_in?: boolean;
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
        alternative_contact_phone VARCHAR(50) NOT NULL,
        alternative_contact_email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        top_size VARCHAR(10) NOT NULL,
        jersey_number VARCHAR(3),
        preferred_jersey_number VARCHAR(3),
        bottom_size VARCHAR(10) NOT NULL,
        jacket_size VARCHAR(10) NOT NULL,
        sports_bra_size VARCHAR(10),
        tight_size VARCHAR(10) NOT NULL,
        shoe_size VARCHAR(10) NOT NULL,
        checked_in BOOLEAN DEFAULT FALSE
      )
    `);
    
    // Add checked_in column if it doesn't exist (for existing databases)
    await client.query(`
      ALTER TABLE submissions 
      ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE
    `);

    // Add optional jersey number fields (for existing databases)
    await client.query(`
      ALTER TABLE submissions
      ADD COLUMN IF NOT EXISTS jersey_number VARCHAR(3)
    `);
    await client.query(`
      ALTER TABLE submissions
      ADD COLUMN IF NOT EXISTS preferred_jersey_number VARCHAR(3)
    `);
    
    // Add new alternative contact columns if they don't exist (for existing databases)
    try {
      await client.query(`
        ALTER TABLE submissions 
        ADD COLUMN IF NOT EXISTS alternative_contact_phone VARCHAR(50)
      `);
    } catch (error) {
      console.log('Column alternative_contact_phone may already exist or error:', error);
    }
    
    try {
      await client.query(`
        ALTER TABLE submissions 
        ADD COLUMN IF NOT EXISTS alternative_contact_email VARCHAR(255)
      `);
    } catch (error) {
      console.log('Column alternative_contact_email may already exist or error:', error);
    }
    
    // Update existing rows to have default values for any NULL values
    try {
      await client.query(`
        UPDATE submissions 
        SET alternative_contact_phone = '' 
        WHERE alternative_contact_phone IS NULL
      `);
    } catch (error) {
      console.log('Error updating alternative_contact_phone:', error);
    }
    
    try {
      await client.query(`
        UPDATE submissions 
        SET alternative_contact_email = '' 
        WHERE alternative_contact_email IS NULL
      `);
    } catch (error) {
      console.log('Error updating alternative_contact_email:', error);
    }
    
    // Then add NOT NULL constraint (only if columns exist)
    try {
      await client.query(`
        ALTER TABLE submissions 
        ALTER COLUMN alternative_contact_phone SET NOT NULL
      `);
    } catch (error) {
      console.log('Could not set NOT NULL on alternative_contact_phone (may already be set):', error);
    }
    
    try {
      await client.query(`
        ALTER TABLE submissions 
        ALTER COLUMN alternative_contact_email SET NOT NULL
      `);
    } catch (error) {
      console.log('Could not set NOT NULL on alternative_contact_email (may already be set):', error);
    }
    
    // Add sports_bra_size column if it doesn't exist (for existing databases)
    // This column is optional (nullable)
    await client.query(`
      ALTER TABLE submissions
      ADD COLUMN IF NOT EXISTS sports_bra_size VARCHAR(10)
    `);
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Check if a jersey number is already taken
export async function isJerseyNumberTaken(jerseyNumber: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id FROM submissions 
      WHERE jersey_number = $1
      LIMIT 1
    `, [jerseyNumber]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking jersey number:', error);
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
  alternative_contact_phone: string;
  alternative_contact_email: string;
  address: string;
  top_size: string;
  jersey_number?: string | null;
  preferred_jersey_number?: string | null;
  bottom_size: string;
  jacket_size: string;
  sports_bra_size?: string | null;
  tight_size: string;
  shoe_size: string;
}): Promise<Submission> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO submissions (
        name, email, phone, alternative_contact_name, alternative_contact_phone, alternative_contact_email, address,
        top_size, jersey_number, preferred_jersey_number, bottom_size, jacket_size, sports_bra_size, tight_size, shoe_size
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING 
        id::text, created_at::text, name, email, phone,
        alternative_contact_name, alternative_contact_phone, alternative_contact_email, address,
        top_size, jersey_number, preferred_jersey_number, bottom_size,
        jacket_size, sports_bra_size, tight_size, shoe_size
    `, [
      data.name,
      data.email,
      data.phone,
      data.alternative_contact_name,
      data.alternative_contact_phone,
      data.alternative_contact_email,
      data.address,
      data.top_size,
      data.jersey_number ?? null,
      data.preferred_jersey_number ?? null,
      data.bottom_size,
      data.jacket_size,
      data.sports_bra_size,
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
        alternative_contact_name, alternative_contact_phone, alternative_contact_email, address,
        top_size, jersey_number, preferred_jersey_number, bottom_size,
        jacket_size, sports_bra_size, tight_size, shoe_size,
        COALESCE(checked_in, false) as checked_in
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

// Update check-in status for a submission
export async function updateCheckInStatus(id: string, checkedIn: boolean): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE submissions 
      SET checked_in = $1 
      WHERE id = $2
      RETURNING id
    `, [checkedIn, id]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error updating check-in status:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Update check-in status for a non-player submission
export async function updateNonPlayerCheckInStatus(id: string, checkedIn: boolean): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      UPDATE non_player_submissions 
      SET checked_in = $1 
      WHERE id = $2
      RETURNING id
    `, [checkedIn, id]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error updating non-player check-in status:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Delete a submission
export async function deleteSubmission(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      DELETE FROM submissions 
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting submission:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Initialize non-player database schema
export async function initializeNonPlayerDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS non_player_submissions (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        ticket_count INTEGER NOT NULL CHECK (ticket_count >= 1 AND ticket_count <= 5),
        additional_tickets JSONB DEFAULT '[]'::jsonb,
        allow_contact_from_derrick_rose BOOLEAN DEFAULT false,
        checked_in BOOLEAN DEFAULT FALSE
      )
    `);
    
    // Add columns if they don't exist (for existing databases)
    await client.query(`
      ALTER TABLE non_player_submissions 
      ADD COLUMN IF NOT EXISTS allow_contact_from_derrick_rose BOOLEAN DEFAULT false
    `);
    
    await client.query(`
      ALTER TABLE non_player_submissions 
      ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE
    `);
    
    console.log('Non-player database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing non-player database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Create a new non-player submission
export async function createNonPlayerSubmission(data: {
  name: string;
  email: string;
  phone: string;
  ticket_count: number;
  additional_tickets: Array<{ name: string; email: string; phone: string }>;
  allow_contact_from_derrick_rose?: boolean;
}): Promise<NonPlayerSubmission> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO non_player_submissions (
        name, email, phone, ticket_count, additional_tickets, allow_contact_from_derrick_rose
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6)
      RETURNING 
        id::text, created_at::text, name, email, phone,
        ticket_count, additional_tickets::text, allow_contact_from_derrick_rose
    `, [
      data.name,
      data.email,
      data.phone,
      data.ticket_count,
      JSON.stringify(data.additional_tickets),
      data.allow_contact_from_derrick_rose ?? false
    ]);
    
    const row = result.rows[0];
    return {
      id: row.id,
      created_at: row.created_at,
      name: row.name,
      email: row.email,
      phone: row.phone,
      ticket_count: row.ticket_count,
      additional_tickets: JSON.parse(row.additional_tickets),
      allow_contact_from_derrick_rose: row.allow_contact_from_derrick_rose ?? false
    };
  } catch (error) {
    console.error('Error creating non-player submission:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all non-player submissions
export async function getAllNonPlayerSubmissions(): Promise<NonPlayerSubmission[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        id::text, created_at::text, name, email, phone,
        ticket_count, additional_tickets::text, allow_contact_from_derrick_rose,
        COALESCE(checked_in, false) as checked_in
      FROM non_player_submissions 
      ORDER BY created_at DESC
    `);
    
    return result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at,
      name: row.name,
      email: row.email,
      phone: row.phone,
      ticket_count: row.ticket_count,
      additional_tickets: JSON.parse(row.additional_tickets),
      allow_contact_from_derrick_rose: row.allow_contact_from_derrick_rose ?? false,
      checked_in: row.checked_in ?? false
    }));
  } catch (error) {
    console.error('Error fetching non-player submissions:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get total count of all entries (submissions + non-player submissions)
export async function getTotalEntriesCount(): Promise<number> {
  const client = await pool.connect();
  try {
    const submissionsResult = await client.query(`
      SELECT COUNT(*) as count FROM submissions
    `);
    const nonPlayerResult = await client.query(`
      SELECT COUNT(*) as count FROM non_player_submissions
    `);
    
    const submissionsCount = parseInt(submissionsResult.rows[0].count, 10);
    const nonPlayerCount = parseInt(nonPlayerResult.rows[0].count, 10);
    
    return submissionsCount + nonPlayerCount;
  } catch (error) {
    console.error('Error counting total entries:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get separate counts for players and non-players
export async function getEntryCounts(): Promise<{ player: number; nonPlayer: number; total: number }> {
  const client = await pool.connect();
  try {
    const submissionsResult = await client.query(`
      SELECT COUNT(*) as count FROM submissions
    `);
    const nonPlayerResult = await client.query(`
      SELECT COUNT(*) as count FROM non_player_submissions
    `);
    
    const playerCount = parseInt(submissionsResult.rows[0].count, 10);
    const nonPlayerCount = parseInt(nonPlayerResult.rows[0].count, 10);
    
    return {
      player: playerCount,
      nonPlayer: nonPlayerCount,
      total: playerCount + nonPlayerCount
    };
  } catch (error) {
    console.error('Error counting entries:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Admin interface
export interface Admin {
  id: string;
  username: string;
  created_at: string;
}

// Initialize admin database schema
export async function initializeAdminDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Admin database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing admin database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get admin by username
export async function getAdminByUsername(username: string): Promise<{ id: string; username: string; password_hash: string } | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id::text, username, password_hash
      FROM admins
      WHERE username = $1
      LIMIT 1
    `, [username]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching admin:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Create a new admin
export async function createAdmin(username: string, passwordHash: string): Promise<Admin> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO admins (username, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
      RETURNING id::text, username, created_at::text
    `, [username, passwordHash]);
    
    return {
      id: result.rows[0].id,
      username: result.rows[0].username,
      created_at: result.rows[0].created_at
    };
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all admins (for management)
export async function getAllAdmins(): Promise<Admin[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id::text, username, created_at::text
      FROM admins
      ORDER BY created_at DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Delete an admin
export async function deleteAdmin(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      DELETE FROM admins
      WHERE id = $1
      RETURNING id
    `, [id]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Close the connection pool
export async function closeDatabase(): Promise<void> {
  await pool.end();
}