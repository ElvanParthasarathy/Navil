const fs = require('fs');
const path = require('path');

const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', '.venv', '__pycache__', '.vscode', 'Elvanmedia'];
const EXCLUDED_FILES = ['package-lock.json', 'rename_admin.js', 'tsconfig.node.tsbuildinfo', 'tsconfig.tsbuildinfo'];

function processPath(currentPath) {
    const stat = fs.statSync(currentPath);
    const base = path.basename(currentPath);

    if (EXCLUDED_DIRS.includes(base)) return;
    if (EXCLUDED_FILES.includes(base)) return;

    if (stat.isDirectory()) {
        const children = fs.readdirSync(currentPath);
        for (const child of children) {
            processPath(path.join(currentPath, child));
        }

        if (base.includes('admin') || base.includes('Admin') || base.includes('ADMIN')) {
            const newBase = base
                .replace(/admin/g, 'nirvaagi')
                .replace(/Admin/g, 'Nirvaagi')
                .replace(/ADMIN/g, 'NIRVAAGI');
            const newPath = path.join(path.dirname(currentPath), newBase);
            fs.renameSync(currentPath, newPath);
            console.log(`Renamed dir: ${currentPath} -> ${newPath}`);
        }
    } else {
        const ext = path.extname(base).toLowerCase();
        const ALLOWED_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.json', '.env', ''];
        
        if (ALLOWED_EXTS.includes(ext) || base === '.env' || base === '.env.local') {
            try {
                let content = fs.readFileSync(currentPath, 'utf8');
                const newContent = content
                    .replace(/admin/g, 'nirvaagi')
                    .replace(/Admin/g, 'Nirvaagi')
                    .replace(/ADMIN/g, 'NIRVAAGI');
                
                if (content !== newContent) {
                    fs.writeFileSync(currentPath, newContent, 'utf8');
                    console.log(`Updated file: ${currentPath}`);
                }
            } catch (err) {
                console.error(`Could not process ${currentPath}:`, err);
            }
        }

        if (base.includes('admin') || base.includes('Admin') || base.includes('ADMIN')) {
            const newBase = base
                .replace(/admin/g, 'nirvaagi')
                .replace(/Admin/g, 'Nirvaagi')
                .replace(/ADMIN/g, 'NIRVAAGI');
            const newPath = path.join(path.dirname(currentPath), newBase);
            fs.renameSync(currentPath, newPath);
            console.log(`Renamed file: ${currentPath} -> ${newPath}`);
        }
    }
}

processPath(__dirname);
