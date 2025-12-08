import { r as requireAuth } from '../../../../chunks/auth_Cnl4rBo8.mjs';
import { i as initializeDatabase, g as getAllSubmissions } from '../../../../chunks/database_BNLmaEc3.mjs';
export { renderers } from '../../../../renderers.mjs';

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
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Alternative Contact Name",
      "Alternative Contact Phone",
      "Alternative Contact Email",
      "Address",
      "Top Size",
      "Bottom Size",
      "Jacket Size",
      "Tight Size",
      "Shoe Size",
      "Checked In",
      "Created At"
    ];
    const rows = submissions.map((sub) => [
      sub.id,
      sub.name,
      sub.email,
      sub.phone,
      sub.alternative_contact_name,
      sub.alternative_contact_phone,
      sub.alternative_contact_email,
      sub.address,
      sub.top_size,
      sub.bottom_size,
      sub.jacket_size,
      sub.tight_size,
      sub.shoe_size,
      sub.checked_in ? "Yes" : "No",
      sub.created_at
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="entries-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Error exporting entries:", error);
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
