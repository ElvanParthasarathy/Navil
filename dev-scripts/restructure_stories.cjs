const fs = require('fs');
const path = require('path');

const storiesJsonPath = path.join(__dirname, 'src', 'data', 'stories.json');
const elvanMediaDir = path.join(__dirname, 'Elvanmedia');
const storiesDir = path.join(elvanMediaDir, 'assets', 'instagram', 'stories');

// The base CDN path to prefix new URLs with
const cdnBaseUrl = 'https://cdn.jsdelivr.net/gh/ElvanParthasarathy/Elvanmedia@main/assets/instagram/stories';

async function main() {
    console.log("Reading stories.json...");
    let storiesData = JSON.parse(fs.readFileSync(storiesJsonPath, 'utf8'));
    let movedFiles = 0;
    
    for (let i = 0; i < storiesData.length; i++) {
        let highlight = storiesData[i];
        
        // Clean highlight group name to be safe for folders (remove emojis or weird characters if needed, but Windows supports unicode)
        // Let's just trim whitespace.
        let groupFolder = highlight.id.replace(/[<>:"/\\|?*]/g, '_'); // safe folder name
        let targetGroupDir = path.join(storiesDir, groupFolder);
        
        if (!fs.existsSync(targetGroupDir)) {
            fs.mkdirSync(targetGroupDir, { recursive: true });
        }
        
        // Let's track mapping of old URL -> new URL for cover update
        let coverUpdated = false;

        for (let j = 0; j < highlight.stories.length; j++) {
            let story = highlight.stories[j];
            
            // Extract relative path from URL to find physical file
            let relPathParts = story.url.split('Elvanmedia@main/assets/instagram/stories/');
            let relPath = relPathParts.length > 1 ? relPathParts[1] : null;
            
            if (!relPath) {
                // Check if it's the elvan.jp URL pattern which the user had:
                let relPathPartsJP = story.url.split('Elvanmedia@main/assets/instagram/elvan.jp/stories/');
                if (relPathPartsJP.length > 1) {
                    relPath = '../elvan.jp/stories/' + relPathPartsJP[1];
                } else {
                    console.log("Unrecognized URL format, skipping: " + story.url);
                    continue;
                }
            }
            
            const absoluteOldPath = path.join(storiesDir, relPath);
            
            if (!fs.existsSync(absoluteOldPath)) {
                console.log("File not found on disk, it might have been moved already: " + absoluteOldPath);
                continue;
            }

            // Generate new filename: 001_originalName.ext
            // originalName might already have 001_ if we run this twice, so let's strip existing prefixes if any
            let oldFileName = path.basename(absoluteOldPath);
            let rawFileName = oldFileName;
            if (/^\d{3}_/.test(rawFileName)) {
                rawFileName = rawFileName.substring(4);
            }
            
            let indexFormatted = String(j + 1).padStart(3, '0');
            let newFileName = `${indexFormatted}_${rawFileName}`;
            let absoluteNewPath = path.join(targetGroupDir, newFileName);
            
            // Move file
            if (absoluteOldPath !== absoluteNewPath) {
                fs.renameSync(absoluteOldPath, absoluteNewPath);
                movedFiles++;
            }
            
            // Update story URL
            let newUrl = `${cdnBaseUrl}/${encodeURIComponent(groupFolder)}/${encodeURIComponent(newFileName)}`;
            
            // If this story URL matches the highlight cover URL, update the cover URL too!
            if (highlight.cover === story.url) {
                highlight.cover = newUrl;
                coverUpdated = true;
            }
            
            story.url = newUrl;
        }
        
        // If cover wasn't explicitly matched but it's a placeholder, or we just want to ensure it's valid
        if (!coverUpdated && highlight.stories.length > 0) {
            highlight.cover = highlight.stories[0].url; // Default to first story
        }
    }
    
    console.log(`Moved ${movedFiles} files.`);
    
    // Write updated JSON
    console.log("Writing updated stories.json...");
    fs.writeFileSync(storiesJsonPath, JSON.stringify(storiesData, null, 2), 'utf8');
    console.log("Done.");
}

main().catch(console.error);
