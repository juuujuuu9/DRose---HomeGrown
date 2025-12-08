import { r as requireAuth } from '../../../chunks/auth_Cnl4rBo8.mjs';
import { i as initializeDatabase, g as getAllSubmissions } from '../../../chunks/database_D9X_F_qv.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ cookies }) => {
  try {
    if (!requireAuth(cookies)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    await initializeDatabase();
    const submissions = await getAllSubmissions();
    return new Response(
      JSON.stringify({ success: true, data: submissions }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error fetching entries:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
