import React from 'react';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BlufHero from '@/components/home/BlufHero';
import SubjectGrid from '@/components/home/SubjectGrid';
import HomeClientWrapper from '@/components/home/HomeClientWrapper';
import FaqSection from '@/components/home/FaqSection';
import { INITIAL_SUBJECTS, INITIAL_NOTES, INITIAL_QUIZZES } from '@/lib/mock-data';

export const metadata: Metadata = {
  title: 'Free Engineering Lecture Notes & Anti-Cheat Exam Portal',
  description:
    'Download university-aligned B.Tech computer science lecture notes in PDF and practice with timed, anti-cheat MCQ online exams for DSA, DBMS, OS, and Computer Networks.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EduWonder | Free Engineering Lecture Notes & Anti-Cheat Exam Portal',
    description:
      'Curriculum-aligned lecture notes in PDF format and anti-cheat online MCQ examinations for college computer science students.',
  },
};

export default function HomePage() {
  return (
    <>
      {/* 1. Structured Data for Google AI Overviews & Search Graphs */}
      <JsonLd />

      {/* 2. BLUF-Engineered Answer-First Hero Section for AI Scrapers */}
      <BlufHero
        subjectsCount={INITIAL_SUBJECTS.length}
        notesCount={INITIAL_NOTES.length}
        quizzesCount={INITIAL_QUIZZES.length}
      />

      {/* 3. Pre-rendered Semantic Subject Grid (Server-Hydrated HTML) */}
      <SubjectGrid subjects={INITIAL_SUBJECTS} />

      {/* 4. Interactive Client Workflows (Notes Feed, Search Filter, Modals) */}
      <HomeClientWrapper />

      {/* 5. Server-rendered AEO Question-Answer Matrix */}
      <FaqSection />
    </>
  );
}
