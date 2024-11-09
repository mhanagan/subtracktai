import { sendSubscriptionReminder } from '@/lib/email';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { QueryResultRow } from '@vercel/postgres';

interface Subscription {
  id: number;
  name: string;
  category: string;
  price: number;
  renewal_date: string;
  reminder_enabled: boolean;
  user_email: string;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { rows } = await sql`SELECT * FROM subscriptions`;
    // Cast the rows to match the Subscription interface
    const subscriptions: Subscription[] = rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      price: row.price,
      renewal_date: row.renewal_date,
      reminder_enabled: row.reminder_enabled,
      user_email: row.user_email
    }));

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const remindersSent = [];
    const errors = [];

    for (const subscription of subscriptions) {
      const renewalDate = new Date(subscription.renewal_date);
      renewalDate.setHours(0, 0, 0, 0);

      if (
        renewalDate.getTime() === tomorrow.getTime() &&
        subscription.reminder_enabled
      ) {
        try {
          const result = await sendSubscriptionReminder(
            subscription,
            subscription.user_email
          );

          if (result.success) {
            remindersSent.push({
              id: subscription.id,
              name: subscription.name,
              email: subscription.user_email
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