import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

const pool = createPool({
  connectionString: process.env.POSTGRES_PRISMA_URL
});

export async function POST(request: Request) {
  try {
    const { email, token, password } = await request.json();

    // If email is provided but no token, this is a request for a reset link
    if (email && !token) {
      // Generate reset token and send email (existing code)
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset email will be sent'
      });
    }

    // If token and password are provided, this is a password reset request
    if (token && password) {
      // Verify token
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
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}