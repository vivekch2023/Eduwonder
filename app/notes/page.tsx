'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Note } from '@/lib/types';
import NoteCard from '@/components/notes/NoteCard';
import PdfPreviewModal from '@/components/notes/PdfPreviewModal';
import DownloadAdModal from '@/components/ads/DownloadAdModal';
import FeedAdCard from '@/components/ads/FeedAdCard';
import {
  BookOpen,
  Search,
  Filter,
  Bookmark,
  Layers,
  Sparkles,
  RotateCcw,
  FolderOpen,
} from 'lucide-react';

function NotesContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'ALL';
  const initialFilter = searchParams.get('filter') || 'ALL';

  const { subjects, notes, bookmarks, searchQuery, setSearchQuery } = useAppStore();

  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(initialFilter === 'bookmarked');

  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [downloadModalNote, setDownloadModalNote] = useState<Note | null>(null);

  // Available units for the selected subject
  const availableUnits = useMemo(() => {
    let filtered = notes;
    if (selectedSubject !== 'ALL') {
      filtered = filtered.filter((n) => n.subject_name === selectedSubject);
    }
    const unitsSet = new Set(filtered.map((n) => n.unit_no));
    return Array.from(unitsSet).sort((a, b) => a - b);
  }, [notes, selectedSubject]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Subject filter
      if (selectedSubject !== 'ALL' && n.subject_name !== selectedSubject) return false;
      // Unit filter
      if (selectedUnit !== 'ALL' && n.unit_no.toString() !== selectedUnit) return false;
      // Bookmarks filter
      if (showBookmarkedOnly && !bookmarks.includes(n.id)) return false;
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.lecture_title.toLowerCase().includes(q);
        const matchSubject = n.subject_name.toLowerCase().includes(q);
        const matchUnit = n.unit_name.toLowerCase().includes(q);
        const matchDesc = n.description.toLowerCase().includes(q);
        if (!matchTitle && !matchSubject && !matchUnit && !matchDesc) return false;
      }
      return true;
    });
  }, [notes, selectedSubject, selectedUnit, showBookmarkedOnly, searchQuery, bookmarks]);

  // Group notes by Unit
  const groupedByUnit = useMemo(() => {
    const groups: { [key: number]: { unitName: string; notes: Note[] } } = {};
    filteredNotes.forEach((note) => {
      if (!groups[note.unit_no]) {
        groups[note.unit_no] = {
          unitName: note.unit_name,
          notes: [],
        };
      }
      groups[note.unit_no].notes.push(note);
    });
    return groups;
  }, [filteredNotes]);

  const resetFilters = () => {
    setSelectedSubject('ALL');
    setSelectedUnit('ALL');
    setShowBookmarkedOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Study Notes
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Notes by Subject & Unit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Find, preview, and download chapter notes for your subjects.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm mb-8 space-y-4">
          {/* Search and Bookmarks Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search topic or note title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                  showBookmarkedOnly
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${showBookmarkedOnly ? 'fill-current' : ''}`} />
                <span>Saved Notes ({bookmarks.length})</span>
              </button>

              {(selectedSubject !== 'ALL' || selectedUnit !== 'ALL' || showBookmarkedOnly || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="p-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Subject Pills */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Subject:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  setSelectedSubject('ALL');
                  setSelectedUnit('ALL');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSubject === 'ALL'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Subjects ({notes.length})
              </button>
              {subjects.map((subj) => {
                const count = notes.filter((n) => n.subject_name === subj.name).length;
                return (
                  <button
                    key={subj.id}
                    onClick={() => {
                      setSelectedSubject(subj.name);
                      setSelectedUnit('ALL');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedSubject === subj.name
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {subj.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unit Pills */}
          {availableUnits.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Filter by Unit:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedUnit('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedUnit === 'ALL'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All Units
                </button>
                {availableUnits.map((u) => (
                  <button
                    key={u}
                    onClick={() => setSelectedUnit(u.toString())}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedUnit === u.toString()
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Unit {u}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Section: Hierarchical by Unit */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No matching notes found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn’t find notes matching your search or filters. Try adjusting your query or resetting filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-xl text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.keys(groupedByUnit)
              .map(Number)
              .sort((a, b) => a - b)
              .map((unitNum, unitIndex) => {
                const group = groupedByUnit[unitNum];
                return (
                  <div key={unitNum} className="space-y-4">
                    {/* Unit Header Banner */}
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                        U{unitNum}
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                          Unit {unitNum}: {group.unitName}
                        </h2>
                        <span className="text-xs text-slate-400">
                          {group.notes.length} Lecture Notes Available
                        </span>
                      </div>
                    </div>

                    {/* Notes in Unit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {group.notes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onPreview={(n) => setPreviewNote(n)}
                          onDownload={(n) => setDownloadModalNote(n)}
                        />
                      ))}
                    </div>

                    {/* Native Sponsor banner inserted between units */}
                    {unitIndex === 0 && <FeedAdCard />}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* PDF In-App Preview Modal */}
      <PdfPreviewModal
        note={previewNote}
        isOpen={!!previewNote}
        onClose={() => setPreviewNote(null)}
        onDownloadClick={(n) => setDownloadModalNote(n)}
      />

      {/* 5-Second Ad Countdown Download Interstitial Modal */}
      <DownloadAdModal
        note={downloadModalNote}
        isOpen={!!downloadModalNote}
        onClose={() => setDownloadModalNote(null)}
      />
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading notes library...</p>
          </div>
        </div>
      }
    >
      <NotesContent />
    </Suspense>
  );
}

