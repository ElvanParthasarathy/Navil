const fs = require('fs');
const path = require('path');

const storiesJsonPath = path.join(__dirname, 'src', 'data', 'stories.json');
const elvanMediaDir = path.join(__dirname, 'Elvanmedia');
const storiesDir = path.join(elvanMediaDir, 'assets', 'instagram', 'stories');

const cdnBaseUrl = 'https://cdn.jsdelivr.net/gh/ElvanParthasarathy/Elvanmedia@main/assets/instagram/stories';

async function main() {
    console.log("Reading stories.json...");
    let rawData = fs.readFileSync(storiesJsonPath, 'utf8');
    // Strip BOM if present
    if (rawData.charCodeAt(0) === 0xFEFF) {
        rawData = rawData.slice(1);
    }
    let storiesData = JSON.parse(rawData);
    let movedFiles = 0;
    
    for (let i = 0; i < storiesData.length; i++) {
        let highlight = storiesData[i];
        
        let targetGroupFolder = `${String(i + 1).padStart(2, '0')}_${highlight.id.replace(/[<>:"/\\|?*]/g, '_')}`;
        let targetGroupDir = path.join(storiesDir, targetGroupFolder);
        
        if (!fs.existsSync(targetGroupDir)) {
            fs.mkdirSync(targetGroupDir, { recursive: true });
        }
        
        let coverUpdated = false;

        for (let j = 0; j < highlight.stories.length; j++) {
            let story = highlight.stories[j];
            
            let relPathParts = story.url.split('Elvanmedia@main/assets/instagram/stories/');
            if (relPathParts.length <= 1) {
                console.log("Unrecognized URL format, skipping: " + story.url);
                continue;
            }
            
            let relPath = decodeURIComponent(relPathParts[1]);
            const absoluteOldPath = path.join(storiesDir, relPath);
            
            if (!fs.existsSync(absoluteOldPath)) {
                console.log("File not found on disk, it might have been moved already: " + absoluteOldPath);
                // We'll still update the URL to point to where it should be, just in case
            }

            let oldFileName = path.basename(absoluteOldPath);
            let rawFileName = oldFileName;
            if (/^\d{3}_/.test(rawFileName)) {
                rawFileName = rawFileName.substring(4);
            }
            
            let indexFormatted = String(j + 1).padStart(3, '0');
            let newFileName = `${indexFormatted}_${rawFileName}`;
            let absoluteNewPath = path.join(targetGroupDir, newFileName);
            
            if (fs.existsSync(absoluteOldPath) && absoluteOldPath !== absoluteNewPath) {
                fs.renameSync(absoluteOldPath, absoluteNewPath);
                movedFiles++;
            }
            
            let newUrl = `${cdnBaseUrl}/${encodeURIComponent(targetGroupFolder)}/${encodeURIComponent(newFileName)}`;
            
            if (highlight.cover === story.url) {
                highlight.cover = newUrl;
                coverUpdated = true;
            }
            
            story.url = newUrl;
        }
        
        if (!coverUpdated && highlight.stories.length > 0) {
            highlight.cover = highlight.stories[0].url;
        }
    }
    
    console.log(`Moved ${movedFiles} files.`);
    
    console.log("Writing updated stories.json...");
    fs.writeFileSync(storiesJsonPath, JSON.stringify(storiesData, null, 2), 'utf8');
    console.log("Done.");
}

main().catch(console.error);
