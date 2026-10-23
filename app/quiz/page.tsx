'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import {
  HelpCircle,
  Clock,
  Award,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Lock,
} from 'lucide-react';

export default function QuizzesListingPage() {
  const { quizzes, questions, students } = useAppStore();

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 mb-2">
            <HelpCircle className="w-3.5 h-3.5" /> Online Tests
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Available Practice Tests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Choose a test below. You will need to enter your Name and Roll Number before starting.
          </p>
        </div>

        {/* Test Rules Alert */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
              Important Test Rules
            </h4>
            <ul className="text-xs text-amber-800 dark:text-amber-400/90 mt-1.5 space-y-1 list-disc list-inside">
              <li>
                <strong className="text-amber-950 dark:text-amber-200">Do Not Refresh:</strong>{' '}
                Do not refresh the page or press the back button. If you do, your test will submit immediately and lock.
              </li>
              <li>
                <strong className="text-amber-950 dark:text-amber-200">Teacher Permission:</strong>{' '}
                If your test locks due to a refresh, only your teacher can unlock it from their dashboard.
              </li>
              <li>
                <strong className="text-amber-950 dark:text-amber-200">Roll Number:</strong>{' '}
                Enter your exact college roll number to login to the test.
              </li>
            </ul>
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const quizQuestions = questions.filter((q) => q.quiz_id === quiz.id);

            return (
              <div
                key={quiz.id}
                className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700 transition-all"
              >
                <div>
                  {/* Top Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 px-2.5 py-1 rounded-lg">
                      {quiz.subject_name}
                    </span>

                    {quiz.is_approved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                        <Lock className="w-3 h-3" /> Waiting for Teacher
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                    {quiz.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-violet-500" />
                      {quiz.duration_minutes} Mins
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {quizQuestions.length} Questions ({quiz.total_marks} Marks)
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                      quiz.is_approved
                        ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20 hover:scale-[1.01]'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    <span>{quiz.is_approved ? 'Start Test' : 'Check Test'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
