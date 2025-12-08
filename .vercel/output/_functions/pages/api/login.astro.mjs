import { v as verifyAdminCredentials, g as generateSessionToken, s as setSessionCookie } from '../../chunks/auth_Cnl4rBo8.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    const { username, password } = data;
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const isProd = true;
    const adminUsername = "times10";
    const hasAdminPassword = true;
    if (isProd) {
      console.log("[LOGIN] Production login attempt:", {
        usernameProvided: !!username,
        passwordProvided: !!password,
        adminUsernameConfigured: !!adminUsername,
        adminPasswordConfigured: hasAdminPassword,
        userAgent: request.headers.get("user-agent"),
        origin: request.headers.get("origin")
      });
    }
    const isValid = await verifyAdminCredentials(username, password);
    if (!isValid) {
      if (isProd) {
        console.error("[LOGIN] Authentication failed:", {
          usernameMatch: username === adminUsername,
          credentialsConfigured: !!(adminUsername && hasAdminPassword)
        });
      }
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const token = generateSessionToken();
    setSessionCookie(cookies, token);
    if (isProd) {
      console.log("[LOGIN] Successful login, cookie set:", {
        cookieName: "admin_session",
        secure: true,
        sameSite: "lax"
      });
    }
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("[LOGIN] Login error:", error);
    console.error("[LOGIN] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        ...false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
