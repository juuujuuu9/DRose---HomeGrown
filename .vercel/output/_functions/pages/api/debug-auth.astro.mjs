export { renderers } from '../../renderers.mjs';

const GET = async () => {
  const isProd = true;
  const adminUsername = "times10";
  const hasAdminPassword = true;
  const hasSessionSecret = true;
  const sessionSecretDefault = false;
  return new Response(
    JSON.stringify({
      environment: "production" ,
      configuration: {
        adminUsernameConfigured: true,
        adminPasswordConfigured: hasAdminPassword,
        sessionSecretConfigured: hasSessionSecret,
        sessionSecretIsDefault: sessionSecretDefault,
        // Don't expose actual values for security
        adminUsernameLength: adminUsername?.length || 0,
        adminPasswordLength: "***" 
      },
      cookieSettings: {
        secure: isProd,
        sameSite: "lax" ,
        httpOnly: true,
        maxAge: "7 days"
      },
      recommendations: [
        ...[],
        ...[],
        ...[],
        ...[]
      ]
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
