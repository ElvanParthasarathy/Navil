const fs = require('fs');

const content = fs.readFileSync('original_admin.txt', 'utf8');

const startMarker = 'const CommentsManager = ({ username, profilePic }) => {';
const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf('// Allowed administrator email addresses');

let componentCode = content.substring(startIndex, endIndex).trim();
if (componentCode.endsWith(';')) componentCode = componentCode.slice(0, -1);

componentCode = componentCode.replace(
    'const CommentsManager = ({ username, profilePic }) => {', 
    'export default function CommentsManager({ username, profilePic }: { username: string, profilePic: string }) {'
);

const newFileContent = "import React, { useState, useEffect } from 'react';\n" +
    "import { Box, Card, Typography, CircularProgress, IconButton, Avatar } from '@mui/material';\n" +
    "import { MdComment, MdDelete } from 'react-icons/md';\n" +
    "import { db, auth } from '../../lib/firebaseClient';\n" +
    "import { ref, onValue, remove, set } from 'firebase/database';\n" +
    "import { addComment } from '../../lib/engagement';\n\n" +
    componentCode + "\n";

fs.writeFileSync('src/components/admin/dashboard/CommentsManager.tsx', newFileContent);
console.log("Extracted CommentsManager perfectly.");
