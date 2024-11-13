import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function PUT(request: Request) {
  try {
    const userEmail = request.headers.get('user-email');
    const { newEmail } = await request.json();

    if (!userEmail || !newEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update email in subscriptions table
    const { rowCount } = await sql`
      UPDATE subscriptions
      SET user_email = ${newEmail}
      WHERE user_email = ${userEmail}
    `;

    return NextResponse.json({ 
      success: true,
      message: 'Email updated successfully',
      updatedRows: rowCount
    });
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
  }
} 