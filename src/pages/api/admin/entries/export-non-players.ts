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
      'Allow Contact from Derrick Rose',
      'Checked In',
      'Created At'
    ];

    const rows = submissions.map(sub => {
      return [
        sub.id,
        sub.name,
        sub.email,
        sub.phone,
        sub.ticket_count,
        sub.allow_contact_from_derrick_rose ? 'Yes' : 'No',
        sub.checked_in ? 'Yes' : 'No',
        sub.created_at
      ];
    });

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

