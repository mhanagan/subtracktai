import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { emailTemplates } from '@/lib/email-templates';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

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

    // Send confirmation email
    try {
      if (!SENDGRID_API_KEY) {
        throw new Error('SendGrid API key is not configured');
      }

      await fetch(SENDGRID_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: userEmail }]
          }],
          from: {
            email: 'notifications@subtrackt.ai',
            name: 'Subtrackt'
          },
          subject: 'Account Deleted Successfully - Subtrackt',
          content: [{
            type: 'text/html',
            value: emailTemplates.accountDeletion(userEmail)
          }]
        })
      });
    } catch (emailError) {
      console.error('Failed to send deletion confirmation email:', emailError);
      // Continue with the response even if email fails
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