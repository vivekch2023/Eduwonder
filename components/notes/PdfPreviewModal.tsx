'use client';

import React, { useState } from 'react';
import { Note } from '@/lib/types';
import { X, Download, Maximize2, Minimize2, ExternalLink, FileText, Sparkles } from 'lucide-react';

interface PdfPreviewModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadClick: (note: Note) => void;
}

export default function PdfPreviewModal({
  note,
  isOpen,
  onClose,
  onDownloadClick,
}: PdfPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        className={`relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none m-0' : 'w-full max-w-5xl h-[94vh] sm:h-[88vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/80 px-2 py-0.5 rounded-md">
                  Unit {note.unit_no}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {note.subject_name}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {note.lecture_title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download with Ad Trigger */}
            <button
              onClick={() => {
                onClose();
                onDownloadClick(note);
              }}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs sm:text-sm shadow-md shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">Get</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* External Tab */}
            <a
              href={note.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Note Info & Description Strip */}
        <div className="px-5 py-2 bg-violet-50/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <p className="truncate max-w-2xl">{note.description}</p>
          <div className="flex items-center gap-3 text-slate-400 text-[11px] shrink-0">
            <span>Size: {note.file_size || '3.5 MB'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-violet-500 font-medium">
              <Sparkles className="w-3 h-3" /> Live Reader
            </span>
          </div>
        </div>

        {/* PDF Frame Viewer */}
        <div className="flex-1 w-full h-full bg-slate-100 dark:bg-slate-950 relative">
          <iframe
            src={`${note.file_url}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title={note.lecture_title}
          />
        </div>
      </div>
    </div>
  );
}
