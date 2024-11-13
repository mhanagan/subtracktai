import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function DELETE(request: Request) {
  try {
    const userEmail = request.headers.get('user-email');

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First delete all subscriptions for the user
    await sql`
      DELETE FROM subscriptions
      WHERE user_email = ${userEmail}
    `;

    // Then delete the user from the users table
    const { rowCount } = await sql`
      DELETE FROM users
      WHERE email = ${userEmail}
    `;

    if (rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Account and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
} 