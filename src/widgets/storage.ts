import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalize } from '@/domain/state';
import type { Data } from '@/domain/types';

/** The key and envelope the app's Zustand store persists under (see store/data.ts). */
export const STORAGE_KEY = 'on-track';
const VERSION = 3;

export async function readSaved(): Promise<Data> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { state?: { data?: unknown } }) : null;
    return normalize(parsed?.state?.data);
  } catch {
    return normalize(null);
  }
}

export async function writeSaved(data: Data) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { data }, version: VERSION }));
}
