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
        renewal_date::text,
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
    const { name, category, price, renewalDate, reminderEnabled, userEmail } = await request.json();

    console.log('Creating subscription:', {
      name,
      category,
      price,
      renewalDate,
      reminderEnabled,
      userEmail
    });

    if (!name || !category || !price || !renewalDate || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO subscriptions (
        name,
        category,
        price,
        renewal_date,
        reminder_enabled,
        user_email
      ) VALUES (
        ${name},
        ${category},
        ${price}::decimal,
        ${renewalDate}::date,
        ${reminderEnabled},
        ${userEmail}
      )
      RETURNING 
        id,
        name,
        category,
        price::float,
        renewal_date::text,
        reminder_enabled,
        user_email
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
    const { id, name, category, price, renewalDate, reminderEnabled, userEmail } = await request.json();

    console.log('Updating subscription:', {
      id,
      name,
      category,
      price,
      renewalDate,
      reminderEnabled,
      userEmail
    });

    const { rows } = await sql`
      UPDATE subscriptions 
      SET 
        name = ${name},
        category = ${category},
        price = ${price}::decimal,
        renewal_date = ${renewalDate}::date,
        reminder_enabled = ${reminderEnabled}
      WHERE id = ${id} AND user_email = ${userEmail}
      RETURNING 
        id,
        name,
        category,
        price::float,
        renewal_date::text,
        reminder_enabled,
        user_email
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

    const { rows } = await sql`
      DELETE FROM subscriptions 
      WHERE id = ${id} AND user_email = ${userEmail}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
} 