const fs = require('fs');
let content = fs.readFileSync('src/pages/main/Archive.tsx', 'utf8');

// 1. Remove inline CSS
const styleRegex = /<style>\{([\s\S]*?)\}<\/style>/;
content = content.replace(styleRegex, '');
content = content.replace("import { Helmet } from 'react-helmet-async';", "import { Helmet } from 'react-helmet-async';\nimport './Archive.css';");

// 2. Extract LazyGridItem
const lazyGridStart = 'const LazyGridItem = ({ post, onClick }) => {';
const lazyGridEnd = '};\n\nconst InfiniteSentinel =';
const lazyGridIndex = content.indexOf(lazyGridStart);
const lazyGridEndIndex = content.indexOf(lazyGridEnd) + 2; // includes };
const lazyGridBlock = content.substring(lazyGridIndex, lazyGridEndIndex);

// 3. Extract InfiniteSentinel
const sentinelStart = 'const InfiniteSentinel = ({ onLoadMore }) => {';
const sentinelEnd = '};\n\nconst Archive =';
const sentinelIndex = content.indexOf(sentinelStart);
const sentinelEndIndex = content.indexOf(sentinelEnd) + 2;
const sentinelBlock = content.substring(sentinelIndex, sentinelEndIndex);

content = content.replace(lazyGridBlock, '');
content = content.replace(sentinelBlock, '');
content = content.replace("import './Archive.css';", "import './Archive.css';\nimport LazyGridItem from '../../components/archive/LazyGridItem';\nimport InfiniteSentinel from '../../components/archive/InfiniteSentinel';");

// 4. Extract FeedComponents (MediaLoader, TruncatedCaption, FeedItemMedia)
// They are inside Archive = () => { ... }
const mediaLoaderStart = '    const MediaLoader = ({ src, type,';
const feedItemEndBlock = '        );\n    };\n\n    const mobileFeedRef = useRef(null);';
const mediaLoaderIndex = content.indexOf(mediaLoaderStart);
const feedItemEndIndex = content.indexOf(feedItemEndBlock) + 16;
const feedComponentsBlock = content.substring(mediaLoaderIndex, feedItemEndIndex);

content = content.replace(feedComponentsBlock, '    const mobileFeedRef = useRef(null);');

// 5. Extract utils (stripHtml, formatArtDate, getThumbnailUrl)
const utilsStart = 'const stripHtml = (html) => {';
const utilsEndBlock = '};\n\nconst Archive =';
const utilsIndex = content.indexOf(utilsStart);
const utilsEndIndex = content.indexOf(utilsEndBlock); // ends before const Archive =
const utilsBlock = content.substring(utilsIndex, utilsEndIndex);

content = content.replace(utilsBlock, '');
content = content.replace("import InfiniteSentinel from '../../components/archive/InfiniteSentinel';", "import InfiniteSentinel from '../../components/archive/InfiniteSentinel';\nimport { stripHtml, formatArtDate } from '../../components/archive/archiveUtils';\nimport { MediaLoader, TruncatedCaption, FeedItemMedia } from '../../components/archive/FeedComponents';");

fs.writeFileSync('src/pages/main/Archive.tsx', content);
console.log('Restored and extracted successfully.');
