import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupTable(tableName) {
    console.log(`Cleaning up dummy items from ${tableName}...`);
    // Delete items where title starts with 'Dummy'
    const { error } = await supabase.from(tableName).delete().ilike('title', 'Dummy%');

    if (error) {
        console.error(`Error cleaning up ${tableName}:`, error.message);
    } else {
        console.log(`Successfully cleaned up dummy items from ${tableName}`);
    }
}

async function main() {
    await cleanupTable('poems');
    await cleanupTable('quotes');
}

main();
