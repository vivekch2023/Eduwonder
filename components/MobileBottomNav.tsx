'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, HelpCircle, Bookmark, Shield } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { bookmarks } = useAppStore();

  // Don't show bottom nav inside active quiz arena or admin dashboard
  if (pathname.includes('/quiz/') && pathname !== '/quiz') {
    return null;
  }
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Notes', href: '/notes', icon: BookOpen },
    { label: 'Quiz', href: '/quiz', icon: HelpCircle },
    {
      label: 'Saved',
      href: '/notes?filter=bookmarked',
      icon: Bookmark,
      badge: bookmarks.length > 0 ? bookmarks.length : null,
    },
    { label: 'Admin', href: '/admin', icon: Shield },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-violet-600 dark:text-violet-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
