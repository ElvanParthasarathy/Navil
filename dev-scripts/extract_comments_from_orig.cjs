const fs = require('fs');

const content = fs.readFileSync('original_admin.txt', 'utf8');

const startMarker = 'const CommentsManager = ({ username, profilePic }) => {';
const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
    console.log("Could not find CommentsManager");
    process.exit(1);
}

let braceCount = 0;
let endIndex = -1;
let started = false;

for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
        braceCount++;
        started = true;
    } else if (content[i] === '}') {
        braceCount--;
        if (started && braceCount === 0) {
            endIndex = i + 1;
            break;
        }
    }
}

if (endIndex !== -1) {
    let componentCode = content.substring(startIndex, endIndex + 1); // include the semicolon if there is one, wait, it might be };
    if (content[endIndex] === ';') {
        endIndex++;
        componentCode += ';';
    }
    
    componentCode = componentCode.replace(
        'const CommentsManager = ({ username, profilePic }) => {', 
        'export default function CommentsManager({ username, profilePic }: any) {'
    );

    const newFileContent = "import React, { useState, useEffect } from 'react';\n" +
        "import { Box, Card, Typography, CircularProgress, IconButton, Avatar } from '@mui/material';\n" +
        "import { MdComment, MdDelete } from 'react-icons/md';\n" +
        "import { db, auth } from '../../lib/firebaseClient';\n" +
        "import { ref, onValue, remove, set } from 'firebase/database';\n" +
        "import { addComment } from '../../lib/engagement';\n\n" +
        componentCode + "\n";

    fs.writeFileSync('src/components/admin/dashboard/CommentsManager.tsx', newFileContent);
    console.log("Extracted CommentsManager correctly.");
} else {
    console.log("Could not find end of CommentsManager");
}
