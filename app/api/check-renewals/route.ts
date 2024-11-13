import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendSubscriptionReminder } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Debug logging
    console.log('Received check-renewals request');
    
    const { searchParams } = new URL(request.url);
    const cronSecret = searchParams.get('cronSecret');
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Invalid or missing cronSecret'
      }, { status: 401 });
    }

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
    const results = [];
    for (const subscription of subscriptions) {
      try {
        const result = await sendSubscriptionReminder(subscription, subscription.user_email);
        results.push({
          subscription: subscription.name,
          success: result.success,
          email: subscription.user_email
        });
        console.log(`Processed reminder for ${subscription.name}`);
      } catch (error) {
        console.error(`Failed to process ${subscription.name}:`, error);
        results.push({
          subscription: subscription.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      processed: subscriptions.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    const error = err as Error;
    console.error('Error in check-renewals:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error.message
    }, { status: 500 });
  }
}