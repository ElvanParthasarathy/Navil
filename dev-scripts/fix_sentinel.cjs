const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/pages/main/Archive.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("rootMargin: '400px'", "rootMargin: '50px'");
content = content.replace('if (entry.isIntersecting) onLoadMore();', 'if (entry.isIntersecting) setTimeout(onLoadMore, 100);');
fs.writeFileSync(file, content);
console.log('Fixed InfiniteSentinel');
