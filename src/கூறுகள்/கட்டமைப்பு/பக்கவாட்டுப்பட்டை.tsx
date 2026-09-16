import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../../கொக்கிகள்/கருப்பொருள்';
import { ButtonBase, Tooltip } from '@mui/material';
import { ProfileImage } from '../ஊடகம்/சுயவிவரபடம்';
import { NavLink } from './வழிசெலுத்தல்இணைப்பு';
import profileData from '../../தரவு/தன்னுரு.json';
import profilePic from '../../வளங்கள்/இன்ஸ்டாகிராம்/தன்னுரு.png';
import { House, User, Monitor, Sun, Moon, Wrench, SidebarSimple, BookOpen, DownloadSimple } from '@phosphor-icons/react';

interface SidebarProps {
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    isMainLevel: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isSidebarCollapsed,
    onToggleSidebar,
    isMainLevel,
}) => {
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [isToggleTooltipOpen, setIsToggleTooltipOpen] = React.useState(false);
    const toggleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const settingsZoneRef = React.useRef<HTMLDivElement>(null);

    const handleToggleMouseEnter = () => {
        if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
        toggleTimerRef.current = setTimeout(() => {
            setIsToggleTooltipOpen(true);
        }, 1500);
    };

    const handleToggleMouseLeave = () => {
        if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
        setIsToggleTooltipOpen(false);
    };

    const handleToggleClick = () => {
        if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
        setIsToggleTooltipOpen(false);
        onToggleSidebar();
    };

    React.useEffect(() => {
        return () => {
            if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);
        };
    }, []);

    // Close popup on click outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (settingsZoneRef.current && !settingsZoneRef.current.contains(e.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        if (isSettingsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSettingsOpen]);

    return (
        <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${!isMainLevel ? 'mobile-hidden-nav' : ''}`}>
            <div className="sidebar-backdrop" />

            <div className="sidebar-top">
                <div className="sidebar-header">
                    {!isSidebarCollapsed && (
                        <div className="brand" lang="ta">
                            <span className="brand-title">எல்வன் நவில்</span>
                            <span className="brand-subtitle">Elvan Navil</span>
                        </div>
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
                        >
                            <SidebarSimple weight="regular" size={19} />
                        </ButtonBase>
                    </Tooltip>
                </div>
                <div className="sidebar-nav">
                    <NavLink to="/" icon={<House weight={location.pathname === '/' ? "fill" : "regular"} size={21} />} label="முகப்பு" subLabel="home" active={location.pathname === '/'} collapsed={isSidebarCollapsed} />
                    <NavLink 
                        to="/navilgal" 
                        icon={<BookOpen weight={(location.pathname.startsWith('/navilgal') || location.pathname.startsWith('/writings') || location.pathname.startsWith('/arts')) ? "fill" : "regular"} size={21} />} 
                        label="நவில்கள்" 
                        subLabel="navilgal" 
                        active={location.pathname.startsWith('/navilgal') || location.pathname.startsWith('/writings') || location.pathname.startsWith('/arts')} 
                        collapsed={isSidebarCollapsed} 
                    />
                    <NavLink to="/tools" icon={<Wrench weight={(location.pathname.startsWith('/tools') || location.pathname.startsWith('/teaching')) ? "fill" : "regular"} size={21} />} label="கருவிகள்" subLabel="tools" badge="BETA" active={location.pathname.startsWith('/tools') || location.pathname.startsWith('/teaching')} collapsed={isSidebarCollapsed} />
                    <NavLink 
                        to="/downloads" 
                        icon={<DownloadSimple weight={location.pathname.startsWith('/downloads') ? "fill" : "regular"} size={21} />} 
                        label="பதிவிறக்கங்கள்" 
                        subLabel="downloads" 
                        active={location.pathname.startsWith('/downloads')} 
                        collapsed={isSidebarCollapsed} 
                    />

                    <NavLink to="/about" icon={<User weight={location.pathname === '/about' ? "fill" : "regular"} size={21} />} label="பற்றி" subLabel="about" active={location.pathname === '/about'} className="desktop-only" collapsed={isSidebarCollapsed} />
                    <NavLink
                        to="/about"
                        icon={
                            <ProfileImage
                                src={profilePic}
                                alt="Profile"
                                className="nav-profile-avatar"
                            />
                        }
                        label="Profile"
                        active={location.pathname === '/about'}
                        className="mobile-only-nav-item"
                        collapsed={isSidebarCollapsed}
                    />
                </div>
            </div>

            <div className="sidebar-bottom" ref={settingsZoneRef}>
                <div className="settings-profile-container">
                    <ButtonBase
                            component="div"
                            className={`settings-trigger ${isSettingsOpen ? 'active-trigger' : ''} ${isSidebarCollapsed ? 'collapsed-trigger' : ''}`}
                            onClick={() => {
                                setIsSettingsOpen(!isSettingsOpen);
                            }}
                            disableFocusRipple
                        >
                            <ProfileImage
                                src={profilePic}
                                alt="Profile"
                                className="settings-avatar"
                            />
                            {!isSidebarCollapsed && (
                                <>
                                    <div className="settings-text">
                                        <span className="settings-name">{profileData?.fullName || 'Elvan Parthasarathy'}</span>
                                        <span className="settings-brand-tag">Elvan Navil</span>
                                    </div>
                                    {theme === 'light' ? (
                                        <Sun weight="regular" size={16} className="settings-theme-icon" />
                                    ) : theme === 'dark' ? (
                                        <Moon weight="regular" size={16} className="settings-theme-icon" />
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="settings-theme-icon" style={{ width: 16, height: 16 }}>
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
                                        </svg>
                                    )}
                                </>
                            )}
                        </ButtonBase>

                    {isSettingsOpen && (
                        <div className={`settings-popup ${isSidebarCollapsed ? 'side-popup' : ''}`}>
                            <div className="popup-theme-section" onClick={(e) => e.stopPropagation()}>
                                <span className="popup-theme-label">Appearance</span>
                                <div className="theme-slider-container">
                                    <div
                                        className="slider-thumb"
                                        style={{ transform: `translateX(${theme === 'light' ? '0%' : theme === 'auto' ? '100%' : '200%'})` }}
                                    />
                                    <Tooltip title="Light" placement="top" arrow enterDelay={200} leaveDelay={0}>
                                        <div className={`slider-option ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
                                        </div>
                                    </Tooltip>
                                    <Tooltip title="Auto" placement="top" arrow enterDelay={200} leaveDelay={0}>
                                        <div className={`slider-option ${theme === 'auto' ? 'active' : ''}`} onClick={() => setTheme('auto')}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" /></svg>
                                        </div>
                                    </Tooltip>
                                    <Tooltip title="Dark" placement="top" arrow enterDelay={200} leaveDelay={0}>
                                        <div className={`slider-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                                    <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onClick={() => setIsSettingsOpen(false)}>பற்றி • About</Link>
                                    <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onClick={() => setIsSettingsOpen(false)}>தனியுரிமை • Privacy Policy</Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export const பக்கவாட்டுப்பட்டை = Sidebar;
export default Sidebar;
