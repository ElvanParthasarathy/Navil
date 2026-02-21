import { execSync } from 'child_process';
import { glob } from 'glob';
import path from 'path';

const REPO_DIR = 'D:/Projects/Elvan/Elvanmedia';

const runCmd = (cmd) => {
    try {
        console.log(`Running: ${cmd}`);
        execSync(cmd, { cwd: REPO_DIR, stdio: 'inherit' });
    } catch (e) {
        console.log(`Failed (ignored): ${cmd}`);
    }
};

const pushInBatches = async () => {
    console.log('--- Starting Safe Single-File Media Upload ---');

    // We only need to push reels and stories
    const folders = ['assets/instagram/reels', 'assets/instagram/stories'];

    for (const folder of folders) {
        console.log(`\nProcessing folder: ${folder}`);
        const files = await glob('**/*.*', { cwd: path.join(REPO_DIR, folder) });

        let count = 1;
        for (const file of files) {
            const filePath = `${folder}/${file}`.replace(/\\/g, '/');
            console.log(`\nFile ${count++} of ${files.length} in ${folder}: ${filePath}`);

            runCmd(`git add "${filePath}"`);

            try {
                execSync(`git commit -m "Upload ${filePath}"`, { cwd: REPO_DIR });
                console.log(`Commit successful.`);

                let pushSuccess = false;
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        execSync('git push -u origin main', { cwd: REPO_DIR, stdio: 'inherit' });
                        pushSuccess = true;
                        break;
                    } catch (e) {
                        console.log(`Push failed on attempt ${attempt}. Retrying...`);
                    }
                }

                if (!pushSuccess) {
                    console.error("FATAL: Failed to push after 3 attempts.");
                    process.exit(1);
                }
            } catch (e) {
                console.log(`Skipping push (already committed or no changes)`);
            }
        }
    }
    console.log('✅ Upload completed successfully.');
};

pushInBatches();
