'use client';

import React from 'react';
import { QuizAttempt, Quiz, Question } from '@/lib/types';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface InspectStudentPaperModalProps {
  attempt: QuizAttempt | null;
  quiz?: Quiz;
  questions: Question[];
  isOpen: boolean;
  onClose: () => void;
}

export default function InspectStudentPaperModal({
  attempt,
  quiz,
  questions,
  isOpen,
  onClose,
}: InspectStudentPaperModalProps) {
  if (!isOpen || !attempt) return null;

  const quizQuestions = questions.filter((q) => q.quiz_id === attempt.quiz_id);
  const percentage =
    attempt.total_marks > 0
      ? ((attempt.score / attempt.total_marks) * 100).toFixed(0)
      : '0';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Paper Inspection
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              {attempt.student_name}{' '}
              <span className="font-mono text-sm opacity-90">({attempt.roll_number})</span>
            </h3>
            <p className="text-xs text-violet-100 mt-0.5">
              {quiz?.title || 'Examination Answer Sheet'} • Subject:{' '}
              {quiz?.subject_name || 'General'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Close answer sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score & Status Summary Banner */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 text-center">
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Total Marks</span>
            <span className="text-base sm:text-lg font-black text-violet-600 dark:text-violet-400 font-mono">
              {attempt.score} / {attempt.total_marks}
            </span>
          </div>

          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Percentage</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {percentage}%
            </span>
          </div>

          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Attempt Status</span>
            <span
              className={`text-xs font-bold ${
                attempt.is_blocked
                  ? 'text-rose-600'
                  : attempt.status === 'submitted'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {attempt.is_blocked ? 'BLOCKED' : attempt.status.toUpperCase()}
            </span>
          </div>

          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Submitted</span>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
              {attempt.submitted_at
                ? new Date(attempt.submitted_at).toLocaleTimeString()
                : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Security Violation Alert if blocked */}
        {attempt.violation_reason && (
          <div className="mx-5 sm:mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Integrity Incident Logged:</strong> {attempt.violation_reason}
            </span>
          </div>
        )}

        {/* Question by Question Inspection List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Questions & Answers ({quizQuestions.length})
            </h4>
            <span className="text-[11px] text-slate-400">
              Showing student selected options vs official answer key
            </span>
          </div>

          {quizQuestions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No questions found for this quiz.
            </p>
          ) : (
            quizQuestions.map((q, idx) => {
              const selectedOpt = attempt.answers?.[q.id];
              const isCorrect = selectedOpt === q.correct_index;
              const isUnanswered = selectedOpt === undefined;

              return (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                      : isUnanswered
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      Q{idx + 1} • {q.marks || 1} Mark{(q.marks || 1) > 1 ? 's' : ''}
                    </span>

                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks || 1})
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                        Not Answered (0)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 px-2.5 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect (0)
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    {q.question_text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isStudentChoice = selectedOpt === optIdx;
                      const isCorrectChoice = optIdx === q.correct_index;

                      let style =
                        'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';

                      if (isCorrectChoice && isStudentChoice) {
                        style =
                          'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-bold';
                      } else if (isCorrectChoice) {
                        style =
                          'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-semibold';
                      } else if (isStudentChoice) {
                        style =
                          'bg-rose-100 dark:bg-rose-900/60 border-rose-500 text-rose-950 dark:text-rose-100 font-semibold';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${style}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="truncate">{opt}</span>
                          </div>

                          <div className="shrink-0 flex items-center gap-1">
                            {isCorrectChoice && (
                              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-200/70 dark:bg-emerald-900/70 px-1.5 py-0.5 rounded">
                                Answer Key
                              </span>
                            )}
                            {isStudentChoice && (
                              <span className="text-[10px] font-extrabold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/60 px-1.5 py-0.5 rounded">
                                Student Pick
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 pt-2 text-[11px] text-slate-600 dark:text-slate-400 border-t border-black/5 dark:border-white/5">
                      <strong className="text-slate-800 dark:text-slate-200">
                        Official Explanation:
                      </strong>{' '}
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Instructor Verification View • EduWonder Anti-Cheat
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Close Answer Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
