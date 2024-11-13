import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

const pool = createPool({
  connectionString: process.env.POSTGRES_PRISMA_URL
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // Don't reveal if user exists or not
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset email will be sent'
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in verification_tokens table
    await pool.query(
      'INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1, $2, $3)',
      [email, token, expires]
    );

    // Send reset email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
} 