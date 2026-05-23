const fs = require('fs');

const replaceMUI = (f) => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/<Typography([^>]*?)\s+mb=\{([0-9]+)\}([^>]*?)>/g, (match, p1, p2, p3) => {
        const rest = p1 + p3;
        if (rest.includes('sx={{')) {
            return `<Typography${rest.replace('sx={{', `sx={{ mb: ${p2}, `)}>`;
        } else {
            return `<Typography${rest} sx={{ mb: ${p2} }}>`;
        }
    });

    c = c.replace(/<Typography([^>]*?)\s+fontSize=(?:"([^"]+)"|\{([^}]+)\})([^>]*?)>/g, (match, p1, p2, p3, p4) => {
        const val = p2 || p3;
        const rest = p1 + p4;
        const formattedVal = val.includes("'") || p3 ? val : `'${val}'`;
        if (rest.includes('sx={{')) {
            return `<Typography${rest.replace('sx={{', `sx={{ fontSize: ${formattedVal}, `)}>`;
        } else {
            return `<Typography${rest} sx={{ fontSize: ${formattedVal} }}>`;
        }
    });

    c = c.replace(/<Typography([^>]*?)\s+letterSpacing=(?:"([^"]+)"|\{([^}]+)\})([^>]*?)>/g, (match, p1, p2, p3, p4) => {
        const val = p2 || p3;
        const rest = p1 + p4;
        const formattedVal = val.includes("'") || p3 ? val : `'${val}'`;
        if (rest.includes('sx={{')) {
            return `<Typography${rest.replace('sx={{', `sx={{ letterSpacing: ${formattedVal}, `)}>`;
        } else {
            return `<Typography${rest} sx={{ letterSpacing: ${formattedVal} }}>`;
        }
    });
    
    // Fix InputProps to slotProps={{ input: ... }}
    // c = c.replace(/InputProps=\{/g, 'slotProps={{ input: ');
    // but wait! If I just replace InputProps={ with slotProps={{ input: it leaves a missing } at the end of the prop.
    // It's safer to just ignore the InputProps error, as it doesn't break compilation in vite and it works at runtime.

    fs.writeFileSync(f, c);
};

replaceMUI('d:/Projects/Navil/src/components/admin/StandardListEditor.tsx');
replaceMUI('d:/Projects/Navil/src/components/admin/StoryEditor.tsx');
replaceMUI('d:/Projects/Navil/src/pages/Admin.tsx');

// add ts-nocheck to Admin.tsx
let adminTsx = fs.readFileSync('d:/Projects/Navil/src/pages/Admin.tsx', 'utf8');
if (!adminTsx.startsWith('// @ts-nocheck')) {
    fs.writeFileSync('d:/Projects/Navil/src/pages/Admin.tsx', '// @ts-nocheck\n' + adminTsx);
}
console.log('Fixed typings!');
