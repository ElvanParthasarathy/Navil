const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllTsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllTsFiles(fullPath, fileList);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const allFiles = getAllTsFiles(srcDir);
const usedFiles = new Set();

const entryPoints = [
    path.join(srcDir, 'main.tsx'),
    path.join(srcDir, 'admin-main.tsx'),
];

// Add dev-tools to used explicitly so they aren't deleted
const devToolsDir = path.join(srcDir, 'dev-tools');
if (fs.existsSync(devToolsDir)) {
    const devFiles = getAllTsFiles(devToolsDir);
    devFiles.forEach(f => entryPoints.push(f));
}

function resolveImport(currentFile, importString) {
    if (!importString.startsWith('.')) return null;
    let base = path.resolve(path.dirname(currentFile), importString);
    
    // Check possible extensions
    const exts = ['.tsx', '.ts', '/index.tsx', '/index.ts'];
    if (allFiles.includes(base)) return base;
    
    for (let ext of exts) {
        if (allFiles.includes(base + ext)) {
            return base + ext;
        }
    }
    return null;
}

function trace(file) {
    if (usedFiles.has(file)) return;
    usedFiles.add(file);
    
    let content;
    try {
        content = fs.readFileSync(file, 'utf8');
    } catch(e) { return; }
    
    const importRegex = /((?:import|export)\s+[^'"]*?from\s+['"])([^'"]+)(['"])/g;
    const dynamicImportRegex = /(import\(['"])([^'"]+)(['"]\))/g;
    const cssImportRegex = /import\s+['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const target = resolveImport(file, match[2]);
        if (target) trace(target);
    }
    while ((match = dynamicImportRegex.exec(content)) !== null) {
        const target = resolveImport(file, match[2]);
        if (target) trace(target);
    }
}

entryPoints.forEach(ep => trace(ep));

const unused = allFiles.filter(f => !usedFiles.has(f) && !f.endsWith('.d.ts'));

console.log("Unused files:");
unused.forEach(f => console.log(path.relative(__dirname, f)));
