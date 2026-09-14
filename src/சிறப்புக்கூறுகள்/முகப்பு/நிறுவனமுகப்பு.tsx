import './முகப்பு.css';
import '../படைப்புகள்/படைப்புகள்.css';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { 
    BookOpen, 
    Wrench, 
    DownloadSimple, 
    User, 
    Pen, 
    ChatCircleText, 
    Palette, 
    Scroll, 
    TextAa, 
    ArrowRight 
} from '@phosphor-icons/react';

export default function CompanyHome() {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>எல்வன் நவில் | Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Elvan Navil is an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature." 
                />
                <link rel="canonical" href="https://elvannavil.vercel.app/" />
            </Helmet>
            <MobileTopBar title="எல்வன் நவில்" />
            
            <div className="home-page company-home-page page-view fadeIn">
                {/* 1. STUDIO HERO HEADER (MINIMAL, NO PHOTO, PURE TYPOGRAPHY) */}
                <header className="company-hero-card animate-entry" style={{ cursor: 'default' }}>
                    <div className="company-hero-text">
                        <h1 className="company-hero-title" lang="ta">எல்வன் நவில்</h1>
                        <h2 className="company-hero-subtitle">Elvan Navil</h2>
                        <p className="company-hero-desc-ta" lang="ta">
                            நல்வரவு. இது எல்வன் நவில் — சிந்தனைகளை உரைக்க, எழுத்துகளைப் பகிர, தன்னுரிமை மென்பொருட்கள், தனித்துவ அச்சுக்கலை மற்றும் எண்மப் படைப்புகளைக் காட்சிப்படுத்தும் படைப்பரங்கு.
                        </p>
                        <p className="company-hero-desc-en">
                            Welcome to Elvan Navil — an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature.
                        </p>
                        <div className="company-quick-actions">
                            <button onClick={() => navigate('/navilgal')} className="company-pill-btn">
                                <BookOpen weight="regular" size={16} />
                                <span lang="ta">நவில்கள் (Archive)</span>
                            </button>
                            <button onClick={() => navigate('/tools')} className="company-pill-btn">
                                <Wrench weight="regular" size={16} />
                                <span lang="ta">கருவிகள் (Tools)</span>
                            </button>
                            <button onClick={() => navigate('/downloads')} className="company-pill-btn">
                                <DownloadSimple weight="regular" size={16} />
                                <span lang="ta">பதிவிறக்கங்கள் (Downloads)</span>
                            </button>
                            <button onClick={() => navigate('/about')} className="company-pill-btn">
                                <User weight="regular" size={16} />
                                <span>பற்றி (About)</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* 2. DICTIONARY DEFINITION LAYOUT */}
                <div className="dictionary-container animate-entry">
                    <div className="dict-card">
                        <div className="dict-word-header">
                            <span className="dict-word" lang="ta">நவில்</span>
                            <span className="dict-meta">வினைச்சொல்</span>
                        </div>
                        <p className="dict-definition" lang="ta">
                            தமிழ் வேர்ச்சொல் "நவிலுதல்" — உரைத்தல், பேசுதல், பாடுதல், அல்லது வார்த்தைகள் வழி எண்ணங்களை வெளிப்படுத்துதல்.
                        </p>
                    </div>

                    <div className="dict-card">
                        <div className="dict-word-header">
                            <span className="dict-word">Navil</span>
                            <span className="dict-meta">/nʌvɪl/ • verb</span>
                        </div>
                        <p className="dict-definition">
                            Derived from Tamil “Naviluthal” — meaning to speak, utter, narrate, or express core reflections through lyrical words.
                        </p>
                    </div>
                </div>

                {/* 3. CURATED SHOWCASE & DIRECT ACCESS (EXACT STYLE AS OTHER PAGES) */}
                <div className="home-category-grid animate-entry">
                    {/* Card 1: Nammil Desktop App */}
                    <Link to="/downloads" className="category-card">
                        <div className="cat-icon-box">
                            <img 
                                src="/nammil_icon.png" 
                                alt="Nammil App Icon" 
                                style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover' }}
                                onError={(e: any) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <div className="cat-content">
                            <div className="cat-title">
                                நம்மில்
                                <span className="cat-beta-badge">DESKTOP</span>
                            </div>
                            <div className="cat-title-sub">Nammil — Multi-Account WhatsApp Companion</div>
                            <p className="cat-desc">5 கணக்குகள் வரை ஒரே நேரத்தில் இயக்கும் தனியுரிமைக் கணினிச் செயலி.</p>
                            <p className="cat-desc-sub">Sleek, privacy-focused multi-account WhatsApp desktop companion for Windows.</p>
                        </div>
                        <div className="cat-footer">
                            பதிவிறக்கப் பக்கம் செல்க <ArrowRight weight="regular" />
                        </div>
                    </Link>

                    {/* Card 2: Navil Poems */}
                    <Link to="/navilgal/ezhuthugal/poems" className="category-card">
                        <div className="cat-icon-box"><Pen weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">நவில் மிழிகள்</div>
                            <div className="cat-title-sub">Navil Poems</div>
                            <p className="cat-desc">என் உணர்வுகளையும் அழகியலையும் பேசும் ஓசைநயமிக்க கவிதை வரிகள்.</p>
                            <p className="cat-desc-sub">Lyrical Tamil verses and emotional reflections.</p>
                        </div>
                        <div className="cat-footer">
                            கவிதைகளை வாசிக்க <ArrowRight weight="regular" />
                        </div>
                    </Link>

                    {/* Card 3: Navil Quotes */}
                    <Link to="/navilgal/ezhuthugal/quotes" className="category-card">
                        <div className="cat-icon-box"><ChatCircleText weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">நவில் மொழிகள்</div>
                            <div className="cat-title-sub">Navil Quotes</div>
                            <p className="cat-desc">என் பட்டறிவில் உதித்த ஆழ்ந்த சிந்தனைத் துளிகளும் வாழ்வியல் தத்துவங்களும்.</p>
                            <p className="cat-desc-sub">Aphorisms, philosophy and personal insights.</p>
                        </div>
                        <div className="cat-footer">
                            மொழிகளைப் பார்க்க <ArrowRight weight="regular" />
                        </div>
                    </Link>

                    {/* Card 4: Short Stories */}
                    <Link to="/navilgal/ezhuthugal/stories" className="category-card">
                        <div className="cat-icon-box"><BookOpen weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">சிறுகதைகள்</div>
                            <div className="cat-title-sub">Stories & Narratives</div>
                            <p className="cat-desc">கற்பனையும் மனித வாழ்வும் பின்னிப் பிணைந்த சுவாரசியமான கதைப் பதிவுகள்.</p>
                            <p className="cat-desc-sub">Immersive short stories and narrative chronicles.</p>
                        </div>
                        <div className="cat-footer">
                            கதைகளில் மூழ்குக <ArrowRight weight="regular" />
                        </div>
                    </Link>

                    {/* Card 5: Art Gallery */}
                    <Link to="/navilgal/arts" className="category-card">
                        <div className="cat-icon-box"><Palette weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">கலைக்கூடம்</div>
                            <div className="cat-title-sub">Arts & Sketches</div>
                            <p className="cat-desc">கரிக்கோல் ஓவியங்கள், சுவரொட்டிகள் மற்றும் எண்ம வரைகலைகள்.</p>
                            <p className="cat-desc-sub">Charcoal sketches, posters and visual artworks.</p>
                        </div>
                        <div className="cat-footer">
                            கலைக்கூடத்தைக் காண்க <ArrowRight weight="regular" />
                        </div>
                    </Link>

                    {/* Card 6: Classical Texts */}
                    <Link to="/tools/arichuvadi/books" className="category-card">
                        <div className="cat-icon-box"><Scroll weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">செவ்வியல் நூல்கள்</div>
                            <div className="cat-title-sub">Tolkappiyam & Thirukkural</div>
                            <p className="cat-desc">பழந்தமிழ் செவ்வியல் இலக்கியங்களை நவீன வடிவம், தமிழி மற்றும் வட்டெழுத்தில் வாசிக்கும் தளம்.</p>
                            <p className="cat-desc-sub">Ancient classics in Modern Tamil, Thamizhi & Vatteluttu scripts.</p>
                        </div>
                        <div className="cat-footer">
                            செவ்வியல் நூல்கள் வாசிக்க <ArrowRight weight="regular" />
                        </div>
                    </Link>

                    {/* Card 7: Elvan Sans Typeface */}
                    <Link to="/downloads#elvan-sans" className="category-card">
                        <div className="cat-icon-box"><TextAa weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">எல்வன் சான்ஸ்</div>
                            <div className="cat-title-sub">Elvan Sans Typeface</div>
                            <p className="cat-desc">தமிழ் மற்றும் லத்தீன் எழுத்துகளின் நவீன அழகியலை ஒன்றிணைத்த தனித்துவ அச்சுரு.</p>
                            <p className="cat-desc-sub">Bespoke 16-style dual-script font family.</p>
                        </div>
                        <div className="cat-footer">
                            அச்சுரு விபரம் காண்க <ArrowRight weight="regular" />
                        </div>
                    </Link>

                    {/* Card 8: Navil Web Tools */}
                    <Link to="/tools" className="category-card">
                        <div className="cat-icon-box"><Wrench weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">
                                நவில் கருவிகள்
                                <span className="cat-beta-badge">BETA</span>
                            </div>
                            <div className="cat-title-sub">Web Tools & Engines</div>
                            <p className="cat-desc">மொழிமாற்றி, அரிச்சுவடி மற்றும் கின்னரப்பெட்டி இணையப் பயன்பாடுகள்.</p>
                            <p className="cat-desc-sub">Interactive linguistic engines and virtual piano synthesizer.</p>
                        </div>
                        <div className="cat-footer">
                            கருவிகளைத் திறக்க <ArrowRight weight="regular" />
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}
