import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Practice MCQ Quizzes & Timed Examination Portal',
  description:
    'Test your conceptual understanding with timed MCQ examinations featuring anti-refresh browser integrity controls and instant faculty reporting.',
  alternates: {
    canonical: '/quiz',
  },
  openGraph: {
    title: 'Online Practice MCQ Quizzes & Timed Examination Portal | EduWonder',
    description:
      'Attempt timed chapter-wise online MCQ tests with strict anti-cheat monitoring for computer science students.',
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
