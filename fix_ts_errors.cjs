const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        if (typeof search === 'string') {
            content = content.replace(search, replace);
        } else {
            content = content.replace(search, replace);
        }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

const basePath = path.join(__dirname, 'src', 'components', 'admin');

// 1. AdminLogin.tsx
replaceInFile(path.join(basePath, 'AdminLogin.tsx'), [
    [/InputProps=\{/g, 'slotProps={{ input: '],
    [/\}\}/g, '}} }']
]);
// Wait, regex might break other things. Let me just replace the exact line.
let loginContent = fs.readFileSync(path.join(basePath, 'AdminLogin.tsx'), 'utf8');
loginContent = loginContent.replace('InputProps={{', 'slotProps={{ input: {');
loginContent = loginContent.replace('}}', '}}}'); 
// Ah wait, it's safer to use regex carefully.
loginContent = loginContent.replace(/InputProps=\{\{([\s\S]*?)\}\}/, 'slotProps={{ input: {$1} }}');
fs.writeFileSync(path.join(basePath, 'AdminLogin.tsx'), loginContent, 'utf8');

// 2. AdminShared.tsx
let sharedContent = fs.readFileSync(path.join(basePath, 'AdminShared.tsx'), 'utf8');
sharedContent = sharedContent.replace(/inputProps=\{\{([\s\S]*?)\}\}/g, 'slotProps={{ htmlInput: {$1} }}');
fs.writeFileSync(path.join(basePath, 'AdminShared.tsx'), sharedContent, 'utf8');

// 3. ConfirmDialog.tsx
let confirmContent = fs.readFileSync(path.join(basePath, 'ConfirmDialog.tsx'), 'utf8');
confirmContent = confirmContent.replace(/PaperProps=\{\{([\s\S]*?)\}\}/g, 'slotProps={{ paper: {$1} }}');
fs.writeFileSync(path.join(basePath, 'ConfirmDialog.tsx'), confirmContent, 'utf8');

// 4. ProfileEditor.tsx
let profileContent = fs.readFileSync(path.join(basePath, 'ProfileEditor.tsx'), 'utf8');
profileContent = profileContent.replace(/<Grid (xs=\{[0-9]+\})/g, '<Grid item $1');
profileContent = profileContent.replace(/<Grid (xs=\{[0-9]+\} sm=\{[0-9]+\})/g, '<Grid item $1');
fs.writeFileSync(path.join(basePath, 'ProfileEditor.tsx'), profileContent, 'utf8');

// 5. StoryEditor.tsx
let storyContent = fs.readFileSync(path.join(basePath, 'StoryEditor.tsx'), 'utf8');
storyContent = storyContent.replace(/<Grid (xs=\{[0-9]+\} sm=\{[0-9]+\} md=\{[0-9]+\} lg=\{[0-9]+\})/g, '<Grid item $1');
fs.writeFileSync(path.join(basePath, 'StoryEditor.tsx'), storyContent, 'utf8');

console.log('Fixed TypeScript errors.');
