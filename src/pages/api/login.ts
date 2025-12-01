import type { APIRoute } from 'astro';
import { verifyAdminCredentials, setSessionCookie, generateSessionToken } from '../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    const { username, password } = data;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create session
    const token = generateSessionToken();
    setSessionCookie(cookies, token);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

