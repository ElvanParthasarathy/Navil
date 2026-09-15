import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Tooltip, ButtonBase } from '@mui/material';
import { SidebarSimple } from '@phosphor-icons/react';
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
            title: 'முகப்பு',
            subtitle: 'home',
            icon: '/favicon.png',
            showBack: false
        };
    }

    // 2. Downloads & Applications
    if (p.startsWith('/downloads/nammil')) {
        return {
            title: 'நம்மில்',
            subtitle: 'nammil',
            icon: '/nammil_icon.png',
            githubUrl: 'https://github.com/ElvanParthasarathy/Nammil',
            showBack: true,
            backUrl: '/downloads'
        };
    }

    if (p === '/downloads') {
        return {
            title: 'பதிவிறக்கங்கள்',
            subtitle: 'downloads',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/'
        };
    }

    // 3. Navilgal Landing
    if (p === '/navilgal') {
        return {
            title: 'எல்வனின் நவில்கள்',
            subtitle: 'elvanin navilgal',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/'
        };
    }

    // 4. Writings Section Root
    if (p === '/writings' || p === '/navilgal/writings' || p === '/navilgal/ezhuthugal' || p === '/navilgal/ezhutgal') {
        return {
            title: 'எழுத்துகள்',
            subtitle: 'writings',
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
            subtitle: 'navil poems',
            icon: '/favicon.png',
            showBack: true,
            backUrl: writingsBase
        };
    }

    if (p.includes('/quotes')) {
        return {
            title: 'நவில் மொழிகள்',
            subtitle: 'navil quotes',
            icon: '/favicon.png',
            showBack: true,
            backUrl: writingsBase
        };
    }

    if (p.includes('/stories')) {
        return {
            title: 'சிறுகதைகள்',
            subtitle: 'short stories',
            icon: '/favicon.png',
            showBack: true,
            backUrl: writingsBase
        };
    }

    if (p.includes('/articles')) {
        return {
            title: 'கட்டுரைகள்',
            subtitle: 'articles',
            icon: '/favicon.png',
            showBack: true,
            backUrl: writingsBase
        };
    }

    if (p.includes('/diary')) {
        return {
            title: 'நாளேடு',
            subtitle: 'diary',
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
            subtitle: 'arts',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/navilgal'
        };
    }

    if (p.includes('/arts/sketches') || p.includes('/padaippugal/sketches')) {
        return {
            title: 'கரிக்கோல் ஓவியங்கள்',
            subtitle: 'pencil sketches',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.includes('/arts/illustrations') || p.includes('/padaippugal/illustrations')) {
        return {
            title: 'விளக்கப்படங்கள்',
            subtitle: 'illustrations',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.includes('/arts/posters') || p.includes('/padaippugal/posters')) {
        return {
            title: 'சுவரொட்டிகள்',
            subtitle: 'posters',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.includes('/arts/albums') || p.includes('/padaippugal/albums')) {
        return {
            title: 'தொகுப்புகள்',
            subtitle: 'albums',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.includes('/arts/paintings') || p.includes('/padaippugal/paintings')) {
        return {
            title: 'ஓவியங்கள்',
            subtitle: 'paintings',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.includes('/arts/digital') || p.includes('/padaippugal/digital')) {
        return {
            title: 'எண்மக்கலைகள்',
            subtitle: 'digital arts',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    if (p.startsWith('/arts/') || p.startsWith('/navilgal/arts/') || p.startsWith('/navilgal/padaippugal/')) {
        return {
            title: 'கலைக்கூடம்',
            subtitle: 'arts gallery',
            icon: '/favicon.png',
            showBack: true,
            backUrl: artsBase
        };
    }

    // 7. Tools Section
    if (p.startsWith('/tools/transliter') || p.startsWith('/tools/mozhimatri')) {
        return {
            title: 'மொழிமாற்றி',
            subtitle: 'transliterator',
            icon: '/favicon.png',
            badge: 'BETA',
            showBack: true,
            backUrl: '/tools'
        };
    }

    if (p.startsWith('/tools/arichuvadi')) {
        return {
            title: 'அரிச்சுவடி',
            subtitle: 'arichuvadi',
            icon: '/favicon.png',
            badge: 'BETA',
            showBack: true,
            backUrl: '/tools'
        };
    }

    if (p.startsWith('/tools/vocoder') || p.startsWith('/teaching/vocoder')) {
        return {
            title: 'குரல்மாற்றி',
            subtitle: 'vocoder',
            icon: '/favicon.png',
            badge: 'BETA',
            showBack: true,
            backUrl: '/tools'
        };
    }

    if (p.startsWith('/tools/piano') || p.startsWith('/tools/kinnarappetti')) {
        return {
            title: 'கின்னரப்பெட்டி',
            subtitle: 'piano',
            icon: '/favicon.png',
            badge: 'BETA',
            showBack: true,
            backUrl: '/tools'
        };
    }

    if (p === '/tools' || p === '/teaching' || p === '/tools/teaching') {
        return {
            title: 'கருவிகள்',
            subtitle: 'tools',
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
            subtitle: 'about',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/'
        };
    }

    if (p === '/portfolio') {
        return {
            title: 'தொகுப்பு',
            subtitle: 'portfolio',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/'
        };
    }

    if (p === '/settings') {
        return {
            title: 'அமைப்புகள்',
            subtitle: 'settings',
            icon: '/favicon.png',
            showBack: true,
            backUrl: '/'
        };
    }

    return {
        title: 'முகப்பு',
        subtitle: 'home',
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

    return (
        <header className="desktop-topbar" aria-label="Desktop Top Bar">
            {/* SIDEBAR ZONE (Top-Left, matches sidebar width and hairline divider) */}
            <div className={`desktop-topbar-sidebar-zone ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                {!isSidebarCollapsed && (
                    <Link to="/" className="desktop-topbar-sidebar-brand" lang="ta">
                        <span className="desktop-topbar-sidebar-brand-title">எல்வன் நவில்</span>
                        <span className="desktop-topbar-sidebar-brand-subtitle">Elvan Navil</span>
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
                {/* PAGE IDENTITY */}
                <div className="desktop-topbar-left">
                    {routeInfo.showBack && (
                        <button 
                            type="button" 
                            className="desktop-topbar-circle-back-btn" 
                            onClick={handleBack}
                            aria-label="பின்செல்"
                            title="முந்தைய பக்கத்திற்குச் செல்"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}
                    <Link 
                        to={location.pathname} 
                        className="desktop-topbar-brand"
                    >
                        <div className="desktop-topbar-titles">
                            <div className="desktop-topbar-title-row">
                                <span className="desktop-topbar-title" lang="ta">{routeInfo.title}</span>
                                {routeInfo.badge && (
                                    <span className="desktop-topbar-badge">{routeInfo.badge}</span>
                                )}
                            </div>
                            {routeInfo.subtitle && (
                                <span className="desktop-topbar-subtitle">{routeInfo.subtitle}</span>
                            )}
                        </div>
                    </Link>
                </div>

                {/* CONTROLS & ACTIONS ZONE */}
                <div className="desktop-topbar-right" id="desktop-topbar-actions" />
            </div>
        </header>
    );
};

export default DesktopTopBar;
