import { plural } from './lines';
import { normalize } from './state';
import type { Data } from './types';

export function backupText(data: Data, now: Date) {
  return JSON.stringify({ ...data, app: 'On Track', exportedAt: now.toISOString() }, null, 1);
}

export type BackupCheck = { ok: true; data: Data; summary: string } | { ok: false; message: string };

/**
 * Validates pasted or picked backup text. Accepts backups from this app and from the
 * On Track web prototype. Returns null for empty input.
 */
export function checkBackup(text: string, now: Date): BackupCheck | null {
  if (!text.trim()) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, message: 'That isn’t an On Track backup. Paste the whole text, from the first { to the last }.' };
  }
  if (!raw || typeof raw !== 'object' || !('log' in raw) || typeof (raw as { log: unknown }).log !== 'object') {
    return { ok: false, message: 'That text doesn’t contain any check-ins.' };
  }
  const data = normalize(raw, now);
  data.onboarded = true;
  const checkins = Object.keys(data.log).length;
  return {
    ok: true,
    data,
    summary: `Found ${plural(checkins, 'check-in')} and ${plural(data.weights.length, 'weigh-in')}. Restoring replaces what’s here now.`,
  };
}
