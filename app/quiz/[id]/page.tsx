'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/lib/store';
import { Quiz, Question, QuizAttempt, Student } from '@/lib/types';
import {
  HelpCircle,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  UserCheck,
  Lock,
  Sparkles,
} from 'lucide-react';

export default function QuizExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const {
    quizzes,
    questions,
    attempts,
    verifyStudent,
    startQuizAttempt,
    recordQuizViolation,
    submitQuizAttempt,
  } = useAppStore();

  const quiz = quizzes.find((q) => q.id === quizId);
  const quizQuestions = questions.filter((q) => q.quiz_id === quizId);

  // Student verification form state
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState<Student | null>(null);

  // Current active attempt
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);

  // Quiz progression state: 'VERIFY' | 'WAITING_ROOM' | 'ARENA' | 'BLOCKED' | 'RESULT'
  const [quizPhase, setQuizPhase] = useState<
    'VERIFY' | 'WAITING_ROOM' | 'ARENA' | 'BLOCKED' | 'RESULT'
  >('VERIFY');

  // Waiting room 3-minute delay countdown
  const [waitingCountdown, setWaitingCountdown] = useState<number>(180);

  // Question paper timer in seconds
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Current question index in Arena
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Selected student answers: { [questionId]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  // Flag to know if exam was active to catch refresh
  const isExamActiveRef = useRef(false);

  // 1. Check existing attempt if student verified
  useEffect(() => {
    if (!quiz) return;

    // Check if session storage has roll number
    const savedRoll = sessionStorage.getItem(`quiz_roll_${quizId}`);
    if (savedRoll && !verifiedStudent) {
      verifyStudent(savedRoll).then((st) => {
        if (st) {
          setVerifiedStudent(st);
          setRollNumber(st.roll_number);
          setStudentName(st.name);

          // Find attempt
          const existing = attempts.find(
            (a) => a.quiz_id === quizId && a.roll_number.toUpperCase() === st.roll_number.toUpperCase()
          );

          if (existing) {
            setCurrentAttempt(existing);
            setSelectedAnswers(existing.answers || {});

            if (existing.is_blocked || existing.status === 'blocked') {
              setQuizPhase('BLOCKED');
            } else if (existing.status === 'submitted') {
              setQuizPhase('RESULT');
            }
          }
        }
      });
    }
  }, [quiz, attempts, quizId]);

  // 2. Waiting Room 3-Minute Timer Logic
  useEffect(() => {
    if (quizPhase !== 'WAITING_ROOM' || !quiz) return;

    if (!quiz.is_approved) {
      return; // Awaiting admin approval
    }

    // Calculate countdown from approved_at
    const calculateRemaining = () => {
      const delaySeconds = quiz.start_delay_seconds || 180; // default 3 min
      if (!quiz.approved_at) return delaySeconds;
      const approvedTime = new Date(quiz.approved_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - approvedTime) / 1000);
      const remaining = delaySeconds - elapsed;
      return Math.max(0, remaining);
    };

    const initialRem = calculateRemaining();
    setWaitingCountdown(initialRem);

    if (initialRem === 0) {
      launchArena();
      return;
    }

    const interval = setInterval(() => {
      const rem = calculateRemaining();
      setWaitingCountdown(rem);
      if (rem <= 0) {
        clearInterval(interval);
        launchArena();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quizPhase, quiz]);

  // 3. Question Paper Duration Countdown Timer
  useEffect(() => {
    if (quizPhase !== 'ARENA') return;

    isExamActiveRef.current = true;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit on timer completion
          handleAutoSubmit('Exam time completed! Auto-submitting question paper.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizPhase]);

  // 4. Strict Anti-Refresh / Anti-Cheat Engine
  useEffect(() => {
    if (quizPhase !== 'ARENA' || !currentAttempt) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Refreshing the browser will block your exam and auto-submit your answers!';

      // Record violation immediately
      if (currentAttempt) {
        recordQuizViolation(
          currentAttempt.id,
          'Student attempted browser refresh or navigation during active exam.'
        );
      }
      return e.returnValue;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept F5, Ctrl+R, Cmd+R
      if (
        e.key === 'F5' ||
        (e.ctrlKey && e.key === 'r') ||
        (e.metaKey && e.key === 'r')
      ) {
        e.preventDefault();
        triggerImmediateLockout('Keyboard reload shortcut detected (F5 / Ctrl+R).');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isExamActiveRef.current) {
        // Tab switch detected
        triggerImmediateLockout('Tab switching / window minimization detected.');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quizPhase, currentAttempt]);

  const triggerImmediateLockout = async (reason: string) => {
    if (!currentAttempt) return;
    isExamActiveRef.current = false;
    const blocked = await recordQuizViolation(currentAttempt.id, reason);
    if (blocked) {
      setCurrentAttempt(blocked);
    }
    setQuizPhase('BLOCKED');
  };

  // Launch Arena
  const launchArena = () => {
    if (!quiz) return;
    setTimeRemaining(quiz.duration_minutes * 60);
    setQuizPhase('ARENA');
  };

  // Handle Student Verification Submit
  const handleVerifyStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    if (!rollNumber.trim() || !studentName.trim()) {
      setVerifyError('Please enter both your Full Name and Roll Number.');
      return;
    }

    setIsVerifying(true);
    try {
      const student = await verifyStudent(rollNumber.trim());
      if (!student) {
        setVerifyError(
          `Roll number "${rollNumber.trim()}" not found in registered roster. Please contact Admin to upload your details via CSV.`
        );
        setIsVerifying(false);
        return;
      }

      setVerifiedStudent(student);
      sessionStorage.setItem(`quiz_roll_${quizId}`, student.roll_number);

      // Register or find attempt
      const attempt = await startQuizAttempt(quizId, student.roll_number, studentName.trim());
      setCurrentAttempt(attempt);
      setSelectedAnswers(attempt.answers || {});

      // Check if student is already blocked
      if (attempt.is_blocked || attempt.status === 'blocked') {
        setQuizPhase('BLOCKED');
        setIsVerifying(false);
        return;
      }

      // Check if already submitted
      if (attempt.status === 'submitted') {
        setQuizPhase('RESULT');
        setIsVerifying(false);
        return;
      }

      // Proceed to waiting room or arena
      if (!quiz?.is_approved) {
        setQuizPhase('WAITING_ROOM');
      } else {
        // Check 3-min delay
        const delaySeconds = quiz.start_delay_seconds || 180;
        const approvedTime = quiz.approved_at ? new Date(quiz.approved_at).getTime() : 0;
        const elapsed = Math.floor((Date.now() - approvedTime) / 1000);

        if (elapsed < delaySeconds) {
          setQuizPhase('WAITING_ROOM');
        } else {
          launchArena();
        }
      }
    } catch (err) {
      setVerifyError('Verification failed. Please check network connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Option Select
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Auto-Submit or Manual Submit
  const handleManualSubmit = async () => {
    if (confirm('Are you sure you want to finalize and submit your question paper?')) {
      executeSubmission();
    }
  };

  const handleAutoSubmit = (reason: string) => {
    alert(reason);
    executeSubmission();
  };

  const executeSubmission = async () => {
    if (!currentAttempt) return;
    isExamActiveRef.current = false;
    const finalAttempt = await submitQuizAttempt(currentAttempt.id, selectedAnswers);
    if (finalAttempt) {
      setCurrentAttempt(finalAttempt);
      setQuizPhase('RESULT');
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Quiz Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The requested examination paper does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/quiz')}
            className="mt-4 bg-violet-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Formatting helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // PHASE 1: STUDENT VERIFICATION ENTRANCE
  // ==========================================
  if (quizPhase === 'VERIFY') {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Student Login
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {quiz.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {quiz.subject_name} • Time: {quiz.duration_minutes} Mins • Total Marks: {quiz.total_marks}
            </p>
          </div>

          {verifyError && (
            <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{verifyError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                College Roll Number
              </label>
              <input
                type="text"
                placeholder="e.g. CS202601"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Enter your roll number from your college student list.
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-md shadow-violet-500/25 transition-all disabled:opacity-50 min-h-[44px]"
            >
              {isVerifying ? (
                <span>Checking student list...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter Test</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Important: Do not reload this page during the test.
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 2: 3-MINUTE APPROVAL WAITING ROOM
  // ==========================================
  if (quizPhase === 'WAITING_ROOM') {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 mb-4">
            <Clock className="w-3.5 h-3.5" /> Please Wait
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {quiz.title}
          </h2>

          <div className="my-6 p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700/80">
            {!quiz.is_approved ? (
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Waiting for Teacher to Start
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Your teacher has not unlocked this test yet. Once unlocked, the countdown timer will begin automatically.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Test Starts In
                </span>
                <div className="text-5xl font-black font-mono text-violet-600 dark:text-violet-400 my-2">
                  {formatTime(waitingCountdown)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Questions will unlock in {waitingCountdown} seconds. Get ready!
                </p>
              </div>
            )}
          </div>

          <div className="text-left bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/40 rounded-2xl p-4 text-xs text-violet-900 dark:text-violet-300 space-y-1.5 mb-6">
            <h5 className="font-bold flex items-center gap-1.5 text-violet-950 dark:text-violet-200">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Instructions:
            </h5>
            <p>• Student: {studentName} ({rollNumber})</p>
            <p>• Total Questions: {quizQuestions.length} ({quiz.total_marks} Marks)</p>
            <p>• Allowed Time: {quiz.duration_minutes} Minutes (submits when time ends)</p>
            <p className="font-semibold text-rose-600 dark:text-rose-400">
              • Do not refresh or exit this page, otherwise you will be locked out.
            </p>
          </div>

          {quiz.is_approved && waitingCountdown === 0 && (
            <button
              onClick={launchArena}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-md transition-all"
            >
              <span>Start Answering Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 3: BLOCKED SCREEN (ANTI-CHEAT VIOLATION)
  // ==========================================
  if (quizPhase === 'BLOCKED') {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-slate-950 text-white">
        <div className="w-full max-w-lg bg-slate-900 border border-rose-600/50 rounded-3xl p-7 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-rose-950 text-rose-500 border border-rose-700/60 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-800">
            TEST LOCKED
          </span>

          <h2 className="text-2xl font-black text-white mt-3">
            Quiz Auto-Submitted & Locked
          </h2>

          <div className="my-5 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
            <p className="text-slate-400">
              <strong className="text-slate-200">Student:</strong> {currentAttempt?.student_name} (
              {currentAttempt?.roll_number})
            </p>
            <p className="text-slate-400">
              <strong className="text-slate-200">Reason:</strong>{' '}
              <span className="text-rose-400">
                {currentAttempt?.violation_reason || 'Page refresh detected during the test.'}
              </span>
            </p>
            <p className="text-slate-400">
              <strong className="text-slate-200">Score Saved:</strong> {currentAttempt?.score || 0} /{' '}
              {quiz.total_marks} Marks
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            The page was refreshed, so your test was submitted automatically.{' '}
            <span className="text-rose-300 font-bold">
              Only your teacher or admin can unlock your account if you need to take a re-exam.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Go to Home
            </button>
            <button
              onClick={() => {
                if (currentAttempt) {
                  const refreshed = attempts.find((a) => a.id === currentAttempt.id);
                  if (refreshed && !refreshed.is_blocked && refreshed.status === 'in_progress') {
                    setCurrentAttempt(refreshed);
                    launchArena();
                  } else {
                    alert('Your test is still locked. Please ask your teacher to unlock you from their dashboard.');
                  }
                }
              }}
              className="w-full py-3 px-4 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-colors shadow-md shadow-violet-600/30"
            >
              Check If Teacher Unlocked You
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 4: RESULT SCREEN
  // ==========================================
  if (quizPhase === 'RESULT') {
    const finalScore = currentAttempt?.score ?? 0;
    const maxMarks = quiz.total_marks || quizQuestions.length;
    const percentage = maxMarks > 0 ? ((finalScore / maxMarks) * 100).toFixed(0) : '0';

    return (
      <div className="min-h-screen py-12 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Award className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-3 py-1 rounded-full">
              Test Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Your Result: {quiz.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Student: <strong className="text-slate-800 dark:text-slate-200">{currentAttempt?.student_name}</strong> (Roll: {currentAttempt?.roll_number})
            </p>
          </div>

          {/* Score Summary Metrics */}
          <div className="grid grid-cols-3 gap-4 my-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-2xl sm:text-3xl font-black text-violet-600 dark:text-violet-400 font-mono">
                {finalScore} / {maxMarks}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your Score</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {percentage}%
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Percentage</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
                {quizQuestions.length}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Questions</p>
            </div>
          </div>

          {/* Question by Question Review */}
          <div className="mt-8 space-y-5">
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" /> Review Your Answers
            </h4>

            {quizQuestions.map((q, idx) => {
              const selected = selectedAnswers[q.id];
              const isCorrect = selected === q.correct_index;
              const isUnanswered = selected === undefined;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : isUnanswered
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-bold text-slate-500">Question {idx + 1}</span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks || 1})
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        Unattempted (0)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect (0)
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    {q.question_text}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selected === optIdx;
                      const isCorrectOption = optIdx === q.correct_index;

                      let pillStyle =
                        'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                      if (isCorrectOption) {
                        pillStyle =
                          'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isOptionSelected && !isCorrectOption) {
                        pillStyle =
                          'bg-rose-100 dark:bg-rose-900/60 border-rose-400 text-rose-900 dark:text-rose-200';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${pillStyle}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-black/5 dark:border-white/5">
                      <strong className="text-slate-700 dark:text-slate-300">Explanation:</strong>{' '}
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-center">
            <button
              onClick={() => router.push('/quiz')}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> Back to Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 5: LIVE QUESTION PAPER ARENA
  // ==========================================
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const isUrgentTime = timeRemaining < 120; // less than 2 min
  const isAnswered = (qId: string) => selectedAnswers[qId] !== undefined;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Top Fixed Sticky Anti-Cheat Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Student Info */}
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
              {rollNumber.slice(-3)}
            </div>
            <div className="truncate max-w-[110px] sm:max-w-xs">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Student
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {studentName} ({rollNumber})
              </h4>
            </div>
          </div>

          {/* Synchronized Question Paper Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-2xl border font-mono font-bold text-xs sm:text-base shadow-sm shrink-0 transition-all ${
              isUrgentTime
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>{formatTime(timeRemaining)}</span>
          </div>

          {/* Anti-Cheat Tag & Finish Button */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Safe Mode Active
            </span>

            <button
              onClick={handleManualSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 sm:px-4 py-2 rounded-xl text-xs shadow-md transition-all hover:scale-105 active:scale-95 min-h-[38px]"
            >
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Hall Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Left Column: Question Navigator Palette (1 col) */}
        <div className="order-2 lg:order-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Questions List
            </h4>
            <span className="text-xs text-violet-600 font-bold">
              {Object.keys(selectedAnswers).length} / {quizQuestions.length} Done
            </span>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2">
            {quizQuestions.map((q, idx) => {
              const answered = isAnswered(q.id);
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'ring-2 ring-violet-600 bg-violet-600 text-white shadow-md'
                      : answered
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700"></span>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded ring-2 ring-violet-600 bg-violet-600"></span>
              <span>Current Question</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Question Arena (3 cols) */}
        <div className="order-1 lg:order-2 lg:col-span-3 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          {currentQuestion ? (
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/70 px-3 py-1 rounded-full">
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </span>
                <span className="text-xs text-slate-400">
                  Marks: +{currentQuestion.marks || 1}
                </span>
              </div>

              {/* Question Statement */}
              <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
                {currentQuestion.question_text}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-violet-50 dark:bg-violet-950/50 border-violet-600 dark:border-violet-500 ring-2 ring-violet-600/30'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-xs sm:text-sm font-medium">{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Loading questions...</p>
          )}

          {/* Navigation Controls Bar */}
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            {currentQuestionIndex < quizQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(quizQuestions.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleManualSubmit}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-500/25"
              >
                <span>Submit Test</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
