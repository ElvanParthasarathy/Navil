const fs = require('fs');
const path = require('path');

const indexCssPath = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(indexCssPath, 'utf8');

// The markers for splitting
const aboutMarkerStart = "/* =========================================";
const aboutMarkerEnd = "/* =========================================";

const sections = cssContent.split("/* =========================================");

// We know from Select-String that:
// sections[5] is "   6. ABOUT PAGE REDESIGN\n..."
// sections[6] is "   8. DISCUSSION & ENGAGEMENT (MODERN UI)\n..."

let indexNew = sections.slice(0, 5).join("/* =========================================");
// Wait, the split removes the marker. I should restore it.

let newCssContent = "";
let aboutCss = "";
let engagementCss = "";

for (let i = 0; i < sections.length; i++) {
    const sectionBody = sections[i];
    if (i === 0) {
        newCssContent += sectionBody;
        continue;
    }
    
    const fullSection = "/* =========================================" + sectionBody;
    
    if (fullSection.includes("ABOUT PAGE REDESIGN")) {
        aboutCss = fullSection;
    } else if (fullSection.includes("DISCUSSION & ENGAGEMENT")) {
        engagementCss = fullSection;
    } else {
        newCssContent += fullSection;
    }
}

// Clean up trailing brackets if they leaked (e.g. `}/* ===`)
// Wait, one of the sections had `}/* ===`. 
// I will use regex or indexOf to be safer.
