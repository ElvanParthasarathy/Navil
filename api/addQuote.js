export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { text, author, tag, lang, translation, transliteration } = request.body;
    const { GITHUB_TOKEN } = process.env;

    if (!GITHUB_TOKEN) {
        return response.status(500).json({ error: 'GitHub Token not configured' });
    }

    if (!text) {
        return response.status(400).json({ error: 'Text is required' });
    }

    const OWNER = 'ElvanParthasarathy'; // Replace with your GitHub username
    const REPO = 'Elvan'; // Replace with your repo name
    const PATH = 'src/data/quotes.json';
    const BRANCH = 'main'; // or 'master' depending on your default branch

    try {
        // 1. Get current file content and SHA
        const fileResponse = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );

        if (!fileResponse.ok) {
            const errorText = await fileResponse.text();
            console.error('GitHub API Error (Get):', errorText);
            throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
        }

        const fileData = await fileResponse.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const sha = fileData.sha;

        let quotes = [];
        try {
            quotes = JSON.parse(content);
        } catch (e) {
            console.error("Error parsing existing JSON", e);
            // If empty or invalid, start fresh
            quotes = [];
        }

        // 2. Add new quote
        const newQuote = {
            id: quotes.length > 0 ? Math.max(...quotes.map(q => q.id)) + 1 : 1,
            text,
            author: author || 'Elvan Parthasarathy',
            tag: tag || 'General',
            lang: lang || 'en',
            translation: translation || null,
            transliteration: transliteration || null,
            date: new Date().toISOString()
        };

        quotes.push(newQuote);

        // 3. Update file on GitHub
        const newContent = Buffer.from(JSON.stringify(quotes, null, 4)).toString('base64');

        const updateResponse = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Add new quote via Admin API: "${text.substring(0, 20)}..."`,
                    content: newContent,
                    sha: sha,
                    branch: BRANCH,
                }),
            }
        );

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('GitHub API Error (Update):', errorText);
            throw new Error(`Failed to update file: ${updateResponse.statusText}`);
        }

        return response.status(200).json({ success: true, quote: newQuote });

    } catch (error) {
        console.error('API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
