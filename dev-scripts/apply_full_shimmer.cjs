const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/pages/main/Archive.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';", "import React, { useState, useEffect, useMemo, useRef, Suspense, lazy } from 'react';\nimport { ArchiveSkeleton } from '../../App';");
const newComponentStart = \const Archive = () => {\n    const [isMounting, setIsMounting] = useState(true);\n\n    useEffect(() => {\n        const timer = setTimeout(() => setIsMounting(false), 50);\n        return () => clearTimeout(timer);\n    }, []);\n\n    if (isMounting) {\n        return <ArchiveSkeleton />;\n    }\n\n    const navigate = useNavigate();\;
content = content.replace("const Archive = () => {\n\n    const navigate = useNavigate();", newComponentStart);
fs.writeFileSync(file, content);
console.log('Full shimmer applied!');
