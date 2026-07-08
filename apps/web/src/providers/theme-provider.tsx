'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  readonly theme: Theme;
  readonly resolvedTheme: 'light' | 'dark';
  readonly setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'bp-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = useCallback((resolved: 'light' | 'dark') => {
    setResolvedTheme(resolved);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
  }, []);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {
        /* localStorage may be unavailable */
      }
      applyTheme(newTheme === 'system' ? getSystemTheme() : newTheme);
    },
    [applyTheme],
  );

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* localStorage may be unavailable */
    }

    const initial = (stored === 'light' || stored === 'dark' || stored === 'system')
      ? stored
      : 'system';

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    applyTheme(initial === 'system' ? getSystemTheme() : initial);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      setThemeState((current) => {
        if (current === 'system') {
          applyTheme(getSystemTheme());
        }
        return current;
      });
    };
    mql.addEventListener('change', onSystemChange);
    return () => mql.removeEventListener('change', onSystemChange);
  }, [applyTheme]);

  return (
    <ThemeContext value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
