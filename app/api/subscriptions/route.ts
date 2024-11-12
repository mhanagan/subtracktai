import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
      WHERE user_email = ${userEmail}
      ORDER BY name ASC
    `;

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

    const data = {
      name,
      category,
      price,
      renewal_date: formattedDate,
      reminder_enabled: reminderEnabled,
      user_email: userEmail,
      timezone
    };

    const { rows } = await sql`
      INSERT INTO subscriptions (
        name,
        category,
        price,
        renewal_date,
        reminder_enabled,
        user_email,
        timezone
      ) VALUES (
        ${data.name},
        ${data.category},
        ${data.price}::decimal,
        ${data.renewal_date}::date AT TIME ZONE 'UTC',
        ${data.reminder_enabled},
        ${data.user_email},
        ${data.timezone}
      )
      RETURNING 
        id,
        name,
        category,
        price::float,
        (renewal_date AT TIME ZONE 'UTC')::date::text as renewal_date,
        reminder_enabled,
        user_email,
        timezone
    `;

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

    const data = {
      name: name,
      category: category,
      price: price,
      renewal_date: renewalDate,
      reminder_enabled: reminderEnabled,
      user_email: userEmail,
      timezone: timezone || 'America/New_York'
    };

    const { rows } = await sql`
      UPDATE subscriptions 
      SET 
        name = ${data.name},
        category = ${data.category},
        price = ${data.price}::decimal,
        renewal_date = ${data.renewal_date}::date AT TIME ZONE 'UTC',
        reminder_enabled = ${data.reminder_enabled}
      WHERE id = ${id} AND user_email = ${data.user_email}
      RETURNING 
        id,
        name,
        category,
        price::float,
        (renewal_date AT TIME ZONE 'UTC')::date::text as renewal_date,
        reminder_enabled,
        user_email,
        timezone
    `;

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
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Deleting subscription:', { id, userEmail });

    const { rows } = await sql`
      DELETE FROM subscriptions 
      WHERE id = ${parseInt(id)} AND user_email = ${userEmail}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    console.log('Successfully deleted subscription:', rows[0]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
} 