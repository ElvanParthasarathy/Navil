/**
 * Media utility for optimizing image delivery.
 * Specifically handles Google Drive links by converting them to high-performance
 * serving endpoints with support for on-the-fly resizing.
 */

const DRIVE_REGEX = /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/;

/**
 * Transforms a raw image URL into an optimized version.
 * If it's a Google Drive link, it converts it to a serving URL.
 * 
 * Strategy:
 * - For thumbnails (≤800px): Use drive.google.com/thumbnail — most reliable for small sizes
 * - For medium/full: Use lh3.googleusercontent.com — supports large sizes
 * 
 * @param url The original image URL
 * @param size 'thumb' (600px), 'medium' (1200px), or 'full' (original)
 */
export const getOptimizedImage = (url: string, size: 'thumb' | 'medium' | 'full' = 'full'): string => {
    if (!url) return '';

    const match = url.match(DRIVE_REGEX);
    if (match && match[1]) {
        const fileId = match[1];
        
        if (size === 'thumb') {
            // Thumbnail API is reliable for small images (card covers, list views)
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
        }
        
        // For medium and full sizes, use the lh3 CDN endpoint which supports large images
        const sizeParam = size === 'medium' ? 's1200' : 's0';
        return `https://lh3.googleusercontent.com/d/${fileId}=${sizeParam}`;
    }

    // Passthrough for non-drive links (GitHub, External CDNs, etc.)
    return url;
};
