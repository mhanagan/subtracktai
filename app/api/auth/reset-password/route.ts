import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

const pool = createPool({
  connectionString: process.env.POSTGRES_PRISMA_URL
});

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Verify token and get user email
    const { rows: tokenRows } = await pool.query(
      'SELECT identifier FROM verification_tokens WHERE token = $1 AND expires > NOW()',
      [token]
    );

    if (tokenRows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const userEmail = tokenRows[0].identifier;

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password
    await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [hashedPassword, userEmail]
    );

    // Delete used token
    await pool.query(
      'DELETE FROM verification_tokens WHERE token = $1',
      [token]
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}