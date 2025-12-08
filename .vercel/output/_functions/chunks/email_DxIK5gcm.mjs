import { Resend } from 'resend';
import { f as getEntryCounts } from './database_BNLmaEc3.mjs';

const getApiKey = () => {
  const apiKey2 = "re_ePUTbcbq_5b1dd7QtbCveaNUGLQYvJiNp";
  if (!apiKey2.startsWith("re_")) {
    console.error('❌ RESEND_API_KEY appears to be invalid (should start with "re_")');
    console.error("   Current key format:", apiKey2.substring(0, 10) + "...");
    return null;
  }
  console.log("✅ Resend API key validated successfully");
  return apiKey2;
};
const apiKey = getApiKey();
const resend = apiKey ? new Resend(apiKey) : null;
const getAdminEmails = () => {
  const emails = [
    "julianhardee@times10.net",
    "admin2@yourdomain.com",
    "admin3@yourdomain.com",
    "admin4@yourdomain.com"
  ].filter((email) => email && email.trim() !== "");
  if (emails.length === 0) {
    console.error("❌ No admin emails configured");
    console.error("   Please set ADMIN_EMAIL_1, ADMIN_EMAIL_2, etc. in your .env file");
  } else {
    console.log(`✅ Found ${emails.length} admin emails configured:`, emails);
  }
  return emails;
};
const ADMIN_EMAILS = getAdminEmails();
function createAdminEmailTemplate(submission, totalEntries, playerCount, nonPlayerCount) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        New Form Submission
      </h2>
      
      <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
        A new form submission has been received.
      </p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Submission Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Alternative Contact Name:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.alternative_contact_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Alternative Contact Phone:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.alternative_contact_phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Alternative Contact Email:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.alternative_contact_email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Address:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.address}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Top Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.top_size}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Bottom Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.bottom_size}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Jacket/Hoodie Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.jacket_size}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Tight Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.tight_size}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Shoe Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.shoe_size}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #666; font-size: 12px;">
          <strong>Total Entries:</strong> ${totalEntries} ( Player: ${playerCount} Non-Player: ${nonPlayerCount} )<br>
          <strong>Submitted:</strong> ${new Date(submission.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  `;
}
const getSenderEmail = () => {
  const fromEmail = "noreply@times10.net";
  if (fromEmail.includes("yourdomain.com") || fromEmail.includes("example.com")) {
    console.warn("⚠️  Using Resend test domain (onboarding@resend.dev) because FROM_EMAIL uses placeholder domain");
    return "onboarding@resend.dev";
  }
  return fromEmail;
};
async function sendEmailWithRetry(resend2, emailParams, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await resend2.emails.send(emailParams);
      if (result.error) {
        if (result.error.statusCode === 429) {
          const retryDelay = Math.min(1e3 * Math.pow(2, attempt), 5e3);
          console.log(`⏳ Rate limit hit, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
        return { success: false, error: result.error };
      }
      if (result.data) {
        return { success: true };
      }
      return { success: false, error: "Unexpected response format" };
    } catch (emailError) {
      if (emailError?.statusCode === 429 || emailError?.message?.includes("rate limit")) {
        const retryDelay = Math.min(1e3 * Math.pow(2, attempt), 5e3);
        console.log(`⏳ Rate limit hit, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }
      return { success: false, error: emailError };
    }
  }
  return { success: false, error: "Max retries exceeded" };
}
async function sendAdminNotification(submission) {
  try {
    if (!resend) {
      console.error("Resend is not properly configured. Check RESEND_API_KEY environment variable.");
      return;
    }
    if (ADMIN_EMAILS.length === 0) {
      console.error("No admin emails configured. Check ADMIN_EMAIL_1, ADMIN_EMAIL_2, ADMIN_EMAIL_3, ADMIN_EMAIL_4 environment variables.");
      return;
    }
    console.log(`Attempting to send admin notifications for submission ${submission.id} to ${ADMIN_EMAILS.length} admins`);
    const entryCounts = await getEntryCounts();
    const emailHtml = createAdminEmailTemplate(submission, entryCounts.total, entryCounts.player, entryCounts.nonPlayer);
    const senderEmail = getSenderEmail();
    const senderName = "Homegrown";
    let successCount = 0;
    let failureCount = 0;
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 200));
    for (let i = 0; i < ADMIN_EMAILS.length; i++) {
      const adminEmail = ADMIN_EMAILS[i];
      const result = await sendEmailWithRetry(resend, {
        from: `${senderName} <${senderEmail}>`,
        to: [adminEmail],
        subject: `New Player Submission - ${submission.name}`,
        html: emailHtml
      });
      if (result.success) {
        console.log(`✅ Admin notification sent successfully to ${adminEmail}`);
        successCount++;
      } else {
        console.error(`❌ Failed to send admin notification to ${adminEmail}:`, result.error);
        failureCount++;
      }
      if (i < ADMIN_EMAILS.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
    if (successCount > 0 && failureCount === 0) {
      console.log(`✅ Admin notification sent successfully to all ${successCount} admins for submission ${submission.id}`);
    } else if (successCount > 0 && failureCount > 0) {
      console.warn(`⚠️  Admin notification sent to ${successCount} admins, but ${failureCount} failed for submission ${submission.id}`);
    } else {
      console.error(`❌ Failed to send admin notification to any admins for submission ${submission.id}`);
    }
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
  }
}
function createNonPlayerAdminEmailTemplate(submission, totalEntries, playerCount, nonPlayerCount) {
  const additionalTicketsList = submission.additional_tickets.length > 0 ? submission.additional_tickets.map(
    (ticket, index) => `<li style="margin-bottom: 10px;">
          <strong>${ticket.name}</strong><br>
          Email: ${ticket.email}<br>
          Phone: ${ticket.phone}
        </li>`
  ).join("") : "<li>None</li>";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        New Non-Player RSVP
      </h2>
      
      <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
        A new RSVP has been received from a non-player.
      </p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">RSVP Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Number of Tickets:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.ticket_count}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; vertical-align: top;"><strong>Additional Tickets:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
              <ul style="margin: 0; padding-left: 20px;">
                ${additionalTicketsList}
              </ul>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #666; font-size: 12px;">
          <strong>Total Entries:</strong> ${totalEntries} ( Player: ${playerCount} Non-Player: ${nonPlayerCount} )<br>
          <strong>Submitted:</strong> ${new Date(submission.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  `;
}
async function sendNonPlayerAdminNotification(submission) {
  try {
    if (!resend) {
      console.error("Resend is not properly configured. Check RESEND_API_KEY environment variable.");
      return;
    }
    if (ADMIN_EMAILS.length === 0) {
      console.error("No admin emails configured. Check ADMIN_EMAIL_1, ADMIN_EMAIL_2, ADMIN_EMAIL_3, ADMIN_EMAIL_4 environment variables.");
      return;
    }
    console.log(`Attempting to send admin notifications for non-player submission ${submission.id} to ${ADMIN_EMAILS.length} admins`);
    const entryCounts = await getEntryCounts();
    const emailHtml = createNonPlayerAdminEmailTemplate(submission, entryCounts.total, entryCounts.player, entryCounts.nonPlayer);
    const senderEmail = getSenderEmail();
    const senderName = "Homegrown";
    let successCount = 0;
    let failureCount = 0;
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 200));
    for (let i = 0; i < ADMIN_EMAILS.length; i++) {
      const adminEmail = ADMIN_EMAILS[i];
      const result = await sendEmailWithRetry(resend, {
        from: `${senderName} <${senderEmail}>`,
        to: [adminEmail],
        subject: `New Non-Player RSVP - ${submission.name} (${submission.ticket_count} ticket${submission.ticket_count > 1 ? "s" : ""})`,
        html: emailHtml
      });
      if (result.success) {
        console.log(`✅ Admin notification sent successfully to ${adminEmail}`);
        successCount++;
      } else {
        console.error(`❌ Failed to send admin notification to ${adminEmail}:`, result.error);
        failureCount++;
      }
      if (i < ADMIN_EMAILS.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
    if (successCount > 0 && failureCount === 0) {
      console.log(`✅ Admin notification sent successfully to all ${successCount} admins for non-player submission ${submission.id}`);
    } else if (successCount > 0 && failureCount > 0) {
      console.warn(`⚠️  Admin notification sent to ${successCount} admins, but ${failureCount} failed for non-player submission ${submission.id}`);
    } else {
      console.error(`❌ Failed to send admin notification to any admins for non-player submission ${submission.id}`);
    }
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
  }
}

export { sendAdminNotification as a, sendNonPlayerAdminNotification as s };
