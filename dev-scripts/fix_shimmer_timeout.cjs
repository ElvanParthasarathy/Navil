const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/pages/main/Archive.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("setTimeout(() => setIsMounting(false), 50);", "setTimeout(() => setIsMounting(false), 400);");
fs.writeFileSync(file, content);
console.log('Timeout increased!');
