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
          email: 'notifications@subtrackt.ai',
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email through SendGrid');
    }

    console.log('Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Detailed email error:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(userEmail: string) {
  try {
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
          email: 'notifications@subtrackt.ai',
          name: 'Subtrackt'
        },
        subject: 'Welcome to Subtrackt!',
        content: [{
          type: 'text/html',
          value: `
            <h2>Welcome to Subtrackt!</h2>
            <p>Thank you for joining Subtrackt. We're excited to help you manage your subscriptions.</p>
            <p>Get started by adding your first subscription in your dashboard.</p>
          `
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send welcome email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${resetToken}`;
    
    const response = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }]
        }],
        from: {
          email: 'notifications@subtrackt.ai',
          name: 'Subtrackt'
        },
        subject: 'Reset Your Subtrackt Password',
        content: [{
          type: 'text/html',
          value: `
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send password reset email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}

export async function sendCombinedRenewalReminders(subscriptions: Subscription[], userEmail: string) {
  try {
    const totalAmount = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    
    const subscriptionsList = subscriptions
      .map(sub => `
        <tr>
          <td style="padding: 12px;">${sub.name}</td>
          <td style="padding: 12px;">$${sub.price.toFixed(2)}</td>
        </tr>
      `)
      .join('');

    const emailContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Multiple Subscriptions Renewing Tomorrow</h2>
        <p>The following subscriptions will renew tomorrow:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 12px; text-align: left;">Service</th>
            <th style="padding: 12px; text-align: left;">Amount</th>
          </tr>
          ${subscriptionsList}
          <tr style="border-top: 2px solid #e5e7eb;">
            <td style="padding: 12px; font-weight: bold;">Total</td>
            <td style="padding: 12px; font-weight: bold;">$${totalAmount.toFixed(2)}</td>
          </tr>
        </table>
        
        <p>Log in to your Subtrackt dashboard to manage your subscriptions.</p>
      </div>
    `;

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
          email: 'notifications@subtrackt.ai',
          name: 'Subtrackt'
        },
        subject: `Multiple Subscriptions Renewing Tomorrow`,
        content: [{
          type: 'text/html',
          value: emailContent
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email through SendGrid');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending combined renewal reminders:', error);
    return { success: false, error };
  }
}