import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_PRISMA_URL
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const timestamp = new Date().toISOString();
    console.log('=== UPDATE RENEWALS JOB START ===');
    console.log('Timestamp:', timestamp);
    console.log('URL:', request.url);
    const { searchParams } = new URL(request.url);
    const cronSecret = searchParams.get('cronSecret');

    console.log('Checking cron secret:', {
      provided: cronSecret?.substring(0, 4) + '...',
      expected: process.env.CRON_SECRET?.substring(0, 4) + '...',
      matches: cronSecret === process.env.CRON_SECRET
    });

    if (cronSecret !== process.env.CRON_SECRET) {
      console.error('Invalid cron secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Format date for SQL query
    const todayStr = today.toISOString().split('T')[0];

    // Find subscriptions with renewal dates that have passed
    const { rows: expiredSubscriptions } = await pool.query(
      `SELECT 
        id,
        name,
        renewal_date,
        user_email
      FROM subscriptions 
      WHERE DATE(renewal_date) < $1`,
      [todayStr]
    );

    console.log('Found expired subscriptions:', expiredSubscriptions.length);

    const updatedSubscriptions = [];
    const errors = [];

    // Update each subscription with a new renewal date
    for (const subscription of expiredSubscriptions) {
      try {
        // Parse the current renewal date
        const currentRenewalDate = new Date(subscription.renewal_date);
        
        // Calculate the next renewal date
        // Keep incrementing by months until we get a date in the future
        const nextRenewalDate = new Date(currentRenewalDate);
        while (nextRenewalDate < today) {
          nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
        }
        
        // Format the new date for SQL
        const nextRenewalDateStr = nextRenewalDate.toISOString().split('T')[0];
        
        // Update the subscription in the database
        const { rows } = await pool.query(
          `UPDATE subscriptions 
          SET renewal_date = $1::date AT TIME ZONE 'UTC'
          WHERE id = $2
          RETURNING 
            id,
            name,
            (renewal_date AT TIME ZONE 'UTC')::date::text as renewal_date,
            user_email`,
          [nextRenewalDateStr, subscription.id]
        );
        
        updatedSubscriptions.push({
          id: rows[0].id,
          name: rows[0].name,
          oldRenewalDate: subscription.renewal_date,
          newRenewalDate: rows[0].renewal_date,
          userEmail: rows[0].user_email
        });
      } catch (error) {
        console.error('Error updating subscription:', subscription.id, error);
        errors.push({
          id: subscription.id,
          name: subscription.name,
          error: error instanceof Error ? error.message : 'Failed to update renewal date'
        });
      }
    }

    console.log('Updated subscriptions:', updatedSubscriptions.length);

    return NextResponse.json({
      success: true,
      updatedSubscriptions,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('=== UPDATE RENEWALS JOB ERROR ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error details:', error);
    throw error;
  } finally {
    console.log('=== UPDATE RENEWALS JOB END ===');
  }
}