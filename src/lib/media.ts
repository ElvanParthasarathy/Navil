/**
 * Media utility for optimizing image delivery.
 * Specifically handles Google Drive links by converting them to high-performance
 * googleusercontent links with support for on-the-fly resizing.
 */

const DRIVE_REGEX = /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/;

/**
 * Transforms a raw image URL into an optimized version.
 * If it's a Google Drive link, it converts it to a high-speed CDN link with optional resizing.
 * If it's any other link (GitHub, External), it returns it as-is.
 * 
 * @param url The original image URL
 * @param size 'thumb' (600px), 'medium' (1200px), or 'full' (original)
 */
export const getOptimizedImage = (url: string, size: 'thumb' | 'medium' | 'full' = 'full'): string => {
    if (!url) return '';

    const match = url.match(DRIVE_REGEX);
    if (match && match[1]) {
        const fileId = match[1];
        
        // Define size parameters for Google User Content
        // s0 = full size
        // s400 = 400px
        // s1200 = 1200px
        let sizeParam = 's0'; 
        if (size === 'thumb') sizeParam = 's600';
        if (size === 'medium') sizeParam = 's1200';

        return `https://lh3.googleusercontent.com/d/${fileId}=${sizeParam}`;
    }

    // Passthrough for non-drive links (GitHub, External CDNs, etc.)
    return url;
};
