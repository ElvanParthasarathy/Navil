const fs = require('fs');
const content = fs.readFileSync('d:/Projects/Elvan/src/pages/Library.jsx', 'utf8');

const stack = [];
const regex = /<(div|video|img|h2|button|span|Fi\w+)\b[^>]*>|<\/(div|video|img|h2|button|span|Fi\w+)>|{|}|\(|\)/g;

let match;
while ((match = regex.exec(content)) !== null) {
    const text = match[0];
    const line = content.substring(0, match.index).split('\n').length;

    if (text === '{' || text === '(') {
        stack.push({ type: text, line });
    } else if (text === '}' || text === ')') {
        const last = stack.pop();
        const expected = text === '}' ? '{' : '(';
        if (!last || last.type !== expected) {
            console.log(`Mismatch: Found ${text} at line ${line}, but expected closing for ${last ? last.type : 'nothing'}`);
        }
    } else if (text.startsWith('</')) {
        const type = text.match(/<\/(\w+)/)[1];
        const last = stack.pop();
        if (!last || last.type !== type) {
            console.log(`Mismatch: Found </${type}> at line ${line}, but expected closing for <${last ? last.type : 'nothing'}>`);
            if (last) stack.push(last); // Put it back to continue
        }
    } else if (text.startsWith('<') && !text.endsWith('/>')) {
        const typeMatch = text.match(/<(\w+)/);
        if (typeMatch) {
            const type = typeMatch[1];
            if (!['img', 'FiHeart', 'FiMessageCircle', 'FiX', 'FiChevronLeft', 'FiChevronRight', 'FiPlay', 'FiLayers', 'FiGrid', 'FiFilm', 'FiArchive', 'FiVolume2', 'FiVolumeX', 'FiPause'].includes(type)) {
                stack.push({ type, line });
            }
        }
    }
}

if (stack.length > 0) {
    console.log('Unclosed items:');
    stack.forEach(item => console.log(`${item.type} at line ${item.line}`));
} else {
    console.log('All items balanced!');
}
