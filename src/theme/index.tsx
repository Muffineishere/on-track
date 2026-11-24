import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Platform, useColorScheme, type TextStyle, type ViewStyle } from 'react-native';

import type { ThemePref } from '@/domain/types';

import { dark, light, type Palette } from './palette';

export * from './palette';

/** Nunito: rounded like Tunas, warm at heavy weights, clear at body sizes. */
export const FONT = {
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  heavy: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

export const TYPE = {
  display: { fontFamily: FONT.black, fontSize: 33, lineHeight: 39, letterSpacing: -0.6 },
  title: { fontFamily: FONT.black, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  headline: { fontFamily: FONT.heavy, fontSize: 18, lineHeight: 24, letterSpacing: -0.1 },
  body: { fontFamily: FONT.semibold, fontSize: 16, lineHeight: 23 },
  bodyBold: { fontFamily: FONT.bold, fontSize: 16, lineHeight: 23 },
  callout: { fontFamily: FONT.semibold, fontSize: 15, lineHeight: 21 },
  calloutBold: { fontFamily: FONT.bold, fontSize: 15, lineHeight: 21 },
  footnote: { fontFamily: FONT.semibold, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: FONT.bold, fontSize: 13, lineHeight: 17, letterSpacing: 0.1 },
  number: { fontFamily: FONT.black, fontSize: 44, lineHeight: 50, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  stat: { fontFamily: FONT.black, fontSize: 28, lineHeight: 32, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof TYPE;

export const SPACE = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

/** Radius steps: large surfaces, tiles, controls, small marks. Pills only for chips. */
export const RADIUS = { sheet: 32, card: 28, tile: 20, control: 16, small: 12, pill: 999 } as const;

/** Phone column width on large screens and the web. */
export const MAX_WIDTH = 560;

export interface Theme {
  c: Palette;
  dark: boolean;
  /** Raised cards: a hairline and a soft two-step shadow in light mode, a lighter surface in dark mode. */
  elevated: ViewStyle;
  /** Floating layers: sheets, toasts. */
  floating: ViewStyle;
}

const ThemeContext = createContext<Theme | null>(null);

function makeTheme(isDark: boolean): Theme {
  const c = isDark ? dark : light;
  return {
    c,
    dark: isDark,
    elevated: isDark
      ? { borderWidth: 1, borderColor: c.line }
      : { borderWidth: 1, borderColor: c.line, boxShadow: '0 1px 2px rgba(29,38,33,0.04), 0 6px 20px rgba(29,38,33,0.05)' },
    floating: isDark
      ? { borderWidth: 1, borderColor: c.line, boxShadow: '0 -4px 30px rgba(0,0,0,0.5)' }
      : { boxShadow: '0 -2px 30px rgba(29,38,33,0.14)' },
  };
}

export function ThemeProvider({ pref, children }: { pref: ThemePref; children: ReactNode }) {
  const system = useColorScheme();
  const isDark = pref === 'system' ? system === 'dark' : pref === 'dark';
  const value = useMemo(() => makeTheme(isDark), [isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme needs a ThemeProvider');
  return t;
}

export const isWeb = Platform.OS === 'web';
