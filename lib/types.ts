export interface Subject {
  id: string;
  name: string;
  code?: string;
  icon?: string;
  description?: string;
  created_at?: string;
}

export interface Note {
  id: string;
  subject_id?: string;
  subject_name: string;
  unit_no: number;
  unit_name: string;
  lecture_title: string;
  description: string;
  file_url: string;
  file_size?: string;
  download_count?: number;
  created_at?: string;
}

export interface Student {
  id: string;
  roll_number: string;
  name: string;
  email?: string;
  department?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject_name: string;
  description: string;
  duration_minutes: number;
  is_approved: boolean;
  approved_at?: string | null;
  start_delay_seconds?: number;
  total_marks: number;
  created_at?: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  marks: number;
  explanation?: string;
  created_at?: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  roll_number: string;
  student_name: string;
  answers: Record<string, number>; // questionId -> selectedIndex
  score: number;
  total_marks: number;
  status: 'in_progress' | 'submitted' | 'blocked';
  is_blocked: boolean;
  violation_reason?: string | null;
  refresh_count: number;
  started_at: string;
  submitted_at?: string | null;
}
