const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/pages/main/Archive.tsx');
let content = fs.readFileSync(file, 'utf8');
const lazyComponents = \`nconst LazyGridItem = ({ post, onClick }) => {
    const isVideo = post.type === 'video' || (post.image && post.image.endsWith('.mp4'));
    const hasMultiple = post.images && post.images.length > 1;
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

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
            className=\"post-thumbnail\"
            onClick={() => onClick(post)}
            style={{ position: 'relative' }}
        >
            {!isLoaded && (
                <div className=\"skel\" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
            )}

            {isVisible && (
                isVideo ? (
                    <video
                        src={post.image}
                        className=\"post-image\"
                        muted
                        preload=\"none\"
                        playsInline
                        onLoadedData={() => setIsLoaded(true)}
                        onMouseOver={e => e.target.play().catch(() => { })}
                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
                    />
                ) : (
                    <img src={getThumbnailUrl(post.image)} alt=\"Post\" className=\"post-image\" loading=\"lazy\" onLoad={() => setIsLoaded(true)} style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }} />
                )
            )}

            {isVideo && (
                <div className=\"multi-icon\">
                    <FiPlay size={22} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))', zIndex: 2 }} />
                </div>
            )}
            {hasMultiple && !isVideo && (
                <div className=\"multi-icon\">
                    <FiLayers size={22} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))', zIndex: 2 }} />
                </div>
            )}
        </div>
    );
};\;

const oldRegex = /const LazyGridItem = \(\{ post, onClick \}\) => \{[\s\S]*?className=\"multi-icon\">\s*<FiLayers size=\{22\} style=\{\{ filter: 'drop-shadow\(0 0 2px rgba\(0,0,0,0\.5\)\)' \}\} \/>\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\};/;
content = content.replace(oldRegex, lazyComponents);
fs.writeFileSync(file, content);
console.log('Shimmer logic applied!');
