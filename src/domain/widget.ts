import { LINES } from './content';
import { addDays, DOW, isEvening, keyOf, mondayOf, startOfDay, timeOfDay, WEEK_LETTERS, type TimeOfDay } from './dates';
import { pick } from './lines';
import { stageOf } from './stage';
import { countGood, isGood } from './state';
import { activeKey, streak } from './streak';
import type { Data, DayKey, Mood, OutfitId, Status } from './types';

/** Records an answer the same way the app does: a Followed day drops its slip reason. */
export function applyAnswer(data: Data, key: DayKey, status: Status, now: Date): Data {
  const next: Data = { ...data, log: { ...data.log, [key]: status }, slips: { ...data.slips }, updatedAt: now.getTime() };
  if (status === 'followed') delete next.slips[key];
  return next;
}

export interface WidgetDay {
  letter: string;
  status: Status | null;
  forgiven: boolean;
  today: boolean;
  future: boolean;
}

/** Everything a home screen widget shows, worked out from the saved data. */
export interface WidgetModel {
  onboarded: boolean;
  /** The day a widget tap answers: today, or yesterday until 4am. */
  dayKey: DayKey;
  /** "today" or a weekday name for a late-night answer. */
  dayLabel: string;
  status: Status | null;
  forgiven: boolean;
  streak: number;
  freeMisses: number;
  good: number;
  stage: number;
  outfit: OutfitId | null;
  mood: Mood;
  tod: TimeOfDay;
  title: string;
  subtitle: string;
  week: WidgetDay[];
  weekGood: number;
}

export function widgetModel(data: Data, now: Date): WidgetModel {
  const ak = activeKey(data, now);
  const today = startOfDay(now);
  const late = ak !== keyOf(today);
  const dayLabel = late ? DOW[addDays(today, -1).getDay()] : 'today';
  const st = streak(data, now);
  const status = data.log[ak] ?? null;
  const good = countGood(data.log);
  const forgiven = status === 'missed' && !!st.forgiven[ak];
  const mood: Mood = status ?? (isEvening(now) ? 'evening' : 'none');
  const mon = mondayOf(today);
  let weekGood = 0;
  const week = Array.from({ length: 7 }, (_, i): WidgetDay => {
    const d = addDays(mon, i);
    const k = keyOf(d);
    const s = data.log[k] ?? null;
    if (isGood(s)) weekGood++;
    return {
      letter: WEEK_LETTERS[i],
      status: s,
      forgiven: s === 'missed' && !!st.forgiven[k],
      today: k === keyOf(today),
      future: d > today,
    };
  });

  let title: string;
  let subtitle: string;
  if (!data.onboarded) {
    title = 'Meet Tunas';
    subtitle = 'Open On Track to start';
  } else if (status === 'followed') {
    title = pick(['Mantap!', 'Nailed it!', 'Great job!'], ak);
    subtitle = late ? `Followed on ${dayLabel}` : 'Followed today';
  } else if (status === 'mostly') {
    title = 'Mostly counts!';
    subtitle = late ? `Mostly on ${dayLabel}` : 'A good day all the same';
  } else if (status === 'missed') {
    title = 'That’s okay';
    subtitle = forgiven ? 'A free miss kept your streak' : 'Tomorrow is a fresh start';
  } else {
    title = late ? `How was ${dayLabel}?` : isEvening(now) ? 'How did today go?' : 'Check in tonight';
    subtitle = pick(
      late ? LINES.late : isEvening(now) ? ['One tap is all it takes', 'Tap a face to log it'] : ['Tap a face when you’re done eating'],
      ak,
    );
  }

  return {
    onboarded: data.onboarded,
    dayKey: ak,
    dayLabel,
    status,
    forgiven,
    streak: st.cur,
    freeMisses: st.tokens,
    good,
    stage: stageOf(good),
    outfit: data.outfit,
    mood,
    tod: timeOfDay(now),
    title,
    subtitle,
    week,
    weekGood,
  };
}
