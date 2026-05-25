const fs = require('fs');

const content = fs.readFileSync('src/pages/main/Archive.tsx', 'utf8');

const getComponent = (startLine, endLine) => {
    return content.split('\n').slice(startLine - 1, endLine).join('\n');
}

const lazyGridItemContent = getComponent(71, 140);
const lazyGridItemFile = "import React, { useState, useEffect, useRef } from 'react';\n" +
"import { FiPlay, FiLayers } from 'react-icons/fi';\n\n" + 
"// Move getThumbnailUrl here or import it if shared\n" +
getComponent(65, 69) + "\n\n" +
lazyGridItemContent.replace('const LazyGridItem =', 'export default function LazyGridItem') + "\n";

fs.writeFileSync('src/components/archive/LazyGridItem.tsx', lazyGridItemFile);

const infiniteSentinelContent = getComponent(142, 152);
const infiniteSentinelFile = "import React, { useEffect, useRef } from 'react';\n\n" + 
infiniteSentinelContent.replace('const InfiniteSentinel =', 'export default function InfiniteSentinel') + "\n";

fs.writeFileSync('src/components/archive/InfiniteSentinel.tsx', infiniteSentinelFile);

let newContent = content.split('\n');
newContent.splice(64, 89); // Removes 65 to 153
newContent.splice(6, 0, "import LazyGridItem from '../../components/archive/LazyGridItem';\nimport InfiniteSentinel from '../../components/archive/InfiniteSentinel';");

fs.writeFileSync('src/pages/main/Archive.tsx', newContent.join('\n'));

console.log("Extracted components perfectly.");
