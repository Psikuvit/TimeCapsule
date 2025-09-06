import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import JsonLd from '@/components/JsonLd';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'TimeCapsule - Send Messages to Your Future Self',
    template: '%s | TimeCapsule'
  },
  description: 'Create and schedule time capsule messages to your future self. TimeCapsule helps you capture moments, set goals, and reflect on your journey over time.',
  keywords: [
    'time capsule',
    'future self',
    'messages',
    'goals',
    'reflection',
    'self-improvement',
    'personal growth',
    'scheduled messages',
    'diary',
    'journal'
  ],
  authors: [{ name: 'TimeCapsule Team' }],
  creator: 'TimeCapsule',
  publisher: 'TimeCapsule',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://time-capsule-xi.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TimeCapsule - Send Messages to Your Future Self',
    description: 'Create and schedule time capsule messages to your future self. Capture moments, set goals, and reflect on your journey.',
    url: 'https://time-capsule-xi.vercel.app',
    siteName: 'TimeCapsule',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'TimeCapsule - Send Messages to Your Future Self',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TimeCapsule - Send Messages to Your Future Self',
    description: 'Create and schedule time capsule messages to your future self. Capture moments, set goals, and reflect on your journey.',
    images: ['/icon.svg'],
    creator: '@timecapsule',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T3Y3PT7SSZ"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T3Y3PT7SSZ');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
