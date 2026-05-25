const fs = require('fs');
const path = require('path');

const filesToProcess = [
    'src/App.tsx',
    'src/pages/main/ArtsGallery.tsx',
    'src/pages/Writings.tsx'
];

filesToProcess.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');
    let cssAccumulator = '';
    
    // We will find <style>{`...`}</style> blocks.
    // They might be written as <style>{` or <style>{`\n or <style dangerouslySetInnerHTML={{ __html: `
    // The simplest way to handle this generically is to use a regex to match all <style>...</style> blocks.
    
    const styleRegex = /<style[^>]*>\{`([\s\S]*?)`\}<\/style>/g;
    
    let match;
    let newContent = content;
    
    while ((match = styleRegex.exec(content)) !== null) {
        cssAccumulator += match[1] + '\n\n';
        newContent = newContent.replace(match[0], '');
    }

    if (cssAccumulator.trim().length > 0) {
        const parsedPath = path.parse(fullPath);
        const cssFilename = parsedPath.name + '.css';
        const cssPath = path.join(parsedPath.dir, cssFilename);
        
        let existingCss = '';
        if (fs.existsSync(cssPath)) {
            existingCss = fs.readFileSync(cssPath, 'utf8') + '\n\n';
        }
        
        fs.writeFileSync(cssPath, existingCss + cssAccumulator.trim());
        
        // Add import to TSX file if not exists
        const importStatement = `import './${cssFilename}';`;
        if (!newContent.includes(importStatement)) {
            // Find the last import statement to insert after it
            const importRegex = /^import\s+.*$/gm;
            let lastImportMatch;
            let lastIndex = 0;
            while ((lastImportMatch = importRegex.exec(newContent)) !== null) {
                lastIndex = lastImportMatch.index + lastImportMatch[0].length;
            }
            
            if (lastIndex > 0) {
                newContent = newContent.slice(0, lastIndex) + '\n' + importStatement + newContent.slice(lastIndex);
            } else {
                newContent = importStatement + '\n' + newContent;
            }
        }
        
        fs.writeFileSync(fullPath, newContent);
        console.log(`Extracted styles from ${file} into ${cssFilename}`);
    }
});
