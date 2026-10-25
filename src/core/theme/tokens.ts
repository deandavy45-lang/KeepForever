import { Platform } from 'react-native';

/** Warm, heirloom palette. Light and dark share token names so components never hardcode color. */
export const palette = {
  light: {
    bg: '#FBF7F1',
    surface: '#FFFFFF',
    surfaceAlt: '#F3ECE2',
    ink: '#2B2622',
    inkMuted: '#6E645B',
    line: '#E6DDD1',
    accent: '#A4553A',
    accentInk: '#FFFFFF',
    accentSoft: '#F5E3DA',
    legacy: '#2F4A3E', // reserved for The Keep surface so it reads as a distinct, calm partner
    legacySoft: '#E5EEE8',
    danger: '#B3261E',
  },
  dark: {
    bg: '#171412',
    surface: '#221E1B',
    surfaceAlt: '#2C2723',
    ink: '#F4EEE7',
    inkMuted: '#B4A99E',
    line: '#3A342F',
    accent: '#E08B6B',
    accentInk: '#1A1411',
    accentSoft: '#3A2A23',
    legacy: '#9CC3B0',
    legacySoft: '#22302A',
    danger: '#F2B8B5',
  },
} as const;

export type ColorTokens = { [K in keyof (typeof palette)['light']]: string };

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 20, pill: 999 } as const;

export const fonts = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui, sans-serif' }),
};

export const type = {
  display: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, fontWeight: '600' },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, fontWeight: '600' },
  heading: { fontFamily: fonts.body, fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, fontWeight: '400' },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.6 },
} as const;

/** Minimum touch target per Apple HIG (44pt) and Material (48dp). */
export const hitTarget = 48;
