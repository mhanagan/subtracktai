import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function DELETE(request: Request) {
  try {
    const userEmail = request.headers.get('user-email');

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use a transaction to ensure both operations succeed or fail together
    await sql.begin(async (sql) => {
      // First delete all subscriptions for the user
      await sql`
        DELETE FROM subscriptions
        WHERE user_email = ${userEmail}
      `;

      // Then delete the user's auth record
      await sql`
        DELETE FROM user_auth
        WHERE email = ${userEmail}
      `;
    });

    return NextResponse.json({ 
      success: true,
      message: 'Account and all associated data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 