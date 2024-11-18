import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const { rows } = await sql`
      SELECT id, email, created_at 
      FROM users 
      WHERE email = ${email.toLowerCase()}
    `;

    return NextResponse.json({
      found: rows.length > 0,
      user: rows[0] ? {
        id: rows[0].id,
        email: rows[0].email,
        created_at: rows[0].created_at
      } : null
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 