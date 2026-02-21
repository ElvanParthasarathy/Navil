import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

// Define the old Cloudinary base URL and the new ImageKit URL
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/doxhuprh4/image/upload/f_auto,q_auto';
const CLOUDINARY_VIDEO_URL = 'https://res.cloudinary.com/doxhuprh4/video/upload/f_auto,q_auto';

// We get the ImageKit endpoint from env, or fallback
// It usually looks like https://ik.imagekit.io/y92e1pmb8
const IMAGEKIT_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/y92e1pmb8';

const migrateData = async () => {
    console.log('--- Starting Data Migration from Cloudinary to ImageKit ---');
    console.log(`Targeting endpoint: ${IMAGEKIT_ENDPOINT}`);

    // Find all JSON files in src/data
    const dataDir = path.join(process.cwd(), 'src/data');
    const files = await glob('**/*.json', { cwd: dataDir });

    console.log(`Found ${files.length} JSON files in src/data...`);

    let totalReplacements = 0;

    for (const file of files) {
        const fullPath = path.join(dataDir, file);
        let content = fs.readFileSync(fullPath, 'utf8');

        // Check if there are any Cloudinary URLs in this file
        if (content.includes('res.cloudinary.com')) {
            console.log(`Migrating URLs in: ${file}`);

            // Regex to match Cloudinary Image URLs
            // We use global replacement `g` flag
            const initialLength = content.length;

            // Replace Image URLs
            content = content.replace(new RegExp(CLOUDINARY_BASE_URL, 'g'), IMAGEKIT_ENDPOINT);

            // Replace Video URLs (Reels, etc)
            content = content.replace(new RegExp(CLOUDINARY_VIDEO_URL, 'g'), IMAGEKIT_ENDPOINT);

            // Just in case there's any other generic cloudinary URLs without f_auto,q_auto
            content = content.replace(/https:\/\/res\.cloudinary\.com\/doxhuprh4\/image\/upload\/v[0-9]+\//g, `${IMAGEKIT_ENDPOINT}/`);
            content = content.replace(/https:\/\/res\.cloudinary\.com\/doxhuprh4\/image\/upload\//g, `${IMAGEKIT_ENDPOINT}/`);
            content = content.replace(/https:\/\/res\.cloudinary\.com\/doxhuprh4\/video\/upload\//g, `${IMAGEKIT_ENDPOINT}/`);

            fs.writeFileSync(fullPath, content, 'utf8');

            console.log(`✅ Updated ${file}`);
            totalReplacements++;
        }
    }

    // Also migrate profile.json and any hardcoded ones in App.jsx if needed?
    // They should be covered by src/data glob, but let's check App.jsx specifically.
    const appJsxPath = path.join(process.cwd(), 'src/App.jsx');
    if (fs.existsSync(appJsxPath)) {
        let appContent = fs.readFileSync(appJsxPath, 'utf8');
        if (appContent.includes('res.cloudinary.com')) {
            appContent = appContent.replace(/https:\/\/res\.cloudinary\.com\/doxhuprh4\/image\/upload\/assets\/instagram/g, `${IMAGEKIT_ENDPOINT}/assets/instagram`);
            fs.writeFileSync(appJsxPath, appContent, 'utf8');
            console.log(`✅ Updated App.jsx`);
            totalReplacements++;
        }
    }

    console.log(`\nMigration complete. Updated ${totalReplacements} files.`);
};

// Run if called directly
migrateData();
