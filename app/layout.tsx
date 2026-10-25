import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AppProvider } from '@/lib/store';
import HeaderAdBanner from '@/components/ads/HeaderAdBanner';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { siteConfig } from '@/lib/site-config';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'EduWonder | College Notes & Anti-Cheat MCQ Quiz System',
    template: '%s | EduWonder',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  category: siteConfig.category,
  keywords: siteConfig.primaryKeywords,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'EduWonder | College Notes & Anti-Cheat MCQ Quiz System',
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'EduWonder Open Educational Notes and Anti-Cheat Exam Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduWonder | College Notes & Anti-Cheat MCQ Quiz System',
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
  verification: {
    google: siteConfig.googleSiteVerification,
  },
  other: {
    monetag: '64ee5ef3760beefe095894a784734c19',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="monetag" content="64ee5ef3760beefe095894a784734c19" />
        <meta
          name="google-site-verification"
          content={siteConfig.googleSiteVerification}
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider>
          <AppProvider>
            <HeaderAdBanner />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <MobileBottomNav />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
