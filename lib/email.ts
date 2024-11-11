import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface Subscription {
  id: number;
  name: string;
  price: number;
  renewal_date: string;
}

export async function sendSubscriptionReminder(subscription: Subscription, userEmail: string) {
  try {
    console.log(`Attempting to send reminder email for ${subscription.name} to ${userEmail}`);

    const msg = {
      to: userEmail,
      from: 'notifications@subtrackt.com', // Make sure this is verified in SendGrid
      subject: `Reminder: ${subscription.name} renews tomorrow`,
      html: `
        <h2>Subscription Renewal Reminder</h2>
        <p>Your subscription to ${subscription.name} will renew tomorrow.</p>
        <p>Amount: $${subscription.price.toFixed(2)}</p>
        <p>Renewal Date: ${new Date(subscription.renewal_date).toLocaleDateString()}</p>
        <p>Log in to your Subtrackt dashboard to manage your subscriptions.</p>
      `,
    };

    const response = await sgMail.send(msg);
    console.log('Email sent successfully:', response);
    return { success: true };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return { success: false, error };
  }
}