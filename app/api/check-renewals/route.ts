import { sendSubscriptionReminder } from '@/lib/email';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Subscription } from '@/types/subscription';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    console.log('Starting check-renewals cron job at:', new Date().toISOString());
    
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('Unauthorized cron job attempt:', authHeader);
      return new Response('Unauthorized', { status: 401 });
    }

    // Get tomorrow's date in YYYY-MM-DD format for multiple timezones
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Also check the day after to account for timezone differences
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    console.log('Checking for subscriptions renewing on:', tomorrowStr, 'or', dayAfterStr);

    // Fetch subscriptions for both days
    const { rows } = await sql`
      SELECT 
        id,
        name,
        category,
        price::float,
        (renewal_date AT TIME ZONE 'UTC')::date::text as renewal_date,
        reminder_enabled,
        user_email
      FROM subscriptions 
      WHERE 
        (renewal_date::date = ${tomorrowStr}::date OR 
         renewal_date::date = ${dayAfterStr}::date)
        AND reminder_enabled = true
    `;

    console.log('Found subscriptions:', JSON.stringify(rows, null, 2));

    // Process each subscription
    const remindersSent = [];
    const errors = [];

    for (const subscription of rows) {
      try {
        // Convert the database row to a Subscription type
        const subscriptionData: Subscription = {
          id: subscription.id,
          name: subscription.name,
          category: subscription.category,
          price: subscription.price,
          renewal_date: subscription.renewal_date,
          reminder_enabled: subscription.reminder_enabled,
          user_email: subscription.user_email
        };

        const result = await sendSubscriptionReminder(subscriptionData, subscription.user_email);
        if (result.success) {
          remindersSent.push({
            id: subscription.id,
            name: subscription.name,
            email: subscription.user_email
          });
        }
      } catch (error) {
        console.error('Error sending reminder for subscription:', subscription.id, error);
        errors.push({
          id: subscription.id,
          name: subscription.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      remindersSent,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in check-renewals:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}