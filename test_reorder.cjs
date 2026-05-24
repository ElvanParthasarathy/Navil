const fs = require('fs');
const path = require('path');

const storiesData = JSON.parse(fs.readFileSync('./src/data/stories.json', 'utf8'));
const elvanMediaDir = path.join(__dirname, 'Elvanmedia');

let missingFiles = 0;
let totalFiles = 0;

storiesData.forEach(highlight => {
    highlight.stories.forEach((story, idx) => {
        totalFiles++;
        
        let relPath = story.url.split('Elvanmedia@main/')[1];
        if (!relPath) {
            console.log("Unrecognized URL format: " + story.url);
            missingFiles++;
            return;
        }
        
        const absoluteOldPath = path.join(elvanMediaDir, relPath);
        if (!fs.existsSync(absoluteOldPath)) {
            console.log("File not found on disk: " + absoluteOldPath);
            missingFiles++;
        }
    });
});

console.log(`Total stories in JSON: ${totalFiles}`);
console.log(`Missing files on disk: ${missingFiles}`);
