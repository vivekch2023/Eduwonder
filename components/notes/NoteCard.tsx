'use client';

import React from 'react';
import { Note } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { FileText, Download, Eye, Bookmark, Share2 } from 'lucide-react';
import { triggerVignetteAd } from '@/lib/ad-helpers';

interface NoteCardProps {
  note: Note;
  onPreview: (note: Note) => void;
  onDownload: (note: Note) => void;
}

export default function NoteCard({ note, onPreview, onDownload }: NoteCardProps) {
  const { isBookmarked, toggleBookmark } = useAppStore();
  const bookmarked = isBookmarked(note.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note.lecture_title,
        text: `Check out ${note.lecture_title} for ${note.subject_name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700/60 transition-all duration-300">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 px-2.5 py-1 rounded-lg">
              Unit {note.unit_no}
            </span>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg truncate max-w-[160px]">
              {note.unit_name}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleBookmark(note.id)}
              className={`p-2 rounded-xl transition-all ${
                bookmarked
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={bookmarked ? 'Remove Bookmark' : 'Bookmark Note'}
              aria-label="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share Note"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {note.lecture_title}
        </h4>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
          {note.description}
        </p>

        {/* Subject tag */}
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <FileText className="w-3.5 h-3.5 text-violet-500" />
          <span className="font-medium text-slate-700 dark:text-slate-300">{note.subject_name}</span>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>{note.file_size || '3.5 MB'} PDF</span>
          <span>•</span>
          <span>{note.download_count || 120}+ downloads</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview Button */}
          <button
            onClick={() => onPreview(note)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 font-semibold text-xs transition-colors min-h-[44px]"
          >
            <Eye className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Preview</span>
          </button>

          {/* Download with 5s countdown Ad */}
          <button
            onClick={() => {
              triggerVignetteAd();
              onDownload(note);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
