import type { APIRoute } from 'astro';
import { verifyAdminCredentials, setSessionCookie, generateSessionToken } from '../../lib/auth';
import { initializeAdminDatabase } from '../../lib/database';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Ensure admin database is initialized
    await initializeAdminDatabase();
    
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

    // Enhanced logging for production debugging
    const isProd = import.meta.env.PROD;
    const adminUsername = import.meta.env.ADMIN_USERNAME || process.env.ADMIN_USERNAME;
    const hasAdminPassword = !!(import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD);
    
    if (isProd) {
      console.log('[LOGIN] Production login attempt:', {
        usernameProvided: !!username,
        passwordProvided: !!password,
        adminUsernameConfigured: !!adminUsername,
        adminPasswordConfigured: hasAdminPassword,
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
      });
    }

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      if (isProd) {
        console.error('[LOGIN] Authentication failed:', {
          usernameMatch: username === adminUsername,
          credentialsConfigured: !!(adminUsername && hasAdminPassword),
        });
      }
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

    if (isProd) {
      console.log('[LOGIN] Successful login, cookie set:', {
        cookieName: 'admin_session',
        secure: import.meta.env.PROD,
        sameSite: 'lax',
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[LOGIN] Login error:', error);
    console.error('[LOGIN] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        ...(import.meta.env.DEV && { details: error instanceof Error ? error.message : String(error) })
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

