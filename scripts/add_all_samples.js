import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BILINGUAL_BLOGS = [
    {
        slug: 'sample-blog-tech',
        publish_date: new Date().toISOString(),
        is_private: false,
        cover_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
        tags: ['Tech', 'Future'],
        variants: [
            {
                lang: 'ta',
                label: 'Original',
                title: 'தொழில்நுட்பத்தின் எதிர்காலம்',
                text: '<p>வருங்கால தொழில்நுட்பங்கள் நமது அன்றாட வாழ்வை எவ்வாறு மாற்றப்போகின்றன என்பதை கற்பனை செய்து பார்ப்பது வியப்பாக இருக்கிறது.</p>',
                author: 'அட்மின்',
                transliterations: { en: '<p>Varungaala thozhilnutpangal namadhu andraada vaazhvai evvaaru maatrapogindrana enbadhai karpanai seithu paarppadhu viyappaga irukkiradhu.</p>' },
                titleTransliterations: { en: 'Thozhilnutpathin Edhirkaalam' }
            },
            {
                lang: 'en',
                label: 'Translation',
                title: 'The Future of Technology',
                text: '<p>It is amazing to imagine how future technologies will change our everyday lives.</p>',
                author: 'Admin',
                transliterations: {},
                titleTransliterations: {}
            }
        ]
    },
    {
        slug: 'sample-blog-travel',
        publish_date: new Date(Date.now() - 86400000).toISOString(),
        is_private: false,
        cover_image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop',
        tags: ['Travel', 'Explore'],
        variants: [
            {
                lang: 'ta',
                label: 'Original',
                title: 'பயணத்தின் சுவை',
                text: '<p>புதிய இடங்களுக்கு பயணிப்பது மனதிற்கு மட்டுமல்ல, அறிவிற்கும் புதிய வெளிச்சம் தருகிறது.</p>',
                author: 'அட்மின்',
                transliterations: {},
                titleTransliterations: {}
            },
            {
                lang: 'en',
                label: 'Translation',
                title: 'The Taste of Travel',
                text: '<p>Traveling to new places brings new light not only to the mind, but also to knowledge.</p>',
                author: 'Admin',
                transliterations: {},
                titleTransliterations: {}
            }
        ]
    },
    {
        slug: 'sample-blog-art',
        publish_date: new Date(Date.now() - 172800000).toISOString(),
        is_private: false,
        cover_image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop',
        tags: ['Art', 'Creativity'],
        variants: [
            {
                lang: 'ta',
                label: 'Original',
                title: 'கலையின் மொழி',
                text: '<p>வார்த்தைகளால் சொல்ல முடியாதவற்றை ஒரு ஓவியம் அல்லது சிற்பம் எளிதாக உணர்த்திவிடும்.</p>',
                author: 'அட்மின்',
                transliterations: {},
                titleTransliterations: {}
            },
            {
                lang: 'en',
                label: 'Translation',
                title: 'The Language of Art',
                text: '<p>A painting or a sculpture can easily convey what words cannot express.</p>',
                author: 'Admin',
                transliterations: {},
                titleTransliterations: {}
            }
        ]
    }
];

const STORY_OATH_MUKTI = {
    slug: 'mukti-oath',
    publish_date: new Date().toISOString(),
    is_private: false,
    cover_image: 'https://images.unsplash.com/photo-1447069387366-2a65692122bb?q=80&w=1000&auto=format&fit=crop',
    tags: ['Stories', 'Sample'],
    series_name: 'Mukti Series',
    series_part: 1,
    variants: [
        {
            lang: 'ta',
            label: 'Original (Tamil)',
            title: 'முக்தி - அத்தியாயம் 1',
            text: '<p>அவன் முக்தி அடைவதற்காக தன் பயணத்தை தொடங்கினான். இருள் நிறைந்த காட்டில் தனித்து நடந்தான்...</p>',
            author: 'அட்மின்',
            transliterations: { en: 'Avan mukti adaivadharkaaga than payanathai thodanginaan. Irul niraindha kaattil thanithu nadandhaan...' },
            titleTransliterations: { en: 'Mukti - Aththiyaayam 1' }
        },
        {
            lang: 'en',
            label: 'Translation (English)',
            title: 'Mukti - Chapter 1',
            text: '<p>He began his journey to attain Mukti. He walked alone in the dark forest...</p>',
            author: 'Admin',
            transliterations: {},
            titleTransliterations: {}
        }
    ]
};

const ARTICLE_SAMPLE = {
    slug: 'sample-article-science',
    publish_date: new Date().toISOString(),
    is_private: false,
    cover_image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1000&auto=format&fit=crop',
    tags: ['Article', 'Science'],
    variants: [
        {
            lang: 'ta',
            label: 'Tamil Original',
            title: 'அறிவியல் சிந்தனைகள்',
            text: '<p>அறிவியல் என்பது வெறும் வினாக்களுக்கு விடை தேடும் பயணம் மட்டுமல்ல, புதிய வினாக்களை எழுப்பும் ஆற்றல்.</p>',
            author: 'அட்மின்',
            transliterations: {},
            titleTransliterations: {}
        }
    ]
};

const ESSAY_SAMPLE = {
    slug: 'sample-essay-philosophy',
    publish_date: new Date().toISOString(),
    is_private: false,
    cover_image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1000&auto=format&fit=crop',
    tags: ['Essay', 'Philosophy'],
    variants: [
        {
            lang: 'en',
            label: 'English Essay',
            title: 'The Meaning of Silence',
            text: '<p>Silence is not the absence of noise, but the presence of stillness. It is in silence that we truly listen.</p>',
            author: 'Admin',
            transliterations: {},
            titleTransliterations: {}
        }
    ]
};

const THOUGHT_SAMPLE = {
    slug: 'sample-thought-daily',
    publish_date: new Date().toISOString(),
    is_private: false,
    tags: ['Thoughts', 'Daily'],
    variants: [
        {
            lang: 'ta',
            label: 'Thought',
            title: 'நாளைய விடியல்',
            text: '<p>நேற்றைய கவலைகளை இன்று சுமக்காதே, நாளைய விடியல் புதிய நம்பிக்கையை கொண்டு வரும்.</p>',
            author: 'அட்மின்',
            transliterations: { en: 'Netraiya kavalaigalai indru sumakkaadhe, naalaiya vidiyal pudhiya nambikkaiyai kondu varum.' },
            titleTransliterations: { en: 'Naalaiya Vidiyal' }
        }
    ]
};

const DIARY_SAMPLE = {
    slug: 'sample-diary-entry',
    publish_date: new Date().toISOString(),
    is_private: true, // Diaries are usually private
    tags: ['Personal', 'Diary'],
    variants: [
        {
            lang: 'en',
            label: 'Journal Entry',
            title: 'A Productive Day',
            text: '<p>Today was incredibly productive. I managed to refactor the entire editor system to support variants perfectly. Looking forward to resting.</p>',
            author: 'Me',
            transliterations: {},
            titleTransliterations: {}
        }
    ]
};

async function insertData(tableName, items) {
    const { data, error } = await supabase.from(tableName).insert(items).select();
    if (error) {
        console.error(`Error adding to ${tableName}:`, error.message);
    } else {
        console.log(`Successfully added ${items.length} items to ${tableName}`);
    }
}

async function main() {
    console.log('Inserting sample data...');

    await insertData('blog_posts', BILINGUAL_BLOGS);
    await insertData('short_stories_v2', [STORY_OATH_MUKTI]);
    await insertData('articles_v2', [ARTICLE_SAMPLE]);
    await insertData('essays_v2', [ESSAY_SAMPLE]);
    await insertData('thoughts_v2', [THOUGHT_SAMPLE]);
    await insertData('diary_v2', [DIARY_SAMPLE]);

    console.log('All sample data insertion complete.');
}

main();
