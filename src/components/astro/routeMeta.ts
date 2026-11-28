import { UI_TA, UI_EN } from '../../i18n';

export interface RouteMeta {
  key: keyof typeof UI_TA.routes;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  showBack: boolean;
  backUrl?: string;
}

function makeRoute(
  key: keyof typeof UI_TA.routes,
  icon: string,
  showBack: boolean,
  backUrl?: string,
  badge?: string
): RouteMeta {
  return {
    key,
    title: UI_TA.routes[key].title,
    subtitle: UI_EN.routes[key].title,
    icon,
    badge,
    showBack,
    backUrl,
  };
}

export function getRouteInfo(pathname: string): RouteMeta {
  const p = pathname.toLowerCase().replace(/\/$/, '') || '/';

  if (p === '/') return makeRoute('home', '/favicon.png', false);
  if (p.startsWith('/downloads/elvan-sans')) return makeRoute('elvanSans', '/elvan_sans_icon.png', true, '/downloads');
  if (p.startsWith('/downloads/nammil')) return makeRoute('nammil', '/nammil_icon.png', true, '/downloads');
  if (p === '/downloads') return makeRoute('downloads', '/favicon.png', false);
  if (p === '/navilgal') return makeRoute('navilgal', '/favicon.png', false);
  if (p === '/writings') return makeRoute('writings', '/favicon.png', true, '/navilgal');
  if (p.startsWith('/writings/poems')) return makeRoute('poems', '/favicon.png', true, p === '/writings/poems' ? '/writings' : '/writings/poems');
  if (p.startsWith('/writings/quotes')) return makeRoute('quotes', '/favicon.png', true, p === '/writings/quotes' ? '/writings' : '/writings/quotes');
  if (p.startsWith('/writings/stories')) return makeRoute('stories', '/favicon.png', true, p === '/writings/stories' ? '/writings' : '/writings/stories');
  if (p.startsWith('/writings/articles')) return makeRoute('articles', '/favicon.png', true, p === '/writings/articles' ? '/writings' : '/writings/articles');
  if (p.startsWith('/writings/diary')) return makeRoute('diary', '/favicon.png', true, p === '/writings/diary' ? '/writings' : '/writings/diary');
  if (p.startsWith('/writings/blog')) return makeRoute('blog', '/favicon.png', true, p === '/writings/blog' ? '/writings' : '/writings/blog');
  if (p === '/arts') return makeRoute('arts', '/favicon.png', true, '/navilgal');
  if (p.includes('/arts/sketches') || p.includes('/arts/pencil')) return makeRoute('artsSketches', '/favicon.png', true, '/arts');
  if (p.includes('/arts/illustrations')) return makeRoute('artsIllustrations', '/favicon.png', true, '/arts');
  if (p.includes('/arts/posters') || p.includes('/arts/poster')) return makeRoute('artsPosters', '/favicon.png', true, '/arts');
  if (p.includes('/arts/editing')) return makeRoute('artsEditing', '/favicon.png', true, '/arts');
  if (p.includes('/arts/painting')) return makeRoute('artsPainting', '/favicon.png', true, '/arts');
  if (p.includes('/arts/digital')) return makeRoute('artsDigital', '/favicon.png', true, '/arts');
  if (p.startsWith('/arts/')) return makeRoute('artsGallery', '/favicon.png', true, '/arts');
  if (p.startsWith('/tools/transliter')) return makeRoute('transliterator', '/favicon.png', true, '/tools', 'BETA');
  if (p.startsWith('/tools/arichuvadi')) return makeRoute('arichuvadi', '/favicon.png', true, p === '/tools/arichuvadi' ? '/tools' : '/tools/arichuvadi', 'BETA');
  if (p.startsWith('/tools/vocoder') || p.startsWith('/teaching/vocoder')) return makeRoute('vocoder', '/favicon.png', true, '/teaching', 'BETA');
  if (p.startsWith('/tools/piano')) return makeRoute('piano', '/favicon.png', true, '/tools', 'BETA');
  if (p === '/teaching') return makeRoute('teaching', '/favicon.png', true, '/tools');
  if (p === '/tools') return makeRoute('tools', '/favicon.png', false, undefined, 'BETA');
  if (p === '/about') return makeRoute('about', '/favicon.png', false);
  if (p === '/contact') return makeRoute('contact', '/favicon.png', true, '/');
  if (p === '/privacy') return makeRoute('privacy', '/favicon.png', true, '/');
  if (p === '/terms') return makeRoute('terms', '/favicon.png', true, '/');
  if (p === '/disclaimer') return makeRoute('disclaimer', '/favicon.png', true, '/');
  if (p === '/portfolio') return makeRoute('portfolio', '/favicon.png', true, '/');
  if (p === '/settings') return makeRoute('settings', '/favicon.png', true, '/');

  return makeRoute('home', '/favicon.png', true, '/');
}
