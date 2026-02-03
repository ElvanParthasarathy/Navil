import { v2 as cloudinary } from 'cloudinary';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'doxhuprh4',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const uploadMedia = async () => {
    const mediaDir = 'public/assets/instagram';
    const files = await glob('**/*.{jpg,jpeg,png,webp,mp4,heic,heif,JPG,JPEG,PNG,WEBP,MP4,HEIC,HEIF}', { cwd: mediaDir });

    console.log(`Found ${files.length} files to upload...`);

    for (const file of files) {
        const fullPath = path.join(mediaDir, file).replace(/\\/g, '/');
        const isVideo = file.toLowerCase().endsWith('.mp4');

        // Get the folder relative to 'assets/instagram'
        const relativeFolder = path.dirname(file).replace(/\\/g, '/');
        const folder = relativeFolder === '.' ? 'assets/instagram' : `assets/instagram/${relativeFolder}`;

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

    console.log('\n--- Upload session complete! ---');
};

uploadMedia();
