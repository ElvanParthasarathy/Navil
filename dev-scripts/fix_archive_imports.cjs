const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/pages/main/Archive.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix imports
content = content.replace(/from '\.\.\/components\/MobileTopBar'/g, "from '../../components/ui/MobileTopBar'");
content = content.replace(/from '\.\.\/components\/HighlightBar'/g, "from '../../components/ui/HighlightBar'");
content = content.replace(/from '\.\.\/components\/StoryViewer'/g, "from '../../components/features/StoryViewer'");
content = content.replace(/from '\.\.\/components\/ReelsViewer'/g, "from '../../components/features/ReelsViewer'");
content = content.replace(/from '\.\.\/components\/AdBanner'/g, "from '../../components/ui/AdBanner'");
content = content.replace(/from '\.\.\/dev-tools\/TempHighlightEditor'/g, "from '../../dev-tools/TempHighlightEditor'");
content = content.replace(/from '\.\.\/data\//g, "from '../../data/");
content = content.replace(/from '\.\.\/assets\//g, "from '../../assets/");

// Apply extract CSS
const styleRegex = /<style>\{`([\s\S]*?)`\}<\/style>/;
const match = content.match(styleRegex);
if(match) {
  fs.writeFileSync(path.join(__dirname, '../src/pages/main/Archive.css'), match[1].trim());
  content = content.replace(styleRegex, '');
  content = content.replace("import { Helmet } from 'react-helmet-async';", "import { Helmet } from 'react-helmet-async';\nimport './Archive.css';");
}

fs.writeFileSync(file, content);
console.log('Fixed imports and extracted CSS in Archive.tsx');
