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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest'
      }
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
      <head>
        {/* Android Chrome */}
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProviderWrapper>
          {children}
          <Toaster />
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}