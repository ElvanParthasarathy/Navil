import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

// Define the old Cloudinary base URLs
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/doxhuprh4/image/upload/f_auto,q_auto';
const CLOUDINARY_VIDEO_URL = 'https://res.cloudinary.com/doxhuprh4/video/upload/f_auto,q_auto';

// New limitless jsDelivr Endpoint
const JSDELIVR_ENDPOINT = 'https://cdn.jsdelivr.net/gh/ElvanParthasarathy/Elvanmedia@main';

const migrateData = async () => {
    console.log('--- Starting Data Migration to jsDelivr (Ultimate Free Lifetime Solution) ---');
    console.log(`Targeting endpoint: ${JSDELIVR_ENDPOINT}`);

    // Find all JSON files in src/data
    const dataDir = path.join(process.cwd(), 'src/data');
    const files = await glob('**/*.json', { cwd: dataDir });

    console.log(`Found ${files.length} JSON files in src/data...`);

    let totalReplacements = 0;

    for (const file of files) {
        const fullPath = path.join(dataDir, file);
        let content = fs.readFileSync(fullPath, 'utf8');

        // Check if there are any Cloudinary URLs in this file
        if (content.includes('res.cloudinary.com') || content.includes('ik.imagekit.io')) {
            console.log(`Migrating URLs in: ${file}`);

            // Replace Cloudinary Image URLs
            content = content.replace(new RegExp(CLOUDINARY_BASE_URL, 'g'), JSDELIVR_ENDPOINT);

            // Replace Cloudinary Video URLs
            content = content.replace(new RegExp(CLOUDINARY_VIDEO_URL, 'g'), JSDELIVR_ENDPOINT);

            // Catch-all for generic cloudinary URLs
            content = content.replace(/https:\/\/res\.cloudinary\.com\/doxhuprh4\/image\/upload\/v[0-9]+\//g, `${JSDELIVR_ENDPOINT}/`);
            content = content.replace(/https:\/\/res\.cloudinary\.com\/doxhuprh4\/image\/upload\//g, `${JSDELIVR_ENDPOINT}/`);
            content = content.replace(/https:\/\/res\.cloudinary\.com\/doxhuprh4\/video\/upload\//g, `${JSDELIVR_ENDPOINT}/`);

            // Also catch any ImageKit URLs from the aborted migration
            content = content.replace(/https:\/\/ik\.imagekit\.io\/y92e1pmb8\//g, `${JSDELIVR_ENDPOINT}/`);

            fs.writeFileSync(fullPath, content, 'utf8');

            console.log(`✅ Updated ${file}`);
            totalReplacements++;
        }
    }

    // Also migrate profile.json and App.jsx specifically
    const appJsxPath = path.join(process.cwd(), 'src/App.jsx');
    if (fs.existsSync(appJsxPath)) {
        let appContent = fs.readFileSync(appJsxPath, 'utf8');
        if (appContent.includes('res.cloudinary.com')) {
            appContent = appContent.replace(/https:\/\/res\.cloudinary\.com\/doxhuprh4\/image\/upload/g, JSDELIVR_ENDPOINT);
            fs.writeFileSync(appJsxPath, appContent, 'utf8');
            console.log(`✅ Updated App.jsx`);
            totalReplacements++;
        }
    }

    console.log(`\nMigration complete. Updated ${totalReplacements} files.`);
};

migrateData();
