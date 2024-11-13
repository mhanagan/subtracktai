"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManageAccountDialog } from "@/components/dashboard/manage-account-dialog";
import DarkModeToggle from '@/components/DarkModeToggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    window.location.href = '/auth/login';
  };

  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
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
      <main className="container py-6 px-4">{children}</main>
    </div>
  );
} 