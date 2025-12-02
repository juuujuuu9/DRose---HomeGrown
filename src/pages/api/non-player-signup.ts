import type { APIRoute } from 'astro';
import { createNonPlayerSubmission, initializeNonPlayerDatabase } from '../../lib/database';
import { sendNonPlayerAdminNotification } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Initialize database if needed
    await initializeNonPlayerDatabase();
    
    const data = await request.json();
    
    // Debug: Log the received data
    console.log('Received non-player form data:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'ticket_count'];
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
    
    // Validate ticket count
    const ticketCount = parseInt(data.ticket_count);
    if (isNaN(ticketCount) || ticketCount < 1 || ticketCount > 5) {
      return new Response(JSON.stringify({ 
        error: 'Invalid ticket count. Must be between 1 and 5.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate additional tickets if ticket count > 1
    const additionalTickets = data.additional_tickets || [];
    if (ticketCount > 1) {
      if (additionalTickets.length !== ticketCount - 1) {
        return new Response(JSON.stringify({ 
          error: `Please provide information for all ${ticketCount - 1} additional ticket(s).` 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Validate each additional ticket has required fields
      for (let i = 0; i < additionalTickets.length; i++) {
        const ticket = additionalTickets[i];
        if (!ticket.name || !ticket.email || !ticket.phone) {
          return new Response(JSON.stringify({ 
            error: `Please provide name, email, and phone for additional ticket ${i + 1}.` 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(ticket.email)) {
          return new Response(JSON.stringify({ 
            error: `Please provide a valid email address for additional ticket ${i + 1}.` 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    // Create submission
    const submission = await createNonPlayerSubmission({
      name: data.name,
      email: data.email,
      phone: data.phone,
      ticket_count: ticketCount,
      additional_tickets: additionalTickets
    });
    
    // Send email notifications
    console.log('New non-player submission:', submission);
    await sendNonPlayerAdminNotification(submission);
    
    return new Response(JSON.stringify({ success: true, id: submission.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error processing non-player signup:', error);
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

