import type { APIRoute } from 'astro';

/**
 * Debug endpoint to check authentication configuration
 * This helps troubleshoot production login issues without exposing secrets
 */
export const GET: APIRoute = async () => {
  const isProd = import.meta.env.PROD;
  const adminUsername = import.meta.env.ADMIN_USERNAME || process.env.ADMIN_USERNAME;
  const hasAdminPassword = !!(import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD);
  const hasSessionSecret = !!(import.meta.env.SESSION_SECRET || process.env.SESSION_SECRET);
  const sessionSecretDefault = (import.meta.env.SESSION_SECRET || process.env.SESSION_SECRET) === 'change-this-in-production';

  return new Response(
    JSON.stringify({
      environment: isProd ? 'production' : 'development',
      configuration: {
        adminUsernameConfigured: !!adminUsername,
        adminPasswordConfigured: hasAdminPassword,
        sessionSecretConfigured: hasSessionSecret,
        sessionSecretIsDefault: sessionSecretDefault,
        // Don't expose actual values for security
        adminUsernameLength: adminUsername?.length || 0,
        adminPasswordLength: hasAdminPassword ? '***' : 0,
      },
      cookieSettings: {
        secure: isProd,
        sameSite: isProd ? 'lax' : 'strict',
        httpOnly: true,
        maxAge: '7 days',
      },
      recommendations: [
        ...(!adminUsername ? ['ADMIN_USERNAME environment variable is not set'] : []),
        ...(!hasAdminPassword ? ['ADMIN_PASSWORD environment variable is not set'] : []),
        ...(sessionSecretDefault ? ['SESSION_SECRET is using default value - change this in production'] : []),
        ...(isProd && !hasSessionSecret ? ['SESSION_SECRET should be set in production'] : []),
      ],
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

