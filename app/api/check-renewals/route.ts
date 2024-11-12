import { sendSubscriptionReminder, sendCombinedRenewalReminders } from '@/lib/email';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Subscription } from '@/types/subscription';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const now = new Date();
    console.log('\n=== Starting check-renewals cron job ===');
    console.log('Current UTC time:', now.toISOString());
    console.log('Current EST time:', now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('Unauthorized cron job attempt:', authHeader);
      return new Response('Unauthorized', { status: 401 });
    }

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log('\n=== Date Check ===');
    console.log('Looking for renewals on:', tomorrowStr);

    // Fetch subscriptions renewing tomorrow
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
        renewal_date::date = ${tomorrowStr}::date
        AND reminder_enabled = true
    `;

    console.log('\n=== Database Results ===');
    console.log('Found subscriptions:', JSON.stringify(rows, null, 2));
    console.log('Number of subscriptions found:', rows.length);

    if (rows.length === 0) {
      console.log('No subscriptions found for tomorrow');
      return new Response(JSON.stringify({
        success: true,
        remindersSent: [],
        timestamp: now.toISOString(),
        debug: {
          message: 'No subscriptions found for tomorrow',
          checkingDate: tomorrowStr
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert SQL rows to Subscription type
    const subscriptions = rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      price: row.price,
      renewal_date: row.renewal_date,
      reminder_enabled: row.reminder_enabled,
      user_email: row.user_email,
      timezone: row.timezone
    })) as Subscription[];

    // Group subscriptions by user email
    const userSubscriptions = subscriptions.reduce((acc, subscription) => {
      if (!acc[subscription.user_email!]) {
        acc[subscription.user_email!] = [];
      }
      acc[subscription.user_email!].push(subscription);
      return acc;
    }, {} as Record<string, Subscription[]>);

    console.log('\n=== Processing Users ===');
    console.log('Number of users to process:', Object.keys(userSubscriptions).length);

    const remindersSent = [];
    const errors = [];

    // Process each user's subscriptions
    for (const [userEmail, userSubs] of Object.entries(userSubscriptions)) {
      try {
        const userTimeZone = userSubs[0].timezone;
        const userLocalTime = new Date().toLocaleString('en-US', { timeZone: userTimeZone });
        const userLocalDate = new Date(userLocalTime);
        const userHour = userLocalDate.getHours();

        console.log('\nProcessing user:', {
          userEmail,
          userTimeZone,
          userLocalTime,
          currentHour: userHour,
          subscriptions: userSubs.map(sub => ({
            name: sub.name,
            renewal_date: sub.renewal_date,
            reminder_enabled: sub.reminder_enabled
          }))
        });

        // Send reminders between 1 PM and 2 PM in user's timezone
        if (userHour >= 13 && userHour < 14) {
          console.log('Time check passed - sending reminders');
          if (userSubs.length > 0) {
            const result = await sendCombinedRenewalReminders(userSubs, userEmail);
            if (result.success) {
              remindersSent.push({
                email: userEmail,
                subscriptions: userSubs.map(sub => ({
                  id: sub.id,
                  name: sub.name
                }))
              });
              console.log('Successfully sent reminders for:', userEmail);
            } else {
              console.error('Failed to send reminders for:', userEmail);
              if (result.error) {
                console.error('Error details:', result.error);
              }
            }
          }
        } else {
          console.log('Not sending reminders - outside of notification window:', {
            userEmail,
            currentHour: userHour,
            requiresHour: 13
          });
        }
      } catch (error) {
        console.error('Error processing user subscriptions:', userEmail, error);
        errors.push({
          email: userEmail,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('\n=== Summary ===');
    console.log('Reminders sent:', remindersSent.length);
    console.log('Errors encountered:', errors.length);

    return new Response(JSON.stringify({
      success: true,
      remindersSent,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
      debug: {
        currentTime: now.toISOString(),
        currentTimeEST: now.toLocaleString('en-US', { timeZone: 'America/New_York' }),
        checkingDate: tomorrowStr,
        foundSubscriptions: rows.length,
        processedUsers: Object.keys(userSubscriptions).length
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('\n=== Error in check-renewals ===');
    console.error(error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}