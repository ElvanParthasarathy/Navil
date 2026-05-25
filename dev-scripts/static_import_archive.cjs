const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("const Archive = lazyWithRetry(() => import('./pages/main/Archive'));", "import Archive from './pages/main/Archive';");
content = content.replace("{ path: 'archive', element: <Suspense fallback={<ArchiveSkeleton />}><Archive /></Suspense> },", "{ path: 'archive', element: <Archive /> },");
content = content.replace("{ path: \"archive\", element: <Suspense fallback={<ArchiveSkeleton />}><Archive /></Suspense> },", "{ path: \"archive\", element: <Archive /> },");
fs.writeFileSync(file, content);
console.log('Archive is now statically imported!');
