import React from 'react';
import { siteConfig } from '@/lib/site-config';
import { INITIAL_SUBJECTS } from '@/lib/mock-data';

export interface FAQItem {
  question: string;
  answer: string;
}

export const DEFAULT_FAQS: FAQItem[] = [
  {
    question: 'What is EduWonder and what study materials are available?',
    answer:
      'EduWonder is an open-access college educational platform providing free, curriculum-aligned computer science engineering lecture notes, unit-wise PDF study guides, and timed anti-cheat MCQ online examination practice tests. Subjects include Data Structures & Algorithms (CS301), Database Management Systems (CS302), Operating Systems (CS303), and Computer Networks (CS304).',
  },
  {
    question: 'How can students download lecture notes on EduWonder?',
    answer:
      'Students can instantly preview any lecture note directly in the browser or mobile view without creating an account. Clicking "Download PDF" initiates a high-speed download link for full offline study.',
  },
  {
    question: 'How does the EduWonder anti-cheat quiz system work?',
    answer:
      'The EduWonder quiz portal implements strict browser integrity controls. Students authenticate using their verified college roll number. If a student attempts to refresh the browser, switch tabs, or navigate away during an active examination, the system logs a security violation, auto-submits the attempt, and locks further submissions until an authorized instructor unlocks it from the faculty dashboard.',
  },
  {
    question: 'Are the study notes aligned with university syllabi?',
    answer:
      'Yes. All lecture notes and practice tests on EduWonder are organized by subject, unit number, and lecture topic, adhering to standard university B.Tech and B.E. Computer Science and Information Technology curricula.',
  },
  {
    question: 'Is EduWonder free to use for college students?',
    answer:
      'Yes, EduWonder is 100% free for students to access, read, and download all subject notes and attempt practice examination quizzes.',
  },
];

interface JsonLdProps {
  customFaqs?: FAQItem[];
  pageType?: 'WebSite' | 'CollectionPage' | 'Course' | 'Quiz';
  pageUrl?: string;
  pageTitle?: string;
  pageDescription?: string;
}

export default function JsonLd({
  customFaqs = DEFAULT_FAQS,
  pageUrl = siteConfig.url,
  pageTitle = siteConfig.name,
  pageDescription = siteConfig.description,
}: JsonLdProps) {
  const baseUrl = siteConfig.url.replace(/\/$/, '');

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. WebSite with Sitelinks SearchBox
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        inLanguage: 'en-US',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/notes?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },

      // 2. EducationalOrganization / Organization
      {
        '@type': 'EducationalOrganization',
        '@id': `${baseUrl}/#organization`,
        name: siteConfig.legalName,
        alternateName: siteConfig.shortName,
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/icon.svg`,
          width: 512,
          height: 512,
        },
        description: siteConfig.description,
        email: siteConfig.contactEmail,
        sameAs: [
          siteConfig.links.github,
          siteConfig.links.twitter,
          siteConfig.links.linkedin,
        ],
      },

      // 3. FAQPage Schema for Generative Engine & AI Overviews
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}/#faq`,
        mainEntity: customFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },

      // 4. Course / LearningResource Schemas for Core University Subjects
      ...INITIAL_SUBJECTS.map((subject) => ({
        '@type': 'Course',
        '@id': `${baseUrl}/notes?subject=${encodeURIComponent(subject.name)}#course`,
        name: `${subject.name} (${subject.code || 'B.Tech CS'})`,
        courseCode: subject.code || 'CS',
        description: subject.description,
        provider: {
          '@id': `${baseUrl}/#organization`,
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: 'Semester Lecture Notes & Timed Quizzes',
        },
        educationalCredentialAwarded: 'Self-Paced Examination Proficiency',
        isAccessibleForFree: true,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
