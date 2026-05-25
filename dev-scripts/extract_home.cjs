const fs = require('fs');
let content = fs.readFileSync('src/pages/main/Home.tsx', 'utf8');

// 1. HeroSection extraction
const heroStart = '                    {/* 1. HERO & BRAND DESCRIPTION (span-12) */}';
const heroEnd = '                    {/* 2. RECENT WRITINGS (span-8) */}';

const heroIndex = content.indexOf(heroStart);
const heroEndIndex = content.indexOf(heroEnd);

if (heroIndex !== -1 && heroEndIndex !== -1) {
    const heroBlock = content.substring(heroIndex, heroEndIndex);
    const heroComponent = "import React from 'react';\n" +
"import { useNavigate } from 'react-router-dom';\n" +
"import { FiFeather, FiImage } from 'react-icons/fi';\n" +
"import profileData from '../../../data/profile.json';\n" +
"import profilePic from '../../../assets/instagram/profile.jpg';\n\n" +
"export const HeroSection = () => {\n" +
"    const navigate = useNavigate();\n" +
"    return (\n        <>\n" + heroBlock + "        </>\n    );\n};\n";
    fs.writeFileSync('src/components/features/home/HeroSection.tsx', heroComponent);
    content = content.replace(heroBlock, '                    <HeroSection />\n\n');
}

fs.writeFileSync('src/pages/main/Home.tsx', content);
console.log('Extracted HeroSection');
