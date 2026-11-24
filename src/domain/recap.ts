import { addDays, keyOf, mondayOf, startOfDay } from './dates';
import { weekInfo } from './streak';
import type { Data } from './types';

/** The week a recap covers: this week from Sunday 6pm, otherwise last week. */
export function recapTarget(now: Date): Date {
  const mon = mondayOf(now);
  return now.getDay() === 0 && now.getHours() >= 18 ? mon : addDays(mon, -7);
}

/** The Monday of a recap that should open by itself, or null. */
export function recapDue(data: Data, now: Date): Date | null {
  if (!data.onboarded) return null;
  const mon = recapTarget(now);
  if (data.seenRecap === keyOf(mon) || weekInfo(data, mon).answered === 0) return null;
  return mon;
}

/** Weight change across a week: last weigh-in that week against the one before it. */
export function weekWeightChange(data: Data, mon: Date): number | null {
  const ws = data.weights;
  const a = keyOf(mon);
  const b = keyOf(addDays(startOfDay(mon), 6));
  const inWeek = ws.filter((e) => e.d >= a && e.d <= b);
  if (!inWeek.length) return null;
  const before = ws.filter((e) => e.d < a);
  const base = before.length ? before[before.length - 1] : inWeek[0];
  const last = inWeek[inWeek.length - 1];
  if (base === last) return null;
  return last.kg - base.kg;
}
