import type { APIRoute } from 'astro';
import {
  BASE_URL,
  getActiveWritingCategories,
  getCategoryPosts,
  getStoriesGrouped,
} from '../lib/content';

export const prerender = true;

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDate(raw?: string | number): string | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().split('T')[0];
}

export const GET: APIRoute = async () => {
  const entries: SitemapEntry[] = [
    { loc: `${BASE_URL}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${BASE_URL}/navilgal`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${BASE_URL}/writings`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${BASE_URL}/arts`, changefreq: 'weekly', priority: '0.85' },
    { loc: `${BASE_URL}/tools`, changefreq: 'monthly', priority: '0.85' },
    { loc: `${BASE_URL}/teaching`, changefreq: 'monthly', priority: '0.75' },
    { loc: `${BASE_URL}/tools/transliterator`, changefreq: 'monthly', priority: '0.85' },
    { loc: `${BASE_URL}/tools/arichuvadi`, changefreq: 'monthly', priority: '0.85' },
    { loc: `${BASE_URL}/tools/piano`, changefreq: 'monthly', priority: '0.75' },
    { loc: `${BASE_URL}/tools/vocoder`, changefreq: 'monthly', priority: '0.75' },
    { loc: `${BASE_URL}/downloads`, changefreq: 'monthly', priority: '0.85' },
    { loc: `${BASE_URL}/downloads/nammil`, changefreq: 'monthly', priority: '0.95' },
    { loc: `${BASE_URL}/about`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${BASE_URL}/contact`, changefreq: 'yearly', priority: '0.6' },
    { loc: `${BASE_URL}/privacy`, changefreq: 'yearly', priority: '0.5' },
    { loc: `${BASE_URL}/terms`, changefreq: 'yearly', priority: '0.5' },
    { loc: `${BASE_URL}/disclaimer`, changefreq: 'yearly', priority: '0.5' },
  ];

  const arichuvadiFeatures = [
    'editor',
    'learn',
    'practice',
    'match',
    'memorize',
    'books',
    'image',
    'downloads',
    'about',
  ];
  arichuvadiFeatures.forEach((f) => {
    entries.push({
      loc: `${BASE_URL}/tools/arichuvadi/${f}`,
      changefreq: 'monthly',
      priority: '0.7',
    });
  });

  const artCategories = [
    'pencil',
    'illustrations',
    'poster',
    'editing',
    'poems',
    'quotes',
    'painting',
    'digital_arts',
  ];
  artCategories.forEach((c) => {
    entries.push({
      loc: `${BASE_URL}/arts/${c}`,
      changefreq: 'weekly',
      priority: '0.75',
    });
  });

  const activeCategories = await getActiveWritingCategories();
  for (const cat of activeCategories) {
    entries.push({
      loc: `${BASE_URL}/writings/${cat.key}`,
      changefreq: 'weekly',
      priority: '0.85',
    });

    if (cat.key === 'stories') {
      const { seriesMap } = await getStoriesGrouped();
      seriesMap.forEach((_parts, seriesName) => {
        entries.push({
          loc: `${BASE_URL}/writings/stories/series/${encodeURIComponent(seriesName)}`,
          changefreq: 'weekly',
          priority: '0.8',
        });
      });
    }

    const posts = await getCategoryPosts(cat.key);
    for (const post of posts) {
      entries.push({
        loc: `${BASE_URL}/writings/${cat.key}/${encodeURIComponent(post.slug)}`,
        lastmod: toIsoDate(post.publish_date || post.date || post.timestamp),
        changefreq: 'monthly',
        priority: '0.8',
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
