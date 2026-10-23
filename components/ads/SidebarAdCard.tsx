'use client';

import React from 'react';
import { ExternalLink, Award, Gift, ChevronRight } from 'lucide-react';

export default function SidebarAdCard() {
  return (
    <div className="bg-gradient-to-b from-indigo-900 to-violet-950 text-white rounded-2xl p-5 shadow-lg border border-indigo-700/50 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-violet-300 mb-3">
        <span>Helpful Tip</span>
        <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">
          FREE GUIDE
        </span>
      </div>

      <h4 className="text-sm font-bold text-white leading-snug">
        College Placement & Resume Preparation
      </h4>
      <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
        Simple checklist and sample projects to prepare your resume for campus interviews.
      </p>

      <div className="my-3 py-2 px-3 bg-white/10 rounded-xl backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] text-white font-medium">Free Download</span>
        </div>
        <span className="text-xs font-bold text-amber-300">PDF Guide</span>
      </div>

      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs transition-colors shadow-md"
      >
        <span>Open Guide</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
