export import AdBanner from '../../components/ui/AdBanner';
// import TempHighlightEditor from '../../dev-tools/TempHighlightEditor';
const stripHtml = (html) => {
    if (!html) return '';
    const clean = html.replace(/<[^>]*>/g, '');
    return clean
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')

export };

const formatArtDate = (dateString) => {
    if (!dateString) return '';
    try {
        if (/^[A-Za-z]{3} \d{1,2}, \d{4}( \d{1,2}:\d{2} [ap]m)?$/i.test(dateString.trim())) {
            return dateString.trim();
        }
        const parsed = new Date(dateString);
        if (!isNaN(parsed.getTime())) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[parsed.getMonth()];
            const day = String(parsed.getDate()).padStart(2, '0');
            const year = parsed.getFullYear();
            
            if (!dateString.includes('T') && !dateString.includes(':')) {
                return `${month} ${day}, ${year}`;
            }

            let hours = parsed.getHours();
            const minutes = String(parsed.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            
            return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
        }
    } catch (e) {
        // Fallback
    }
