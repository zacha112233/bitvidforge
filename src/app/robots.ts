import type { MetadataRoute } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://bitvidforge.vercel.app');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          '*',
          'Googlebot',
          'Bingbot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'GPTBot',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
