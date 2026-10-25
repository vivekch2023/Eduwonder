import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

/**
 * Production Robots Configuration for Next.js 14 App Router
 * Explicitly allows major web crawlers and AI search engine retrieval bots:
 * - Googlebot (Google Search & AI Overviews)
 * - GPTBot (OpenAI ChatGPT Search & retrieval)
 * - OAI-SearchBot (OpenAI Search prototype crawler)
 * - PerplexityBot (Perplexity AI real-time search)
 * - ClaudeBot (Anthropic search & web indexing)
 * - Applebot-Extended (Apple Intelligence search indexing)
 *
 * Disallows administrative routes, confidential examination endpoints, and private state.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, '');

  const standardDisallow = ['/admin', '/admin/*', '/api/admin/*', '/private/*'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: standardDisallow,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: standardDisallow,
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/notes', '/quiz', '/quiz/*'],
        disallow: standardDisallow,
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: ['/', '/notes', '/quiz', '/quiz/*'],
        disallow: standardDisallow,
      },
      {
        userAgent: 'PerplexityBot',
        allow: ['/', '/notes', '/quiz', '/quiz/*'],
        disallow: standardDisallow,
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/notes', '/quiz', '/quiz/*'],
        disallow: standardDisallow,
      },
      {
        userAgent: 'Applebot-Extended',
        allow: ['/', '/notes', '/quiz', '/quiz/*'],
        disallow: standardDisallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
