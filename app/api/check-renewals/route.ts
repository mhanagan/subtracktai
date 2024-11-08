import { sendSubscriptionReminder } from '@/lib/email';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes maximum execution time

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
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // In a real application, fetch subscriptions from your database
    // For now, we'll use mock data
    const subscriptions: Subscription[] = []; // This would be your database query
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const remindersSent = [];
    const errors = [];

    for (const subscription of subscriptions) {
      const renewalDate = new Date(subscription.renewalDate);
      renewalDate.setHours(0, 0, 0, 0);
      
      // Check if renewal is tomorrow
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
            
            // In a real application, you would update the database to mark
            // that a reminder was sent for this renewal
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

    // Log the results for monitoring
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