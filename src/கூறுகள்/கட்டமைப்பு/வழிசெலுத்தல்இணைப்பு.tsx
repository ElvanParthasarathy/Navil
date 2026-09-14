import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    subLabel?: string;
    badge?: string;
    active: boolean;
    className?: string;
    collapsed: boolean;
}

export const NavLink = ({ to, icon, label, subLabel, badge, active, className = '', collapsed }: NavLinkProps) => (
    <Link to={to} className={`nav-item ${active ? 'active' : ''} ${collapsed ? 'collapsed' : ''} ${className}`.trim()} title={collapsed ? label : ''}>
        <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        {!collapsed && (
            <div className="nav-text-container">
                <span className="label" style={{ display: 'flex', alignItems: 'center' }}>
                    {label}
                    {badge && (
                        <span 
                            className="nav-badge desktop-only" 
                            style={{ 
                                fontSize: '0.6rem', 
                                background: active ? 'var(--text-main)' : 'color-mix(in srgb, var(--text-main) 15%, transparent)', 
                                color: active ? 'var(--bg-app)' : 'var(--text-main)', 
                                padding: '1px 5px', 
                                borderRadius: '100px', 
                                marginLeft: '6px', 
                                fontWeight: 700, 
                                letterSpacing: '0.5px',
                                display: 'inline-block',
                                lineHeight: 1
                            }}
                        >
                            {badge}
                        </span>
                    )}
                </span>
                {subLabel && <span className="sub-label desktop-only">{subLabel}</span>}
            </div>
        )}
    </Link>
);
