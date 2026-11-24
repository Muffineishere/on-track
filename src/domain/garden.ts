import { slipOf } from './content';
import { addDays, DOW, fromKey, keyOf, mondayOf, startOfDay } from './dates';
import { isGood, rulesFor } from './state';
import { firstKey, topSlip, weekInfo, type StreakResult } from './streak';
import type { Data, DayKey, SlipId, Status } from './types';

export interface GardenCell {
  key: DayKey;
  date: Date;
  /** Column, Monday = 0. */
  col: number;
  row: number;
  /** False for padding days from the months either side. */
  inMonth: boolean;
  status: Status | null;
  forgiven: boolean;
  future: boolean;
  today: boolean;
  /** Part of a Monday to Sunday week with seven good days. */
  perfectWeek: boolean;
  hasNote: boolean;
}

export interface MonthGarden {
  year: number;
  month: number;
  rows: number;
  cells: GardenCell[];
  counts: Record<Status, number>;
}

/** The month laid out Monday-first in whole weeks, ready to draw as a garden or a calendar. */
export function monthGarden(data: Data, year: number, month: number, now: Date, st: StreakResult): MonthGarden {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const rows = Math.ceil((lead + days) / 7);
  const start = addDays(first, -lead);
  const today = startOfDay(now);
  const tk = keyOf(today);
  const counts: Record<Status, number> = { followed: 0, mostly: 0, missed: 0 };
  const cells: GardenCell[] = [];
  for (let r = 0; r < rows; r++) {
    const perfect = weekInfo(data, addDays(start, r * 7)).perfect;
    for (let c = 0; c < 7; c++) {
      const date = addDays(start, r * 7 + c);
      const key = keyOf(date);
      const inMonth = date.getMonth() === month;
      const status = data.log[key] ?? null;
      if (inMonth && status) counts[status]++;
      cells.push({
        key,
        date,
        col: c,
        row: r,
        inMonth,
        status,
        forgiven: status === 'missed' && !!st.forgiven[key],
        future: date > today,
        today: key === tk,
        perfectWeek: perfect,
        hasNote: !!data.notes[key],
      });
    }
  }
  return { year, month, rows, cells, counts };
}

/** The earliest month worth showing: the first check-in or the start date. */
export function firstMonth(data: Data, now: Date): Date {
  const base = [firstKey(data), data.startedAt].filter((x): x is string => !!x).sort()[0];
  const d = base ? fromKey(base) : startOfDay(now);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Weeks with seven good days, from the first check-in to this week. */
export function perfectWeeks(data: Data, now: Date) {
  const fk = firstKey(data);
  if (!fk) return 0;
  const thisMon = mondayOf(now);
  let n = 0;
  for (let m = mondayOf(fromKey(fk)); m <= thisMon; m = addDays(m, 7)) if (weekInfo(data, m).perfect) n++;
  return n;
}

export interface Patterns {
  answered: number;
  /** Good-day share per weekday, Monday first; null where there is no data. */
  pct: (number | null)[];
  bestDay: number | null;
  hardDay: number | null;
  hardGood: number;
  hardAnswered: number;
  /** True when the best and hardest days are within 15 points of each other. */
  even: boolean;
  topSlip: SlipId | null;
  topSlipCount: number;
  /** A rule that would help with the top slip, if it is not already on the list. */
  fix: string | null;
}

export const PATTERN_MIN = 14;

/** Weekday patterns over the last eight weeks. Needs PATTERN_MIN check-ins to say anything. */
export function patterns(data: Data, now: Date): Patterns {
  const today = startOfDay(now);
  const end = data.log[keyOf(today)] ? today : addDays(today, -1);
  const stats = Array.from({ length: 7 }, () => ({ a: 0, g: 0 }));
  const slipCount: Partial<Record<SlipId, number>> = {};
  let answered = 0;
  for (let i = 0; i < 56; i++) {
    const d = addDays(end, -i);
    const k = keyOf(d);
    const s = data.log[k];
    if (!s) continue;
    const w = (d.getDay() + 6) % 7;
    stats[w].a++;
    answered++;
    if (isGood(s)) stats[w].g++;
    const slip = data.slips[k];
    if (s !== 'followed' && slip) slipCount[slip] = (slipCount[slip] ?? 0) + 1;
  }
  const pct = stats.map((x) => (x.a ? Math.round((x.g / x.a) * 100) : null));
  const ranked = stats.map((x, i) => ({ i, a: x.a, g: x.g, p: x.a ? x.g / x.a : 0 })).filter((x) => x.a >= 2);
  let bestDay: number | null = null;
  let hardDay: number | null = null;
  let hardGood = 0;
  let hardAnswered = 0;
  let even = false;
  if (ranked.length >= 2) {
    const best = ranked.reduce((a, b) => (b.p > a.p ? b : a));
    const worst = ranked.reduce((a, b) => (b.p < a.p ? b : a));
    even = best.p - worst.p < 0.15;
    bestDay = best.i;
    hardDay = worst.i;
    hardGood = worst.g;
    hardAnswered = worst.a;
  }
  const top = topSlip(slipCount);
  const sl = slipOf(top);
  const have = rulesFor(data).map((x) => x.toLowerCase());
  const fix = sl && sl.fix && !have.includes(sl.fix.toLowerCase()) ? sl.fix : null;
  return {
    answered,
    pct,
    bestDay,
    hardDay,
    hardGood,
    hardAnswered,
    even,
    topSlip: top,
    topSlipCount: top ? (slipCount[top] ?? 0) : 0,
    fix,
  };
}

/** Monday-first weekday index to its name. */
export const weekdayName = (i: number) => DOW[(i + 1) % 7];
