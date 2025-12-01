import { Resend } from 'resend';
import type { Submission, NonPlayerSubmission } from './database';
import { getTotalEntriesCount } from './database';

// Get API key with better error handling
const getApiKey = () => {
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not set in environment variables');
    console.error('   Please set RESEND_API_KEY in your .env file or Vercel dashboard');
    return null;
  }
  if (!apiKey.startsWith('re_')) {
    console.error('❌ RESEND_API_KEY appears to be invalid (should start with "re_")');
    console.error('   Current key format:', apiKey.substring(0, 10) + '...');
    return null;
  }
  console.log('✅ Resend API key validated successfully');
  return apiKey;
};

// Initialize Resend with API key
const apiKey = getApiKey();
const resend = apiKey ? new Resend(apiKey) : null;

// Admin email addresses from environment variables
const getAdminEmails = () => {
  const emails = [
    import.meta.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL_1,
    import.meta.env.ADMIN_EMAIL_2 || process.env.ADMIN_EMAIL_2,
    import.meta.env.ADMIN_EMAIL_3 || process.env.ADMIN_EMAIL_3,
    import.meta.env.ADMIN_EMAIL_4 || process.env.ADMIN_EMAIL_4
  ].filter(email => email && email.trim() !== '');
  
  if (emails.length === 0) {
    console.error('❌ No admin emails configured');
    console.error('   Please set ADMIN_EMAIL_1, ADMIN_EMAIL_2, etc. in your .env file');
  } else {
    console.log(`✅ Found ${emails.length} admin emails configured:`, emails);
  }
  return emails;
};

const ADMIN_EMAILS = getAdminEmails();

// Email template for admin notifications
function createAdminEmailTemplate(submission: Submission, totalEntries: number): string {
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
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Alternative Contact:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.alternative_contact_name}</td>
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
          <strong>Total Entries:</strong> ${totalEntries}<br>
          <strong>Submitted:</strong> ${new Date(submission.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  `;
}

// Send email notification to all admins
export async function sendAdminNotification(submission: Submission): Promise<void> {
  try {
    if (!resend) {
      console.error('Resend is not properly configured. Check RESEND_API_KEY environment variable.');
      return;
    }
    
    if (ADMIN_EMAILS.length === 0) {
      console.error('No admin emails configured. Check ADMIN_EMAIL_1, ADMIN_EMAIL_2, ADMIN_EMAIL_3, ADMIN_EMAIL_4 environment variables.');
      return;
    }
    
    console.log(`Attempting to send admin notifications for submission ${submission.id} to ${ADMIN_EMAILS.length} admins`);
    
    const totalEntries = await getTotalEntriesCount();
    const emailHtml = createAdminEmailTemplate(submission, totalEntries);
    
    // Send email to all admin addresses with rate limiting
    for (let i = 0; i < ADMIN_EMAILS.length; i++) {
      const adminEmail = ADMIN_EMAILS[i];
      try {
        const result = await resend.emails.send({
          from: `${import.meta.env.FROM_NAME || 'Your Company'} <${import.meta.env.FROM_EMAIL || 'noreply@yourdomain.com'}>`,
          to: [adminEmail],
          subject: `New Form Submission - ${submission.name}`,
          html: emailHtml,
        });
        console.log(`Admin notification sent successfully to ${adminEmail}:`, result);
        
        // Add delay between emails to respect rate limits
        if (i < ADMIN_EMAILS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay
        }
      } catch (emailError) {
        console.error(`Failed to send admin notification to ${adminEmail}:`, emailError);
      }
    }
    console.log(`✅ Admin notification sent successfully to ${ADMIN_EMAILS.length} admins for submission ${submission.id}`);
    
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
  }
}

// Email template for non-player admin notifications
function createNonPlayerAdminEmailTemplate(submission: NonPlayerSubmission, totalEntries: number): string {
  const additionalTicketsList = submission.additional_tickets.length > 0
    ? submission.additional_tickets.map((name, index) => `<li>${name}</li>`).join('')
    : '<li>None</li>';
  
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
          <strong>Total Entries:</strong> ${totalEntries}<br>
          <strong>Submitted:</strong> ${new Date(submission.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  `;
}

// Send email notification to all admins for non-player submissions
export async function sendNonPlayerAdminNotification(submission: NonPlayerSubmission): Promise<void> {
  try {
    if (!resend) {
      console.error('Resend is not properly configured. Check RESEND_API_KEY environment variable.');
      return;
    }
    
    if (ADMIN_EMAILS.length === 0) {
      console.error('No admin emails configured. Check ADMIN_EMAIL_1, ADMIN_EMAIL_2, ADMIN_EMAIL_3, ADMIN_EMAIL_4 environment variables.');
      return;
    }
    
    console.log(`Attempting to send admin notifications for non-player submission ${submission.id} to ${ADMIN_EMAILS.length} admins`);
    
    const totalEntries = await getTotalEntriesCount();
    const emailHtml = createNonPlayerAdminEmailTemplate(submission, totalEntries);
    
    // Send email to all admin addresses with rate limiting
    for (let i = 0; i < ADMIN_EMAILS.length; i++) {
      const adminEmail = ADMIN_EMAILS[i];
      try {
        const result = await resend.emails.send({
          from: `${import.meta.env.FROM_NAME || 'Your Company'} <${import.meta.env.FROM_EMAIL || 'noreply@yourdomain.com'}>`,
          to: [adminEmail],
          subject: `New Non-Player RSVP - ${submission.name} (${submission.ticket_count} ticket${submission.ticket_count > 1 ? 's' : ''})`,
          html: emailHtml,
        });
        console.log(`Admin notification sent successfully to ${adminEmail}:`, result);
        
        // Add delay between emails to respect rate limits
        if (i < ADMIN_EMAILS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay
        }
      } catch (emailError) {
        console.error(`Failed to send admin notification to ${adminEmail}:`, emailError);
      }
    }
    console.log(`✅ Admin notification sent successfully to ${ADMIN_EMAILS.length} admins for non-player submission ${submission.id}`);
    
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
  }
}