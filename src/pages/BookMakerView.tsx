import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebaseClient';
import { ref, get } from 'firebase/database';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak,
    AlignmentType, TableOfContents, StyleLevel, BorderStyle,
    Header, Footer, PageNumber, NumberFormat
} from 'docx';
import { FiDownload, FiEdit3, FiChevronDown, FiChevronUp, FiPrinter } from 'react-icons/fi';
import MobileTopBar from '../components/MobileTopBar';
import { Helmet } from 'react-helmet-async';

const PRIMARY_FONT = "Mukta Malar";
const ENGLISH_FONT = "Georgia";

// Labels for original variant languages
const LANG_LABELS: Record<string, string> = {
    ta: 'தமிழ் (Tamil)', en: 'English', ml: 'മലയാളം (Malayalam)', hi: 'हिन्दी (Hindi)',
    te: 'తెలుగు (Telugu)', kn: 'ಕನ್ನಡ (Kannada)',
};

// Labels specifically for transliterations — clearly marked
const TRANSL_LABELS: Record<string, string> = {
    en: 'Thanglish Transliteration (ஆங்கில எழுத்துப்பெயர்ப்பு)',
    ta: 'Tamil Transliteration (தமிழ் எழுத்துப்பெயர்ப்பு)',
    thanglish: 'Thanglish Transliteration',
    ml: 'Malayalam Transliteration (മലയാള ലിപ്യന്തരണം)',
    hi: 'Hindi Transliteration (हिन्दी लिप्यंतरण)',
    te: 'Telugu Transliteration (తెలుగు లిప్యంతరీకరణ)',
    kn: 'Kannada Transliteration (ಕನ್ನಡ ಲಿಪ್ಯಂತರ)',
};

// Preferred ordering for transliteration keys
const TRANSL_ORDER = ['en', 'thanglish', 'ta', 'hi', 'ml', 'te', 'kn'];

// Strip HTML tags and convert <br> or <p> to newlines
const stripHtml = (html: string) => {
    if (!html) return '';
    let text = html.replace(/<\/p>\s*<p>/gi, '\n')
                   .replace(/<p>/gi, '')
                   .replace(/<\/p>/gi, '')
                   .replace(/<br\s*\/?>/gi, '\n')
                   .replace(/<[^>]+>/g, '');
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value.trim();
};

// Clean Firebase data (same as ReadingView)
const cleanItem = (data: any) => {
    if (data.variants) {
        if (!Array.isArray(data.variants)) data.variants = Object.values(data.variants);
        data.variants.forEach((v: any) => {
            if (v.transliterations?._empty) delete v.transliterations._empty;
            if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;
            if (v.authorTransliterations?._empty) delete v.authorTransliterations._empty;
            if (!v.transliterations) v.transliterations = {};
            if (!v.titleTransliterations) v.titleTransliterations = {};
            if (!v.authorTransliterations) v.authorTransliterations = {};
        });
    }
    return data;
};

const BookMakerView = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(true);
    const [poemsList, setPoemsList] = useState<any[]>([]);
    const [quotesList, setQuotesList] = useState<any[]>([]);
    const [settingsOpen, setSettingsOpen] = useState(true);

    // Editable metadata
    const [bookTitle, setBookTitle] = useState('நவில் தொகுப்பு');
    const [bookSubtitle, setBookSubtitle] = useState('Navil Collection');
    const [authorName, setAuthorName] = useState('எல்வன் பார்த்தசாரதி');
    const [authorNameEn, setAuthorNameEn] = useState('Elvan Parthasarathy');
    const [authorBio, setAuthorBio] = useState(
        'எழுத்தாளர், கவிஞர், மற்றும் படைப்பாளி. தமிழில் கவிதைகளையும், மொழிகளையும் (quotes) எழுதுவதில் ஆர்வம் கொண்டவர்.\n\nA writer, poet, and creator passionate about crafting poetry and quotes in Tamil.'
    );
    const [dedicationText, setDedicationText] = useState('என் உணர்வுகளுக்கு காரணமான அனைவருக்கும்...\nTo everyone who inspired my emotions...');
    const [includeTransliterations, setIncludeTransliterations] = useState(true);
    const [includeAllVariants, setIncludeAllVariants] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const poemsSnap = await get(ref(db, 'poems'));
                const quotesSnap = await get(ref(db, 'quotes'));

                const poemsData = poemsSnap.exists() ? poemsSnap.val() : {};
                const quotesData = quotesSnap.exists() ? quotesSnap.val() : {};

                const pList = Object.entries(poemsData)
                    .map(([key, val]: [string, any]) => cleanItem({ ...val, id: key }))
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                const qList = Object.entries(quotesData)
                    .map(([key, val]: [string, any]) => cleanItem({ ...val, id: key }))
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                setPoemsList(pList);
                setQuotesList(qList);
            } catch (err) {
                console.error("Error fetching preview data:", err);
            } finally {
                setIsLoadingPreview(false);
            }
        };
        fetchData();
    }, []);

    // Helper: get all text versions for a single item (poem/quote)
    const getAllVersions = useCallback((item: any) => {
        const versions: { label: string; title: string; text: string; author?: string }[] = [];
        const variants = item.variants || [];

        if (variants.length > 0) {
            variants.forEach((v: any, vIdx: number) => {
                const lang = v.lang || 'ta';
                const langLabel = LANG_LABELS[lang] || lang;
                const title = v.title || item.title || '';
                const text = stripHtml(v.text || '');
                const author = v.author || item.author || '';

                // Original version — clearly label the language
                versions.push({
                    label: `${langLabel} (Original)`,
                    title,
                    text,
                    author
                });

                // Transliterations — sorted in a clear, consistent order
                if (includeTransliterations) {
                    const translObj = v.transliterations || {};
                    const translKeys = Object.keys(translObj).filter(k => translObj[k]);

                    // Sort by preferred order
                    const sortedKeys = [...translKeys].sort((a, b) => {
                        const ai = TRANSL_ORDER.indexOf(a);
                        const bi = TRANSL_ORDER.indexOf(b);
                        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                    });

                    sortedKeys.forEach(tLang => {
                        const tTitle = v.titleTransliterations?.[tLang] || title;
                        const tAuthor = v.authorTransliterations?.[tLang] || author;
                        versions.push({
                            label: TRANSL_LABELS[tLang] || `${tLang} Transliteration`,
                            title: tTitle,
                            text: stripHtml(translObj[tLang]),
                            author: tAuthor
                        });
                    });
                }
            });
        } else {
            // Fallback: content-based or direct text
            const text = stripHtml(item.text || '');
            if (text) {
                versions.push({ label: 'Original', title: item.title || '', text, author: item.author || '' });
            }
        }

        return includeAllVariants ? versions : versions.slice(0, 1);
    }, [includeTransliterations, includeAllVariants]);

    // ---- DOCX GENERATION ----
    const generateBook = async () => {
        setIsGenerating(true);
        try {
            const children: any[] = [];

            // ═══ HALF-TITLE PAGE ═══
            children.push(
                new Paragraph({ spacing: { before: 6000 } }),
                new Paragraph({
                    children: [new TextRun({ text: bookTitle, font: PRIMARY_FONT, size: 48, bold: true })],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ children: [new PageBreak()] })
            );

            // ═══ TITLE PAGE ═══
            children.push(
                new Paragraph({ spacing: { before: 3000 } }),
                new Paragraph({
                    children: [new TextRun({ text: bookTitle, font: PRIMARY_FONT, size: 72, bold: true })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: bookSubtitle, font: ENGLISH_FONT, size: 36, italics: true, color: '555555' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 2000 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━━━━━', size: 24, color: 'AAAAAA' })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: authorName, font: PRIMARY_FONT, size: 32, bold: true })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: authorNameEn, font: ENGLISH_FONT, size: 28, color: '666666' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 2000 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: new Date().getFullYear().toString(), font: ENGLISH_FONT, size: 24, color: '888888' })],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ children: [new PageBreak()] })
            );

            // ═══ COPYRIGHT PAGE ═══
            children.push(
                new Paragraph({ spacing: { before: 8000 } }),
                new Paragraph({
                    children: [new TextRun({ text: `${bookTitle} — ${bookSubtitle}`, font: PRIMARY_FONT, size: 20, color: '666666' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: `© ${new Date().getFullYear()} ${authorName} (${authorNameEn})`, font: ENGLISH_FONT, size: 20, color: '666666' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: 'அனைத்து உரிமைகளும் ஆசிரியருக்கே.\nAll rights reserved.', font: PRIMARY_FONT, size: 18, color: '888888' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: `தொகுக்கப்பட்ட தேதி: ${new Date().toLocaleDateString('ta-IN')}`, font: PRIMARY_FONT, size: 18, color: '888888' })],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ children: [new PageBreak()] })
            );

            // ═══ DEDICATION PAGE ═══
            if (dedicationText.trim()) {
                children.push(
                    new Paragraph({ spacing: { before: 5000 } }),
                    ...dedicationText.split('\n').map(line =>
                        new Paragraph({
                            children: [new TextRun({ text: line, font: PRIMARY_FONT, size: 28, italics: true, color: '444444' })],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 200 },
                        })
                    ),
                    new Paragraph({ children: [new PageBreak()] })
                );
            }

            // ═══ AUTHOR BIO PAGE ═══
            if (authorBio.trim()) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: 'ஆசிரியர் குறிப்பு', font: PRIMARY_FONT, size: 36, bold: true })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 1000, after: 200 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: 'About the Author', font: ENGLISH_FONT, size: 28, italics: true, color: '777777' })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 600 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: '━━━━━━━━', size: 20, color: 'CCCCCC' })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 600 },
                    }),
                    ...authorBio.split('\n').map(line =>
                        new Paragraph({
                            children: [new TextRun({ text: line, font: PRIMARY_FONT, size: 24 })],
                            alignment: AlignmentType.JUSTIFIED,
                            spacing: { after: 200 },
                        })
                    ),
                    new Paragraph({ children: [new PageBreak()] })
                );
            }

            // ═══ TABLE OF CONTENTS ═══
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: 'பொருளடக்கம்', font: PRIMARY_FONT, size: 40, bold: true })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 1000, after: 200 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: 'Table of Contents', font: ENGLISH_FONT, size: 28, italics: true, color: '777777' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: '━━━━━━━━━━━━━━━━━━━━━━━━', size: 20, color: 'CCCCCC' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 },
                })
            );

            // Manual TOC entries
            if (poemsList.length > 0) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: 'பகுதி 1: நவில் மிழிகள் (Poems)', font: PRIMARY_FONT, size: 26, bold: true })],
                        spacing: { before: 300, after: 200 },
                    })
                );
                poemsList.forEach((poem, idx) => {
                    const title = poem.variants?.[0]?.title || poem.title || 'தலைப்பில்லை';
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: `    ${idx + 1}. `, font: ENGLISH_FONT, size: 22, color: '888888' }),
                                new TextRun({ text: title, font: PRIMARY_FONT, size: 22 })
                            ],
                            spacing: { after: 60 },
                        })
                    );
                });
            }

            if (quotesList.length > 0) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: 'பகுதி 2: நவில் மொழிகள் (Quotes)', font: PRIMARY_FONT, size: 26, bold: true })],
                        spacing: { before: 400, after: 200 },
                    })
                );
                quotesList.forEach((quote, idx) => {
                    const title = quote.variants?.[0]?.title || quote.title || `மொழி ${idx + 1}`;
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: `    ${idx + 1}. `, font: ENGLISH_FONT, size: 22, color: '888888' }),
                                new TextRun({ text: title, font: PRIMARY_FONT, size: 22 })
                            ],
                            spacing: { after: 60 },
                        })
                    );
                });
            }
            children.push(new Paragraph({ children: [new PageBreak()] }));

            // ═══ POEMS SECTION ═══
            if (poemsList.length > 0) {
                // Section divider page
                children.push(
                    new Paragraph({ spacing: { before: 5000 } }),
                    new Paragraph({
                        children: [new TextRun({ text: 'பகுதி 1', font: PRIMARY_FONT, size: 52, bold: true })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: 'நவில் மிழிகள்', font: PRIMARY_FONT, size: 40 })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: 'Poems', font: ENGLISH_FONT, size: 32, italics: true, color: '777777' })],
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({ children: [new PageBreak()] })
                );

                poemsList.forEach((poem) => {
                    const versions = getAllVersions(poem);

                    versions.forEach((ver, verIdx) => {
                        // Version label badge
                        if (versions.length > 1) {
                            children.push(
                                new Paragraph({
                                    children: [new TextRun({ text: `〔 ${ver.label} 〕`, font: PRIMARY_FONT, size: 18, color: '999999' })],
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { before: verIdx === 0 ? 200 : 400, after: 200 },
                                })
                            );
                        }

                        // Title
                        children.push(
                            new Paragraph({
                                children: [new TextRun({ text: ver.title, font: PRIMARY_FONT, size: 32, bold: true })],
                                spacing: { before: verIdx === 0 && versions.length <= 1 ? 200 : 0, after: 300 },
                            })
                        );

                        // Body lines
                        ver.text.split('\n').forEach(line => {
                            children.push(
                                new Paragraph({
                                    children: [new TextRun({ text: line, font: PRIMARY_FONT, size: 24 })],
                                    spacing: { after: 100 },
                                })
                            );
                        });

                        // Author
                        if (ver.author) {
                            children.push(
                                new Paragraph({
                                    children: [new TextRun({ text: `— ${ver.author}`, font: PRIMARY_FONT, size: 22, italics: true, color: '666666' })],
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { before: 200, after: 100 },
                                })
                            );
                        }

                        // Separator between versions
                        if (verIdx < versions.length - 1) {
                            children.push(
                                new Paragraph({
                                    children: [new TextRun({ text: '· · ·', size: 24, color: 'BBBBBB' })],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 200, after: 200 },
                                })
                            );
                        }
                    });

                    children.push(new Paragraph({ children: [new PageBreak()] }));
                });
            }

            // ═══ QUOTES SECTION ═══
            if (quotesList.length > 0) {
                // Section divider page
                children.push(
                    new Paragraph({ spacing: { before: 5000 } }),
                    new Paragraph({
                        children: [new TextRun({ text: 'பகுதி 2', font: PRIMARY_FONT, size: 52, bold: true })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: 'நவில் மொழிகள்', font: PRIMARY_FONT, size: 40 })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: 'Quotes', font: ENGLISH_FONT, size: 32, italics: true, color: '777777' })],
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({ children: [new PageBreak()] })
                );

                quotesList.forEach((quote, index) => {
                    const versions = getAllVersions(quote);

                    // Quote number
                    children.push(
                        new Paragraph({
                            children: [new TextRun({ text: `${index + 1}`, font: ENGLISH_FONT, size: 20, color: 'AAAAAA' })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 200, after: 400 },
                        })
                    );

                    versions.forEach((ver, verIdx) => {
                        if (versions.length > 1) {
                            children.push(
                                new Paragraph({
                                    children: [new TextRun({ text: `〔 ${ver.label} 〕`, font: PRIMARY_FONT, size: 18, color: '999999' })],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { after: 200 },
                                })
                            );
                        }

                        children.push(
                            new Paragraph({
                                children: [new TextRun({ text: ver.text, font: PRIMARY_FONT, size: 28, italics: true })],
                                alignment: AlignmentType.CENTER,
                                spacing: { before: 200, after: 200 },
                            })
                        );

                        if (ver.author) {
                            children.push(
                                new Paragraph({
                                    children: [new TextRun({ text: `— ${ver.author}`, font: PRIMARY_FONT, size: 22, color: '666666' })],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { after: 200 },
                                })
                            );
                        }

                        if (verIdx < versions.length - 1) {
                            children.push(
                                new Paragraph({
                                    children: [new TextRun({ text: '· · ·', size: 24, color: 'BBBBBB' })],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 100, after: 100 },
                                })
                            );
                        }
                    });

                    children.push(
                        new Paragraph({
                            children: [new TextRun({ text: '━━━━━━━━', size: 16, color: 'DDDDDD' })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 300, after: 300 },
                        })
                    );
                });
            }

            // ═══ COLOPHON / BACK PAGE ═══
            children.push(
                new Paragraph({ spacing: { before: 6000 } }),
                new Paragraph({
                    children: [new TextRun({ text: '❖', size: 36, color: 'AAAAAA' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: `இந்தத் தொகுப்பு ${poemsList.length} கவிதைகளையும் ${quotesList.length} மொழிகளையும் கொண்டது.`, font: PRIMARY_FONT, size: 22, color: '888888' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: `This collection contains ${poemsList.length} poems and ${quotesList.length} quotes.`, font: ENGLISH_FONT, size: 20, italics: true, color: '888888' })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 },
                }),
                new Paragraph({
                    children: [new TextRun({ text: `${bookTitle} · ${new Date().getFullYear()}`, font: PRIMARY_FONT, size: 20, color: 'AAAAAA' })],
                    alignment: AlignmentType.CENTER,
                }),
            );

            // Build document
            const doc = new Document({
                styles: {
                    default: {
                        document: {
                            run: { font: PRIMARY_FONT, size: 24 },
                        },
                    },
                },
                sections: [{
                    properties: {
                        page: {
                            margin: { top: 1440, bottom: 1440, left: 1200, right: 1200 },
                        },
                    },
                    headers: {
                        default: new Header({
                            children: [
                                new Paragraph({
                                    children: [new TextRun({ text: bookTitle, font: PRIMARY_FONT, size: 16, color: 'BBBBBB' })],
                                    alignment: AlignmentType.CENTER,
                                }),
                            ],
                        }),
                    },
                    footers: {
                        default: new Footer({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({ children: [PageNumber.CURRENT], font: ENGLISH_FONT, size: 18, color: 'AAAAAA' }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                }),
                            ],
                        }),
                    },
                    children,
                }],
            });

            const blob = await Packer.toBlob(doc);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style.display = "none";
            a.href = url;
            a.download = `${bookTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error("Error generating book:", error);
            alert("தொகுப்பை உருவாக்குவதில் பிழை ஏற்பட்டது. (Failed to generate book)");
        } finally {
            setIsGenerating(false);
        }
    };

    // ---- PREVIEW RENDERING ----
    const renderPoemPreview = (poem: any, idx: number) => {
        const versions = getAllVersions(poem);
        const MAX_VERSIONS = 2; // Split into multiple pages if more than 2 versions
        
        const chunks = [];
        for (let i = 0; i < versions.length; i += MAX_VERSIONS) {
            chunks.push(versions.slice(i, i + MAX_VERSIONS));
        }

        return chunks.map((chunk, chunkIdx) => (
            <div key={`poem-${idx}-page-${chunkIdx}`} className="a4-page">
                {chunk.map((ver, vIdx) => (
                    <div key={vIdx} className="book-version-block">
                        {versions.length > 1 && (
                            <div className="version-badge">
                                {ver.label} {chunkIdx > 0 && vIdx === 0 ? '(தொடர்ச்சி / Contd.)' : ''}
                            </div>
                        )}
                        <div className="a4-content-title">{ver.title}</div>
                        <div className="a4-content-body">{ver.text}</div>
                        {ver.author && <div className="a4-author">— {ver.author}</div>}
                        {vIdx < chunk.length - 1 && <div className="version-separator">· · ·</div>}
                    </div>
                ))}
            </div>
        ));
    };

    const renderQuotePreview = (quote: any, idx: number) => {
        const versions = getAllVersions(quote);
        const MAX_VERSIONS = 3; 
        
        const chunks = [];
        for (let i = 0; i < versions.length; i += MAX_VERSIONS) {
            chunks.push(versions.slice(i, i + MAX_VERSIONS));
        }

        return chunks.map((chunk, chunkIdx) => (
            <div key={`quote-${idx}-page-${chunkIdx}`} className="a4-page">
                {chunkIdx === 0 && <div className="quote-number">{idx + 1}</div>}
                {chunk.map((ver, vIdx) => (
                    <div key={vIdx} className="book-version-block" style={{ textAlign: 'center' }}>
                        {versions.length > 1 && (
                            <div className="version-badge" style={{ textAlign: 'center' }}>
                                {ver.label} {chunkIdx > 0 && vIdx === 0 ? '(தொடர்ச்சி / Contd.)' : ''}
                            </div>
                        )}
                        <div className="a4-content-quote">{ver.text}</div>
                        {ver.author && <div className="a4-author" style={{ textAlign: 'center' }}>— {ver.author}</div>}
                        {vIdx < chunk.length - 1 && <div className="version-separator">· · ·</div>}
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <>
            <Helmet>
                <title>நூல் தொகுப்பு | Book Maker</title>
            </Helmet>
            <MobileTopBar title="நூல் தொகுப்பு" />

            <div className="bookmaker-view page-view fadeIn">
                <style>{`
                    .bookmaker-view {
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                        overflow: hidden;
                        background: var(--bg-body);
                    }

                    /* ═══ TOOLBAR ═══ */
                    .bookmaker-toolbar {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 14px 24px;
                        background: var(--bg-panel);
                        border-bottom: 1px solid var(--border-light);
                        z-index: 10;
                        flex-shrink: 0;
                    }
                    .bookmaker-toolbar h1 {
                        font-size: 1.3rem;
                        margin: 0;
                        color: var(--text-main);
                        font-weight: 800;
                    }
                    .bookmaker-toolbar p {
                        margin: 2px 0 0 0;
                        color: var(--text-muted);
                        font-size: 0.8rem;
                    }
                    .toolbar-actions {
                        display: flex;
                        gap: 10px;
                        align-items: center;
                    }
                    .book-download-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        background: var(--text-main);
                        color: var(--bg-panel);
                        padding: 10px 20px;
                        border-radius: 8px;
                        border: none;
                        font-size: 0.9rem;
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .book-download-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 16px color-mix(in srgb, var(--text-main) 20%, transparent);
                    }
                    .book-download-btn:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                        transform: none;
                    }
                    .settings-toggle-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        background: transparent;
                        color: var(--text-main);
                        padding: 10px 16px;
                        border-radius: 8px;
                        border: 1px solid var(--border-light);
                        font-size: 0.85rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .settings-toggle-btn:hover {
                        background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    }

                    /* ═══ MAIN LAYOUT ═══ */
                    .bookmaker-body {
                        display: flex;
                        flex: 1;
                        overflow: hidden;
                    }

                    /* ═══ SETTINGS PANEL ═══ */
                    .bookmaker-settings {
                        width: 340px;
                        flex-shrink: 0;
                        background: var(--bg-panel);
                        border-right: 1px solid var(--border-light);
                        overflow-y: auto;
                        padding: 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                        transition: margin-left 0.3s ease, opacity 0.3s ease;
                    }
                    .bookmaker-settings.collapsed {
                        margin-left: -340px;
                        opacity: 0;
                        pointer-events: none;
                    }
                    .settings-section-title {
                        font-size: 0.75rem;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        color: var(--text-muted);
                        margin-bottom: 8px;
                    }
                    .settings-field {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                    }
                    .settings-field label {
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: var(--text-main);
                    }
                    .settings-field input,
                    .settings-field textarea {
                        padding: 10px 12px;
                        border-radius: 8px;
                        border: 1px solid var(--border-light);
                        background: var(--bg-body);
                        color: var(--text-main);
                        font-size: 0.9rem;
                        font-family: 'Mukta Malar', sans-serif;
                        resize: vertical;
                        transition: border-color 0.2s;
                    }
                    .settings-field input:focus,
                    .settings-field textarea:focus {
                        outline: none;
                        border-color: var(--text-main);
                    }
                    .settings-toggle-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 10px 0;
                    }
                    .settings-toggle-row span {
                        font-size: 0.85rem;
                        color: var(--text-main);
                    }
                    .toggle-switch {
                        position: relative;
                        width: 44px;
                        height: 24px;
                        cursor: pointer;
                    }
                    .toggle-switch input {
                        opacity: 0;
                        width: 0;
                        height: 0;
                    }
                    .toggle-slider {
                        position: absolute;
                        inset: 0;
                        background: var(--border-light);
                        border-radius: 24px;
                        transition: 0.3s;
                    }
                    .toggle-slider::before {
                        content: '';
                        position: absolute;
                        width: 18px;
                        height: 18px;
                        left: 3px;
                        bottom: 3px;
                        background: white;
                        border-radius: 50%;
                        transition: 0.3s;
                    }
                    .toggle-switch input:checked + .toggle-slider {
                        background: var(--text-main);
                    }
                    .toggle-switch input:checked + .toggle-slider::before {
                        transform: translateX(20px);
                    }
                    .settings-stats {
                        padding: 14px;
                        border-radius: 10px;
                        background: color-mix(in srgb, var(--text-main) 5%, transparent);
                        display: flex;
                        gap: 16px;
                        justify-content: center;
                    }
                    .stat-item {
                        text-align: center;
                    }
                    .stat-num {
                        font-size: 1.8rem;
                        font-weight: 800;
                        color: var(--text-main);
                        line-height: 1;
                    }
                    .stat-label {
                        font-size: 0.7rem;
                        color: var(--text-muted);
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    /* ═══ CANVAS ═══ */
                    .bookmaker-canvas {
                        flex: 1;
                        background: color-mix(in srgb, var(--bg-panel) 50%, #eef0f2);
                        overflow-y: auto;
                        padding: 40px 20px 100px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 40px;
                    }
                    [data-theme='dark'] .bookmaker-canvas {
                        background: color-mix(in srgb, var(--bg-panel) 30%, #0d1117);
                    }

                    /* ═══ A4 PAGES ═══ */
                    .a4-page {
                        background: white;
                        width: 100%;
                        max-width: 700px;
                        min-height: 900px;
                        height: fit-content;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
                        padding: 60px 50px;
                        display: flex;
                        flex-direction: column;
                        color: #000;
                        font-family: 'Mukta Malar', sans-serif;
                        position: relative;
                        border-radius: 2px;
                        overflow: visible;
                    }
                    .page-centered {
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                    }

                    /* Cover Page */
                    .cover-page {
                        background: linear-gradient(160deg, #1a1a2e, #16213e, #0f3460);
                        color: white;
                        min-height: 1000px;
                        border: none;
                    }
                    .cover-ornament {
                        font-size: 2rem;
                        color: rgba(255,255,255,0.15);
                        letter-spacing: 8px;
                    }
                    .cover-title {
                        font-size: 3.2rem;
                        font-weight: 800;
                        margin-bottom: 12px;
                        letter-spacing: 2px;
                    }
                    .cover-subtitle {
                        font-size: 1.6rem;
                        font-weight: 400;
                        font-style: italic;
                        color: rgba(255,255,255,0.6);
                        margin-bottom: 60px;
                        font-family: ${ENGLISH_FONT}, serif;
                    }
                    .cover-line {
                        width: 80px;
                        height: 2px;
                        background: rgba(255,255,255,0.3);
                        margin: 0 auto 30px;
                    }
                    .cover-author {
                        font-size: 1.5rem;
                        font-weight: 600;
                        margin-bottom: 6px;
                    }
                    .cover-author-en {
                        font-size: 1.1rem;
                        color: rgba(255,255,255,0.5);
                        font-family: ${ENGLISH_FONT}, serif;
                    }
                    .cover-year {
                        position: absolute;
                        bottom: 50px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-size: 1rem;
                        color: rgba(255,255,255,0.3);
                        font-family: ${ENGLISH_FONT}, serif;
                    }

                    /* Copyright Page */
                    .copyright-page {
                        justify-content: flex-end;
                        text-align: center;
                    }
                    .copyright-page .cp-text {
                        font-size: 0.85rem;
                        color: #999;
                        margin-bottom: 8px;
                        line-height: 1.6;
                    }

                    /* Dedication Page */
                    .dedication-page {
                        font-style: italic;
                        color: #555;
                        font-size: 1.2rem;
                        line-height: 2;
                    }

                    /* Bio Page */
                    .bio-page-title {
                        font-size: 1.8rem;
                        font-weight: 800;
                        margin-bottom: 4px;
                    }
                    .bio-page-subtitle {
                        font-size: 1.1rem;
                        font-style: italic;
                        color: #999;
                        margin-bottom: 30px;
                        font-family: ${ENGLISH_FONT}, serif;
                    }
                    .bio-page-line {
                        width: 60px;
                        height: 2px;
                        background: #ddd;
                        margin: 0 auto 30px;
                    }
                    .bio-page-body {
                        font-size: 1rem;
                        line-height: 1.9;
                        color: #333;
                        text-align: justify;
                        white-space: pre-wrap;
                    }

                    /* TOC Page */
                    .toc-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
                    .toc-subtitle { font-size: 1.1rem; font-style: italic; color: #999; margin-bottom: 30px; font-family: ${ENGLISH_FONT}, serif; }
                    .toc-section-title { font-size: 1.1rem; font-weight: 700; margin-top: 20px; margin-bottom: 8px; }
                    .toc-entry { font-size: 0.9rem; color: #444; padding: 3px 0; border-bottom: 1px dotted #eee; }
                    .toc-entry-num { color: #aaa; margin-right: 8px; font-family: ${ENGLISH_FONT}, serif; }

                    /* Section Divider */
                    .section-divider {
                        min-height: 900px;
                    }
                    .section-part-label { font-size: 2.5rem; font-weight: 800; margin-bottom: 10px; }
                    .section-part-name { font-size: 2rem; margin-bottom: 6px; }
                    .section-part-name-en { font-size: 1.3rem; font-style: italic; color: #999; font-family: ${ENGLISH_FONT}, serif; }

                    /* Content Pages */
                    .book-version-block { margin-bottom: 20px; }
                    .version-badge {
                        font-size: 0.7rem;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #aaa;
                        margin-bottom: 10px;
                        text-align: right;
                    }
                    .a4-content-title {
                        font-size: 1.6rem;
                        font-weight: 700;
                        margin-bottom: 16px;
                    }
                    .a4-content-body {
                        font-size: 1rem;
                        line-height: 2;
                        white-space: pre-wrap;
                        color: #111;
                    }
                    .a4-content-quote {
                        font-size: 1.2rem;
                        line-height: 2;
                        white-space: pre-wrap;
                        color: #222;
                        font-style: italic;
                    }
                    .a4-author {
                        font-size: 0.9rem;
                        color: #888;
                        font-style: italic;
                        text-align: right;
                        margin-top: 14px;
                    }
                    .version-separator {
                        text-align: center;
                        color: #ccc;
                        font-size: 1.2rem;
                        margin: 16px 0;
                    }
                    .quote-number {
                        text-align: center;
                        color: #ccc;
                        font-size: 0.9rem;
                        font-family: ${ENGLISH_FONT}, serif;
                        margin-bottom: 20px;
                    }

                    /* More pages indicator */
                    .more-indicator {
                        font-size: 1.3rem;
                        color: #999;
                        text-align: center;
                        line-height: 1.8;
                    }

                    /* Colophon */
                    .colophon-symbol { font-size: 2rem; color: #ccc; margin-bottom: 30px; }
                    .colophon-text { font-size: 0.95rem; color: #999; margin-bottom: 8px; line-height: 1.6; }

                    @media (max-width: 900px) {
                        .bookmaker-body { flex-direction: column; }
                        .bookmaker-settings {
                            width: 100%;
                            max-height: 300px;
                            border-right: none;
                            border-bottom: 1px solid var(--border-light);
                        }
                        .bookmaker-settings.collapsed {
                            margin-left: 0;
                            max-height: 0;
                            padding: 0;
                            overflow: hidden;
                        }
                        .bookmaker-toolbar {
                            flex-direction: column;
                            gap: 10px;
                            align-items: stretch;
                        }
                        .toolbar-actions {
                            justify-content: stretch;
                        }
                        .toolbar-actions button { flex: 1; justify-content: center; padding: 10px 8px; font-size: 0.8rem; }
                        .bookmaker-canvas { padding: 20px 8px 100px; }
                        .a4-page { padding: 30px 20px; min-height: 600px; }
                        .cover-title { font-size: 2.2rem; }
                        .cover-subtitle { font-size: 1.2rem; }
                    }

                    /* ═══ PRINT SPECIFIC STYLES ═══ */
                    @media print {
                        @page { size: A4; margin: 0; }
                        body, html, .bookmaker-view { background: white; height: auto; overflow: visible; }
                        .mobile-top-bar, .bookmaker-toolbar, .bookmaker-settings { display: none !important; }
                        .bookmaker-body { overflow: visible; display: block; }
                        .bookmaker-canvas { 
                            padding: 0 !important; 
                            background: white !important; 
                            gap: 0 !important; 
                            overflow: visible !important; 
                            align-items: flex-start;
                        }
                        .a4-page {
                            width: 100%; max-width: none;
                            height: 100vh; max-height: 100vh;
                            box-shadow: none !important; border-radius: 0;
                            padding: 2cm; margin: 0;
                            page-break-after: always;
                            break-after: page;
                            overflow: hidden;
                        }
                        .more-indicator { display: none; }
                        
                        /* Fix colors for print */
                        .cover-page { 
                            background: white !important; 
                            color: black !important; 
                            border: 1px solid #ccc; 
                        }
                        .cover-ornament, .cover-subtitle, .cover-author-en, .cover-year { color: #555 !important; }
                        .cover-line { background: #333 !important; }
                    }
                `}</style>

                {/* ═══ TOOLBAR ═══ */}
                <div className="bookmaker-toolbar">
                    <div>
                        <h1>நூல் தொகுப்பு</h1>
                        <p>Professional Book Maker · Preview & Download</p>
                    </div>
                    <div className="toolbar-actions">
                        <button className="settings-toggle-btn" onClick={() => setSettingsOpen(!settingsOpen)}>
                            <FiEdit3 size={16} />
                            {settingsOpen ? 'Hide' : 'Edit'}
                            {settingsOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                        </button>
                        <button className="settings-toggle-btn" onClick={() => window.print()} title="Print or Save as PDF">
                            <FiPrinter size={16} />
                            PDF
                        </button>
                        <button
                            className="book-download-btn"
                            onClick={generateBook}
                            disabled={isGenerating || isLoadingPreview}
                        >
                            <FiDownload size={16} />
                            {isGenerating ? 'தொகுக்கப்படுகிறது...' : 'Word (.docx)'}
                        </button>
                    </div>
                </div>

                {/* ═══ BODY ═══ */}
                <div className="bookmaker-body">
                    {/* Settings Panel */}
                    <div className={`bookmaker-settings ${!settingsOpen ? 'collapsed' : ''}`}>
                        {/* Stats */}
                        <div className="settings-stats">
                            <div className="stat-item">
                                <div className="stat-num">{poemsList.length}</div>
                                <div className="stat-label">Poems</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-num">{quotesList.length}</div>
                                <div className="stat-label">Quotes</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-num">{poemsList.length + quotesList.length}</div>
                                <div className="stat-label">Total</div>
                            </div>
                        </div>

                        <div className="settings-section-title">Book Details</div>
                        <div className="settings-field">
                            <label>புத்தகத் தலைப்பு (Title)</label>
                            <input value={bookTitle} onChange={e => setBookTitle(e.target.value)} />
                        </div>
                        <div className="settings-field">
                            <label>Subtitle</label>
                            <input value={bookSubtitle} onChange={e => setBookSubtitle(e.target.value)} />
                        </div>

                        <div className="settings-section-title">Author</div>
                        <div className="settings-field">
                            <label>ஆசிரியர் (Tamil)</label>
                            <input value={authorName} onChange={e => setAuthorName(e.target.value)} />
                        </div>
                        <div className="settings-field">
                            <label>Author (English)</label>
                            <input value={authorNameEn} onChange={e => setAuthorNameEn(e.target.value)} />
                        </div>
                        <div className="settings-field">
                            <label>ஆசிரியர் குறிப்பு (Bio)</label>
                            <textarea rows={5} value={authorBio} onChange={e => setAuthorBio(e.target.value)} />
                        </div>

                        <div className="settings-section-title">Dedication</div>
                        <div className="settings-field">
                            <label>அர்ப்பணிப்பு (Dedication)</label>
                            <textarea rows={3} value={dedicationText} onChange={e => setDedicationText(e.target.value)} />
                        </div>

                        <div className="settings-section-title">Content Options</div>
                        <div className="settings-toggle-row">
                            <span>Include Transliterations</span>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={includeTransliterations} onChange={e => setIncludeTransliterations(e.target.checked)} />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                        <div className="settings-toggle-row">
                            <span>Include All Variants</span>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={includeAllVariants} onChange={e => setIncludeAllVariants(e.target.checked)} />
                                <span className="toggle-slider" />
                            </label>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="bookmaker-canvas">
                        {isLoadingPreview ? (
                            <div style={{ padding: '60px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                நூறு பக்கங்கள் புரட்டப்படுகின்றன... (Loading preview...)
                            </div>
                        ) : (
                            <>
                                {/* ═══ COVER PAGE ═══ */}
                                <div className="a4-page cover-page page-centered">
                                    <div className="cover-ornament">✦ ✦ ✦</div>
                                    <div style={{ marginTop: 'auto' }}>
                                        <div className="cover-title">{bookTitle}</div>
                                        <div className="cover-subtitle">{bookSubtitle}</div>
                                    </div>
                                    <div className="cover-line" />
                                    <div>
                                        <div className="cover-author">{authorName}</div>
                                        <div className="cover-author-en">{authorNameEn}</div>
                                    </div>
                                    <div style={{ marginTop: 'auto' }} />
                                    <div className="cover-year">{new Date().getFullYear()}</div>
                                </div>

                                {/* ═══ COPYRIGHT PAGE ═══ */}
                                <div className="a4-page copyright-page">
                                    <div className="cp-text">{bookTitle} — {bookSubtitle}</div>
                                    <div className="cp-text">© {new Date().getFullYear()} {authorName} ({authorNameEn})</div>
                                    <div className="cp-text">அனைத்து உரிமைகளும் ஆசிரியருக்கே.</div>
                                    <div className="cp-text">All rights reserved.</div>
                                    <div className="cp-text" style={{ marginTop: '12px' }}>
                                        தொகுக்கப்பட்ட தேதி: {new Date().toLocaleDateString('ta-IN')}
                                    </div>
                                </div>

                                {/* ═══ DEDICATION PAGE ═══ */}
                                {dedicationText.trim() && (
                                    <div className="a4-page page-centered dedication-page">
                                        {dedicationText.split('\n').map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))}
                                    </div>
                                )}

                                {/* ═══ AUTHOR BIO PAGE ═══ */}
                                {authorBio.trim() && (
                                    <div className="a4-page page-centered">
                                        <div className="bio-page-title">ஆசிரியர் குறிப்பு</div>
                                        <div className="bio-page-subtitle">About the Author</div>
                                        <div className="bio-page-line" />
                                        <div className="bio-page-body">{authorBio}</div>
                                    </div>
                                )}

                                {/* ═══ TABLE OF CONTENTS ═══ */}
                                <div className="a4-page">
                                    <div style={{ textAlign: 'center' }}>
                                        <div className="toc-title">பொருளடக்கம்</div>
                                        <div className="toc-subtitle">Table of Contents</div>
                                    </div>
                                    <div style={{ width: '60px', height: '2px', background: '#ddd', margin: '0 auto 24px' }} />

                                    {poemsList.length > 0 && (
                                        <>
                                            <div className="toc-section-title">பகுதி 1: நவில் மிழிகள் (Poems)</div>
                                            {poemsList.map((poem, idx) => {
                                                const title = poem.variants?.[0]?.title || poem.title || 'தலைப்பில்லை';
                                                return (
                                                    <div key={`toc-p-${idx}`} className="toc-entry">
                                                        <span className="toc-entry-num">{idx + 1}.</span>
                                                        {title}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}

                                    {quotesList.length > 0 && (
                                        <>
                                            <div className="toc-section-title">பகுதி 2: நவில் மொழிகள் (Quotes)</div>
                                            {quotesList.map((quote, idx) => {
                                                const title = quote.variants?.[0]?.title || quote.title || `மொழி ${idx + 1}`;
                                                return (
                                                    <div key={`toc-q-${idx}`} className="toc-entry">
                                                        <span className="toc-entry-num">{idx + 1}.</span>
                                                        {title}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>

                                {/* ═══ POEMS SECTION ═══ */}
                                {poemsList.length > 0 && (
                                    <div className="a4-page page-centered section-divider">
                                        <div className="section-part-label">பகுதி 1</div>
                                        <div className="section-part-name">நவில் மிழிகள்</div>
                                        <div className="section-part-name-en">Poems</div>
                                    </div>
                                )}

                                {poemsList.slice(0, 5).map((poem, idx) => renderPoemPreview(poem, idx))}

                                {poemsList.length > 5 && (
                                    <div className="a4-page page-centered">
                                        <div className="more-indicator">
                                            + {poemsList.length - 5} மேலும் பல கவிதைகள்...<br />(All {poemsList.length} poems included in download)
                                        </div>
                                    </div>
                                )}

                                {/* ═══ QUOTES SECTION ═══ */}
                                {quotesList.length > 0 && (
                                    <div className="a4-page page-centered section-divider">
                                        <div className="section-part-label">பகுதி 2</div>
                                        <div className="section-part-name">நவில் மொழிகள்</div>
                                        <div className="section-part-name-en">Quotes</div>
                                    </div>
                                )}

                                {quotesList.slice(0, 5).map((quote, idx) => renderQuotePreview(quote, idx))}

                                {quotesList.length > 5 && (
                                    <div className="a4-page page-centered">
                                        <div className="more-indicator">
                                            + {quotesList.length - 5} மேலும் பல மொழிகள்...<br />(All {quotesList.length} quotes included in download)
                                        </div>
                                    </div>
                                )}

                                {/* ═══ COLOPHON ═══ */}
                                <div className="a4-page page-centered">
                                    <div className="colophon-symbol">❖</div>
                                    <div className="colophon-text">
                                        இந்தத் தொகுப்பு {poemsList.length} கவிதைகளையும் {quotesList.length} மொழிகளையும் கொண்டது.
                                    </div>
                                    <div className="colophon-text" style={{ fontStyle: 'italic', fontFamily: `${ENGLISH_FONT}, serif` }}>
                                        This collection contains {poemsList.length} poems and {quotesList.length} quotes.
                                    </div>
                                    <div className="colophon-text" style={{ marginTop: '30px', color: '#bbb' }}>
                                        {bookTitle} · {new Date().getFullYear()}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookMakerView;
