import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

const GlobalErrorBoundary: React.FC = () => {
    const error = useRouteError() as any;
    console.error('Route error captured by GlobalErrorBoundary:', error);

    const handleReload = () => {
        window.location.reload();
    };

    const errorMessage = error?.message || error?.statusText || String(error || 'Unknown error');
    const isChunkError = 
        errorMessage.includes("Failed to fetch dynamically imported module") ||
        error?.name === "ChunkLoadError" ||
        /Failed to fetch/i.test(errorMessage) ||
        /Loading chunk/i.test(errorMessage);

    React.useEffect(() => {
        if (isChunkError && !sessionStorage.getItem('chunk_retry')) {
            sessionStorage.setItem('chunk_retry', 'true');
            window.location.reload();
        }
    }, [isChunkError]);

    return (
        <div id="error-boundary-container" style={styles.container}>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes pulse {
                    0% { opacity: 0.6; transform: scale(0.98); }
                    50% { opacity: 1; transform: scale(1.02); }
                    100% { opacity: 0.6; transform: scale(0.98); }
                }
                .error-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-radius: 16px;
                    padding: 40px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    text-align: center;
                    animation: float 6s ease-in-out infinite;
                }
                [data-theme="light"] .error-card {
                    background: rgba(0, 0, 0, 0.02);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
                }
                .error-btn {
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 15px;
                }
                .btn-primary {
                    background: linear-gradient(135deg, #ff4d4d, #f857a6);
                    color: white;
                    box-shadow: 0 4px 15px rgba(248, 87, 166, 0.3);
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(248, 87, 166, 0.5);
                }
                .btn-secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: var(--text-color, #e0e0e0);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                [data-theme="light"] .btn-secondary {
                    background: rgba(0, 0, 0, 0.05);
                    color: #333;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                }
                .btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                }
                [data-theme="light"] .btn-secondary:hover {
                    background: rgba(0, 0, 0, 0.08);
                }
                .error-details {
                    margin-top: 24px;
                    text-align: left;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 16px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    font-size: 13px;
                    font-family: monospace;
                    color: #ffa8a8;
                    max-height: 150px;
                    overflow-y: auto;
                }
                [data-theme="light"] .error-details {
                    background: rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    color: #c92a2a;
                }
            `}</style>

            <div className="error-card">
                <div style={styles.iconContainer}>
                    <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>

                <h1 style={styles.titleTa} id="error-title-ta">ஏதோ தவறு நேர்ந்துவிட்டது!</h1>
                <h2 style={styles.titleEn} id="error-title-en">Something went wrong</h2>

                <p style={styles.description} id="error-desc">
                    {isChunkError 
                        ? 'புதிய புதுப்பிப்பு கண்டறியப்பட்டுள்ளது. தடையற்ற அனுபவத்திற்கு பக்கத்தை மீண்டும் ஏற்றவும்.'
                        : 'பக்கத்தை ஏற்றுவதில் பிழை ஏற்பட்டுள்ளது. மீண்டும் முயற்சி செய்து பார்க்கவும்.'
                    }
                </p>
                <p style={styles.subDescription}>
                    {isChunkError 
                        ? 'A new update is available. Please reload the page to get the latest version.'
                        : 'We encountered an error loading this page. Please try reloading or return home.'
                    }
                </p>

                <div style={styles.buttonGroup}>
                    <button 
                        className="error-btn btn-primary" 
                        onClick={handleReload}
                        id="reload-error-btn"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        மீண்டும் ஏற்றுக / Reload
                    </button>
                    <Link 
                        to="/" 
                        className="error-btn btn-secondary" 
                        id="home-error-btn"
                        style={{ textDecoration: 'none' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        முகப்பு / Home
                    </Link>
                </div>

                {errorMessage && (
                    <details style={{ marginTop: '24px', textAlign: 'left', cursor: 'pointer' }}>
                        <summary style={{ fontSize: '13px', color: 'var(--text-muted, #888)', userSelect: 'none' }}>
                            பிழை விவரங்கள் / Error Details
                        </summary>
                        <div className="error-details">
                            {errorMessage}
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        padding: '24px',
        boxSizing: 'border-box',
        background: 'var(--background-color, #0f0f12)',
        color: 'var(--text-color, #e0e0e0)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    },
    iconContainer: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(248, 87, 166, 0.1)',
        color: '#f857a6',
        marginBottom: '24px',
        animation: 'pulse 2s infinite ease-in-out',
    },
    icon: {
        width: '32px',
        height: '32px',
    },
    titleTa: {
        fontSize: '22px',
        fontWeight: 700,
        margin: '0 0 4px 0',
        color: 'var(--title-color, #ffffff)',
    },
    titleEn: {
        fontSize: '16px',
        fontWeight: 500,
        margin: '0 0 16px 0',
        color: 'var(--text-muted, #a0a0ab)',
    },
    description: {
        fontSize: '15px',
        lineHeight: '1.6',
        margin: '0 0 8px 0',
        color: 'var(--text-color, #e0e0e0)',
    },
    subDescription: {
        fontSize: '14px',
        lineHeight: '1.5',
        margin: '0 0 32px 0',
        color: 'var(--text-muted, #8a8a93)',
    },
    buttonGroup: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
    },
};

export default GlobalErrorBoundary;
