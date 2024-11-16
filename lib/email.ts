import { emailTemplates } from './email-templates';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

interface Subscription {
  id: number;
  name: string;
  category: string;
  price: number;
  price_decimal?: string;
  renewal_date: string;
  user_email: string;
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
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured');
    }

    const emailContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://www.subtrackt.ai" target="_blank">
            <img src="https://www.subtrackt.ai/subtrackt.jpg" alt="Subtrackt Logo" style="max-width: 200px; height: auto;">
          </a>
        </div>
        <h2>Welcome to Subtrackt!</h2>
        <p>Thank you for joining Subtrackt. We're excited to help you manage your subscriptions.</p>
        <p>Get started by adding your first subscription in your <a href="https://www.subtrackt.ai/dashboard" style="color: #0066cc; text-decoration: none;">dashboard</a>.</p>
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
        subject: 'Welcome to Subtrackt!',
        content: [{
          type: 'text/html',
          value: emailContent
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send welcome email');
    }

    console.log('Welcome email sent successfully to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
  try {
    const domain = process.env.NEXTAUTH_URL || 'https://subtrackt.ai';
    const resetUrl = `${domain}/auth/reset-password/${resetToken}`;

    const emailContent = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://www.subtrackt.ai" target="_blank">
            <img src="https://www.subtrackt.ai/subtrackt.jpg" alt="Subtrackt Logo" style="max-width: 200px; height: auto;">
          </a>
        </div>
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #0066cc; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
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
        subject: 'Reset Your Subtrackt Password',
        content: [{
          type: 'text/html',
          value: emailContent
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
        subject: `${subscriptions.length} Subscriptions Renewing Tomorrow`,
        content: [{
          type: 'text/html',
          value: emailTemplates.combinedRenewalReminder(subscriptions)
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email through SendGrid');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending combined renewal reminders:', error);
    return { success: false, error };
  }
}