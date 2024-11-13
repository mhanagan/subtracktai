import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendSubscriptionReminder } from '@/lib/email';

export async function GET(request: Request) {
  try {
    // Verify the request using a query parameter
    const { searchParams } = new URL(request.url);
    const cronSecret = searchParams.get('cronSecret');
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting check-renewals cron job');

    // Get subscriptions that renew tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const { rows: subscriptions } = await sql`
      SELECT * FROM subscriptions 
      WHERE DATE(renewal_date) = DATE(${tomorrow.toISOString()})
      AND reminder_enabled = true;
    `;

    console.log(`Found ${subscriptions.length} subscriptions renewing tomorrow`);

    // Process each subscription
    for (const subscription of subscriptions) {
      try {
        await sendSubscriptionReminder(subscription as any, subscription.user_email);
        console.log(`Sent reminder for subscription: ${subscription.name}`);
      } catch (error) {
        console.error(`Failed to send reminder for ${subscription.name}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: subscriptions.length,
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