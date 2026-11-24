import { DIETS, OUTFITS, SLIP_IDS } from './content';
import { isKey, keyOf } from './dates';
import type { Data, DayKey, DietId, OutfitId, SlipId, Status, ThemePref, WeightEntry } from './types';

export function fresh(): Data {
  return {
    v: 3,
    diet: 'early',
    rules: {},
    log: {},
    slips: {},
    notes: {},
    ticks: {},
    weights: [],
    goal: null,
    outfit: null,
    seenOutfits: [],
    seenRecap: '',
    wSnooze: '',
    reminder: '21:00',
    reminderOn: true,
    theme: 'system',
    calm: false,
    onboarded: false,
    startedAt: '',
    updatedAt: 0,
  };
}

export const isGood = (s: Status | undefined | null): s is 'followed' | 'mostly' => s === 'followed' || s === 'mostly';

export function countGood(log: Data['log']) {
  let n = 0;
  for (const k in log) if (isGood(log[k])) n++;
  return n;
}

const isStatus = (v: unknown): v is Status => v === 'followed' || v === 'mostly' || v === 'missed';
const isDiet = (v: unknown): v is DietId => typeof v === 'string' && v in DIETS;
const isOutfit = (v: unknown): v is OutfitId => OUTFITS.some((o) => o.id === v);
const isSlip = (v: unknown): v is SlipId => SLIP_IDS.includes(v as SlipId);
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export const validKg = (n: number) => Number.isFinite(n) && n >= 25 && n <= 300;
export const roundKg = (n: number) => Math.round(n * 10) / 10;

/**
 * Turns anything (a saved state, an imported backup from the app or the web prototype)
 * into valid Data. Unknown or malformed fields fall back to defaults.
 */
export function normalize(raw: unknown, now: Date = new Date()): Data {
  const o = fresh();
  if (!isObject(raw)) return o;
  const s = raw;

  if (isDiet(s.diet)) o.diet = s.diet;
  if (isObject(s.rules)) {
    for (const d in s.rules) {
      const list = s.rules[d];
      if (isDiet(d) && Array.isArray(list)) {
        o.rules[d] = list.filter((x): x is string => typeof x === 'string' && !!x.trim()).map((x) => x.trim().slice(0, 120));
      }
    }
  }
  if (isObject(s.log)) for (const k in s.log) if (isKey(k) && isStatus(s.log[k])) o.log[k] = s.log[k] as Status;
  if (isObject(s.slips)) for (const k in s.slips) if (isKey(k) && isSlip(s.slips[k])) o.slips[k] = s.slips[k] as SlipId;
  if (isObject(s.notes)) {
    for (const k in s.notes) {
      const v = s.notes[k];
      if (isKey(k) && typeof v === 'string' && v.trim()) o.notes[k] = v.trim().slice(0, 200);
    }
  }
  if (isObject(s.ticks)) {
    for (const k in s.ticks) {
      const v = s.ticks[k];
      if (isKey(k) && Array.isArray(v)) o.ticks[k] = v.filter((x): x is string => typeof x === 'string');
    }
  }
  if (Array.isArray(s.weights)) {
    const by: Record<DayKey, number> = {};
    for (const w of s.weights) {
      if (!isObject(w)) continue;
      const n = Number(w.kg);
      if (isKey(w.d) && validKg(n)) by[w.d] = roundKg(n);
    }
    o.weights = Object.keys(by)
      .sort()
      .map((d): WeightEntry => ({ d, kg: by[d] }));
  }
  if (typeof s.goal === 'number' && validKg(s.goal)) o.goal = roundKg(s.goal);
  if (isOutfit(s.outfit)) o.outfit = s.outfit;
  if (Array.isArray(s.seenOutfits)) o.seenOutfits = s.seenOutfits.filter(isOutfit);
  else {
    const g = countGood(o.log);
    o.seenOutfits = OUTFITS.filter((x) => g >= x.at).map((x) => x.id);
  }
  if (isKey(s.seenRecap)) o.seenRecap = s.seenRecap;
  if (isKey(s.wSnooze)) o.wSnooze = s.wSnooze;
  if (typeof s.reminder === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s.reminder)) o.reminder = s.reminder;
  if (typeof s.reminderOn === 'boolean') o.reminderOn = s.reminderOn;
  if (typeof s.calm === 'boolean') o.calm = s.calm;
  if (s.theme === 'light' || s.theme === 'dark' || s.theme === 'system') o.theme = s.theme as ThemePref;
  const logKeys = Object.keys(o.log).sort();
  o.onboarded = s.onboarded === true || logKeys.length > 0;
  o.startedAt = isKey(s.startedAt) ? s.startedAt : (logKeys[0] ?? (o.onboarded ? keyOf(now) : ''));
  o.updatedAt = Number(s.updatedAt) || 0;
  return o;
}

/** The rules in use for a plan: the edited list if there is one, otherwise the plan's defaults. */
export const rulesFor = (data: Data, diet: DietId = data.diet) => data.rules[diet] ?? DIETS[diet].rules;
