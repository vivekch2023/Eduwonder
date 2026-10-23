'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Note } from '@/lib/types';
import NoteCard from '@/components/notes/NoteCard';
import PdfPreviewModal from '@/components/notes/PdfPreviewModal';
import DownloadAdModal from '@/components/ads/DownloadAdModal';
import FeedAdCard from '@/components/ads/FeedAdCard';
import SidebarAdCard from '@/components/ads/SidebarAdCard';
import {
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Download,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Database,
  Cpu,
  Globe,
  FileCheck2,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  const { subjects, notes, quizzes, searchQuery, setSearchQuery } = useAppStore();

  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [downloadModalNote, setDownloadModalNote] = useState<Note | null>(null);

  // Filter notes based on global search query
  const filteredNotes = notes.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.lecture_title.toLowerCase().includes(q) ||
      n.subject_name.toLowerCase().includes(q) ||
      n.unit_name.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q)
    );
  });

  const getSubjectIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Layers':
        return Layers;
      case 'Database':
        return Database;
      case 'Cpu':
        return Cpu;
      case 'Globe':
        return Globe;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-violet-50/50 via-slate-50 to-white dark:from-violet-950/20 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-violet-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 mb-6 border border-violet-200/60 dark:border-violet-800/50 shadow-sm animate-pulse-subtle">
              <span>Study Notes & Online Practice Tests</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              College Notes &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-indigo-300 dark:to-purple-400">
                Chapter Tests
              </span>{' '}
              Made Simple.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Find and download chapter-wise PDF notes, preview them on your phone, and practice with timed online quizzes.
            </p>

            {/* Quick Search */}
            <div className="mt-8 max-w-xl mx-auto">
              <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-violet-500/10 border border-slate-200 dark:border-slate-800 p-1.5 transition-all focus-within:ring-2 focus-within:ring-violet-500">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by subject or topic name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  onClick={() => {}}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shrink-0 transition-colors shadow-md"
                >
                  Search
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-2xl text-sm shadow-md shadow-violet-600/25 transition-all min-h-[44px]"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Study Notes</span>
              </Link>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 text-slate-900 dark:text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all min-h-[44px]"
              >
                <HelpCircle className="w-4 h-4 text-violet-500" />
                <span>Take a Quiz</span>
              </Link>
            </div>

            {/* Stat Counters */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-slate-200/70 dark:border-slate-800/70">
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400 font-mono">
                  {subjects.length}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Subjects</p>
              </div>
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400 font-mono">
                  {notes.length}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">PDF Notes</p>
              </div>
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400 font-mono">
                  {quizzes.length}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Online Tests</p>
              </div>
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400 font-mono">
                  Free
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Open to Students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUBJECT-WISE QUICK BROWSER */}
      <section className="py-12 bg-white dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Subjects
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Browse by Subject
              </h2>
            </div>
            <Link
              href="/notes"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 group"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {subjects.map((subj) => {
              const SubjIcon = getSubjectIcon(subj.icon);
              const subjectNotes = notes.filter((n) => n.subject_name === subj.name);
              const unitsCount = new Set(subjectNotes.map((n) => n.unit_no)).size || 1;

              return (
                <Link
                  key={subj.id}
                  href={`/notes?subject=${encodeURIComponent(subj.name)}`}
                  className="group relative flex flex-col justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 hover:border-violet-500/50 hover:shadow-lg transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <SubjIcon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {subj.code}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {subj.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {subj.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{unitsCount} Units Available</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Browse <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. LECTURE NOTES FEED & MONETIZATION SIDEBAR */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Notes Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Study Material
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Chapter-Wise Study Notes
                </h3>
              </div>
              <span className="text-xs text-slate-400">{filteredNotes.length} Notes</span>
            </div>

            {/* Notes Cards */}
            <div className="grid grid-cols-1 gap-5">
              {filteredNotes.slice(0, 3).map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPreview={(n) => setPreviewNote(n)}
                  onDownload={(n) => setDownloadModalNote(n)}
                />
              ))}

              {/* Native In-Feed Ad Banner */}
              <FeedAdCard />

              {filteredNotes.slice(3, 6).map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPreview={(n) => setPreviewNote(n)}
                  onDownload={(n) => setDownloadModalNote(n)}
                />
              ))}
            </div>

            <div className="text-center pt-4">
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-colors"
              >
                <span>Browse All Notes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Sidebar: Ads & Live Quizzes Preview (1 col) */}
          <div className="space-y-6">
            {/* Desktop Sticky Sidebar Ad */}
            <SidebarAdCard />

            {/* Live MCQ Quizzes Widget */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Online Tests & Quizzes
                    </h4>
                    <p className="text-[10px] text-slate-400">Timed Practice Tests</p>
                  </div>
                </div>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 truncate">
                        {quiz.subject_name}
                      </span>
                      {quiz.is_approved ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                          Active Now
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full shrink-0">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <h5 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {quiz.title}
                    </h5>

                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {quiz.duration_minutes} Mins
                      </span>
                      <span>•</span>
                      <span>{quiz.total_marks} Marks</span>
                    </div>

                    <Link
                      href={`/quiz/${quiz.id}`}
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-3 rounded-xl text-xs shadow-sm transition-colors"
                    >
                      <span>Start Quiz</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Rules Box */}
            <div className="bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                    Important Quiz Rules
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Do not refresh or leave the page while taking a test. Refreshing will automatically submit your quiz and lock it. Only your teacher can unlock it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MODALS */}
      <PdfPreviewModal
        note={previewNote}
        isOpen={!!previewNote}
        onClose={() => setPreviewNote(null)}
        onDownloadClick={(n) => setDownloadModalNote(n)}
      />

      <DownloadAdModal
        note={downloadModalNote}
        isOpen={!!downloadModalNote}
        onClose={() => setDownloadModalNote(null)}
      />
    </div>
  );
}
