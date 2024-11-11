import { sendSubscriptionReminder } from '@/lib/email';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { subscription, userEmail } = await request.json();

    if (!subscription || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendSubscriptionReminder(subscription, userEmail);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send reminder email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Reminder email sent successfully' 
    });
  } catch (error) {
    console.error('Error in reminder endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}