const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const indexCssPath = path.join(srcDir, 'index.css');

const content = fs.readFileSync(indexCssPath, 'utf8');

const idxAbout = content.indexOf('/* =========================================\r\n   6. ABOUT PAGE REDESIGN');
const idxEngagement = content.indexOf('/* =========================================\r\n   8. DISCUSSION & ENGAGEMENT');

if (idxAbout !== -1 && idxEngagement !== -1) {
    // The "}" before Engagement belongs to About
    // Let's find the '}' just before idxEngagement
    const lastBraceBeforeEng = content.lastIndexOf('}', idxEngagement);
    
    // So About section is from idxAbout to lastBraceBeforeEng + 1
    const aboutCss = content.substring(idxAbout, lastBraceBeforeEng + 1).trim();
    
    // Engagement is from idxEngagement to end
    const engagementCss = content.substring(idxEngagement).trim();
    
    // The rest is index.css
    const newIndexCss = content.substring(0, idxAbout).trim();
    
    fs.writeFileSync(path.join(srcDir, 'pages', 'main', 'About.css'), aboutCss);
    fs.writeFileSync(path.join(srcDir, 'components', 'ui', 'Engagement.css'), engagementCss);
    fs.writeFileSync(indexCssPath, newIndexCss);
    
    console.log("Successfully extracted About.css and Engagement.css");
    
    // Now append imports
    const aboutTsx = path.join(srcDir, 'pages', 'main', 'About.tsx');
    let aboutCode = fs.readFileSync(aboutTsx, 'utf8');
    if (!aboutCode.includes("import './About.css'")) {
        aboutCode = "import './About.css';\n" + aboutCode;
        fs.writeFileSync(aboutTsx, aboutCode);
    }
    
    const engTsx = path.join(srcDir, 'components', 'ui', 'Engagement.tsx');
    let engCode = fs.readFileSync(engTsx, 'utf8');
    if (!engCode.includes("import './Engagement.css'")) {
        engCode = "import './Engagement.css';\n" + engCode;
        fs.writeFileSync(engTsx, engCode);
    }
} else {
    // fallback for linux line endings (\n)
    const idxAbout2 = content.indexOf('/* =========================================\n   6. ABOUT PAGE REDESIGN');
    const idxEngagement2 = content.indexOf('/* =========================================\n   8. DISCUSSION & ENGAGEMENT');
    if (idxAbout2 !== -1 && idxEngagement2 !== -1) {
        const lastBraceBeforeEng = content.lastIndexOf('}', idxEngagement2);
        const aboutCss = content.substring(idxAbout2, lastBraceBeforeEng + 1).trim();
        const engagementCss = content.substring(idxEngagement2).trim();
        const newIndexCss = content.substring(0, idxAbout2).trim();
        
        fs.writeFileSync(path.join(srcDir, 'pages', 'main', 'About.css'), aboutCss);
        fs.writeFileSync(path.join(srcDir, 'components', 'ui', 'Engagement.css'), engagementCss);
        fs.writeFileSync(indexCssPath, newIndexCss);
        
        console.log("Successfully extracted About.css and Engagement.css (LF)");
        
        const aboutTsx = path.join(srcDir, 'pages', 'main', 'About.tsx');
        let aboutCode = fs.readFileSync(aboutTsx, 'utf8');
        if (!aboutCode.includes("import './About.css'")) {
            aboutCode = "import './About.css';\n" + aboutCode;
            fs.writeFileSync(aboutTsx, aboutCode);
        }
        
        const engTsx = path.join(srcDir, 'components', 'ui', 'Engagement.tsx');
        let engCode = fs.readFileSync(engTsx, 'utf8');
        if (!engCode.includes("import './Engagement.css'")) {
            engCode = "import './Engagement.css';\n" + engCode;
            fs.writeFileSync(engTsx, engCode);
        }
    } else {
        console.log("Could not find sections!");
    }
}
