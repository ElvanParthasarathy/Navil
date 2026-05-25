const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("import GlobalErrorBoundary from './components/GlobalErrorBoundary';", "import GlobalErrorBoundary from './components/core/GlobalErrorBoundary';");
content = content.replace("import AdBanner from './components/AdBanner';", "import AdBanner from './components/ui/AdBanner';");
fs.writeFileSync(file, content);
console.log('App.tsx imports fixed part 3!');
