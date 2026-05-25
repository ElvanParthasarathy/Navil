const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("import Home2 from './pages/Home2';", "import Home2 from './legacy/Home2';");
fs.writeFileSync(file, content);
console.log('App.tsx imports fixed part 2!');
