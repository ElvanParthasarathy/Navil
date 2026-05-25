const fs = require('fs');
const path = require('path');
const appFile = path.join(__dirname, '../src/App.tsx');
const cssFile = path.join(__dirname, '../src/pages/main/Archive.css');

// Read App.tsx and remove style block
let appContent = fs.readFileSync(appFile, 'utf8');
const styleBlock = \<style>{\\\\n            @keyframes skeletonShimmer {\n                0% { background-position: -400px 0; }\n                100% { background-position: 400px 0; }\n            }\n            .skel {\n                background: linear-gradient(90deg, var(--bg-panel) 25%, color-mix(in srgb, var(--text-main) 6%, var(--bg-panel)) 50%, var(--bg-panel) 75%);\n                background-size: 800px 100%;\n                animation: skeletonShimmer 1.5s ease-in-out infinite;\n                border-radius: 8px;\n            }\n        \\\}</style>\;
appContent = appContent.replace(styleBlock, '');
fs.writeFileSync(appFile, appContent);

// Append to Archive.css
let cssContent = fs.readFileSync(cssFile, 'utf8');
cssContent += \\n\n/* Shimmer Skeleton Global Styles */\n@keyframes skeletonShimmer {\n    0% { background-position: -400px 0; }\n    100% { background-position: 400px 0; }\n}\n.skel {\n    background: linear-gradient(90deg, var(--bg-panel) 25%, color-mix(in srgb, var(--text-main) 6%, var(--bg-panel)) 50%, var(--bg-panel) 75%);\n    background-size: 800px 100%;\n    animation: skeletonShimmer 1.5s ease-in-out infinite;\n    border-radius: 8px;\n}\n\;
fs.writeFileSync(cssFile, cssContent);
console.log('skel CSS extracted globally!');
