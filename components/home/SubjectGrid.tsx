import React from 'react';
import Link from 'next/link';
import { Subject } from '@/lib/types';
import { Layers, Database, Cpu, Globe, BookOpen, ArrowRight } from 'lucide-react';

interface SubjectGridProps {
  subjects: Subject[];
}

export default function SubjectGrid({ subjects }: SubjectGridProps) {
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
    <section
      aria-label="Computer Science Subject Directory"
      className="py-12 bg-white dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Syllabus Curricula
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Browse Notes by Engineering Subject
            </h2>
          </div>
          <Link
            href="/notes"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 group"
          >
            <span>View Full Syllabus Directory</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {subjects.map((subj) => {
            const SubjIcon = getSubjectIcon(subj.icon);

            return (
              <Link
                key={subj.id}
                href={`/notes?subject=${encodeURIComponent(subj.name)}`}
                className="group relative flex flex-col justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 hover:border-violet-500/50 hover:shadow-lg transition-all"
                title={`${subj.name} (${subj.code || 'CS'}) Notes and Question Bank`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <SubjIcon className="w-6 h-6" />
                    </div>
                    {subj.code && (
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {subj.code}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {subj.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {subj.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Unit-wise Notes Available</span>
                  <span className="font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
