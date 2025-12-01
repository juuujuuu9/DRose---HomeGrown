import type { APIRoute } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { getAllSubmissions } from '../../../lib/database';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Check authentication
    if (!requireAuth(cookies)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch all submissions
    const submissions = await getAllSubmissions();

    return new Response(
      JSON.stringify({ success: true, data: submissions }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching entries:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

