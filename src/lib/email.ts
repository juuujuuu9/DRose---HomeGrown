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
// These admins receive ALL notifications (both player and non-player)
const getAllAdminEmails = () => {
  const emails = [
    import.meta.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL_1,
    import.meta.env.ADMIN_EMAIL_2 || process.env.ADMIN_EMAIL_2,
    import.meta.env.ADMIN_EMAIL_3 || process.env.ADMIN_EMAIL_3,
    import.meta.env.ADMIN_EMAIL_4 || process.env.ADMIN_EMAIL_4
  ].filter(email => email && email.trim() !== '');
  
  if (emails.length > 0) {
    console.log(`✅ Found ${emails.length} general admin emails configured:`, emails);
  }
  return emails;
};

// Player-only admin emails - these admins ONLY receive player submission notifications
const getPlayerOnlyAdminEmails = () => {
  const emails = [
    import.meta.env.ADMIN_EMAIL_PLAYER_1 || process.env.ADMIN_EMAIL_PLAYER_1,
    import.meta.env.ADMIN_EMAIL_PLAYER_2 || process.env.ADMIN_EMAIL_PLAYER_2,
    import.meta.env.ADMIN_EMAIL_PLAYER_3 || process.env.ADMIN_EMAIL_PLAYER_3,
    import.meta.env.ADMIN_EMAIL_PLAYER_4 || process.env.ADMIN_EMAIL_PLAYER_4
  ].filter(email => email && email.trim() !== '');
  
  if (emails.length > 0) {
    console.log(`✅ Found ${emails.length} player-only admin emails configured:`, emails);
  }
  return emails;
};

// Non-player-only admin emails - these admins ONLY receive non-player submission notifications
const getNonPlayerOnlyAdminEmails = () => {
  const emails = [
    import.meta.env.ADMIN_EMAIL_NON_PLAYER_1 || process.env.ADMIN_EMAIL_NON_PLAYER_1,
    import.meta.env.ADMIN_EMAIL_NON_PLAYER_2 || process.env.ADMIN_EMAIL_NON_PLAYER_2,
    import.meta.env.ADMIN_EMAIL_NON_PLAYER_3 || process.env.ADMIN_EMAIL_NON_PLAYER_3,
    import.meta.env.ADMIN_EMAIL_NON_PLAYER_4 || process.env.ADMIN_EMAIL_NON_PLAYER_4
  ].filter(email => email && email.trim() !== '');
  
  if (emails.length > 0) {
    console.log(`✅ Found ${emails.length} non-player-only admin emails configured:`, emails);
  }
  return emails;
};

// Get all admin emails for player notifications (general admins + player-only admins)
const getAdminEmailsForPlayers = () => {
  const allAdmins = getAllAdminEmails();
  const playerOnlyAdmins = getPlayerOnlyAdminEmails();
  const combined = [...allAdmins, ...playerOnlyAdmins];
  
  if (combined.length === 0) {
    console.warn('⚠️  No admin emails configured for player notifications');
    console.warn('   Please set ADMIN_EMAIL_1-4 (for all notifications) or ADMIN_EMAIL_PLAYER_1-4 (for player-only)');
  }
  
  return combined;
};

// Get all admin emails for non-player notifications (general admins + non-player-only admins)
const getAdminEmailsForNonPlayers = () => {
  const allAdmins = getAllAdminEmails();
  const nonPlayerOnlyAdmins = getNonPlayerOnlyAdminEmails();
  const combined = [...allAdmins, ...nonPlayerOnlyAdmins];
  
  if (combined.length === 0) {
    console.warn('⚠️  No admin emails configured for non-player notifications');
    console.warn('   Please set ADMIN_EMAIL_1-4 (for all notifications) or ADMIN_EMAIL_NON_PLAYER_1-4 (for non-player-only)');
  }
  
  return combined;
};

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
    const runtimeAdminEmails = getAdminEmailsForPlayers();
    
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
      console.error('❌ No admin emails configured for player notifications.');
      console.error('   Set ADMIN_EMAIL_1-4 (for all notifications) or ADMIN_EMAIL_PLAYER_1-4 (for player-only)');
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
  // Extract first name from full name
  const firstName = submission.name.split(' ')[0];
  
  // Get site URL for logo image - ensure no trailing slash
  const siteUrl = (import.meta.env.SITE_URL || import.meta.env.PUBLIC_SITE_URL || process.env.SITE_URL || '').replace(/\/$/, '');
  
  // Construct logo URL - prefer PNG for better email client compatibility
  // Note: SVG images are not supported by many email clients (Outlook, Gmail, Apple Mail, etc.)
  // Email clients that don't support SVG: Outlook (all versions), Gmail (web), Apple Mail (some versions)
  // File name has a space, so we need to URL encode it as %20
  const logoUrl = siteUrl ? `${siteUrl}/assets/Homegrown%20Cursive.png` : '';
  
  // Log the logo URL for debugging
  if (!siteUrl) {
    console.warn('⚠️  SITE_URL not set - logo image will not display in emails.');
    console.warn('   Please set SITE_URL environment variable in Vercel dashboard to your production domain.');
  } else {
    console.log(`📧 Logo URL for email: ${logoUrl}`);
    console.log(`   Note: If images don't show, ensure "Homegrown Cursive.png" exists in public/assets/`);
    console.log(`   Many email clients block images by default - recipients may need to enable images.`);
  }
  
  return `
    <div style="font-family: 'Roboto', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
      ${logoUrl ? `
      <!-- Logo Header -->
      <div style="text-align: center; padding: 40px 20px 30px 20px; background-color: #ffffff;">
        <img src="${logoUrl}" alt="Homegrown" width="400" height="auto" style="max-width: 400px; width: 100%; height: auto; display: block; margin: 0 auto; border: 0;" />
      </div>
      ` : ''}
      
      <!-- Main Content -->
      <div style="padding: 0 30px 40px 30px; background-color: #ffffff;">
        <!-- Title
        <h1 style="color: #000000; font-size: 28px; font-weight: bold; letter-spacing: 2px; margin: 0 0 32px 0; padding: 0;">
          Your RSVP is confirmed
        </h1> -->
        <!-- Thank You Message -->
        <p style="color: #000000; font-size: 18px; line-height: 28px; margin: 0 0 24px 0;">
          ${firstName},
        </p>
        <p style="color: #000000; font-size: 18px; line-height: 28px; margin: 0 0 24px 0;">
          Thank you for confirming. You're officially locked in for Homegrown at Simeon.
        </p>
        
        <p style="color: #000000; font-size: 18px; line-height: 28px; margin: 0 0 40px 0;">
          We're bringing the city together on the eve of Derrick's jersey retirement to celebrate Chicago basketball and everyone who built it.
        </p>
        
        <!-- Event Details Section -->
        <div style="margin: 40px 0;">
          <h2 style="color: #000000; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 24px 0; padding-bottom: 12px; border-bottom: 2px solid #ce1141;">
            Event Details
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase; width: 40%;">Date:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">January 23, 2026</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Location:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">Simeon Career Academy</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">VIP Happy Hour:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">5:00 PM</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Players to Locker Room:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">6:15 PM</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Warm Up:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">6:30 PM</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Tip Off:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">7:00 PM</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Halftime Ceremony:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">Honoring Derrick's Bulls teammates</td>
            </tr>
          </table>
          <p style="color: #000000; font-size: 16px; margin: 16px 0 0 0;">
            Trainer will be available on site.
          </p>
        </div>
        
        <!-- What You'll Receive Section -->
        <div style="margin: 40px 0;">
          <h2 style="color: #000000; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 24px 0; padding-bottom: 12px; border-bottom: 2px solid #ce1141;">
            What You'll Receive
          </h2>
          <ul style="margin: 0; padding-left: 24px; color: #000000; font-size: 16px; line-height: 28px;">
            <li style="margin-bottom: 12px;">2 tickets to Bulls vs. Celtics</li>
            <li style="margin-bottom: 12px;">5 tickets to the Homegrown game</li>
            <li style="margin-bottom: 12px;">Exclusive merch</li>
            <li style="margin-bottom: 12px;">A one-of-a-kind experience</li>
          </ul>
        </div>
        
        <!-- Hotel Section -->
        <div style="margin: 40px 0; padding: 24px; background-color: #f5f5f5; border-left: 4px solid #ce1141;">
          <p style="color: #000000; font-size: 16px; line-height: 24px; margin: 0 0 12px 0;">
            If you need a hotel, we've arranged a Hoxton discount for the team using code 
            <a href="https://bookings.travelclick.com/106942?userType=GRP#/guestsandrooms" style="color: #ce1141; text-decoration: underline;"><strong>DROSE26</strong></a>.
          </p>
          <p style="color: #000000; font-size: 16px; line-height: 24px; margin: 0;">
            Parking is limited at the venue. Rideshare is strongly encouraged for arrival.
          </p>
        </div>
        
        <!-- Submission Details Section -->
        <div style="margin: 40px 0;">
          <h2 style="color: #000000; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 24px 0; padding-bottom: 12px; border-bottom: 2px solid #ce1141;">
            Submission Details
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase; width: 40%;">Jersey size:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">${submission.top_size}</td>
            </tr>
            ${submission.jersey_number ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Jersey # (0-99):</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">${submission.jersey_number}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Shorts size:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">${submission.bottom_size}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Jacket/Hoodie Size:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">${submission.jacket_size}</td>
            </tr>
            ${submission.sports_bra_size ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Sports Bra Size:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">${submission.sports_bra_size}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Tight Size:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">${submission.tight_size}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px; font-weight: bold; text-transform: uppercase;">Shoe size (mens):</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; color: #000000; font-size: 16px;">${submission.shoe_size}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #000000; font-size: 16px; line-height: 24px; margin: 0 0 40px 0;">
          Additional info will be sent out as the date approaches.
        </p>
        
        <!-- Contact Information -->
        <div style="margin: 40px 0;">
          <p style="color: #000000; font-size: 16px; line-height: 24px; margin: 0 0 24px 0;">
            For questions or additional details, you can contact:
          </p>
          <div style="margin: 0 0 20px 0;">
            <p style="color: #000000; font-size: 16px; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">
              Art Bashkin
            </p>
            <p style="color: #000000; font-size: 16px; margin: 0;">
              <a href="tel:2244429680" style="color: #ce1141; text-decoration: none;">224.442.9680</a> <br>
              <a href="mailto:Art@dmr-ventures.com" style="color: #ce1141; text-decoration: none;">Art@dmr-ventures.com</a>
            </p>
          </div>
          <div style="margin: 0 0 20px 0;">
            <p style="color: #000000; font-size: 16px; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">
              Randall Hampton
            </p>
            <p style="color: #000000; font-size: 16px; margin: 0;">
              <a href="tel:8476915913" style="color: #ce1141; text-decoration: none;">847.691.5913</a> <br>
              <a href="mailto:Randall@dmr-ventures.com" style="color: #ce1141; text-decoration: none;">Randall@dmr-ventures.com</a>
            </p>
          </div>
          <div style="margin: 0;">
            <p style="color: #000000; font-size: 16px; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase;">
              Madison Ornstil
            </p>
            <p style="color: #000000; font-size: 16px; margin: 0;">
              <a href="tel:9713033068" style="color: #ce1141; text-decoration: none;">971.303.3068</a> <br>
              <a href="mailto:Madison@dmr-ventures.com" style="color: #ce1141; text-decoration: none;">Madison@dmr-ventures.com</a>
            </p>
          </div>
        </div>
        
        <!-- Closing -->
        <div style="margin: 40px 0 0 0; padding-top: 24px; border-top: 1px solid #e5e5e5;">
          <p style="color: #000000; font-size: 18px; line-height: 28px; margin: 0 0 16px 0;">
            We'll see you on the court.
          </p>
          <p style="color: #000000; font-size: 18px; line-height: 28px; margin: 0;">
            Peace and Love,<br>
            <strong style="text-transform: uppercase;">Pooh</strong>
          </p>
        </div>
      </div>
      
      <!-- Footer 
      <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
        <p style="color: #ce1141; font-size: 20px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; margin: 0;">
          Homegrown at Simeon
        </p>
      </div>-->
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
      subject: `Your RSVP is confirmed`,
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
    const runtimeAdminEmails = getAdminEmailsForNonPlayers();
    
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
      console.error('❌ No admin emails configured for non-player notifications.');
      console.error('   Set ADMIN_EMAIL_1-4 (for all notifications) or ADMIN_EMAIL_NON_PLAYER_1-4 (for non-player-only)');
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