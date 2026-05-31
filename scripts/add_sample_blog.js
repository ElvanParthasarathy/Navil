import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const samplePost = {
        slug: 'sample-bilingual-post',
        is_private: false,
        cover_image: 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1000&auto=format&fit=crop',
        tags: ['Sample', 'Testing'],
        variants: [
            {
                lang: 'ta',
                label: 'Original',
                title: 'இயற்கையின் அழகு',
                text: '<p>காலைச் சூரியனின் கிரணங்கள் பனித்துளிகளில் பட்டுத் தெறிக்கும் அழகு, மனதிற்கு பெரும் அமைதியைத் தருகிறது.</p><p>இயற்கை எப்போதும் நமக்கு ஓய்வையும் ஆறுதலையும் தரக்கூடிய ஒரு சிறந்த நண்பன்.</p>',
                author: 'அட்மின்',
                transliterations: {
                    en: '<p>Kaalai sooriyanin kiranangal panithuligalil pattu therikkum azhagu, manadhirku perum amaidhiyai tharugiradhu.</p><p>Iyarkai eppodhum namakku oivaivum aarudhalaiyum tharakkoodiya oru sirandha nanban.</p>'
                },
                titleTransliterations: {
                    en: 'Iyarkaiyin Azhagu'
                }
            },
            {
                lang: 'ml',
                label: 'Malayalam',
                title: 'പ്രകൃതിയുടെ സൗന്ദര്യം',
                text: '<p>പ്രഭാത സൂര്യന്റെ കിരണങ്ങൾ മഞ്ഞുതുള്ളികളിൽ പതിക്കുന്ന സൗന്ദര്യം മനസ്സിന് വലിയ സമാധാനം നൽകുന്നു.</p><p>പ്രകൃതി എപ്പോഴും നമുക്ക് വിശ്രമവും ആശ്വാസവും നൽകുന്ന മികച്ച സുഹൃത്താണ്.</p>',
                author: 'അഡ്മിൻ',
                transliterations: {
                    en: '<p>Prabhatha sooryante kiranangal manjuthullikalil pathikkunna soundaryam manassinu valiya samadhanam nalkunnu.</p><p>Prakrithi eppozhum namukku vishramavum aashwasavum nalkunna mikacha suhruthaanu.</p>',
                    ta: '<p>பிரபாத சூர்யன்டெ கிரணங்கள் மஞ்யுதுள்ளிகளில் பதிக்குன்ன சௌந்தர்யம் மனஸ்ஸினு வலிய சமாதானம் நல்குன்னு.</p><p>ப்ரக்ருதி எப்பொழும் நமக்கு விஷ்ரமவும் ஆஷ்வாஸவும் நல்குன்ன மிகச்ச சுஹ்ருத்தானு.</p>'
                },
                titleTransliterations: {
                    en: 'Prakrithiyude Soundaryam',
                    ta: 'ப்ரக்ருதியுடெ சௌந்தர்யம்'
                }
            },
            {
                lang: 'en',
                label: 'Translation',
                title: 'The Beauty of Nature',
                text: '<p>The beauty of the morning sun\'s rays reflecting on dewdrops brings great peace to the mind.</p><p>Nature is always a great friend that can give us rest and comfort.</p>',
                author: 'Nirvaagi',
                transliterations: {},
                titleTransliterations: {}
            }
        ]
    };

    const { data, error } = await supabase
        .from('blog_posts')
        .insert([samplePost])
        .select();

    if (error) {
        console.error('Error adding sample post:', error);
    } else {
        console.log('Successfully added sample post!', data[0].id);
    }
}

main();
