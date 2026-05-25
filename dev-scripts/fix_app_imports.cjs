const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import Home from './pages/Home';", "import Home from './pages/main/Home';");
content = content.replace("import About from './pages/About';", "import About from './pages/main/About';");
content = content.replace("import Portfolio from './pages/Portfolio';", "import Portfolio from './pages/main/Portfolio';");
content = content.replace("import Settings from './pages/Settings';", "import Settings from './pages/main/Settings';");
content = content.replace("import Teaching from './pages/Teaching';", "import Teaching from './pages/main/Teaching';");
content = content.replace("import Arts from './pages/Arts';", "import Arts from './pages/main/Arts';");
content = content.replace("import ArtsGallery from './pages/ArtsGallery';", "import ArtsGallery from './pages/main/ArtsGallery';");

content = content.replace("import VocoderView from './pages/VocoderView';", "import VocoderView from './pages/tools/VocoderView';");

content = content.replace("import CategoryListView from './components/CategoryListView';", "import CategoryListView from './components/features/CategoryListView';");
content = content.replace("import ReadingView from './components/ReadingView';", "import ReadingView from './components/features/ReadingView';");

// Make Archive static imported
content = content.replace("const Archive = lazyWithRetry(() => import('./pages/main/Archive'));", "import Archive from './pages/main/Archive';");
content = content.replace("const Archive = lazyWithRetry(() => import('./pages/Archive'));", "import Archive from './pages/main/Archive';");

// Remove Suspense
content = content.replace('{ path: "archive", element: <Suspense fallback={<ArchiveSkeleton />}><Archive /></Suspense> },', '{ path: "archive", element: <Archive /> },');

fs.writeFileSync(file, content);
console.log('App.tsx imports fixed!');
