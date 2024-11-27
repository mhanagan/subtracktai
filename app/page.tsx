"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Wallet, CreditCard, Bell, ArrowRight } from "lucide-react";
import Image from 'next/image';
import { PrivacyPolicyDialog } from "@/components/privacy-policy-dialog";

// Create a client-side only footer component
function Footer() {
  return (
    <footer className="mt-auto py-6 text-center border-t">
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Subtrackt</span>
        <PrivacyPolicyDialog />
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <Image
          src="/subtrack.png"
          alt="Subtrack Logo"
          width={180}
          height={37}
          priority
        />
        <div className="flex flex-col items-center w-full max-w-5xl gap-6 md:gap-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            Track Your Subscriptions<br />
            Avoid those surprise charges
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl px-4">
            Keep track of all your subscriptions in one place. Get reminders before renewals and stay on top of your recurring payments.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full px-4 sm:px-0">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/register">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl px-4">
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Wallet className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Track Expenses</h3>
          <p className="text-muted-foreground">
            Monitor all your subscription costs in one dashboard. Get insights into your monthly spending.
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-lg">
          <CreditCard className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Manage Services</h3>
          <p className="text-muted-foreground">
            Add and manage all your subscription services. Keep your digital services organized.
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Bell className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Smart Reminders</h3>
          <p className="text-muted-foreground">
            Get notified before renewals. Never be surprised by an automatic payment again.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="w-full max-w-5xl text-center px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Popular Services We Help You Track</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-8 items-center justify-center">
          {/* Service items */}
          <ServiceLogo src="/logos/netflix.png" name="Netflix" />
          <ServiceLogo src="/logos/chatgpt.png" name="ChatGPT" />
          <ServiceLogo src="/logos/prime.png" name="Prime" />
          <ServiceLogo src="/logos/spotify.png" name="Spotify" />
          <ServiceLogo src="/logos/appletv.png" name="Apple TV+" />
          <ServiceLogo src="/logos/midjourney.png" name="Midjourney" />
        </div>
      </div>

      {/* Replace the existing footer with the new component */}
      <Footer />
    </main>
  );
}

// Helper component for service logos
function ServiceLogo({ src, name }: { src: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-12 w-12 md:h-16 md:w-16 relative">
        <Image
          src={src}
          alt={name}
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}