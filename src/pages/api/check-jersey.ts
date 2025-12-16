import type { APIRoute } from 'astro';
import { isJerseyNumberTaken, initializeDatabase } from '../../lib/database';

export const GET: APIRoute = async ({ url }) => {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    const jerseyNumber = url.searchParams.get('number');
    
    if (!jerseyNumber) {
      return new Response(JSON.stringify({ 
        error: 'Jersey number is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate jersey number format
    const numValue = parseInt(jerseyNumber, 10);
    if (isNaN(numValue) || numValue < 0 || numValue > 99) {
      return new Response(JSON.stringify({ 
        error: 'Invalid jersey number'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Number 25 is reserved/unavailable
    if (numValue === 25) {
      return new Response(JSON.stringify({ 
        taken: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const isTaken = await isJerseyNumberTaken(jerseyNumber);
    
    return new Response(JSON.stringify({ 
      taken: isTaken
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error checking jersey number:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
