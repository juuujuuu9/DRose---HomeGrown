import { r as requireAuth } from '../../../../chunks/auth_Cnl4rBo8.mjs';
import { u as updateCheckInStatus, d as deleteSubmission } from '../../../../chunks/database_BNLmaEc3.mjs';
export { renderers } from '../../../../renderers.mjs';

const PATCH = async ({ params, cookies, request }) => {
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
    const id = params.id;
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Entry ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const body = await request.json();
    const { checked_in } = body;
    if (typeof checked_in !== "boolean") {
      return new Response(
        JSON.stringify({ error: "checked_in must be a boolean" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const success = await updateCheckInStatus(id, checked_in);
    if (!success) {
      return new Response(
        JSON.stringify({ error: "Entry not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error updating entry:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const DELETE = async ({ params, cookies }) => {
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
    const id = params.id;
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Entry ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const success = await deleteSubmission(id);
    if (!success) {
      return new Response(
        JSON.stringify({ error: "Entry not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error deleting entry:", error);
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
  DELETE,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
