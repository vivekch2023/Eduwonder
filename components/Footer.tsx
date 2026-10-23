'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Heart, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-colors pb-20 lg:pb-8 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                Edu<span className="text-violet-600 dark:text-violet-400">Wonder</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Free college notes, lecture PDFs, and online tests for college and university students.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safe & verified notes • Free for all students</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Explore
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link href="/notes" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  Subject-wise Notes
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  Practice Tests
                </Link>
              </li>
              <li>
                <Link href="/notes?filter=bookmarked" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  Teacher & Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Popular Subjects
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <li>Data Structures & Algorithms</li>
              <li>Database Management Systems</li>
              <li>Operating Systems</li>
              <li>Computer Networks</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} EduWonder. All rights reserved.</p>
          <p className="flex items-center gap-1">
Design by Zetavextech.in <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
