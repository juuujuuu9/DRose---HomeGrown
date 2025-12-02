import { Resend } from 'resend';
import type { Submission, NonPlayerSubmission } from './database';
import { getTotalEntriesCount, getEntryCounts } from './database';

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
function createAdminEmailTemplate(submission: Submission, totalEntries: number, playerCount: number, nonPlayerCount: number): string {
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

// Get sender email address, using Resend test domain if placeholder is used
const getSenderEmail = (): string => {
  const fromEmail = import.meta.env.FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@yourdomain.com';
  // Use Resend's test domain if placeholder domain is detected
  if (fromEmail.includes('yourdomain.com') || fromEmail.includes('example.com')) {
    console.warn('⚠️  Using Resend test domain (onboarding@resend.dev) because FROM_EMAIL uses placeholder domain');
    return 'onboarding@resend.dev';
  }
  return fromEmail;
};

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
    
    const entryCounts = await getEntryCounts();
    const emailHtml = createAdminEmailTemplate(submission, entryCounts.total, entryCounts.player, entryCounts.nonPlayer);
    const senderEmail = getSenderEmail();
    const senderName = import.meta.env.FROM_NAME || process.env.FROM_NAME || 'Your Company';
    
    let successCount = 0;
    let failureCount = 0;
    
    // Send email to all admin addresses with rate limiting
    for (let i = 0; i < ADMIN_EMAILS.length; i++) {
      const adminEmail = ADMIN_EMAILS[i];
      try {
        const result = await resend.emails.send({
          from: `${senderName} <${senderEmail}>`,
          to: [adminEmail],
          subject: `New Player Submission - ${submission.name}`,
          html: emailHtml,
        });
        
        // Check if Resend returned an error (even if no exception was thrown)
        if (result.error) {
          console.error(`❌ Failed to send admin notification to ${adminEmail}:`, {
            statusCode: result.error.statusCode,
            message: result.error.message,
            name: result.error.name
          });
          failureCount++;
        } else if (result.data) {
          console.log(`✅ Admin notification sent successfully to ${adminEmail} (ID: ${result.data.id})`);
          successCount++;
        } else {
          console.warn(`⚠️  Unexpected response format from Resend for ${adminEmail}:`, result);
          failureCount++;
        }
        
        // Add delay between emails to respect rate limits
        if (i < ADMIN_EMAILS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay
        }
      } catch (emailError) {
        console.error(`❌ Exception sending admin notification to ${adminEmail}:`, emailError);
        failureCount++;
      }
    }
    
    // Log summary
    if (successCount > 0 && failureCount === 0) {
      console.log(`✅ Admin notification sent successfully to all ${successCount} admins for submission ${submission.id}`);
    } else if (successCount > 0 && failureCount > 0) {
      console.warn(`⚠️  Admin notification sent to ${successCount} admins, but ${failureCount} failed for submission ${submission.id}`);
    } else {
      console.error(`❌ Failed to send admin notification to any admins for submission ${submission.id}`);
    }
    
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
  }
}

// Email template for non-player admin notifications
function createNonPlayerAdminEmailTemplate(submission: NonPlayerSubmission, totalEntries: number, playerCount: number, nonPlayerCount: number): string {
  const additionalTicketsList = submission.additional_tickets.length > 0
    ? submission.additional_tickets.map((ticket, index) => 
        `<li style="margin-bottom: 10px;">
          <strong>${ticket.name}</strong><br>
          Email: ${ticket.email}<br>
          Phone: ${ticket.phone}
        </li>`
      ).join('')
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
          <strong>Total Entries:</strong> ${totalEntries} ( Player: ${playerCount} Non-Player: ${nonPlayerCount} )<br>
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
    
    const entryCounts = await getEntryCounts();
    const emailHtml = createNonPlayerAdminEmailTemplate(submission, entryCounts.total, entryCounts.player, entryCounts.nonPlayer);
    const senderEmail = getSenderEmail();
    const senderName = import.meta.env.FROM_NAME || process.env.FROM_NAME || 'Your Company';
    
    let successCount = 0;
    let failureCount = 0;
    
    // Send email to all admin addresses with rate limiting
    for (let i = 0; i < ADMIN_EMAILS.length; i++) {
      const adminEmail = ADMIN_EMAILS[i];
      try {
        const result = await resend.emails.send({
          from: `${senderName} <${senderEmail}>`,
          to: [adminEmail],
          subject: `New Non-Player RSVP - ${submission.name} (${submission.ticket_count} ticket${submission.ticket_count > 1 ? 's' : ''})`,
          html: emailHtml,
        });
        
        // Check if Resend returned an error (even if no exception was thrown)
        if (result.error) {
          console.error(`❌ Failed to send admin notification to ${adminEmail}:`, {
            statusCode: result.error.statusCode,
            message: result.error.message,
            name: result.error.name
          });
          failureCount++;
        } else if (result.data) {
          console.log(`✅ Admin notification sent successfully to ${adminEmail} (ID: ${result.data.id})`);
          successCount++;
        } else {
          console.warn(`⚠️  Unexpected response format from Resend for ${adminEmail}:`, result);
          failureCount++;
        }
        
        // Add delay between emails to respect rate limits
        if (i < ADMIN_EMAILS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay
        }
      } catch (emailError) {
        console.error(`❌ Exception sending admin notification to ${adminEmail}:`, emailError);
        failureCount++;
      }
    }
    
    // Log summary
    if (successCount > 0 && failureCount === 0) {
      console.log(`✅ Admin notification sent successfully to all ${successCount} admins for non-player submission ${submission.id}`);
    } else if (successCount > 0 && failureCount > 0) {
      console.warn(`⚠️  Admin notification sent to ${successCount} admins, but ${failureCount} failed for non-player submission ${submission.id}`);
    } else {
      console.error(`❌ Failed to send admin notification to any admins for non-player submission ${submission.id}`);
    }
    
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
  }
}