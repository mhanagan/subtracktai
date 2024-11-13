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

    // Delete all subscriptions for the user first (due to foreign key constraints)
    const deleteSubscriptionsResult = await sql`
      DELETE FROM subscriptions
      WHERE user_email = ${userEmail}
      RETURNING id
    `;

    // Delete the user account
    const deleteUserResult = await sql`
      DELETE FROM users
      WHERE email = ${userEmail}
      RETURNING id
    `;

    console.log('Deleted subscriptions:', deleteSubscriptionsResult.rows.length);
    console.log('Deleted user account:', deleteUserResult.rows.length);

    if (deleteUserResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Account and all associated data deleted successfully',
      deletedSubscriptions: deleteSubscriptionsResult.rows.length,
      accountDeleted: true
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