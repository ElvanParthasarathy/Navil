import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { ArrowLeft, Copy, Check, GithubLogo, ArrowSquareOut } from '@phosphor-icons/react';
import './மேல்பட்டை.css';

interface RouteMeta {
    title: string;
    subtitle: string;
    icon: string;
    badge?: string;
    hasBack: boolean;
    backTo?: string;
    githubUrl?: string;
}

function getRouteInfo(pathname: string): RouteMeta {
    const p = pathname.toLowerCase().replace(/\/$/, '') || '/';

    if (p.startsWith('/downloads/nammil')) {
        return {
            title: 'நம்மில்',
            subtitle: 'Nammil • Multi-Account WhatsApp Companion',
            icon: '/nammil_icon.png',
            badge: 'App',
            hasBack: true,
            backTo: '/downloads',
            githubUrl: 'https://github.com/ElvanParthasarathy/Nammil'
        };
    }

    if (p === '/downloads') {
        return {
            title: 'பதிவிறக்கங்கள்',
            subtitle: 'Downloads • Desktop Applications',
            icon: '/favicon.png',
            hasBack: false
        };
    }

    if (p.startsWith('/tools/transliteration') || p.startsWith('/tools/mozhimatri')) {
        return {
            title: 'மொழிமாற்றி',
            subtitle: 'Transliterator • Script Converter',
            icon: '/favicon.png',
            badge: 'BETA',
            hasBack: true,
            backTo: '/tools'
        };
    }

    if (p.startsWith('/tools/arichuvadi')) {
        return {
            title: 'அரிச்சுவடி',
            subtitle: 'Arichuvadi • Tamil Learning Suite',
            icon: '/favicon.png',
            badge: 'BETA',
            hasBack: true,
            backTo: '/tools'
        };
    }

    if (p.startsWith('/tools/vocoder') || p.startsWith('/tools/kinnarappetti')) {
        return {
            title: 'குரல்மாற்றி',
            subtitle: 'Vocoder • Audio Synth',
            icon: '/favicon.png',
            badge: 'BETA',
            hasBack: true,
            backTo: '/tools'
        };
    }

    if (p.startsWith('/tools') || p.startsWith('/teaching')) {
        const isSub = p !== '/tools' && p !== '/teaching';
        return {
            title: 'கருவிகள்',
            subtitle: 'Tools & Utilities',
            icon: '/favicon.png',
            badge: 'BETA',
            hasBack: isSub,
            backTo: '/tools'
        };
    }

    if (p.startsWith('/writings') || p.startsWith('/navilgal')) {
        const isSub = p !== '/writings' && p !== '/navilgal';
        return {
            title: 'நவில்கள்',
            subtitle: 'Navilgal • Literature & Articles',
            icon: '/favicon.png',
            hasBack: isSub,
            backTo: '/navilgal'
        };
    }

    if (p.startsWith('/arts')) {
        return {
            title: 'கலைகள்',
            subtitle: 'Arts • Creative Gallery',
            icon: '/favicon.png',
            hasBack: false
        };
    }

    if (p === '/about' || p === '/portfolio') {
        return {
            title: 'பற்றி',
            subtitle: 'About • Elvan Navil',
            icon: '/favicon.png',
            hasBack: false
        };
    }

    if (p === '/settings') {
        return {
            title: 'அமைப்புகள்',
            subtitle: 'Settings & Preferences',
            icon: '/favicon.png',
            hasBack: false
        };
    }

    return {
        title: 'எல்வன் நவில்',
        subtitle: 'Elvan Navil',
        icon: '/favicon.png',
        hasBack: false
    };
}

export const DesktopTopBar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const routeInfo = getRouteInfo(location.pathname);

    const handleBack = () => {
        if (routeInfo.backTo) {
            navigate(routeInfo.backTo);
        } else if (window.history.length > 1) {
            navigate(-1);
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
            {/* LEFT: BACK BUTTON + LOGO + TITLES */}
            <div className="desktop-topbar-left">
                {routeInfo.hasBack && (
                    <Tooltip title="Back" placement="bottom" arrow enterDelay={300}>
                        <button 
                            className="desktop-topbar-back-btn" 
                            onClick={handleBack}
                            aria-label="Go back"
                        >
                            <ArrowLeft size={16} weight="bold" />
                        </button>
                    </Tooltip>
                )}

                <Link 
                    to={routeInfo.hasBack && routeInfo.backTo ? routeInfo.backTo : location.pathname} 
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
                        <span className="desktop-topbar-subtitle">{routeInfo.subtitle}</span>
                        {routeInfo.badge && (
                            <span className="desktop-topbar-badge">{routeInfo.badge}</span>
                        )}
                    </div>
                </Link>
            </div>

            {/* RIGHT: ACTIONS (GITHUB, COPY LINK, EXTERNAL) */}
            <div className="desktop-topbar-right">
                {routeInfo.githubUrl && (
                    <Tooltip title="GitHub Repository" placement="bottom" arrow enterDelay={300}>
                        <a 
                            href={routeInfo.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="desktop-topbar-btn"
                            aria-label="GitHub Repository"
                        >
                            <GithubLogo size={15} weight="bold" />
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
                        className={`desktop-topbar-btn ${copied ? 'copied' : ''}`}
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
        </header>
    );
};

export default DesktopTopBar;
