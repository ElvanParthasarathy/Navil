const fs = require('fs');

const lines = fs.readFileSync('C:/Users/jaipr/.gemini/antigravity-ide/brain/a866df96-6e8d-45f5-802b-6360830c41b3/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
        const data = JSON.parse(line);
        if (data.tool_calls) {
            for (const call of data.tool_calls) {
                if (call.name === 'default_api:write_to_file' || call.name === 'default_api:multi_replace_file_content' || call.name === 'default_api:replace_file_content') {
                    if (call.arguments && call.arguments.TargetFile && call.arguments.TargetFile.includes('VariantListEditor.tsx')) {
                        console.log('Found modification by tool:', call.name);
                        // We will just find the most recent complete write_to_file if possible.
                        if (call.name === 'default_api:write_to_file') {
                             fs.writeFileSync('d:/Projects/Navil/src/components/admin/VariantListEditor.tsx', call.arguments.CodeContent);
                             console.log('Restored write_to_file content!');
                             process.exit(0);
                        }
                    }
                }
            }
        }
    } catch (e) {
        // ignore parse error
    }
}
console.log('Could not find write_to_file for VariantListEditor.tsx in logs.');
