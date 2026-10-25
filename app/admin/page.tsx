'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Note, Quiz, Question, Student, QuizAttempt } from '@/lib/types';
import {
  parseStudentsCSV,
  downloadQuizReportCSV,
  parseQuizQuestionsCSV,
  downloadSampleQuestionsCSV,
} from '@/lib/csv';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import InspectStudentPaperModal from '@/components/admin/InspectStudentPaperModal';
import {
  Shield,
  BookOpen,
  HelpCircle,
  Users,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  Check,
  Eye,
  EyeOff,
  LogOut,
  FileSpreadsheet,
  Menu,
  X,
  FileUp,
  ListOrdered,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    notes,
    subjects,
    students,
    quizzes,
    questions,
    attempts,
    isAdmin,
    setIsAdmin,
    addNote,
    deleteNote,
    addStudentsFromCSV,
    createQuiz,
    deleteQuiz,
    toggleQuizApproval,
    toggleShowCorrectAnswers,
    unblockStudentAttempt,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<
    'NOTES' | 'QUIZ_CREATOR' | 'STUDENTS_CSV' | 'LIVE_MONITOR' | 'SCORING_REPORT'
  >('NOTES');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [inspectingAttempt, setInspectingAttempt] = useState<QuizAttempt | null>(null);
  const [showCorrectAnswersOnSubmit, setShowCorrectAnswersOnSubmit] = useState<boolean>(false);

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    const ok = window.confirm(
      `Are you sure you want to permanently delete the quiz "${quizTitle}"?\n\nThis will remove the quiz, all its questions, and all student attempts permanently.`
    );
    if (!ok) return;

    try {
      await deleteQuiz(quizId);
      if (selectedMonitorQuizId === quizId) {
        const remaining = quizzes.filter((q) => q.id !== quizId);
        setSelectedMonitorQuizId(remaining.length > 0 ? remaining[0].id : '');
      }
      alert(`Quiz "${quizTitle}" deleted successfully.`);
    } catch (e) {
      alert('Error deleting quiz: ' + e);
    }
  };

  // Guard: if not admin, redirect to login
  useEffect(() => {
    const isLogged = localStorage.getItem('eduwonder_is_admin') === 'true';
    if (!isLogged && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, router]);

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setIsAdmin(false);
    localStorage.removeItem('eduwonder_is_admin');
    router.push('/admin/login');
  };

  // ==========================================
  // TAB 1: NOTE UPLOAD FORM STATE (CUSTOM TEXT INPUTS & PROGRESS BAR)
  // ==========================================
  const [noteSubject, setNoteSubject] = useState('');
  const [noteUnitNo, setNoteUnitNo] = useState<number | string>(1);
  const [noteUnitName, setNoteUnitName] = useState('');
  const [noteLectureTitle, setNoteLectureTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteFile, setNoteFile] = useState<File | null>(null);

  // Progress Bar State
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [noteSuccessMsg, setNoteSuccessMsg] = useState<string>('');

  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoteSuccessMsg('');

    if (!noteSubject.trim()) {
      alert('Please enter a Subject Name.');
      return;
    }
    if (!noteUnitName.trim() || !noteLectureTitle.trim()) {
      alert('Please fill out Unit Name and Lecture Title.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setUploadStage('Reading PDF file...');

    try {
      let fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      let fileSize = '3.2 MB';

      if (noteFile) {
        fileSize = `${(noteFile.size / (1024 * 1024)).toFixed(1)} MB`;

        // Progress simulation during file processing
        setUploadProgress(35);
        setUploadStage('Preparing upload...');

        if (isSupabaseConfigured()) {
          const fileExt = noteFile.name.split('.').pop() || 'pdf';
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          setUploadProgress(65);
          setUploadStage('Uploading your PDF...');

          const { data, error } = await supabase.storage
            .from('notes')
            .upload(fileName, noteFile, { upsert: true });

          if (!error && data) {
            setUploadProgress(85);
            setUploadStage('Creating download link...');
            const { data: pubData } = supabase.storage.from('notes').getPublicUrl(fileName);
            if (pubData) fileUrl = pubData.publicUrl;
          }
        }
      } else {
        // Fast mock progression
        setUploadProgress(50);
        await new Promise((r) => setTimeout(r, 400));
        setUploadProgress(85);
        setUploadStage('Saving note details...');
        await new Promise((r) => setTimeout(r, 400));
      }

      setUploadProgress(95);
      setUploadStage('Making note available to students...');

      await addNote({
        subject_name: noteSubject.trim(),
        unit_no: Number(noteUnitNo) || 1,
        unit_name: noteUnitName.trim(),
        lecture_title: noteLectureTitle.trim(),
        description: noteDescription.trim() || 'Class notes and exam practice questions.',
        file_url: fileUrl,
        file_size: fileSize,
      });

      setUploadProgress(100);
      setUploadStage('Upload Complete! Note is now ready.');
      setNoteSuccessMsg(
        `PDF Note "${noteLectureTitle}" for ${noteSubject} (Unit ${noteUnitNo}) was uploaded successfully!`
      );

      // Reset fields except subject for convenience
      setNoteUnitName('');
      setNoteLectureTitle('');
      setNoteDescription('');
      setNoteFile(null);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStage('');
      }, 2500);
    }
  };

  // ==========================================
  // TAB 2: QUIZ CREATOR & BULK CSV IMPORT
  // ==========================================
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizDuration, setQuizDuration] = useState<number>(15);

  const [questionsList, setQuestionsList] = useState<
    Array<{
      question_text: string;
      options: [string, string, string, string];
      correct_index: number;
      marks: number;
      explanation: string;
    }>
  >([
    {
      question_text: 'What is the worst-case time complexity of QuickSort?',
      options: ['O(N)', 'O(N log N)', 'O(N^2)', 'O(log N)'],
      correct_index: 2,
      marks: 1,
      explanation: 'When the partition is unbalanced (e.g. sorted array with poor pivot), QuickSort degrades to O(N^2).',
    },
  ]);

  const [bulkQuizMsg, setBulkQuizMsg] = useState<{ count?: number; errors?: string[] } | null>(null);

  const handleBulkQuestionsCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const { questions: parsedQ, errors } = parseQuizQuestionsCSV(text);
        if (errors.length > 0) {
          setBulkQuizMsg({ errors });
          return;
        }

        if (parsedQ.length > 0) {
          setQuestionsList(parsedQ);
          setBulkQuizMsg({ count: parsedQ.length });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleAddQuestionField = () => {
    setQuestionsList([
      ...questionsList,
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_index: 0,
        marks: 1,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestionField = (idx: number) => {
    if (questionsList.length <= 1) {
      alert('Quiz must have at least one question.');
      return;
    }
    setQuestionsList(questionsList.filter((_, i) => i !== idx));
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      alert('Please provide a Quiz Title.');
      return;
    }
    if (!quizSubject.trim()) {
      alert('Please write a Subject Name for this quiz.');
      return;
    }

    for (let i = 0; i < questionsList.length; i++) {
      const q = questionsList[i];
      if (!q.question_text.trim()) {
        alert(`Question ${i + 1} statement is empty.`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        alert(`All 4 options for Question ${i + 1} must be filled.`);
        return;
      }
    }

    try {
      await createQuiz(
        {
          title: quizTitle.trim(),
          subject_name: quizSubject.trim(),
          description: quizDesc.trim() || 'Answer all questions within the allowed time limit.',
          duration_minutes: Number(quizDuration) || 15,
          total_marks: questionsList.reduce((acc, q) => acc + (q.marks || 1), 0),
          show_correct_answers: showCorrectAnswersOnSubmit,
        },
        questionsList
      );

      alert(`Quiz "${quizTitle}" with ${questionsList.length} questions created successfully!`);
      setQuizTitle('');
      setQuizDesc('');
      setShowCorrectAnswersOnSubmit(false);
    } catch (err) {
      alert('Error creating quiz: ' + err);
    }
  };

  // ==========================================
  // TAB 3: CSV STUDENT ROSTER STATE
  // ==========================================
  const [csvStatus, setCsvStatus] = useState<{ count?: number; errors?: string[] } | null>(null);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processCSV(text);
      }
    };
    reader.readAsText(file);
  };

  const processCSV = async (content: string) => {
    const { students: parsed, errors } = parseStudentsCSV(content);
    if (errors.length > 0) {
      setCsvStatus({ errors });
      return;
    }

    const inserted = await addStudentsFromCSV(parsed);
    setCsvStatus({ count: inserted });
  };

  const downloadSampleCSV = () => {
    const sample = `roll_number,name,email,department\r\nCS202610,Arjun Mehta,arjun.m@college.edu,Computer Science\r\nCS202611,Simran Kaur,simran.k@college.edu,Information Tech\r\nCS202612,Rahul Deshmukh,rahul.d@college.edu,Computer Science`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_students_roster.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // TAB 4 & 5: MONITORING & SCORING
  // ==========================================
  const [selectedMonitorQuizId, setSelectedMonitorQuizId] = useState<string>(quizzes[0]?.id || '');
  const activeQuiz = quizzes.find((q) => q.id === selectedMonitorQuizId) || quizzes[0];
  const quizAttempts = attempts.filter((a) => a.quiz_id === (activeQuiz?.id || ''));

  // Navigation Items for Left Sidebar
  const navItems = [
    {
      id: 'NOTES' as const,
      label: 'Upload Notes',
      icon: BookOpen,
      badge: notes.length,
      desc: 'Add PDF notes for students',
    },
    {
      id: 'QUIZ_CREATOR' as const,
      label: 'Create Test',
      icon: HelpCircle,
      badge: quizzes.length,
      desc: 'Write questions or import CSV',
    },
    {
      id: 'STUDENTS_CSV' as const,
      label: 'Student List',
      icon: Users,
      badge: students.length,
      desc: 'Upload class list & view students',
    },
    {
      id: 'LIVE_MONITOR' as const,
      label: 'Live Test Monitor',
      icon: Shield,
      badge: attempts.filter((a) => a.is_blocked).length > 0 ? 'Blocked' : null,
      desc: 'See online students & allow re-test',
    },
    {
      id: 'SCORING_REPORT' as const,
      label: 'Marks & Results',
      icon: FileSpreadsheet,
      desc: 'Student scores & download sheet',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* MOBILE TOP BAR (Only visible on screens < lg) */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-violet-600" /> Teacher Panel
            </span>
            <p className="text-[10px] text-slate-400 capitalize">
              {navItems.find((n) => n.id === activeTab)?.label}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs font-semibold text-rose-500 hover:text-rose-600 p-2 min-h-[44px] flex items-center gap-1"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* ========================================================= */}
      {/* LEFT SIDE NAVIGATION SIDEBAR */}
      {/* ========================================================= */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                  EduWonder
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Teacher Panel
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all min-h-[48px] ${
                    isActive
                      ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <span className="text-xs sm:text-sm block leading-tight">{item.label}</span>
                      <span
                        className={`text-[10px] block truncate ${
                          isActive ? 'text-violet-200' : 'text-slate-400'
                        }`}
                      >
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white text-violet-900'
                          : item.badge === 'Blocked'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-200/60 dark:border-violet-800/50">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-900 dark:text-violet-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Connected</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              All student data is safe & private
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 text-slate-600 dark:text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN ADMIN WORKSPACE AREA */}
      {/* ========================================================= */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden p-3.5 sm:p-6 lg:p-8">
        {/* Top Key Metrics Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold">Total Notes</span>
              <BookOpen className="w-4 h-4 text-violet-500" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {notes.length}
            </span>
            <p className="text-[10px] text-slate-400">Notes uploaded</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold">Active Tests</span>
              <HelpCircle className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {quizzes.length}
            </span>
            <p className="text-[10px] text-slate-400">
              {quizzes.filter((q) => q.is_approved).length} Available for students
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold">Total Students</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {students.length}
            </span>
            <p className="text-[10px] text-slate-400">In student list</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold">Test Attempts</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
              {attempts.length}
            </span>
            <p className="text-[10px] text-rose-500 font-semibold">
              {attempts.filter((a) => a.is_blocked).length} Blocked (Page Refreshed)
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: UPLOAD & MANAGE PDF NOTES */}
        {/* ========================================================= */}
        {activeTab === 'NOTES' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Upload PDF Notes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Type the subject name, unit number, and lecture title, then upload your PDF file.
                  </p>
                </div>
                <span className="inline-block text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/70 px-2.5 py-1 rounded-full uppercase w-fit">
                  Notes Library
                </span>
              </div>

              {/* Success Alert Banner */}
              {noteSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <div>
                    <strong className="block font-bold">Upload Successful!</strong>
                    <span>{noteSuccessMsg}</span>
                  </div>
                </div>
              )}

              {/* Real Upload Progress Bar */}
              {isUploading && (
                <div className="mb-6 p-4 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-violet-900 dark:text-violet-200">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                      {uploadStage}
                    </span>
                    <span className="font-mono text-violet-600 dark:text-violet-400">
                      {uploadProgress}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-violet-200 dark:bg-violet-900/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <form onSubmit={handleUploadNote} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Subject Name: Custom Text Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      list="subject-suggestions"
                      placeholder="e.g. Data Structures & Algorithms"
                      value={noteSubject}
                      onChange={(e) => setNoteSubject(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                    />
                    <datalist id="subject-suggestions">
                      {subjects.map((s) => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* Unit Number: Custom Number/Text Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Unit Number (e.g. 1, 2, 3...)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      placeholder="e.g. 1"
                      value={noteUnitNo}
                      onChange={(e) => setNoteUnitNo(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {/* Unit Name: Custom Text Input */}
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Unit Name / Topic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arrays & Complexity"
                      value={noteUnitName}
                      onChange={(e) => setNoteUnitName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lecture Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Lecture Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lecture 4: Trees & Graphs"
                      value={noteLectureTitle}
                      onChange={(e) => setNoteLectureTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {/* File Upload with Progress Indicator */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Choose PDF File
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-violet-950 dark:file:text-violet-300"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {noteFile ? `Selected: ${noteFile.name} (${(noteFile.size / 1024 / 1024).toFixed(1)} MB)` : 'Optional: A sample PDF will be used if you leave this empty.'}
                    </p>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Short Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief note on what this lecture covers..."
                    value={noteDescription}
                    onChange={(e) => setNoteDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-md shadow-violet-600/25 transition-all disabled:opacity-50 min-h-[44px]"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading PDF...' : 'Upload Note'}</span>
                </button>
              </form>
            </div>

            {/* Published Notes Table with Responsive Horizontal Scroll */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  All Uploaded Notes ({notes.length})
                </h3>
                <span className="text-xs text-slate-400">Ready for students</span>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 px-3">Subject</th>
                      <th className="pb-3 px-3">Unit</th>
                      <th className="pb-3 px-3">Lecture Title</th>
                      <th className="pb-3 px-3">Size</th>
                      <th className="pb-3 px-3 text-right">Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {notes.map((note) => (
                      <tr key={note.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {note.subject_name}
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-md font-bold">
                            Unit {note.unit_no}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                          {note.lecture_title}
                        </td>
                        <td className="py-3 px-3 text-slate-400">{note.file_size || '3.5 MB'}</td>
                        <td className="py-3 px-3 text-right space-x-1">
                          <a
                            href={note.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center p-2 text-slate-500 hover:text-violet-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Preview PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="inline-flex items-center p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DESIGN & CREATE QUIZ (CUSTOM SUBJECT & BULK CSV) */}
        {/* ========================================================= */}
        {activeTab === 'QUIZ_CREATOR' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Active Quizzes Approval Controller Bar */}
            <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                    Live Test Controls
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold mt-1">Start or Pause Tests</h3>
                  <p className="text-xs text-indigo-200">
                    When you approve a test, students get a 3-minute countdown before questions unlock.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] uppercase font-bold text-violet-300 truncate">
                          {quiz.subject_name}
                        </span>
                        {quiz.show_correct_answers ? (
                          <span className="text-[9px] font-extrabold bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full">
                            Answers Visible
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                            Answers Hidden
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-bold truncate">{quiz.title}</h5>
                      <span className="text-xs text-indigo-200 font-mono">
                        {quiz.duration_minutes} Mins • Total Marks: {quiz.total_marks}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleShowCorrectAnswers(quiz.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 ${
                          quiz.show_correct_answers
                            ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold'
                        }`}
                        title={
                          quiz.show_correct_answers
                            ? 'Answers currently visible to students. Click to hide.'
                            : 'Answers currently hidden from students. Click to allow.'
                        }
                      >
                        {quiz.show_correct_answers ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hide Answers
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Allow Answers
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => toggleQuizApproval(quiz.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 ${
                          quiz.is_approved
                            ? 'bg-rose-500 hover:bg-rose-600 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black'
                        }`}
                      >
                        {quiz.is_approved ? (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Pause Test
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" /> Approve Test (Start 3m countdown)
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        className="px-2.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-400/30 flex items-center gap-1"
                        title="Delete quiz permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FEATURE: BULK IMPORT QUESTIONS VIA CSV */}
            <div className="bg-gradient-to-br from-violet-50/60 via-indigo-50/40 to-white dark:from-violet-950/30 dark:via-slate-900 dark:to-slate-900 border-2 border-dashed border-violet-300 dark:border-violet-700/60 rounded-3xl p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Upload Questions from CSV File
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Upload an Excel or CSV file to add all questions at once.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={downloadSampleQuestionsCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-violet-300 dark:border-violet-700 bg-white dark:bg-slate-800 text-violet-700 dark:text-violet-300 font-bold text-xs shadow-sm hover:bg-violet-50 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Download Example CSV
                </button>
              </div>

              {bulkQuizMsg?.count !== undefined && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Added {bulkQuizMsg.count} questions from your file into the form below!
                  </span>
                </div>
              )}

              {bulkQuizMsg?.errors && bulkQuizMsg.errors.length > 0 && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <span className="font-bold">Errors in questions CSV file:</span>
                  {bulkQuizMsg.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-5 rounded-2xl text-xs cursor-pointer shadow-md shadow-violet-600/25 transition-all min-h-[44px]">
                  <Upload className="w-4 h-4" />
                  <span>Select Questions CSV File</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleBulkQuestionsCSVUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-400">
                  Required columns: question_text, option_a, option_b, option_c, option_d, correct_answer
                </span>
              </div>
            </div>

            {/* Create Quiz Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Create Test Questions
              </h3>

              <form onSubmit={handleSaveQuiz} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Test Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Operating Systems - Unit 1 & 2 Test"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {/* Subject Name: Custom Text Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      list="quiz-subject-suggestions"
                      placeholder="e.g. Operating Systems"
                      value={quizSubject}
                      onChange={(e) => setQuizSubject(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                    />
                    <datalist id="quiz-subject-suggestions">
                      {subjects.map((s) => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Test Time Limit (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={quizDuration}
                      onChange={(e) => setQuizDuration(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-violet-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Test submits automatically when time ends.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Instructions for Students
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1 mark per question. No negative marking."
                      value={quizDesc}
                      onChange={(e) => setQuizDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div className="md:col-span-2 p-3.5 bg-violet-50/70 dark:bg-violet-950/30 rounded-2xl border border-violet-200/70 dark:border-violet-800/50 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="allowAnswersCheckbox"
                      checked={showCorrectAnswersOnSubmit}
                      onChange={(e) => setShowCorrectAnswersOnSubmit(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-violet-600 rounded focus:ring-violet-500 cursor-pointer"
                    />
                    <label
                      htmlFor="allowAnswersCheckbox"
                      className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <strong className="text-slate-900 dark:text-white block">
                        Allow students to view correct answers immediately upon submitting
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        Unchecked (recommended): Hides answer key to prevent answer leaks. Admin can release it anytime.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Questions Builder */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ListOrdered className="w-4 h-4 text-violet-600" />
                      Questions ({questionsList.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddQuestionField}
                      className="inline-flex items-center gap-1.5 bg-violet-100 hover:bg-violet-200 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold px-3 py-1.5 rounded-xl text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Question
                    </button>
                  </div>

                  {questionsList.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                          Question {qIndex + 1}
                        </span>
                        {questionsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionField(qIndex)}
                            className="text-xs text-rose-500 hover:text-rose-700 p-1"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        placeholder="Enter the question here..."
                        value={q.question_text}
                        onChange={(e) => {
                          const updated = [...questionsList];
                          updated[qIndex].question_text = e.target.value;
                          setQuestionsList(updated);
                        }}
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500"
                      />

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${qIndex}`}
                              checked={q.correct_index === optIndex}
                              onChange={() => {
                                const updated = [...questionsList];
                                updated[qIndex].correct_index = optIndex;
                                setQuestionsList(updated);
                              }}
                              title="Mark as correct answer"
                              className="w-4 h-4 text-violet-600 focus:ring-violet-500 shrink-0"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              value={opt}
                              onChange={(e) => {
                                const updated = [...questionsList];
                                const copyOpts = [...updated[qIndex].options] as [
                                  string,
                                  string,
                                  string,
                                  string
                                ];
                                copyOpts[optIndex] = e.target.value;
                                updated[qIndex].options = copyOpts;
                                setQuestionsList(updated);
                              }}
                              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="text"
                          placeholder="Why this is correct (shown to student after test)"
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...questionsList];
                            updated[qIndex].explanation = e.target.value;
                            setQuestionsList(updated);
                          }}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-400">Marks:</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={q.marks}
                            onChange={(e) => {
                              const updated = [...questionsList];
                              updated[qIndex].marks = Number(e.target.value);
                              setQuestionsList(updated);
                            }}
                            className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-md shadow-violet-600/25 transition-all min-h-[44px]"
                >
                  <Check className="w-4 h-4" /> Save and Create Test
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: STUDENT DETAILS CSV UPLOAD & ROSTER */}
        {/* ========================================================= */}
        {activeTab === 'STUDENTS_CSV' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Upload Student List (CSV)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload your class roll number list so students can verify themselves before taking a test.
                  </p>
                </div>

                <button
                  onClick={downloadSampleCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-400 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" /> Download Example CSV
                </button>
              </div>

              {csvStatus?.count !== undefined && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Added {csvStatus.count} students to the class list!</span>
                </div>
              )}

              {csvStatus?.errors && csvStatus.errors.length > 0 && (
                <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-700 dark:text-rose-300 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Errors in student list CSV:
                  </p>
                  {csvStatus.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}

              {/* Upload Input Area */}
              <div className="border-2 border-dashed border-violet-300 dark:border-violet-700/60 rounded-3xl p-6 sm:p-8 text-center bg-violet-50/30 dark:bg-violet-950/20">
                <Upload className="w-10 h-10 text-violet-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Select Student List CSV File
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Your file must have columns: <strong>roll_number</strong> and <strong>name</strong>.
                </p>

                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-5 rounded-2xl text-xs cursor-pointer shadow-md shadow-violet-600/25 transition-all min-h-[44px]">
                    <span>Choose CSV File</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Students Table with Horizontal Scroll */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Enrolled Students ({students.length})
                </h3>
                <span className="text-xs text-slate-400">Ready for tests</span>
              </div>

              <div className="w-full overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="pb-3 px-3">Roll Number</th>
                      <th className="pb-3 px-3">Full Name</th>
                      <th className="pb-3 px-3">Department</th>
                      <th className="pb-3 px-3">Email</th>
                      <th className="pb-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-violet-600 dark:text-violet-400">
                          {st.roll_number}
                        </td>
                        <td className="py-2.5 px-3 text-slate-900 dark:text-white">{st.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{st.department || 'Computer Science'}</td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{st.email}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LIVE EXAMINEE MONITOR & ANTI-CHEAT UNBLOCK */}
        {/* ========================================================= */}
        {activeTab === 'LIVE_MONITOR' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Live Students & Test Monitor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    See students who are taking the test right now. If someone got blocked by refreshing their browser, click &quot;Allow Re-exam&quot; to unlock them.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Select Test:</span>
                  <select
                    value={selectedMonitorQuizId}
                    onChange={(e) => setSelectedMonitorQuizId(e.target.value)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-xs font-semibold"
                  >
                    {quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Examinees List with Horizontal Scroll */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 px-3">Student Name</th>
                      <th className="pb-3 px-3">Roll Number</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3">Reason for Block</th>
                      <th className="pb-3 px-3">Score</th>
                      <th className="pb-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {quizAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No students have started this test yet.
                        </td>
                      </tr>
                    ) : (
                      quizAttempts.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            {att.student_name}
                          </td>
                          <td className="py-3 px-3 font-mono text-violet-600 dark:text-violet-400">
                            {att.roll_number}
                          </td>
                          <td className="py-3 px-3">
                            {att.is_blocked || att.status === 'blocked' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                                <Lock className="w-3 h-3" /> Blocked (Page Refreshed)
                              </span>
                            ) : att.status === 'submitted' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                In Progress
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-500 max-w-xs truncate text-[11px]">
                            {att.violation_reason || 'None (Test going well)'}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">
                            {att.score} / {att.total_marks}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectingAttempt(att)}
                                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-2.5 py-1.5 rounded-xl text-xs transition-colors shrink-0 shadow-sm"
                                title="View student answers & comparison with answer key"
                              >
                                <Eye className="w-3.5 h-3.5 text-violet-600" /> Answers
                              </button>

                              {att.is_blocked || att.status === 'blocked' ? (
                                <button
                                  onClick={() => unblockStudentAttempt(att.id)}
                                  className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all shrink-0"
                                >
                                  <Unlock className="w-3.5 h-3.5" /> Re-exam
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SCORING REPORT & CSV PROGRESS DOWNLOAD */}
        {/* ========================================================= */}
        {activeTab === 'SCORING_REPORT' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Student Marks & Results
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    View total marks for all students and download the score sheet as an Excel/CSV file.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <select
                    value={selectedMonitorQuizId}
                    onChange={(e) => setSelectedMonitorQuizId(e.target.value)}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl text-xs font-semibold"
                  >
                    {quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (activeQuiz) {
                        downloadQuizReportCSV(activeQuiz, quizAttempts);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/25 transition-all min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Results (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Scoring Leaderboard */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 px-3">Rank</th>
                      <th className="pb-3 px-3">Roll Number</th>
                      <th className="pb-3 px-3">Student Name</th>
                      <th className="pb-3 px-3">Marks</th>
                      <th className="pb-3 px-3">Percentage</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3">Submitted At</th>
                      <th className="pb-3 px-3 text-right">Paper</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {quizAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No students have submitted this test yet.
                        </td>
                      </tr>
                    ) : (
                      quizAttempts
                        .sort((a, b) => (b.score || 0) - (a.score || 0))
                        .map((att, index) => {
                          const pct =
                            att.total_marks > 0
                              ? ((att.score / att.total_marks) * 100).toFixed(0)
                              : '0';

                          return (
                            <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-3 font-bold font-mono">#{index + 1}</td>
                              <td className="py-3 px-3 font-mono text-violet-600 dark:text-violet-400">
                                {att.roll_number}
                              </td>
                              <td className="py-3 px-3 text-slate-900 dark:text-white font-bold">
                                {att.student_name}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold">
                                {att.score} / {att.total_marks}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {pct}%
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                {att.is_blocked ? (
                                  <span className="text-rose-500 font-bold text-[10px]">
                                    BLOCKED (REFRESH)
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 font-bold text-[10px]">
                                    COMPLETED
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                                {att.submitted_at
                                  ? new Date(att.submitted_at).toLocaleTimeString()
                                  : 'In Progress'}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => setInspectingAttempt(att)}
                                  className="inline-flex items-center gap-1 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-bold px-2.5 py-1.5 rounded-xl text-xs transition-colors shadow-sm"
                                  title="Inspect student's submitted paper"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Paper
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Staff Paper Inspection Modal */}
      <InspectStudentPaperModal
        attempt={inspectingAttempt}
        quiz={quizzes.find((q) => q.id === inspectingAttempt?.quiz_id)}
        questions={questions}
        isOpen={!!inspectingAttempt}
        onClose={() => setInspectingAttempt(null)}
      />
    </div>
  );
}
