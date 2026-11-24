/** A calendar day in local time, written as YYYY-MM-DD. */
export type DayKey = string;

export type Status = 'followed' | 'mostly' | 'missed';
export type DietId = 'early' | 'loss' | 'protein' | 'custom';
export type SlipId = 'late' | 'sweet' | 'out' | 'hungry' | 'social' | 'stress' | 'other';
export type OutfitId = 'crown' | 'shades' | 'songkok' | 'scarf' | 'can';
export type ThemePref = 'system' | 'light' | 'dark';

/** What Tunas's face is doing. */
export type Mood = 'none' | 'evening' | 'followed' | 'mostly' | 'missed' | 'poke' | 'pet';

export interface WeightEntry {
  d: DayKey;
  kg: number;
}

/** Everything the app saves. Version 3 adds reminderOn and theme to the web prototype's v2 shape. */
export interface Data {
  v: 3;
  diet: DietId;
  /** Edited rule lists, per plan. A plan without an entry uses its default rules. */
  rules: Partial<Record<DietId, string[]>>;
  log: Record<DayKey, Status>;
  slips: Record<DayKey, SlipId>;
  notes: Record<DayKey, string>;
  /** Rules ticked off during a day, by rule text. */
  ticks: Record<DayKey, string[]>;
  weights: WeightEntry[];
  goal: number | null;
  outfit: OutfitId | null;
  seenOutfits: OutfitId[];
  /** Monday of the last weekly recap that was shown. */
  seenRecap: DayKey | '';
  /** The weigh-in nudge stays hidden until this day. */
  wSnooze: DayKey | '';
  /** Daily reminder time, HH:MM in 24-hour time. */
  reminder: string;
  reminderOn: boolean;
  theme: ThemePref;
  /** Stops Tunas's idle breathing, blinking and swaying. */
  calm: boolean;
  onboarded: boolean;
  startedAt: DayKey | '';
  updatedAt: number;
}
