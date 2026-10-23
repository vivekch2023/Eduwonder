import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AppProvider } from '@/lib/store';
import HeaderAdBanner from '@/components/ads/HeaderAdBanner';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'EduWonder - Subject-wise PDF Notes & Anti-Cheat MCQ Quiz System',
  description:
    'Comprehensive subject-wise, unit-wise and lecture-wise study notes, high-speed PDF downloads with ad monetization, and strict anti-cheat online MCQ examination portal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
