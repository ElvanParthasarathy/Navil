import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
    console.error('dist/index.html not found! Skipping generate-nammil-meta.');
    process.exit(0);
}

let html = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Replace title
html = html.replace(/<title>.*?<\/title>/i, '<title>நம்மில் • Nammil</title>');

// 2. Replace favicon
html = html.replace(/<link rel="icon"[^>]*>/i, '<link rel="icon" type="image/png" href="/nammil_icon.png" />');
html = html.replace(/<link rel="apple-touch-icon"[^>]*>/i, '<link rel="apple-touch-icon" href="/nammil_icon.png" />');

// 3. Inject OpenGraph and Twitter meta tags right before </head>
const metaTags = `
  <!-- OpenGraph & Social Preview (WhatsApp / Facebook / Twitter / Telegram) -->
  <meta property="og:title" content="நம்மில் • Nammil" />
  <meta property="og:site_name" content="Elvan Navil" />
  <meta property="og:description" content="A beautifully crafted, privacy-focused desktop companion for WhatsApp featuring multi-account sessions, automated media organization, and native notifications." />
  <meta property="og:image" content="https://elvannavil.vercel.app/nammil_icon.png" />
  <meta property="og:image:secure_url" content="https://elvannavil.vercel.app/nammil_icon.png" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />
  <meta property="og:image:alt" content="Nammil App Icon" />
  <meta property="og:url" content="https://elvannavil.vercel.app/downloads/nammil" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="நம்மில் • Nammil" />
  <meta name="twitter:description" content="A beautifully crafted, privacy-focused desktop companion for WhatsApp featuring multi-account sessions, automated media organization, and native notifications." />
  <meta name="twitter:image" content="https://elvannavil.vercel.app/nammil_icon.png" />
`;

html = html.replace('</head>', `${metaTags}\n</head>`);

// Write to dist/downloads-nammil.html
const outPath = path.join(DIST_DIR, 'downloads-nammil.html');
fs.writeFileSync(outPath, html, 'utf8');

// Also write to dist/downloads/nammil/index.html for static clean URL servers
const staticDirPath = path.join(DIST_DIR, 'downloads', 'nammil');
fs.mkdirSync(staticDirPath, { recursive: true });
fs.writeFileSync(path.join(staticDirPath, 'index.html'), html, 'utf8');

console.log('✓ Generated downloads-nammil.html and downloads/nammil/index.html with Nammil OG meta tags and favicon.');
