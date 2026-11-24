import { LINES } from './content';
import { formatDuration, isEvening, keyOf, startOfDay, timeOfDay } from './dates';
import { cutoffInfo, planCutoff } from './rules';
import { rulesFor } from './state';
import { activeKey } from './streak';
import type { Data, Mood } from './types';

/** Small stable hash, so the same day always gets the same line. */
export const hash = (str: string) => {
  let h = 7;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 9973;
  return h;
};

export const pick = <T>(arr: readonly T[], seed: string | number): T => arr[hash(String(seed)) % arr.length];

export const pickRandom = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const plural = (n: number, word: string, words?: string) => `${n} ${n === 1 ? word : (words ?? word + 's')}`;

export function greeting(now: Date) {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17) return 'Good evening';
  return 'Still up?';
}

/** What Tunas says on the Today screen. */
export function tunasLine(data: Data, now: Date): string {
  const ak = activeKey(data, now);
  const s = data.log[ak];
  if (s) return pick(LINES[s], ak + s);
  if (ak !== keyOf(startOfDay(now))) return pick(LINES.late, ak);
  const list = rulesFor(data);
  const ticks = data.ticks[ak] ?? [];
  if (list.length && list.every((x) => ticks.includes(x))) return pick(LINES.ticked, ak);
  const c = planCutoff(list);
  if (c != null) {
    const info = cutoffInfo(c, now);
    if (info.left > 0 && info.left <= 180) {
      return `Kitchen closes in ${formatDuration(info.left)}. ${info.left <= 45 ? 'Last bites!' : 'You’re doing great.'}`;
    }
  }
  if (isEvening(now)) return pick(LINES.evening, ak);
  const early = data.diet === 'early';
  if (timeOfDay(now) === 'morning') return pick(early ? [...LINES.morning, ...LINES.morningEarly] : LINES.morning, ak);
  return pick(early ? [...LINES.day, ...LINES.dayEarly] : LINES.day, ak);
}

/** Tunas's resting face: today's answer, sleepy in the evening, otherwise neutral. */
export function baseMood(data: Data, now: Date): Mood {
  const s = data.log[activeKey(data, now)];
  if (s) return s;
  return isEvening(now) ? 'evening' : 'none';
}
