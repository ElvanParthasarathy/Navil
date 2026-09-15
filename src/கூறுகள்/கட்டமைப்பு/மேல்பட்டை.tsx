import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Tooltip, ButtonBase } from '@mui/material';
import { Copy, Check, GithubLogo, ArrowSquareOut, SidebarSimple } from '@phosphor-icons/react';
import './மேல்பட்டை.css';

export interface RouteMeta {
    title: string;
    subtitle: string;
    icon: string;
    badge?: string;
    githubUrl?: string;
    showBack: boolean;
    backUrl?: string;
}

export function getRouteInfo(pathname: string): RouteMeta {
    const p = pathname.toLowerCase().replace(/\/$/, '') || '/';

    // 1. Root Company Home
    if (p === '/') {
        return {
            title: 'எல்வன் நவில்',
            subtitle: 'Elvan Navil',
            icon: '/favicon.png',
            showBack: false
        };
    }

    // 2. Downloads & Applications
    if (p.startsWith('/downloads/nammil')) {
        return {
            title: 'நம்மில்',
            subtitle: 'Nammil • Multi-Account WhatsApp Companion',
            icon: '/nammil_icon.png',
            badge: 'App',
            githubUrl: 'https://github.com/ElvanParthasarathy/Nammil',
            showBack: true,
            backUrl: '/downloads'
        };
    }

    if (p === '/downloads') {
        return {
            title: 'பதிவிறக்கங்கள்',
            subtitle: 'Downloads • Desktop Applications',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/'
        };
    }

    // 3. Navilgal Landing
    if (p === '/navilgal') {
        return {
            title: 'எல்வனின் நவில்கள்',
            subtitle: 'Elvanin Navilgal',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/'
        };
    }

    // 4. Writings Section Root
    if (p === '/writings' || p === '/navilgal/writings' || p === '/navilgal/ezhuthugal' || p === '/navilgal/ezhutgal') {
        return {
            title: 'எழுத்துகள்',
            subtitle: 'Writings & Literature',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/navilgal'
        };
    }

    // 5. Writings Sub-Categories
    const writingsBase = p.startsWith('/navilgal/ezhuthugal') ? '/navilgal/ezhuthugal'
        : p.startsWith('/navilgal/ezhutgal') ? '/navilgal/ezhutgal'
        : p.startsWith('/navilgal/writings') ? '/navilgal/writings'
        : '/writings';

    if (p.includes('/poems')) {
        return {
            title: 'நவில் மிழிகள்',
            subtitle: 'Navil Poems',
            icon: '/favicon.png',
            showBack: true,
            backUrl: writingsBase
        };
    }

    if (p.includes('/quotes')) {
        return {
            title: 'நவில் மொழிகள்',
            subtitle: 'Navil Quotes',
            icon: '/favicon.png',
            showBack: true,
            backUrl: writingsBase
        };
    }

    if (p.includes('/stories')) {
        return {
            title: 'சிறுகதைகள்',
            subtitle: 'Short Stories',
            icon: '/favicon.png',
            showBack: true,
            backUrl: writingsBase
        };
    }

    if (p.includes('/articles')) {
        return {
            title: 'கட்டுரைகள்',
            subtitle: 'Articles',
            icon: '/favicon.png',
            showBack: true,
            backUrl: writingsBase
        };
    }

    if (p.includes('/diary')) {
        return {
            title: 'நாளேடு',
            subtitle: 'Diary',
            icon: '/favicon.png',
            showBack: true,
            backUrl: writingsBase
        };
    }

    // 6. Arts Section
    const artsBase = p.startsWith('/navilgal/padaippugal') ? '/navilgal/padaippugal'
        : p.startsWith('/navilgal/arts') ? '/navilgal/arts'
        : '/arts';

    if (p === '/arts' || p === '/navilgal/arts' || p === '/navilgal/padaippugal') {
        return {
            title: 'கலைகள்',
            subtitle: 'Arts & Creative Expressions',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/navilgal'
        };
    }

    if (p.includes('/arts/sketches') || p.includes('/padaippugal/sketches')) {
        return {
            title: 'கரிக்கோல் ஓவியங்கள்',
            subtitle: 'Pencil Sketches',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.includes('/arts/illustrations') || p.includes('/padaippugal/illustrations')) {
        return {
            title: 'விளக்கப்படங்கள்',
            subtitle: 'Illustrations',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.includes('/arts/posters') || p.includes('/padaippugal/posters')) {
        return {
            title: 'சுவரொட்டிகள்',
            subtitle: 'Posters',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.includes('/arts/albums') || p.includes('/padaippugal/albums')) {
        return {
            title: 'தொகுப்புகள்',
            subtitle: 'Albums',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.includes('/arts/paintings') || p.includes('/padaippugal/paintings')) {
        return {
            title: 'ஓவியங்கள்',
            subtitle: 'Paintings',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.includes('/arts/digital') || p.includes('/padaippugal/digital')) {
        return {
            title: 'எண்மக்கலைகள்',
            subtitle: 'Digital Arts',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.startsWith('/arts/') || p.startsWith('/navilgal/arts/') || p.startsWith('/navilgal/padaippugal/')) {
        return {
            title: 'கலைக்கூடம்',
            subtitle: 'Arts Gallery',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    // 7. Tools Section
    if (p.startsWith('/tools/transliter') || p.startsWith('/tools/mozhimatri')) {
        return {
            title: 'மொழிமாற்றி',
            subtitle: 'Transliterator • Script Converter',
            icon: '/favicon.png',
            badge: 'BETA',
            showBack: true,
            backUrl: '/tools'
        };
    }

    if (p.startsWith('/tools/arichuvadi')) {
        return {
            title: 'அரிச்சுவடி',
            subtitle: 'Arichuvadi • Tamil Learning Suite',
            icon: '/favicon.png',
            badge: 'BETA',
            showBack: true,
            backUrl: '/tools'
        };
    }

    if (p.startsWith('/tools/vocoder') || p.startsWith('/teaching/vocoder')) {
        return {
            title: 'குரல்மாற்றி',
            subtitle: 'Vocoder • Audio Synth',
            icon: '/favicon.png',
            badge: 'BETA',
            showBack: true,
            backUrl: '/tools'
        };
    }

    if (p.startsWith('/tools/piano') || p.startsWith('/tools/kinnarappetti')) {
        return {
            title: 'கின்னரப்பெட்டி',
            subtitle: 'Piano • Music Maker',
            icon: '/favicon.png',
            badge: 'BETA',
            showBack: true,
            backUrl: '/tools'
        };
    }

    if (p === '/tools' || p === '/teaching' || p === '/tools/teaching') {
        return {
            title: 'கருவிகள்',
            subtitle: 'Tools & Utilities',
            icon: '/favicon.png',
            badge: 'BETA',
            showBack: true,
            backUrl: '/'
        };
    }

    // 8. Personal & Settings
    if (p === '/about') {
        return {
            title: 'பற்றி',
            subtitle: 'About • Elvan Parthasarathy',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/'
        };
    }

    if (p === '/portfolio') {
        return {
            title: 'தொகுப்பு',
            subtitle: 'Portfolio',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/'
        };
    }

    if (p === '/settings') {
        return {
            title: 'அமைப்புகள்',
            subtitle: 'Settings & Preferences',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/'
        };
    }

    return {
        title: 'எல்வன் நவில்',
        subtitle: 'Elvan Navil',
        icon: '/favicon.png',
        showBack: true,
        backUrl: '/'
    };
}

export interface DesktopTopBarProps {
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

export const DesktopTopBar: React.FC<DesktopTopBarProps> = ({
    isSidebarCollapsed = false,
    onToggleSidebar
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [isToggleTooltipOpen, setIsToggleTooltipOpen] = useState(false);
    const toggleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleToggleMouseEnter = () => {
        if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
        toggleTimerRef.current = setTimeout(() => {
            setIsToggleTooltipOpen(true);
        }, 1200);
    };

    const handleToggleMouseLeave = () => {
        if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
        setIsToggleTooltipOpen(false);
    };

    const handleToggleClick = () => {
        if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
        setIsToggleTooltipOpen(false);
        if (onToggleSidebar) onToggleSidebar();
    };

    useEffect(() => {
        return () => {
            if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
        };
    }, []);

    const routeInfo = getRouteInfo(location.pathname);

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else if (routeInfo.backUrl) {
            navigate(routeInfo.backUrl);
        } else {
            navigate('/');
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    return (
        <header className="desktop-topbar" aria-label="Desktop Top Bar">
            {/* SIDEBAR ZONE (Top-Left, matches sidebar width and hairline divider) */}
            <div className={`desktop-topbar-sidebar-zone ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                {!isSidebarCollapsed && (
                    <Link to="/" className="desktop-topbar-sidebar-brand" lang="ta">
                        எல்வன் நவில்
                    </Link>
                )}
                <Tooltip
                    title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    placement="right"
                    arrow
                    open={isToggleTooltipOpen}
                    disableHoverListener
                    disableFocusListener
                    disableTouchListener
                >
                    <ButtonBase
                        component="button"
                        className="sidebar-toggle-btn"
                        onClick={handleToggleClick}
                        onMouseEnter={handleToggleMouseEnter}
                        onMouseLeave={handleToggleMouseLeave}
                        disableFocusRipple
                        centerRipple
                        aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <SidebarSimple weight="regular" size={19} />
                    </ButtonBase>
                </Tooltip>
            </div>

            {/* CONTENT ZONE (Top-Right, full width flex-1) */}
            <div className="desktop-topbar-content-zone">
                {/* PAGE IDENTITY + EMBEDDED BACK BUTTON */}
                <div className="desktop-topbar-left">
                    {routeInfo.showBack && (
                        <button 
                            type="button" 
                            className="desktop-topbar-back-btn" 
                            onClick={handleBack}
                            aria-label="பின்செல்"
                            title="முந்தைய பக்கத்திற்குச் செல்"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            <span>பின்செல்</span>
                        </button>
                    )}

                    <Link 
                        to={location.pathname} 
                        className="desktop-topbar-brand"
                    >
                        <img 
                            src={routeInfo.icon} 
                            alt="" 
                            className="desktop-topbar-icon"
                            onError={(e: any) => { e.target.src = '/favicon.png'; }}
                        />
                        <div className="desktop-topbar-titles">
                            <span className="desktop-topbar-title" lang="ta">{routeInfo.title}</span>
                            {routeInfo.subtitle && (
                                <span className="desktop-topbar-subtitle">{routeInfo.subtitle}</span>
                            )}
                            {routeInfo.badge && (
                                <span className="desktop-topbar-badge">{routeInfo.badge}</span>
                            )}
                        </div>
                    </Link>
                </div>

                {/* ACTIONS (GITHUB, COPY LINK / SHARE) */}
                <div className="desktop-topbar-right">
                    {routeInfo.githubUrl && (
                        <Tooltip title="GitHub Repository" placement="bottom" arrow enterDelay={300}>
                            <a 
                                href={routeInfo.githubUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="desktop-topbar-pill-btn"
                                aria-label="GitHub Repository"
                            >
                                <GithubLogo size={14} weight="bold" />
                                <span>GitHub</span>
                                <ArrowSquareOut size={12} weight="bold" style={{ opacity: 0.6 }} />
                            </a>
                        </Tooltip>
                    )}

                    <Tooltip 
                        title={copied ? "Copied to clipboard!" : "Copy link"} 
                        placement="bottom" 
                        arrow 
                        enterDelay={300}
                    >
                        <button 
                            className={`desktop-topbar-pill-btn ${copied ? 'copied' : ''}`}
                            onClick={handleCopyLink}
                            aria-label="Copy page link"
                        >
                            {copied ? (
                                <>
                                    <Check size={14} weight="bold" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={14} weight="bold" />
                                    <span>Share</span>
                                </>
                            )}
                        </button>
                    </Tooltip>
                </div>
            </div>
        </header>
    );
};

export default DesktopTopBar;
