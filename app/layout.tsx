import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Subtrackt - Track Your Subscriptions',
  description: 'Never miss a subscription payment again with Subtrackt',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    images: [
      {
        url: '/subtrackt.jpg',
        width: 1200,
        height: 630,
        alt: 'Subtrackt Logo',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProviderWrapper>
          {children}
          <Toaster />
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}