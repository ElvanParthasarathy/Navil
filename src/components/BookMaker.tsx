import React, { useState } from 'react';
import { db } from '../lib/firebaseClient';
import { ref, get } from 'firebase/database';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from 'docx';
import { FiDownload } from 'react-icons/fi';

const PRIMARY_FONT = "Mukta Malar";
const FALLBACK_FONT = "Latha";

// Strip HTML tags and convert <br> or <p> to newlines
const stripHtml = (html: string) => {
    if (!html) return '';
    let text = html.replace(/<\/p>\s*<p>/gi, '\n')
                   .replace(/<p>/gi, '')
                   .replace(/<\/p>/gi, '')
                   .replace(/<br\s*\/?>/gi, '\n')
                   .replace(/<[^>]+>/g, '');
    return text.trim();
};

export const BookMaker = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateBook = async () => {
        setIsGenerating(true);
        try {
            // Fetch live data
            const poemsSnap = await get(ref(db, 'poems'));
            const quotesSnap = await get(ref(db, 'quotes'));
            
            const poemsData = poemsSnap.exists() ? poemsSnap.val() : {};
            const quotesData = quotesSnap.exists() ? quotesSnap.val() : {};

            const poemsList = Object.values(poemsData).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
            const quotesList = Object.values(quotesData).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

            const children = [];

            // Title Page
            children.push(
                new Paragraph({
                    text: "நவில் தொகுப்பு",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 4000, after: 400 },
                }),
                new Paragraph({
                    text: "Navil Collection",
                    heading: HeadingLevel.HEADING_2,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 4000 },
                }),
                new Paragraph({
                    text: "எழுதியவர்: எல்வன் நவில் (Elvan Navil)",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    text: "தொகுக்கப்பட்ட தேதி: " + new Date().toLocaleDateString('ta-IN'),
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ children: [new PageBreak()] })
            );

            // Poems Section
            if (poemsList.length > 0) {
                children.push(
                    new Paragraph({
                        text: "பகுதி 1: நவில் மிழிகள் (Poems)",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 400 },
                    }),
                    new Paragraph({ children: [new PageBreak()] })
                );

                poemsList.forEach((poem: any) => {
                    const title = poem.variants?.[0]?.title || poem.title || "தலைப்பில்லை";
                    const text = stripHtml(poem.variants?.[0]?.text || poem.text || "");

                    children.push(
                        new Paragraph({
                            text: title,
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 400, after: 200 },
                        })
                    );

                    const lines = text.split('\n');
                    lines.forEach(line => {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: line,
                                        font: { name: PRIMARY_FONT },
                                        size: 24 // 12pt
                                    })
                                ],
                                spacing: { after: 100 }
                            })
                        );
                    });

                    children.push(new Paragraph({ children: [new PageBreak()] }));
                });
            }

            // Quotes Section
            if (quotesList.length > 0) {
                children.push(
                    new Paragraph({
                        text: "பகுதி 2: நவில் மொழிகள் (Quotes)",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 400 },
                    }),
                    new Paragraph({ children: [new PageBreak()] })
                );

                quotesList.forEach((quote: any, index) => {
                    const text = stripHtml(quote.variants?.[0]?.text || quote.text || "");
                    
                    children.push(
                        new Paragraph({
                            text: `மொழி ${index + 1}`,
                            heading: HeadingLevel.HEADING_4,
                            spacing: { before: 400, after: 200 },
                        })
                    );

                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: text,
                                    font: { name: PRIMARY_FONT },
                                    size: 28, // 14pt
                                    italics: true
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 200, after: 400 }
                        })
                    );
                    
                    // Two quotes per page roughly, or just page break after each
                    children.push(new Paragraph({ children: [new PageBreak()] }));
                });
            }

            // Generate Document
            const doc = new Document({
                styles: {
                    default: {
                        document: {
                            run: {
                                font: PRIMARY_FONT,
                                size: 24, // 12pt
                            },
                        },
                    },
                },
                sections: [{
                    properties: {},
                    children: children
                }]
            });

            const blob = await Packer.toBlob(doc);
            
            // Download triggering
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style.display = "none";
            a.href = url;
            a.download = `Navil_Collection_${new Date().toISOString().split('T')[0]}.docx`;
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

    return (
        <div className="book-maker-container">
            <style>{`
                .book-maker-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    background: linear-gradient(135deg, var(--text-main), color-mix(in srgb, var(--text-main) 80%, transparent));
                    color: var(--bg-panel);
                    padding: 16px 28px;
                    border-radius: 99px;
                    border: none;
                    font-size: 1.05rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 10px 20px color-mix(in srgb, var(--text-main) 15%, transparent);
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .book-maker-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px color-mix(in srgb, var(--text-main) 25%, transparent);
                }
                .book-maker-btn:active {
                    transform: translateY(1px);
                }
                .book-maker-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                .book-maker-info {
                    margin-top: 12px;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                }
                .book-maker-card {
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 20%));
                    border-radius: 24px;
                    padding: 32px;
                    margin-top: 40px;
                    border: 1px solid var(--border-light);
                    text-align: center;
                }
            `}</style>

            <div className="book-maker-card">
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.4rem', color: 'var(--text-main)' }}>நவில் தொகுப்பு (Book Maker)</h3>
                <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    படைப்புகள் அனைத்தையும் தொகுத்து ஒரு அழகிய புத்தகமாக (Word Document) பதிவிறக்கம் செய்துகொள்ளலாம். 
                    <br/><span style={{fontSize: '0.9rem', opacity: 0.8}}>Download a compiled professional Word Document containing all poems and quotes.</span>
                </p>
                <button 
                    className="book-maker-btn" 
                    onClick={generateBook} 
                    disabled={isGenerating}
                >
                    <FiDownload size={20} />
                    {isGenerating ? "தொகுக்கப்படுகிறது... (Generating)" : "புத்தகமாகப் பதிவிறக்கு"}
                </button>
                <div className="book-maker-info">
                    <span style={{ fontWeight: 600 }}>Note:</span> The document uses "Mukta Malar" font. It requires the font to be installed on your computer for perfect rendering.
                </div>
            </div>
        </div>
    );
};
