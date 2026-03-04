
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const REPO_DIR = 'D:/Projects/Elvan';
const MEDIA_DIR = 'D:/Projects/Elvan/Elvanmedia';
const DATA_DIR = path.join(REPO_DIR, 'src/data');

const jsonFiles = ['posts.json', 'stories.json', 'reels.json', 'arts.json', 'archived.json', 'profile.json'];

async function checkLinks() {
    console.log('Scanning media files...');
    const actualFiles = await glob('assets/instagram/**/*.*', { cwd: MEDIA_DIR });
    const fileMap = new Map();
    actualFiles.forEach(f => {
        const normalized = f.replace(/\\/g, '/');
        const stem = path.basename(normalized, path.extname(normalized));
        fileMap.set(stem, normalized);
    });

    console.log(`Mapped ${fileMap.size} files.`);

    const report = [];

    for (const fileName of jsonFiles) {
        const filePath = path.join(DATA_DIR, fileName);
        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf8');
        let data = JSON.parse(content);

        const items = Array.isArray(data) ? data : [data];

        items.forEach((item) => {
            const urls = [];
            if (item.image) urls.push({ key: 'image', url: item.image });
            if (item.profilePic) urls.push({ key: 'profilePic', url: item.profilePic });
            if (item.url && typeof item.url === 'string' && item.url.includes('jsdelivr')) urls.push({ key: 'url', url: item.url });
            if (item.images && Array.isArray(item.images)) {
                item.images.forEach((u, i) => urls.push({ key: `images[${i}]`, url: u }));
            }

            urls.forEach(({ key, url }) => {
                if (!url.includes('jsdelivr')) return;

                const parts = url.split('/');
                const lastPart = parts[parts.length - 1];
                const stem = path.basename(lastPart, path.extname(lastPart));
                const currentExt = path.extname(lastPart);

                if (fileMap.has(stem)) {
                    const actualPath = fileMap.get(stem);
                    const actualExt = path.extname(actualPath);

                    if (currentExt.toLowerCase() !== actualExt.toLowerCase()) {
                        report.push({
                            file: fileName,
                            id: item.id || 'N/A',
                            key,
                            current: lastPart,
                            actual: path.basename(actualPath),
                            reason: 'Extension Mismatch'
                        });
                    }
                } else {
                    report.push({
                        file: fileName,
                        id: item.id || 'N/A',
                        key,
                        current: lastPart,
                        actual: 'NOT FOUND',
                        reason: 'File Missing'
                    });
                }
            });
        });
    }

    const issues = report.filter(r => r.reason === 'Extension Mismatch');
    const missingTrully = report.filter(r => r.reason === 'File Missing');
    const heic = report.filter(r => r.actual.endsWith('.heic'));

    const finalReport = {
        summary: {
            uniqueMediaStems: fileMap.size,
            extensionMismatches: issues.length,
            trulyMissing: missingTrully.length,
            heicFiles: heic.length
        },
        issues,
        missing: missingTrully,
        heic
    };

    fs.writeFileSync(path.join(REPO_DIR, 'diagnose_report.json'), JSON.stringify(finalReport, null, 2));
    console.log(`\n✅ Full report saved to diagnose_report.json`);
}

checkLinks();
