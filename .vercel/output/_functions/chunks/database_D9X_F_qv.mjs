import { Pool } from 'pg';

const connectionString = typeof import.meta !== "undefined" && "postgresql://neondb_owner:npg_jXJBUQiLD2C1@ep-polished-scene-ahdjr59v-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in environment variables");
  console.error("   Please set DATABASE_URL in your .env file or Vercel dashboard");
  throw new Error("DATABASE_URL is required");
}
console.log("✅ Database connection string found");
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  // Serverless-optimized settings
  max: 2,
  // Maximum number of clients in the pool (lower for serverless)
  idleTimeoutMillis: 3e4,
  // Close idle clients after 30 seconds
  connectionTimeoutMillis: 1e4
  // Return an error after 10 seconds if connection could not be established
});
async function initializeDatabase() {
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
        bottom_size VARCHAR(10) NOT NULL,
        jacket_size VARCHAR(10) NOT NULL,
        tight_size VARCHAR(10) NOT NULL,
        shoe_size VARCHAR(10) NOT NULL,
        checked_in BOOLEAN DEFAULT FALSE
      )
    `);
    await client.query(`
      ALTER TABLE submissions 
      ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE
    `);
    try {
      await client.query(`
        ALTER TABLE submissions 
        ADD COLUMN IF NOT EXISTS alternative_contact_phone VARCHAR(50)
      `);
    } catch (error) {
      console.log("Column alternative_contact_phone may already exist or error:", error);
    }
    try {
      await client.query(`
        ALTER TABLE submissions 
        ADD COLUMN IF NOT EXISTS alternative_contact_email VARCHAR(255)
      `);
    } catch (error) {
      console.log("Column alternative_contact_email may already exist or error:", error);
    }
    try {
      await client.query(`
        UPDATE submissions 
        SET alternative_contact_phone = '' 
        WHERE alternative_contact_phone IS NULL
      `);
    } catch (error) {
      console.log("Error updating alternative_contact_phone:", error);
    }
    try {
      await client.query(`
        UPDATE submissions 
        SET alternative_contact_email = '' 
        WHERE alternative_contact_email IS NULL
      `);
    } catch (error) {
      console.log("Error updating alternative_contact_email:", error);
    }
    try {
      await client.query(`
        ALTER TABLE submissions 
        ALTER COLUMN alternative_contact_phone SET NOT NULL
      `);
    } catch (error) {
      console.log("Could not set NOT NULL on alternative_contact_phone (may already be set):", error);
    }
    try {
      await client.query(`
        ALTER TABLE submissions 
        ALTER COLUMN alternative_contact_email SET NOT NULL
      `);
    } catch (error) {
      console.log("Could not set NOT NULL on alternative_contact_email (may already be set):", error);
    }
    console.log("Database schema initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
}
async function createSubmission(data) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO submissions (
        name, email, phone, alternative_contact_name, alternative_contact_phone, alternative_contact_email, address,
        top_size, bottom_size, jacket_size, tight_size, shoe_size
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING 
        id::text, created_at::text, name, email, phone,
        alternative_contact_name, alternative_contact_phone, alternative_contact_email, address, top_size, bottom_size,
        jacket_size, tight_size, shoe_size
    `, [
      data.name,
      data.email,
      data.phone,
      data.alternative_contact_name,
      data.alternative_contact_phone,
      data.alternative_contact_email,
      data.address,
      data.top_size,
      data.bottom_size,
      data.jacket_size,
      data.tight_size,
      data.shoe_size
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error creating submission:", error);
    throw error;
  } finally {
    client.release();
  }
}
async function getAllSubmissions() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        id::text, created_at::text, name, email, phone,
        alternative_contact_name, alternative_contact_phone, alternative_contact_email, address, top_size, bottom_size,
        jacket_size, tight_size, shoe_size,
        COALESCE(checked_in, false) as checked_in
      FROM submissions 
      ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  } finally {
    client.release();
  }
}
async function updateCheckInStatus(id, checkedIn) {
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
    console.error("Error updating check-in status:", error);
    throw error;
  } finally {
    client.release();
  }
}
async function deleteSubmission(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      DELETE FROM submissions 
      WHERE id = $1
      RETURNING id
    `, [id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error deleting submission:", error);
    throw error;
  } finally {
    client.release();
  }
}
async function initializeNonPlayerDatabase() {
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
        additional_tickets JSONB DEFAULT '[]'::jsonb
      )
    `);
    console.log("Non-player database schema initialized successfully");
  } catch (error) {
    console.error("Error initializing non-player database:", error);
    throw error;
  } finally {
    client.release();
  }
}
async function createNonPlayerSubmission(data) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO non_player_submissions (
        name, email, phone, ticket_count, additional_tickets
      )
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING 
        id::text, created_at::text, name, email, phone,
        ticket_count, additional_tickets::text
    `, [
      data.name,
      data.email,
      data.phone,
      data.ticket_count,
      JSON.stringify(data.additional_tickets)
    ]);
    const row = result.rows[0];
    return {
      id: row.id,
      created_at: row.created_at,
      name: row.name,
      email: row.email,
      phone: row.phone,
      ticket_count: row.ticket_count,
      additional_tickets: JSON.parse(row.additional_tickets)
    };
  } catch (error) {
    console.error("Error creating non-player submission:", error);
    throw error;
  } finally {
    client.release();
  }
}
async function getAllNonPlayerSubmissions() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        id::text, created_at::text, name, email, phone,
        ticket_count, additional_tickets::text
      FROM non_player_submissions 
      ORDER BY created_at DESC
    `);
    return result.rows.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      name: row.name,
      email: row.email,
      phone: row.phone,
      ticket_count: row.ticket_count,
      additional_tickets: JSON.parse(row.additional_tickets)
    }));
  } catch (error) {
    console.error("Error fetching non-player submissions:", error);
    throw error;
  } finally {
    client.release();
  }
}
async function getEntryCounts() {
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
    console.error("Error counting entries:", error);
    throw error;
  } finally {
    client.release();
  }
}

export { initializeNonPlayerDatabase as a, getAllNonPlayerSubmissions as b, createNonPlayerSubmission as c, deleteSubmission as d, createSubmission as e, getEntryCounts as f, getAllSubmissions as g, initializeDatabase as i, updateCheckInStatus as u };
