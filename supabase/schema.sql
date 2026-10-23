-- Supabase Database Schema for EduWonder Learning & Quiz System

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT,
    icon TEXT DEFAULT 'BookOpen',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Notes Table (Subject-wise, Unit-wise, Lecture-wise)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    unit_no INTEGER NOT NULL DEFAULT 1,
    unit_name TEXT NOT NULL,
    lecture_title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size TEXT DEFAULT '2.4 MB',
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Students Table (For CSV upload and roll number verification)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    department TEXT DEFAULT 'General',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Quizzes Table (Live approval, 3-min delay, duration)
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    is_approved BOOLEAN DEFAULT false,
    approved_at TIMESTAMP WITH TIME ZONE,
    start_delay_seconds INTEGER DEFAULT 180,
    total_marks INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings e.g. ["A", "B", "C", "D"]
    correct_index INTEGER NOT NULL, -- 0-based index
    marks INTEGER DEFAULT 1,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Quiz Attempts Table (Live monitoring, anti-cheat, blocked status, scoring)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    roll_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb, -- Map of { questionId: selectedIndex }
    score NUMERIC DEFAULT 0,
    total_marks NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'in_progress', -- 'in_progress' | 'submitted' | 'blocked'
    is_blocked BOOLEAN DEFAULT false,
    violation_reason TEXT,
    refresh_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE
);

-- 8. Indexes for ultra fast lookup
CREATE INDEX IF NOT EXISTS idx_notes_subject ON public.notes(subject_name);
CREATE INDEX IF NOT EXISTS idx_notes_unit ON public.notes(unit_no);
CREATE INDEX IF NOT EXISTS idx_students_roll ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_roll ON public.quiz_attempts(roll_number);

-- 9. Row Level Security (RLS) setup
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to subjects, notes, approved quizzes, and questions
CREATE POLICY "Public subjects are viewable by everyone" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public notes are viewable by everyone" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Public can view students for verification" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Public questions are viewable by everyone" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Public can insert and update their quiz attempt" ON public.quiz_attempts FOR ALL USING (true);

-- Allow authenticated users (Admin) full access
CREATE POLICY "Authenticated users have full access to subjects" ON public.subjects FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to notes" ON public.notes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to students" ON public.students FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to quizzes" ON public.quizzes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to questions" ON public.questions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to quiz_attempts" ON public.quiz_attempts FOR ALL TO authenticated USING (true);

-- 10. Storage Bucket Setup for PDF Notes
-- Run in Supabase SQL editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notes', 'notes', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public to view files in notes bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'notes');

-- Policy to allow authenticated or service role to upload notes
CREATE POLICY "Authenticated or Anon Insert to notes" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'notes');
