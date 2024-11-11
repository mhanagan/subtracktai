import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface Subscription {
  id: number;
  name: string;
  price: number;
  renewal_date: string;
}

export async function sendSubscriptionReminder(subscription: Subscription, userEmail: string) {
  try {
    console.log('SendGrid Configuration:', {
      apiKeyExists: !!SENDGRID_API_KEY,
      fromEmail: 'notifications@subtrackt.ai',
      toEmail: userEmail,
      subscription: {
        name: subscription.name,
        renewal_date: subscription.renewal_date
      }
    });

    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured');
    }

    const msg = {
      to: userEmail,
      from: 'notifications@subtrackt.ai',
      subject: `Reminder: ${subscription.name} renews tomorrow`,
      html: `
        <h2>Subscription Renewal Reminder</h2>
        <p>Your subscription to ${subscription.name} will renew tomorrow.</p>
        <p>Amount: $${subscription.price.toFixed(2)}</p>
        <p>Renewal Date: ${new Date(subscription.renewal_date).toLocaleDateString()}</p>
        <p>Log in to your Subtrackt dashboard to manage your subscriptions.</p>
      `,
    };

    console.log('Sending email with data:', JSON.stringify(msg, null, 2));

    const response = await sgMail.send(msg);
    console.log('SendGrid API Response:', response);

    return { success: true };
  } catch (error) {
    console.error('Detailed email error:', error);
    if (error instanceof Error && 'response' in error) {
      const sendGridError = error as any;
      console.error('SendGrid Error Details:', {
        status: sendGridError.response?.status,
        body: sendGridError.response?.body,
        headers: sendGridError.response?.headers
      });
    }
    return { success: false, error };
  }
}