export interface RouteMeta {
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  showBack: boolean;
  backUrl?: string;
}

export function getRouteInfo(pathname: string): RouteMeta {
  const p = pathname.toLowerCase().replace(/\/$/, '') || '/';

  if (p === '/') {
    return { title: 'முகப்பு', subtitle: 'home', icon: '/favicon.png', showBack: false };
  }
  if (p.startsWith('/downloads/nammil')) {
    return { title: 'நம்மில்', subtitle: 'nammil', icon: '/nammil_icon.png', showBack: true, backUrl: '/downloads' };
  }
  if (p === '/downloads') {
    return { title: 'பதிவிறக்கங்கள்', subtitle: 'downloads', icon: '/favicon.png', showBack: true, backUrl: '/' };
  }
  if (p === '/navilgal') {
    return { title: 'எல்வனின் நவில்கள்', subtitle: 'elvanin navilgal', icon: '/favicon.png', showBack: true, backUrl: '/' };
  }
  if (p === '/writings') {
    return { title: 'எழுத்துகள்', subtitle: 'writings', icon: '/favicon.png', showBack: true, backUrl: '/navilgal' };
  }
  if (p.startsWith('/writings/poems')) {
    return { title: 'நவில் மிழிகள்', subtitle: 'navil poems', icon: '/favicon.png', showBack: true, backUrl: p === '/writings/poems' ? '/writings' : '/writings/poems' };
  }
  if (p.startsWith('/writings/quotes')) {
    return { title: 'நவில் மொழிகள்', subtitle: 'navil quotes', icon: '/favicon.png', showBack: true, backUrl: p === '/writings/quotes' ? '/writings' : '/writings/quotes' };
  }
  if (p.startsWith('/writings/stories')) {
    return { title: 'சிறுகதைகள்', subtitle: 'short stories', icon: '/favicon.png', showBack: true, backUrl: p === '/writings/stories' ? '/writings' : '/writings/stories' };
  }
  if (p.startsWith('/writings/articles')) {
    return { title: 'கட்டுரைகள்', subtitle: 'articles', icon: '/favicon.png', showBack: true, backUrl: p === '/writings/articles' ? '/writings' : '/writings/articles' };
  }
  if (p.startsWith('/writings/diary')) {
    return { title: 'நாளேடு', subtitle: 'diary', icon: '/favicon.png', showBack: true, backUrl: p === '/writings/diary' ? '/writings' : '/writings/diary' };
  }
  if (p.startsWith('/writings/blog')) {
    return { title: 'வலைப்பதிவுகள்', subtitle: 'blog', icon: '/favicon.png', showBack: true, backUrl: p === '/writings/blog' ? '/writings' : '/writings/blog' };
  }
  if (p === '/arts') {
    return { title: 'கலைகள்', subtitle: 'arts', icon: '/favicon.png', showBack: true, backUrl: '/navilgal' };
  }
  if (p.includes('/arts/sketches') || p.includes('/arts/pencil')) {
    return { title: 'கரிக்கோல் ஓவியங்கள்', subtitle: 'pencil sketches', icon: '/favicon.png', showBack: true, backUrl: '/arts' };
  }
  if (p.includes('/arts/illustrations')) {
    return { title: 'விளக்கப்படங்கள்', subtitle: 'illustrations', icon: '/favicon.png', showBack: true, backUrl: '/arts' };
  }
  if (p.includes('/arts/posters') || p.includes('/arts/poster')) {
    return { title: 'சுவரொட்டிகள்', subtitle: 'posters', icon: '/favicon.png', showBack: true, backUrl: '/arts' };
  }
  if (p.includes('/arts/editing')) {
    return { title: 'தொகுப்புகள்', subtitle: 'editings', icon: '/favicon.png', showBack: true, backUrl: '/arts' };
  }
  if (p.includes('/arts/painting')) {
    return { title: 'ஓவியங்கள்', subtitle: 'paintings', icon: '/favicon.png', showBack: true, backUrl: '/arts' };
  }
  if (p.includes('/arts/digital')) {
    return { title: 'எண்மக்கலைகள்', subtitle: 'digital arts', icon: '/favicon.png', showBack: true, backUrl: '/arts' };
  }
  if (p.startsWith('/arts/')) {
    return { title: 'கலைக்கூடம்', subtitle: 'arts gallery', icon: '/favicon.png', showBack: true, backUrl: '/arts' };
  }
  if (p.startsWith('/tools/transliter')) {
    return { title: 'மொழிமாற்றி', subtitle: 'transliterator', icon: '/favicon.png', badge: 'BETA', showBack: true, backUrl: '/tools' };
  }
  if (p.startsWith('/tools/arichuvadi')) {
    return { title: 'அரிச்சுவடி', subtitle: 'arichuvadi', icon: '/favicon.png', badge: 'BETA', showBack: true, backUrl: p === '/tools/arichuvadi' ? '/tools' : '/tools/arichuvadi' };
  }
  if (p.startsWith('/tools/vocoder') || p.startsWith('/teaching/vocoder')) {
    return { title: 'குரல்மாற்றி', subtitle: 'vocoder', icon: '/favicon.png', badge: 'BETA', showBack: true, backUrl: '/teaching' };
  }
  if (p.startsWith('/tools/piano')) {
    return { title: 'கின்னரப்பெட்டி', subtitle: 'piano', icon: '/favicon.png', badge: 'BETA', showBack: true, backUrl: '/tools' };
  }
  if (p === '/teaching') {
    return { title: 'பயிற்றுவிப்பு', subtitle: 'teaching', icon: '/favicon.png', showBack: true, backUrl: '/tools' };
  }
  if (p === '/tools') {
    return { title: 'கருவிகள்', subtitle: 'tools', icon: '/favicon.png', badge: 'BETA', showBack: true, backUrl: '/' };
  }
  if (p === '/about') {
    return { title: 'பற்றி', subtitle: 'about', icon: '/favicon.png', showBack: true, backUrl: '/' };
  }
  if (p === '/contact') {
    return { title: 'தொடர்பு', subtitle: 'contact', icon: '/favicon.png', showBack: true, backUrl: '/' };
  }
  if (p === '/privacy') {
    return { title: 'தனியுரிமை', subtitle: 'privacy', icon: '/favicon.png', showBack: true, backUrl: '/' };
  }
  if (p === '/terms') {
    return { title: 'விதிமுறைகள்', subtitle: 'terms', icon: '/favicon.png', showBack: true, backUrl: '/' };
  }
  if (p === '/disclaimer') {
    return { title: 'பொறுப்புத்துறப்பு', subtitle: 'disclaimer', icon: '/favicon.png', showBack: true, backUrl: '/' };
  }
  if (p === '/portfolio') {
    return { title: 'தொகுப்பு', subtitle: 'portfolio', icon: '/favicon.png', showBack: true, backUrl: '/' };
  }
  if (p === '/settings') {
    return { title: 'அமைப்புகள்', subtitle: 'settings', icon: '/favicon.png', showBack: true, backUrl: '/' };
  }

  return { title: 'முகப்பு', subtitle: 'home', icon: '/favicon.png', showBack: true, backUrl: '/' };
}
