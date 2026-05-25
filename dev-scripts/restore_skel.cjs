const fs = require('fs');
const file = 'src/pages/main/Archive.tsx';
let content = fs.readFileSync(file, 'utf8');
const insertPoint = '    return (
        <>
            <MobileTopBar title="காப்புகள்|archive" />';
const newSkel = \    if (isMounting) {
        return (
            <>
                <MobileTopBar title=\"காப்புகள்|archive\" />
                <div className=\"page-view page-fade\">
                    <div className=\"profile-header\">
                        <div className=\"profile-avatar-container desktop-only-flex\">
                            <div className=\"skel profile-avatar\" style={{ borderRadius: '50%' }} />
                        </div>
                        <div className=\"mobile-username-header mobile-only-flex\">
                            <div className=\"skel\" style={{ width: 120, height: 20, borderRadius: 4 }} />
                        </div>
                        <div className=\"profile-mobile-top mobile-only-flex\">
                            <div className=\"profile-avatar-container\">
                                <div className=\"skel profile-avatar\" style={{ borderRadius: '50%' }} />
                            </div>
                            <div className=\"mobile-stats-inline\">
                                <div className=\"mobile-stat-item\"><div className=\"skel\" style={{ width: 40, height: 32, borderRadius: 4 }} /></div>
                                <div className=\"mobile-stat-item\"><div className=\"skel\" style={{ width: 40, height: 32, borderRadius: 4 }} /></div>
                                <div className=\"mobile-stat-item\"><div className=\"skel\" style={{ width: 40, height: 32, borderRadius: 4 }} /></div>
                            </div>
                        </div>
                        <div className=\"mobile-bio-section mobile-only\">
                            <div className=\"skel\" style={{ width: '60%', height: 16, marginBottom: 8, borderRadius: 4 }} />
                            <div className=\"skel\" style={{ width: '80%', height: 14, marginBottom: 4, borderRadius: 4 }} />
                            <div className=\"skel\" style={{ width: '50%', height: 14, borderRadius: 4 }} />
                        </div>
                        <div className=\"profile-info desktop-only-flex\" style={{ minWidth: 0 }}>
                            <div className=\"profile-username-row\" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className=\"skel\" style={{ width: 180, height: 28, borderRadius: 4 }} />
                                </div>
                            </div>
                            <div className=\"profile-stats-row\">
                                <span className=\"stat-item\"><div className=\"skel\" style={{ width: 60, height: 18, borderRadius: 4 }} /></span>
                                <span className=\"stat-item\"><div className=\"skel\" style={{ width: 60, height: 18, borderRadius: 4 }} /></span>
                                <span className=\"stat-item\"><div className=\"skel\" style={{ width: 60, height: 18, borderRadius: 4 }} /></span>
                            </div>
                            <div className=\"profile-bio-row\">
                                <div className=\"skel\" style={{ width: '60%', height: 16, marginBottom: 8, borderRadius: 4 }} />
                                <div className=\"skel\" style={{ width: '80%', height: 14, marginBottom: 4, borderRadius: 4 }} />
                                <div className=\"skel\" style={{ width: '50%', height: 14, borderRadius: 4 }} />
                            </div>
                        </div>
                    </div>

                    <div className=\"highlight-bar-container\">
                        <div className=\"highlights-scroll\" style={{ overflow: 'hidden' }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className=\"h-item\">
                                    <div className=\"h-ring\" style={{ borderColor: 'transparent' }}>
                                        <div className=\"h-inner skel\" style={{ borderRadius: '50%' }} />
                                    </div>
                                    <div className=\"skel\" style={{ width: 50, height: 12, marginTop: 4, borderRadius: 4 }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className=\"profile-tabs\">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className=\"tab-item\">
                                <div className=\"skel\" style={{ width: 60, height: 16, borderRadius: 4 }} />
                            </div>
                        ))}
                    </div>

                    <div className=\"archive-container\">
                        <div className=\"archive-grid\">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className=\"skel\" style={{ width: '100%', paddingTop: '100%' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }\n\n\;
content = content.replace(insertPoint, newSkel + insertPoint);
fs.writeFileSync(file, content);
console.log('Skeleton restored!');
