const fs = require('fs');
const { execSync } = require('child_process');

const src = "D:/Projects/Elvan Sans/fonts/ttf";
const dest = "D:/Projects/Navil/public/fonts";
const files = [
  "ElvanSans-Regular.ttf", 
  "ElvanSans-Medium.ttf", 
  "ElvanSans-SemiBold.ttf", 
  "ElvanSans-Bold.ttf", 
  "ElvanSans-Italic.ttf", 
  "ElvanSans-MediumItalic.ttf", 
  "ElvanSans-SemiBoldItalic.ttf", 
  "ElvanSans-BoldItalic.ttf"
];

for (const file of files) {
  const srcPath = `${src}/${file}`;
  const woffFile = file.replace('.ttf', '.woff');
  const destPath = `${dest}/${woffFile}`;
  
  if (fs.existsSync(srcPath)) {
    console.log(`Converting ${file}...`);
    try {
      execSync(`npx --yes ttf2woff "${srcPath}" "${destPath}"`, {stdio: 'inherit'});
      console.log(`Successfully converted ${file}`);
    } catch (err) {
      console.error(`Error converting ${file}:`, err.message);
    }
  } else {
    console.log(`File not found: ${srcPath}`);
  }
}
