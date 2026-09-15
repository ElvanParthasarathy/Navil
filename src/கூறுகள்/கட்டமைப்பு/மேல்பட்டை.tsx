import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { Copy, Check, GithubLogo, ArrowSquareOut } from '@phosphor-icons/react';
import './மேல்பட்டை.css';

interface RouteMeta {
    title: string;
    subtitle: string;
    icon: string;
    badge?: string;
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
            githubUrl: 'https://github.com/ElvanParthasarathy/Nammil'
        };
    }

    if (p === '/downloads') {
        return {
            title: 'பதிவிறக்கங்கள்',
            subtitle: 'Downloads • Desktop Applications',
            icon: '/favicon.png'
        };
    }

    if (p.startsWith('/tools/transliteration') || p.startsWith('/tools/mozhimatri')) {
        return {
            title: 'மொழிமாற்றி',
            subtitle: 'Transliterator • Script Converter',
            icon: '/favicon.png',
            badge: 'BETA'
        };
    }

    if (p.startsWith('/tools/arichuvadi')) {
        return {
            title: 'அரிச்சுவடி',
            subtitle: 'Arichuvadi • Tamil Learning Suite',
            icon: '/favicon.png',
            badge: 'BETA'
        };
    }

    if (p.startsWith('/tools/vocoder') || p.startsWith('/tools/kinnarappetti')) {
        return {
            title: 'குரல்மாற்றி',
            subtitle: 'Vocoder • Audio Synth',
            icon: '/favicon.png',
            badge: 'BETA'
        };
    }

    if (p.startsWith('/tools') || p.startsWith('/teaching')) {
        return {
            title: 'கருவிகள்',
            subtitle: 'Tools & Utilities',
            icon: '/favicon.png',
            badge: 'BETA'
        };
    }

    if (p.startsWith('/writings') || p.startsWith('/navilgal')) {
        return {
            title: 'நவில்கள்',
            subtitle: 'Navilgal • Literature & Articles',
            icon: '/favicon.png'
        };
    }

    if (p.startsWith('/arts')) {
        return {
            title: 'கலைகள்',
            subtitle: 'Arts • Creative Gallery',
            icon: '/favicon.png'
        };
    }

    if (p === '/about' || p === '/portfolio') {
        return {
            title: 'பற்றி',
            subtitle: 'About • Elvan Navil',
            icon: '/favicon.png'
        };
    }

    if (p === '/settings') {
        return {
            title: 'அமைப்புகள்',
            subtitle: 'Settings & Preferences',
            icon: '/favicon.png'
        };
    }

    return {
        title: 'எல்வன் நவில்',
        subtitle: 'Elvan Navil',
        icon: '/favicon.png'
    };
}

export const DesktopTopBar: React.FC = () => {
    const location = useLocation();
    const [copied, setCopied] = useState(false);

    const routeInfo = getRouteInfo(location.pathname);

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
            {/* LEFT: LOGO + TITLES */}
            <div className="desktop-topbar-left">
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
                        <span className="desktop-topbar-subtitle">{routeInfo.subtitle}</span>
                        {routeInfo.badge && (
                            <span className="desktop-topbar-badge">{routeInfo.badge}</span>
                        )}
                    </div>
                </Link>
            </div>

            {/* RIGHT: ACTIONS (GITHUB, COPY LINK, EXTERNAL) - PILL SHAPES */}
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
        </header>
    );
};

export default DesktopTopBar;
