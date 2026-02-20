
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { collection, data, password } = request.body;
    const { GITHUB_TOKEN, ADMIN_PASSWORD } = process.env;

    // Optional Security Check
    if (ADMIN_PASSWORD && password !== ADMIN_PASSWORD) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    if (!GITHUB_TOKEN) {
        return response.status(500).json({ error: 'GitHub Token not configured' });
    }

    if (!collection || !data) {
        return response.status(400).json({ error: 'Collection and Data are required' });
    }

    // Map collection to file path
    const fileMap = {
        'posts': 'src/data/posts.json',
        'reels': 'src/data/reels.json',
        'arts': 'src/data/arts.json',
        'quotes': 'src/data/quotes.json',
        'profile': 'src/data/profile.json',
        'stories': 'src/data/stories.json',
        'archived': 'src/data/archived.json',
        'dm_chats': 'src/data/dm_chats.json'
    };

    const filePath = fileMap[collection];
    if (!filePath) {
        return response.status(400).json({ error: 'Invalid collection' });
    }

    const OWNER = 'ElvanParthasarathy';
    const REPO = 'Elvan';
    const BRANCH = 'main';

    try {
        // 1. Get current file (to get SHA)
        const fileResponse = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );

        if (!fileResponse.ok) {
            // If file doesn't exist, we might want to create it, but for now error out as these should exist
            throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
        }

        const fileData = await fileResponse.json();
        const sha = fileData.sha;

        // 2. Prepare new content
        // data is expected to be the FULL new content
        const contentString = JSON.stringify(data, null, 2);
        const contentBase64 = Buffer.from(contentString).toString('base64');

        // 3. Update file
        const updateResponse = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Update ${collection} via CMS Admin`,
                    content: contentBase64,
                    sha: sha,
                    branch: BRANCH,
                }),
            }
        );

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('GitHub API Update Error:', errorText);
            throw new Error(`Failed to update file: ${updateResponse.statusText}`);
        }

        return response.status(200).json({ success: true });

    } catch (error) {
        console.error('API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
