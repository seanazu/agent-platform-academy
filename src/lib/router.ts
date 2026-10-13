import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'part'; id: string }
  | { name: 'lesson'; id: string }
  | { name: 'tickets'; key?: string }
  | { name: 'words' }
  | { name: 'search'; q?: string };

export const parseHash = (hash: string): Route => {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const params = new URLSearchParams(query);
  const parts = (path ?? '/').split('/').filter(Boolean);
  const [head, id] = parts;
  if (head === 'part' && id) return { name: 'part', id };
  if (head === 'lesson' && id) return { name: 'lesson', id };
  if (head === 'tickets') return { name: 'tickets', key: params.get('k') ?? undefined };
  if (head === 'words') return { name: 'words' };
  if (head === 'search') return { name: 'search', q: params.get('q') ?? undefined };
  return { name: 'home' };
};

export const useRoute = (): Route => {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
};

export const href = {
  home: () => '#/',
  part: (id: string) => `#/part/${id}`,
  lesson: (id: string) => `#/lesson/${id}`,
  tickets: (key?: string) => (key ? `#/tickets?k=${encodeURIComponent(key)}` : '#/tickets'),
  words: () => '#/words',
  search: (q?: string) => (q ? `#/search?q=${encodeURIComponent(q)}` : '#/search'),
};
