import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Wallet, CreditCard, Bell, ArrowRight } from "lucide-react";
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 gap-12">
      {/* Logo and Header Section */}
      <div className="flex flex-col items-center max-w-5xl w-full gap-8">
        <div className="w-[900px] h-[300px] relative">
          <Image
            src="/subtrackt.jpg"
            alt="Subtrackt Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        
        <h1 className="text-4xl font-bold text-center">
          Track Your Subscriptions<br />
          Never Miss a Payment
        </h1>

        <p className="text-xl text-muted-foreground text-center max-w-2xl">
          Keep track of all your subscriptions in one place. Get reminders before renewals and stay on top of your recurring payments.
        </p>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/register">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl w-full">
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
      <div className="max-w-5xl w-full text-center">
        <h2 className="text-2xl font-bold mb-8">Popular Services We Help You Track</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 relative">
              <Image
                src="/logos/netflix.png"
                alt="Netflix"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span className="text-sm font-medium">Netflix</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 relative">
              <Image
                src="/logos/chatgpt.png"
                alt="ChatGPT"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span className="text-sm font-medium">ChatGPT</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 relative">
              <Image
                src="/logos/prime.png"
                alt="Prime Video"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span className="text-sm font-medium">Prime</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 relative">
              <Image
                src="/logos/spotify.png"
                alt="Spotify"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span className="text-sm font-medium">Spotify</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 relative">
              <Image
                src="/logos/appletv.png"
                alt="Apple TV+"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span className="text-sm font-medium">Apple TV+</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 relative">
              <Image
                src="/logos/midjourney.png"
                alt="Midjourney"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span className="text-sm font-medium">Midjourney</span>
          </div>
        </div>
      </div>
    </main>
  );
}