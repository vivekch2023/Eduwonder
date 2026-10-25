'use client';

import React, { useEffect } from 'react';
import { ExternalLink, Star, ShieldCheck, Zap } from 'lucide-react';
import { triggerVignetteAd } from '@/lib/ad-helpers';

/**
 * Feed Ad Card with Monetag Vignette Banner Integration
 * Zone: 12119121 (https://n6wxm.com/vignette.min.js)
 * Highly effective native-like banner with Better Ads Standards compliance.
 */
export default function FeedAdCard() {
  useEffect(() => {
    triggerVignetteAd();
  }, []);

  return (
    <div
      onClick={triggerVignetteAd}
      className="relative overflow-hidden rounded-3xl border border-violet-200 dark:border-violet-800/80 bg-gradient-to-br from-violet-50/70 via-indigo-50/40 to-white dark:from-violet-950/30 dark:via-indigo-950/20 dark:to-slate-900 p-5 sm:p-6 shadow-sm my-5 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/60 px-2.5 py-1 rounded-full border border-violet-200/60 dark:border-violet-800">
          Sponsored Resource
        </span>
        <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>Verified Academic Feed</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            Solved Question Papers, PYQs & Quick Formula Sheets
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-xl leading-relaxed">
            High-yield revision guides, exam formula cheat sheets, and previous year university paper solutions curated for engineering students.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Free Access
            </span>
            <span>• Solved Papers</span>
            <span>• Semester Revision</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerVignetteAd();
          }}
          className="shrink-0 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-violet-600/25 transition-all group-hover:scale-105"
        >
          <span>Access Study Feed</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
