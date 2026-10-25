'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subject, Note, Student, Quiz, Question, QuizAttempt } from './types';
import {
  INITIAL_SUBJECTS,
  INITIAL_NOTES,
  INITIAL_STUDENTS,
  INITIAL_QUIZZES,
  INITIAL_QUESTIONS,
  INITIAL_ATTEMPTS,
} from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

interface AppContextType {
  subjects: Subject[];
  notes: Note[];
  students: Student[];
  quizzes: Quiz[];
  questions: Question[];
  attempts: QuizAttempt[];
  bookmarks: string[]; // Note IDs
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  toggleBookmark: (noteId: string) => void;
  isBookmarked: (noteId: string) => boolean;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'download_count'>) => Promise<Note>;
  deleteNote: (noteId: string) => Promise<void>;
  addStudentsFromCSV: (newStudents: Omit<Student, 'id'>[]) => Promise<number>;
  createQuiz: (
    quiz: Omit<Quiz, 'id' | 'created_at' | 'is_approved' | 'approved_at'>,
    questions: Omit<Question, 'id' | 'quiz_id' | 'created_at'>[]
  ) => Promise<Quiz>;
  deleteQuiz: (quizId: string) => Promise<void>;
  toggleQuizApproval: (quizId: string) => Promise<void>;
  toggleShowCorrectAnswers: (quizId: string) => Promise<void>;
  verifyStudent: (rollNumber: string) => Promise<Student | null>;
  startQuizAttempt: (quizId: string, rollNumber: string, studentName: string) => Promise<QuizAttempt>;
  recordQuizViolation: (attemptId: string, reason: string) => Promise<QuizAttempt | null>;
  unblockStudentAttempt: (attemptId: string) => Promise<void>;
  submitQuizAttempt: (attemptId: string, answers: Record<string, number>) => Promise<QuizAttempt | null>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [attempts, setAttempts] = useState<QuizAttempt[]>(INITIAL_ATTEMPTS);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    // Load Bookmarks
    try {
      const savedBookmarks = localStorage.getItem('eduwonder_bookmarks');
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
      const savedAdmin = localStorage.getItem('eduwonder_is_admin');
      if (savedAdmin === 'true') {
        setIsAdmin(true);
      }
      // Load local state overrides if any
      const localNotes = localStorage.getItem('eduwonder_notes');
      if (localNotes) setNotes(JSON.parse(localNotes));
      const localStudents = localStorage.getItem('eduwonder_students');
      if (localStudents) setStudents(JSON.parse(localStudents));
      const localQuizzes = localStorage.getItem('eduwonder_quizzes');
      if (localQuizzes) {
        try {
          const parsed = JSON.parse(localQuizzes);
          setQuizzes(
            parsed.map((q: Quiz) => ({
              ...q,
              show_correct_answers: q.show_correct_answers ?? false,
            }))
          );
        } catch {
          setQuizzes(INITIAL_QUIZZES);
        }
      }
      const localQuestions = localStorage.getItem('eduwonder_questions');
      if (localQuestions) setQuestions(JSON.parse(localQuestions));
      const localAttempts = localStorage.getItem('eduwonder_attempts');
      if (localAttempts) setAttempts(JSON.parse(localAttempts));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Check Supabase session
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAdmin(true);
          localStorage.setItem('eduwonder_is_admin', 'true');
        }
      });
      refreshFromSupabase();
    }
  }, []);

  const refreshFromSupabase = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const [subjRes, notesRes, studRes, quizRes, questRes, attRes] = await Promise.allSettled([
        supabase.from('subjects').select('*'),
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
        supabase.from('students').select('*').order('roll_number', { ascending: true }),
        supabase.from('quizzes').select('*').order('created_at', { ascending: false }),
        supabase.from('questions').select('*'),
        supabase.from('quiz_attempts').select('*').order('started_at', { ascending: false }),
      ]);

      if (subjRes.status === 'fulfilled' && subjRes.value.data && subjRes.value.data.length > 0) {
        setSubjects(subjRes.value.data);
      }
      if (notesRes.status === 'fulfilled' && notesRes.value.data && notesRes.value.data.length > 0) {
        setNotes(notesRes.value.data);
      }
      if (studRes.status === 'fulfilled' && studRes.value.data && studRes.value.data.length > 0) {
        setStudents(studRes.value.data);
      }
      if (quizRes.status === 'fulfilled' && quizRes.value.data && quizRes.value.data.length > 0) {
        setQuizzes(quizRes.value.data);
      }
      if (questRes.status === 'fulfilled' && questRes.value.data && questRes.value.data.length > 0) {
        setQuestions(questRes.value.data);
      }
      if (attRes.status === 'fulfilled' && attRes.value.data && attRes.value.data.length > 0) {
        setAttempts(attRes.value.data);
      }
    } catch (err) {
      console.warn('Supabase fetch notice (using hybrid store):', err);
    }
  };

  const toggleBookmark = (noteId: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId];
      localStorage.setItem('eduwonder_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const isBookmarked = (noteId: string) => bookmarks.includes(noteId);

  // Add Note
  const addNote = async (noteData: Omit<Note, 'id' | 'created_at' | 'download_count'>): Promise<Note> => {
    const newNote: Note = {
      ...noteData,
      id: 'note-' + Date.now(),
      created_at: new Date().toISOString(),
      download_count: 0,
      file_size: noteData.file_size || '3.5 MB',
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('notes').insert([newNote]).select().single();
        if (!error && data) {
          const updated = [data, ...notes];
          setNotes(updated);
          localStorage.setItem('eduwonder_notes', JSON.stringify(updated));
          return data;
        }
      } catch (e) {
        console.warn('Supabase insert note error:', e);
      }
    }

    // Auto-register new subject if custom
    if (noteData.subject_name && !subjects.some((s) => s.name.toLowerCase() === noteData.subject_name.toLowerCase())) {
      const newSubj = {
        id: 'subj-' + Date.now(),
        name: noteData.subject_name,
        code: noteData.subject_name.slice(0, 4).toUpperCase(),
        icon: 'BookOpen',
        description: `${noteData.subject_name} lecture notes and curriculum.`,
      };
      setSubjects((prev) => [newSubj, ...prev]);
    }

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('eduwonder_notes', JSON.stringify(updated));
    return newNote;
  };

  // Delete Note
  const deleteNote = async (noteId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notes').delete().eq('id', noteId);
      } catch (e) {
        console.warn('Supabase delete error:', e);
      }
    }
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    localStorage.setItem('eduwonder_notes', JSON.stringify(updated));
  };

  // Add Students From CSV
  const addStudentsFromCSV = async (newStudentsData: Omit<Student, 'id'>[]): Promise<number> => {
    const formattedStudents: Student[] = newStudentsData.map((st, index) => ({
      ...st,
      id: 'st-' + Date.now() + '-' + index,
    }));

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('students').upsert(
          formattedStudents.map((s) => ({
            roll_number: s.roll_number,
            name: s.name,
            email: s.email,
            department: s.department,
            is_active: true,
          })),
          { onConflict: 'roll_number' }
        );
        if (error) console.warn('Supabase students upsert error:', error);
      } catch (e) {
        console.warn('Supabase upsert error:', e);
      }
    }

    // Merge in-memory by roll_number
    setStudents((prev) => {
      const map = new Map<string, Student>();
      prev.forEach((s) => map.set(s.roll_number.toLowerCase(), s));
      formattedStudents.forEach((s) => map.set(s.roll_number.toLowerCase(), s));
      const merged = Array.from(map.values());
      localStorage.setItem('eduwonder_students', JSON.stringify(merged));
      return merged;
    });

    return formattedStudents.length;
  };

  // Create Quiz with Questions
  const createQuiz = async (
    quizData: Omit<Quiz, 'id' | 'created_at' | 'is_approved' | 'approved_at'>,
    questionsData: Omit<Question, 'id' | 'quiz_id' | 'created_at'>[]
  ): Promise<Quiz> => {
    const newQuiz: Quiz = {
      ...quizData,
      id: 'quiz-' + Date.now(),
      is_approved: false,
      approved_at: null,
      start_delay_seconds: 180,
      created_at: new Date().toISOString(),
    };

    const newQuestions: Question[] = questionsData.map((q, i) => ({
      ...q,
      id: 'q-' + Date.now() + '-' + i,
      quiz_id: newQuiz.id,
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('quizzes').insert([newQuiz]);
        await supabase.from('questions').insert(newQuestions);
      } catch (e) {
        console.warn('Supabase quiz insert error:', e);
      }
    }

    const updatedQuizzes = [newQuiz, ...quizzes];
    const updatedQuestions = [...questions, ...newQuestions];
    setQuizzes(updatedQuizzes);
    setQuestions(updatedQuestions);
    localStorage.setItem('eduwonder_quizzes', JSON.stringify(updatedQuizzes));
    localStorage.setItem('eduwonder_questions', JSON.stringify(updatedQuestions));
    return newQuiz;
  };

  // Toggle Quiz Approval (Starts 3-minute delay countdown or activates quiz)
  const toggleQuizApproval = async (quizId: string) => {
    const target = quizzes.find((q) => q.id === quizId);
    if (!target) return;

    const nextApproved = !target.is_approved;
    const approvedAt = nextApproved ? new Date().toISOString() : null;

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('quizzes')
          .update({ is_approved: nextApproved, approved_at: approvedAt })
          .eq('id', quizId);
      } catch (e) {
        console.warn('Supabase quiz approval error:', e);
      }
    }

    const updated = quizzes.map((q) =>
      q.id === quizId ? { ...q, is_approved: nextApproved, approved_at: approvedAt } : q
    );
    setQuizzes(updated);
    localStorage.setItem('eduwonder_quizzes', JSON.stringify(updated));
  };

  // Toggle whether students can view correct answers & explanations after submission
  const toggleShowCorrectAnswers = async (quizId: string) => {
    const target = quizzes.find((q) => q.id === quizId);
    if (!target) return;

    const nextVal = !target.show_correct_answers;

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('quizzes')
          .update({ show_correct_answers: nextVal })
          .eq('id', quizId);
      } catch (e) {
        console.warn('Supabase toggleShowCorrectAnswers error:', e);
      }
    }

    const updated = quizzes.map((q) =>
      q.id === quizId ? { ...q, show_correct_answers: nextVal } : q
    );
    setQuizzes(updated);
    localStorage.setItem('eduwonder_quizzes', JSON.stringify(updated));
  };

  // Delete a Quiz along with its questions and student attempts
  const deleteQuiz = async (quizId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await Promise.allSettled([
          supabase.from('quiz_attempts').delete().eq('quiz_id', quizId),
          supabase.from('questions').delete().eq('quiz_id', quizId),
          supabase.from('quizzes').delete().eq('id', quizId),
        ]);
      } catch (e) {
        console.warn('Supabase deleteQuiz error:', e);
      }
    }

    const updatedQuizzes = quizzes.filter((q) => q.id !== quizId);
    const updatedQuestions = questions.filter((q) => q.quiz_id !== quizId);
    const updatedAttempts = attempts.filter((a) => a.quiz_id !== quizId);

    setQuizzes(updatedQuizzes);
    setQuestions(updatedQuestions);
    setAttempts(updatedAttempts);

    localStorage.setItem('eduwonder_quizzes', JSON.stringify(updatedQuizzes));
    localStorage.setItem('eduwonder_questions', JSON.stringify(updatedQuestions));
    localStorage.setItem('eduwonder_attempts', JSON.stringify(updatedAttempts));
  };

  // Verify Student
  const verifyStudent = async (rollNumber: string): Promise<Student | null> => {
    const cleanRoll = rollNumber.trim().toLowerCase();
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .ilike('roll_number', cleanRoll)
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase verify student error:', e);
      }
    }

    const found = students.find((s) => s.roll_number.toLowerCase() === cleanRoll);
    return found || null;
  };

  // Start or resume quiz attempt
  const startQuizAttempt = async (
    quizId: string,
    rollNumber: string,
    studentName: string
  ): Promise<QuizAttempt> => {
    const cleanRoll = rollNumber.trim().toUpperCase();
    const existing = attempts.find(
      (a) => a.quiz_id === quizId && a.roll_number.toUpperCase() === cleanRoll
    );

    if (existing) {
      return existing;
    }

    const quiz = quizzes.find((q) => q.id === quizId);
    const newAttempt: QuizAttempt = {
      id: 'att-' + Date.now(),
      quiz_id: quizId,
      roll_number: cleanRoll,
      student_name: studentName,
      answers: {},
      score: 0,
      total_marks: quiz ? quiz.total_marks : 10,
      status: 'in_progress',
      is_blocked: false,
      violation_reason: null,
      refresh_count: 0,
      started_at: new Date().toISOString(),
      submitted_at: null,
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('quiz_attempts').insert([newAttempt]);
      } catch (e) {
        console.warn('Supabase attempt insert error:', e);
      }
    }

    const updated = [newAttempt, ...attempts];
    setAttempts(updated);
    localStorage.setItem('eduwonder_attempts', JSON.stringify(updated));
    return newAttempt;
  };

  // Anti-Cheat: Record Refresh / Violation -> Immediate Block & Auto-Submit
  const recordQuizViolation = async (attemptId: string, reason: string): Promise<QuizAttempt | null> => {
    const target = attempts.find((a) => a.id === attemptId);
    if (!target) return null;

    // Calculate current partial score based on answers given so far
    const quizQuestions = questions.filter((q) => q.quiz_id === target.quiz_id);
    let calculatedScore = 0;
    quizQuestions.forEach((q) => {
      const studentAns = target.answers[q.id];
      if (studentAns !== undefined && studentAns === q.correct_index) {
        calculatedScore += q.marks || 1;
      }
    });

    const updatedAttempt: QuizAttempt = {
      ...target,
      status: 'blocked',
      is_blocked: true,
      violation_reason: reason,
      refresh_count: (target.refresh_count || 0) + 1,
      score: calculatedScore,
      submitted_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('quiz_attempts')
          .update({
            status: 'blocked',
            is_blocked: true,
            violation_reason: reason,
            refresh_count: updatedAttempt.refresh_count,
            score: calculatedScore,
            submitted_at: updatedAttempt.submitted_at,
          })
          .eq('id', attemptId);
      } catch (e) {
        console.warn('Supabase record violation error:', e);
      }
    }

    const updated = attempts.map((a) => (a.id === attemptId ? updatedAttempt : a));
    setAttempts(updated);
    localStorage.setItem('eduwonder_attempts', JSON.stringify(updated));
    return updatedAttempt;
  };

  // Admin allows re-exam: unblock student attempt
  const unblockStudentAttempt = async (attemptId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('quiz_attempts')
          .update({
            status: 'in_progress',
            is_blocked: false,
            violation_reason: null,
            submitted_at: null,
          })
          .eq('id', attemptId);
      } catch (e) {
        console.warn('Supabase unblock error:', e);
      }
    }

    const updated = attempts.map((a) =>
      a.id === attemptId
        ? {
            ...a,
            status: 'in_progress' as const,
            is_blocked: false,
            violation_reason: null,
            submitted_at: null,
          }
        : a
    );
    setAttempts(updated);
    localStorage.setItem('eduwonder_attempts', JSON.stringify(updated));
  };

  // Final submission of quiz
  const submitQuizAttempt = async (
    attemptId: string,
    answers: Record<string, number>
  ): Promise<QuizAttempt | null> => {
    const target = attempts.find((a) => a.id === attemptId);
    if (!target) return null;

    const quizQuestions = questions.filter((q) => q.quiz_id === target.quiz_id);
    let calculatedScore = 0;
    quizQuestions.forEach((q) => {
      const studentAns = answers[q.id];
      if (studentAns !== undefined && studentAns === q.correct_index) {
        calculatedScore += q.marks || 1;
      }
    });

    const updatedAttempt: QuizAttempt = {
      ...target,
      answers,
      score: calculatedScore,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('quiz_attempts')
          .update({
            answers,
            score: calculatedScore,
            status: 'submitted',
            submitted_at: updatedAttempt.submitted_at,
          })
          .eq('id', attemptId);
      } catch (e) {
        console.warn('Supabase submit quiz error:', e);
      }
    }

    const updated = attempts.map((a) => (a.id === attemptId ? updatedAttempt : a));
    setAttempts(updated);
    localStorage.setItem('eduwonder_attempts', JSON.stringify(updated));
    return updatedAttempt;
  };

  return (
    <AppContext.Provider
      value={{
        subjects,
        notes,
        students,
        quizzes,
        questions,
        attempts,
        bookmarks,
        searchQuery,
        setSearchQuery,
        isAdmin,
        setIsAdmin,
        toggleBookmark,
        isBookmarked,
        addNote,
        deleteNote,
        addStudentsFromCSV,
        createQuiz,
        deleteQuiz,
        toggleQuizApproval,
        toggleShowCorrectAnswers,
        verifyStudent,
        startQuizAttempt,
        recordQuizViolation,
        unblockStudentAttempt,
        submitQuizAttempt,
        refreshData: refreshFromSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
