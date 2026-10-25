'use client';

import React, { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { X, Download, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { triggerVignetteAd } from '@/lib/ad-helpers';

interface DownloadAdModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadAdModal({ note, isOpen, onClose }: DownloadAdModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [downloadReady, setDownloadReady] = useState(false);
  const [hasTriggeredDownload, setHasTriggeredDownload] = useState(false);

  useEffect(() => {
    if (!isOpen || !note) {
      setCountdown(5);
      setDownloadReady(false);
      setHasTriggeredDownload(false);
      return;
    }

    // Trigger Monetag Vignette Ad when download flow initiates
    triggerVignetteAd();

    setCountdown(5);
    setDownloadReady(false);
    setHasTriggeredDownload(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDownloadReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, note]);

  // Trigger download when countdown hits 0
  useEffect(() => {
    if (downloadReady && !hasTriggeredDownload && note) {
      setHasTriggeredDownload(true);
      executeDownload();
    }
  }, [downloadReady, hasTriggeredDownload, note]);

  const executeDownload = () => {
    if (!note) return;
    triggerVignetteAd();
    const a = document.createElement('a');
    a.href = note.file_url;
    a.download = `${note.lecture_title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen || !note) return null;

  const progressPercent = ((5 - countdown) / 5) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 mb-2">
            Free PDF Notes
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {downloadReady ? 'Your Download Is Ready' : 'Preparing Your Download'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto truncate">
            {note.lecture_title}
          </p>
        </div>

        {/* Countdown / Status Section */}
        <div className="flex flex-col items-center justify-center py-4 mb-4">
          {!downloadReady ? (
            <>
              {/* Circular Countdown Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-violet-600 transition-all duration-1000 ease-linear"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-violet-600 dark:text-violet-400 font-mono">
                    {countdown}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">sec</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
                Please wait 5 seconds. Your download link is being created...
              </p>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Download started!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                File Size: {note.file_size || '3.5 MB'}
              </p>
            </div>
          )}
        </div>

        {/* Simple Sponsor Notice */}
        <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-slate-200 text-left mb-5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <span>Sponsored Notice</span>
            <span className="text-violet-600 dark:text-violet-400 font-bold">Study Tips</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Semester Exam Question Banks & Practice Sets
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Find solved questions, previous year papers, and chapter summaries to help you score well.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {downloadReady ? (
            <button
              onClick={executeDownload}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl shadow-md text-xs sm:text-sm min-h-[44px]"
            >
              <Download className="w-4 h-4" /> Download PDF Now
            </button>
          ) : (
            <button
              disabled
              className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 text-slate-400 font-semibold py-3 px-4 rounded-2xl text-xs sm:text-sm cursor-not-allowed min-h-[44px]"
            >
              <Download className="w-4 h-4" /> Ready in {countdown}s...
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm transition-colors min-h-[44px]"
          >
            Close
          </button>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Clean PDF Document Download</span>
        </div>
      </div>
    </div>
  );
}
