const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '../jaiprakashelvan instagram/your_instagram_activity/messages');
const outputPath = path.join(__dirname, '../src/data/dmChats.js');

// Helper to decode HTML entities
function decodeHtml(str) {
    return str
        .replace(/&#039;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#064;/g, '@')
        .replace(/<br\s*\/?>/gi, '\n');
}

try {
    const chatsPath = path.join(messagesDir, 'chats.html');
    const inboxDir = path.join(messagesDir, 'inbox');

    if (!fs.existsSync(chatsPath)) {
        throw new Error('chats.html not found');
    }

    const chatsHtml = fs.readFileSync(chatsPath, 'utf8');

    // Parse chat entries from chats.html
    const chatPattern = /<div class="_a6-h"><a href="([^"]+)">([^<]+)<\/a><\/div>/g;
    const chats = [];
    let match;

    while ((match = chatPattern.exec(chatsHtml)) !== null) {
        const chatLink = match[1];
        const chatName = decodeHtml(match[2]);

        // Extract folder name from link
        const folderMatch = chatLink.match(/inbox\/([^/]+)\//);
        if (!folderMatch) continue;

        const folderName = folderMatch[1];
        const chatFolder = path.join(inboxDir, folderName);

        // Parse ALL messages from message_1.html (and potentially message_2.html, etc.)
        const allMessages = [];
        let msgFileNum = 1;

        while (true) {
            const messageFile = path.join(chatFolder, `message_${msgFileNum}.html`);
            if (!fs.existsSync(messageFile)) break;

            const msgHtml = fs.readFileSync(messageFile, 'utf8');

            // Split by message block start marker
            // Each message starts with: <div class="pam _3-95 _2ph- _a6-g uiBoxWhite noborder">
            const blocks = msgHtml.split(/<div class="pam _3-95 _2ph- _a6-g uiBoxWhite noborder">/);

            for (let i = 1; i < blocks.length; i++) {
                const block = blocks[i];

                // Extract sender: <div class="_3-95 _2pim _a6-h _a6-i">SENDER</div>
                const senderMatch = block.match(/<div class="_3-95 _2pim _a6-h _a6-i">([^<]+)<\/div>/);
                const sender = senderMatch ? decodeHtml(senderMatch[1]).trim() : 'Unknown';

                // Extract content from _a6-p div
                // Look for anything between _a6-p div and the timestamp div
                const contentBlockMatch = block.match(/<div class="_3-95 _a6-p">([\s\S]*?)<div class="_3-94 _a6-o">/);
                let content = '';

                if (contentBlockMatch) {
                    const innerHtml = contentBlockMatch[1];
                    // Extract text from all inner divs
                    const divContents = innerHtml.match(/<div>([^<{]*)<\/div>/g);
                    if (divContents) {
                        content = divContents
                            .map(d => d.replace(/<\/?div>/g, '').trim())
                            .filter(t => t.length > 0)
                            .join('\n');
                        content = decodeHtml(content).trim();
                    }
                }

                if (!content || content === '') {
                    // Fallback: just strip tags from the content block
                    if (contentBlockMatch) {
                        content = decodeHtml(contentBlockMatch[1].replace(/<[^>]+>/g, ' ')).trim();
                    }
                }

                if (!content || content === '') {
                    content = 'Sent an attachment';
                }

                // Extract time: <div class="_3-94 _a6-o">TIME</div>
                const timeMatch = block.match(/<div class="_3-94 _a6-o">([^<]+)<\/div>/);
                let time = timeMatch ? timeMatch[1].trim() : '';

                // Add "at" to timestamp if it looks like "Date Time" (e.g. "Apr 14, 2025 5:25 am")
                if (time && !time.includes(' at ')) {
                    // Pattern: Month DD, YYYY HH:MM am/pm
                    time = time.replace(/(\d{4})\s+(\d+:)/, '$1 at $2');
                }

                allMessages.push({ sender, content, time });
            }

            msgFileNum++;
        }

        // Get last message preview for list
        const lastMsg = allMessages[0] || { content: 'No messages', time: '', sender: '' };

        chats.push({
            id: folderName,
            name: chatName,
            lastMessage: lastMsg.content.substring(0, 50),
            lastMessageTime: lastMsg.time,
            lastMessageSender: lastMsg.sender,
            folder: folderName,
            messages: allMessages.reverse() // Reverse to show oldest first
        });
    }

    // Sort chats by last message timestamp descending
    chats.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;

        // Convert "Mar 31, 2025 at 7:03 am" to a sortable Date
        const getTimestamp = (timeStr) => {
            try {
                // Remove " at " for better native parsing
                const cleanStr = timeStr.replace(' at ', ' ');
                return new Date(cleanStr).getTime();
            } catch (e) {
                return 0;
            }
        };

        return getTimestamp(b.lastMessageTime) - getTimestamp(a.lastMessageTime);
    });

    console.log(`Parsed and sorted ${chats.length} chats with full message history.`);

    // Write to output file
    const fileContent = `// Auto-generated DM chats data
export const dmChats = ${JSON.stringify(chats, null, 2)};

export default dmChats;
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully wrote DM data to ${outputPath}`);

} catch (err) {
    console.error('Error parsing DM data:', err);
}
