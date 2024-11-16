import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendCombinedRenewalReminders } from '@/lib/email';

interface Subscription {
  id: number;
  name: string;
  category: string;
  price: number;
  price_decimal?: string;
  renewal_date: string;
  user_email: string;
}

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
      ORDER BY user_email, name
    `;

    // Group subscriptions by user email
    const subscriptionsByUser = subscriptions.reduce((acc, sub) => {
      const formattedSub = {
        ...sub,
        price: parseFloat(sub.price_decimal || sub.price || 0)
      };
      
      if (!acc[sub.user_email]) {
        acc[sub.user_email] = [];
      }
      acc[sub.user_email].push(formattedSub);
      return acc;
    }, {} as Record<string, Subscription[]>);

    const remindersSent = [];
    const errors = [];

    // Send one email per user with all their renewals
    for (const [userEmail, userSubscriptions] of Object.entries(subscriptionsByUser)) {
      try {
        await sendCombinedRenewalReminders(userSubscriptions, userEmail);
        
        remindersSent.push({
          email: userEmail,
          subscriptionCount: userSubscriptions.length,
          subscriptions: userSubscriptions.map((sub: Subscription) => ({
            id: sub.id,
            name: sub.name
          }))
        });
      } catch (error) {
        console.error('Error sending combined reminders for user:', userEmail, error);
        errors.push({
          email: userEmail,
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