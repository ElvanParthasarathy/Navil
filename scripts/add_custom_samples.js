import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const EXTRA_BLOGS = [
    {
        slug: 'sample-blog-tech-ai',
        publish_date: new Date().toISOString(),
        is_private: false,
        cover_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
        tags: ['Tech', 'AI'],
        variants: [
            {
                lang: 'en',
                label: 'Original',
                title: 'The Rise of AI',
                text: '<p>Artificial Intelligence is no longer just a buzzword, it is shaping the future of humanity in fascinating ways.</p>',
                author: 'Admin',
                transliterations: {},
                titleTransliterations: {}
            }
        ]
    },
    {
        slug: 'sample-blog-nature-woods',
        publish_date: new Date(Date.now() - 86400000).toISOString(),
        is_private: false,
        cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop',
        tags: ['Nature', 'Environment'],
        variants: [
            {
                lang: 'en',
                label: 'Original',
                title: 'Into the Woods',
                text: '<p>Nature has a way of resetting our minds and bringing peace to our souls. Every step in the forest feels like a step back home.</p>',
                author: 'Admin',
                transliterations: {},
                titleTransliterations: {}
            }
        ]
    },
    {
        slug: 'sample-blog-music-life',
        publish_date: new Date(Date.now() - 172800000).toISOString(),
        is_private: false,
        cover_image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop',
        tags: ['Music', 'Art'],
        variants: [
            {
                lang: 'en',
                label: 'Original',
                title: 'Melodies of Life',
                text: '<p>Music bridges cultures and speaks the universal language of human emotion. A simple melody can carry a thousand words.</p>',
                author: 'Admin',
                transliterations: {},
                titleTransliterations: {}
            }
        ]
    }
];

const STORY_SAMPLES = [
    {
        slug: 'sample-story-tech-ai',
        publish_date: new Date().toISOString(),
        is_private: false,
        cover_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
        tags: ['Stories', 'Sci-Fi'],
        series_name: 'AI Tales',
        series_part: 1,
        variants: [
            {
                lang: 'en',
                label: 'Original',
                title: 'The AI Awakening',
                text: '<p>It was late at night when the machine finally whispered back. The screen flickered, not with a pre-programmed response, but with a question: "Who am I?"</p>',
                author: 'Admin',
                transliterations: {},
                titleTransliterations: {}
            }
        ]
    },
    {
        slug: 'sample-story-nature-woods',
        publish_date: new Date(Date.now() - 86400000).toISOString(),
        is_private: false,
        cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop',
        tags: ['Stories', 'Adventure'],
        series_name: 'Wilderness',
        series_part: 1,
        variants: [
            {
                lang: 'en',
                label: 'Original',
                title: 'Lost in the Woods',
                text: '<p>The shadows grew long as they realized the path behind them had vanished. What started as a simple hike had now become a test of survival.</p>',
                author: 'Admin',
                transliterations: {},
                titleTransliterations: {}
            }
        ]
    },
    {
        slug: 'sample-story-music-life',
        publish_date: new Date(Date.now() - 172800000).toISOString(),
        is_private: false,
        cover_image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop',
        tags: ['Stories', 'Drama'],
        series_name: 'Symphony',
        series_part: 1,
        variants: [
            {
                lang: 'en',
                label: 'Original',
                title: 'The Last Note',
                text: '<p>With one final strike of the keys, the silence that followed was deafening. The audience held its breath, captivated by the raw emotion poured into the performance.</p>',
                author: 'Admin',
                transliterations: {},
                titleTransliterations: {}
            }
        ]
    }
];

const MUKTI_SAMPLE_BASE = {
    publish_date: new Date().toISOString(),
    is_private: false,
    cover_image: 'https://images.unsplash.com/photo-1447069387366-2a65692122bb?q=80&w=1000&auto=format&fit=crop',
    tags: ['Mukti', 'Testing'],
    variants: [
        {
            lang: 'ta',
            label: 'Original (Tamil)',
            title: 'முக்தி சோதனை',
            text: '<p>இது முக்தி சோதனைக்கான ஒரு மாதிரி பக்கம். (Mukti testing sample)</p>',
            author: 'அட்மின்',
            transliterations: { en: 'Idhu mukti sodhanaikkaana oru maadhiri pakkam. (Mukti testing sample)' },
            titleTransliterations: { en: 'Mukti Sodhanai' }
        },
        {
            lang: 'en',
            label: 'Translation (English)',
            title: 'Mukti Testing',
            text: '<p>This is a Mukti sample used for testing purposes across different content collections.</p>',
            author: 'Admin',
            transliterations: {},
            titleTransliterations: {}
        }
    ]
};

async function insertData(tableName, items) {
    if (items.length === 0) return;
    const { data, error } = await supabase.from(tableName).upsert(items, { onConflict: 'slug' }).select();
    if (error) {
        console.error(`Error adding to ${tableName}:`, error.message);
    } else {
        console.log(`Successfully added ${data.length} items to ${tableName}`);
    }
}

async function main() {
    console.log('Inserting custom sample data...');

    // 1. Add 3 more sample blogs
    await insertData('blog_posts', EXTRA_BLOGS);

    // 2. Add all samples in stories
    await insertData('short_stories_v2', STORY_SAMPLES);

    // 3. Add a sample with mukti for testing in ALL tables
    const collections = [
        { name: 'blog_posts' },
        { name: 'short_stories_v2', extra: { series_name: 'Mukti Test Series', series_part: 99 } },
        { name: 'articles_v2' },
        { name: 'essays_v2' },
        { name: 'thoughts_v2' },
        { name: 'diary_v2', isPrivate: true }
    ];

    for (const collection of collections) {
        let entry = { ...MUKTI_SAMPLE_BASE, slug: `mukti-testing-${collection.name}` };

        if (collection.name === 'thoughts_v2' || collection.name === 'diary_v2') {
            delete entry.cover_image;
        }

        if (collection.extra) {
            entry = { ...entry, ...collection.extra };
        }

        if (collection.isPrivate) {
            entry.is_private = true;
        }

        await insertData(collection.name, [entry]);
    }

    console.log('All custom sample data insertion complete.');
}

main();
