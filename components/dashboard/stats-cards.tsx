"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Bell, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Subscription } from '@/types/subscription';

interface StatsCardsProps {
  totalMonthly: number;
  activeSubscriptions: number;
  subscriptions: Subscription[];
}

export function StatsCards({ totalMonthly, activeSubscriptions, subscriptions }: StatsCardsProps) {
  const totalYearly = totalMonthly * 12;
  const upcomingRenewals = getUpcomingRenewals(subscriptions);

  return (
    <div className="grid gap-4 mb-8">
      {/* Top row with 3 cards */}
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
            <CardTitle className="text-sm font-medium">Total Yearly</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalYearly.toFixed(2)}</div>
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
      </div>

      {/* Bottom row with upcoming renewals card */}
      <Card className="col-span-full bg-gradient-to-br from-card to-muted">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">Upcoming Renewals</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">Next 7 days</div>
        </CardHeader>
        <CardContent className="pt-4">
          {upcomingRenewals.length > 0 ? (
            <div className="space-y-3">
              {upcomingRenewals.map((sub) => (
                <div 
                  key={sub.id} 
                  className="flex justify-between items-center p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{sub.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${sub.price.toFixed(2)}</span>
                    <div className="flex flex-col items-end">
                      <span>{new Date(sub.renewal_date + 'T00:00:00Z').toLocaleDateString(undefined, {
                        timeZone: 'UTC'
                      })}</span>
                      <span className="text-xs text-red-500 font-medium">
                        ({Math.ceil(
                          (new Date(sub.renewal_date + 'T00:00:00Z').getTime() - 
                           new Date().setHours(0, 0, 0, 0)) /
                          (1000 * 60 * 60 * 24)
                        )} days)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No upcoming renewals in the next 7 days</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getUpcomingRenewals(subscriptions: Subscription[]): Subscription[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return subscriptions
    .filter(sub => {
      const renewalDate = new Date(sub.renewal_date + 'T00:00:00Z');
      const daysUntil = Math.ceil(
        (renewalDate.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
      );
      return daysUntil >= 0 && daysUntil <= 7;
    })
    .sort((a, b) => 
      new Date(a.renewal_date + 'T00:00:00Z').getTime() - 
      new Date(b.renewal_date + 'T00:00:00Z').getTime()
    );
}