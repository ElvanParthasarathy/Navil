const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/pages/main/Archive.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace("    if (isMounting) {\n        return <ArchiveSkeleton />;\n    }\n", "");
content = content.replace("    return (\n        <>\n            <MobileTopBar title=\"காப்புகள்|archive\" />", "    if (isMounting) {\n        return <ArchiveSkeleton />;\n    }\n\n    return (\n        <>\n            <MobileTopBar title=\"காப்புகள்|archive\" />");
fs.writeFileSync(file, content);
console.log('Fixed hooks error in Archive!');
