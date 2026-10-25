/**
 * Central Site Configuration & SEO Constants for EduWonder
 * Used by Metadata API, dynamic sitemap.ts, robots.ts, and JSON-LD schemas.
 */

export const siteConfig = {
  name: 'EduWonder',
  shortName: 'EduWonder',
  legalName: 'EduWonder Educational Technologies',
  description:
    'Free engineering computer science lecture notes, unit-wise PDF downloads, and anti-cheat online MCQ examination portal for university students.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://eduwonder.com',
  ogImage: '/og-image.png',
  locale: 'en_US',
  author: 'EduWonder Academic Team',
  twitterHandle: '@EduWonderApp',
  creator: 'EduWonder Academic Team',
  publisher: 'EduWonder Open Courseware Initiative',
  category: 'Education & Academics',
  primaryKeywords: [
    'Engineering computer science lecture notes PDF',
    'Data Structures and Algorithms unit wise notes',
    'Free college MCQ test and quiz portal',
    'DBMS and Operating Systems university exam revision notes',
    'Anti-cheat online exam platform for college students',
    'Computer Science 3rd semester syllabus notes',
    'Download BTech lecture notes free',
  ],
  contactEmail: 'academic@eduwonder.com',
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
    'YOUR_GOOGLE_SEARCH_CONSOLE_KEY',
  links: {
    github: 'https://github.com/eduwonder',
    twitter: 'https://twitter.com/EduWonderApp',
    linkedin: 'https://linkedin.com/company/eduwonder',
  },
};
