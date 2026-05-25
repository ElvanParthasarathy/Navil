const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/pages/main/Archive.tsx');
let content = fs.readFileSync(file, 'utf8');

const lazyComponents = `
const LazyGridItem = ({ post, onClick }) => {
    const isVideo = post.type === 'video' || (post.image && post.image.endsWith('.mp4'));
    const hasMultiple = post.images && post.images.length > 1;
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className="post-thumbnail"
            onClick={() => onClick(post)}
        >
            {isVisible ? (
                isVideo ? (
                    <video
                        src={post.image}
                        className="post-image"
                        muted
                        preload="metadata"
                        playsInline
                        onMouseOver={e => e.target.play().catch(() => { })}
                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                ) : (
                    <img src={post.image} alt="Post" className="post-image" loading="lazy" />
                )
            ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--bg-panel)' }} />
            )}

            {isVideo && (
                <div className="multi-icon">
                    <FiPlay size={22} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                </div>
            )}
            {hasMultiple && !isVideo && (
                <div className="multi-icon">
                    <FiLayers size={22} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                </div>
            )}
        </div>
    );
};

const InfiniteSentinel = ({ onLoadMore }) => {
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) onLoadMore();
        }, { rootMargin: '400px' });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [onLoadMore]);
    return <div ref={ref} style={{ height: '20px', width: '100%', gridColumn: '1 / -1' }} />;
};

const Archive = () => {
`;

content = content.replace("const Archive = () => {", lazyComponents);

content = content.replace(
    "const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'arts', 'reels', 'archive'",
    "const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'arts', 'reels', 'archive'\n    const [visibleCount, setVisibleCount] = useState(12);"
);

content = content.replace(
    /onClick=\{\(\) => setActiveTab\('posts'\)\}/g,
    "onClick={() => { setActiveTab('posts'); setVisibleCount(12); }}"
);
content = content.replace(
    /onClick=\{\(\) => setActiveTab\('arts'\)\}/g,
    "onClick={() => { setActiveTab('arts'); setVisibleCount(12); }}"
);
content = content.replace(
    /onClick=\{\(\) => setActiveTab\('reels'\)\}/g,
    "onClick={() => { setActiveTab('reels'); setVisibleCount(12); }}"
);
content = content.replace(
    /onClick=\{\(\) => setActiveTab\('archive'\)\}/g,
    "onClick={() => { setActiveTab('archive'); setVisibleCount(12); }}"
);

const oldGrid = `                    {(activeTab === 'posts' ? posts : activeTab === 'arts' ? arts : activeTab === 'reels' ? reels : archivedPosts).map(post => {
                        const isVideo = post.type === 'video' || (post.image && post.image.endsWith('.mp4'));
                        const hasMultiple = post.images && post.images.length > 1;

                        return (
                            <div
                                key={post.id}
                                className="post-thumbnail"
                                onClick={() => openPost(post)}
                                onMouseEnter={() => {
                                    // Proactive Preloading: Load full-res image on hover
                                    const media = post.images ? post.images[0] : (post.image || post.url);
                                    if (media && !media.endsWith('.mp4')) {
                                        const img = new Image();
                                        img.src = media;
                                    }
                                }}
                            >
                                {isVideo ? (
                                    <video
                                        src={post.image}
                                        className="post-image"
                                        muted
                                        preload="metadata"
                                        playsInline
                                        onMouseOver={e => e.target.play().catch(() => { })}
                                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                                    />
                                ) : (
                                    <img src={post.image} alt="Post" className="post-image" loading="eager" />
                                )}

                                {isVideo && (
                                    <div className="multi-icon">
                                        <FiPlay size={22} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                                    </div>
                                )}
                                {hasMultiple && !isVideo && (
                                    <div className="multi-icon">
                                        <FiLayers size={22} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}`;

const newGrid = `                    {(() => {
                        const activeData = activeTab === 'posts' ? posts : activeTab === 'arts' ? arts : activeTab === 'reels' ? reels : archivedPosts;
                        return (
                            <>
                                {activeData.slice(0, visibleCount).map(post => (
                                    <LazyGridItem key={post.id} post={post} onClick={openPost} />
                                ))}
                                {activeData.length > visibleCount && (
                                    <InfiniteSentinel onLoadMore={() => setVisibleCount(prev => prev + 12)} />
                                )}
                            </>
                        );
                    })()}`;

content = content.replace(oldGrid, newGrid);

fs.writeFileSync(file, content);
console.log('Lazy load logic applied!');
