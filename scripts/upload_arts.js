import { v2 as cloudinary } from 'cloudinary';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'doxhuprh4',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const uploadArts = async () => {
    // Media directory for elvan.jp
    const mediaDir = path.join(__dirname, '../elvan.jp Insta HTML/media');

    // We want to upload everything from posts, stories, etc.
    const patterns = [
        'posts/**/*.{jpg,jpeg,png,webp,mp4,heic,heif,JPG,JPEG,PNG,WEBP,MP4,HEIC,HEIF}',
        'stories/**/*.{jpg,jpeg,png,webp,mp4,heic,heif,JPG,JPEG,PNG,WEBP,MP4,HEIC,HEIF}'
    ];

    console.log('Searching for files in:', mediaDir);

    const files = await glob(patterns, { cwd: mediaDir });

    console.log(`Found ${files.length} files to upload from elvan.jp...`);

    for (const file of files) {
        const fullPath = path.join(mediaDir, file).replace(/\\/g, '/');
        const isVideo = file.toLowerCase().endsWith('.mp4');

        // Cloudinary path: assets/instagram/elvan.jp/[subfolder]/[filename]
        const relativeFolder = path.dirname(file).replace(/\\/g, '/');
        const folder = `assets/instagram/elvan.jp/${relativeFolder}`;

        try {
            console.log(`Uploading: ${file} to folder ${folder}`);
            await cloudinary.uploader.upload(fullPath, {
                folder: folder,
                resource_type: isVideo ? 'video' : 'image',
                use_filename: true,
                unique_filename: false,
                overwrite: true,
                invalidate: true
            });
            console.log(`✅ Success: ${file}`);
        } catch (error) {
            console.error(`❌ Failed: ${file}`, error.message);
        }
    }

    console.log('\n--- Arts upload session complete! ---');
};

uploadArts();
