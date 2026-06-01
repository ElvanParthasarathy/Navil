import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../../lib/firebaseClient';
import { ref, get } from 'firebase/database';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak,
    AlignmentType, TableOfContents, StyleLevel, BorderStyle,
    Header, Footer, PageNumber, NumberFormat
} from 'docx';
import { FiDownload, FiEdit3, FiChevronDown, FiChevronUp, FiPrinter } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import './BookMakerView.css';

const PRIMARY_FONT = "ElvanSans";
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
            <div key={`poem-${idx}-page-${chunkIdx}`} className="a4-page numbered-page">
                {chunk.map((ver, vIdx) => {
                    const isOriginal = chunkIdx === 0 && vIdx === 0;
                    return (
                        <div key={vIdx} className="book-version-block poem-align-left">
                            {versions.length > 1 && (
                                <div className="version-badge">
                                    {ver.label} {chunkIdx > 0 && vIdx === 0 ? '(தொடர்ச்சி / Contd.)' : ''}
                                </div>
                            )}
                            <div className={`a4-content-title ${isOriginal ? 'main-title' : 'variant-title'}`}>
                                {isOriginal && <span className="serial-number">{idx + 1}. </span>}
                                {ver.title}
                            </div>
                            <div className={`a4-content-body ${isOriginal ? 'main-body' : 'variant-body'}`}>{ver.text}</div>
                            {ver.author && <div className={`a4-author ${isOriginal ? 'main-author' : 'variant-author'}`}>— {ver.author}</div>}
                            
                            {/* Visual separation between variants */}
                            {vIdx < chunk.length - 1 && <div className="version-separator">· · ·</div>}
                            
                            {/* Clear end of entire poem separation */}
                            {chunkIdx === chunks.length - 1 && vIdx === chunk.length - 1 && (
                                <div className="poem-end-separator">❧</div>
                            )}
                        </div>
                    );
                })}
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
            <div key={`quote-${idx}-page-${chunkIdx}`} className="a4-page numbered-page">
                {chunk.map((ver, vIdx) => {
                    const isOriginal = chunkIdx === 0 && vIdx === 0;
                    return (
                        <div key={vIdx} className="book-version-block poem-align-left">
                            {versions.length > 1 && (
                                <div className="version-badge">
                                    {ver.label} {chunkIdx > 0 && vIdx === 0 ? '(தொடர்ச்சி / Contd.)' : ''}
                                </div>
                            )}
                            <div className={`a4-content-quote ${isOriginal ? 'main-quote' : 'variant-quote'}`}>
                                {isOriginal && <span className="serial-number">{idx + 1}. </span>}
                                {ver.text}
                            </div>
                            {ver.author && <div className={`a4-author ${isOriginal ? 'main-author' : 'variant-author'}`}>— {ver.author}</div>}
                            
                            {vIdx < chunk.length - 1 && <div className="version-separator">· · ·</div>}
                            
                            {chunkIdx === chunks.length - 1 && vIdx === chunk.length - 1 && (
                                <div className="poem-end-separator">❧</div>
                            )}
                        </div>
                    );
                })}
            </div>
        ));
    };

    return (
        <>
            <Helmet>
                <title>நூல் தொகுப்பு | Book Maker</title>
            </Helmet>

            <div className="bookmaker-view">
                

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

                                {poemsList.map((poem, idx) => renderPoemPreview(poem, idx))}

                                {/* ═══ QUOTES SECTION ═══ */}
                                {quotesList.length > 0 && (
                                    <div className="a4-page page-centered section-divider">
                                        <div className="section-part-label">பகுதி 2</div>
                                        <div className="section-part-name">நவில் மொழிகள்</div>
                                        <div className="section-part-name-en">Quotes</div>
                                    </div>
                                )}

                                {quotesList.map((quote, idx) => renderQuotePreview(quote, idx))}

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
