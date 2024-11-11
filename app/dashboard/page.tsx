"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut } from "lucide-react";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SubscriptionDialog } from "@/components/dashboard/subscription-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import DarkModeToggle from '@/components/DarkModeToggle';
import CategoryChart from '@/components/CategoryChart';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Subscription } from '@/types/subscription';
import { addMonths, parseISO, isSameDay } from 'date-fns';

function AddSubscriptionButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      className="h-[200px] w-full border-dashed"
      onClick={onClick}
    >
      <PlusCircle className="mr-2 h-5 w-5" />
      Add Subscription
    </Button>
  );
}

function updateRenewalDate(subscription: Subscription): Subscription {
  const today = new Date();
  const renewalDate = parseISO(subscription.renewal_date);
  
  // Check if today is the renewal date
  if (isSameDay(today, renewalDate)) {
    // Set the new renewal date to one month from the current renewal date
    const newRenewalDate = addMonths(renewalDate, 1);
    return {
      ...subscription,
      renewal_date: newRenewalDate.toISOString().split('T')[0]
    };
  }
  
  return subscription;
}

export default function DashboardPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription>();
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  // Load subscriptions from the database
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    async function fetchSubscriptions() {
      try {
        const response = await fetch('/api/subscriptions', {
          headers: {
            'user-email': userEmail || '',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }

        const data = await response.json();
        console.log('Fetched subscriptions:', data);
        setSubscriptions(data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        toast({
          title: "Error",
          description: "Failed to load subscriptions",
          variant: "destructive",
        });
      }
    }

    fetchSubscriptions();
  }, [router, toast]);

  // Add this effect to check and update renewal dates
  useEffect(() => {
    const updatedSubscriptions = subscriptions.map(updateRenewalDate);
    
    // Check if any subscriptions were updated
    const hasUpdates = updatedSubscriptions.some(
      (updated, index) => updated.renewal_date !== subscriptions[index].renewal_date
    );

    if (hasUpdates) {
      // Update the local state
      setSubscriptions(updatedSubscriptions);

      // Update the database
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      // Update each modified subscription in the database
      updatedSubscriptions.forEach(async (subscription) => {
        const original = subscriptions.find(s => s.id === subscription.id);
        if (original?.renewal_date !== subscription.renewal_date) {
          try {
            await fetch('/api/subscriptions', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'user-email': userEmail
              },
              body: JSON.stringify({
                ...subscription,
                renewalDate: subscription.renewal_date,
                userEmail
              })
            });

            toast({
              title: "Renewal Date Updated",
              description: `${subscription.name}'s next renewal date has been set to ${new Date(subscription.renewal_date).toLocaleDateString()}`,
            });
          } catch (error) {
            console.error('Error updating renewal date:', error);
            toast({
              title: "Error",
              description: "Failed to update renewal date",
              variant: "destructive",
            });
          }
        }
      });
    }
  }, [subscriptions, toast]);

  const handleLogout = () => {
    // Clear user-specific data
    localStorage.removeItem('userEmail');
    router.push('/');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
  };

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'price') {
      return sortOrder === 'asc' 
        ? a.price - b.price
        : b.price - a.price;
    } else {
      // Sort by date
      return sortOrder === 'asc'
        ? new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()
        : new Date(b.renewal_date).getTime() - new Date(a.renewal_date).getTime();
    }
  });

  const handleSortChange = (newSortBy: 'name' | 'price' | 'date') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleSave = async (subscription: Subscription) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    try {
      const method = selectedSubscription ? 'PUT' : 'POST';
      
      // Format the subscription data to match the API expectations
      const formattedSubscription = {
        id: subscription.id,
        name: subscription.name,
        category: subscription.category,
        price: subscription.price,
        renewalDate: subscription.renewal_date,
        reminderEnabled: subscription.reminder_enabled,
        userEmail
      };

      console.log('Sending subscription data:', formattedSubscription);

      const response = await fetch('/api/subscriptions', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'user-email': userEmail
        },
        body: JSON.stringify(formattedSubscription)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save subscription');
      }

      const savedSubscription = await response.json();
      console.log('Saved subscription:', savedSubscription);

      let updatedSubscriptions: Subscription[];
      if (selectedSubscription) {
        updatedSubscriptions = subscriptions.map((sub) =>
          sub.id === selectedSubscription.id ? savedSubscription : sub
        );
      } else {
        updatedSubscriptions = [...subscriptions, savedSubscription];
      }

      setSubscriptions(updatedSubscriptions);
      setDialogOpen(false);
      toast({
        title: selectedSubscription ? "Subscription updated" : "Subscription added",
        description: `${subscription.name} has been ${selectedSubscription ? 'updated' : 'added'} successfully.`,
      });
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save subscription",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (subscription: Subscription) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`/api/subscriptions?id=${subscription.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user-email': userEmail
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscription');
      }

      const updatedSubscriptions = subscriptions.filter((sub) => sub.id !== subscription.id);
      setSubscriptions(updatedSubscriptions);
      setDialogOpen(false);
      toast({
        title: "Subscription deleted",
        description: `${subscription.name} has been removed.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive",
      });
    }
  };

  const handleToggleReminder = (subscription: Subscription) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    const updatedSubscriptions = subscriptions.map((sub) =>
      sub.id === subscription.id
        ? { ...sub, reminder_enabled: !sub.reminder_enabled }
        : sub
    );
    setSubscriptions(updatedSubscriptions);
    toast({
      title: subscription.reminder_enabled ? "Reminder disabled" : "Reminder enabled",
      description: subscription.reminder_enabled
        ? `Reminders turned off for ${subscription.name}`
        : `You will be notified one day before ${subscription.name} renews`,
    });
  };

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const activeSubscriptions = subscriptions.length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-16">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold">
              Subtrackt Dashboard
            </h1>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  size="sm"
                >
                  <LogOut className="mr-1 h-3 w-3" />
                  Logout
                </Button>
                <DarkModeToggle />
              </div>
            </div>
          </header>

          <StatsCards
            totalMonthly={totalMonthly}
            activeSubscriptions={activeSubscriptions}
            subscriptions={subscriptions}
          />

          {/* Sort buttons moved here */}
          <div className="flex justify-end mb-4">
            <div className="flex gap-1">
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                onClick={() => handleSortChange('name')}
                size="sm"
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                onClick={() => handleSortChange('price')}
                size="sm"
              >
                Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant={sortBy === 'date' ? 'default' : 'outline'}
                onClick={() => handleSortChange('date')}
                size="sm"
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onEdit={() => {
                  setSelectedSubscription(subscription);
                  setDialogOpen(true);
                }}
                onToggleReminder={handleToggleReminder}
              />
            ))}
            <AddSubscriptionButton
              onClick={() => {
                setSelectedSubscription(undefined);
                setDialogOpen(true);
              }}
            />
          </div>

          <SubscriptionDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSave={handleSave}
            onDelete={handleDelete}
            subscription={selectedSubscription}
          />

          {/* Add the CategoryChart below the subscriptions */}
          <div className="mt-12">
            <CategoryChart subscriptions={subscriptions} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}