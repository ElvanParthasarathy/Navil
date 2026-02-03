/**
 * convert_story_images_to_video.cjs
 * 
 * This script:
 * 1. Scans the local stories folder for images (jpg, png, webp, heic)
 * 2. Converts each image to a 5-second MP4 video using FFmpeg
 * 3. Uploads the video to Cloudinary
 * 4. Outputs a mapping of old image URLs to new video URLs
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Configuration
const STORIES_DIR = path.join(__dirname, '..', 'jaiprakashelvan instagram', 'media', 'stories');
const OUTPUT_DIR = path.join(__dirname, '..', 'temp_story_videos');
const VIDEO_DURATION = 5; // 5 seconds per story

// Cloudinary config (from .env)
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'doxhuprh4';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Find all image files in stories folder
function findImageFiles(dir) {
    const images = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

    function walkDir(currentDir) {
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walkDir(fullPath);
            } else if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if (imageExtensions.includes(ext)) {
                    images.push(fullPath);
                }
            }
        }
    }

    walkDir(dir);
    return images;
}

// Convert image to 5-second video using FFmpeg
function convertImageToVideo(imagePath, outputPath) {
    // FFmpeg command:
    // -loop 1: Loop the image
    // -i: Input image
    // -c:v libx264: Use H.264 codec
    // -t 5: Duration 5 seconds
    // -pix_fmt yuv420p: Pixel format for compatibility
    // -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2": Scale to story dimensions 9:16

    // Use absolute path for ffmpeg since it was just installed
    const ffmpegPath = `C:\\Users\\jaipr\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe`;
    const cmd = `"${ffmpegPath}" -y -loop 1 -i "${imagePath}" -c:v libx264 -t ${VIDEO_DURATION} -pix_fmt yuv420p -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" -r 30 "${outputPath}"`;

    try {
        execSync(cmd, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`Failed to convert ${imagePath}:`, error.message);
        return false;
    }
}

// Upload to Cloudinary using CLI (requires cloudinary-cli or we can use curl)
async function uploadToCloudinary(videoPath, folder) {
    // We'll use a simple dynamic import for cloudinary
    const cloudinary = require('cloudinary').v2;

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true
    });

    const fileName = path.basename(videoPath, '.mp4');

    try {
        const result = await cloudinary.uploader.upload(videoPath, {
            folder: folder,
            resource_type: 'video',
            public_id: fileName,
            overwrite: true,
            invalidate: true
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Failed to upload ${videoPath}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🎬 Story Image to Video Converter');
    console.log('==================================\n');

    // Find all images
    console.log(`Scanning: ${STORIES_DIR}\n`);
    const images = findImageFiles(STORIES_DIR);
    console.log(`Found ${images.length} image files.\n`);

    if (images.length === 0) {
        console.log('No images found to convert.');
        return;
    }

    const results = [];

    for (let i = 0; i < images.length; i++) {
        const imagePath = images[i];
        const relativePath = path.relative(STORIES_DIR, imagePath);
        const monthFolder = path.dirname(relativePath);
        const baseName = path.basename(imagePath, path.extname(imagePath));
        const outputName = `${baseName}.mp4`;
        const outputPath = path.join(OUTPUT_DIR, monthFolder, outputName);

        // Ensure output subfolder exists
        const outputSubDir = path.dirname(outputPath);
        if (!fs.existsSync(outputSubDir)) {
            fs.mkdirSync(outputSubDir, { recursive: true });
        }

        console.log(`[${i + 1}/${images.length}] Converting: ${relativePath}`);

        // Convert image to video
        const success = convertImageToVideo(imagePath, outputPath);

        if (success) {
            console.log(`  ✅ Video created: ${outputName}`);

            // Upload to Cloudinary
            const cloudFolder = `assets/instagram/stories/${monthFolder}`;
            console.log(`  📤 Uploading to ${cloudFolder}...`);
            const videoUrl = await uploadToCloudinary(outputPath, cloudFolder);

            if (videoUrl) {
                console.log(`  ✅ Uploaded: ${videoUrl}`);
                results.push({
                    originalImage: relativePath,
                    videoUrl: videoUrl
                });
            }
        }

        console.log('');
    }

    // Output mapping
    console.log('\n\n====== CONVERSION COMPLETE ======\n');
    console.log('Results (copy these to update instagramData.js):\n');
    console.log(JSON.stringify(results, null, 2));

    // Save results to file
    const resultsPath = path.join(__dirname, 'story_conversion_results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${resultsPath}`);
}

main().catch(console.error);
