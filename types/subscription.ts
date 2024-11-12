export interface Subscription {
  id: number;
  name: string;
  category: string;
  price: number;
  renewal_date: string;
  reminder_enabled: boolean;
  user_email?: string;
  timezone: string;
} 