const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

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
      fromEmail: 'notifications@subtrackt.com',
      toEmail: userEmail,
      subscription: {
        name: subscription.name,
        renewal_date: subscription.renewal_date
      }
    });

    console.log(`Attempting to send reminder email for ${subscription.name} to ${userEmail}`);

    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured');
    }

    const response = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: userEmail }]
        }],
        from: {
          email: 'notifications@subtrackt.com',
          name: 'Subtrackt'
        },
        subject: `Reminder: ${subscription.name} renews tomorrow`,
        content: [{
          type: 'text/html',
          value: `
            <h2>Subscription Renewal Reminder</h2>
            <p>Your subscription to ${subscription.name} will renew tomorrow.</p>
            <p>Amount: $${subscription.price.toFixed(2)}</p>
            <p>Renewal Date: ${new Date(subscription.renewal_date).toLocaleDateString()}</p>
            <p>Log in to your Subtrackt dashboard to manage your subscriptions.</p>
          `
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('SendGrid API Error:', errorData);
      throw new Error(errorData.message || 'Failed to send email through SendGrid');
    }

    console.log('Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Detailed email error:', error);
    return { success: false, error };
  }
}