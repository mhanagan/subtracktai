import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendSubscriptionReminder } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cronSecret = searchParams.get('cronSecret');

    if (cronSecret !== process.env.CRON_SECRET) {
      console.error('Invalid cron secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Format date for SQL query
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch subscriptions that renew tomorrow and have reminders enabled
    const { rows: subscriptions } = await sql`
      SELECT 
        s.*,
        CAST(s.price AS DECIMAL(10,2)) as price_decimal
      FROM subscriptions s
      WHERE 
        DATE(renewal_date) = ${tomorrowStr}
        AND reminder_enabled = true
    `;

    const remindersSent = [];
    const errors = [];

    for (const subscription of subscriptions) {
      try {
        // Ensure price is properly formatted
        const formattedSubscription = {
          ...subscription,
          price: parseFloat(subscription.price_decimal || subscription.price || 0)
        };

        await sendSubscriptionReminder(formattedSubscription, subscription.user_email);
        
        remindersSent.push({
          id: subscription.id,
          name: subscription.name,
          email: subscription.user_email
        });
      } catch (error) {
        console.error('Error sending reminder for subscription:', subscription.id, error);
        errors.push({
          id: subscription.id,
          name: subscription.name,
          error: error instanceof Error ? error.message : 'Failed to send reminder'
        });
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in check-renewals:', error);
    return NextResponse.json({ 
      error: 'Failed to process renewals',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}