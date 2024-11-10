"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Subscription } from '@/types/subscription';  // Update import to use shared type

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  subscription?: Subscription;
}

const defaultSubscription = {
  name: "",
  category: "",
  price: "",
  renewal_date: "",
  reminder_enabled: false,
};

export function SubscriptionDialog({
  open,
  onOpenChange,
  onSave,
  onDelete,
  subscription,
}: SubscriptionDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    if (open) {
      if (subscription) {
        // Editing existing subscription
        setName(subscription.name);
        setCategory(subscription.category);
        setPrice(subscription.price.toString());
        setRenewalDate(subscription.renewal_date);
        setReminderEnabled(subscription.reminder_enabled);
      } else {
        // Adding new subscription
        setName("");
        setCategory("");
        setPrice("");
        setRenewalDate("");
        setReminderEnabled(false);
      }
    }
  }, [open, subscription]);

  const handleSave = () => {
    const subscriptionData: Subscription = {
      id: subscription?.id ?? 0,
      name,
      category,
      price: parseFloat(price),
      renewal_date: renewalDate,
      reminder_enabled: reminderEnabled,
    };

    console.log('Saving subscription with renewal date:', renewalDate);

    onSave(subscriptionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {subscription ? "Edit Subscription" : "Add Subscription"}
          </DialogTitle>
          <DialogDescription>
            {subscription
              ? "Update your subscription details below"
              : "Add a new subscription to track"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Netflix, Spotify, etc."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Streaming">Streaming</SelectItem>
                <SelectItem value="AI Tools">AI Tools</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="Gaming">Gaming</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Monthly Price</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.99"
              step="0.01"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="renewalDate">Next Renewal Date</Label>
            <Input
              id="renewalDate"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="reminder"
              checked={reminderEnabled}
              onCheckedChange={(checked) => setReminderEnabled(checked as boolean)}
            />
            <Label htmlFor="reminder">
              Enable renewal reminder (1 day before charge)
            </Label>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {subscription && (
            <Button
              variant="destructive"
              onClick={() => onDelete?.(subscription)}
            >
              Delete
            </Button>
          )}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}