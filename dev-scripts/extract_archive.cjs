const fs = require('fs');
const path = require('path');
const tsxFile = path.join(__dirname, '../src/pages/main/Archive.tsx');
const cssFile = path.join(__dirname, '../src/pages/main/Archive.css');
let content = fs.readFileSync(tsxFile, 'utf8');
const styleRegex = /<style>\{`([\s\S]*?)`\}<\/style>/;
const match = content.match(styleRegex);
if(match) {
  fs.writeFileSync(cssFile, match[1].trim());
  content = content.replace(styleRegex, '');
  content = content.replace("import { Helmet } from 'react-helmet-async';", "import { Helmet } from 'react-helmet-async';\nimport './Archive.css';");
  fs.writeFileSync(tsxFile, content);
  console.log('Extracted to Archive.css');
} else { console.log('No style block found'); }
