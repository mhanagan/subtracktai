"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Subscription } from '@/types/subscription';

interface StatsCardsProps {
  totalMonthly: number;
  activeSubscriptions: number;
  subscriptions: Subscription[];
}

function getUpcomingRenewals(subscriptions: Subscription[]): Subscription[] {
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  return subscriptions.filter(sub => {
    const renewalDate = new Date(sub.renewal_date);
    return renewalDate >= today && renewalDate <= sevenDaysFromNow;
  }).sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());
}

export function StatsCards({
  totalMonthly,
  activeSubscriptions,
  subscriptions,
}: StatsCardsProps) {
  const upcomingRenewals = getUpcomingRenewals(subscriptions);
  const totalUpcomingCharges = upcomingRenewals.reduce((sum, sub) => sum + sub.price, 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Monthly</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalMonthly.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubscriptions}</div>
        </CardContent>
      </Card>
      <Card className={upcomingRenewals.length > 0 ? "bg-primary/5 border-primary shadow-lg" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
          <Bell className={`h-4 w-4 ${upcomingRenewals.length > 0 ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">
              {upcomingRenewals.length} {upcomingRenewals.length === 1 ? "subscription" : "subscriptions"}
            </div>
            {upcomingRenewals.length > 0 && (
              <>
                <div className="text-sm text-muted-foreground">
                  Total upcoming charges: <span className="font-semibold text-primary">${totalUpcomingCharges.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  {upcomingRenewals.map(sub => (
                    <div key={sub.id} className="text-sm flex justify-between items-center">
                      <span className="font-medium">{sub.name}</span>
                      <span className="text-muted-foreground">{formatDate(sub.renewal_date)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}