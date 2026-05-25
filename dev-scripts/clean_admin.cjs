const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src/pages/Admin.tsx');
let content = fs.readFileSync(file, 'utf8');

// Remove generateSlug
content = content.replace(/const generateSlug = \(text\) => \{\s+let slug = String\(text\)\.replace\(\/<\[\^>\]\+>\/g, ''\)\.trim\(\)\.toLowerCase\(\)\s+\.replace\(\/\[\.\#\$\\\[\\\]\\\/\]\/g, ''\)\.replace\(\/\[\\s\\n\\r\]\+\/g, '-'\)\.substring\(0, 50\)\.replace\(\/\^-+\|-+\$\/g, ''\);\s+return slug \|\| 'untitled';\s+\};\s+/g, '');

// Remove getBestTitle
content = content.replace(/const getBestTitle = \(item\) => \{\s+const firstVariant = item\.variants\?\.\[0\];\s+const englishVariant = item\.variants\?\.find\(v => v\.lang === 'en' && v\.title\);\s+const titleTransl = firstVariant\?\.titleTransliterations \|\| \{\};\s+const bestTitleTransl = titleTransl\.en \|\| Object\.values\(titleTransl\)\.filter\(v => v && v !== true\)\[0\];\s+return item\.title \|\| bestTitleTransl \|\| englishVariant\?\.title \|\| firstVariant\?\.title \|\| firstVariant\?\.text \|\| 'untitled';\s+\};\s+/g, '');

// Remove textToHtml
content = content.replace(/const textToHtml = \(raw\) => \{\s+if \(\!raw\) return '';\s+if \(\/<\(p\|h\[1-6\]\|ul\|ol\|li\|div\|pre\|blockquote\|br\)\[> \\\/\]\/i\.test\(raw\)\) return raw;\s+return raw\.split\('\\n'\)\.map\(line => line\.trim\(\) \? \<p>\$\{line\}<\/p>\ : '<p><br><\/p>'\)\.join\(''\);\s+\};\s+/g, '');

// Remove resolveAuthorForPair
content = content.replace(/const resolveAuthorForPair = \(baseLang: string, tLang: string, authors: Record<string, string>\) => \{\s+if \(baseLang === 'ta' && tLang === 'en'\) return \{ name: authors\['ta_translit'\] \|\| authors\['en'\] \|\| '', locked: true \};\s+if \(baseLang === 'ta' && tLang === 'ml'\) return \{ name: authors\['ml'\] \|\| '', locked: true \};\s+if \(baseLang === 'ml' && tLang === 'en'\) return \{ name: authors\['ml_translit'\] \|\| authors\['en'\] \|\| '', locked: true \};\s+if \(baseLang === 'ml' && tLang === 'ta'\) return \{ name: authors\['ta'\] \|\| '', locked: true \};\s+if \(\(baseLang === 'hi' \|\| baseLang === 'sa'\) && tLang === 'en'\) return \{ name: authors\['en'\] \|\| '', locked: true \};\s+return \{ name: '', locked: false \};\s+\};\s+/g, '');

// Remove cleanForStorage
content = content.replace(/const cleanForStorage = \(item, displayOrder\) => \{\s+const clean = JSON\.parse\(JSON\.stringify\(item\)\);\s+delete clean\.id;\s+delete clean\.style; delete clean\.theme; delete clean\.meter; delete clean\.slug;\s+clean\.display_order = displayOrder;\s+if \(clean\.tags && typeof clean\.tags === 'string'\) \{\s+clean\.tags = clean\.tags\.split\(','\)\.map\(t => t\.trim\(\)\)\.filter\(Boolean\);\s+\}\s+if \(clean\.variants\) \{\s+const da = dataStore\.defaultAuthors \|\| DEFAULT_AUTHORS;\s+clean\.variants\.forEach\(v => \{\s+if \(v\.transliterations\?\._empty\) delete v\.transliterations\._empty;\s+if \(v\.titleTransliterations\?\._empty\) delete v\.titleTransliterations\._empty;\s+if \(v\.authorTransliterations\?\._empty\) delete v\.authorTransliterations\._empty;\s+if \(v\.text\) v\.text = textToHtml\(v\.text\);\s+if \(v\.transliterations\) \{\s+Object\.keys\(v\.transliterations\)\.forEach\(lang => \{\s+if \(v\.transliterations\[lang\]\) v\.transliterations\[lang\] = textToHtml\(v\.transliterations\[lang\]\);\s+const resolved = resolveAuthorForPair\(v\.lang, lang, da\);\s+if \(resolved\.locked && v\.authorTransliterations\) \{\s+const current = v\.authorTransliterations\[lang\] \|\| '';\s+const allDefaults = Object\.values\(da\);\s+const isAutoFilled = \!current \|\| allDefaults\.includes\(current\);\s+if \(isAutoFilled\) v\.authorTransliterations\[lang\] = resolved\.name;\s+\}\s+\}\);\s+\}\s+if \(v\.transliterations && Object\.keys\(v\.transliterations\)\.length === 0\) delete v\.transliterations;\s+if \(v\.titleTransliterations && Object\.keys\(v\.titleTransliterations\)\.length === 0\) delete v\.titleTransliterations;\s+if \(v\.authorTransliterations && Object\.keys\(v\.authorTransliterations\)\.length === 0\) delete v\.authorTransliterations;\s+\}\);\s+\}\s+return clean;\s+\};\s+/g, '');

// Update cleanForStorage calls
content = content.replace(/const row = cleanForStorage\(item, index\);/g, 'const row = cleanForStorage(item, index, dataStore.defaultAuthors || DEFAULT_AUTHORS);');

fs.writeFileSync(file, content);
