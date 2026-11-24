import { DIETS, OUTFITS } from './content';
import { addDays, keyOf, mondayOf, startOfDay } from './dates';
import { recapTarget } from './recap';
import { countGood, fresh } from './state';
import type { Data, SlipId, Status } from './types';

/**
 * Seven weeks of believable history for trying the app: mostly good weekdays,
 * harder weekends, one perfect week, notes, slips and a weekly weigh-in.
 * Seeded, so it is the same every time for a given day.
 */
export function makeSample(now: Date): Data {
  const s = fresh();
  const t = startOfDay(now);
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  s.onboarded = true;
  s.diet = 'early';
  s.startedAt = keyOf(addDays(t, -48));
  const perfectMon = keyOf(addDays(mondayOf(t), -21));
  for (let i = 48; i >= 1; i--) {
    const d = addDays(t, -i);
    const k = keyOf(d);
    const dow = d.getDay();
    const weekend = dow === 6 || dow === 0;
    const p = rnd();
    let st: Status = weekend
      ? p < 0.42
        ? 'followed'
        : p < 0.74
          ? 'mostly'
          : 'missed'
      : p < 0.76
        ? 'followed'
        : p < 0.92
          ? 'mostly'
          : 'missed';
    if (keyOf(mondayOf(d)) === perfectMon) st = 'followed';
    s.log[k] = st;
    if (st !== 'followed' && rnd() < 0.8) {
      const slip: SlipId = weekend ? (rnd() < 0.6 ? 'social' : 'out') : rnd() < 0.55 ? 'late' : rnd() < 0.5 ? 'sweet' : 'stress';
      s.slips[k] = slip;
    }
  }
  s.notes[keyOf(addDays(t, -9))] = 'Kenduri at Mak Long’s house. Had rendang, skipped the kuih.';
  s.notes[keyOf(addDays(t, -3))] = 'Busy day, but brought lunch from home.';
  let w = 74.8;
  for (let i = 49; i >= 0; i -= 7) {
    w += -0.36 + (rnd() - 0.5) * 0.7;
    s.weights.push({ d: keyOf(addDays(t, -i)), kg: Math.round(w * 10) / 10 });
  }
  s.goal = 68;
  const g = countGood(s.log);
  s.seenOutfits = OUTFITS.filter((x) => g >= x.at).map((x) => x.id);
  s.outfit = 'crown';
  s.seenRecap = keyOf(recapTarget(now));
  s.ticks[keyOf(t)] = DIETS.early.rules.slice(0, 2);
  s.updatedAt = now.getTime();
  return s;
}
