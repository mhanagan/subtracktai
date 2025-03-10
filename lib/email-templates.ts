export const emailTemplates = {
  subscriptionReminder: (subscription: any) => {
    const formattedPrice = typeof subscription.price === 'number' 
      ? subscription.price.toFixed(2)
      : parseFloat(subscription.price || 0).toFixed(2);

    return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1a1a1a; margin-bottom: 8px;">Subscription Renewal Reminder</h1>
        <p style="color: #666; font-size: 16px;">Your subscription will renew tomorrow</p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Subscription Details</h2>
        <div style="margin-bottom: 16px;">
          <p style="margin: 0; color: #666;">Service</p>
          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 500;">${subscription.name || 'N/A'}</p>
        </div>
        <div style="margin-bottom: 16px;">
          <p style="margin: 0; color: #666;">Category</p>
          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 500;">${subscription.category || 'N/A'}</p>
        </div>
        <div style="margin-bottom: 16px;">
          <p style="margin: 0; color: #666;">Amount</p>
          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 500;">$${formattedPrice}</p>
        </div>
        <div>
          <p style="margin: 0; color: #666;">Renewal Date</p>
          <p style="margin: 4px 0 0; font-size: 16px; font-weight: 500;">${new Date(subscription.renewalDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div style="text-align: center; color: #666; font-size: 14px;">
        <p>To manage your subscription, log in to your SubTrackt account.</p>
        <p style="margin-top: 8px;">© ${new Date().getFullYear()} SubTrackt. All rights reserved.</p>
      </div>
    </div>
  `;
  },

  passwordReset: (resetLink: string) => `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1a1a1a; margin-bottom: 8px;">Reset Your Password</h1>
        <p style="color: #666; font-size: 16px;">You requested to reset your SubTrackt password</p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
        <p style="margin-bottom: 24px; line-height: 1.5;">
          Click the button below to reset your password. If you didn't request this, you can safely ignore this email.
        </p>
        
        <div style="text-align: center;">
          <a href="${resetLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Reset Password
          </a>
        </div>
        
        <p style="margin-top: 24px; font-size: 14px; color: #666;">
          This link will expire in 1 hour for security reasons.
        </p>
      </div>

      <div style="text-align: center; color: #666; font-size: 14px;">
        <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
        <p style="margin-top: 8px;">© ${new Date().getFullYear()} SubTrackt. All rights reserved.</p>
      </div>
    </div>
  `,

  welcome: (name: string) => `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1a1a1a; margin-bottom: 8px;">Welcome to SubTrackt!</h1>
        <p style="color: #666; font-size: 16px;">Thanks for joining us, ${name}</p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
        <p style="margin-bottom: 16px; line-height: 1.5;">
          We're excited to help you keep track of all your subscriptions in one place. With SubTrackt, you'll never miss a payment or renewal again.
        </p>
        
        <p style="margin-bottom: 16px; line-height: 1.5;">
          Here's what you can do with your new account:
        </p>

        <ul style="margin-bottom: 24px; padding-left: 20px; line-height: 1.5;">
          <li>Add and manage all your subscriptions</li>
          <li>Get reminders before renewals</li>
          <li>Track your monthly spending</li>
          <li>Organize services by categories</li>
        </ul>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            Get Started
          </a>
        </div>
      </div>

      <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Need help? Just reply to this email and we'll be happy to assist you.</p>
        <p style="margin-top: 8px;">© ${new Date().getFullYear()} SubTrackt. All rights reserved.</p>
      </div>
    </div>
  `,

  accountDeletion: (email: string) => `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1a1a1a; margin-bottom: 8px;">Account Deleted Successfully</h1>
        <p style="color: #666; font-size: 16px;">Thank you for using Subtrackt</p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
        <p style="margin-bottom: 16px; line-height: 1.5;">
          We're sorry to see you go. Your account and all associated data have been successfully deleted from our systems.
        </p>
        
        <p style="margin-bottom: 16px; line-height: 1.5;">
          If you change your mind, you're always welcome to create a new account and start tracking your subscriptions again.
        </p>
      </div>

      <div style="text-align: center; color: #666; font-size: 14px;">
        <p>Thank you for being a part of Subtrackt.</p>
        <p style="margin-top: 8px;">© ${new Date().getFullYear()} Subtrackt. All rights reserved.</p>
      </div>
    </div>
  `,

  combinedRenewalReminder: (subscriptions: any[]) => {
    const totalAmount = subscriptions.reduce((sum, sub) => 
      sum + parseFloat(sub.price_decimal || sub.price || 0), 0
    );

    const subscriptionsList = subscriptions
      .map(sub => {
        const price = parseFloat(sub.price_decimal || sub.price || 0);
        return `
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-weight: 500;">${sub.name}</div>
              <div style="color: #666; font-size: 14px; margin-top: 4px;">${sub.category || 'Uncategorized'}</div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">
              $${price.toFixed(2)}
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1a1a1a; margin-bottom: 8px;">Subscription Renewals Tomorrow</h1>
          <p style="color: #666; font-size: 16px;">You have ${subscriptions.length} subscription${subscriptions.length > 1 ? 's' : ''} renewing tomorrow</p>
        </div>

        <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 12px 16px; text-align: left; color: #666;">Service</th>
                <th style="padding: 12px 16px; text-align: right; color: #666;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${subscriptionsList}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 16px; font-weight: 600;">Total</td>
                <td style="padding: 16px; font-weight: 600; text-align: right;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="text-align: center;">
          <a href="https://subtrackt.ai/dashboard" 
             style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
            View Subscriptions
          </a>
        </div>

        <div style="text-align: center; color: #666; font-size: 14px; margin-top: 32px;">
          <p>To manage your subscriptions, log in to your Subtrackt dashboard.</p>
          <p style="margin-top: 8px;">© ${new Date().getFullYear()} Subtrackt. All rights reserved.</p>
        </div>
      </div>
    `;
  }
};