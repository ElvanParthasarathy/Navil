import fs from 'fs';
import path from 'path';

const files = [
  'VariantListEditor.tsx',
  'StoryEditor.tsx',
  'AdminShared.tsx',
  'RichTextEditor.tsx',
  'StandardListEditor.tsx',
  'AdminDashboard.tsx',
  'AboutEditor.tsx',
  'ProfileEditor.tsx',
  'AdminLogin.tsx',
  'AdminApp.tsx',
  'Admin.tsx'
];

const basePath = 'd:/Projects/Navil/src/components/admin';

files.forEach(file => {
  let p = path.join(basePath, file);
  if (!fs.existsSync(p)) {
      p = path.join('d:/Projects/Navil/src/pages', file);
  }
  if (!fs.existsSync(p)) return;

  let content = fs.readFileSync(p, 'utf8');

  // Fix textTransform
  content = content.replace(/<Typography([^>]*?)\s+textTransform="([^"]+)"([^>]*?)>/g, (match, p1, p2, p3) => {
    const rest = p1 + p3;
    if (rest.includes('sx={{')) {
      return `<Typography${rest.replace('sx={{', `sx={{ textTransform: '${p2}', `)}>`;
    } else {
      return `<Typography${rest} sx={{ textTransform: '${p2}' }}>`;
    }
  });

  // Fix letterSpacing
  content = content.replace(/<Typography([^>]*?)\s+letterSpacing=\{([^}]+)\}([^>]*?)>/g, (match, p1, p2, p3) => {
    const rest = p1 + p3;
    if (rest.includes('sx={{')) {
      return `<Typography${rest.replace('sx={{', `sx={{ letterSpacing: ${p2}, `)}>`;
    } else {
      return `<Typography${rest} sx={{ letterSpacing: ${p2} }}>`;
    }
  });

  // Fix fontStyle
  content = content.replace(/<Typography([^>]*?)\s+fontStyle="([^"]+)"([^>]*?)>/g, (match, p1, p2, p3) => {
    const rest = p1 + p3;
    if (rest.includes('sx={{')) {
      return `<Typography${rest.replace('sx={{', `sx={{ fontStyle: '${p2}', `)}>`;
    } else {
      return `<Typography${rest} sx={{ fontStyle: '${p2}' }}>`;
    }
  });
  
  // Fix textTransform without quotes if any
  content = content.replace(/<Typography([^>]*?)\s+fontStyle=\{([^}]+)\}([^>]*?)>/g, (match, p1, p2, p3) => {
    const rest = p1 + p3;
    if (rest.includes('sx={{')) {
      return `<Typography${rest.replace('sx={{', `sx={{ fontStyle: ${p2}, `)}>`;
    } else {
      return `<Typography${rest} sx={{ fontStyle: ${p2} }}>`;
    }
  });

  if (file === 'VariantListEditor.tsx') {
      content = content.replace(
          `import { SCHEMAS, VariantCard, FieldInput, renderFieldRow, PinEditor, RichTextEditor } from './AdminShared';`,
          `import { SCHEMAS, VariantCard, FieldInput, renderFieldRow, PinEditor } from './AdminShared';\nimport RichTextEditor from './RichTextEditor';`
      );
  }

  fs.writeFileSync(p, content, 'utf8');
});

console.log('Done fixing more TS errors in files.');
