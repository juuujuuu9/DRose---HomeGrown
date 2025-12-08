const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
const SESSION_COOKIE_NAME = "admin_session";
const SESSION_SECRET = "change-this-in-production-use-a-strong-random-string";
function generateSessionToken() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return Buffer.from(`${timestamp}-${random}-${SESSION_SECRET}`).toString("base64");
}
function setSessionCookie(cookies, token) {
  const isProd = Object.assign(__vite_import_meta_env__, { ADMIN_USERNAME: "times10", ADMIN_PASSWORD: "chichir4q", SESSION_SECRET: "change-this-in-production-use-a-strong-random-string", USER: process.env.USER, _: process.env._ }).PROD;
  cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    // Only use secure cookies in production (HTTPS required)
    sameSite: isProd ? "lax" : "strict",
    // 'lax' works better for cross-origin scenarios in production
    maxAge: 60 * 60 * 24 * 7,
    // 7 days
    path: "/"
    // Don't set domain - let browser use default (current domain)
  });
}
function getSessionToken(cookies) {
  return cookies.get(SESSION_COOKIE_NAME)?.value || null;
}
function clearSessionCookie(cookies) {
  const isProd = Object.assign(__vite_import_meta_env__, { ADMIN_USERNAME: "times10", ADMIN_PASSWORD: "chichir4q", SESSION_SECRET: "change-this-in-production-use-a-strong-random-string", USER: process.env.USER, _: process.env._ }).PROD;
  cookies.delete(SESSION_COOKIE_NAME, {
    path: "/",
    secure: isProd,
    sameSite: isProd ? "lax" : "strict"
  });
}
async function verifyAdminCredentials(username, password) {
  const adminUsername = "times10";
  const adminPassword = "chichir4q";
  if (username !== adminUsername) {
    console.log("[AUTH] Username mismatch:", {
      provided: username,
      expected: adminUsername,
      match: false
    });
    return false;
  }
  const passwordMatch = password === adminPassword;
  if (!passwordMatch) {
    console.log("[AUTH] Password mismatch");
  }
  return passwordMatch;
}
function isAuthenticated(cookies) {
  const token = getSessionToken(cookies);
  return token !== null;
}
function requireAuth(cookies) {
  if (!isAuthenticated(cookies)) {
    return false;
  }
  return true;
}

export { clearSessionCookie as c, generateSessionToken as g, isAuthenticated as i, requireAuth as r, setSessionCookie as s, verifyAdminCredentials as v };
