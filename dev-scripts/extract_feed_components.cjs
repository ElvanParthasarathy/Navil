const fs = require('fs');

const content = fs.readFileSync('src/pages/main/Archive.tsx', 'utf8');

const getComponent = (startLine, endLine) => {
    return content.split('\n').slice(startLine - 1, endLine).join('\n');
}

// Extract utils
const stripHtmlContent = getComponent(21, 31);
const formatArtDateContent = getComponent(33, 62);
const utilsFile = "export " + stripHtmlContent + "\n\nexport " + formatArtDateContent + "\n";
fs.writeFileSync('src/components/archive/archiveUtils.ts', utilsFile);

// Extract Feed components
const mediaLoaderContent = getComponent(355, 513);
const truncatedCaptionContent = getComponent(514, 553);
const feedItemMediaContent = getComponent(555, 635);

const feedComponentsFile = "import React, { useState, useEffect, useRef } from 'react';\n" +
"import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';\n" +
"import { stripHtml, formatArtDate } from './archiveUtils';\n\n" +
"export " + mediaLoaderContent + "\n\nexport " + truncatedCaptionContent + "\n\nexport " + feedItemMediaContent + "\n";

fs.writeFileSync('src/components/archive/FeedComponents.tsx', feedComponentsFile);

let newContent = content.split('\n');

// Remove from Archive.tsx
// Note: removing from bottom up to avoid line shifts
newContent.splice(354, 281); // removes 355 to 635

// Remove utils
newContent.splice(20, 42); // removes 21 to 62

// Add imports
newContent.splice(6, 0, "import { stripHtml, formatArtDate } from '../../components/archive/archiveUtils';\nimport { MediaLoader, TruncatedCaption, FeedItemMedia } from '../../components/archive/FeedComponents';");

fs.writeFileSync('src/pages/main/Archive.tsx', newContent.join('\n'));

console.log("Extracted Feed components perfectly.");
