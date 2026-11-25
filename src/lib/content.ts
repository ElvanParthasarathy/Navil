import dns from 'node:dns';
import staticArticles from '../தரவு/கட்டுரைகள்.json';
import staticArts from '../தரவு/கலைகள்.json';
import profileData from '../தரவு/தன்னுரு.json';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore in non-Node runtimes
}

const DB_URL =
  import.meta.env.VITE_FIREBASE_DATABASE_URL ||
  process.env.VITE_FIREBASE_DATABASE_URL ||
  'https://elvanparthasarathy-default-rtdb.asia-southeast1.firebasedatabase.app';

export const BASE_URL = 'https://elvannavil.vercel.app';

export interface WritingVariant {
  author?: string;
  label?: string;
  lang?: string;
  title?: string;
  text?: string;
  transliterations?: Record<string, string>;
  titleTransliterations?: Record<string, string>;
  authorTransliterations?: Record<string, string>;
}

export interface WritingItem {
  id: string;
  slug: string;
  title?: string;
  text?: string;
  lang?: string;
  category?: string;
  classification?: string;
  date?: string;
  publish_date?: string;
  timestamp?: number;
  display_order?: number;
  is_pinned?: boolean;
  pin_type?: string;
  is_featured?: boolean;
  is_private?: boolean;
  cover_image?: string;
  tags?: string[] | string;
  style?: string;
  theme?: string;
  meter?: string;
  series_name?: string;
  series_part?: number;
  urai?: string;
  notes?: string;
  isUraiNotesLocked?: boolean;
  uraiNotesPassword?: string;
  uraiNotesPasswordHint?: string;
  variants?: WritingVariant[];
  content?: Record<string, { title?: string; body?: string; excerpt?: string }>;
  [key: string]: any;
}

export const CATEGORY_META: Record<
  string,
  {
    key: string;
    titleTa: string;
    titleEn: string;
    descTa: string;
    descEn: string;
    footerTa: string;
  }
> = {
  poems: {
    key: 'poems',
    titleTa: 'நவில் மிழிகள்',
    titleEn: 'Navil Poems',
    descTa: 'என் உணர்வுகளைப் பேசும் ஓசைநயமிக்க வரிகள்.',
    descEn: 'My lyrical verses and emotional expressions.',
    footerTa: 'நவில் மிழிகளை வாசிக்க',
  },
  quotes: {
    key: 'quotes',
    titleTa: 'நவில் மொழிகள்',
    titleEn: 'Navil Quotes',
    descTa: 'என் பட்டறிவில் உதித்த சிந்தனைத் துளிகள்.',
    descEn: 'My short quotes and personal insights.',
    footerTa: 'நவில் மொழிகளைப் பார்க்க',
  },
  articles: {
    key: 'articles',
    titleTa: 'கட்டுரைகள்',
    titleEn: 'Articles',
    descTa: 'என் ஆழமான பகுப்பாய்வுப் பதிவுகள்.',
    descEn: 'My in-depth technical and structured writings.',
    footerTa: 'கட்டுரைகளைப் படிக்க',
  },
  stories: {
    key: 'stories',
    titleTa: 'சிறுகதைகள்',
    titleEn: 'Short Stories',
    descTa: 'ஒரு கதை சொல்லட்டா சார்?',
    descEn: 'My original fiction and short narratives.',
    footerTa: 'சிறுகதைகளை வாசிக்க',
  },
  blog: {
    key: 'blog',
    titleTa: 'வலைப்பதிவுகள்',
    titleEn: 'Blog Posts',
    descTa: 'என் அன்றாடத் தேடல்களும் வாழ்வியல் பகிர்வுகளும்.',
    descEn: 'My daily reflections and personal updates.',
    footerTa: 'பகிர்வுகளை வாசிக்க',
  },
  diary: {
    key: 'diary',
    titleTa: 'நாளேடு',
    titleEn: 'Diary',
    descTa: 'என் நாள்களின் நினைவுகளும் பதிவுகளும்.',
    descEn: 'Memories and records of my days.',
    footerTa: 'நாளேட்டைத் திறக்க',
  },
};

export const ALL_WRITING_CATEGORIES = ['poems', 'quotes', 'articles', 'stories', 'blog', 'diary'] as const;

const fetchCache: Record<string, any> = {};

async function fetchFirebasePath(pathName: string): Promise<any> {
  if (pathName in fetchCache) {
    return fetchCache[pathName];
  }
  const url = `${DB_URL}/${pathName}.json`;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        fetchCache[pathName] = null;
        return null;
      }
      const data = await res.json();
      fetchCache[pathName] = data;
      return data;
    } catch (err) {
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
        continue;
      }
      console.warn(`[content] Could not fetch ${pathName}:`, err);
      fetchCache[pathName] = null;
      return null;
    }
  }
  return null;
}

export function cleanText(htmlStr: string | undefined | null): string {
  if (!htmlStr) return '';
  return String(htmlStr)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(str: string | undefined | null, max = 160): string {
  if (!str) return '';
  const clean = cleanText(str);
  if (clean.length <= max) return clean;
  return clean.substring(0, max - 3).trim() + '...';
}

export function fixDriveImages(html: string): string {
  if (!html) return '';
  const drivePattern =
    /(src=["'])[^"']*(drive\.google\.com\/(?:file\/d\/|open\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)[^"']*(["'])/gi;
  return html.replace(drivePattern, (_match, before, _domain, fileId, after) => {
    return `${before}https://drive.google.com/thumbnail?id=${fileId}&sz=w1200${after}`;
  });
}

export function textToHtml(raw: string | undefined | null): string {
  if (!raw) return '';
  if (!/<(p|h[1-6]|ul|ol|li|div|pre|blockquote|br)[> \/]/i.test(raw)) {
    return fixDriveImages(
      raw
        .split('\n')
        .map((line) => (line.trim() ? `<p>${line}</p>` : '<p style="height:1.2em"></p>'))
        .join('')
    );
  }
  const html = raw.replace(/<p>([\s\S]*?)<\/p>/gi, (_match, content) => {
    const lines = content.split(/<br\s*\/?>/gi);
    return lines
      .map((line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return '<p style="height:1.2em"></p>';
        return `<p>${trimmed}</p>`;
      })
      .join('');
  });
  return fixDriveImages(html);
}

export function sanitizeSlug(raw: string | undefined | null): string {
  return String(raw || '')
    .trim()
    .replace(/[<>:"/\\|?*#%&]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function cleanItem(rawVal: any, key: string): WritingItem {
  const cleanSlug = sanitizeSlug(rawVal?.slug || key) || sanitizeSlug(key) || encodeURIComponent(key);
  const item: WritingItem = { ...rawVal, id: key, slug: cleanSlug };
  if (item.variants) {
    if (!Array.isArray(item.variants)) {
      item.variants = Object.values(item.variants);
    }
    item.variants = item.variants.map((v: any) => {
      const next = { ...v };
      if (next.transliterations?._empty) {
        const copy = { ...next.transliterations };
        delete copy._empty;
        next.transliterations = copy;
      }
      if (next.titleTransliterations?._empty) {
        const copy = { ...next.titleTransliterations };
        delete copy._empty;
        next.titleTransliterations = copy;
      }
      if (next.authorTransliterations?._empty) {
        const copy = { ...next.authorTransliterations };
        delete copy._empty;
        next.authorTransliterations = copy;
      }
      if (!next.transliterations) next.transliterations = {};
      if (!next.titleTransliterations) next.titleTransliterations = {};
      if (!next.authorTransliterations) next.authorTransliterations = {};
      return next;
    });
  }
  return item;
}

export function sortItems(rows: WritingItem[]): WritingItem[] {
  return [...rows].sort((a, b) => {
    const isAPinned = Boolean(a.is_pinned && a.pin_type === 'permanent');
    const isBPinned = Boolean(b.is_pinned && b.pin_type === 'permanent');
    if (isAPinned && !isBPinned) return -1;
    if (!isAPinned && isBPinned) return 1;
    if ((a.display_order ?? 0) !== (b.display_order ?? 0)) {
      return (a.display_order || 0) - (b.display_order || 0);
    }
    const da = new Date(a.publish_date || a.date || 0).getTime() || 0;
    const db = new Date(b.publish_date || b.date || 0).getTime() || 0;
    return db - da;
  });
}

export async function getCategoryRaw(category: string): Promise<Record<string, any>> {
  const remote = await fetchFirebasePath(category);
  let merged: Record<string, any> = {};
  if (category === 'articles' && staticArticles) {
    merged = { ...(staticArticles as Record<string, any>) };
  }
  if (remote && typeof remote === 'object') {
    merged = { ...merged, ...remote };
  }
  return merged;
}

export async function getCategoryPosts(category: string): Promise<WritingItem[]> {
  const raw = await getCategoryRaw(category);
  const rows = Object.entries(raw)
    .filter(([, val]) => val && typeof val === 'object' && !val.is_private)
    .map(([key, val]) => cleanItem(val, key));
  return sortItems(rows);
}

export async function getActiveWritingCategories(): Promise<
  Array<(typeof CATEGORY_META)[string] & { count: number }>
> {
  const results = await Promise.all(
    ALL_WRITING_CATEGORIES.map(async (cat) => {
      const posts = await getCategoryPosts(cat);
      return { ...CATEGORY_META[cat], count: posts.length };
    })
  );
  return results.filter((c) => c.count > 0);
}

export function getPrimaryTitle(post: WritingItem, category: string): string {
  const variants = post.variants || [];
  const contentObj = post.content || {};
  if (category === 'stories') {
    return post.title || variants[0]?.title || 'Untitled Story';
  }
  if (variants.length > 0) {
    return variants[0]?.title || post.title || 'Untitled';
  }
  const firstLang = Object.keys(contentObj)[0];
  return (firstLang && contentObj[firstLang]?.title) || post.title || 'Untitled';
}

export function getPrimaryExcerpt(post: WritingItem, max = 160): string {
  const variants = post.variants || [];
  if (variants.length > 0 && variants[0]?.text) {
    return truncate(variants[0].text, max);
  }
  if (post.text) {
    return truncate(post.text, max);
  }
  const contentObj = post.content || {};
  const firstLang = Object.keys(contentObj)[0];
  if (firstLang && contentObj[firstLang]?.body) {
    return truncate(contentObj[firstLang].body, max);
  }
  return '';
}

export function getPostTags(post: WritingItem): string[] {
  const set = new Set<string>();
  if (Array.isArray(post.tags)) {
    post.tags.forEach((t) => typeof t === 'string' && t.trim() && set.add(t.trim()));
  } else if (typeof post.tags === 'string') {
    post.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => set.add(t));
  }
  [post.style, post.theme, post.meter].forEach((f) => {
    if (typeof f === 'string' && f.trim()) set.add(f.trim());
  });
  return Array.from(set);
}

export interface StorySeriesGroup {
  type: 'series';
  id: string;
  seriesName: string;
  parts: WritingItem[];
  coverImage: string | null;
  classification: string | null;
  genres: string[];
  excerpt: string;
}

export interface StandaloneStoryItem {
  type: 'standalone';
  id: string;
  post: WritingItem;
}

export async function getStoriesGrouped(): Promise<{
  posts: WritingItem[];
  seriesMap: Map<string, WritingItem[]>;
  grouped: Array<StorySeriesGroup | StandaloneStoryItem>;
}> {
  const posts = await getCategoryPosts('stories');
  const standalone: StandaloneStoryItem[] = [];
  const seriesMap = new Map<string, WritingItem[]>();

  posts.forEach((post) => {
    const sName = post.series_name?.trim();
    if (!sName) {
      standalone.push({ type: 'standalone', id: post.id, post });
    } else {
      if (!seriesMap.has(sName)) seriesMap.set(sName, []);
      seriesMap.get(sName)!.push(post);
    }
  });

  const grouped: Array<StorySeriesGroup | StandaloneStoryItem> = [...standalone];
  seriesMap.forEach((parts, seriesName) => {
    const sortedParts = [...parts].sort((a, b) => (a.series_part || 0) - (b.series_part || 0));
    const firstPart = sortedParts[0];
    const genreSet = new Set<string>();
    sortedParts.forEach((p) => getPostTags(p).forEach((g) => genreSet.add(g)));

    grouped.push({
      type: 'series',
      id: `series-${seriesName}`,
      seriesName,
      parts: sortedParts,
      coverImage: sortedParts.find((p) => p.cover_image)?.cover_image || null,
      classification: sortedParts.find((p) => p.classification)?.classification || null,
      genres: Array.from(genreSet),
      excerpt: getPrimaryExcerpt(firstPart, 140),
    });
  });

  return { posts, seriesMap, grouped };
}

export async function getAllArts(): Promise<any[]> {
  const remote = await fetchFirebasePath('arts');
  if (remote && typeof remote === 'object' && Object.keys(remote).length > 0) {
    return Object.entries(remote)
      .map(([key, val]: [string, any]) => ({ ...val, id: key }))
      .sort((a, b) => {
        const orderA = a.display_order !== undefined ? a.display_order : 999999;
        const orderB = b.display_order !== undefined ? b.display_order : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
  }
  return Array.isArray(staticArts) ? staticArts : [];
}

export async function getArtsCounts(): Promise<Record<string, number>> {
  const all = await getAllArts();
  const counts: Record<string, number> = {};
  all.forEach((item) => {
    const cat = item.category || 'other';
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return counts;
}

export async function getAboutConfig() {
  const DEFAULT_ABOUT = {
    hero_title: 'Elvan Parthasarathy',
    hero_subtitle: '(Known as Jaiprakash P)',
    bio: (profileData as any)?.bio || 'Engineering student, writer, and creator based in Tamil Nadu, India.',
    portfolio_url: 'https://jaiprakashpartha.vercel.app',
    location: 'Arani, Tamil Nadu',
    contact_tamil: 'இணைவோம்',
    contact_english: "Let's Connect",
    contact_desc_tamil: 'எண்ணங்களும் உரையாடல்களுக்கும்.',
    contact_desc_english: 'For thoughts and conversations.',
    identity_text:
      '<p><strong>இயற்பெயர்: பா. ஜெய்பிரகாஷ்</strong><br>Real Name: Jaiprakash P</p>',
    education_text:
      '<p>Pursuing engineering with focus on software systems, web technologies, and computational linguistics.</p>',
    social_text:
      'Active on GitHub, LinkedIn, and Instagram. Passionate about open software craftsmanship and regional typography.',
    philosophy_lines:
      '<p>Blending classical Tamil literary aesthetics with modern software engineering.</p>',
    cards: [
      {
        content:
          '<p>"ஏன் கூடாது?" என்று வினவுகையில் புதிய எண்ணம் பிறக்கிறது.</p><p><em>Every idea begins with a simple question — why not?</em></p>',
      },
    ],
  };

  const remote = await fetchFirebasePath('config/about_page');
  if (remote && typeof remote === 'object') {
    return { ...DEFAULT_ABOUT, ...remote };
  }
  return DEFAULT_ABOUT;
}

export function formatPlayerQuote(quoteObj: WritingItem | null) {
  const fallback = {
    id: '',
    slug: '',
    classification: 'அகம்',
    main: 'சொல்லில் உயர்வு தமிழ்ச் சொல்லே — அதைத் தொழுது படித்திடடி பாப்பா!',
    sub: 'Tamil is the loftiest of spoken tongues — revere and recite it, young child.',
    tag: 'பாரதியார் • Bharathiyar',
    mainLang: 'ta',
    subLang: 'en',
  };
  if (!quoteObj) return fallback;

  const variants = quoteObj.variants || [];
  const tags = getPostTags(quoteObj);
  const finalTag = tags.length > 0 ? tags.join(' • ') : 'Philosophy';

  if (variants.length === 0) {
    return {
      id: quoteObj.id,
      slug: quoteObj.slug,
      classification: quoteObj.classification || '',
      main: cleanText(quoteObj.text) || fallback.main,
      sub: cleanText(quoteObj.transliteration || quoteObj.translation) || fallback.sub,
      tag: finalTag,
      mainLang: quoteObj.lang || 'ta',
      subLang: 'en',
    };
  }

  const mainVar = variants[0];
  const subVar = variants[1];
  let subText = '';
  let subLang = 'en';

  if (subVar?.text) {
    subText = cleanText(subVar.text);
    subLang = subVar.lang || 'en';
  } else if (mainVar?.transliterations) {
    const keys = Object.keys(mainVar.transliterations);
    if (keys.length > 0) {
      subLang = keys[0];
      subText = cleanText(mainVar.transliterations[subLang]);
    }
  }

  return {
    id: quoteObj.id,
    slug: quoteObj.slug,
    classification: quoteObj.classification || '',
    main: cleanText(mainVar?.text) || fallback.main,
    sub: subText || null,
    tag: finalTag,
    mainLang: mainVar?.lang || 'ta',
    subLang,
  };
}

export function formatPlayerPoem(poemObj: WritingItem | null) {
  const fallback = {
    id: '',
    slug: '',
    classification: 'புறம்',
    theme: 'இலக்கியம் • Literature',
    main: {
      title: 'செந்தமிழ் நாடெனும் போதினிலே',
      text: 'செந்தமிழ் நாடெனும் போதினிலே — இன்பத்\nதேன்வந்து பாயுது காதினிலே!',
      lang: 'ta',
    },
    sub: {
      text: 'When the words "Land of Senthamizh" ring, sweet nectar pours into our ears.',
      lang: 'en',
    },
  };
  if (!poemObj) return fallback;

  const truncLines = (raw: string) => {
    const normalized = String(raw || '')
      .replace(/<\/p>\s*<p>/gi, '\n')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '');
    const lines = normalized
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length <= 2) return lines.join('\n');
    return lines.slice(0, 2).join('\n') + '\n...';
  };

  const tags = getPostTags(poemObj);
  const theme = tags.length > 0 ? tags.join(' • ') : 'Literature';
  const variants = poemObj.variants || [];

  if (variants.length === 0) {
    return {
      id: poemObj.id,
      slug: poemObj.slug,
      classification: poemObj.classification || '',
      theme,
      main: {
        title: poemObj.title || 'Untitled',
        text: truncLines(poemObj.text || '') || fallback.main.text,
        lang: poemObj.lang || 'ta',
      },
      sub: poemObj.translation || poemObj.transliteration
        ? { text: truncLines(poemObj.translation || poemObj.transliteration), lang: 'en' }
        : fallback.sub,
    };
  }

  const mainVar = variants[0];
  const subVar = variants[1];
  let sub: { text: string; lang: string } | null = null;
  if (subVar?.text) {
    sub = { text: truncLines(subVar.text), lang: subVar.lang || 'en' };
  } else if (mainVar?.transliterations) {
    const keys = Object.keys(mainVar.transliterations);
    if (keys.length > 0) {
      sub = { text: truncLines(mainVar.transliterations[keys[0]]), lang: keys[0] };
    }
  }

  return {
    id: poemObj.id,
    slug: poemObj.slug,
    classification: poemObj.classification || '',
    theme,
    main: {
      title: mainVar?.title || poemObj.title || 'Untitled',
      text: truncLines(mainVar?.text || ''),
      lang: mainVar?.lang || 'ta',
    },
    sub,
  };
}
