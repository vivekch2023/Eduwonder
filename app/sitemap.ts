import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { INITIAL_SUBJECTS, INITIAL_QUIZZES } from '@/lib/mock-data';

/**
 * Dynamic Sitemap Generator for EduWonder (Next.js 14 App Router)
 * Generates an up-to-date sitemap with canonical URLs, change frequencies,
 * and SEO weighting for Googlebot, PerplexityBot, GPTBot, and Bingbot.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const now = new Date();

  // Core high-priority landing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/notes`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Subject-specific indexation routes (for targeted search queries like "DBMS notes", "DSA lecture notes")
  const subjectRoutes: MetadataRoute.Sitemap = INITIAL_SUBJECTS.map((subject) => ({
    url: `${baseUrl}/notes?subject=${encodeURIComponent(subject.name)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Dynamic public online MCQ quizzes
  const quizRoutes: MetadataRoute.Sitemap = INITIAL_QUIZZES.map((quiz) => ({
    url: `${baseUrl}/quiz/${quiz.id}`,
    lastModified: quiz.created_at ? new Date(quiz.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...subjectRoutes, ...quizRoutes];
}
