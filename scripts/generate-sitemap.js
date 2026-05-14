import fs from 'fs';
import dotenv from 'dotenv';
import { SitemapStream, streamToPromise } from 'sitemap';

// Load env vars
dotenv.config({ path: '.env.local' });
if (!process.env.VITE_FIREBASE_DATABASE_URL) {
    dotenv.config({ path: '.env' });
}

const dbUrl = process.env.VITE_FIREBASE_DATABASE_URL;
const hostname = 'https://elvanparthasarathy.vercel.app';

const staticRoutes = [
    '/',
    '/about',
    '/portfolio',
    '/writings',
    '/teaching',
    '/archive',
    '/writings/quotes',
    '/writings/poems'
];

const categories = [
    'blog',
    'articles',
    'essays',
    'stories',
    'thoughts',
    'diary'
];

async function generateSitemap() {
    console.log('Generating sitemap...');
    const smStream = new SitemapStream({ hostname });

    // Add static routes
    staticRoutes.forEach(route => {
        smStream.write({ url: route, changefreq: 'weekly', priority: 0.8 });
    });

    // Add category list routes
    categories.forEach(category => {
        smStream.write({ url: `/writings/${category}`, changefreq: 'weekly', priority: 0.7 });
    });

    // Fetch dynamic content from Firebase REST API
    if (dbUrl) {
        for (const category of categories) {
            try {
                const response = await fetch(`${dbUrl}/${category}.json`);
                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        for (const slug of Object.keys(data)) {
                            smStream.write({ 
                                url: `/writings/${category}/${slug}`, 
                                changefreq: 'monthly', 
                                priority: 0.6 
                            });
                        }
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch ${category} from Firebase:`, err);
            }
        }
    } else {
        console.warn('VITE_FIREBASE_DATABASE_URL not found, skipping dynamic routes in sitemap.');
    }

    smStream.end();

    const sitemapOutput = await streamToPromise(smStream);
    fs.writeFileSync('./public/sitemap.xml', sitemapOutput.toString());
    console.log('Sitemap successfully generated at ./public/sitemap.xml');
}

generateSitemap().catch(console.error);
