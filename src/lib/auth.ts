import type { Cookies } from 'astro';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_SECRET = import.meta.env.SESSION_SECRET || process.env.SESSION_SECRET || 'change-this-in-production';

// Simple session token generation (using timestamp + secret hash)
export function generateSessionToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return Buffer.from(`${timestamp}-${random}-${SESSION_SECRET}`).toString('base64');
}

// Set session cookie
export function setSessionCookie(cookies: Cookies, token: string): void {
  cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Get session token from cookie
export function getSessionToken(cookies: Cookies): string | null {
  return cookies.get(SESSION_COOKIE_NAME)?.value || null;
}

// Clear session cookie
export function clearSessionCookie(cookies: Cookies): void {
  cookies.delete(SESSION_COOKIE_NAME, {
    path: '/',
  });
}

// Verify admin credentials
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const adminUsername = import.meta.env.ADMIN_USERNAME || process.env.ADMIN_USERNAME;
  const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error('Admin credentials not configured');
    return false;
  }

  if (username !== adminUsername) {
    return false;
  }

  // Simple direct comparison since password is stored in environment variable
  // In production with a database, you'd hash passwords and use bcrypt.compare()
  return password === adminPassword;
}

// Check if user is authenticated
export function isAuthenticated(cookies: Cookies): boolean {
  const token = getSessionToken(cookies);
  return token !== null;
}

// Require authentication middleware
export function requireAuth(cookies: Cookies): boolean {
  if (!isAuthenticated(cookies)) {
    return false;
  }
  return true;
}

