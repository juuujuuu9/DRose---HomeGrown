import type { Cookies } from 'astro';
import { getAdminByUsername } from './database';
import bcrypt from 'bcryptjs';

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
  const isProd = import.meta.env.PROD;
  
  cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd, // Only use secure cookies in production (HTTPS required)
    sameSite: isProd ? 'lax' : 'strict', // 'lax' works better for cross-origin scenarios in production
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    // Don't set domain - let browser use default (current domain)
  });
}

// Get session token from cookie
export function getSessionToken(cookies: Cookies): string | null {
  return cookies.get(SESSION_COOKIE_NAME)?.value || null;
}

// Clear session cookie
export function clearSessionCookie(cookies: Cookies): void {
  const isProd = import.meta.env.PROD;
  
  cookies.delete(SESSION_COOKIE_NAME, {
    path: '/',
    secure: isProd,
    sameSite: isProd ? 'lax' : 'strict',
  });
}

// Verify admin credentials
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  try {
    // First, try to find admin in database
    const admin = await getAdminByUsername(username);
    
    if (admin) {
      // Admin exists in database, verify password hash
      const bcryptModule = await import('bcryptjs');
      const isValid = await bcryptModule.default.compare(password, admin.password_hash);
      
      if (!isValid) {
        console.log('[AUTH] Password mismatch for database admin');
      }
      
      return isValid;
    }
    
    // Fallback to environment variables for backward compatibility
    const adminUsername = import.meta.env.ADMIN_USERNAME || process.env.ADMIN_USERNAME;
    const adminPassword = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

    if (adminUsername && adminPassword) {
      if (username !== adminUsername) {
        console.log('[AUTH] Username mismatch:', {
          provided: username,
          expected: adminUsername,
          match: false,
        });
        return false;
      }

      const passwordMatch = password === adminPassword;
      
      if (!passwordMatch) {
        console.log('[AUTH] Password mismatch for env admin');
      }
      
      return passwordMatch;
    }

    console.error('[AUTH] Admin credentials not found in database or environment variables');
    return false;
  } catch (error) {
    console.error('[AUTH] Error verifying credentials:', error);
    return false;
  }
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

