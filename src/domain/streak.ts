import { addDays, daysBetween, fromKey, keyOf, startOfDay } from './dates';
import { isGood } from './state';
import type { Data, DayKey, SlipId, Status } from './types';

export const firstKey = (data: Data): DayKey | null => Object.keys(data.log).sort()[0] ?? null;

/**
 * The day a check-in counts for. Until 4am, an unanswered yesterday is still open,
 * so a late-night check-in lands on the day that just ended.
 */
export function activeKey(data: Data, now: Date): DayKey {
  const today = startOfDay(now);
  const yk = keyOf(addDays(today, -1));
  if (now.getHours() < 4 && data.onboarded && !data.log[yk] && data.startedAt && data.startedAt <= yk) return yk;
  return keyOf(today);
}

export interface StreakResult {
  cur: number;
  best: number;
  /** Free misses saved up right now (0 to 2). */
  tokens: number;
  /** Missed days a free miss covered. */
  forgiven: Record<DayKey, true>;
}

/**
 * Walks every day from the first check-in to today.
 * One free miss arrives each Monday; unused ones carry over, two at most.
 * Followed and Mostly extend the streak. A missed day spends a free miss if one is held.
 * An unanswered past day breaks the streak; the day still open for check-in does not.
 */
export function streak(data: Data, now: Date): StreakResult {
  const keys = Object.keys(data.log).sort();
  const r: StreakResult = { cur: 0, best: 0, tokens: 1, forgiven: {} };
  if (!keys.length) return r;
  const today = startOfDay(now);
  const tk = keyOf(today);
  const ak = activeKey(data, now);
  let run = 0;
  let best = 0;
  let tokens = 1;
  let first = true;
  for (let d = fromKey(keys[0]); d <= today; d = addDays(d, 1)) {
    if (!first && d.getDay() === 1) tokens = Math.min(2, tokens + 1);
    first = false;
    const k = keyOf(d);
    const s = data.log[k];
    if (isGood(s)) {
      run++;
      if (run > best) best = run;
    } else if (s === 'missed') {
      if (tokens > 0) {
        tokens--;
        r.forgiven[k] = true;
      } else run = 0;
    } else if (k !== tk && k !== ak) run = 0;
  }
  r.cur = run;
  r.best = best;
  r.tokens = tokens;
  return r;
}

export interface WeekInfo {
  good: number;
  answered: number;
  perfect: boolean;
  slips: Partial<Record<SlipId, number>>;
  days: (Status | null)[];
}

export function weekInfo(data: Data, mon: Date): WeekInfo {
  const w: WeekInfo = { good: 0, answered: 0, perfect: false, slips: {}, days: [] };
  for (let i = 0; i < 7; i++) {
    const k = keyOf(addDays(mon, i));
    const s = data.log[k] ?? null;
    w.days.push(s);
    if (s) w.answered++;
    if (isGood(s)) w.good++;
    const slip = data.slips[k];
    if (slip && s && s !== 'followed') w.slips[slip] = (w.slips[slip] ?? 0) + 1;
  }
  w.perfect = w.good === 7;
  return w;
}

export function topSlip(counts: Partial<Record<SlipId, number>>): SlipId | null {
  let best: SlipId | null = null;
  let n = 0;
  for (const k in counts) {
    const c = counts[k as SlipId] ?? 0;
    if (c > n) {
      n = c;
      best = k as SlipId;
    }
  }
  return best;
}

/** A recent day (yesterday or the day before) left unanswered after tracking began. */
export function missingDay(data: Data, now: Date): Date | null {
  const fk = firstKey(data);
  if (!fk || !data.startedAt) return null;
  const today = startOfDay(now);
  const ak = activeKey(data, now);
  for (let i = 1; i <= 2; i++) {
    const d = addDays(today, -i);
    const k = keyOf(d);
    if (k > fk && k >= data.startedAt && k !== ak && !data.log[k]) return d;
  }
  return null;
}

/** Whether to suggest a weigh-in: never logged, or a week since the last one. */
export function weighDue(data: Data, now: Date): { due: boolean; first: boolean } {
  const first = data.weights.length === 0;
  const today = startOfDay(now);
  if (!data.onboarded || !firstKey(data)) return { due: false, first };
  if (data.wSnooze && keyOf(today) < data.wSnooze) return { due: false, first };
  if (first) return { due: true, first };
  const last = data.weights[data.weights.length - 1];
  return { due: daysBetween(fromKey(last.d), today) >= 7, first };
}
