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

export interface Subscription {
  id: number;
  name: string;
  category: string;
  price: number;
  renewalDate: string;
  reminderEnabled: boolean;
}

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

export default function DashboardPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription>();
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
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
    } else {
      return sortOrder === 'asc' 
        ? a.price - b.price
        : b.price - a.price;
    }
  });

  const handleSortChange = (newSortBy: 'name' | 'price') => {
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
      const response = await fetch('/api/subscriptions', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'user-email': userEmail
        },
        body: JSON.stringify({
          ...subscription,
          userEmail,
          renewalDate: new Date(subscription.renewalDate).toISOString().split('T')[0]
        })
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

  const handleDelete = (subscription: Subscription) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    const updatedSubscriptions = subscriptions.filter((sub) => sub.id !== subscription.id);
    setSubscriptions(updatedSubscriptions);
    setDialogOpen(false);
    toast({
      title: "Subscription deleted",
      description: `${subscription.name} has been removed.`,
      variant: "destructive",
    });
  };

  const handleToggleReminder = (subscription: Subscription) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    const updatedSubscriptions = subscriptions.map((sub) =>
      sub.id === subscription.id
        ? { ...sub, reminderEnabled: !sub.reminderEnabled }
        : sub
    );
    setSubscriptions(updatedSubscriptions);
    toast({
      title: subscription.reminderEnabled ? "Reminder disabled" : "Reminder enabled",
      description: subscription.reminderEnabled
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
          <header className="flex justify-between items-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Subtrackt Dashboard
            </h1>
            <DarkModeToggle />
          </header>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Your Subscriptions</h1>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'name' ? 'default' : 'outline'}
                  onClick={() => handleSortChange('name')}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
                <Button
                  variant={sortBy === 'price' ? 'default' : 'outline'}
                  onClick={() => handleSortChange('price')}
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <StatsCards
            totalMonthly={totalMonthly}
            activeSubscriptions={activeSubscriptions}
            subscriptions={subscriptions}
          />

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