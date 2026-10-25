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
import { HelpCircle, Clock, ArrowRight, Lock } from 'lucide-react';

export default function HomeClientWrapper() {
  const { notes, quizzes, searchQuery } = useAppStore();

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

  return (
    <>
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Notes Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Study Material Feed
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Chapter-Wise Study Notes & PDFs
                </h3>
              </div>
              <span className="text-xs text-slate-400">{filteredNotes.length} Notes Available</span>
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
                <span>Browse Full Study Library</span>
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
                      Online Practice Exams
                    </h4>
                    <p className="text-[10px] text-slate-400">Timed Browser Integrity Tests</p>
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
                      <span>Start Timed Exam</span>
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
                    Anti-Cheat Browser Integrity Policy
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Browser reloads, tab navigation, or window blurring during an active test triggers an immediate auto-submission and account lock. Re-entry requires faculty administrator verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF & Download Modals */}
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
    </>
  );
}
