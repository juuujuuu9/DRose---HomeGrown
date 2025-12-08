import { i as initializeDatabase, e as createSubmission } from '../../chunks/database_BNLmaEc3.mjs';
import { a as sendAdminNotification } from '../../chunks/email_DxIK5gcm.mjs';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    await initializeDatabase();
    const data = await request.json();
    console.log("Received form data:", JSON.stringify(data, null, 2));
    const requiredFields = [
      "name",
      "email",
      "phone",
      "alternative_contact_name",
      "alternative_contact_phone",
      "alternative_contact_email",
      "address",
      "top_size",
      "bottom_size",
      "jacket_size",
      "tight_size",
      "shoe_size"
    ];
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
    const submission = await createSubmission({
      name: data.name,
      email: data.email,
      phone: data.phone,
      alternative_contact_name: data.alternative_contact_name,
      alternative_contact_phone: data.alternative_contact_phone,
      alternative_contact_email: data.alternative_contact_email,
      address: data.address,
      top_size: data.top_size,
      bottom_size: data.bottom_size,
      jacket_size: data.jacket_size,
      tight_size: data.tight_size,
      shoe_size: data.shoe_size
    });
    console.log("New submission:", submission);
    await sendAdminNotification(submission);
    return new Response(JSON.stringify({ success: true, id: submission.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error processing signup:", error);
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
