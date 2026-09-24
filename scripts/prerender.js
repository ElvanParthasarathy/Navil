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

function savePage(indexTemplate, { route, title, description, contentHtml, ogType = 'article', breadcrumbHtml = null }) {
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
    const navContent = breadcrumbHtml !== null
        ? breadcrumbHtml
        : `<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a> &rsaquo; <a href="/writings" style="color:#0070f3;text-decoration:none;">படைப்புகள் / Writings</a>`;

    const prerenderMarkup = `
  <div id="root">
    <div style="max-width:880px;margin:0 auto;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.7;color:#222;">
      ${navContent ? `<nav style="margin-bottom:24px;font-size:0.9rem;">${navContent}</nav>` : ''}
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

    // --- Homepage (Root /) ---
    const featuredArticlesList = Object.entries(articles).slice(0, 3).map(([slug, a]) => {
        const title = a.title || (a.variants && a.variants[0]?.title) || 'Article';
        const rawSnippet = a.variants && a.variants[0]?.text ? cleanText(a.variants[0].text) : '';
        return `
          <div style="padding:16px;border:1px solid #eee;border-radius:12px;margin-bottom:12px;">
            <h3 style="margin:0 0 6px;font-size:1.15rem;"><a href="/writings/articles/${encodeURIComponent(slug)}" style="color:#0070f3;text-decoration:none;">${escapeHtml(title)}</a></h3>
            <p style="margin:0;color:#555;font-size:0.95rem;line-height:1.6;">${escapeHtml(truncate(rawSnippet, 160))}</p>
          </div>
        `;
    }).join('');

    savePage(indexTemplate, {
        route: '/',
        title: 'நவில் | Navil — Elvan Navil Digital Creation Studio',
        description: 'A bilingual Tamil-English digital creation studio featuring original poems, quotes, short stories, essays, articles, diary entries, art gallery, and the Nammil desktop app.',
        breadcrumbHtml: '',
        contentHtml: `
          <header style="margin-bottom:36px;text-align:center;">
            <h1 style="font-size:2.5rem;font-weight:800;margin:0 0 12px;color:#111;letter-spacing:-0.02em;">எல்வன் நவில் • Elvan Navil</h1>
            <p style="font-size:1.15rem;color:#555;max-width:700px;margin:0 auto 20px;line-height:1.6;">
              An independent bilingual Tamil-English digital creation studio crafting thoughtful desktop software, bespoke typography, and classical-modern literature.
            </p>
            <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;font-size:0.92rem;">
              <a href="/downloads/nammil" style="background:#00a884;color:#fff;padding:10px 20px;border-radius:99px;text-decoration:none;font-weight:600;">Download Nammil for Windows</a>
              <a href="/writings" style="background:#0070f3;color:#fff;padding:10px 20px;border-radius:99px;text-decoration:none;font-weight:600;">Explore Writings &amp; Essays</a>
              <a href="/tools" style="background:#f3f4f6;color:#111;padding:10px 20px;border-radius:99px;text-decoration:none;font-weight:600;">Linguistic Tools</a>
            </div>
          </header>

          <section style="margin-bottom:36px;padding:28px;border:1px solid #e5e7eb;border-radius:16px;background:#fafafa;">
            <h2 style="font-size:1.4rem;margin:0 0 8px;color:#111;">நம்மில் • Nammil: Privacy-First WhatsApp Desktop Companion</h2>
            <p style="color:#555;line-height:1.7;margin:0 0 14px;">
              Nammil is a bespoke client-side desktop companion engineered for WhatsApp power users on Windows. Built with a strict local-first architecture, it ensures all media, communications, and session stores remain strictly on your personal computer without third-party surveillance.
            </p>
            <ul style="color:#555;line-height:1.7;margin:0 0 14px;padding-left:20px;">
              <li><strong>Multi-Account Sessions:</strong> Isolate personal and professional WhatsApp workflows in separate secure containers.</li>
              <li><strong>Automated Media Sorting:</strong> Organize received photos, voice memos, and documents into chronological local folders automatically.</li>
              <li><strong>Zero Telemetry:</strong> No intermediary servers, no message caching, and zero data monetization.</li>
            </ul>
            <a href="/downloads/nammil" style="color:#0070f3;font-weight:600;text-decoration:none;">Learn more about Nammil architecture &amp; download &rarr;</a>
          </section>

          <section style="margin-bottom:36px;">
            <h2 style="font-size:1.4rem;margin:0 0 16px;color:#111;">மொழி மற்றும் இசைக் கருவிகள் • Language &amp; Creative Tools</h2>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">
              <div style="padding:18px;border:1px solid #e5e7eb;border-radius:12px;">
                <h3 style="margin:0 0 6px;font-size:1.1rem;"><a href="/tools/transliterator" style="color:#0070f3;text-decoration:none;">நவில் மொழிமாற்றி • Navil Transliterator</a></h3>
                <p style="color:#666;font-size:0.9rem;line-height:1.5;">Phonetic Latin-to-Tamil typing engine adhering to Tolkappiyam grammatical phonology. Pure Tamil script generation in real-time.</p>
              </div>
              <div style="padding:18px;border:1px solid #e5e7eb;border-radius:12px;">
                <h3 style="margin:0 0 6px;font-size:1.1rem;"><a href="/tools/arichuvadi" style="color:#0070f3;text-decoration:none;">நவில் அரிச்சுவடி • Navil Arichuvadi</a></h3>
                <p style="color:#666;font-size:0.9rem;line-height:1.5;">Convert modern Tamil script into ancient Thamizhi (Tamil Brahmi) and Vatteluttu orthographic forms.</p>
              </div>
              <div style="padding:18px;border:1px solid #e5e7eb;border-radius:12px;">
                <h3 style="margin:0 0 6px;font-size:1.1rem;"><a href="/tools/piano" style="color:#0070f3;text-decoration:none;">கின்னரப்பெட்டி • Navil Piano</a></h3>
                <p style="color:#666;font-size:0.9rem;line-height:1.5;">Interactive browser-based virtual piano synthesizer with computer keyboard polyphonic mapping.</p>
              </div>
            </div>
          </section>

          <section style="margin-bottom:36px;">
            <h2 style="font-size:1.4rem;margin:0 0 16px;color:#111;">சிறப்பு இலக்கியக் கட்டுரைகள் • Featured Articles &amp; Essays</h2>
            <div>
              ${featuredArticlesList}
            </div>
          </section>

          <section style="margin-bottom:36px;padding:24px;border:1px solid #e5e7eb;border-radius:16px;background:#fcfcfd;">
            <h2 style="font-size:1.3rem;margin:0 0 8px;color:#111;">உருவாக்கியவர் அறிமுகம் • About the Creator</h2>
            <p style="color:#555;line-height:1.7;margin:0 0 12px;">
              Elvan Navil is founded and maintained by <strong>Elvan Parthasarathy (Jaiprakash P)</strong>, an engineer, bilingual poet, and independent software developer based in Tamil Nadu, India. The studio blends literary art in Tamil and English with native desktop engineering, typography, and regional computational linguistics.
            </p>
            <p style="color:#555;font-size:0.92rem;margin:0;">
              <a href="/about" style="color:#0070f3;text-decoration:none;margin-right:16px;font-weight:600;">Read Full Biography &rarr;</a>
              <a href="/contact" style="color:#0070f3;text-decoration:none;font-weight:600;">Get in Touch &rarr;</a>
            </p>
          </section>

          <footer style="margin-top:40px;padding-top:24px;border-top:1px solid #eee;text-align:center;font-size:0.88rem;color:#777;">
            <p style="margin:0 0 8px;">© 2026 Elvan Navil (எல்வன் நவில்) • Independent Bilingual Digital Creation Studio</p>
            <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
              <a href="/about" style="color:#555;text-decoration:none;">பற்றி / About</a>
              <a href="/contact" style="color:#555;text-decoration:none;">தொடர்பு / Contact</a>
              <a href="/privacy" style="color:#555;text-decoration:none;">தனியுரிமை / Privacy Policy</a>
              <a href="/terms" style="color:#555;text-decoration:none;">விதிமுறைகள் / Terms</a>
              <a href="/disclaimer" style="color:#555;text-decoration:none;">பொறுப்புத் துறப்பு / Disclaimer</a>
            </div>
          </footer>
        `
    });
    count++;

    // --- Static Hub Pages ---
    // About
    savePage(indexTemplate, {
        route: '/about',
        title: 'பற்றி | About — Elvan Parthasarathy',
        description: 'About Elvan Parthasarathy (Jaiprakash P), pre-final year engineering student, writer, and creator behind Elvan Navil digital creation studio.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
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
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
        contentHtml: privacyContentHtml
    });
    count++;

    savePage(indexTemplate, {
        route: '/privacy-policy',
        title: 'தனியுரிமைக் கொள்கை | Privacy Policy — Elvan Navil',
        description: 'Privacy Policy for Elvan Navil. Information on third-party advertising cookies, Google AdSense compliance, and user data protection.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
        contentHtml: privacyContentHtml
    });
    // Contact
    savePage(indexTemplate, {
        route: '/contact',
        title: 'தொடர்பு | Contact Us — Elvan Navil',
        description: 'Get in touch with Elvan Parthasarathy (Jaiprakash P) at Elvan Navil. Inquiries for software engineering, desktop tools, literary licensing, or technical feedback.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">தொடர்பு கொள்ள • Contact Us</h1>
            <p style="font-size:1.05rem;color:#555;">Official communication channel for Elvan Navil studio.</p>
          </header>
          <article style="margin-top:24px;line-height:1.8;">
            <p>For technical feedback, software bug reports for Nammil or our online linguistic tools, literary licensing inquiries, or collaboration opportunities, please reach out directly:</p>
            <div style="padding:20px;background:#f9f9fb;border-radius:12px;border:1px solid #eee;margin:20px 0;">
              <p style="margin:0 0 8px;"><strong>Creator:</strong> Elvan Parthasarathy (Jaiprakash P)</p>
              <p style="margin:0 0 8px;"><strong>Official Email:</strong> <a href="mailto:jaiprakashpartha@gmail.com" style="color:#0070f3;">jaiprakashpartha@gmail.com</a></p>
              <p style="margin:0 0 8px;"><strong>Location:</strong> Tamil Nadu, India (IST / UTC+05:30)</p>
              <p style="margin:0 0 8px;"><strong>Response Time:</strong> Within 24–48 Business Hours</p>
              <p style="margin:0;"><strong>GitHub:</strong> <a href="https://github.com/ElvanParthasarathy" target="_blank" rel="noopener noreferrer" style="color:#0070f3;">github.com/ElvanParthasarathy</a></p>
            </div>
            <h2>பயன்பாட்டு வினவல்கள் • Types of Inquiries</h2>
            <ul>
              <li><strong>Nammil Desktop Companion:</strong> Bug reports, feature suggestions, and installation guidance for Windows.</li>
              <li><strong>Linguistic Tools:</strong> Grammar feedback on Navil Transliterator or Thamizhi orthography on Arichuvadi.</li>
              <li><strong>Bilingual Literature:</strong> Licensing inquiries for original Tamil poetry, stories, and translations.</li>
            </ul>
          </article>
        `,
        ogType: 'website'
    });
    count++;

    // Terms of Service
    const termsContentHtml = `
      <header>
        <h1 style="font-size:2rem;margin-bottom:8px;">பயன்பாட்டு விதிமுறைகள் • Terms of Service</h1>
        <p style="font-size:1rem;color:#666;">Last Updated: September 2026</p>
      </header>
      <article style="margin-top:24px;line-height:1.8;">
        <h2>1. அறிமுகமும் ஒப்புதலும் • Introduction &amp; Acceptance</h2>
        <p>By accessing or downloading software from Elvan Navil (https://elvannavil.vercel.app), you agree to these Terms of Service, our Privacy Policy, and our Disclaimer.</p>
        
        <h2>2. அறிவுசார் சொத்துரிமை • Intellectual Property Rights</h2>
        <p>All original poetry, philosophical quotes, short stories, essays, bespoke typefaces, vector graphics, and software source code published across this studio are the intellectual property of Elvan Parthasarathy.</p>
        <p>Personal and educational reading with author attribution is warmly permitted. Commercial redistribution without prior consent is strictly prohibited.</p>

        <h2>3. மென்பொருள் பயன்பாடு • Software License &amp; Tools</h2>
        <p>Desktop software (such as Nammil) and web utilities (Transliterator, Arichuvadi, Piano) are provided for lawful, personal productivity. All tools operate with local-first privacy.</p>

        <h2>4. விளம்பரங்கள் மற்றும் மூன்றாம் தரப்புச் சேவைகள் • Advertising &amp; Third-Party Services</h2>
        <p>We partner with Google AdSense to serve relevant advertisements. Third-party ad vendors use cookies to serve ads based on prior visits. See our Privacy Policy for opt-out details.</p>

        <h2>5. உத்தரவாத மறுப்பு • Disclaimer of Warranties</h2>
        <p>All content and software are provided on an "as is" and "as available" basis without express or implied warranties.</p>

        <h2>6. சட்ட வரம்பு • Governing Law</h2>
        <p>These terms are governed by the laws of India, under the jurisdiction of Tamil Nadu.</p>
        <p><strong>Contact:</strong> <a href="mailto:jaiprakashpartha@gmail.com">jaiprakashpartha@gmail.com</a></p>
      </article>
    `;

    savePage(indexTemplate, {
        route: '/terms',
        title: 'விதிமுறைகள் | Terms of Service — Elvan Navil',
        description: 'Terms of Service and legal guidelines for Elvan Navil studio, Nammil desktop companion, and online Tamil linguistic tools.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
        contentHtml: termsContentHtml
    });
    count++;

    savePage(indexTemplate, {
        route: '/terms-and-conditions',
        title: 'விதிமுறைகள் | Terms of Service — Elvan Navil',
        description: 'Terms of Service and legal guidelines for Elvan Navil studio, Nammil desktop companion, and online Tamil linguistic tools.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
        contentHtml: termsContentHtml
    });
    count++;

    // Disclaimer
    savePage(indexTemplate, {
        route: '/disclaimer',
        title: 'பொறுப்புத் துறப்பு | Disclaimer — Elvan Navil',
        description: 'Legal disclaimer, trademark notices, and Google AdSense advertising disclosure for Elvan Navil.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">பொறுப்புத் துறப்பு • Disclaimer</h1>
            <p style="font-size:1rem;color:#666;">Transparency, trademark notices, and content disclosures</p>
          </header>
          <article style="margin-top:24px;line-height:1.8;">
            <h2>1. பொதுவான தகவல் மறுப்புரை • General Information</h2>
            <p>All literary, cultural, educational, and computational materials on Elvan Navil are published in good faith for cultural and creative purposes.</p>

            <h2>2. மூன்றாம் தரப்பு வர்த்தக முத்திரைகள் • Trademark Notice</h2>
            <p>WhatsApp is a registered trademark of Meta Platforms, Inc. The Nammil desktop companion is an independent client software and is not affiliated with, sponsored by, or endorsed by Meta Platforms, Inc. or WhatsApp.</p>

            <h2>3. விளம்பர வெளிப்படைத்தன்மை • Advertising Disclosure</h2>
            <p>This website displays contextual advertisements provided by Google AdSense to support server hosting and continued free software development.</p>

            <h2>4. மொழிக் கருவிகள் • Linguistic Tools</h2>
            <p>Linguistic utilities are designed based on Tolkappiyam phonetic principles. Machine transliterations should be manually reviewed for formal or legal documentation.</p>
          </article>
        `
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
    savePage(indexTemplate, {
        route: '/navilgal/writings',
        title: 'படைப்புகள் | Writings & Literature — Elvan Navil',
        description: 'Bilingual literary catalog of original Tamil poems, quotes, short stories, essays, and articles by Elvan Parthasarathy.',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">படைப்புகள் • Writings & Literature</h1>
            <p style="font-size:1.05rem;color:#555;">Original Tamil & English literature, poems, reflections, and fiction.</p>
          </header>
          <div style="display:grid;grid-gap:20px;margin-top:28px;">
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/navilgal/writings/poems" style="color:#0070f3;text-decoration:none;">கவிதைகள் • Poems (${Object.keys(poems).length})</a></h2>
              <p>Original poetry exploring love, existence, nature, and philosophy.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/navilgal/writings/quotes" style="color:#0070f3;text-decoration:none;">நவில் மொழிகள் • Quotes (${Object.keys(quotes).length})</a></h2>
              <p>Short reflections, philosophical thoughts, and aphorisms.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/navilgal/writings/stories" style="color:#0070f3;text-decoration:none;">சிறுகதைகள் • Short Stories (${Object.keys(stories).length})</a></h2>
              <p>Fictional narratives and serialized adventure series.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/navilgal/writings/articles" style="color:#0070f3;text-decoration:none;">கட்டுரைகள் • Articles (${Object.keys(articles).length})</a></h2>
              <p>In-depth essays on Tamil history, linguistics, typography, and software engineering.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/navilgal/writings/diary" style="color:#0070f3;text-decoration:none;">நாட்குறிப்பு • Diary (${Object.keys(diary).length})</a></h2>
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

    const poemListingContentHtml = `
      <header>
        <h1 style="font-size:2rem;margin-bottom:8px;">கவிதைகள் • Poems</h1>
        <p style="font-size:1.05rem;color:#555;">Original Tamil & English poetic verses.</p>
      </header>
      <div style="margin-top:24px;">
        ${poemListHtml}
      </div>
    `;

    savePage(indexTemplate, {
        route: '/writings/poems',
        title: 'கவிதைகள் | Poems — Elvan Navil',
        description: `Collection of original Tamil and English poems by Elvan Parthasarathy. ${Object.keys(poems).length} poems published.`,
        contentHtml: poemListingContentHtml
    });
    count++;

    savePage(indexTemplate, {
        route: '/navilgal/writings/poems',
        title: 'கவிதைகள் | Poems — Elvan Navil',
        description: `Collection of original Tamil and English poems by Elvan Parthasarathy. ${Object.keys(poems).length} poems published.`,
        contentHtml: poemListingContentHtml
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
                  ${p.classification ? `<span>வகைப்பாடு: <strong>${escapeHtml(p.classification)}</strong></span> • ` : ''}
                  ${p.date ? `<span>${escapeHtml(p.date)}</span> • ` : ''}
                  <span>கவிதை • Original Poem by Elvan Parthasarathy</span>
                </div>
                ${variantsHtml || `<div style="font-size:1.1rem;line-height:2;">${p.text || ''}</div>`}

                <section style="margin-top:36px;padding:20px;background:#f9f9fb;border-radius:12px;border:1px solid #eee;font-size:0.95rem;line-height:1.7;color:#444;">
                  <h3 style="margin-top:0;font-size:1.1rem;color:#222;">இலக்கியப் பார்வை • Literary Context</h3>
                  <p>This poetic work explores philosophical, natural, and contemplative themes rooted in classical and contemporary Tamil literary traditions. Written and curated by Elvan Parthasarathy as part of the Elvan Navil bilingual collection.</p>
                  <p style="margin-bottom:0;">
                    <a href="/writings/poems" style="color:#0070f3;text-decoration:none;font-weight:600;">&larr; Return to all Poems</a> • 
                    <a href="/writings" style="color:#0070f3;text-decoration:none;font-weight:600;">Explore All Writings</a>
                  </p>
                </section>
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

    const quotesListingContentHtml = `
      <header>
        <h1 style="font-size:2rem;margin-bottom:8px;">நவில் மொழிகள் • Quotes</h1>
        <p style="font-size:1.05rem;color:#555;">Philosophical reflections and reflections.</p>
      </header>
      <div style="margin-top:24px;">
        ${quoteListHtml}
      </div>
    `;

    savePage(indexTemplate, {
        route: '/writings/quotes',
        title: 'நவில் மொழிகள் | Quotes — Elvan Navil',
        description: `Curated philosophical quotes, aphorisms, and insights in Tamil and English by Elvan Parthasarathy.`,
        contentHtml: quotesListingContentHtml
    });
    count++;

    savePage(indexTemplate, {
        route: '/navilgal/writings/quotes',
        title: 'நவில் மொழிகள் | Quotes — Elvan Navil',
        description: `Curated philosophical quotes, aphorisms, and insights in Tamil and English by Elvan Parthasarathy.`,
        contentHtml: quotesListingContentHtml
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
                <div style="color:#666;font-size:0.9rem;margin-bottom:20px;">
                  ${q.classification ? `<p style="margin:0 0 6px;">வகைப்பாடு / Classification: <strong>${escapeHtml(q.classification)}</strong></p>` : ''}
                  <p style="margin:0;">எழுத்தாளர் / Author: <strong>Elvan Parthasarathy (Jaiprakash P)</strong></p>
                </div>
                <section style="margin-top:32px;padding:20px;background:#fafafa;border-radius:12px;border:1px solid #eee;font-size:0.95rem;line-height:1.7;color:#444;">
                  <h3 style="margin-top:0;font-size:1.05rem;color:#222;">சிந்தனை உரை • Reflection Notes</h3>
                  <p>Part of the <em>நவில் மொழிகள் (Navil Quotes)</em> collection. These bilingual aphorisms capture philosophical reflections on life, language, personal identity, and the continuous search for curiosity and truth.</p>
                  <p style="margin-bottom:0;">
                    <a href="/writings/quotes" style="color:#0070f3;text-decoration:none;font-weight:600;">&larr; Browse All Quotes</a> • 
                    <a href="/writings" style="color:#0070f3;text-decoration:none;font-weight:600;">Explore All Writings</a>
                  </p>
                </section>
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

    const storiesListingContentHtml = `
      <header>
        <h1 style="font-size:2rem;margin-bottom:8px;">சிறுகதைகள் • Short Stories</h1>
        <p style="font-size:1.05rem;color:#555;">Original narratives, fiction and serialized adventures.</p>
      </header>
      <div style="margin-top:24px;">
        ${storyListHtml}
      </div>
    `;

    savePage(indexTemplate, {
        route: '/writings/stories',
        title: 'சிறுகதைகள் | Short Stories — Elvan Navil',
        description: `Original fiction and narrative adventure series by Elvan Parthasarathy.`,
        contentHtml: storiesListingContentHtml
    });
    count++;

    savePage(indexTemplate, {
        route: '/navilgal/writings/stories',
        title: 'சிறுகதைகள் | Short Stories — Elvan Navil',
        description: `Original fiction and narrative adventure series by Elvan Parthasarathy.`,
        contentHtml: storiesListingContentHtml
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

    const articlesListingContentHtml = `
      <header>
        <h1 style="font-size:2rem;margin-bottom:8px;">கட்டுரைகள் • Articles</h1>
        <p style="font-size:1.05rem;color:#555;">Detailed essays on literature, technology, linguistics, and philosophy.</p>
      </header>
      <div style="margin-top:24px;">
        ${articleListHtml}
      </div>
    `;

    savePage(indexTemplate, {
        route: '/writings/articles',
        title: 'கட்டுரைகள் | Articles — Elvan Navil',
        description: `In-depth essays and articles on Tamil history, linguistics, typography, software architecture, and creative philosophy.`,
        contentHtml: articlesListingContentHtml
    });
    count++;

    savePage(indexTemplate, {
        route: '/navilgal/writings/articles',
        title: 'கட்டுரைகள் | Articles — Elvan Navil',
        description: `In-depth essays and articles on Tamil history, linguistics, typography, software architecture, and creative philosophy.`,
        contentHtml: articlesListingContentHtml
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
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
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
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
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

    // --- Tools Hub ---
    savePage(indexTemplate, {
        route: '/tools',
        title: 'கருவிகள் | Tools — Elvan Navil',
        description: 'Bilingual productivity, language, and music tools including Tamil transliterator, ancient Tamil script converter, virtual piano synthesizer, and vocoder.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">கருவிகள் • Tools</h1>
            <p style="font-size:1.05rem;color:#555;">இசை, மொழி &amp; பயன்பாடுகள் • Music, Language &amp; Productivity</p>
          </header>
          <div style="display:grid;grid-gap:20px;margin-top:28px;">
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/tools/transliterator" style="color:#0070f3;text-decoration:none;">நவில் மொழிமாற்றி • Navil Transliterator</a></h2>
              <p>தொல்காப்பிய இலக்கண ஒலிபெயர்ப்பு முறைமை. Phonetic Latin-to-Tamil typing engine.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/tools/arichuvadi" style="color:#0070f3;text-decoration:none;">நவில் அரிச்சுவடி • Navil Arichuvadi</a></h2>
              <p>பண்டைய தமிழ் எழுத்து வடிவமாற்றி. Convert modern Tamil into ancient Thamizhi and Vatteluttu.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/tools/piano" style="color:#0070f3;text-decoration:none;">கின்னரப்பெட்டி • Navil Piano</a></h2>
              <p>மெய்நிகர் கின்னரப்பெட்டி மற்றும் இசையமைப்புக் கருவி. Virtual piano synthesizer with keyboard mapping.</p>
            </section>
            <section style="padding:16px;border:1px solid #eee;border-radius:12px;">
              <h2><a href="/tools/vocoder" style="color:#0070f3;text-decoration:none;">குரல்மாற்றி • Navil Vocoder</a></h2>
              <p>ஒலி அதிர்வெண் மாற்றமைப்பு மற்றும் குரல் திருத்தக் கருவி. Audio manipulation and voice filter.</p>
            </section>
          </div>
        `
    });
    count++;

    // --- Transliterator Tool ---
    savePage(indexTemplate, {
        route: '/tools/transliterator',
        title: 'நவில் மொழிமாற்றி | Navil Tamil Transliterator — Elvan Navil',
        description: 'Phonetic English-to-Tamil typing engine and transliterator based on Tolkappiyam grammar rules. Type in English to get pure Tamil script.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a> &rsaquo; <a href="/tools" style="color:#0070f3;text-decoration:none;">கருவிகள் / Tools</a>',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">நவில் மொழிமாற்றி • Navil Tamil Transliterator</h1>
            <p style="font-size:1.05rem;color:#555;">Phonetic Latin-to-Tamil typing engine and transliteration system based on Tolkappiyam grammatical phonology.</p>
          </header>
          <article style="margin-top:24px;line-height:1.8;">
            <p>Welcome to <strong>நவில் மொழிமாற்றி (Navil Transliterator)</strong>, a high-performance, browser-based transliteration engine that turns phonetic Latin script into pure Tamil Unicode text and vice-versa.</p>
            <h2>முக்கிய அம்சங்கள் • Key Capabilities</h2>
            <ul>
              <li><strong>தொல்காப்பிய முறைமை (Navil Engine):</strong> Granular phonetic accuracy adhering to classical Tamil vowel-consonant combinations.</li>
              <li><strong>அஞ்சல் முறைமை (Anjal Layout):</strong> Industry-standard Tamil phonetic keyboard layout support.</li>
              <li><strong>இருவழி மொழிமாற்றம் (Bidirectional):</strong> Convert English phonetic text to Tamil and Tamil script back to readable romanized Latin.</li>
              <li><strong>உடனடி நகல் (One-Click Copy &amp; Clear):</strong> Fast, responsive interface designed for both mobile touchscreens and desktop keyboards.</li>
            </ul>
            <h2>பயன்பாட்டு முறை • How to Use</h2>
            <p>Type your words in phonetic English (e.g., <em>vanakkam</em> &rarr; <em>வணக்கம்</em>, <em>thamizh</em> &rarr; <em>தமிழ்</em>). The tool instantly generates accurate Tamil script in real time.</p>
          </article>
        `
    });
    count++;

    // --- Arichuvadi Tool ---
    savePage(indexTemplate, {
        route: '/tools/arichuvadi',
        title: 'நவில் அரிச்சுவடி | Navil Arichuvadi — Elvan Navil',
        description: 'Convert modern Tamil into ancient Thamizhi (Tamil-Brahmi) and Vatteluttu script forms.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a> &rsaquo; <a href="/tools" style="color:#0070f3;text-decoration:none;">கருவிகள் / Tools</a>',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">நவில் அரிச்சுவடி • Navil Arichuvadi</h1>
            <p style="font-size:1.05rem;color:#555;">பண்டைய தமிழ் எழுத்து வடிவமாற்றி • Ancient Tamil Script Converter</p>
          </header>
          <article style="margin-top:24px;line-height:1.8;">
            <p>Navil Arichuvadi is a historical linguistic utility that converts modern Tamil text into ancient scripts such as <strong>தமிழி (Thamizhi / Tamil Brahmi)</strong> and <strong>வட்டெழுத்து (Vatteluttu)</strong>.</p>
          </article>
        `
    });
    count++;

    // --- Piano Tool ---
    savePage(indexTemplate, {
        route: '/tools/piano',
        title: 'கின்னரப்பெட்டி | Navil Piano — Elvan Navil',
        description: 'Interactive virtual piano synthesizer and music composition tool with computer keyboard mapping.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a> &rsaquo; <a href="/tools" style="color:#0070f3;text-decoration:none;">கருவிகள் / Tools</a>',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">கின்னரப்பெட்டி • Navil Piano</h1>
            <p style="font-size:1.05rem;color:#555;">மெய்நிகர் கின்னரப்பெட்டி • Virtual Piano Synthesizer</p>
          </header>
          <article style="margin-top:24px;line-height:1.8;">
            <p>An interactive virtual piano synthesizer mapped for desktop keyboard input, featuring acoustic soundfonts and polyphonic synthesis.</p>
          </article>
        `
    });
    count++;

    // --- Vocoder Tool ---
    savePage(indexTemplate, {
        route: '/tools/vocoder',
        title: 'குரல்மாற்றி | Navil Vocoder — Elvan Navil',
        description: 'Interactive voice modulator and audio filter tool.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a> &rsaquo; <a href="/tools" style="color:#0070f3;text-decoration:none;">கருவிகள் / Tools</a>',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">குரல்மாற்றி • Navil Vocoder</h1>
            <p style="font-size:1.05rem;color:#555;">குரல் திருத்தக் கருவி • Voice Modulator &amp; Audio Processing</p>
          </header>
          <article style="margin-top:24px;line-height:1.8;">
            <p>Interactive browser-based audio synthesizer and vocoder for modulating vocal frequencies and sound waves.</p>
          </article>
        `
    });
    count++;

    // --- Navilgal Hub ---
    savePage(indexTemplate, {
        route: '/navilgal',
        title: 'நவில்கள் | Navilgal Literary Hub — Elvan Navil',
        description: 'Literary archive of bilingual poetry, philosophy, quotes, short stories, and essays.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">நவில்கள் • Navilgal</h1>
            <p style="font-size:1.05rem;color:#555;">Bilingual literary archive of poems, quotes, and fiction.</p>
          </header>
          <article style="margin-top:24px;line-height:1.8;">
            <p>Welcome to the Navilgal literary portal, home to original Tamil and English literature by Elvan Parthasarathy.</p>
            <p><a href="/writings" style="color:#0070f3;font-weight:600;">Browse All Writings &rarr;</a></p>
          </article>
        `
    });
    count++;

    // --- Portfolio ---
    savePage(indexTemplate, {
        route: '/portfolio',
        title: 'தொகுப்பு | Portfolio — Elvan Navil',
        description: 'Engineering and creative portfolio of Elvan Parthasarathy.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">தொகுப்பு • Portfolio</h1>
            <p style="font-size:1.05rem;color:#555;">Creative works, software engineering projects, and research.</p>
          </header>
        `
    });
    count++;

    // --- Teaching ---
    savePage(indexTemplate, {
        route: '/teaching',
        title: 'பயிற்றுவிப்பு | Teaching — Elvan Navil',
        description: 'Interactive educational presentations and technical slides by Elvan Parthasarathy.',
        breadcrumbHtml: '<a href="/" style="color:#0070f3;text-decoration:none;">முகப்பு / Home</a>',
        contentHtml: `
          <header>
            <h1 style="font-size:2rem;margin-bottom:8px;">பயிற்றுவிப்பு • Teaching &amp; Presentations</h1>
            <p style="font-size:1.05rem;color:#555;">Interactive presentations, educational modules, and technical visual lectures.</p>
          </header>
        `
    });
    count++;

    console.log(`✓ SSG Prerender complete: Generated ${count} static HTML pages with full indexable semantic content!`);
}

prerenderAll().catch(err => {
    console.error('Prerender error:', err);
    process.exit(1);
});
