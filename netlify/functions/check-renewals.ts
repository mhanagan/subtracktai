import { Handler, schedule } from "@netlify/functions";
import { sendSubscriptionReminder } from '../../lib/email';

interface Subscription {
  id: number;
  name: string;
  category: string;
  price: number;
  renewalDate: string;
  reminderEnabled: boolean;
  userEmail: string;
}

const handler: Handler = async (event, context) => {
  try {
    // In a real application, fetch subscriptions from your database
    const subscriptions: Subscription[] = []; // This would be your database query
    
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        remindersSent,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error in renewal check:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Schedule the function to run daily at midnight
export const handler = schedule("0 0 * * *", handler);