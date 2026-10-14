import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'apa.theme';

// Night is the default: the page ground is the dioramas' own navy. Light (vellum) is one click away and remembered.
const systemTheme = (): Theme => 'dark';

const stored = (): Theme | undefined => {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : undefined;
  } catch {
    return undefined;
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => stored() ?? systemTheme());
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!stored()) setTheme(systemTheme());
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);
  return { theme, toggle };
};
