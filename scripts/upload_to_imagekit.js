import ImageKit from 'imagekit';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Configure ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// A small utility function to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const uploadMedia = async () => {
    // We only care about Instagram assets for now as per previous Cloudinary script
    const mediaDir = 'public/assets/instagram';

    // Check if directory exists
    if (!fs.existsSync(mediaDir)) {
        console.error(`Directory ${mediaDir} does not exist.`);
        process.exit(1);
    }

    const files = await glob('**/*.{jpg,jpeg,png,webp,mp4,heic,heif,JPG,JPEG,PNG,WEBP,MP4,HEIC,HEIF}', { cwd: mediaDir });

    console.log(`Found ${files.length} files to upload to ImageKit...`);

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        const fullPath = path.join(mediaDir, file).replace(/\\/g, '/');

        // Define destination folder in ImageKit preserving local structure
        const relativeFolder = path.dirname(file).replace(/\\/g, '/');
        const folder = relativeFolder === '.' ? '/assets/instagram' : `/assets/instagram/${relativeFolder}`;
        const fileName = path.basename(file);

        // Read file as base64 for API
        const fileContent = fs.readFileSync(fullPath).toString('base64');

        try {
            console.log(`Uploading: ${file} -> folder: ${folder}`);

            await new Promise((resolve, reject) => {
                imagekit.upload({
                    file: fileContent, // Required
                    fileName: fileName, // Required
                    folder: folder, // Optional
                    useUniqueFileName: false, // We want the original name to match our JSON data perfectly
                    overwriteFile: true, // Overwrite if exists
                    overwriteAITags: false,
                    overwriteTags: false,
                    overwriteCustomMetadata: false
                }, function (error, result) {
                    if (error) reject(error);
                    else resolve(result);
                });
            });

            console.log(`✅ Success: ${file}`);
            successCount++;

            // Avoid rate limiting
            await sleep(200);

        } catch (error) {
            console.error(`❌ Failed: ${file}`, error.message || error);
            failCount++;
        }
    }

    console.log('\n--- Upload session complete! ---');
    console.log(`Total Success: ${successCount}`);
    console.log(`Total Failed:  ${failCount}`);
};

uploadMedia();
