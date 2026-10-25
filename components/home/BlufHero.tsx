import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  HelpCircle,
  Search,
  CheckCircle2,
  FileCheck2,
  ShieldAlert,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

interface BlufHeroProps {
  subjectsCount: number;
  notesCount: number;
  quizzesCount: number;
}

/**
 * BLUF (Bottom Line Up Front) Architecture Component
 * Specifically engineered for high citation rates in:
 * - Google AI Overviews
 * - Perplexity AI Direct Answers
 * - ChatGPT Search Web Retrieval
 *
 * Provides a 48-word definitive entity summary followed by structured factual definitions.
 */
export default function BlufHero({
  subjectsCount,
  notesCount,
  quizzesCount,
}: BlufHeroProps) {
  return (
    <section
      aria-label="EduWonder Overview and Academic Resources"
      className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-violet-50/60 via-slate-50 to-white dark:from-violet-950/20 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80"
    >
      {/* Background radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-violet-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Entity & Verification Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 mb-6 border border-violet-200/60 dark:border-violet-800/50 shadow-sm">
            <GraduationCap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Open Educational Resource (OER) • B.Tech & University CS Curricula</span>
          </div>

          {/* H1 Primary Header with Core Keywords */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Engineering Lecture Notes &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-indigo-300 dark:to-purple-400">
              Anti-Cheat Online Tests
            </span>
          </h1>

          {/* BLUF Model: 48-Word Direct Factual Answer Summary for AI Scrapers */}
          <div className="mt-6 p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-violet-100 dark:border-slate-800 shadow-sm text-left sm:text-center max-w-3xl mx-auto">
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              <strong className="font-semibold text-slate-900 dark:text-white">
                EduWonder
              </strong>{' '}
              is a free, open-access academic repository offering university-aligned
              Computer Science lecture notes, unit-wise PDF downloads, and anti-cheat
              online MCQ examinations. Built for engineering students and educators, it
              provides peer-reviewed study materials for Data Structures, DBMS,
              Operating Systems, and Networks alongside browser-monitored practice tests.
            </p>
          </div>

          {/* Quick Search Bar */}
          <form
            action="/notes"
            method="GET"
            className="mt-8 max-w-xl mx-auto"
            role="search"
          >
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-violet-500/10 border border-slate-200 dark:border-slate-800 p-1.5 transition-all focus-within:ring-2 focus-within:ring-violet-500">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder="Search by topic (e.g., AVL Trees, Normalization, CPU Scheduling)..."
                className="w-full px-3 py-2 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                aria-label="Search study notes and syllabus topics"
              />
              <button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shrink-0 transition-colors shadow-md"
              >
                Search Notes
              </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/notes"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-2xl text-sm shadow-md shadow-violet-600/25 transition-all min-h-[44px]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Subject Notes</span>
            </Link>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 text-slate-900 dark:text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all min-h-[44px]"
            >
              <HelpCircle className="w-4 h-4 text-violet-500" />
              <span>Take an Online Quiz</span>
            </Link>
          </div>

          {/* Structured Factual Key Attributes (AEO Scrapeable Key-Value Matrix) */}
          <div className="mt-12 pt-8 border-t border-slate-200/70 dark:border-slate-800/70">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-violet-600" />
                  Delivery Format
                </dt>
                <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  Unit-wise PDF & Mobile View
                </dd>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  Test Integrity
                </dt>
                <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  Anti-Refresh & Tab Lock
                </dd>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Academic Cost
                </dt>
                <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  100% Free Open Access
                </dd>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  Active Curricula
                </dt>
                <dd className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {subjectsCount} Core CS Subjects
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
