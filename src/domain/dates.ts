import type { DayKey } from './types';

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
export const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const DOW3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
/** Single letters for a Monday-first week. */
export const WEEK_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

const pad2 = (n: number) => (n < 10 ? '0' : '') + n;

export const keyOf = (d: Date): DayKey => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const isKey = (k: unknown): k is DayKey => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k);

export const fromKey = (k: DayKey): Date => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Monday of the week that contains d. */
export const mondayOf = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

/** Whole days from a to b. Rounding absorbs daylight-saving shifts. */
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 864e5);

export const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** "Tuesday, 24 November" */
export const formatLong = (d: Date) => `${DOW[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
/** "Tue, 24 Nov" */
export const formatShortDay = (d: Date) => `${DOW3[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;
/** "24 Nov" */
export const formatShort = (d: Date) => `${d.getDate()} ${MON[d.getMonth()]}`;

/** "23 to 29 Nov" or "30 Nov to 6 Dec" for the week starting on mon. */
export const weekRange = (mon: Date) => {
  const sun = addDays(mon, 6);
  return mon.getMonth() === sun.getMonth() ? `${mon.getDate()} to ${formatShort(sun)}` : `${formatShort(mon)} to ${formatShort(sun)}`;
};

/** 1080 -> "6pm", 1170 -> "7:30pm" */
export const formatTime = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const mi = mins % 60;
  const ap = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}${mi ? ':' + pad2(mi) : ''}${ap}`;
};

/** 45 -> "45 min", 80 -> "1h 20m", 120 -> "2h" */
export const formatDuration = (mins: number) =>
  mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}`;

/** "early March", "mid-June", "late January 2028" (the year only when it differs from now). */
export const roughDate = (d: Date, now: Date) => {
  const part = d.getDate() <= 10 ? 'early ' : d.getDate() <= 20 ? 'mid-' : 'late ';
  return part + MONTHS[d.getMonth()] + (d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : '');
};

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export const timeOfDay = (now: Date): TimeOfDay => {
  const h = now.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'evening';
  return 'night';
};

/** Check-in time: from 6pm until 4am. */
export const isEvening = (now: Date) => {
  const h = now.getHours();
  return h >= 18 || h < 4;
};

/** "HH:MM" -> minutes after midnight. */
export const parseClock = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const toClock = (mins: number) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
};
