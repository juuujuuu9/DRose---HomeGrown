import { a as initializeNonPlayerDatabase, c as createNonPlayerSubmission } from '../../chunks/database_D9X_F_qv.mjs';
import { s as sendNonPlayerAdminNotification } from '../../chunks/email_Cd9S3RoE.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    await initializeNonPlayerDatabase();
    const data = await request.json();
    console.log("Received non-player form data:", JSON.stringify(data, null, 2));
    const requiredFields = ["name", "email", "phone", "ticket_count"];
    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({
        error: "Missing required fields",
        missing: missingFields
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const ticketCount = parseInt(data.ticket_count);
    if (isNaN(ticketCount) || ticketCount < 1 || ticketCount > 5) {
      return new Response(JSON.stringify({
        error: "Invalid ticket count. Must be between 1 and 5."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const additionalTickets = data.additional_tickets || [];
    if (ticketCount > 1) {
      if (additionalTickets.length !== ticketCount - 1) {
        return new Response(JSON.stringify({
          error: `Please provide information for all ${ticketCount - 1} additional ticket(s).`
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      for (let i = 0; i < additionalTickets.length; i++) {
        const ticket = additionalTickets[i];
        if (!ticket.name || !ticket.email || !ticket.phone) {
          return new Response(JSON.stringify({
            error: `Please provide name, email, and phone for additional ticket ${i + 1}.`
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(ticket.email)) {
          return new Response(JSON.stringify({
            error: `Please provide a valid email address for additional ticket ${i + 1}.`
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
    const submission = await createNonPlayerSubmission({
      name: data.name,
      email: data.email,
      phone: data.phone,
      ticket_count: ticketCount,
      additional_tickets: additionalTickets
    });
    console.log("New non-player submission:", submission);
    await sendNonPlayerAdminNotification(submission);
    return new Response(JSON.stringify({ success: true, id: submission.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error processing non-player signup:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: errorMessage
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
