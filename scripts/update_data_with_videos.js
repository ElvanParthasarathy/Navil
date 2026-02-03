/**
 * update_data_with_videos.js
 * 
 * This script updates instagramData.js using the mapping from story_conversion_results.json
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'instagramData.js');
const RESULTS_FILE = path.join(__dirname, 'story_conversion_results.json');

function updateData() {
    if (!fs.existsSync(RESULTS_FILE)) {
        console.error('Results file not found!');
        return;
    }

    const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    let dataContent = fs.readFileSync(DATA_FILE, 'utf8');
    let updateCount = 0;

    console.log(`Found ${results.length} conversions to apply.`);

    results.forEach(item => {
        // The original image path in the JSON might be relative, e.g. "202112/image.jpg"
        // But in instagramData.js it's a full Cloudinary URL.
        // We need to find the entry in instagramData.js that corresponds to this image.

        // Since we don't have the old Cloudinary URL in the results (only the local relative path),
        // we might need to rely on the filename being unique enough or the structure.
        // Actually, the instagramData.js has the full URL which contains the filename.

        // Strategy: 
        // 1. Extract filename from local path (e.g. "image_123.webp")
        // 2. Search for that filename in dataContent
        // 3. Replace the whole URL with the new Video URL
        // 4. Also change "type": "image" to "type": "video" for that entry

        const filename = path.basename(item.originalImage);
        const videoUrl = item.videoUrl;

        // Regex to find the URL containing the filename
        // It looks for "url": "..../filename"
        // And also catches the type field nearby if possible, or we do two replaces.

        // Let's first find the exact URL string in the file that matches this filename
        // The URL format in data is roughly: https://res.cloudinary.com/.../filename

        const urlRegex = new RegExp(`"url":\\s*"[^"]*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');

        dataContent = dataContent.replace(urlRegex, (match) => {
            updateCount++;
            return `"url": "${videoUrl}"`;
        });

        // Now finding the type associated with this story is harder with simple regex because it's on a different line.
        // But since we are converting ALL images in stories to videos, maybe we can just search for the specific structure?

        // Alternative: The `storyHighlights` array is at the end. We can identify the block.
        // A story block looks like:
        // {
        //   "id": "...",
        //   "url": "...",
        //   "type": "image",
        //   ...
        // }

        // If we replaced the URL, we should also look for the type "image" in the same block.
        // This is tricky with simple replace.

        // Better approach: Since we know the filename, let's find the `index` of the URL replacement, 
        // then look ahead for `"type": "image"` and replace it with `"type": "video"`.

    });

    // Second pass for types:
    // iterate again to fix types? No, let's do it differently.

    // Let's use a more robust regex that captures the whole story object pattern if possible?
    // Or just loop through lines.

    const lines = dataContent.split('\n');
    const newLines = [];
    let insideStory = false;
    let pendingVideoUrl = null;

    // Create a map of filename -> videoUrl for fast lookup
    const fileMap = {};
    results.forEach(r => {
        fileMap[path.basename(r.originalImage)] = r.videoUrl;
    });

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Check if this line has a URL equal to one of our converted images
        // We look for the filename in the line
        let match = false;
        let matchedFilename = null;

        // Simple check: does the line contain any of our keys?
        // Optimization: check if line has "url": and ".webp" or ".jpg" etc
        if (line.includes('"url":')) {
            for (const [fname, vUrl] of Object.entries(fileMap)) {
                if (line.includes(fname)) {
                    // Found a match!
                    line = line.replace(/"url":\s*"[^"]*"/, `"url": "${vUrl}"`);
                    pendingVideoUrl = vUrl; // Mark that we just updated a URL
                    updateCount++;
                    match = true;
                    break;
                }
            }
        }

        // If we just updated a URL, look for the type field in subsequent lines
        if (pendingVideoUrl) {
            // We assume "type" comes after "url" in standard JSON/JS object dump
            // But verify:
            // "url": "...",
            // "type": "image",

            // If we find "type": "image" within the next few lines, swap it.
            // Actually, we can just process lines sequentially. 
            // If I set a flag 'justConvertedVideo' = true
        }

        newLines.push(line);
    }

    // Re-process for types: 
    // This is getting messy. Let's try a regex on the whole string for each file.
    // We want to replace:
    // "url": "...filename...",
    // "type": "image"
    // with 
    // "url": "...videoUrl...",
    // "type": "video"

    // Using `replace` with a function allows us to handle the logic.
    // Pattern: ("url":\s*".*?filename.*?",\s*"type":\s*)"image"

    let updatedContent = fs.readFileSync(DATA_FILE, 'utf8');

    results.forEach(item => {
        const filename = path.basename(item.originalImage);
        const videoUrl = item.videoUrl;

        // Construct regex to match URL line, potentially followed by type line with some whitespace/newlines
        // Note: The order of keys might vary, but usually `type` follows `url` in this file generation.

        // Case 1: URL then Type
        const pattern1 = new RegExp(`("url":\\s*"[^"]*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?"type":\\s*)"image"`, 'g');

        if (pattern1.test(updatedContent)) {
            updatedContent = updatedContent.replace(pattern1, `$1"video"`);
            // Also replace URL
            const urlPattern = new RegExp(`"url":\\s*"[^"]*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
            updatedContent = updatedContent.replace(urlPattern, `"url": "${videoUrl}"`);
        } else {
            // Case 2: Maybe Type then URL? Or Type is far away?
            // Or maybe just replace URL and assume type is image?

            // Let's just blindly replace "type": "image" with "type": "video" IF it belongs to this story.
            // This is hard to guarantee with regex.

            // Fallback: Just replace the URL. The app might play it even if type is 'image' if the extension is .mp4?
            // Library.jsx check: const isVideo = type === 'video' || (typeof src === 'string' && src.endsWith('.mp4'));
            // YES! Library.jsx explicitly checks for .mp4 extension even if type is not video.
            // So simply replacing the URL is sufficient!

            const urlPattern = new RegExp(`"url":\\s*"[^"]*${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
            updatedContent = updatedContent.replace(urlPattern, `"url": "${videoUrl}"`);
        }
    });

    fs.writeFileSync(DATA_FILE, updatedContent);
    console.log(`Updated instagramData.js with ${updateCount} new video URLs.`);
}

updateData();
