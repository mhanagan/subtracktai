"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ManageAccountDialogProps {
  userEmail: string;
  onLogout: () => void;
}

export function ManageAccountDialog({ userEmail, onLogout }: ManageAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(userEmail);
  const { toast } = useToast();

  const handleUpdateEmail = async () => {
    try {
      const response = await fetch('/api/user/update-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-email': userEmail
        },
        body: JSON.stringify({ newEmail: email })
      });

      if (!response.ok) throw new Error('Failed to update email');

      toast({
        title: "Email Updated",
        description: "Your account email has been updated successfully.",
      });
      
      // Update local storage with new email
      localStorage.setItem('userEmail', email);
      setOpen(false);
      
      // Force refresh to update UI
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user-email': userEmail
        }
      });

      if (!response.ok) throw new Error('Failed to delete account');

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      // Clear local storage and redirect to home
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Manage Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Account</DialogTitle>
          <DialogDescription>
            Update your account settings or delete your account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label>Email Address</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <Button onClick={handleUpdateEmail} className="mt-2">
              Update Email
            </Button>
          </div>

          <div className="border-t pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and all associated data, including all your subscription
                    records and settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 