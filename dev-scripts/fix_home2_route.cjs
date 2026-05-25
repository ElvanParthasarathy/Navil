const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("{ path: "home2", element: <Home2 /> },", "");
fs.writeFileSync(file, content);
console.log('Home2 route removed!');
