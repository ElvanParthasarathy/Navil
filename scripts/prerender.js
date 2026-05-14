import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

async function getRoutesToPrerender() {
    try {
        const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
        if (!fs.existsSync(sitemapPath)) {
            console.warn('No sitemap found, falling back to basic routes.');
            return ['/', '/about', '/writings', '/archive', '/portfolio'];
        }
        const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
        // Extract URLs from sitemap
        const urls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
        // Extract the path from the full URL
        return urls.map(url => {
            try {
                return new URL(url).pathname;
            } catch (e) {
                return url.replace('https://elvanparthasarathy.vercel.app', '');
            }
        }).filter(Boolean);
    } catch (e) {
        console.error('Error parsing sitemap:', e);
        return ['/'];
    }
}

async function startServer() {
    const app = express();
    app.use(express.static(DIST_DIR));
    // Fallback for SPA routing
    app.get('{*path}', (req, res) => {
        res.sendFile(path.join(DIST_DIR, 'index.html'));
    });

    return new Promise((resolve) => {
        const server = app.listen(0, () => {
            const port = server.address().port;
            resolve({ server, port });
        });
    });
}

async function prerender() {
    console.log('Starting prerender process...');

    if (process.env.VERCEL) {
        console.warn('================================================================');
        console.warn('⚠️ VERCEL ENVIRONMENT DETECTED: Skipping Puppeteer prerendering.');
        console.warn('Vercel build containers do not contain the necessary OS libraries');
        console.warn('(like libnspr4.so) to run headless Chromium.');
        console.warn('The site will be deployed as a standard Single Page Application (SPA).');
        console.warn('================================================================');
        return; // Skip the rest of the prerender process
    }
    
    // Ensure dist/index.html exists
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) {
        console.error('dist/index.html not found. Please run "npm run build" first.');
        process.exit(1);
    }

    const originalHtml = fs.readFileSync(indexPath, 'utf8');
    const { server, port } = await startServer();
    const baseUrl = `http://localhost:${port}`;
    
    const routes = await getRoutesToPrerender();
    console.log(`Found ${routes.length} routes to prerender.`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const route of routes) {
        if (route === '/admin') continue; // Don't prerender admin panel

        const page = await browser.newPage();
        // Set a standard viewport
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`Prerendering ${route}...`);
        try {
            await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
            
            // Give Firebase a little extra time to populate the DOM if needed
            await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

            const html = await page.content();
            
            // We need to save this HTML to the correct path in dist/
            let filePath = path.join(DIST_DIR, route);
            
            // If it's the root, save to index.html
            if (route === '/' || route === '') {
                filePath = path.join(DIST_DIR, 'index.html');
            } else {
                // If it's a directory route like /about, save as /about/index.html
                // If it already has an extension, save as is (rare for SPA routes)
                if (!path.extname(filePath)) {
                    fs.mkdirSync(filePath, { recursive: true });
                    filePath = path.join(filePath, 'index.html');
                } else {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                }
            }

            fs.writeFileSync(filePath, html);
            console.log(`Saved ${route} -> ${filePath}`);
        } catch (e) {
            console.error(`Failed to prerender ${route}:`, e.message);
        } finally {
            await page.close();
        }
    }

    await browser.close();
    server.close();
    console.log('Prerendering complete!');
}

prerender().catch(err => {
    console.error('Prerender error:', err);
    process.exit(1);
});
