import fs from 'fs';
import path from 'path';
import heicConvert from 'heic-convert';
import sharp from 'sharp';
import { glob } from 'glob';

const ELVANMEDIA_DIR = 'D:/Projects/Elvan/Elvanmedia';
const DATA_DIR = 'D:/Projects/Elvan/src/data';

async function convertHeic() {
    console.log('--- Starting Robust HEIC to WebP Conversion ---');

    const heicFiles = await glob('**/*.heic', { cwd: ELVANMEDIA_DIR, absolute: true });
    console.log(`Found ${heicFiles.length} HEIC files.`);

    const conversionMap = {}; // oldPath -> newPath (relative to assets/instagram)

    for (const heicPath of heicFiles) {
        const relativePath = path.relative(path.join(ELVANMEDIA_DIR, 'assets/instagram'), heicPath).replace(/\\/g, '/');
        const webpPath = heicPath.replace('.heic', '.webp');
        const relativeWebpPath = relativePath.replace('.heic', '.webp');

        console.log(`Processing: ${relativePath} -> ${relativeWebpPath}`);

        try {
            const buf = fs.readFileSync(heicPath);
            let processedBuffer;

            // Check if it's actually a JPEG (starts with FF D8 FF)
            if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
                console.log(`  (Note: File is actually a JPEG)`);
                processedBuffer = buf;
            } else {
                // Try HEIC conversion
                processedBuffer = await heicConvert({
                    buffer: buf,
                    format: 'JPEG',
                    quality: 1
                });
            }

            await sharp(processedBuffer)
                .webp({ quality: 85 })
                .toFile(webpPath);

            console.log(`  ✅ Success: Created .webp`);
            conversionMap[relativePath] = relativeWebpPath;

            // Delete original HEIC
            fs.unlinkSync(heicPath);
            console.log(`  🗑️ Deleted original .heic`);
        } catch (error) {
            console.error(`  ❌ Failed ${relativePath}:`, error.message);
        }
    }

    console.log('\n--- Updating JSON Files ---');
    const jsonFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

    for (const jsonFile of jsonFiles) {
        const filePath = path.join(DATA_DIR, jsonFile);
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        for (const [oldRel, newRel] of Object.entries(conversionMap)) {
            // Need to handle both relative path and potentially more specific paths if they exist
            if (content.includes(oldRel)) {
                content = content.split(oldRel).join(newRel);
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated: ${jsonFile}`);
        }
    }

    console.log('\n✅ Conversion and JSON update completed.');
}

convertHeic();
