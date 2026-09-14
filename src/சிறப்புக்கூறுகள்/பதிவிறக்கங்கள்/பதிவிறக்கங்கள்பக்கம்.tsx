import './பதிவிறக்கங்கள்.css';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import {
    DownloadSimple,
    GithubLogo,
    ShieldCheck,
    FolderSimple,
    BellSimpleRinging,
    Users,
    TextAa,
    BookOpen,
    FilePdf,
    ArrowSquareOut,
    Check
} from '@phosphor-icons/react';

export default function DownloadsPage() {
    return (
        <>
            <Helmet>
                <title>பதிவிறக்கங்கள் | Downloads — Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Official desktop applications, bespoke typography, ancient script fonts, and classical Tamil literature learning manuals by Elvan Navil." 
                />
            </Helmet>

            <MobileTopBar title="பதிவிறக்கங்கள்" />
            <FloatingBackButton to="/" />

            <div className="downloads-page page-view fadeIn">
                {/* PAGE HEADER */}
                <header className="downloads-header animate-entry">
                    <h1 className="downloads-title" lang="ta">பதிவிறக்கங்கள்</h1>
                    <div className="downloads-title-sub">Downloads & Resources</div>
                    <p className="downloads-subtitle" lang="ta">
                        எல்வன் நவில் உருவாக்கிய கணினி மென்பொருட்கள், தனித்துவ அச்சுருக்கள், தொன்மை அரிச்சுவடி எழுத்துருக்கள் மற்றும் ஆய்வு ஆவணங்கள்.
                    </p>
                    <p className="downloads-subtitle downloads-subtitle-en">
                        Official desktop software, bespoke typography, ancient script typefaces, and printable learning primers crafted by Elvan Navil.
                    </p>
                </header>

                {/* 1. FLAGSHIP DESKTOP APP: NAMMIL */}
                <section id="nammil" className="downloads-section animate-entry">
                    <div className="downloads-section-header">
                        <div className="downloads-section-icon">
                            <DownloadSimple weight="bold" size={20} />
                        </div>
                        <div>
                            <h2 className="downloads-section-title" lang="ta">கணினி மென்பொருட்கள்</h2>
                            <p className="downloads-section-desc">Desktop Applications & Software Suites</p>
                        </div>
                    </div>

                    <div className="flagship-download-card">
                        <div className="flagship-badge-row">
                            <span className="badge-tag green">FLAGSHIP DESKTOP APP</span>
                            <span className="badge-tag blue">v1.2.8 (Latest)</span>
                            <span className="badge-tag neutral">Windows 10 / 11 (64-bit)</span>
                            <span className="badge-tag neutral">MIT Open Source License</span>
                        </div>

                        <div className="flagship-header-row">
                            <div className="flagship-icon-box">
                                <img 
                                    src="/nammil_icon.png" 
                                    alt="Nammil App Icon" 
                                    className="flagship-icon-img"
                                    onError={(e: any) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                            <div>
                                <h3 className="flagship-title" lang="ta">நம்மில் (Nammil)</h3>
                                <p className="flagship-subtitle">Sleek, Privacy-Focused Multi-Account WhatsApp Desktop Companion</p>
                            </div>
                        </div>

                        <p className="flagship-desc" lang="ta">
                            அதிகாரப்பூர்வ வாட்ஸ்அப் ஒரு கணக்கை மட்டுமே அனுமதிக்கும் தடையை உடைத்து, 5 கணக்குகள் வரை ஒரே நேரத்தில் தனித்தனிப் பெட்டகங்களாக இயக்கவும், பதிவிறக்கங்களைத் தானாக ஒழுங்கமைக்கவும் எல்வன் நவில் உருவாக்கிய உயர்தர கணினிச் செயலி.
                        </p>

                        <div className="flagship-features-grid">
                            <div className="flagship-feature-item">
                                <Users weight="bold" size={20} className="flagship-feature-icon" />
                                <div>
                                    <strong>5 Isolated Sessions</strong>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Multi-account partitions with zero collision</div>
                                </div>
                            </div>
                            <div className="flagship-feature-item">
                                <FolderSimple weight="bold" size={20} className="flagship-feature-icon" />
                                <div>
                                    <strong>Automated Media Sorter</strong>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Auto-categorizes PDFs, images & audios</div>
                                </div>
                            </div>
                            <div className="flagship-feature-item">
                                <BellSimpleRinging weight="bold" size={20} className="flagship-feature-icon" />
                                <div>
                                    <strong>Native Windows Chimes</strong>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Taskbar badge count & sound cues</div>
                                </div>
                            </div>
                            <div className="flagship-feature-item">
                                <ShieldCheck weight="bold" size={20} className="flagship-feature-icon" />
                                <div>
                                    <strong>100% Local Privacy</strong>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Zero telemetry, direct local sessions</div>
                                </div>
                            </div>
                        </div>

                        <div className="flagship-action-row">
                            <a 
                                href="https://github.com/ElvanParthasarathy/Nammil/releases/download/v1.2.8/Nammil-Setup.exe" 
                                className="dl-btn primary"
                                download
                            >
                                <DownloadSimple weight="bold" size={18} />
                                <span>Download Nammil Setup (.exe ~114MB)</span>
                            </a>
                            <a 
                                href="https://github.com/ElvanParthasarathy/Nammil" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="dl-btn secondary"
                            >
                                <GithubLogo weight="regular" size={18} />
                                <span>GitHub Repository & Source</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* 2. BESPOKE TYPOGRAPHY: ELVAN SANS & ANCIENT SCRIPTS */}
                <section id="elvan-sans" className="downloads-section animate-entry">
                    <div className="downloads-section-header">
                        <div className="downloads-section-icon">
                            <TextAa weight="bold" size={20} />
                        </div>
                        <div>
                            <h2 className="downloads-section-title" lang="ta">அச்சுருக்கள் & எழுத்துருக்கள்</h2>
                            <p className="downloads-section-desc">Bespoke Typefaces & Epigraphic Ancient Script Fonts</p>
                        </div>
                    </div>

                    <div className="downloads-resource-grid">
                        {/* Elvan Sans Card */}
                        <div className="dl-resource-card">
                            <div className="dl-resource-top">
                                <div className="dl-resource-badge-row">
                                    <span className="badge-tag purple">MODERN TYPEFACE</span>
                                    <span className="badge-tag neutral">16 Styles</span>
                                    <span className="badge-tag neutral">OFL 1.1</span>
                                </div>
                                <h3 className="dl-resource-title" lang="ta">எல்வன் சான்ஸ்</h3>
                                <div className="dl-resource-subtitle">Elvan Sans Font Family</div>
                                <p className="dl-resource-desc" lang="ta">
                                    தமிழ் எழுத்துகளின் தனித்துவ அழகியலையும் லத்தீன் எழுத்துகளின் நவீன வடிவ அமைப்பையும் ஒன்றிணைத்து எல்வன் பார்த்தசாரதியால் செதுக்கப்பட்ட உயர்தர அச்சுரு.
                                </p>
                                <div className="dl-specimen-box">
                                    <div className="dl-specimen-text" lang="ta">அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Harmonious weight-matched typography across English & Tamil.</div>
                                </div>
                            </div>
                            <div className="dl-resource-action">
                                <span className="dl-file-info">Open Font License 1.1</span>
                                <a 
                                    href="https://github.com/ElvanParthasarathy" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="dl-btn secondary sm"
                                >
                                    <span>Explore Typeface</span>
                                    <ArrowSquareOut weight="bold" size={14} />
                                </a>
                            </div>
                        </div>

                        {/* Adinatha Tamil Brahmi */}
                        <div className="dl-resource-card">
                            <div className="dl-resource-top">
                                <div className="dl-resource-badge-row">
                                    <span className="badge-tag blue">தமிழி / BRAHMI</span>
                                    <span className="badge-tag neutral">OpenType</span>
                                </div>
                                <h3 className="dl-resource-title" lang="ta">ஆதிநாதா தமிழி அச்சுரு</h3>
                                <div className="dl-resource-subtitle">Adinatha Tamil Brahmi Font (.otf)</div>
                                <p className="dl-resource-desc" lang="ta">
                                    தொல் தமிழ்க் கல்வெட்டுகள், சமணர் படுக்கைகள் மற்றும் பானை ஓடுகளில் பொறிக்கப்பட்ட ஆதித் தமிழி எழுத்து வடிவங்களுக்கான யுனிகோட் அச்சுரு.
                                </p>
                                <div className="dl-specimen-box">
                                    <div className="dl-specimen-text" style={{ fontFamily: '"Adinatha Tamil Brahmi", "Jinavani", "Noto Sans Tamil", serif' }}>
                                        𑀅𑀓𑀭 𑀫𑀼𑀢𑀮 𑀋𑀵𑀼𑀢𑁆𑀢𑁂𑀮𑁆𑀮𑀸𑀫𑁆
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tamil Brahmi epigraphical glyph set</div>
                                </div>
                            </div>
                            <div className="dl-resource-action">
                                <span className="dl-file-info">OTF Font • 75 KB</span>
                                <a 
                                    href="/downloads/AdinathaTamilBrahmi2.otf" 
                                    download 
                                    className="dl-btn primary sm"
                                >
                                    <DownloadSimple weight="bold" size={15} />
                                    <span>Download .otf</span>
                                </a>
                            </div>
                        </div>

                        {/* e-Velvi Vatteluttu */}
                        <div className="dl-resource-card">
                            <div className="dl-resource-top">
                                <div className="dl-resource-badge-row">
                                    <span className="badge-tag green">வட்டெழுத்து</span>
                                    <span className="badge-tag neutral">TrueType</span>
                                </div>
                                <h3 className="dl-resource-title" lang="ta">இ-வேள்வி வட்டெழுத்து</h3>
                                <div className="dl-resource-subtitle">e-Velvi Vatteluttu Font (.ttf)</div>
                                <p className="dl-resource-desc" lang="ta">
                                    பல்லவர், சேரர் மற்றும் பாண்டியர் காலச் செப்பேடுகள் மற்றும் நடுகற்களில் வழக்கில் இருந்த வட்டெழுத்து வடிவங்களை பிரதிபலிக்கும் நவீன எழுத்துரு.
                                </p>
                                <div className="dl-specimen-box">
                                    <div className="dl-specimen-text" style={{ fontFamily: '"e-Velvi", serif' }}>
                                        அகர முதல எழுத்தெல்லாம் ஆதி
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Medieval Vatteluttu inscriptional style</div>
                                </div>
                            </div>
                            <div className="dl-resource-action">
                                <span className="dl-file-info">TTF Font • 2.5 MB</span>
                                <a 
                                    href="/downloads/e-Velvi.ttf" 
                                    download 
                                    className="dl-btn primary sm"
                                >
                                    <DownloadSimple weight="bold" size={15} />
                                    <span>Download .ttf</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. PRIMERS, FLASHCARDS & STUDY MATERIALS */}
                <section className="downloads-section animate-entry">
                    <div className="downloads-section-header">
                        <div className="downloads-section-icon">
                            <BookOpen weight="bold" size={20} />
                        </div>
                        <div>
                            <h2 className="downloads-section-title" lang="ta">கற்றல் ஆவணங்கள் & செவ்வியல் பிரதிக் குறிப்புகள்</h2>
                            <p className="downloads-section-desc">Script Guides, Flashcards & Classical Text Transcriptions</p>
                        </div>
                    </div>

                    <div className="downloads-resource-grid">
                        <div className="dl-resource-card">
                            <div className="dl-resource-top">
                                <div className="dl-resource-badge-row">
                                    <span className="badge-tag neutral">PDF GUIDE</span>
                                </div>
                                <h3 className="dl-resource-title" lang="ta">ஜினவாணி தமிழி வழிகாட்டி</h3>
                                <div className="dl-resource-subtitle">Jinavani Epigraphy Primer</div>
                                <p className="dl-resource-desc" lang="ta">
                                    ஆதிநாதா தமிழி எழுத்து முறைகள், கூட்டெழுத்து விதிகள் மற்றும் கல்வெட்டு வாசிப்புக்கான விரிவான விளக்கக் கையேடு.
                                </p>
                            </div>
                            <div className="dl-resource-action">
                                <span className="dl-file-info">PDF • 2.0 MB</span>
                                <a 
                                    href="/downloads/adinatha-manual.pdf" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="dl-btn secondary sm"
                                >
                                    <FilePdf weight="bold" size={15} />
                                    <span>View PDF</span>
                                </a>
                            </div>
                        </div>

                        <div className="dl-resource-card">
                            <div className="dl-resource-top">
                                <div className="dl-resource-badge-row">
                                    <span className="badge-tag neutral">FLASHCARDS</span>
                                </div>
                                <h3 className="dl-resource-title" lang="ta">தமிழி பயிற்சி அட்டைகள்</h3>
                                <div className="dl-resource-subtitle">Tamil Brahmi Printable Cards</div>
                                <p className="dl-resource-desc" lang="ta">
                                    உயிர், மெய், உயிர்மெய் எழுத்துகளை எளிதில் பயில அச்சிட்டுப் பயன்படுத்தக்கூடிய பயிற்சி அட்டைகள்.
                                </p>
                            </div>
                            <div className="dl-resource-action">
                                <span className="dl-file-info">PDF • 2.3 MB</span>
                                <a 
                                    href="/downloads/tamil-brahmi-cards.pdf" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="dl-btn secondary sm"
                                >
                                    <FilePdf weight="bold" size={15} />
                                    <span>View PDF</span>
                                </a>
                            </div>
                        </div>

                        <div className="dl-resource-card">
                            <div className="dl-resource-top">
                                <div className="dl-resource-badge-row">
                                    <span className="badge-tag neutral">FLASHCARDS</span>
                                </div>
                                <h3 className="dl-resource-title" lang="ta">வட்டெழுத்து பயிற்சி அட்டைகள்</h3>
                                <div className="dl-resource-subtitle">Vatteluttu Printable Cards</div>
                                <p className="dl-resource-desc" lang="ta">
                                    வட்டெழுத்து எழுத்துருக்களை எளிமையாக அடையாளம் கண்டு நினைவில் கொள்ள உதவும் அச்சிடத்தக்க பயிற்சி அட்டைகள்.
                                </p>
                            </div>
                            <div className="dl-resource-action">
                                <span className="dl-file-info">PDF • 1.5 MB</span>
                                <a 
                                    href="/downloads/vatteluttu-cards.pdf" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="dl-btn secondary sm"
                                >
                                    <FilePdf weight="bold" size={15} />
                                    <span>View PDF</span>
                                </a>
                            </div>
                        </div>

                        <div className="dl-resource-card">
                            <div className="dl-resource-top">
                                <div className="dl-resource-badge-row">
                                    <span className="badge-tag neutral">MANUSCRIPT</span>
                                </div>
                                <h3 className="dl-resource-title" lang="ta">தமிழி திருக்குறள்</h3>
                                <div className="dl-resource-subtitle">Thirukkural in Tamil Brahmi</div>
                                <p className="dl-resource-desc" lang="ta">
                                    திருவள்ளுவரின் உலகப் பொதுமறையாம் திருக்குறளை முழுமையாக ஆதித் தமிழி எழுத்துருவில் வாசிக்கத் தொகுக்கப்பட்ட ஆவணம்.
                                </p>
                            </div>
                            <div className="dl-resource-action">
                                <span className="dl-file-info">PDF • 672 KB</span>
                                <a 
                                    href="/downloads/brahmi-thirukkural.pdf" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="dl-btn secondary sm"
                                >
                                    <FilePdf weight="bold" size={15} />
                                    <span>View PDF</span>
                                </a>
                            </div>
                        </div>

                        <div className="dl-resource-card">
                            <div className="dl-resource-top">
                                <div className="dl-resource-badge-row">
                                    <span className="badge-tag neutral">MANUSCRIPT</span>
                                </div>
                                <h3 className="dl-resource-title" lang="ta">தமிழி தொல்காப்பியம்</h3>
                                <div className="dl-resource-subtitle">Tholkaappiyam in Tamil Brahmi</div>
                                <p className="dl-resource-desc" lang="ta">
                                    தமிழின் மூத்த இலக்கண நூலாம் தொல்காப்பிய நூற்பாக்கள் முழுவதையும் ஆதித் தமிழி வடிவில் காணும் பிரத்யேகப் பிரதி.
                                </p>
                            </div>
                            <div className="dl-resource-action">
                                <span className="dl-file-info">PDF • 750 KB</span>
                                <a 
                                    href="/downloads/brahmi-tholkaappiyam.pdf" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="dl-btn secondary sm"
                                >
                                    <FilePdf weight="bold" size={15} />
                                    <span>View PDF</span>
                                </a>
                            </div>
                        </div>

                        <div className="dl-resource-card">
                            <div className="dl-resource-top">
                                <div className="dl-resource-badge-row">
                                    <span className="badge-tag neutral">MANUSCRIPT</span>
                                </div>
                                <h3 className="dl-resource-title" lang="ta">வட்டெழுத்து திருக்குறள்</h3>
                                <div className="dl-resource-subtitle">Thirukkural in Vatteluttu</div>
                                <p className="dl-resource-desc" lang="ta">
                                    திருக்குறளின் அருங்குறள்களை நடுக்கால வட்டெழுத்து வரிவடிவில் வாசிக்கத் தொகுக்கப்பட்ட நேர்த்தியான மின்நூல்.
                                </p>
                            </div>
                            <div className="dl-resource-action">
                                <span className="dl-file-info">PDF • 615 KB</span>
                                <a 
                                    href="/downloads/vatteluttu-thirukkural.pdf" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="dl-btn secondary sm"
                                >
                                    <FilePdf weight="bold" size={15} />
                                    <span>View PDF</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
