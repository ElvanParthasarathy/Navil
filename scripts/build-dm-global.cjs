const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function buildDmChatsGlobal({ srcFile, outFile }) {
  let s = fs.readFileSync(srcFile, "utf8");

  // Drop comment lines
  s = s.replace(/^\s*\/\/.*\r?\n/gm, "");

  // Convert ESM exports -> browser global
  s = s.replace(/export\s+const\s+dmChats\s*=\s*/m, "window.dmChats = ");
  s = s.replace(/\r?\nexport\s+default\s+dmChats;\s*$/m, "\n");

  if (!s.includes("window.dmChats")) {
    throw new Error("Could not transform dmChats export to window.dmChats");
  }

  fs.writeFileSync(outFile, s, "utf8");
}

function buildDmChatsJson({ srcFile, outFile }) {
  let s = fs.readFileSync(srcFile, "utf8");
  s = s.replace(/^\s*\/\/.*\r?\n/gm, "");

  const exportPos = s.search(/export\s+const\s+dmChats\s*=/m);
  if (exportPos === -1) throw new Error("Could not find `export const dmChats =`");

  const startBracket = s.indexOf("[", exportPos);
  if (startBracket === -1) throw new Error("Could not find start `[` for dmChats array");

  const endMarker = "\n];";
  const endMarkerPos = s.lastIndexOf(endMarker);
  if (endMarkerPos === -1 || endMarkerPos <= startBracket) {
    throw new Error("Could not find end `];` for dmChats array");
  }

  const arrayText = s.slice(startBracket, endMarkerPos + 2); // include trailing ']'

  // Validate JSON (will throw if malformed)
  JSON.parse(arrayText);

  fs.writeFileSync(outFile, arrayText + "\n", "utf8");
}

function main() {
  const root = path.resolve(__dirname, "..");
  const srcFile = path.join(root, "src", "data", "dmChats.js");
  const outDir = path.join(root, "pages_backup", "messages_insta_dm_backup");
  const outFile = path.join(outDir, "dmChats.global.js");
  const outJsonFile = path.join(outDir, "dmChats.json");

  ensureDir(outDir);
  buildDmChatsGlobal({ srcFile, outFile });
  buildDmChatsJson({ srcFile, outFile: outJsonFile });

  const bytes = fs.statSync(outFile).size;
  const jsonBytes = fs.statSync(outJsonFile).size;
  console.log(`Wrote ${path.relative(root, outFile)} (${bytes} bytes)`);
  console.log(`Wrote ${path.relative(root, outJsonFile)} (${jsonBytes} bytes)`);
}

main();

