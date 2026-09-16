import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_URL = 'https://elvannavil.vercel.app';

// Load env vars
dotenv.config({ path: '.env.local' });
if (!process.env.VITE_FIREBASE_DATABASE_URL) {
    dotenv.config({ path: '.env' });
}

const dbUrl = process.env.VITE_FIREBASE_DATABASE_URL || 'https://elvanparthasarathy-default-rtdb.asia-southeast1.firebasedatabase.app';

function cleanText(htmlStr) {
    if (!htmlStr) return '';
    return htmlStr
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

function truncate(str, max = 160) {
    if (!str) return '';
    const clean = cleanText(str);
    if (clean.length <= max) return clean;
    return clean.substring(0, max - 3).trim() + '...';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function savePage(indexTemplate, { route, title, description, contentHtml, ogType = 'article' }) {
    const canonicalUrl = `${BASE_URL}${route.startsWith('/') ? route : '/' + route}`;
    const fullTitle = title.includes('Elvan Navil') || title.includes('நவில்') 
        ? escapeHtml(title) 
        : `${escapeHtml(title)} — Elvan Navil`;
    const cleanDesc = escapeHtml(truncate(description || 'A bilingual Tamil-English digital creation studio by Elvan Parthasarathy.'));

    let html = indexTemplate;

    // 1. Replace Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${fullTitle}</title>`);

    // 2. Replace Meta Description
    if (html.includes('<meta name="description"')) {
        html = html.replace(/<meta name="description" content="[^"]*"/i, `<meta name="description" content="${cleanDesc}"`);
    } else {
        html = html.replace('</head>', `  <meta name="description" content="${cleanDesc}" />\n</head>`);
    }

    // 3. Replace Canonical
    if (html.includes('<link rel="canonical"')) {
        html = html.replace(/<link rel="canonical" href="[^"]*"/i, `<link rel="canonical" href="${canonicalUrl}"`);
    } else {
        html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
    }

    // 4. Update OpenGraph and Twitter tags
    html = html.replace(/<meta property="og:title" content="[^"]*"/i, `<meta property="og:title" content="${fullTitle}"`);
    html = html.replace(/<meta property="og:description" content="[^"]*"/i, `<meta property="og:description" content="${cleanDesc}"`);
    html = html.replace(/<meta property="og:url" content="[^"]*"/i, `<meta property="og:url" content="${canonicalUrl}"`);
    html = html.replace(/<meta property="og:type" content="[^"]*"/i, `<meta property="og:type" content="${ogType}"`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*"/i, `<meta name="twitter:title" content="${fullTitle}"`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*"/i, `<meta name="twitter:description" content="${cleanDesc}"`);

    // 5. Inject Semantic Body into <div id="root">
    const prerenderMarkup = `
  <div id="root">
    <div style="max-width:880px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.7;color:#222;">
      <nav style="margin-bottom:24px;font-size:0.9rem;">
        <a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a> &rsaquo; 
        <a href="/writings" style="color:#0070f3;text-decoration:none;">படைப்புகள் / Writings</a>
      </nav>
      ${contentHtml}
    </div>
  </div>`;

    html = html.replace(/<div id="root"><\/div>/i, prerenderMarkup);

    // 6. Write to destination file
    try {
        const decodedRoute = decodeURIComponent(route).replace(/^\/+/, '');
        let targetPath;
        if (!decodedRoute || decodedRoute === '') {
            targetPath = path.join(DIST_DIR, 'index.html');
        } else {
            let cleanPath = decodedRoute;
            if (process.platform === 'win32') {
                cleanPath = cleanPath.replace(/[:*?"<>|]/g, '-');
            }
            const dir = path.join(DIST_DIR, cleanPath);
            fs.mkdirSync(dir, { recursive: true });
            targetPath = path.join(dir, 'index.html');
        }

        fs.writeFileSync(targetPath, html, 'utf8');
    } catch (err) {
        console.warn(`Could not save page for ${route}:`, err.message);
    }
}

async function fetchCollection(name) {
    try {
        const res = await fetch(`${dbUrl}/${name}.json`);
        if (!res.ok) return {};
        const data = await res.json();
        return data || {};
    } catch (e) {
        console.warn(`Could not fetch ${name} from Firebase:`, e.message);
        return {};
    }
}

async function prerenderAll() {
    console.log('Starting lightweight SSG prerendering...');

    const indexPath = path.join(DIST_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) {
        console.error('dist/index.html not found! Run vite build first.');
        process.exit(1);
    }

    const indexTemplate = fs.readFileSync(indexPath, 'utf8');

    // 1. Fetch live data from Firebase RTDB
    let [poems, quotes, stories, diary, articles, blog, arts] = await Promise.all([
        fetchCollection('poems'),
        fetchCollection('quotes'),
        fetchCollection('stories'),
        fetchCollection('diary'),
        fetchCollection('articles'),
        fetchCollection('blog'),
        fetchCollection('arts')
    ]);

    // Merge static local articles
    try {
        const staticArticlesPath = path.resolve(__dirname, '../src/தரவு/கட்டுரைகள்.json');
        if (fs.existsSync(staticArticlesPath)) {
            const staticArticles = JSON.parse(fs.readFileSync(staticArticlesPath, 'utf8'));
            articles = { ...staticArticles, ...articles };
        }
    } catch (e) {
        console.warn('Could not read static articles in prerender:', e.message);
    }

    let count = 0;

    // --- Static Hub Pages ---
    // About
    savePage(indexTemplate, {
        route: '/about',
        title: 'பற்றி | About — Elvan Parthasarathy',
        description: 'About Elvan Parthasarathy (Jaiprakash P), pre-final year engineering student, writer, and creator behind Elvan Navil digital creation studio.',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">பற்றி • About</h1>
            <p style="font-size:1.1rem;color:#555;">Elvan Parthasarathy (Jaiprakash P)</p>
          </header>
          <article style="margin-top:24px;">
            <p>Welcome to Elvan Navil — an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature.</p>
            <p>Elvan Parthasarathy is a developer, poet, and digital creator from Tamil Nadu, India. The studio blends literary art in Tamil and English with native desktop engineering, such as the Nammil companion application.</p>
            <h2>படைப்புகள் • Works & Portfolio</h2>
            <ul>
              <li><strong>கவிதைகள் (Poems):</strong> Original poetry examining nature, philosophy, identity, and personal observations.</li>
              <li><strong>நவில் மொழிகள் (Quotes):</strong> Philosophical reflections and aphorisms.</li>
              <li><strong>சிறுகதைகள் (Stories):</strong> Original fiction and serialized narrative adventures.</li>
              <li><strong>நம்மில் (Nammil):</strong> Native desktop application for WhatsApp power users.</li>
            </ul>
          </article>
        `,
        ogType: 'profile'
    });
    count++;

    // Privacy Policy
    const privacyContentHtml = `
      <header>
        <h1 style="font-size:2.2rem;margin-bottom:8px;">தனியுரிமைக் கொள்கை • Privacy Policy</h1>
        <p style="font-size:1rem;color:#666;">Last Updated: September 16, 2026</p>
      </header>
      <article style="margin-top:24px;line-height:1.8;">
        <h2>1. அறிமுகம் • Introduction</h2>
        <p>Welcome to <strong>Elvan Navil</strong> (https://elvannavil.vercel.app), an independent bilingual digital creation studio created and maintained by <strong>Elvan Parthasarathy (Jaiprakash P)</strong>. This Privacy Policy details how information is collected, recorded, and handled.</p>
        
        <h2>2. விளம்பரங்கள் & கூகுள் ஆட்சென்ஸ் • Advertising & Google AdSense Compliance</h2>
        <p>Google is one of the third-party vendors on our website. It uses cookies, known as advertising cookies, to serve ads to our site visitors based upon their visit to <strong>elvannavil.vercel.app</strong> and other sites on the internet:</p>
        <ul>
          <li><strong>Third-party vendor cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</li>
          <li><strong>Personalized Advertising:</strong> Google's use of advertising cookies enables it and its partners to serve ads to users based on their visits to our sites and/or other sites on the Internet.</li>
          <li><strong>Opting Out:</strong> Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">Google Ads Settings</a> or <a href="http://www.aboutads.info/choices/" target="_blank" rel="noreferrer">www.aboutads.info</a>.</li>
        </ul>
        <p>Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons in their advertisements and links. They automatically receive your IP address when this occurs to measure campaign effectiveness and personalize content.</p>

        <h2>3. பதிவு கோப்புகள் & பகுப்பாய்வு • Log Files & Analytics</h2>
        <p>Elvan Navil follows a standard procedure of using log files. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, and referring/exit pages. These are not linked to any information that is personally identifiable.</p>

        <h2>4. உள்ளமைவுச் சேமிப்பு • Cookies & Local Storage</h2>
        <p>We use browser local storage to preserve user interface preferences such as Light/Dark theme mode, transliteration typing engine preferences, and font readability adjustments.</p>

        <h2>5. நம்மில் கணினிச் செயலி • Nammil Desktop Application Privacy</h2>
        <p>Nammil is a client-side desktop companion for WhatsApp. It operates under a strict privacy-first principle: all data, sessions, and media are stored strictly locally on your own computer. We do not operate intermediary servers that intercept, read, or monetize your WhatsApp communications.</p>

        <h2>6. சிறுவர் தனியுரிமை • Children's Information</h2>
        <p>We do not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe your child provided this information on our website, please contact us immediately.</p>

        <h2>7. சம்மதம் & தொடர்பு • Consent & Contact Details</h2>
        <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
        <p><strong>Creator:</strong> Elvan Parthasarathy (Jaiprakash P)<br>
        <strong>Email:</strong> <a href="mailto:jaiprakashpartha@gmail.com">jaiprakashpartha@gmail.com</a><br>
        <strong>Website:</strong> <a href="https://elvannavil.vercel.app">https://elvannavil.vercel.app</a></p>
      </article>
    `;

    savePage(indexTemplate, {
        route: '/privacy',
        title: 'தனியுரிமைக் கொள்கை | Privacy Policy — Elvan Navil',
        description: 'Privacy Policy for Elvan Navil. Information on third-party advertising cookies, Google AdSense compliance, and user data protection.',
        contentHtml: privacyContentHtml
    });
    count++;

    savePage(indexTemplate, {
        route: '/privacy-policy',
        title: 'தனியுரிமைக் கொள்கை | Privacy Policy — Elvan Navil',
        description: 'Privacy Policy for Elvan Navil. Information on third-party advertising cookies, Google AdSense compliance, and user data protection.',
        contentHtml: privacyContentHtml
    });
    count++;
    savePage(indexTemplate, {
        route: '/writings',
        title: 'படைப்புகள் | Writings & Literature',
        description: 'Bilingual literary catalog of original Tamil poems, quotes, short stories, essays, and articles by Elvan Parthasarathy.',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">படைப்புகள் • Writings & Literature</h1>
            <p style="font-size:1.05rem;color:#555;">Original Tamil & English literature, poems, reflections, and fiction.</p>
          </header>
          <div style="display:grid;grid-gap:20px;margin-top:28px;">
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/writings/poems" style="color:#0070f3;text-decoration:none;">கவிதைகள் • Poems (${Object.keys(poems).length})</a></h2>
              <p>Original poetry exploring love, existence, nature, and philosophy.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/writings/quotes" style="color:#0070f3;text-decoration:none;">நவில் மொழிகள் • Quotes (${Object.keys(quotes).length})</a></h2>
              <p>Short reflections, philosophical thoughts, and aphorisms.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/writings/stories" style="color:#0070f3;text-decoration:none;">சிறுகதைகள் • Short Stories (${Object.keys(stories).length})</a></h2>
              <p>Fictional narratives and serialized adventure series.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/writings/articles" style="color:#0070f3;text-decoration:none;">கட்டுரைகள் • Articles (${Object.keys(articles).length})</a></h2>
              <p>In-depth essays on Tamil history, linguistics, typography, and software engineering.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/writings/diary" style="color:#0070f3;text-decoration:none;">நாட்குறிப்பு • Diary (${Object.keys(diary).length})</a></h2>
              <p>Personal memoirs, creative chronicles, and life experiences.</p>
            </section>
          </div>
        `
    });
    count++;

    // --- Poems Listing ---
    const poemListHtml = Object.entries(poems).map(([slug, p]) => {
        const title = p.title || (p.variants && p.variants[0]?.title) || 'Untitled';
        const rawSnippet = p.variants && p.variants[0]?.text ? cleanText(p.variants[0].text) : (p.text || '');
        const snippet = truncate(rawSnippet, 120);
        return `
          <article style="padding:16px 0;border-bottom:1px solid #f0f0f0;">
            <h3 style="margin:0 0 6px;"><a href="/writings/poems/${encodeURIComponent(slug)}" style="color:#0070f3;text-decoration:none;">${escapeHtml(title)}</a></h3>
            <p style="margin:0;color:#666;font-size:0.95rem;">${escapeHtml(snippet)}</p>
            ${p.classification ? `<span style="display:inline-block;margin-top:6px;font-size:0.8rem;color:#888;background:#f5f5f5;padding:2px 8px;border-radius:4px;">${escapeHtml(p.classification)}</span>` : ''}
          </article>
        `;
    }).join('');

    savePage(indexTemplate, {
        route: '/writings/poems',
        title: 'கவிதைகள் | Poems — Elvan Navil',
        description: `Collection of original Tamil and English poems by Elvan Parthasarathy. ${Object.keys(poems).length} poems published.`,
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">கவிதைகள் • Poems</h1>
            <p style="font-size:1.05rem;color:#555;">Original Tamil & English poetic verses.</p>
          </header>
          <div style="margin-top:24px;">
            ${poemListHtml}
          </div>
        `
    });
    count++;

    // Individual Poem Pages
    for (const [slug, p] of Object.entries(poems)) {
        const title = p.title || (p.variants && p.variants[0]?.title) || 'Poem';
        const variantsHtml = (p.variants || []).map(v => `
          <div style="margin-top:20px;padding:20px;background:#fbfbfb;border-radius:12px;border:1px solid #f0f0f0;">
            ${v.title ? `<h3 style="margin-top:0;">${escapeHtml(v.title)}</h3>` : ''}
            <div style="font-size:1.1rem;line-height:2;white-space:pre-wrap;">${v.text || ''}</div>
            ${v.author ? `<p style="margin-top:16px;font-size:0.9rem;color:#777;">— ${escapeHtml(v.author)}</p>` : ''}
          </div>
        `).join('');

        const desc = p.variants && p.variants[0]?.text 
            ? truncate(p.variants[0].text, 160) 
            : `${title} - original poem by Elvan Parthasarathy.`;

        savePage(indexTemplate, {
            route: `/writings/poems/${slug}`,
            title: `${title} | Poems`,
            description: desc,
            contentHtml: `
              <article>
                <h1 style="font-size:2.2rem;margin-bottom:8px;">${escapeHtml(title)}</h1>
                <div style="color:#666;font-size:0.9rem;margin-bottom:20px;">
                  ${p.classification ? `<span>வகைப்பாடு: ${escapeHtml(p.classification)}</span> • ` : ''}
                  ${p.date ? `<span>${escapeHtml(p.date)}</span>` : ''}
                </div>
                ${variantsHtml || `<div style="font-size:1.1rem;line-height:2;">${p.text || ''}</div>`}
              </article>
            `
        });
        count++;
    }

    // --- Quotes Listing ---
    const quoteListHtml = Object.entries(quotes).map(([slug, q]) => {
        const rawText = q.variants && q.variants[0]?.text ? cleanText(q.variants[0].text) : (q.text || '');
        const title = q.title || truncate(rawText, 50);
        return `
          <article style="padding:16px 0;border-bottom:1px solid #f0f0f0;">
            <h3 style="margin:0 0 6px;"><a href="/writings/quotes/${encodeURIComponent(slug)}" style="color:#0070f3;text-decoration:none;">${escapeHtml(title)}</a></h3>
            <blockquote style="margin:0;color:#555;font-style:italic;">&ldquo;${escapeHtml(cleanText(rawText))}&rdquo;</blockquote>
          </article>
        `;
    }).join('');

    savePage(indexTemplate, {
        route: '/writings/quotes',
        title: 'நவில் மொழிகள் | Quotes — Elvan Navil',
        description: `Curated philosophical quotes, aphorisms, and insights in Tamil and English by Elvan Parthasarathy.`,
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">நவில் மொழிகள் • Quotes</h1>
            <p style="font-size:1.05rem;color:#555;">Philosophical reflections and reflections.</p>
          </header>
          <div style="margin-top:24px;">
            ${quoteListHtml}
          </div>
        `
    });
    count++;

    // Individual Quote Pages
    for (const [slug, q] of Object.entries(quotes)) {
        const rawText = q.variants && q.variants[0]?.text ? cleanText(q.variants[0].text) : (q.text || '');
        const title = q.title || truncate(rawText, 60);

        savePage(indexTemplate, {
            route: `/writings/quotes/${slug}`,
            title: `${title} | Quotes`,
            description: rawText,
            contentHtml: `
              <article>
                <h1 style="font-size:1.8rem;margin-bottom:16px;">${escapeHtml(title)}</h1>
                <blockquote style="font-size:1.3rem;line-height:1.8;padding:24px;background:#f9f9f9;border-left:4px solid #0070f3;border-radius:4px;margin:24px 0;">
                  ${q.variants && q.variants[0]?.text ? q.variants[0].text : escapeHtml(rawText)}
                </blockquote>
                ${q.classification ? `<p style="font-size:0.9rem;color:#777;">வகைப்பாடு / Classification: <strong>${escapeHtml(q.classification)}</strong></p>` : ''}
              </article>
            `
        });
        count++;
    }

    // --- Stories Listing ---
    const storyListHtml = Object.entries(stories).map(([slug, s]) => {
        const title = s.title || 'Untitled Story';
        const rawSnippet = s.variants && s.variants[0]?.text ? cleanText(s.variants[0].text) : '';
        return `
          <article style="padding:16px 0;border-bottom:1px solid #f0f0f0;">
            <h3 style="margin:0 0 6px;"><a href="/writings/stories/${encodeURIComponent(slug)}" style="color:#0070f3;text-decoration:none;">${escapeHtml(title)}</a></h3>
            ${s.series_name ? `<p style="margin:0 0 4px;font-size:0.85rem;color:#888;">Series: ${escapeHtml(s.series_name)} ${s.series_part ? `(Part ${escapeHtml(s.series_part)})` : ''}</p>` : ''}
            <p style="margin:0;color:#666;font-size:0.95rem;">${escapeHtml(truncate(rawSnippet, 140))}</p>
          </article>
        `;
    }).join('');

    savePage(indexTemplate, {
        route: '/writings/stories',
        title: 'சிறுகதைகள் | Short Stories — Elvan Navil',
        description: `Original fiction and narrative adventure series by Elvan Parthasarathy.`,
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">சிறுகதைகள் • Short Stories</h1>
            <p style="font-size:1.05rem;color:#555;">Original narratives, fiction and serialized adventures.</p>
          </header>
          <div style="margin-top:24px;">
            ${storyListHtml}
          </div>
        `
    });
    count++;

    // Individual Story Pages
    for (const [slug, s] of Object.entries(stories)) {
        const title = s.title || 'Story';
        const storyBody = s.variants && s.variants[0]?.text ? s.variants[0].text : '';

        savePage(indexTemplate, {
            route: `/writings/stories/${slug}`,
            title: `${title} | Stories`,
            description: truncate(storyBody, 160),
            contentHtml: `
              <article>
                <h1 style="font-size:2.2rem;margin-bottom:8px;">${escapeHtml(title)}</h1>
                ${s.series_name ? `<p style="color:#0070f3;font-weight:600;margin-bottom:16px;">Series: ${escapeHtml(s.series_name)}</p>` : ''}
                <div style="font-size:1.1rem;line-height:1.9;margin-top:24px;">
                  ${storyBody}
                </div>
              </article>
            `
        });
        count++;
    }

    // --- Diary Listing & Individual Pages ---
    for (const [slug, d] of Object.entries(diary)) {
        const title = d.title || 'Diary Entry';
        const body = d.variants && d.variants[0]?.text ? d.variants[0].text : (d.text || '');

        savePage(indexTemplate, {
            route: `/writings/diary/${slug}`,
            title: `${title} | Diary`,
            description: truncate(body, 160),
            contentHtml: `
              <article>
                <h1 style="font-size:2.2rem;margin-bottom:8px;">${escapeHtml(title)}</h1>
                <div style="font-size:1.1rem;line-height:1.9;margin-top:24px;">
                  ${body}
                </div>
              </article>
            `
        });
        count++;
    }

    // --- Articles Listing ---
    const articleListHtml = Object.entries(articles).map(([slug, a]) => {
        const title = a.title || (a.variants && a.variants[0]?.title) || 'Untitled Article';
        const rawSnippet = a.variants && a.variants[0]?.text ? cleanText(a.variants[0].text) : '';
        return `
          <article style="padding:18px 0;border-bottom:1px solid #f0f0f0;">
            <h3 style="margin:0 0 6px;"><a href="/writings/articles/${encodeURIComponent(slug)}" style="color:#0070f3;text-decoration:none;">${escapeHtml(title)}</a></h3>
            <div style="font-size:0.85rem;color:#888;margin-bottom:6px;">
              ${a.classification ? `<span>${escapeHtml(a.classification)}</span> • ` : ''}
              ${a.date ? `<span>${escapeHtml(a.date)}</span>` : ''}
            </div>
            <p style="margin:0;color:#666;font-size:0.95rem;">${escapeHtml(truncate(rawSnippet, 160))}</p>
          </article>
        `;
    }).join('');

    savePage(indexTemplate, {
        route: '/writings/articles',
        title: 'கட்டுரைகள் | Articles — Elvan Navil',
        description: `In-depth essays and articles on Tamil history, linguistics, typography, software architecture, and creative philosophy.`,
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">கட்டுரைகள் • Articles</h1>
            <p style="font-size:1.05rem;color:#555;">Detailed essays on literature, technology, linguistics, and philosophy.</p>
          </header>
          <div style="margin-top:24px;">
            ${articleListHtml}
          </div>
        `
    });
    count++;

    // Individual Article Pages
    for (const [slug, a] of Object.entries(articles)) {
        const title = a.title || (a.variants && a.variants[0]?.title) || 'Article';
        const articleBody = a.variants && a.variants[0]?.text ? a.variants[0].text : '';

        savePage(indexTemplate, {
            route: `/writings/articles/${slug}`,
            title: `${title} | Articles`,
            description: truncate(articleBody, 160),
            contentHtml: `
              <article>
                <h1 style="font-size:2.2rem;margin-bottom:8px;">${escapeHtml(title)}</h1>
                <div style="color:#666;font-size:0.9rem;margin-bottom:20px;">
                  ${a.classification ? `<span>வகைப்பாடு: ${escapeHtml(a.classification)}</span> • ` : ''}
                  ${a.date ? `<span>${escapeHtml(a.date)}</span>` : ''}
                </div>
                <div style="font-size:1.08rem;line-height:1.9;margin-top:24px;">
                  ${articleBody}
                </div>
              </article>
            `
        });
        count++;
    }

    // --- Arts Hub ---
    savePage(indexTemplate, {
        route: '/arts',
        title: 'கலைகள் | Arts & Gallery — Elvan Navil',
        description: `Visual art gallery featuring pencil sketches, digital arts, posters, and paintings by Elvan Parthasarathy.`,
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">கலைகள் • Arts Gallery</h1>
            <p style="font-size:1.05rem;color:#555;">Visual art collection of pencil drawings, digital arts, and graphic designs.</p>
          </header>
          <article style="margin-top:24px;">
            <p>Elvan Navil Arts Gallery presents creative visual expressions across multiple mediums:</p>
            <ul>
              <li><strong>கரிக்கோல் ஓவியங்கள் (Pencil Art):</strong> Detailed pencil sketches and portraits.</li>
              <li><strong>சுவரொட்டிகள் (Posters):</strong> Typography and thematic graphic artwork.</li>
              <li><strong>எண்மக் கலைகள் (Digital Arts):</strong> Modern vector and illustrative work.</li>
              <li><strong>ஓவியங்கள் (Paintings):</strong> Traditional and fine art works.</li>
            </ul>
          </article>
        `
    });
    count++;

    // --- Downloads Hub ---
    savePage(indexTemplate, {
        route: '/downloads',
        title: 'பதிவிறக்கங்கள் | Downloads — Elvan Navil',
        description: `Official desktop software downloads by Elvan Navil studio, including Nammil WhatsApp companion.`,
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">பதிவிறக்கங்கள் • Downloads</h1>
            <p style="font-size:1.05rem;color:#555;">Thoughtfully engineered desktop software for Windows.</p>
          </header>
          <div style="margin-top:24px;border:1px solid #eee;border-radius:16px;padding:24px;">
            <h2><a href="/downloads/nammil" style="color:#0070f3;text-decoration:none;">நம்மில் • Nammil for Windows</a></h2>
            <p>A beautifully crafted, privacy-focused desktop companion for WhatsApp featuring multi-account sessions, automated media organization, and native notifications.</p>
            <p><a href="/downloads/nammil" style="display:inline-block;background:#00a884;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Learn More &amp; Download</a></p>
          </div>
        `
    });
    count++;

    console.log(`✓ SSG Prerender complete: Generated ${count} static HTML pages with full indexable semantic content!`);
}

prerenderAll().catch(err => {
    console.error('Prerender error:', err);
    process.exit(1);
});
