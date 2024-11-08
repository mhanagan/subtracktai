"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, LogOut } from "lucide-react";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SubscriptionDialog } from "@/components/dashboard/subscription-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface Subscription {
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

  // Load subscriptions from localStorage on initial render
  useEffect(() => {
    // Get current user's email from localStorage
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      // If no user is logged in, redirect to login
      router.push('/auth/login');
      return;
    }

    // Use user-specific key for storing subscriptions
    const savedSubscriptions = localStorage.getItem(`subscriptions_${userEmail}`);
    if (savedSubscriptions) {
      setSubscriptions(JSON.parse(savedSubscriptions));
    }
  }, [router]);

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

  const handleSave = (subscription: Subscription) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    let updatedSubscriptions: Subscription[];
    if (selectedSubscription) {
      updatedSubscriptions = subscriptions.map((sub) =>
        sub.id === selectedSubscription.id ? subscription : sub
      );
      toast({
        title: "Subscription updated",
        description: `${subscription.name} has been updated successfully.`,
      });
    } else {
      const newId = Math.max(0, ...subscriptions.map(s => s.id)) + 1;
      updatedSubscriptions = [...subscriptions, { ...subscription, id: newId }];
      toast({
        title: "Subscription added",
        description: `${subscription.name} has been added successfully.`,
      });
    }
    setSubscriptions(updatedSubscriptions);
    localStorage.setItem(`subscriptions_${userEmail}`, JSON.stringify(updatedSubscriptions));
    setDialogOpen(false);
  };

  const handleDelete = (subscription: Subscription) => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/auth/login');
      return;
    }

    const updatedSubscriptions = subscriptions.filter((sub) => sub.id !== subscription.id);
    setSubscriptions(updatedSubscriptions);
    localStorage.setItem(`subscriptions_${userEmail}`, JSON.stringify(updatedSubscriptions));
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
    localStorage.setItem(`subscriptions_${userEmail}`, JSON.stringify(updatedSubscriptions));
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
    <div className="container mx-auto p-6 space-y-8">
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
    </div>
  );
}