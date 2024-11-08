import { emailTemplates } from './email-templates';
import { rateLimit } from './rate-limit';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(to);
    if (!rateLimitResult.success) {
      throw new Error('Rate limit exceeded');
    }

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendSubscriptionReminder(subscription: any, userEmail: string) {
  return sendEmail({
    to: userEmail,
    subject: `Subscription Renewal Reminder: ${subscription.name}`,
    html: emailTemplates.subscriptionReminder(subscription),
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password/${resetToken}`;
  
  return sendEmail({
    to: email,
    subject: "Reset Your SubTracker Password",
    html: emailTemplates.passwordReset(resetLink),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to SubTracker!",
    html: emailTemplates.welcome(name),
  });
}