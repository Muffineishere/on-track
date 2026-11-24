import { formatDuration, formatTime, minutesOf } from './dates';
import { rulesFor } from './state';
import type { Data, DayKey, Status } from './types';

/**
 * Reads a kitchen cutoff from rule text, in minutes after midnight.
 * "Last meal by 6pm" and "No supper after 9pm" both count. A bare hour from 1 to 11
 * after by/before/after/until is read as pm. Times before noon are not cutoffs.
 */
export function ruleCutoff(text: string): number | null {
  const m =
    /\b(?:by|before|after|until|till)\s+(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b/i.exec(text) ??
    /\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/i.exec(text);
  if (!m) return null;
  let h = Number(m[1]);
  const mi = m[2] ? Number(m[2]) : 0;
  const ap = (m[3] ?? '').toLowerCase();
  if (h > 23 || mi > 59) return null;
  if (ap === 'pm' && h < 12) h += 12;
  else if (ap === 'am' && h === 12) h = 0;
  else if (!ap && h >= 1 && h <= 11) h += 12;
  return h >= 12 ? h * 60 + mi : null;
}

/** The earliest cutoff among the plan's rules. */
export function planCutoff(rules: string[]): number | null {
  let best: number | null = null;
  for (const r of rules) {
    const c = ruleCutoff(r);
    if (c != null && (best == null || c < best)) best = c;
  }
  return best;
}

export type CutoffTone = 'open' | 'soon' | 'closed';

export interface CutoffInfo {
  tone: CutoffTone;
  text: string;
  /** Minutes left until the cutoff (zero or negative once it passed). */
  left: number;
}

export function cutoffInfo(cutoff: number, now: Date): CutoffInfo {
  const left = cutoff - minutesOf(now);
  if (left <= 0) return { tone: 'closed', text: `Kitchen closed at ${formatTime(cutoff)}`, left };
  if (left <= 180) return { tone: 'soon', text: `Kitchen closes in ${formatDuration(left)}`, left };
  return { tone: 'open', text: `Kitchen open until ${formatTime(cutoff)}`, left };
}

/** Ticks suggest an answer: every rule ticked reads as Followed, at least half as Mostly. */
export function suggestion(data: Data, key: DayKey): Status | null {
  const list = rulesFor(data);
  const ticks = data.ticks[key] ?? [];
  if (!list.length || !ticks.length) return null;
  const kept = list.filter((x) => ticks.includes(x)).length;
  if (kept === list.length) return 'followed';
  return kept >= Math.ceil(list.length / 2) ? 'mostly' : null;
}
