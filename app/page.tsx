import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Wallet, CreditCard, Bell, ArrowRight, MonitorPlay, Music, Bot, ShoppingCart, Tv, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Track Your Subscriptions
            <br />
            <span className="text-primary">Never Miss a Payment</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
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
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
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

        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">Popular Services We Help You Track</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <MonitorPlay className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-medium">Netflix</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium">ChatGPT</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium">Prime</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Music className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium">Spotify</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-900/20 flex items-center justify-center">
                <Tv className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium">Apple TV+</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium">Midjourney</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}