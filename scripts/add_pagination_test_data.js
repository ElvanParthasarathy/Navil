import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const generateDummyItems = (count, tableType) => {
    const items = [];
    for (let i = 1; i <= count; i++) {
        const date = new Date(Date.now() - i * 86400000).toISOString();
        const isWritingTable = ['poems', 'quotes'].includes(tableType);

        const item = {
            id: crypto.randomUUID(),
            display_order: i + 100
        };

        if (!isWritingTable) {
            const slug = `dummy-${tableType}-${i}-${Math.random().toString(36).substring(7)}`;
            item.slug = slug;
            item.title = `Sample ${tableType} #${i}`;
            item.is_private = false;
            item.tags = ['Dummy', 'Test'];
            item.theme = 'Philosophy';
            item.classification = 'Sample';
        }

        if (tableType === 'poems') {
            item.theme = 'Philosophy';
            item.classification = 'Sample';
        }

        if (tableType === 'quotes') {
            item.tag = 'Philosophy';
            item.classification = 'Sample';
        }

        if (isWritingTable) {
            item.date = date; // For WritingPage.jsx (Poems/Quotes)
            item.title = `Dummy ${tableType} #${i}`;
            item.variants = [
                {
                    lang: 'ta',
                    title: `மீச்சிறுDummy ${i}`,
                    text: `<p>இது ஒரு மாதிரி பதிவு எண் ${i}. பிணைப்பு மற்றும் வரிசைப்படுத்தும் முறையை சோதிக்க இது உருவாக்கப்பட்டது.</p>`,
                    author: 'Admin'
                },
                {
                    lang: 'en',
                    title: `Dummy Item ${i}`,
                    text: `<p>This is a dummy entry number ${i} for testing pagination and layout consistency.</p>`,
                    author: 'Admin'
                }
            ];
        } else {
            item.publish_date = date; // For CategoryListView.jsx
            // Only add cover_image for tables that have it
            if (!['thoughts_v2', 'diary_v2'].includes(tableType)) {
                item.cover_image = `https://picsum.photos/seed/${item.slug}/800/400`;
            }
            item.variants = [
                {
                    lang: 'ta',
                    title: `மாதிரி கட்டுரை ${i}`,
                    text: `<p>இந்த கட்டுரை எண் ${i} பக்கமாக்கல் சோதனையினை மேற்கொள்ள உருவாக்கப்பட்டுள்ளது.</p>`,
                    author: 'Admin',
                    excerpt: `இது மாதிரி கட்டுரை ${i} -க்கான ஒரு சிறு குறிப்பு.`
                },
                {
                    lang: 'en',
                    title: `Sample Post ${i}`,
                    text: `<p>This is a sample post number ${i} generated specifically to verify that pagination works correctly.</p>`,
                    author: 'Admin',
                    excerpt: `A short preview for sample post ${i} to test the card layout.`
                }
            ];
        }

        // Specific table overrides
        if (tableType === 'stories') {
            item.series_name = 'Pagination Test Series';
            item.series_part = i;
        }

        items.push(item);
    }
    return items;
};

async function insertInBatch(tableName, items) {
    console.log(`Inserting ${items.length} items into ${tableName}...`);
    const { data, error } = await supabase.from(tableName).insert(items).select();
    if (error) {
        console.error(`Error adding to ${tableName}:`, error);
    } else {
        console.log(`Successfully added ${items.length} items to ${tableName}`);
    }
}

async function main() {
    console.log('--- Pagination Test Data Injection ---');

    const tables = [
        { name: 'poems', type: 'writing' },
        { name: 'quotes', type: 'writing' },
        { name: 'blog_posts', type: 'category' },
        { name: 'articles_v2', type: 'category' },
        { name: 'essays_v2', type: 'category' },
        { name: 'short_stories_v2', type: 'category' },
        { name: 'thoughts_v2', type: 'category' },
        { name: 'diary_v2', type: 'category' }
    ];

    // Cleanup existing dummy data to avoid slug conflicts
    console.log('Cleaning up old dummy items...');
    for (const table of tables) {
        const isNotSluggable = ['poems', 'quotes'].includes(table.name);
        if (isNotSluggable) continue;

        const { error } = await supabase.from(table.name).delete().ilike('slug', 'dummy-%');
        if (error) console.warn(`Cleanup failed for ${table.name}:`, error.message);
    }

    for (const table of tables) {
        const items = generateDummyItems(15, table.name);
        await insertInBatch(table.name, items);
    }

    console.log('--- All Test Data Injected! ---');
}

main();
