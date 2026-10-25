'use client';

import React, { useState } from 'react';
import { Sparkles, ExternalLink, X } from 'lucide-react';

export default function HeaderAdBanner() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="relative bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-900 text-white px-4 py-2.5 shadow-sm text-xs sm:text-sm border-b border-violet-800/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1 bg-amber-400 text-violet-950 font-bold px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase">
            Notice
          </span>
          <span className="text-amber-200 font-semibold truncate">
            Semester Exam Question Banks & Practice Papers Available
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://uplcm.com/4/12119025"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-white text-violet-900 hover:bg-violet-50 font-semibold px-3 py-1 rounded-md text-xs transition-colors shadow-sm"
          >
            Check Out
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setClosed(true)}
            className="text-violet-300 hover:text-white p-1 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
