import { Student, QuizAttempt, Quiz, Question } from './types';

/**
 * Parses raw CSV line handling quoted commas
 */
function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim().replace(/^["']|["']$/g, ''));
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim().replace(/^["']|["']$/g, ''));
  return result;
}

/**
 * Parses raw CSV string into Student array.
 * Supports variations: roll_number / roll, name / student_name, email, department / branch
 */
export function parseStudentsCSV(csvText: string): { students: Omit<Student, 'id'>[]; errors: string[] } {
  const lines = csvText.trim().split(/\r?\n/);
  const students: Omit<Student, 'id'>[] = [];
  const errors: string[] = [];

  if (lines.length < 2) {
    return { students: [], errors: ['CSV file must contain a header row and at least one student data row.'] };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
  const rollIndex = headers.findIndex((h) => h.includes('roll'));
  const nameIndex = headers.findIndex((h) => h.includes('name'));
  const emailIndex = headers.findIndex((h) => h.includes('email'));
  const deptIndex = headers.findIndex((h) => h.includes('dept') || h.includes('department') || h.includes('branch'));

  if (rollIndex === -1 || nameIndex === -1) {
    return {
      students: [],
      errors: ['CSV must have columns for Roll Number (e.g. "roll_number" or "roll") and Name (e.g. "name").'],
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    const roll = cols[rollIndex];
    const name = cols[nameIndex];

    if (!roll || !name) {
      errors.push(`Row ${i + 1}: Missing roll number or name.`);
      continue;
    }

    students.push({
      roll_number: roll,
      name: name,
      email: emailIndex !== -1 && cols[emailIndex] ? cols[emailIndex] : `${roll.toLowerCase()}@college.edu`,
      department: deptIndex !== -1 && cols[deptIndex] ? cols[deptIndex] : 'Computer Science',
      is_active: true,
      created_at: new Date().toISOString(),
    });
  }

  return { students, errors };
}

export interface ParsedQuestion {
  question_text: string;
  options: [string, string, string, string];
  correct_index: number;
  marks: number;
  explanation: string;
}

/**
 * Parses Quiz Questions CSV file for Bulk Import
 * Expected headers: question_text, option_a, option_b, option_c, option_d, correct_answer, marks, explanation
 */
export function parseQuizQuestionsCSV(csvText: string): { questions: ParsedQuestion[]; errors: string[] } {
  const lines = csvText.trim().split(/\r?\n/);
  const questions: ParsedQuestion[] = [];
  const errors: string[] = [];

  if (lines.length < 2) {
    return { questions: [], errors: ['CSV file must have a header row and at least 1 question.'] };
  }

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
  const qIdx = headers.findIndex((h) => h.includes('question'));
  const optAIdx = headers.findIndex((h) => h.includes('option_a') || h === 'a' || h.includes('opt_a') || h.includes('opta'));
  const optBIdx = headers.findIndex((h) => h.includes('option_b') || h === 'b' || h.includes('opt_b') || h.includes('optb'));
  const optCIdx = headers.findIndex((h) => h.includes('option_c') || h === 'c' || h.includes('opt_c') || h.includes('optc'));
  const optDIdx = headers.findIndex((h) => h.includes('option_d') || h === 'd' || h.includes('opt_d') || h.includes('optd'));
  const ansIdx = headers.findIndex((h) => h.includes('correct') || h.includes('answer') || h.includes('ans'));
  const marksIdx = headers.findIndex((h) => h.includes('mark'));
  const expIdx = headers.findIndex((h) => h.includes('expla'));

  if (qIdx === -1 || optAIdx === -1 || optBIdx === -1 || optCIdx === -1 || optDIdx === -1 || ansIdx === -1) {
    return {
      questions: [],
      errors: [
        'Invalid CSV Headers. Required columns: "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer".',
      ],
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    const qText = cols[qIdx];
    const optA = cols[optAIdx];
    const optB = cols[optBIdx];
    const optC = cols[optCIdx];
    const optD = cols[optDIdx];
    const rawAns = (cols[ansIdx] || '').trim().toUpperCase();

    if (!qText || !optA || !optB || !optC || !optD) {
      errors.push(`Row ${i + 1}: Incomplete question or missing options.`);
      continue;
    }

    // Determine 0-based correct index
    let correctIdx = 0;
    if (rawAns === 'A' || rawAns === '1' || rawAns === '0') correctIdx = 0;
    else if (rawAns === 'B' || rawAns === '2') correctIdx = 1;
    else if (rawAns === 'C' || rawAns === '3') correctIdx = 2;
    else if (rawAns === 'D' || rawAns === '4') correctIdx = 3;
    else {
      // Check if rawAns matches option string exactly
      const opts = [optA, optB, optC, optD];
      const foundIdx = opts.findIndex((o) => o.toLowerCase() === rawAns.toLowerCase());
      correctIdx = foundIdx !== -1 ? foundIdx : 0;
    }

    const marks = marksIdx !== -1 && cols[marksIdx] ? parseInt(cols[marksIdx], 10) || 1 : 1;
    const explanation = expIdx !== -1 && cols[expIdx] ? cols[expIdx] : '';

    questions.push({
      question_text: qText,
      options: [optA, optB, optC, optD],
      correct_index: correctIdx,
      marks,
      explanation,
    });
  }

  return { questions, errors };
}

/**
 * Downloads sample template CSV for bulk importing quiz questions
 */
export function downloadSampleQuestionsCSV() {
  const sample = `question_text,option_a,option_b,option_c,option_d,correct_answer,marks,explanation\r\n"What is the time complexity of QuickSort in the average case?","O(N)","O(N log N)","O(N^2)","O(log N)",B,1,"QuickSort partition divides the array into subproblems yielding O(N log N) on average."\r\n"Which data structure is primarily used in Breadth First Search (BFS)?","Stack","Queue","Priority Queue","Tree",B,1,"BFS explores nodes level by level using a FIFO Queue."\r\n"Which protocol is used for securely transferring web pages?","HTTP","FTP","HTTPS","SMTP",C,1,"HTTPS encrypts HTTP traffic using TLS/SSL encryption."`;

  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'sample_quiz_questions_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and triggers browser download of Quiz Progress Report CSV
 */
export function downloadQuizReportCSV(
  quiz: Quiz,
  attempts: QuizAttempt[]
) {
  const headers = [
    'Rank',
    'Roll Number',
    'Student Name',
    'Score Obtained',
    'Total Marks',
    'Percentage (%)',
    'Status',
    'Violation / Refreshed',
    'Started At',
    'Submitted At',
  ];

  // Sort by score desc
  const sorted = [...attempts].sort((a, b) => (b.score || 0) - (a.score || 0));

  const rows = sorted.map((att, index) => {
    const percentage = att.total_marks > 0 ? ((att.score / att.total_marks) * 100).toFixed(1) : '0';
    return [
      index + 1,
      `"${att.roll_number}"`,
      `"${att.student_name}"`,
      att.score,
      att.total_marks,
      `${percentage}%`,
      att.status.toUpperCase(),
      att.is_blocked ? `YES (${att.violation_reason || 'Refresh'})` : 'NO',
      att.started_at ? `"${new Date(att.started_at).toLocaleString()}"` : 'N/A',
      att.submitted_at ? `"${new Date(att.submitted_at).toLocaleString()}"` : 'In Progress',
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanTitle = quiz.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `Quiz_Report_${cleanTitle}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
