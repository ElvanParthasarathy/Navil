
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const REPO_DIR = 'D:/Projects/Elvan';
const MEDIA_DIR = 'D:/Projects/Elvan/Elvanmedia';
const DATA_DIR = path.join(REPO_DIR, 'src/data');

const jsonFiles = ['posts.json', 'stories.json', 'reels.json', 'arts.json', 'archived.json', 'profile.json'];

async function fixExtensionMismatches() {
    console.log('Scanning media files for extension mapping...');
    const actualFiles = await glob('assets/instagram/**/*.*', { cwd: MEDIA_DIR });
    const fileMap = new Map();
    actualFiles.forEach(f => {
        const normalized = f.replace(/\\/g, '/');
        const stem = path.basename(normalized, path.extname(normalized));
        fileMap.set(stem, normalized);
    });

    console.log(`Mapped ${fileMap.size} files.`);

    for (const fileName of jsonFiles) {
        const filePath = path.join(DATA_DIR, fileName);
        if (!fs.existsSync(filePath)) continue;

        console.log(`Processing ${fileName}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        let data = JSON.parse(content);

        let modified = false;

        const processItem = (item) => {
            const keysToCheck = ['image', 'profilePic', 'url', 'cover'];
            keysToCheck.forEach(key => {
                if (item[key] && typeof item[key] === 'string' && item[key].includes('jsdelivr')) {
                    const url = item[key];
                    const parts = url.split('/');
                    const lastPart = parts[parts.length - 1];
                    const stem = path.basename(lastPart, path.extname(lastPart));
                    const currentExt = path.extname(lastPart);

                    if (fileMap.has(stem)) {
                        const actualPath = fileMap.get(stem);
                        const actualExt = path.extname(actualPath);

                        if (currentExt.toLowerCase() !== actualExt.toLowerCase()) {
                            console.log(`  Updating ${key}: ${lastPart} -> ${path.basename(actualPath)}`);
                            const newUrl = url.substring(0, url.lastIndexOf('/') + 1) + path.basename(actualPath);
                            item[key] = newUrl;
                            modified = true;
                        }
                    }
                }
            });

            if (item.images && Array.isArray(item.images)) {
                item.images.forEach((url, i) => {
                    if (typeof url === 'string' && url.includes('jsdelivr')) {
                        const parts = url.split('/');
                        const lastPart = parts[parts.length - 1];
                        const stem = path.basename(lastPart, path.extname(lastPart));
                        const currentExt = path.extname(lastPart);

                        if (fileMap.has(stem)) {
                            const actualPath = fileMap.get(stem);
                            const actualExt = path.extname(actualPath);

                            if (currentExt.toLowerCase() !== actualExt.toLowerCase()) {
                                console.log(`  Updating images[${i}]: ${lastPart} -> ${path.basename(actualPath)}`);
                                const newUrl = url.substring(0, url.lastIndexOf('/') + 1) + path.basename(actualPath);
                                item.images[i] = newUrl;
                                modified = true;
                            }
                        }
                    }
                });
            }
        };

        if (Array.isArray(data)) {
            data.forEach(processItem);
        } else {
            processItem(data);
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`✅ Saved changes to ${fileName}`);
        } else {
            console.log(`  No changes needed for ${fileName}`);
        }
    }
}

fixExtensionMismatches();
