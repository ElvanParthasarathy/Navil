const fs = require('fs');
const path = require('path');

const fileMap = {
  // src/components/
  'src/components/AdBanner.tsx': 'src/components/ui/AdBanner.tsx',
  'src/components/ConfirmDialog.tsx': 'src/components/ui/ConfirmDialog.tsx',
  'src/components/Engagement.tsx': 'src/components/ui/Engagement.tsx',
  'src/components/FloatingBackButton.tsx': 'src/components/ui/FloatingBackButton.tsx',
  'src/components/HighlightBar.tsx': 'src/components/ui/HighlightBar.tsx',
  'src/components/MobileTopBar.tsx': 'src/components/ui/MobileTopBar.tsx',
  
  'src/components/CategoryListView.tsx': 'src/components/features/CategoryListView.tsx',
  'src/components/ReadingView.tsx': 'src/components/features/ReadingView.tsx',
  'src/components/ReelsViewer.tsx': 'src/components/features/ReelsViewer.tsx',
  'src/components/StoriesListView.tsx': 'src/components/features/StoriesListView.tsx',
  'src/components/StoryViewer.tsx': 'src/components/features/StoryViewer.tsx',
  'src/components/WritingPage.tsx': 'src/components/features/WritingPage.tsx',

  'src/components/GlobalErrorBoundary.tsx': 'src/components/core/GlobalErrorBoundary.tsx',

  // src/components/admin/
  'src/components/admin/AboutEditor.tsx': 'src/components/admin/editors/AboutEditor.tsx',
  'src/components/admin/ArtEditor.tsx': 'src/components/admin/editors/ArtEditor.tsx',
  'src/components/admin/ArticleEditor.tsx': 'src/components/admin/editors/ArticleEditor.tsx',
  'src/components/admin/BlogEditor.tsx': 'src/components/admin/editors/BlogEditor.tsx',
  'src/components/admin/DiaryEditor.tsx': 'src/components/admin/editors/DiaryEditor.tsx',
  'src/components/admin/PoemEditor.tsx': 'src/components/admin/editors/PoemEditor.tsx',
  'src/components/admin/ProfileEditor.tsx': 'src/components/admin/editors/ProfileEditor.tsx',
  'src/components/admin/QuoteEditor.tsx': 'src/components/admin/editors/QuoteEditor.tsx',
  'src/components/admin/StoryEditor.tsx': 'src/components/admin/editors/StoryEditor.tsx',
  'src/components/admin/RichTextEditor.tsx': 'src/components/admin/editors/RichTextEditor.tsx',
  'src/components/admin/StandardListEditor.tsx': 'src/components/admin/editors/StandardListEditor.tsx',
  'src/components/admin/VariantListEditor.tsx': 'src/components/admin/editors/VariantListEditor.tsx',

  'src/components/admin/AdminDashboard.tsx': 'src/components/admin/dashboard/AdminDashboard.tsx',
  'src/components/admin/AdminLogin.tsx': 'src/components/admin/dashboard/AdminLogin.tsx',

  'src/components/admin/AdminShared.tsx': 'src/components/admin/shared/AdminShared.tsx',
  'src/components/admin/ConfirmDialog.tsx': 'src/components/admin/shared/ConfirmDialog.tsx',

  'src/components/admin/BookMakerView.tsx': 'src/components/admin/views/BookMakerView.tsx',

  'src/components/admin/TesterPanelBackup.tsx': 'src/components/admin/backup/TesterPanelBackup.tsx',
  'src/components/admin/VariantListEditor.backup.tsx': 'src/components/admin/backup/VariantListEditor.backup.tsx',

  // src/pages/
  'src/pages/About.tsx': 'src/pages/main/About.tsx',
  'src/pages/Archive.tsx': 'src/pages/main/Archive.tsx',
  'src/pages/Arts.tsx': 'src/pages/main/Arts.tsx',
  'src/pages/ArtsGallery.tsx': 'src/pages/main/ArtsGallery.tsx',
  'src/pages/Home.tsx': 'src/pages/main/Home.tsx',
  'src/pages/Portfolio.tsx': 'src/pages/main/Portfolio.tsx',
  'src/pages/Settings.tsx': 'src/pages/main/Settings.tsx',
  'src/pages/Teaching.tsx': 'src/pages/main/Teaching.tsx',

  'src/pages/Home2.tsx': 'src/pages/deprecated/Home2.tsx',
  'src/pages/Home_Old.tsx': 'src/pages/deprecated/Home_Old.tsx',

  'src/pages/VocoderView.tsx': 'src/pages/tools/VocoderView.tsx',
};

const root = __dirname;
const srcDir = path.join(root, 'src');

// Map without extensions for resolving imports
const exactPathMap = {};
for (const [oldRel, newRel] of Object.entries(fileMap)) {
    const oldAbs = path.join(root, oldRel.replace(/\//g, path.sep));
    const newAbs = path.join(root, newRel.replace(/\//g, path.sep));
    exactPathMap[oldAbs] = newAbs;
}

const noExtMap = {};
for (const [oldAbs, newAbs] of Object.entries(exactPathMap)) {
    const oldNoExt = oldAbs.replace(/\.tsx?$/, '');
    const newNoExt = newAbs.replace(/\.tsx?$/, '');
    noExtMap[oldNoExt] = newNoExt;
}

function resolveDependencyPath(currentOldDir, importString) {
    if (!importString.startsWith('.')) return null;
    let depOldAbsPath = path.resolve(currentOldDir, importString);
    
    // Check if it exactly matches something (though imports usually lack .tsx)
    if (noExtMap[depOldAbsPath]) {
        return noExtMap[depOldAbsPath];
    }
    
    // If it points to an index file (e.g. './admin' -> './admin/index')
    const indexFallback = path.join(depOldAbsPath, 'index');
    if (noExtMap[indexFallback]) {
        // Not changing how directory imports work unless the index was moved (unlikely here)
        return null; 
    }
    
    return depOldAbsPath; // Dependency wasn't moved, so its "new" path is its old path
}

function normalizeImport(fromDir, toAbsPath) {
    let rel = path.relative(fromDir, toAbsPath);
    rel = rel.replace(/\\/g, '/');
    if (!rel.startsWith('.')) {
        rel = './' + rel;
    }
    return rel;
}

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

function updateFileImports(currentAbsPath, originalAbsPath) {
    let content = fs.readFileSync(currentAbsPath, 'utf8');
    const originalDir = path.dirname(originalAbsPath);
    const newDir = path.dirname(currentAbsPath);

    let changed = false;

    // Regex to match imports and exports
    // import Something from './path'
    // export * from './path'
    const importRegex = /((?:import|export)\s+[^'"]*?from\s+['"])([^'"]+)(['"])/g;
    const dynamicImportRegex = /(import\(['"])([^'"]+)(['"]\))/g;

    const replacer = (match, p1, importString, p3) => {
        if (!importString.startsWith('.')) return match; // Leave node_modules alone
        
        let depNewAbsPath = resolveDependencyPath(originalDir, importString);
        if (!depNewAbsPath) return match;

        let newImportString = normalizeImport(newDir, depNewAbsPath);
        if (importString !== newImportString) {
            console.log(`  Updating import: ${importString} -> ${newImportString}`);
            changed = true;
            return p1 + newImportString + p3;
        }
        return match;
    };

    content = content.replace(importRegex, replacer);
    content = content.replace(dynamicImportRegex, replacer);

    if (changed) {
        fs.writeFileSync(currentAbsPath, content, 'utf8');
    }
}

// 1. Move files
console.log("Moving files...");
for (const [oldAbs, newAbs] of Object.entries(exactPathMap)) {
    if (fs.existsSync(oldAbs)) {
        const newDir = path.dirname(newAbs);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
        }
        fs.renameSync(oldAbs, newAbs);
        console.log(`Moved: ${path.relative(root, oldAbs)} -> ${path.relative(root, newAbs)}`);
    } else if (!fs.existsSync(newAbs)) {
        console.log(`WARNING: Original file not found and target not found: ${oldAbs}`);
    }
}

// 2. Scan all files and update imports
console.log("\nUpdating imports...");
const allFiles = getAllTsFiles(srcDir);

// Build reverse map to find the original path of any file
const currentToOriginalMap = {};
for (const [oldAbs, newAbs] of Object.entries(exactPathMap)) {
    currentToOriginalMap[newAbs] = oldAbs;
}

for (const fileAbsPath of allFiles) {
    const originalAbsPath = currentToOriginalMap[fileAbsPath] || fileAbsPath;
    updateFileImports(fileAbsPath, originalAbsPath);
}

// Update App.tsx or main.tsx which might have moved routes
console.log("\nDone!");
