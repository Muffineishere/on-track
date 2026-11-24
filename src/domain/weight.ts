import { addDays, daysBetween, fromKey, roughDate, startOfDay } from './dates';
import type { DayKey, WeightEntry } from './types';

export interface TrendPoint {
  d: DayKey;
  kg: number;
  /** Smoothed trend weight. */
  tr: number;
}

/**
 * Exponentially smoothed by elapsed days (time constant 10 days),
 * so weekly and daily weigh-ins both give a steady trend.
 */
export function trendSeries(ws: WeightEntry[]): TrendPoint[] {
  let tr: number | null = null;
  let prev: Date | null = null;
  return ws.map((e) => {
    const d = fromKey(e.d);
    if (tr == null || prev == null) tr = e.kg;
    else tr += (1 - Math.exp(-Math.max(1, daysBetween(prev, d)) / 10)) * (e.kg - tr);
    prev = d;
    return { d: e.d, kg: e.kg, tr };
  });
}

/**
 * Least-squares slope in kg per day over the last `days` days of raw weigh-ins.
 * Needs at least 3 points spanning 14 days or more.
 */
export function slope(series: { d: DayKey; kg: number }[], days = 42): number | null {
  if (!series.length) return null;
  const end = fromKey(series[series.length - 1].d);
  const pts = series.filter((p) => daysBetween(fromKey(p.d), end) <= days);
  if (pts.length < 3) return null;
  const start = fromKey(pts[0].d);
  if (daysBetween(start, end) < 14) return null;
  const xs = pts.map((p) => daysBetween(start, fromKey(p.d)));
  const ys = pts.map((p) => p.kg);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let nu = 0;
  let de = 0;
  xs.forEach((x, i) => {
    nu += (x - mx) * (ys[i] - my);
    de += (x - mx) * (x - mx);
  });
  return de ? nu / de : null;
}

/**
 * When the goal might be reached at the recent pace, as a rough date ("mid-March").
 * Null when there is no goal, too little data, a flat trend, a trend moving away
 * from the goal, or an estimate more than two years out.
 */
export function projectGoal(series: TrendPoint[], goal: number | null, now: Date): string | null {
  if (goal == null || series.length < 3) return null;
  const sl = slope(series, 42);
  const cur = series[series.length - 1].tr;
  const need = goal - cur;
  if (sl == null || Math.abs(sl) < 0.005 || Math.sign(sl) !== Math.sign(need)) return null;
  const days = need / sl;
  if (days <= 0 || days > 730) return null;
  return roughDate(addDays(startOfDay(now), Math.round(days)), now);
}

export type DeltaTone = 'good' | 'flat' | 'away';

/**
 * Colours a change in weight. Without a goal, losing reads as good and gaining as neutral.
 * With a goal, moving toward it is good and moving away is "away" (never "bad").
 */
export function deltaTone(delta: number, goal: number | null, startKg: number): DeltaTone {
  if (Math.abs(delta) < 0.05) return 'flat';
  if (goal == null) return delta < 0 ? 'good' : 'flat';
  const dir = goal - startKg;
  return (dir < 0 && delta < 0) || (dir > 0 && delta > 0) ? 'good' : 'away';
}

export interface GoalProgress {
  startKg: number;
  current: number;
  progress: number;
  left: number;
  reached: boolean;
}

export function goalProgress(ws: WeightEntry[], series: TrendPoint[], goal: number): GoalProgress {
  const startKg = ws.length ? ws[0].kg : goal;
  const current = series.length ? series[series.length - 1].tr : startKg;
  const span = startKg - goal;
  const progress = Math.abs(span) < 0.05 ? 1 : Math.min(1, Math.max(0, (startKg - current) / span));
  const reached = ws.length > 0 && (Math.abs(span) < 0.05 || (span > 0 ? current <= goal : current >= goal));
  return { startKg, current, progress, left: Math.abs(current - goal), reached };
}

/** "72.4" */
export const formatKg = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

/** "+0.4", "−1.2" (with a true minus sign), or "0.0" */
export const formatSigned = (n: number) => (n > 0.04 ? '+' : n < -0.04 ? '−' : '') + formatKg(Math.abs(n));

/** Accepts "72.4" or "72,4". */
export const parseKg = (v: string) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};
