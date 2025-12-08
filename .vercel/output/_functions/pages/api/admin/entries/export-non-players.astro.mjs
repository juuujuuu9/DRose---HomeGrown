import { r as requireAuth } from '../../../../chunks/auth_Cnl4rBo8.mjs';
import { a as getAllNonPlayerSubmissions } from '../../../../chunks/database_BNLmaEc3.mjs';
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
    const submissions = await getAllNonPlayerSubmissions();
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Ticket Count",
      "Additional Tickets",
      "Created At"
    ];
    const rows = submissions.map((sub) => {
      const additionalTicketsStr = Array.isArray(sub.additional_tickets) && sub.additional_tickets.length > 0 ? sub.additional_tickets.map(
        (ticket) => typeof ticket === "string" ? ticket : `${ticket.name} (${ticket.email}, ${ticket.phone})`
      ).join("; ") : "";
      return [
        sub.id,
        sub.name,
        sub.email,
        sub.phone,
        sub.ticket_count,
        additionalTicketsStr,
        sub.created_at
      ];
    });
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="non-players-entries-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Error exporting non-player entries:", error);
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
