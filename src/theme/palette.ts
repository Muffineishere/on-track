import type { TimeOfDay } from '@/domain/dates';

/**
 * Two themes built on one idea: warm linen neutrals, one deep evergreen as the brand,
 * and three muted status colours (leaf, honey, clay). Every text pair is checked for
 * WCAG AA in DESIGN.md.
 */
export interface Palette {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  line: string;
  ink: string;
  ink2: string;
  ink3: string;
  brand: string;
  brandPressed: string;
  onBrand: string;
  brandText: string;
  brandSoft: string;
  /** Status fills (discs, calendar days). */
  followed: string;
  mostly: string;
  missed: string;
  forgiven: string;
  /** Icon or text drawn on a status fill. */
  onFollowed: string;
  onMostly: string;
  onMissed: string;
  onForgiven: string;
  /** Status colours readable as text on a surface. */
  followedText: string;
  mostlyText: string;
  missedText: string;
  /** Soft tints behind status icons. */
  followedSoft: string;
  mostlySoft: string;
  missedSoft: string;
  forgivenSoft: string;
  flame: string;
  danger: string;
  scrim: string;
  focus: string;
}

export const light: Palette = {
  bg: '#FAF5EC',
  surface: '#FFFFFF',
  surface2: '#F2ECE1',
  surface3: '#E6DFD2',
  line: 'rgba(29, 38, 33, 0.09)',
  ink: '#1D2621',
  ink2: '#4F5A53',
  ink3: '#5F685F',
  brand: '#1F5A45',
  brandPressed: '#174636',
  onBrand: '#FFFFFF',
  brandText: '#1F5A45',
  brandSoft: '#E1ECE4',
  followed: '#2F7D52',
  mostly: '#D9A23A',
  missed: '#B85C46',
  forgiven: '#55728F',
  onFollowed: '#FFFFFF',
  onMostly: '#3A2A06',
  onMissed: '#FFFFFF',
  onForgiven: '#FFFFFF',
  followedText: '#2B7349',
  mostlyText: '#8A5F0C',
  missedText: '#A4492F',
  followedSoft: '#E2EFE5',
  mostlySoft: '#F8EDD6',
  missedSoft: '#F5E4DE',
  forgivenSoft: '#E3E9F0',
  flame: '#D9731F',
  danger: '#A4492F',
  scrim: 'rgba(16, 22, 19, 0.42)',
  focus: '#2F6FB0',
};

export const dark: Palette = {
  bg: '#0E1311',
  surface: '#161D1A',
  surface2: '#1F2824',
  surface3: '#29342F',
  line: 'rgba(237, 241, 238, 0.08)',
  ink: '#EDF1EE',
  ink2: '#B3BDB6',
  ink3: '#8E9890',
  brand: '#2E7656',
  brandPressed: '#276449',
  onBrand: '#FFFFFF',
  brandText: '#9FD5B4',
  brandSoft: '#1B3128',
  followed: '#5DB07D',
  mostly: '#E2B04F',
  missed: '#D7765D',
  forgiven: '#7E9CBB',
  onFollowed: '#0E1311',
  onMostly: '#0E1311',
  onMissed: '#0E1311',
  onForgiven: '#0E1311',
  followedText: '#6FC08E',
  mostlyText: '#E2B04F',
  missedText: '#E58A72',
  followedSoft: '#1C3326',
  mostlySoft: '#352B16',
  missedSoft: '#3A2219',
  forgivenSoft: '#1F2A36',
  flame: '#EE9548',
  danger: '#E58A72',
  scrim: 'rgba(0, 0, 0, 0.6)',
  focus: '#8CC0F0',
};

/** The time-of-day scene behind Tunas. */
export interface Sky {
  top: string;
  bottom: string;
  hills: [string, string, string];
  sun: string | null;
  /** Ink for text drawn straight on the sky. */
  ink: string;
  night: boolean;
}

export const SKIES: Record<TimeOfDay, Sky> = {
  morning: { top: '#F2CDA6', bottom: '#FBEEDD', hills: ['#CBDAB2', '#A6C597', '#7FAA78'], sun: '#F7C86A', ink: '#1D2621', night: false },
  day: { top: '#B6D7E6', bottom: '#EAF3F1', hills: ['#B9D4A6', '#93BE87', '#6EA36C'], sun: '#F6CF6E', ink: '#1D2621', night: false },
  evening: { top: '#DDA894', bottom: '#F5DCCB', hills: ['#BDB99A', '#97A98A', '#71906F'], sun: '#F3A66E', ink: '#1D2621', night: false },
  night: { top: '#18213D', bottom: '#2F3C66', hills: ['#2C3D57', '#23344A', '#1C2B39'], sun: null, ink: '#EDF1EE', night: true },
};

/** Tunas keeps the same colours in both themes so the character stays recognisable. */
export const TUNAS = {
  hi: '#A8DDB0',
  body: '#74C387',
  lo: '#539F68',
  belly: '#E4F4E0',
  cheek: '#F2A18D',
  stem: '#3F7F52',
  petal: '#F2B35E',
  petal2: '#EE9A8C',
  heart: '#E86F86',
  ink: '#1A2A20',
};
