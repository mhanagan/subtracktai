"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Edit2, Bell, BellOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Subscription } from '@/types/subscription';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: () => void;
  onToggleReminder: (subscription: Subscription) => void;
}

export function SubscriptionCard({ subscription, onEdit, onToggleReminder }: SubscriptionCardProps) {
  const { toast } = useToast();
  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.renewal_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const handleToggleReminder = () => {
    onToggleReminder(subscription);
    toast({
      title: subscription.reminder_enabled ? "Reminder disabled" : "Reminder enabled",
      description: subscription.reminder_enabled
        ? `Reminders turned off for ${subscription.name}`
        : `You will be notified one day before ${subscription.name} renews`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{subscription.name}</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleReminder}
            className="hover:text-primary"
          >
            {subscription.reminder_enabled ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium">{subscription.category}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Monthly Price
            </span>
            <span className="font-medium">
              ${subscription.price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Next Renewal
            </span>
            <span className="font-medium">
              {new Date(subscription.renewal_date).toLocaleDateString()}
              {daysUntilRenewal <= 7 && (
                <span className="ml-2 text-xs text-red-500">
                  ({daysUntilRenewal} days)
                </span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}