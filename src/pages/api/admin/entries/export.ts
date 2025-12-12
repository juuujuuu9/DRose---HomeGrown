import type { APIRoute } from 'astro';
import { requireAuth } from '../../../../lib/auth';
import { getAllSubmissions, initializeDatabase } from '../../../../lib/database';

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

    // Initialize database schema (ensures migrations run)
    await initializeDatabase();

    const submissions = await getAllSubmissions();

    // Convert to CSV
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Alternative Contact Name',
      'Alternative Contact Phone',
      'Alternative Contact Email',
      'Address',
      'Jersey size',
      'Jersey #',
      'Preferred jersey #',
      'Shorts size',
      'Jacket Size',
      'Tight Size',
      'Shoe size (mens)',
      'Checked In',
      'Created At'
    ];

    const rows = submissions.map(sub => [
      sub.id,
      sub.name,
      sub.email,
      sub.phone,
      sub.alternative_contact_name,
      sub.alternative_contact_phone,
      sub.alternative_contact_email,
      sub.address,
      sub.top_size,
      sub.jersey_number ?? '',
      sub.preferred_jersey_number ?? '',
      sub.bottom_size,
      sub.jacket_size,
      sub.tight_size,
      sub.shoe_size,
      sub.checked_in ? 'Yes' : 'No',
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
        'Content-Disposition': `attachment; filename="entries-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting entries:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

