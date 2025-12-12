import type { APIRoute } from 'astro';
import { createSubmission, initializeDatabase } from '../../lib/database';
import { sendAdminNotification } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Initialize database if needed
    await initializeDatabase();
    
    const data = await request.json();
    
    // Debug: Log the received data
    console.log('Received form data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = [
      'name',
      'email',
      'phone',
      'alternative_contact_name',
      'alternative_contact_phone',
      'alternative_contact_email',
      'address',
      'top_size',
      'bottom_size',
      'jacket_size',
      'tight_size',
      'shoe_size'
    ];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields', 
        missing: missingFields 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create submission
    const submission = await createSubmission({
      name: data.name,
      email: data.email,
      phone: data.phone,
      alternative_contact_name: data.alternative_contact_name,
      alternative_contact_phone: data.alternative_contact_phone,
      alternative_contact_email: data.alternative_contact_email,
      address: data.address,
      top_size: data.top_size,
      jersey_number: typeof data.jersey_number === 'string' ? data.jersey_number : null,
      preferred_jersey_number: typeof data.preferred_jersey_number === 'string' ? data.preferred_jersey_number : null,
      bottom_size: data.bottom_size,
      jacket_size: data.jacket_size,
      tight_size: data.tight_size,
      shoe_size: data.shoe_size
    });
    
    // Send email notifications
    console.log('New submission:', submission);
    await sendAdminNotification(submission);
    
    return new Response(JSON.stringify({ success: true, id: submission.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error processing signup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};