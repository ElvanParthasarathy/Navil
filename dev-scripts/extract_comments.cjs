const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src/pages/Admin.tsx');
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('const CommentsManager = ');
const startOfComment = content.lastIndexOf('// ─── COMMENTS MANAGER COMPONENT ───', startIndex);
if (startIndex !== -1 && startOfComment !== -1) {
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
                endIndex = i + 2; // Include };
                break;
            }
        }
    }

    if (endIndex !== -1) {
        const componentCode = content.substring(startOfComment, endIndex);
        
        const newFileContent = import React, { useState, useEffect } from 'react';\n +
            import { Box, Card, Typography, CircularProgress, IconButton, Avatar } from '@mui/material';\n +
            import { MdComment, MdDelete } from 'react-icons/md';\n +
            import { db } from '../../lib/firebaseClient';\n +
            import { ref, onValue } from 'firebase/database';\n\n +
            componentCode.replace('const CommentsManager =', 'export default function CommentsManager') + '\n';
        
        fs.writeFileSync(path.join(process.cwd(), 'src/components/admin/dashboard/CommentsManager.tsx'), newFileContent);
        
        // Replace in Admin.tsx
        content = content.substring(0, startOfComment) + content.substring(endIndex);
        
        // Add import
        const importIndex = content.lastIndexOf('import AdminDashboard');
        content = content.substring(0, importIndex) + "import CommentsManager from '../components/admin/dashboard/CommentsManager';\n" + content.substring(importIndex);
        
        fs.writeFileSync(file, content);
        console.log("Extracted CommentsManager successfully!");
    } else {
        console.log("Could not find end of CommentsManager.");
    }
} else {
    console.log("Could not find start of CommentsManager.");
}
