const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/index.css');
let content = fs.readFileSync(file, 'utf8');
content = content.replace('    border-radius: 8px;\\n', '');
fs.writeFileSync(file, content);
console.log('Removed border-radius from index.css');
