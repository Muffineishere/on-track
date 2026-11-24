import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { addDays, keyOf, mondayOf } from '@/domain/dates';
import { makeSample } from '@/domain/sample';
import { fresh, normalize, roundKg, rulesFor } from '@/domain/state';
import type { Data, DayKey, DietId, OutfitId, SlipId, Status, ThemePref } from '@/domain/types';

interface DataState {
  /** The user's own data. This is the only part that is saved. */
  data: Data;
  /** Sample data shown instead of the user's own while trying the app. Never saved. */
  demo: Data | null;
  hydrated: boolean;
}

export const useDataStore = create<DataState>()(
  persist(() => ({ data: fresh(), demo: null, hydrated: false }) as DataState, {
    name: 'on-track',
    version: 3,
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (s) => ({ data: s.data }),
    merge: (persisted, current) => ({ ...current, data: normalize((persisted as { data?: unknown } | undefined)?.data) }),
    onRehydrateStorage: () => () => useDataStore.setState({ hydrated: true }),
  }),
);

/** The data on screen: the sample while trying it, otherwise the user's own. */
export const useActive = () => useDataStore((s) => s.demo ?? s.data);
export const useIsDemo = () => useDataStore((s) => s.demo !== null);
export const getActive = () => {
  const s = useDataStore.getState();
  return s.demo ?? s.data;
};

/** Ticks older than 60 days are only clutter. */
function pruneTicks(d: Data, now: Date) {
  const cut = keyOf(addDays(now, -60));
  for (const k in d.ticks) if (k < cut || !d.ticks[k].length) delete d.ticks[k];
}

/** Applies a change to a copy of the data on screen and stores it in the right place. */
function update(fn: (d: Data) => void) {
  const s = useDataStore.getState();
  const next = structuredClone(s.demo ?? s.data);
  fn(next);
  const now = new Date();
  next.updatedAt = now.getTime();
  pruneTicks(next, now);
  if (s.demo) useDataStore.setState({ demo: next });
  else useDataStore.setState({ data: next });
}

/** A copy of the data on screen, for undo. */
export const snapshot = (): Data => structuredClone(getActive());

export const store = {
  restore(d: Data) {
    update((x) => Object.assign(x, structuredClone(d)));
  },
  setDay(key: DayKey, status: Status | null) {
    update((d) => {
      if (status) d.log[key] = status;
      else delete d.log[key];
      if (!status || status === 'followed') delete d.slips[key];
    });
  },
  toggleSlip(key: DayKey, id: SlipId) {
    update((d) => {
      if (d.slips[key] === id) delete d.slips[key];
      else d.slips[key] = id;
    });
  },
  setNote(key: DayKey, text: string) {
    const v = text.trim().slice(0, 200);
    update((d) => {
      if (v) d.notes[key] = v;
      else delete d.notes[key];
    });
  },
  /** Returns true when this tick completed the list. */
  toggleTick(key: DayKey, rule: string): boolean {
    let completed = false;
    update((d) => {
      const list = rulesFor(d);
      const arr = (d.ticks[key] ?? []).filter((x) => list.includes(x));
      const j = arr.indexOf(rule);
      if (j >= 0) arr.splice(j, 1);
      else arr.push(rule);
      if (arr.length) d.ticks[key] = arr;
      else delete d.ticks[key];
      completed = j < 0 && list.every((x) => arr.includes(x));
    });
    return completed;
  },
  setRules(list: string[]) {
    update((d) => {
      d.rules[d.diet] = list;
    });
  },
  setDiet(id: DietId) {
    update((d) => {
      d.diet = id;
    });
  },
  setWeight(day: DayKey, kg: number) {
    update((d) => {
      const v = roundKg(kg);
      const i = d.weights.findIndex((w) => w.d === day);
      if (i >= 0) d.weights[i].kg = v;
      else {
        d.weights.push({ d: day, kg: v });
        d.weights.sort((a, b) => (a.d < b.d ? -1 : 1));
      }
      d.wSnooze = '';
    });
  },
  deleteWeight(day: DayKey) {
    update((d) => {
      d.weights = d.weights.filter((w) => w.d !== day);
    });
  },
  setGoal(kg: number | null) {
    update((d) => {
      d.goal = kg == null ? null : roundKg(kg);
    });
  },
  wear(id: OutfitId | null) {
    update((d) => {
      d.outfit = id;
    });
  },
  markOutfitsSeen(ids: OutfitId[]) {
    update((d) => {
      for (const id of ids) if (!d.seenOutfits.includes(id)) d.seenOutfits.push(id);
    });
  },
  markRecap(mon: DayKey) {
    update((d) => {
      d.seenRecap = mon;
    });
  },
  snoozeWeigh(now: Date) {
    update((d) => {
      d.wSnooze = keyOf(addDays(now, d.weights.length ? 2 : 7));
    });
  },
  setReminder(hhmm: string) {
    update((d) => {
      d.reminder = hhmm;
    });
  },
  setReminderOn(on: boolean) {
    update((d) => {
      d.reminderOn = on;
    });
  },
  /** Appearance belongs to the user, even while showing sample data. */
  setTheme(theme: ThemePref) {
    useDataStore.setState((s) => ({ data: { ...s.data, theme }, demo: s.demo ? { ...s.demo, theme } : null }));
  },
  /** Motion preference belongs to the user, like appearance. */
  setCalm(calm: boolean) {
    useDataStore.setState((s) => ({ data: { ...s.data, calm }, demo: s.demo ? { ...s.demo, calm } : null }));
  },
  onboard(now: Date, diet: DietId, reminder: string, reminderOn: boolean) {
    update((d) => {
      d.diet = diet;
      d.reminder = reminder;
      d.reminderOn = reminderOn;
      d.onboarded = true;
      d.startedAt = d.startedAt || keyOf(now);
      // A recap of a week before the user started would be empty, so mark it seen.
      d.seenRecap = keyOf(addDays(mondayOf(now), -7));
    });
  },
  reset(now: Date) {
    const s = useDataStore.getState();
    const d = fresh();
    d.onboarded = true;
    d.startedAt = keyOf(now);
    d.theme = s.data.theme;
    d.calm = s.data.calm;
    d.reminder = s.data.reminder;
    d.reminderOn = s.data.reminderOn;
    d.updatedAt = now.getTime();
    useDataStore.setState({ data: d, demo: null });
  },
  replaceAll(d: Data) {
    useDataStore.setState({ data: { ...d, updatedAt: Date.now() }, demo: null });
  },
  enterDemo(now: Date) {
    const theme = useDataStore.getState().data.theme;
    useDataStore.setState({ demo: { ...makeSample(now), theme, calm: useDataStore.getState().data.calm } });
  },
  exitDemo() {
    useDataStore.setState({ demo: null });
  },
};
