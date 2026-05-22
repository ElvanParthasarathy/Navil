import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebaseClient';
import { ref, get } from 'firebase/database';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from 'docx';
import { FiDownload, FiFileText } from 'react-icons/fi';
import MobileTopBar from '../components/MobileTopBar';
import { Helmet } from 'react-helmet-async';

const PRIMARY_FONT = "Mukta Malar";

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

const BookMakerView = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(true);
    const [poemsList, setPoemsList] = useState<any[]>([]);
    const [quotesList, setQuotesList] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const poemsSnap = await get(ref(db, 'poems'));
                const quotesSnap = await get(ref(db, 'quotes'));
                
                const poemsData = poemsSnap.exists() ? poemsSnap.val() : {};
                const quotesData = quotesSnap.exists() ? quotesSnap.val() : {};

                const pList = Object.values(poemsData).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
                const qList = Object.values(quotesData).sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

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

    const generateBook = async () => {
        setIsGenerating(true);
        try {
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

                    .bookmaker-toolbar {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 16px 24px;
                        background: var(--bg-panel);
                        border-bottom: 1px solid var(--border-light);
                        z-index: 10;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                    }

                    .bookmaker-header-titles h1 {
                        font-size: 1.4rem;
                        margin: 0;
                        color: var(--text-main);
                        font-weight: 800;
                    }
                    
                    .bookmaker-header-titles p {
                        margin: 4px 0 0 0;
                        color: var(--text-muted);
                        font-size: 0.85rem;
                    }

                    .book-download-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        background: var(--text-main);
                        color: var(--bg-panel);
                        padding: 12px 24px;
                        border-radius: 8px;
                        border: none;
                        font-size: 0.95rem;
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }

                    .book-download-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 20px color-mix(in srgb, var(--text-main) 20%, transparent);
                    }

                    .book-download-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }

                    .bookmaker-canvas {
                        flex: 1;
                        background: color-mix(in srgb, var(--bg-panel) 50%, #eef0f2);
                        overflow-y: auto;
                        padding: 40px 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 40px;
                    }

                    [data-theme='dark'] .bookmaker-canvas {
                        background: color-mix(in srgb, var(--bg-panel) 30%, #0d1117);
                    }

                    .a4-page {
                        background: white;
                        width: 100%;
                        max-width: 800px;
                        aspect-ratio: 1 / 1.414;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                        padding: 60px 40px;
                        display: flex;
                        flex-direction: column;
                        color: #000; /* Force black text on white paper */
                        font-family: 'Mukta Malar', sans-serif;
                        position: relative;
                        overflow: hidden;
                    }

                    .page-centered {
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                    }

                    .a4-page-title {
                        font-size: 2.5rem;
                        font-weight: 800;
                        margin-bottom: 20px;
                    }
                    
                    .a4-page-subtitle {
                        font-size: 1.5rem;
                        color: #555;
                        margin-bottom: 60px;
                    }

                    .a4-page-meta {
                        font-size: 1.1rem;
                        color: #444;
                        margin-bottom: 10px;
                    }

                    .a4-section-title {
                        font-size: 2.2rem;
                        font-weight: 800;
                        text-align: center;
                        margin-top: auto;
                        margin-bottom: auto;
                    }

                    .a4-content-title {
                        font-size: 1.8rem;
                        font-weight: 700;
                        margin-bottom: 24px;
                    }

                    .a4-content-body {
                        font-size: 1.1rem;
                        line-height: 2;
                        white-space: pre-wrap;
                        color: #111;
                    }
                    
                    .a4-content-quote {
                        font-size: 1.3rem;
                        line-height: 2;
                        white-space: pre-wrap;
                        color: #222;
                        font-style: italic;
                        text-align: center;
                        margin: auto 0;
                    }

                    @media (max-width: 768px) {
                        .bookmaker-toolbar {
                            flex-direction: column;
                            gap: 16px;
                            align-items: flex-start;
                        }
                        .book-download-btn {
                            width: 100%;
                            justify-content: center;
                        }
                        .bookmaker-canvas {
                            padding: 20px 10px;
                        }
                        .a4-page {
                            padding: 40px 20px;
                        }
                        .a4-page-title { font-size: 1.8rem; }
                        .a4-page-subtitle { font-size: 1.2rem; }
                    }
                `}</style>

                <div className="bookmaker-toolbar">
                    <div className="bookmaker-header-titles">
                        <h1>நூல் தொகுப்பு (Book Maker)</h1>
                        <p>Preview and download your entire collection as a professional Word Document.</p>
                    </div>
                    <button 
                        className="book-download-btn" 
                        onClick={generateBook} 
                        disabled={isGenerating || isLoadingPreview}
                    >
                        <FiDownload size={18} />
                        {isGenerating ? "தொகுக்கப்படுகிறது..." : "புத்தகமாகப் பதிவிறக்கு (.docx)"}
                    </button>
                </div>

                <div className="bookmaker-canvas">
                    {isLoadingPreview ? (
                        <div style={{ padding: '40px', color: 'var(--text-muted)' }}>நூறு பக்கங்கள் புரட்டப்படுகின்றன... (Loading preview...)</div>
                    ) : (
                        <>
                            {/* Title Page */}
                            <div className="a4-page page-centered">
                                <div className="a4-page-title">நவில் தொகுப்பு</div>
                                <div className="a4-page-subtitle">Navil Collection</div>
                                <div className="a4-page-meta">எழுதியவர்: எல்வன் நவில் (Elvan Navil)</div>
                                <div className="a4-page-meta">தொகுக்கப்பட்ட தேதி: {new Date().toLocaleDateString('ta-IN')}</div>
                            </div>

                            {/* Poems Section Page */}
                            {poemsList.length > 0 && (
                                <div className="a4-page page-centered">
                                    <div className="a4-section-title">பகுதி 1: நவில் மிழிகள்<br/>(Poems)</div>
                                </div>
                            )}

                            {/* Show first few poems as preview */}
                            {poemsList.slice(0, 3).map((poem, idx) => {
                                const title = poem.variants?.[0]?.title || poem.title || "தலைப்பில்லை";
                                const text = stripHtml(poem.variants?.[0]?.text || poem.text || "");
                                return (
                                    <div key={`poem-${idx}`} className="a4-page">
                                        <div className="a4-content-title">{title}</div>
                                        <div className="a4-content-body">{text}</div>
                                    </div>
                                );
                            })}
                            
                            {poemsList.length > 3 && (
                                <div className="a4-page page-centered">
                                    <div style={{ fontSize: '1.5rem', color: '#888' }}>
                                        + {poemsList.length - 3} மேலும் பல கவிதைகள்...<br/>(More poems in download)
                                    </div>
                                </div>
                            )}

                            {/* Quotes Section Page */}
                            {quotesList.length > 0 && (
                                <div className="a4-page page-centered">
                                    <div className="a4-section-title">பகுதி 2: நவில் மொழிகள்<br/>(Quotes)</div>
                                </div>
                            )}

                            {/* Show first few quotes as preview */}
                            {quotesList.slice(0, 3).map((quote, idx) => {
                                const text = stripHtml(quote.variants?.[0]?.text || quote.text || "");
                                return (
                                    <div key={`quote-${idx}`} className="a4-page">
                                        <div className="a4-content-title" style={{ fontSize: '1.2rem', color: '#666' }}>மொழி {idx + 1}</div>
                                        <div className="a4-content-quote">{text}</div>
                                    </div>
                                );
                            })}

                            {quotesList.length > 3 && (
                                <div className="a4-page page-centered">
                                    <div style={{ fontSize: '1.5rem', color: '#888' }}>
                                        + {quotesList.length - 3} மேலும் பல மொழிகள்...<br/>(More quotes in download)
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default BookMakerView;
