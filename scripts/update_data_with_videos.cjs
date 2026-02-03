/**
 * update_data_with_videos.cjs
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

    // Create a map of filenameStem -> videoUrl for fast lookup
    const fileMap = {};
    results.forEach(r => {
        // Handle windows separators if present in the json
        const fullPath = r.originalImage.replace(/\\/g, '/');
        const ext = path.extname(fullPath);
        const fnameStem = path.basename(fullPath, ext); // Filename without extension
        fileMap[fnameStem] = r.videoUrl;
    });

    const lines = dataContent.split('\n');
    const newLines = [];
    let pendingVideoUrl = null;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // 1. Check for URL replacement
        if (line.includes('"url":')) {
            for (const [stem, vUrl] of Object.entries(fileMap)) {
                if (line.includes(stem)) {
                    // Found a match!
                    // Replace the URL value
                    line = line.replace(/"url":\s*"[^"]*"/, `"url": "${vUrl}"`);
                    pendingVideoUrl = vUrl; // Mark that we just updated a URL
                    updateCount++;
                    // Remove from map to check coverage if needed, but duplicates might exist?
                    break;
                }
            }
        }

        // 2. Check for Type replacement
        if (pendingVideoUrl && line.includes('"type":')) {
            if (line.includes('"image"')) {
                line = line.replace('"image"', '"video"');
                pendingVideoUrl = null; // Reset
            }
        }

        if (line.includes('}')) {
            pendingVideoUrl = null;
        }

        newLines.push(line);
    }

    fs.writeFileSync(DATA_FILE, newLines.join('\n'));
    console.log(`Updated instagramData.js with ${updateCount} new video URLs.`);
}

updateData();
