import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function DELETE(request: Request) {
  try {
    const userEmail = request.headers.get('user-email');

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all subscriptions for the user
    const { rowCount } = await sql`
      DELETE FROM subscriptions
      WHERE user_email = ${userEmail}
    `;

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully',
      deletedRows: rowCount
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
} 