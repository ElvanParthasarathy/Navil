const fs = require('fs');
let content = fs.readFileSync('src/pages/main/Archive.tsx', 'utf8');

// 1. Remove inline CSS and import Archive.css
const styleRegex = /<style>\{([\s\S]*?)\}<\/style>/;
content = content.replace(styleRegex, '');
content = content.replace("import { Helmet } from 'react-helmet-async';", "import { Helmet } from 'react-helmet-async';\nimport './Archive.css';");

// 2. Extract LazyGridItem & InfiniteSentinel
const getLines = (txt, start, end) => txt.split('\n').slice(start - 1, end).join('\n');
const originalLines = content.split('\n');

const lazyGridItemContent = getLines(content, 71, 140);
const infiniteSentinelContent = getLines(content, 142, 152);

// Remove them from content
let newContentLines = content.split('\n');
newContentLines.splice(64, 89); // Removes lines 65 to 153 (LazyGridItem + InfiniteSentinel + padding)

// Insert imports for them
newContentLines.splice(6, 0, "import LazyGridItem from '../../components/archive/LazyGridItem';\nimport InfiniteSentinel from '../../components/archive/InfiniteSentinel';");

content = newContentLines.join('\n');

// 3. Extract utils & FeedComponents
const stripHtmlContent = getLines(content, 22, 32); // Note: shifted by imports (+2 lines)
const formatArtDateContent = getLines(content, 34, 63);

// Let's find exactly where MediaLoader is now
newContentLines = content.split('\n');
const mediaLoaderStart = newContentLines.findIndex(l => l.includes('const MediaLoader ='));
const feedItemMediaEnd = newContentLines.findIndex(l => l.includes('const mobileFeedRef ='));

// Remove utils
const utilsStart = newContentLines.findIndex(l => l.includes('const stripHtml ='));
const utilsEnd = newContentLines.findIndex(l => l.includes('const getThumbnailUrl ='));
newContentLines.splice(utilsStart, utilsEnd - utilsStart);

// Recalculate component indices
const mStart = newContentLines.findIndex(l => l.includes('const MediaLoader ='));
const fEnd = newContentLines.findIndex(l => l.includes('const mobileFeedRef ='));

newContentLines.splice(mStart, fEnd - mStart);
newContentLines.splice(6, 0, "import { stripHtml, formatArtDate } from '../../components/archive/archiveUtils';\nimport { MediaLoader, TruncatedCaption, FeedItemMedia } from '../../components/archive/FeedComponents';");

fs.writeFileSync('src/pages/main/Archive.tsx', newContentLines.join('\n'));
console.log('Restored and extracted successfully.');
