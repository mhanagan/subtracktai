import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_PRISMA_URL
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const userEmail = request.headers.get('user-email');
    if (!userEmail) {
      console.log('No user email provided in headers');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching subscriptions for:', userEmail);

    const { rows } = await pool.query(
      `SELECT 
        id,
        name,
        category,
        price::float,
        (renewal_date AT TIME ZONE 'UTC')::date::text as renewal_date,
        reminder_enabled,
        user_email
      FROM subscriptions 
      WHERE user_email = $1
      ORDER BY name ASC`,
      [userEmail]
    );

    console.log('Fetched subscriptions:', rows);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, category, price, renewalDate, reminderEnabled, userEmail, timezone } = await request.json();

    console.log('Creating subscription:', {
      name,
      category,
      price,
      renewalDate,
      reminderEnabled,
      userEmail
    });

    // Validate required fields
    if (!name || !category || !price || !renewalDate || !userEmail) {
      console.error('Missing required fields:', { name, category, price, renewalDate, userEmail });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure the date is in the correct format (YYYY-MM-DD)
    const formattedDate = renewalDate.split('T')[0];

    const { rows } = await pool.query(
      `INSERT INTO subscriptions (
        name,
        category,
        price,
        renewal_date,
        reminder_enabled,
        user_email,
        timezone
      ) VALUES ($1, $2, $3::decimal, $4::date AT TIME ZONE 'UTC', $5, $6, $7)
      RETURNING 
        id,
        name,
        category,
        price::float,
        (renewal_date AT TIME ZONE 'UTC')::date::text as renewal_date,
        reminder_enabled,
        user_email,
        timezone`,
      [name, category, price, formattedDate, reminderEnabled, userEmail, timezone]
    );

    console.log('Created subscription:', rows[0]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, category, price, renewalDate, reminderEnabled, userEmail, timezone } = await request.json();

    console.log('Updating subscription:', {
      id,
      name,
      category,
      price,
      renewalDate,
      reminderEnabled,
      userEmail
    });

    const { rows } = await pool.query(
      `UPDATE subscriptions 
      SET 
        name = $1,
        category = $2,
        price = $3::decimal,
        renewal_date = $4::date AT TIME ZONE 'UTC',
        reminder_enabled = $5
      WHERE id = $6 AND user_email = $7
      RETURNING 
        id,
        name,
        category,
        price::float,
        (renewal_date AT TIME ZONE 'UTC')::date::text as renewal_date,
        reminder_enabled,
        user_email,
        timezone`,
      [name, category, price, renewalDate, reminderEnabled, id, userEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    console.log('Updated subscription:', rows[0]);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userEmail = request.headers.get('user-email');

    if (!id || !userEmail) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { rows } = await pool.query(
      'DELETE FROM subscriptions WHERE id = $1 AND user_email = $2 RETURNING id',
      [id, userEmail]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
} 