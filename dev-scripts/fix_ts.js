import fs from 'fs';
import path from 'path';

const files = [
  'VariantListEditor.tsx',
  'StoryEditor.tsx',
  'NirvaagiShared.tsx',
  'RichTextEditor.tsx',
  'StandardListEditor.tsx',
  'NirvaagiDashboard.tsx',
  'AboutEditor.tsx',
  'ProfileEditor.tsx',
  'NirvaagiLogin.tsx',
  'NirvaagiApp.tsx',
  'Nirvaagi.tsx'
];

const basePath = 'd:/Projects/Navil/src/components/nirvaagi';

files.forEach(file => {
  let p = path.join(basePath, file);
  if (!fs.existsSync(p)) {
      p = path.join('d:/Projects/Navil/src/pages', file);
  }
  if (!fs.existsSync(p)) return;

  let content = fs.readFileSync(p, 'utf8');

  // Fix Typography fontWeight: fontWeight={800} -> sx={{ fontWeight: 800 }}
  // We need to be careful if there's already an sx prop.
  content = content.replace(/<Typography([^>]*?)\s+fontWeight=\{([0-9]+)\}([^>]*?)>/g, (match, p1, p2, p3) => {
    // Check if sx already exists
    const rest = p1 + p3;
    if (rest.includes('sx={{')) {
      return `<Typography${rest.replace('sx={{', `sx={{ fontWeight: ${p2}, `)}>`;
    } else {
      return `<Typography${rest} sx={{ fontWeight: ${p2} }}>`;
    }
  });

  // Fix Grid item prop: <Grid item xs={12}> -> <Grid size={{xs: 12}}> or wait, in MUI v6 Grid2 it's size={{...}} but here they might just be using Grid v1 and importing it from @mui/material. In v6 Grid v1 is still available but maybe it's deprecated. If we just remove `item`, Grid v1 might break. Actually the error is `Property 'item' does not exist on type ... GridBaseProps`. This means it's Grid v2! In Grid v2, `item` is removed and you just pass `size` or just `xs`! Oh, Grid v2 (which is now `Grid` in v6) uses `size={...}`. Let's just remove `item` and see if `xs` is valid. Actually the error says `Property 'item' does not exist`. 
  content = content.replace(/<Grid([^>]*?)\s+item([^>]*?)>/g, `<Grid$1$2>`);

  // Fix Box display={...} which is complaining in StoryEditor.tsx: 
  content = content.replace(/<Box([^>]*?)\s+display="([^"]+)"([^>]*?)>/g, (match, p1, p2, p3) => {
    const rest = p1 + p3;
    if (rest.includes('sx={{')) {
      return `<Box${rest.replace('sx={{', `sx={{ display: '${p2}', `)}>`;
    } else {
      return `<Box${rest} sx={{ display: '${p2}' }}>`;
    }
  });

  // Fix Box justifyContent
  content = content.replace(/<Box([^>]*?)\s+justifyContent="([^"]+)"([^>]*?)>/g, (match, p1, p2, p3) => {
    const rest = p1 + p3;
    if (rest.includes('sx={{')) {
      return `<Box${rest.replace('sx={{', `sx={{ justifyContent: '${p2}', `)}>`;
    } else {
      return `<Box${rest} sx={{ justifyContent: '${p2}' }}>`;
    }
  });

  // Fix Box alignItems
  content = content.replace(/<Box([^>]*?)\s+alignItems="([^"]+)"([^>]*?)>/g, (match, p1, p2, p3) => {
    const rest = p1 + p3;
    if (rest.includes('sx={{')) {
      return `<Box${rest.replace('sx={{', `sx={{ alignItems: '${p2}', `)}>`;
    } else {
      return `<Box${rest} sx={{ alignItems: '${p2}' }}>`;
    }
  });
  
  // Fix Box height
  content = content.replace(/<Box([^>]*?)\s+height="([^"]+)"([^>]*?)>/g, (match, p1, p2, p3) => {
    const rest = p1 + p3;
    if (rest.includes('sx={{')) {
      return `<Box${rest.replace('sx={{', `sx={{ height: '${p2}', `)}>`;
    } else {
      return `<Box${rest} sx={{ height: '${p2}' }}>`;
    }
  });

  // Fix Box color
  content = content.replace(/<Box([^>]*?)\s+color="([^"]+)"([^>]*?)>/g, (match, p1, p2, p3) => {
    const rest = p1 + p3;
    if (rest.includes('sx={{')) {
      return `<Box${rest.replace('sx={{', `sx={{ color: '${p2}', `)}>`;
    } else {
      return `<Box${rest} sx={{ color: '${p2}' }}>`;
    }
  });

  fs.writeFileSync(p, content, 'utf8');
});

console.log('Done fixing TS errors in files.');
