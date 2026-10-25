import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subject-Wise College Lecture Notes & PDF Downloads',
  description:
    'Search and download unit-wise engineering computer science study notes, lecture summaries, and reference PDFs for Data Structures, DBMS, Operating Systems, and Networks.',
  alternates: {
    canonical: '/notes',
  },
  openGraph: {
    title: 'Subject-Wise College Lecture Notes & PDF Downloads | EduWonder',
    description:
      'Search and download unit-wise engineering computer science study notes, lecture summaries, and reference PDFs for university examinations.',
  },
};

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
