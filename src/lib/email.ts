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
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Jersey size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.top_size}</td>
          </tr>
          ${submission.jersey_number ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Jersey # (0-99):</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.jersey_number}</td>
          </tr>
          ` : ''}
          ${submission.preferred_jersey_number ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Preferred jersey #:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.preferred_jersey_number}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Shorts size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.bottom_size}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Jacket/Hoodie Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.jacket_size}</td>
          </tr>
          ${submission.sports_bra_size ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Sports Bra Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.sports_bra_size}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Tight Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.tight_size}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Shoe size (mens):</strong></td>
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

// Helper function to send email with retry logic for rate limits
async function sendEmailWithRetry(
  resend: Resend,
  emailParams: { from: string; to: string[]; subject: string; html: string },
  maxRetries: number = 3
): Promise<{ success: boolean; error?: any }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await resend.emails.send(emailParams);
      
      if (result.error) {
        // Log detailed error information
        try {
          console.error(`❌ Resend API error:`, {
            statusCode: result.error.statusCode,
            message: result.error.message,
            name: result.error.name,
            error: JSON.stringify(result.error, null, 2)
          });
        } catch (e) {
          console.error(`❌ Resend API error (could not serialize):`, {
            statusCode: result.error.statusCode,
            message: result.error.message,
            name: result.error.name,
            toString: String(result.error)
          });
        }
        
        // Check if it's a rate limit error (429)
        if (result.error.statusCode === 429) {
          const retryDelay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
          console.log(`⏳ Rate limit hit, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue; // Retry
        }
        // Other errors, return failure
        return { success: false, error: result.error };
      }
      
      if (result.data) {
        return { success: true };
      }
      
      return { success: false, error: 'Unexpected response format' };
    } catch (emailError: any) {
      // Log detailed error information
      try {
        console.error(`❌ Exception sending email:`, {
          message: emailError?.message,
          stack: emailError?.stack,
          statusCode: emailError?.statusCode,
          error: JSON.stringify(emailError, Object.getOwnPropertyNames(emailError || {}), 2)
        });
      } catch (e) {
        console.error(`❌ Exception sending email (could not serialize):`, {
          message: emailError?.message,
          stack: emailError?.stack,
          statusCode: emailError?.statusCode,
          toString: String(emailError)
        });
      }
      
      // Check if it's a rate limit error
      if (emailError?.statusCode === 429 || emailError?.message?.includes('rate limit')) {
        const retryDelay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`⏳ Rate limit hit, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue; // Retry
      }
      // Other errors, return failure
      return { success: false, error: emailError };
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}

// Send email notification to all admins
export async function sendAdminNotification(submission: Submission): Promise<void> {
  try {
    // Re-check configuration at runtime (important for serverless environments)
    const runtimeApiKey = getApiKey();
    const runtimeResend = runtimeApiKey ? new Resend(runtimeApiKey) : null;
    const runtimeAdminEmails = getAdminEmails();
    
    if (!runtimeResend) {
      console.error('❌ Resend is not properly configured. Check RESEND_API_KEY environment variable.');
      console.error('   Environment check:', {
        hasImportMetaEnv: typeof import.meta !== 'undefined' && !!import.meta.env?.RESEND_API_KEY,
        hasProcessEnv: !!process.env.RESEND_API_KEY,
        apiKeyPrefix: runtimeApiKey ? runtimeApiKey.substring(0, 10) + '...' : 'null'
      });
      return;
    }
    
    if (runtimeAdminEmails.length === 0) {
      console.error('❌ No admin emails configured. Check ADMIN_EMAIL_1, ADMIN_EMAIL_2, ADMIN_EMAIL_3, ADMIN_EMAIL_4 environment variables.');
      console.error('   Environment check:', {
        email1: import.meta.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL_1 || 'not set',
        email2: import.meta.env.ADMIN_EMAIL_2 || process.env.ADMIN_EMAIL_2 || 'not set',
        email3: import.meta.env.ADMIN_EMAIL_3 || process.env.ADMIN_EMAIL_3 || 'not set',
        email4: import.meta.env.ADMIN_EMAIL_4 || process.env.ADMIN_EMAIL_4 || 'not set'
      });
      return;
    }
    
    console.log(`📧 Attempting to send admin notifications for submission ${submission.id} to ${runtimeAdminEmails.length} admins`);
    console.log(`   Admin emails: ${runtimeAdminEmails.join(', ')}`);
    
    const entryCounts = await getEntryCounts();
    const emailHtml = createAdminEmailTemplate(submission, entryCounts.total, entryCounts.player, entryCounts.nonPlayer);
    const senderEmail = getSenderEmail();
    const senderName = import.meta.env.FROM_NAME || process.env.FROM_NAME || 'Your Company';
    
    console.log(`   Sender: ${senderName} <${senderEmail}>`);
    
    let successCount = 0;
    let failureCount = 0;
    
    // Add initial delay to stagger concurrent requests
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
    
    // Send email to all admin addresses with rate limiting
    for (let i = 0; i < runtimeAdminEmails.length; i++) {
      const adminEmail = runtimeAdminEmails[i];
      
      console.log(`   Sending email ${i + 1}/${runtimeAdminEmails.length} to ${adminEmail}...`);
      
      const result = await sendEmailWithRetry(runtimeResend, {
        from: `${senderName} <${senderEmail}>`,
        to: [adminEmail],
        subject: `New Player Submission - ${submission.name}`,
        html: emailHtml,
      });
      
      if (result.success) {
        console.log(`✅ Admin notification sent successfully to ${adminEmail}`);
        successCount++;
      } else {
        console.error(`❌ Failed to send admin notification to ${adminEmail}`);
        try {
          console.error(`   Error details:`, JSON.stringify(result.error, Object.getOwnPropertyNames(result.error || {}), 2));
        } catch (e) {
          console.error(`   Error details (could not serialize):`, String(result.error));
        }
        failureCount++;
      }
      
      // Add delay between emails to respect rate limits (600ms = 1.67 req/s, well under 2 req/s)
      if (i < runtimeAdminEmails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
    
    // Log summary
    if (successCount > 0 && failureCount === 0) {
      console.log(`✅ Admin notification sent successfully to all ${successCount} admins for submission ${submission.id}`);
    } else if (successCount > 0 && failureCount > 0) {
      console.warn(`⚠️  Admin notification sent to ${successCount} admins, but ${failureCount} failed for submission ${submission.id}`);
    } else {
      console.error(`❌ Failed to send admin notification to any admins for submission ${submission.id}`);
      console.error(`   Check Resend API key, admin email configuration, and sender email domain verification`);
    }
    
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    try {
      console.error('   Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error || {}), 2));
    } catch (e) {
      console.error('   Error details (could not serialize):', String(error));
    }
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

// Email template for player confirmation
function createPlayerConfirmationTemplate(submission: Submission): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #ce1141; padding-bottom: 10px;">
        RSVP Confirmed - Homegrown at Simeon
      </h2>
      
      <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
        Hi ${submission.name},
      </p>
      
      <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
        Thank you for your RSVP! We're excited to have you join us for the Homegrown at Simeon event.
      </p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Your RSVP Details</h3>
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
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Address:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.address}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; vertical-align: top;"><strong>Alternative Contact:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
              ${submission.alternative_contact_name}<br>
              ${submission.alternative_contact_phone}<br>
              ${submission.alternative_contact_email}
            </td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Apparel Sizes</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Jersey Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.top_size}</td>
          </tr>
          ${submission.jersey_number ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Jersey # (0-99):</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.jersey_number}</td>
          </tr>
          ` : ''}
          ${submission.preferred_jersey_number ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Preferred Jersey #:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.preferred_jersey_number}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Shorts Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.bottom_size}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Jacket/Hoodie Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.jacket_size}</td>
          </tr>
          ${submission.sports_bra_size ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Sports Bra Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.sports_bra_size}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Tight Size:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.tight_size}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Shoe Size (mens):</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${submission.shoe_size}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 20px;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>What's Next?</strong><br>
          You'll receive additional details about the event as we get closer to the date. If you have any questions, please reach out to the contact information provided on the event page.
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        Looking forward to seeing you there!<br>
        <strong>The Homegrown Team</strong>
      </p>
    </div>
  `;
}

// Send confirmation email to player
export async function sendPlayerConfirmation(submission: Submission): Promise<void> {
  try {
    // Re-check configuration at runtime (important for serverless environments)
    const runtimeApiKey = getApiKey();
    const runtimeResend = runtimeApiKey ? new Resend(runtimeApiKey) : null;
    
    if (!runtimeResend) {
      console.error('❌ Resend is not properly configured. Cannot send player confirmation email.');
      return;
    }
    
    console.log(`📧 Attempting to send confirmation email to player: ${submission.email}`);
    
    const emailHtml = createPlayerConfirmationTemplate(submission);
    const senderEmail = getSenderEmail();
    const senderName = import.meta.env.FROM_NAME || process.env.FROM_NAME || 'Homegrown at Simeon';
    
    console.log(`   Sender: ${senderName} <${senderEmail}>`);
    console.log(`   Recipient: ${submission.email}`);
    
    const result = await sendEmailWithRetry(runtimeResend, {
      from: `${senderName} <${senderEmail}>`,
      to: [submission.email],
      subject: `RSVP Confirmed - Homegrown at Simeon`,
      html: emailHtml,
    });
    
    if (result.success) {
      console.log(`✅ Player confirmation email sent successfully to ${submission.email}`);
    } else {
      console.error(`❌ Failed to send player confirmation email to ${submission.email}`);
      try {
        console.error(`   Error details:`, JSON.stringify(result.error, Object.getOwnPropertyNames(result.error || {}), 2));
      } catch (e) {
        console.error(`   Error details (could not serialize):`, String(result.error));
      }
    }
    
  } catch (error) {
    console.error('❌ Error sending player confirmation email:', error);
    try {
      console.error('   Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error || {}), 2));
    } catch (e) {
      console.error('   Error details (could not serialize):', String(error));
    }
  }
}

// Send email notification to all admins for non-player submissions
export async function sendNonPlayerAdminNotification(submission: NonPlayerSubmission): Promise<void> {
  try {
    // Re-check configuration at runtime (important for serverless environments)
    const runtimeApiKey = getApiKey();
    const runtimeResend = runtimeApiKey ? new Resend(runtimeApiKey) : null;
    const runtimeAdminEmails = getAdminEmails();
    
    if (!runtimeResend) {
      console.error('❌ Resend is not properly configured. Check RESEND_API_KEY environment variable.');
      console.error('   Environment check:', {
        hasImportMetaEnv: typeof import.meta !== 'undefined' && !!import.meta.env?.RESEND_API_KEY,
        hasProcessEnv: !!process.env.RESEND_API_KEY,
        apiKeyPrefix: runtimeApiKey ? runtimeApiKey.substring(0, 10) + '...' : 'null'
      });
      return;
    }
    
    if (runtimeAdminEmails.length === 0) {
      console.error('❌ No admin emails configured. Check ADMIN_EMAIL_1, ADMIN_EMAIL_2, ADMIN_EMAIL_3, ADMIN_EMAIL_4 environment variables.');
      console.error('   Environment check:', {
        email1: import.meta.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL_1 || 'not set',
        email2: import.meta.env.ADMIN_EMAIL_2 || process.env.ADMIN_EMAIL_2 || 'not set',
        email3: import.meta.env.ADMIN_EMAIL_3 || process.env.ADMIN_EMAIL_3 || 'not set',
        email4: import.meta.env.ADMIN_EMAIL_4 || process.env.ADMIN_EMAIL_4 || 'not set'
      });
      return;
    }
    
    console.log(`📧 Attempting to send admin notifications for non-player submission ${submission.id} to ${runtimeAdminEmails.length} admins`);
    console.log(`   Admin emails: ${runtimeAdminEmails.join(', ')}`);
    
    const entryCounts = await getEntryCounts();
    const emailHtml = createNonPlayerAdminEmailTemplate(submission, entryCounts.total, entryCounts.player, entryCounts.nonPlayer);
    const senderEmail = getSenderEmail();
    const senderName = import.meta.env.FROM_NAME || process.env.FROM_NAME || 'Your Company';
    
    console.log(`   Sender: ${senderName} <${senderEmail}>`);
    
    let successCount = 0;
    let failureCount = 0;
    
    // Add initial delay to stagger concurrent requests
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
    
    // Send email to all admin addresses with rate limiting
    for (let i = 0; i < runtimeAdminEmails.length; i++) {
      const adminEmail = runtimeAdminEmails[i];
      
      console.log(`   Sending email ${i + 1}/${runtimeAdminEmails.length} to ${adminEmail}...`);
      
      const result = await sendEmailWithRetry(runtimeResend, {
        from: `${senderName} <${senderEmail}>`,
        to: [adminEmail],
        subject: `New Non-Player RSVP - ${submission.name} (${submission.ticket_count} ticket${submission.ticket_count > 1 ? 's' : ''})`,
        html: emailHtml,
      });
      
      if (result.success) {
        console.log(`✅ Admin notification sent successfully to ${adminEmail}`);
        successCount++;
      } else {
        console.error(`❌ Failed to send admin notification to ${adminEmail}`);
        try {
          console.error(`   Error details:`, JSON.stringify(result.error, Object.getOwnPropertyNames(result.error || {}), 2));
        } catch (e) {
          console.error(`   Error details (could not serialize):`, String(result.error));
        }
        failureCount++;
      }
      
      // Add delay between emails to respect rate limits (600ms = 1.67 req/s, well under 2 req/s)
      if (i < runtimeAdminEmails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
    
    // Log summary
    if (successCount > 0 && failureCount === 0) {
      console.log(`✅ Admin notification sent successfully to all ${successCount} admins for non-player submission ${submission.id}`);
    } else if (successCount > 0 && failureCount > 0) {
      console.warn(`⚠️  Admin notification sent to ${successCount} admins, but ${failureCount} failed for non-player submission ${submission.id}`);
    } else {
      console.error(`❌ Failed to send admin notification to any admins for non-player submission ${submission.id}`);
      console.error(`   Check Resend API key, admin email configuration, and sender email domain verification`);
    }
    
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    try {
      console.error('   Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error || {}), 2));
    } catch (e) {
      console.error('   Error details (could not serialize):', String(error));
    }
  }
}