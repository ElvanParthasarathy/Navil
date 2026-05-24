const fs = require('fs');
const path = require('path');

const storiesJsonPath = path.join(__dirname, 'src', 'data', 'stories.json');
const elvanMediaDir = path.join(__dirname, 'Elvanmedia');
const storiesDir = path.join(elvanMediaDir, 'assets', 'instagram', 'stories');
const cdnBaseUrl = 'https://cdn.jsdelivr.net/gh/ElvanParthasarathy/Elvanmedia@main/assets/instagram/stories';

async function main() {
    console.log("Reading stories.json...");
    let storiesData = JSON.parse(fs.readFileSync(storiesJsonPath, 'utf8'));
    let movedFolders = 0;
    
    for (let i = 0; i < storiesData.length; i++) {
        let highlight = storiesData[i];
        
        let oldGroupFolder = highlight.id.replace(/[<>:"/\\|?*]/g, '_');
        
        // Check if it already has a prefix from a previous run, although it shouldn't
        if (/^\d{2}_/.test(oldGroupFolder)) {
            oldGroupFolder = oldGroupFolder.substring(3);
        }
        
        // If old folder is just the name (no prefix), try to find it.
        // Wait, the folders right now do NOT have prefixes. Let's just use the strict old group folder.
        // Also it's possible that the folder is ALREADY prefixed if they ran this script multiple times. 
        // We will scan the directory to find the folder that ends with the ID, or exactly matches it.
        
        let dirs = fs.readdirSync(storiesDir, { withFileTypes: true }).filter(d => d.isDirectory());
        let currentFolder = dirs.find(d => d.name === oldGroupFolder || d.name.endsWith(`_${oldGroupFolder}`));
        
        if (!currentFolder) {
            console.log(`Could not find folder for highlight: ${oldGroupFolder}`);
            continue;
        }
        
        let targetGroupFolder = `${String(i + 1).padStart(2, '0')}_${oldGroupFolder}`;
        let absoluteOldPath = path.join(storiesDir, currentFolder.name);
        let absoluteNewPath = path.join(storiesDir, targetGroupFolder);
        
        if (absoluteOldPath !== absoluteNewPath) {
            fs.renameSync(absoluteOldPath, absoluteNewPath);
            movedFolders++;
        }
        
        // Now update URLs
        let coverUpdated = false;
        
        for (let j = 0; j < highlight.stories.length; j++) {
            let story = highlight.stories[j];
            
            // Current URL: https://cdn.../assets/instagram/stories/FolderName/001_filename.ext
            let parts = story.url.split('/');
            let filename = parts[parts.length - 1];
            
            let newUrl = `${cdnBaseUrl}/${encodeURIComponent(targetGroupFolder)}/${filename}`;
            
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
    
    console.log(`Renamed ${movedFolders} folders.`);
    
    console.log("Writing updated stories.json...");
    fs.writeFileSync(storiesJsonPath, JSON.stringify(storiesData, null, 2), 'utf8');
    console.log("Done.");
}

main().catch(console.error);
