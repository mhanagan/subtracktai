import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function DELETE(request: Request) {
  try {
    const userEmail = request.headers.get('user-email');

    if (!userEmail) {
      console.error('No user email provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Attempting to delete account for:', userEmail);

    // Delete all subscriptions for the user
    const deleteSubscriptionsResult = await sql`
      DELETE FROM subscriptions
      WHERE user_email = ${userEmail}
      RETURNING id
    `;

    console.log('Deleted subscriptions:', deleteSubscriptionsResult.rows.length);

    return NextResponse.json({ 
      success: true,
      message: 'Account data deleted successfully',
      deletedSubscriptions: deleteSubscriptionsResult.rows.length
    });

  } catch (error) {
    console.error('Error in delete-account:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 