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

    // Get current UTC time
    const now = new Date();
    
    // Calculate the date range for renewals (next 48 hours)
    const startDate = new Date(now);
    startDate.setUTCHours(now.getUTCHours() + 25, 0, 0, 0); // 25 hours from now
    const endDate = new Date(startDate);
    endDate.setUTCHours(endDate.getUTCHours() + 24); // 24 hours after start date

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('Checking for subscriptions renewing between:', startDateStr, 'and', endDateStr);

    // Fetch subscriptions for the date range
    const { rows } = await sql`
      SELECT 
        id,
        name,
        category,
        price::float,
        renewal_date,
        reminder_enabled,
        user_email,
        timezone
      FROM subscriptions 
      WHERE 
        renewal_date::date >= ${startDateStr}::date
        AND renewal_date::date <= ${endDateStr}::date
        AND reminder_enabled = true
    `;

    console.log('Found subscriptions:', JSON.stringify(rows, null, 2));

    // Process each subscription
    const remindersSent = [];
    const errors = [];

    for (const subscription of rows) {
      try {
        // Convert renewal_date to user's local time
        const userLocalTime = new Date(subscription.renewal_date).toLocaleString('en-US', { timeZone: subscription.timezone });
        const userLocalDate = new Date(userLocalTime);

        // Check if it's 1 PM the day before renewal in user's timezone
        if (userLocalDate.getHours() === 13 && userLocalDate.getDate() === now.getUTCDate() + 1) {
          const subscriptionData: Subscription = {
            id: subscription.id,
            name: subscription.name,
            category: subscription.category,
            price: subscription.price,
            renewal_date: subscription.renewal_date,
            reminder_enabled: subscription.reminder_enabled,
            user_email: subscription.user_email,
            timezone: subscription.timezone
          };

          const result = await sendSubscriptionReminder(subscriptionData, subscription.user_email);
          if (result.success) {
            remindersSent.push({
              id: subscription.id,
              name: subscription.name,
              email: subscription.user_email
            });
          }
        }
      } catch (error) {
        console.error('Error processing subscription:', subscription.id, error);
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