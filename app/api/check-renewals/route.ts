import { sendSubscriptionReminder } from '@/lib/email';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface Subscription {
  id: number;
  name: string;
  category: string;
  price: number;
  renewalDate: string;
  reminderEnabled: boolean;
  userEmail: string;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM subscriptions');
    const subscriptions: Subscription[] = result.rows;
    client.release();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const remindersSent = [];
    const errors = [];

    for (const subscription of subscriptions) {
      const renewalDate = new Date(subscription.renewalDate);
      renewalDate.setHours(0, 0, 0, 0);

      if (
        renewalDate.getTime() === tomorrow.getTime() &&
        subscription.reminderEnabled
      ) {
        try {
          const result = await sendSubscriptionReminder(
            subscription,
            subscription.userEmail
          );

          if (result.success) {
            remindersSent.push({
              id: subscription.id,
              name: subscription.name,
              email: subscription.userEmail
            });
          } else {
            errors.push({
              id: subscription.id,
              name: subscription.name,
              error: 'Failed to send reminder'
            });
          }
        } catch (error) {
          errors.push({
            id: subscription.id,
            name: subscription.name,
            error: 'Error processing reminder'
          });
        }
      }
    }

    console.log(`Renewal check completed: ${remindersSent.length} reminders sent, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      remindersSent,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in renewal check cron:', error);
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