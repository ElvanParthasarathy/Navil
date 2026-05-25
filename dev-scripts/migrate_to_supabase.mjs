import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://kvzltutlfuvyzigtmoqw.supabase.co';
const SUPABASE_KEY = 'sb_secret_pdlPG6W2OcEr2wWxeS2AGQ_WyvkE7hK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
    // --- POEMS ---
    console.log('📖 Loading poems.json...');
    const poems = JSON.parse(readFileSync('src/data/poems.json', 'utf-8'));

    const poemRows = poems.map(p => ({
        id: String(p.id),
        title: p.title || '',
        date: p.date || null,
        style: p.style || '',
        theme: p.theme || '',
        meter: p.meter || '',
        dedication: p.dedication || '',
        classification: p.classification || null,
        is_pinned: p.isPinned || false,
        pin_expires_at: p.pinExpiresAt || null,
        urai: p.urai || '',
        notes: p.notes || '',
        variants: p.variants || []
    }));

    console.log(`   Uploading ${poemRows.length} poems...`);
    const { data: pData, error: pErr } = await supabase.from('poems').upsert(poemRows);
    if (pErr) {
        console.error('   ❌ Poems error:', pErr.message);
    } else {
        console.log(`   ✅ ${poemRows.length} poems uploaded!`);
    }

    // --- QUOTES ---
    console.log('💬 Loading quotes.json...');
    const quotes = JSON.parse(readFileSync('src/data/quotes.json', 'utf-8'));

    const quoteRows = quotes.map(q => ({
        id: String(q.id),
        tag: q.tag || '',
        date: q.date || null,
        is_pinned: q.isPinned || false,
        pin_expires_at: q.pinExpiresAt || null,
        urai: q.urai || '',
        notes: q.notes || '',
        variants: q.variants || []
    }));

    console.log(`   Uploading ${quoteRows.length} quotes...`);
    const { data: qData, error: qErr } = await supabase.from('quotes').upsert(quoteRows);
    if (qErr) {
        console.error('   ❌ Quotes error:', qErr.message);
    } else {
        console.log(`   ✅ ${quoteRows.length} quotes uploaded!`);
    }

    // --- VERIFY ---
    console.log('\n🔍 Verifying...');
    const { data: allPoems } = await supabase.from('poems').select('id,title,theme,style');
    console.log(`   Poems in Supabase: ${allPoems?.length || 0}`);
    allPoems?.forEach(p => console.log(`     [${(p.theme || '').padEnd(12)}] [${(p.style || '').padEnd(16)}] ${p.title}`));

    const { data: allQuotes } = await supabase.from('quotes').select('id,tag,date');
    console.log(`   Quotes in Supabase: ${allQuotes?.length || 0}`);
    allQuotes?.forEach(q => console.log(`     [${(q.tag || '').padEnd(15)}] [${(q.date || '').toString().padEnd(20)}]`));

    console.log('\n🎉 Migration complete!');
}

migrate().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
