"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManageAccountDialog } from "@/components/dashboard/manage-account-dialog";
import DarkModeToggle from '@/components/DarkModeToggle';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userEmail');
      await signOut({ redirect: false });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b w-full">
        <div className="max-w-7xl mx-auto w-full flex h-16 items-center justify-between px-4">
          <div className="text-lg font-bold">Subtrackt Dashboard</div>
          <div className="flex items-center gap-2">
            <ManageAccountDialog userEmail={userEmail} onLogout={handleLogout} />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <DarkModeToggle />
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center w-full">
        <div className="max-w-7xl w-full mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
} 