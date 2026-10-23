'use client';

import React from 'react';
import { ExternalLink, Star, ShieldCheck, Zap } from 'lucide-react';

export default function FeedAdCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-violet-300 dark:border-violet-700/60 bg-gradient-to-br from-violet-50/60 via-indigo-50/40 to-amber-50/30 dark:from-violet-950/20 dark:via-indigo-950/20 dark:to-slate-900 p-5 shadow-sm my-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/60 px-2.5 py-0.5 rounded-full">
          Study Partner
        </span>
        <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>4.9 / 5</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Solved Question Papers & Quick Formula Sheets
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Helpful summary sheets, solved problems, and key formulas to revise quickly before your exams.
          </p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Checked by Teachers</span>
            <span>• Free Preview</span>
            <span>• Easy to Read</span>
          </div>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
        >
          <span>View Notes</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
