import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getThemeId, setThemeId as persistThemeId } from './storage';
import { getTheme, type Theme, type ThemePalette } from './themes';

interface ThemeContextValue {
  theme: Theme;
  palette: ThemePalette;
  themeId: string;
  /** Apply + persist a theme; every themed surface re-renders at once. */
  chooseTheme: (id: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * App-wide theme state (build 20). Before this, the selected theme was
 * read only by the Today screen from storage on focus, so a selection
 * recolored exactly one screen. The provider owns the selection now:
 * one change recolors every surface that reads useTheme() — tabs,
 * settings stack, modals, music, auth — in the same render pass.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>('midnight');

  useEffect(() => {
    let live = true;
    getThemeId().then((id) => {
      if (live) setThemeIdState(id);
    });
    return () => {
      live = false;
    };
  }, []);

  const chooseTheme = useCallback(async (id: string) => {
    setThemeIdState(id);
    await persistThemeId(id);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const theme = getTheme(themeId);
    return { theme, palette: theme.palette, themeId: theme.id, chooseTheme };
  }, [themeId, chooseTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Current theme + palette. Falls back to Midnight when called outside
 * the provider (e.g. a component rendered by a portal) so nothing ever
 * renders unstyled.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  const theme = getTheme('midnight');
  return {
    theme,
    palette: theme.palette,
    themeId: theme.id,
    chooseTheme: async () => {},
  };
}
