import type { APIRoute } from 'astro';
import { requireAuth } from '../../../../lib/auth';
import { getAllNonPlayerSubmissions } from '../../../../lib/database';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    if (!requireAuth(cookies)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const submissions = await getAllNonPlayerSubmissions();

    // Convert to CSV
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Ticket Count',
      'Additional Tickets',
      'Created At'
    ];

    const rows = submissions.map(sub => [
      sub.id,
      sub.name,
      sub.email,
      sub.phone,
      sub.ticket_count,
      Array.isArray(sub.additional_tickets) ? sub.additional_tickets.join('; ') : '',
      sub.created_at
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="non-players-entries-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting non-player entries:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

