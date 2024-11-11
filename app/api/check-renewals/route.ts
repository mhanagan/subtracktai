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

    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    console.log('Checking for subscriptions renewing on:', tomorrowStr);

    // Fetch subscriptions
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
        renewal_date::date = ${tomorrowStr}::date
        AND reminder_enabled = true
    `;

    console.log('Found subscriptions:', JSON.stringify(rows, null, 2));

    const remindersSent = [];
    const errors = [];

    // Send reminders for each subscription
    for (const subscription of rows) {
      try {
        console.log(`Sending reminder for subscription: ${subscription.name} to ${subscription.user_email}`);
        
        // Cast the database row to match the Subscription interface
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
          console.log(`Successfully sent reminder for ${subscription.name}`);
        } else {
          console.error(`Failed to send reminder for ${subscription.name}:`, result.error);
          errors.push({
            id: subscription.id,
            name: subscription.name,
            error: 'Failed to send reminder'
          });
        }
      } catch (error) {
        console.error(`Error processing reminder for ${subscription.name}:`, error);
        errors.push({
          id: subscription.id,
          name: subscription.name,
          error: error instanceof Error ? error.message : 'Error processing reminder'
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
    console.error('Error in check-renewals cron:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}