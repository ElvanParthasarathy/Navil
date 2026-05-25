const fs = require('fs');
let content = fs.readFileSync('src/pages/main/Archive.tsx', 'utf8');

const getBlock = (startStr, endStr) => {
    const s = content.indexOf(startStr);
    if (s === -1) return null;
    const e = content.indexOf(endStr, s);
    if (e === -1) return null;
    return content.substring(s, e);
};

// 1. ArchiveProfileHeader
const headerStart = '            {/* --- PROFILE HEADER --- */}';
const headerEnd = '            {/* --- HIGHLIGHTS --- */}';
const headerBlock = getBlock(headerStart, headerEnd);

if (headerBlock) {
    fs.writeFileSync('src/components/archive/ArchiveProfileHeader.tsx', 
"import React from 'react';\n" +
"import { FiHeart, FiMessageCircle, FiLayers, FiPlay } from 'react-icons/react-icons/fi'; // fix imports\n" +
"import profilePic from '../../assets/instagram/profile.jpg';\n\n" +
"export const ArchiveProfileHeader = ({ profileData, counts }: any) => (\n  <>\n" + headerBlock + "  </>\n);\n");
    content = content.replace(headerBlock, "            <ArchiveProfileHeader profileData={profileData} counts={{ posts: posts.length, reels: reels.length, arts: arts.length, archived: archivedPosts.length }} />\n");
}

fs.writeFileSync('src/pages/main/Archive.tsx', content);
console.log('Extracted components.');
