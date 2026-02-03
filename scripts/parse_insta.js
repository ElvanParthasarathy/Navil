import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary Configuration
const CLOUDINARY_BASE = 'https://res.cloudinary.com/doxhuprh4/image/upload/f_auto,q_auto/assets/instagram';
const CLOUDINARY_VIDEO_BASE = 'https://res.cloudinary.com/doxhuprh4/video/upload/f_auto,q_auto/assets/instagram';

// elvan.jp Cloudinary Configuration
const ARTS_CLOUDINARY_BASE = 'https://res.cloudinary.com/doxhuprh4/image/upload/f_auto,q_auto/assets/instagram/elvan.jp';
const ARTS_CLOUDINARY_VIDEO_BASE = 'https://res.cloudinary.com/doxhuprh4/video/upload/f_auto,q_auto/assets/instagram/elvan.jp';

// Adjusted path to match user's structure
const mainInputPath = path.join(__dirname, '../jaiprakashelvan instagram/your_instagram_activity/media/posts_1.html');
const artsInputPath = path.join(__dirname, '../elvan.jp Insta HTML/your_instagram_activity/media/posts_1.html');
const outputPath = path.join(__dirname, '../src/data/instagramData.js');

try {
    // --- MAIN POSTS & ARCHIVED POSTS ---
    const posts = [];
    const archivedPosts = [];
    const reels = [];
    const arts = [];
    const stories = [];

    // List of posts to specifically exclude (Requested by User)
    // List of posts to specifically exclude (Requested by User)
    const EXCLUDED_DATES = [
        'Jan 01, 2024 8:09 am',
        'Sep 18, 2024 9:34 am',
        'Dec 10, 2022 4:05 am',
        'Nov 13, 2023 1:51 am',
        'Nov 27, 2022 5:51 am',
        'Nov 27, 2022 5:47 am',
        'Nov 27, 2022 5:36 am',
        'Nov 27, 2022 5:33 am',
        'Nov 27, 2022 5:15 am',
        'Nov 27, 2022 5:04 am',
        'Nov 27, 2022 4:59 am',
        'Oct 25, 2022 2:37 am',
        'Oct 06, 2022 11:31 pm'
    ];

    // Helper to parse generic post HTML (images/mixed)
    const parsePostFile = (filePath, sourceType, targetArray, customBase = null, customVideoBase = null) => {
        if (!fs.existsSync(filePath)) return;
        const content = fs.readFileSync(filePath, 'utf8');
        const blocks = content.split('class="pam');

        blocks.forEach((block, index) => {
            if (index === 0) return;

            // Extract Date First for Filtering
            const dateMatch = block.match(/class="_3-94 _a6-o">([^<]+)</);
            const date = dateMatch ? dateMatch[1] : '';

            // Exclusion Check
            if (EXCLUDED_DATES.includes(date)) return;

            // Match media from posts, other, or archived_posts
            const imgMatches = [...block.matchAll(/src="(media\/(?:posts|other|archived_posts)\/[^"]+)"/g)];
            if (imgMatches.length === 0) return;

            const allImages = imgMatches.map(match => {
                const relativePath = match[1].replace('media/', '');
                const isVideo = relativePath.endsWith('.mp4');
                const base = isVideo ? (customVideoBase || CLOUDINARY_VIDEO_BASE) : (customBase || CLOUDINARY_BASE);
                // Force .jpg extension for HEIC/HEIF in the URL so Cloudinary transforms it reliably
                let cloudPath = relativePath;
                if (relativePath.toLowerCase().endsWith('.heic') || relativePath.toLowerCase().endsWith('.heif')) {
                    cloudPath = cloudPath.replace(/\.(heic|heif)$/i, '.jpg');
                }
                return `${base}/${cloudPath}`;
            });
            const webPath = allImages[0];

            // Date and Match already extracted above for filtering

            const captionMatch = block.match(/class="_3-95 _2pim _a6-h _a6-i">([\s\S]*?)<\/div>/);
            let caption = captionMatch ? captionMatch[1] : '';
            caption = caption
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .trim();

            targetArray.push({
                id: `${sourceType}_${index}_${Date.now()}`,
                image: webPath,
                images: allImages,
                caption: caption,
                date: date,
                timestamp: new Date(date).getTime(),
                type: 'image'
            });
        });
    };

    // Parse Main Posts
    parsePostFile(mainInputPath, 'post', posts);

    // Parse Arts (elvan.jp)
    parsePostFile(artsInputPath, 'art', arts, ARTS_CLOUDINARY_BASE, ARTS_CLOUDINARY_VIDEO_BASE);

    // Parse Archived Posts
    const archivedPath = path.join(__dirname, '../jaiprakashelvan instagram/your_instagram_activity/media/archived_posts.html');
    parsePostFile(archivedPath, 'archive', archivedPosts);

    console.log(`Parsed ${posts.length} main posts and ${archivedPosts.length} archived posts.`);

    // --- REELS PARSING ---
    const parseReels = (reelsPath, targetArray, customVideoBase = null) => {
        if (fs.existsSync(reelsPath)) {
            const reelsContent = fs.readFileSync(reelsPath, 'utf8');
            const reelBlocks = reelsContent.split('class="pam');

            reelBlocks.forEach((block, index) => {
                if (index === 0) return;

                // Extract Video Source
                const videoMatch = block.match(/src="(media\/reels\/[^"]+)"/);
                if (!videoMatch) return;

                const localPath = videoMatch[1];
                const relativePath = localPath.replace('media/', '');
                const base = customVideoBase || CLOUDINARY_VIDEO_BASE;
                const webPath = `${base}/${relativePath}`;

                const dateMatch = block.match(/class="_3-94 _a6-o">([^<]+)</);
                const date = dateMatch ? dateMatch[1] : '';

                const captionMatch = block.match(/class="_3-95 _2pim _a6-h _a6-i">([\s\S]*?)<\/div>/);
                let caption = captionMatch ? captionMatch[1] : '';
                caption = caption.replace(/<[^>]+>/g, '').trim();

                // Push to target array
                targetArray.push({
                    id: `reel_${index}_${Date.now()}`,
                    image: webPath,
                    images: [webPath],
                    caption: caption,
                    date: date,
                    timestamp: new Date(date).getTime(),
                    type: 'video'
                });
            });
            console.log(`Parsed reels from ${reelsPath}. Total now: ${targetArray.length}`);
        }
    };

    parseReels(path.join(__dirname, '../jaiprakashelvan instagram/your_instagram_activity/media/reels.html'), reels);
    // Note: If elvan.jp has reels.html, parse it too into arts or reels? 
    // The user said "arts in that add these post from this account", so art reels go to arts.
    parseReels(path.join(__dirname, '../elvan.jp Insta HTML/your_instagram_activity/media/reels.html'), arts, ARTS_CLOUDINARY_VIDEO_BASE);

    console.log(`Final Counts - Posts: ${posts.length}, Arts: ${arts.length}, Reels: ${reels.length}`);

    // --- STORIES PARSING (New) ---
    const parseStories = (storiesInputPath, customBase = null, customVideoBase = null) => {
        if (!fs.existsSync(storiesInputPath)) return;
        const storiesHtml = fs.readFileSync(storiesInputPath, 'utf8');
        const storyBlocks = storiesHtml.split('class="pam');

        storyBlocks.forEach((block, index) => {
            if (index === 0) return;

            // Extract Media (Video or Image)
            const mediaMatch = block.match(/src="(media\/stories\/[^"]+)"/);
            if (!mediaMatch) return;

            const localPath = mediaMatch[1];
            const relativePath = localPath.replace('media/', '');
            const isVideo = localPath.endsWith('.mp4');
            const base = isVideo ? (customVideoBase || CLOUDINARY_VIDEO_BASE) : (customBase || CLOUDINARY_BASE);
            let cloudPath = relativePath;
            if (cloudPath.toLowerCase().endsWith('.heic') || cloudPath.toLowerCase().endsWith('.heif')) {
                cloudPath = cloudPath.replace(/\.(heic|heif)$/i, '.jpg');
            }
            const webPath = `${base}/${cloudPath}`;

            // Extract Date
            const dateMatch = block.match(/class="_3-94 _a6-o">([^<]+)</);
            const dateStr = dateMatch ? dateMatch[1] : '';
            const timestamp = new Date(dateStr).getTime();

            // Extract Month-Year for grouping
            const dateObj = new Date(dateStr);
            const monthYear = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });

            // Extract Caption/Text
            const textMatch = block.match(/class="_3-95 _2pim _a6-h _a6-i">([\s\S]*?)<\/div>/);
            let text = textMatch ? textMatch[1] : '';
            text = text.replace(/<[^>]+>/g, '').trim();

            stories.push({
                id: `story_${index}`,
                url: webPath,
                type: isVideo ? 'video' : 'image',
                date: dateStr,
                timestamp: timestamp,
                group: monthYear,
                caption: text,
                index: index // Adding index to use as tie-breaker for sorting
            });
        });
    };

    parseStories(path.join(__dirname, '../jaiprakashelvan instagram/your_instagram_activity/media/stories.html'));
    parseStories(path.join(__dirname, '../elvan.jp Insta HTML/your_instagram_activity/media/stories.html'), ARTS_CLOUDINARY_BASE, ARTS_CLOUDINARY_VIDEO_BASE);

    console.log(`Found ${stories.length} total stories.`);

    // Group Stories by Month-Year
    const highlights = {};
    stories.forEach(story => {
        if (!highlights[story.group]) {
            highlights[story.group] = {
                id: story.group.replace(/\s+/g, '_'),
                title: story.group,
                cover: story.type === 'image' ? story.url : story.url,
                stories: []
            };
        }
        highlights[story.group].stories.push(story);
    });

    // Convert map to array and Sort groups by date (Newest First)
    const highlightsArray = Object.values(highlights).sort((a, b) => {
        const aMax = Math.max(...a.stories.map(s => s.timestamp));
        const bMax = Math.max(...b.stories.map(s => s.timestamp));
        return bMax - aMax;
    });

    highlightsArray.forEach(group => {
        group.stories.sort((a, b) => {
            if (a.timestamp !== b.timestamp) {
                return a.timestamp - b.timestamp;
            }
            // If timestamps are equal, use original index (descending for oldest first in newest-first HTML)
            return b.index - a.index;
        });
        if (group.stories.length > 0 && group.stories[0].type === 'image') {
            group.cover = group.stories[0].url;
        }
    });

    // --- PROFILE PARSING (New) ---
    const profile = {
        username: 'elvanparthasarathy', // Override with requested username
        name: 'Elvan', // Override with requested name
        bio: '',
        profilePic: '',
        followers: 0,
        following: 0,
        postsCount: posts.length
    };

    try {
        // 1. Personal Info
        const personalInfoPath = path.join(__dirname, '../jaiprakashelvan instagram/personal_information/personal_information/personal_information.html');
        if (fs.existsSync(personalInfoPath)) {
            const pContent = fs.readFileSync(personalInfoPath, 'utf8');

            const bioMatch = pContent.match(/Bio<div><div>([\s\S]*?)<\/div><\/div>/);
            if (bioMatch) {
                profile.bio = bioMatch[1]
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<[^>]+>/g, '')
                    .replace(/&#039;/g, "'")
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, '&')
                    .replace(/&#064;/g, '@') // Handle encoded @
                    .replace(/Check out my arts @elvan.jp ✨️/g, '') // Remove specific link
                    .replace(/ஜெய்/g, 'Elvan') // Replace name as requested
                    .trim();
            }

            const nameMatch = pContent.match(/Name<div><div>([\s\S]*?)<\/div><\/div>/);
            if (nameMatch) {
                const rawName = nameMatch[1].trim();
                if (rawName !== 'ஜெய்' && rawName !== 'Jaiprakash Elvan') {
                    // Only use if it's not the old name we want to override
                    profile.name = 'Elvan';
                }
            }

            const userMatch = pContent.match(/Username<div><div>([\s\S]*?)<\/div><\/div>/);
            if (userMatch) {
                const rawUser = userMatch[1].trim();
                profile.username = 'elvanparthasarathy'; // Forced override
            }

            // --- FINAL BRANDING OVERRIDES ---
            profile.username = 'elvanparthasarathy';
            profile.name = 'Elvan';
            profile.bio = profile.bio
                .replace(/Check out my arts @elvan.jp ✨️/g, '')
                .replace(/Check out my arts &#064;elvan\.jp ✨️/g, '') // Double check encoded version too
                .replace(/Jaiprakash Elvan/g, 'Elvan')
                .replace(/ஜெய்/g, 'Elvan')
                .trim();

            const picMatch = pContent.match(/href="(media\/other\/[^"]+)"/);
            if (picMatch) {
                const relativePath = picMatch[1].replace('media/', '');
                let cloudPath = relativePath;
                if (cloudPath.toLowerCase().endsWith('.heic') || cloudPath.toLowerCase().endsWith('.heif')) {
                    cloudPath = cloudPath.replace(/\.(heic|heif)$/i, '.jpg');
                }
                profile.profilePic = `${CLOUDINARY_BASE}/${cloudPath}`;
            }
        }

        // 2. Followers List
        const followersList = [];
        const followersPath = path.join(__dirname, '../jaiprakashelvan instagram/connections/followers_and_following/followers_1.html');
        if (fs.existsSync(followersPath)) {
            const fContent = fs.readFileSync(followersPath, 'utf8');
            const userBlocks = fContent.match(/<div class="_a6-p">[\s\S]*?<\/div><\/div><\/div>/g);
            if (userBlocks) {
                userBlocks.forEach(block => {
                    const linkMatch = block.match(/<a target="_blank" href="(https:\/\/www\.instagram\.com\/[^"]+)">([^<]+)<\/a>/);
                    const dateMatch = block.match(/<\/a><\/div><div>([^<]+)<\/div>/);
                    if (linkMatch) {
                        followersList.push({
                            username: linkMatch[2],
                            url: linkMatch[1],
                            date: dateMatch ? dateMatch[1] : ''
                        });
                    }
                });
            }
        }
        profile.followersList = followersList;
        profile.followers = followersList.length;

        // 3. Following List
        const followingList = [];
        const followingPath = path.join(__dirname, '../jaiprakashelvan instagram/connections/followers_and_following/following.html');
        if (fs.existsSync(followingPath)) {
            const flContent = fs.readFileSync(followingPath, 'utf8');
            const userBlocks = flContent.match(/<div class="_a6-p">[\s\S]*?<\/div><\/div><\/div>/g);
            if (userBlocks) {
                userBlocks.forEach(block => {
                    const linkMatch = block.match(/<a target="_blank" href="(https:\/\/www\.instagram\.com\/[^"]+)">([^<]+)<\/a>/);
                    const dateMatch = block.match(/<\/a><\/div><div>([^<]+)<\/div>/);
                    if (linkMatch) {
                        followingList.push({
                            username: linkMatch[2],
                            url: linkMatch[1],
                            date: dateMatch ? dateMatch[1] : ''
                        });
                    }
                });
            }
        }
        profile.followingList = followingList;
        profile.following = followingList.length;
    } catch (e) {
        console.error("Error parsing profile:", e);
    }

    const fileContent = `const instagramData = {
    posts: ${JSON.stringify(posts, null, 2)},
    reels: ${JSON.stringify(reels, null, 2)},
    arts: ${JSON.stringify(arts, null, 2)},
    archivedPosts: ${JSON.stringify(archivedPosts, null, 2)},
    dmChats: []
};

export const profileData = ${JSON.stringify(profile, null, 2)};
    
export const storyHighlights = ${JSON.stringify(highlightsArray, null, 2)};

export default instagramData;`;

    // Ensure dir exists
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully wrote data to ${outputPath}`);

} catch (err) {
    console.error('Error parsing Instagram data:', err);
}
