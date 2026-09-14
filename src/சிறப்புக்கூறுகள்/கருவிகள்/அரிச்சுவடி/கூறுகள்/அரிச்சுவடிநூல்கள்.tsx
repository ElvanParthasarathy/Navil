import React, { useState, useEffect, useMemo } from 'react';
import { convertToBrahmi } from '../இயந்திரம்/தமிழிவரைபடங்கள்';
import { convertToVatteluttu } from '../இயந்திரம்/வட்டெழுத்துவரைபடங்கள்';
import '../../../படைப்புகள்/பார்வைகள்/கதைகள்பட்டியல்.css';
import { FloatingBackButton } from '../../../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import { 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  MagnifyingGlass, 
  CaretLeft, 
  CaretRight,
  Eye,
  Books,
  Scroll,
  Play,
  ListDashes
} from '@phosphor-icons/react';

type ScriptType = 'brahmi' | 'vatteluttu' | 'tamil';
type BookType = 'tholkaappiyam' | 'thirukkural';

interface VerseItem {
  num: number;
  lines: string[];
}

interface Chapter {
  id: string;
  chapterNum: number;
  section: string;
  title: string;
  itemCount: number;
  excerpt: string;
  items: VerseItem[];
}

// In-memory cache for books
const bookCache: Record<string, Chapter[]> = {};

export function ArichuvadiBooks() {
  // selectedBook: null shows the 2 separate books catalog like Writings Stories
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  // Default to Modern Tamil as requested
  const [script, setScript] = useState<ScriptType>('tamil');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(115);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showParallelTamil, setShowParallelTamil] = useState<boolean>(false);

  // Load book chapters whenever a book is selected
  useEffect(() => {
    if (!selectedBook) return;

    if (bookCache[selectedBook]) {
      setChapters(bookCache[selectedBook]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const jsonPath = selectedBook === 'tholkaappiyam' 
      ? '/data/tholkaappiyam_chapters.json' 
      : '/data/thirukkural_chapters.json';

    fetch(jsonPath)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load book data');
        return res.json();
      })
      .then((data: Chapter[]) => {
        bookCache[selectedBook] = data;
        setChapters(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading book:', err);
        setLoading(false);
      });
  }, [selectedBook]);

  // Select a book from the catalog
  const handleSelectBook = (newBook: BookType) => {
    setSelectedBook(newBook);
    setSelectedChapterId(null);
    setActiveSection('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to the books catalog
  const handleReturnToCatalog = () => {
    setSelectedBook(null);
    setSelectedChapterId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert line helper
  const convertText = (text: string, targetScript: ScriptType = script): string => {
    if (!text) return '';
    if (targetScript === 'brahmi') {
      return convertToBrahmi(text, 'late');
    }
    if (targetScript === 'vatteluttu') {
      return convertToVatteluttu(text);
    }
    return text;
  };

  // Font class
  const getFontClass = (targetScript: ScriptType = script) => {
    if (targetScript === 'brahmi') return 'arichuvadi-output-brahmi';
    if (targetScript === 'vatteluttu') return 'arichuvadi-output-vatteluttu';
    return '';
  };

  // Sections list for filtering
  const availableSections = useMemo(() => {
    const set = new Set<string>();
    chapters.forEach(c => {
      if (c.section) set.add(c.section);
    });
    return Array.from(set);
  }, [chapters]);

  // Filtered chapters for directory
  const filteredChapters = useMemo(() => {
    return chapters.filter(c => {
      const matchSection = activeSection === 'all' || c.section === activeSection;
      if (!matchSection) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        c.title.toLowerCase().includes(q) ||
        String(c.chapterNum).includes(q) ||
        c.section.toLowerCase().includes(q) ||
        (c.excerpt && c.excerpt.toLowerCase().includes(q))
      );
    });
  }, [chapters, activeSection, searchQuery]);

  // Selected Chapter details
  const currentChapterIndex = useMemo(() => {
    if (!selectedChapterId) return -1;
    return chapters.findIndex(c => c.id === selectedChapterId);
  }, [chapters, selectedChapterId]);

  const currentChapter = currentChapterIndex >= 0 ? chapters[currentChapterIndex] : null;
  const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  // Scroll to top on chapter change
  const navigateToChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const returnToDirectory = () => {
    setSelectedChapterId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy verse lines to clipboard
  const handleCopyVerse = (item: VerseItem, index: number) => {
    const rawLines = item.lines.filter(l => !/^\d+$/.test(l.trim()));
    const converted = rawLines.map(l => convertText(l)).join('\n');
    navigator.clipboard.writeText(converted);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Book metadata
  const isTholk = selectedBook === 'tholkaappiyam';
  const bookTitle = isTholk ? 'தொல்காப்பியம்' : 'திருக்குறள்';
  const author = isTholk ? 'தொல்காப்பியர்' : 'திருவள்ளுவர்';
  const bookSubtitle = isTholk 
    ? 'பண்டைத் தமிழின் இலக்கணம், மொழிநுட்பம், வாழ்வியல் மரபுகளை விளக்கும் மிகத் தொன்மையான முழுமையான இலக்கியப் பேழை. எழுத்ததிகாரம், சொல்லதிகாரம், பொருளதிகாரம் ஆகிய முப்பெரும் பிரிவுகளைக் கொண்டது.' 
    : 'மனித வாழ்க்கைக்குத் தேவையான அறம், பொருள், இன்பம் ஆகிய முப்பாலையும் விளக்கும் உலகப் பொதுமறை. 133 அதிகாரங்களில் 1330 அருங்குறட்பாக்களைக் கொண்டது.';
  const chapterLabel = isTholk ? 'இயல்' : 'அதிகாரம்';
  const chaptersLabelPlural = isTholk ? 'இயல்கள்' : 'அதிகாரங்கள்';
  const verseLabel = isTholk ? 'நூற்பா' : 'குறள்';
  const versesLabelPlural = isTholk ? 'நூற்பாக்கள்' : 'குறள்கள்';
  const totalVerses = useMemo(() => {
    return chapters.reduce((sum, c) => sum + (c.itemCount || 0), 0);
  }, [chapters]);

  return (
    <div className="arichuvadi-books-container animate-entry">
      {/* =========================================================================
          LEVEL 1: BOOKS CATALOG (Separate Cards Matching Writings Stories List)
          ========================================================================= */}
      {!selectedBook && (
        <div className="arichuvadi-catalog-view animate-entry">
          <FloatingBackButton to="/tools/arichuvadi" />

          {/* Single clean header matching Writings Stories */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 lang="ta" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '0', lineHeight: 1.3, marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                நூல்கள்
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    background: 'color-mix(in srgb, var(--text-main) 12%, transparent)', 
                    color: 'var(--text-main)', 
                    padding: '3px 9px', 
                    borderRadius: '100px', 
                    fontWeight: 700, 
                    letterSpacing: '0.5px',
                    lineHeight: 1
                  }}
                >
                  BETA
                </span>
              </h1>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: '#888888', marginBottom: '8px', letterSpacing: '0.5px' }}>Books</div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                திருக்குறள், தொல்காப்பியம் செம்மொழி இலக்கியப் பேழைகள்.
              </p>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem', opacity: 0.7 }}>
                Read classic Tamil literature in ancient scripts.
              </p>
            </div>
          </div>

          {/* 2-Column Netflix Grid of Books matching Writings Stories */}
          <div className="blog-grid-container stories-netflix-grid" style={{ marginTop: '16px' }}>
            {/* BOOK 1: தொல்காப்பியம் */}
            <div
              className="blog-link-card"
              onClick={() => handleSelectBook('tholkaappiyam')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectBook('tholkaappiyam');
                }
              }}
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <article className="blog-card-item">
                <div 
                  className="blog-cover-wrapper"
                  style={{
                    height: '240px',
                    background: 'linear-gradient(135deg, #1b1b24, #121217)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', padding: '20px', color: '#fff' }}>
                    <Books size={52} weight="duotone" style={{ color: 'rgba(255, 255, 255, 0.88)' }} />
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.8px', 
                      background: 'rgba(255, 255, 255, 0.12)', 
                      padding: '3px 12px', 
                      borderRadius: '100px' 
                    }}>
                      இலக்கணம்
                    </span>
                    <h3 
                      style={{ 
                        fontSize: '1.6rem', 
                        fontWeight: 800, 
                        margin: 0, 
                        color: '#fff' 
                      }}
                    >
                      தொல்காப்பியம்
                    </h3>
                    <span style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.72)', fontStyle: 'italic' }}>
                      — தொல்காப்பியர்
                    </span>
                  </div>
                  <span className="blog-classification-badge puram">இலக்கணம்</span>
                </div>

                <div className="blog-card-content">
                  <div className="blog-meta-minimal">
                    <span className="meta-date" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                      தொடர் (27 இயல்கள்)
                    </span>
                    <span className="meta-dot">•</span>
                    <span>1610 நூற்பாக்கள்</span>
                    <span className="meta-dot">•</span>
                    <span>முப்பெரும் அதிகாரம்</span>
                  </div>

                  <h2 className="blog-title">
                    தொல்காப்பியம்
                  </h2>

                  <div className="blog-excerpt">
                    பண்டைத் தமிழின் இலக்கணம், மொழிநுட்பம், வாழ்வியல் மரபுகளை விளக்கும் மிகத் தொன்மையான இலக்கியப் பேழை. எழுத்ததிகாரம், சொல்லதிகாரம், பொருளதிகாரம் ஆகிய முப்பெரும் பிரிவுகளைக் கொண்டது.
                  </div>

                  <div className="blog-card-footer">
                    <div className="blog-read-more" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                      நூலைத் திறக்க <span className="arrow">→</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            {/* BOOK 2: திருக்குறள் */}
            <div
              className="blog-link-card"
              onClick={() => handleSelectBook('thirukkural')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectBook('thirukkural');
                }
              }}
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <article className="blog-card-item">
                <div 
                  className="blog-cover-wrapper"
                  style={{
                    height: '240px',
                    background: 'linear-gradient(135deg, #181c24, #10141c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px', padding: '20px', color: '#fff' }}>
                    <Scroll size={52} weight="duotone" style={{ color: 'rgba(255, 255, 255, 0.88)' }} />
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.8px', 
                      background: 'rgba(255, 255, 255, 0.12)', 
                      padding: '3px 12px', 
                      borderRadius: '100px' 
                    }}>
                      நீதி நூல்
                    </span>
                    <h3 
                      style={{ 
                        fontSize: '1.6rem', 
                        fontWeight: 800, 
                        margin: 0, 
                        color: '#fff' 
                      }}
                    >
                      திருக்குறள்
                    </h3>
                    <span style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.72)', fontStyle: 'italic' }}>
                      — திருவள்ளுவர்
                    </span>
                  </div>
                  <span className="blog-classification-badge agam">நீதி நூல்</span>
                </div>

                <div className="blog-card-content">
                  <div className="blog-meta-minimal">
                    <span className="meta-date" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                      தொடர் (133 அதிகாரங்கள்)
                    </span>
                    <span className="meta-dot">•</span>
                    <span>1330 குறள்கள்</span>
                    <span className="meta-dot">•</span>
                    <span>முப்பால்</span>
                  </div>

                  <h2 className="blog-title">
                    திருக்குறள்
                  </h2>

                  <div className="blog-excerpt">
                    மனித வாழ்க்கைக்குத் தேவையான அறம், பொருள், இன்பம் ஆகிய முப்பாலையும் விளக்கும் உலகப் பொதுமறை. 133 அதிகாரங்களில் 1330 அருங்குறட்பாக்களைக் கொண்டது.
                  </div>

                  <div className="blog-card-footer">
                    <div className="blog-read-more" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                      நூலைத் திறக்க <span className="arrow">→</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LEVEL 2: DEDICATED BOOK SERIES LANDING VIEW (Matching Stories TV View)
          ========================================================================= */}
      {selectedBook && !selectedChapterId && (
        <div className="arichuvadi-directory-view animate-entry">
          <FloatingBackButton onClick={handleReturnToCatalog} label="நூல்கள் பட்டியல்" />

          {/* Loading state */}
          {loading && (
            <div className="arichuvadi-loading-card">
              <div className="arichuvadi-spinner"></div>
              <p>நூலின் பகுதிகளை ஏற்றுகிறது... ({bookTitle})</p>
            </div>
          )}

          {!loading && (
            <div className="tv-series-master">
            <div className="tv-hero-section">
              <div className="tv-hero-left">
                <div className="tv-hero-cover-wrapper arichuvadi-book-cover-wrapper">
                  <div className="arichuvadi-cover-inner">
                    <div className="arichuvadi-cover-emblem">
                      <BookOpen size={46} weight="duotone" />
                    </div>
                    <div className="arichuvadi-cover-badge">
                      {isTholk ? 'தொல் இலக்கணம்' : 'உலகப் பொதுமறை'}
                    </div>
                    <h3 className="arichuvadi-cover-title">
                      {bookTitle}
                    </h3>
                    <div className="arichuvadi-cover-author">
                      — {author}
                    </div>
                  </div>
                </div>
              </div>

              <div className="tv-hero-right">
                <div className="tv-meta-badges">
                  <span className="tv-badge premium">செவ்விலக்கியம்</span>
                  <span className="tv-badge status">
                    {isTholk ? 'தொல் இலக்கணம்' : 'உலகப் பொதுமறை'}
                  </span>
                </div>

                <h1 className="tv-series-title">
                  {bookTitle}
                </h1>

                <div className="tv-author-byline" style={{ fontSize: '1.05rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px' }}>
                  — {author}
                </div>

                <div className="tv-meta-row">
                  <span className="tv-ep-count-badge">
                    {chapters.length} {chaptersLabelPlural}
                  </span>
                  <span className="tv-class-badge puram">
                    {totalVerses} {versesLabelPlural}
                  </span>
                  {availableSections.map(sec => (
                    <span key={sec} className="tv-genre-badge">{sec}</span>
                  ))}
                </div>

                <p className="tv-synopsis">
                  {bookSubtitle}
                </p>

                <div className="tv-actions">
                  {chapters.length > 0 && (
                    <button
                      type="button"
                      onClick={() => navigateToChapter(chapters[0].id)}
                      className="tv-primary-btn"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0px', lineHeight: 1.2 }}>
                        <span style={{ fontSize: '1em' }}>முதல் {chapterLabel} வாசிக்க</span>
                        <span style={{ fontSize: '0.7em', opacity: 0.8, fontWeight: 500, letterSpacing: '0.2px' }}>
                          Start reading ({chapters[0].title})
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Chapters Section (Matching Stories Episode Cards) */}
            <div className="tv-episodes-section">
              <div className="arichuvadi-episodes-header">
                <div>
                  <h3 className="tv-section-title" style={{ marginBottom: '4px', paddingBottom: 0, borderBottom: 'none' }}>
                    {chaptersLabelPlural}
                  </h3>
                  <span style={{ fontSize: '0.92em', opacity: 0.65, fontWeight: 500, letterSpacing: '0.5px' }}>
                    chapters ({filteredChapters.length} of {chapters.length})
                  </span>
                </div>

                {/* Search Bar */}
                <div className="arichuvadi-search-wrap">
                  <MagnifyingGlass size={16} weight="bold" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`${chapterLabel} அல்லது தலைப்பு தேடுக...`}
                    className="arichuvadi-search-input"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="arichuvadi-search-clear"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Section Filters */}
              <div className="arichuvadi-section-filter">
                <button
                  type="button"
                  className={`arichuvadi-section-tab ${activeSection === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveSection('all')}
                >
                  அனைத்தும் ({chapters.length})
                </button>
                {availableSections.map(sec => {
                  const count = chapters.filter(c => c.section === sec).length;
                  return (
                    <button
                      key={sec}
                      type="button"
                      className={`arichuvadi-section-tab ${activeSection === sec ? 'active' : ''}`}
                      onClick={() => setActiveSection(sec)}
                    >
                      {sec} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Chapters Grid with .tv-ep-card styling */}
              <div className="tv-episodes-grid">
                {filteredChapters.map((chapter) => {
                  const padNum = String(chapter.chapterNum).padStart(2, '0');

                  return (
                    <div
                      key={chapter.id}
                      onClick={() => navigateToChapter(chapter.id)}
                      className="tv-ep-card"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigateToChapter(chapter.id);
                        }
                      }}
                    >
                      <div className="tv-ep-number-bg">{padNum}</div>
                      
                      <div className="tv-ep-card-body">
                        <div className="tv-ep-meta">
                          <span className="tv-ep-num-pill">
                            {chapterLabel} {chapter.chapterNum}
                          </span>
                          <span className="tv-ep-date">
                            {chapter.section}
                          </span>
                          <span className="arichuvadi-item-count-pill">
                            {chapter.itemCount} {versesLabelPlural}
                          </span>
                        </div>

                        {/* Chapter Title */}
                        <h4 className="tv-ep-title">
                          {chapter.title}
                        </h4>

                        {/* Excerpt preview */}
                        {chapter.excerpt && (
                          <p className="tv-ep-excerpt">
                            {chapter.excerpt}...
                          </p>
                        )}

                        <div className="tv-ep-footer">
                          <span>வாசிக்கத் தொடங்கு</span>
                          <ArrowRight size={14} weight="bold" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredChapters.length === 0 && (
                <div className="arichuvadi-no-results">
                  <p>தேடலுக்குப் பொருத்தமான {chaptersLabelPlural} காணப்படவில்லை.</p>
                  <button 
                    type="button"
                    onClick={() => { setSearchQuery(''); setActiveSection('all'); }}
                    className="arichuvadi-btn arichuvadi-btn-primary"
                  >
                    அனைத்தையும் காண்க
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}

      {/* VIEW B: CHAPTER READER VIEW (Matching Stories ReadingView with Author) */}
      {!loading && currentChapter && (
        <div className="arichuvadi-story-reader-view animate-entry">
          <FloatingBackButton onClick={returnToDirectory} label={`${chaptersLabelPlural} பட்டியல்`} />

          {/* Reader Topbar: Font Zoom Controls */}
          <div className="reader-header-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginBottom: '24px' }}>
            <div className="arichuvadi-font-controls">
              <button 
                type="button"
                className="arichuvadi-icon-pill-btn"
                onClick={() => setFontSize(prev => Math.max(90, prev - 10))}
                title="எழுத்தளவைக் குறைக்க"
              >
                A-
              </button>
              <button 
                type="button"
                className="arichuvadi-icon-pill-btn"
                onClick={() => setFontSize(prev => Math.min(180, prev + 10))}
                title="எழுத்தளவை அதிகரிக்க"
              >
                A+
              </button>
            </div>
          </div>

          {/* Authentic Stories Reading View Article */}
          <article className="animate-entry" style={{ maxWidth: '850px', textAlign: 'left' }}>
            <header style={{ marginBottom: '28px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px', fontWeight: 500 }}>
                <span>{bookTitle}</span>
                <span>• {currentChapter.section}</span>
                <span>• {chapterLabel} {currentChapter.chapterNum}</span>
                <span>• {currentChapter.itemCount} {versesLabelPlural}</span>
              </div>

              <h1 
                className={script !== 'tamil' ? getFontClass() : ''}
                style={{ 
                  fontSize: script === 'tamil' ? '2.5rem' : '2.1rem', 
                  fontWeight: script === 'tamil' ? 800 : 'normal', 
                  fontFamily: script === 'tamil' ? 'serif' : undefined, 
                  lineHeight: '1.4', 
                  color: 'var(--text-main)', 
                  marginBottom: '12px',
                  textAlign: 'left'
                }}
              >
                {convertText(currentChapter.title)}
              </h1>

              {script !== 'tamil' && (
                <div style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, textAlign: 'left' }}>
                  {currentChapter.title}
                </div>
              )}

              {/* Author byline matching Stories */}
              <div style={{ fontSize: '1.05rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '24px', textAlign: 'left' }}>
                — {author}
              </div>
            </header>

            {/* Transliteration Toggle Switches matching Writings page */}
            <div className="variant-header-row">
              <div className="variant-badge">வடிவம்</div>

              {/* Toggle Switch for தமிழி */}
              <label className="transl-switch" title="தமிழி (Tamil Brahmi)">
                <input
                  type="checkbox"
                  checked={script === 'brahmi'}
                  onChange={(e) => setScript(e.target.checked ? 'brahmi' : 'tamil')}
                />
                <span className="transl-slider" />
              </label>
              <span 
                className="transl-switch-label"
                onClick={() => setScript(script === 'brahmi' ? 'tamil' : 'brahmi')}
              >
                தமிழி
              </span>

              {/* Toggle Switch for வட்டெழுத்து */}
              <label className="transl-switch" title="வட்டெழுத்து (Vatteluttu)">
                <input
                  type="checkbox"
                  checked={script === 'vatteluttu'}
                  onChange={(e) => setScript(e.target.checked ? 'vatteluttu' : 'tamil')}
                />
                <span className="transl-slider" />
              </label>
              <span 
                className="transl-switch-label"
                onClick={() => setScript(script === 'vatteluttu' ? 'tamil' : 'vatteluttu')}
              >
                வட்டெழுத்து
              </span>

              {/* Parallel Tamil toggle switch (when ancient script is active) */}
              {script !== 'tamil' && (
                <React.Fragment key="parallel">
                  <label className="transl-switch" title="தமிழ் மூலம் (Parallel Comparison)">
                    <input
                      type="checkbox"
                      checked={showParallelTamil}
                      onChange={(e) => setShowParallelTamil(e.target.checked)}
                    />
                    <span className="transl-slider" />
                  </label>
                  <span 
                    className="transl-switch-label"
                    onClick={() => setShowParallelTamil(!showParallelTamil)}
                  >
                    தமிழ் மூலம்
                  </span>
                </React.Fragment>
              )}
            </div>

            {/* Flowing Stanza Verses (story-format) */}
            <div 
              className="rich-content-body story-format arichuvadi-story-body" 
              style={{ fontSize: `${fontSize}%`, lineHeight: '2.1', color: 'var(--text-main)' }}
            >
              {currentChapter.items.map((item, idx) => {
                const cleanLines = item.lines.filter(l => !/^\d+$/.test(l.trim()));
                const verseNum = item.num || idx + 1;
                const isCopied = copiedIndex === idx;

                return (
                  <div key={idx} className="story-verse-stanza">
                    <div className="story-verse-marker">
                      <span className="story-verse-num-badge">
                        {verseLabel} {verseNum}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyVerse(item, idx)}
                        className={`story-verse-copy-btn ${isCopied ? 'copied' : ''}`}
                        title="நகலெடு"
                      >
                        {isCopied ? (
                          <>
                            <Check size={13} weight="bold" />
                            <span>நகலெடுக்கப்பட்டது</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>நகலெடு</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className={`story-verse-lines ${getFontClass()}`} style={script !== 'tamil' ? { fontWeight: 'normal' } : {}}>
                      {cleanLines.map((line, lIdx) => (
                        <div key={lIdx} className={`story-verse-line ${getFontClass()}`}>
                          {convertText(line)}
                        </div>
                      ))}
                    </div>

                    {script !== 'tamil' && showParallelTamil && (
                      <div className="story-parallel-box">
                        <div className="story-parallel-label">தமிழ் வடிவம்:</div>
                        {cleanLines.map((line, lIdx) => (
                          <div key={lIdx} className="story-parallel-line">{line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Story Series Navigation Bar */}
            <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
              <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px', textAlign: 'left' }}>
                {bookTitle} — {chaptersLabelPlural} வழிசெலுத்தல்
              </h4>

              <div className="pagination-nav-pill" style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-start', width: 'auto', flexWrap: 'wrap' }}>
                {prevChapter ? (
                  <button
                    type="button"
                    onClick={() => navigateToChapter(prevChapter.id)}
                    className="page-btn prev-btn"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    <CaretLeft size={14} weight="bold" style={{ marginRight: '6px' }} />
                    {chapterLabel} {prevChapter.chapterNum}: {prevChapter.title}
                  </button>
                ) : (
                  <button type="button" className="page-btn prev-btn" disabled>
                    <CaretLeft size={14} weight="bold" style={{ marginRight: '6px' }} />
                    தொடக்க {chapterLabel}
                  </button>
                )}

                <button
                  type="button"
                  onClick={returnToDirectory}
                  className="page-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ListDashes size={15} weight="bold" />
                  {chaptersLabelPlural}
                </button>

                {nextChapter ? (
                  <button
                    type="button"
                    onClick={() => navigateToChapter(nextChapter.id)}
                    className="page-btn next-btn"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    {chapterLabel} {nextChapter.chapterNum}: {nextChapter.title}
                    <CaretRight size={14} weight="bold" style={{ marginLeft: '6px' }} />
                  </button>
                ) : (
                  <button type="button" className="page-btn next-btn" disabled>
                    இறுதி {chapterLabel}
                    <CaretRight size={14} weight="bold" style={{ marginLeft: '6px' }} />
                  </button>
                )}
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}


