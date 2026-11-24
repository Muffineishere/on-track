import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_LINES } from '@/domain/content';
import { addDays, keyOf, parseClock, startOfDay } from '@/domain/dates';
import { pick } from '@/domain/lines';
import type { Data } from '@/domain/types';

/** Local reminders exist on phones only. */
export const remindersSupported = Platform.OS === 'ios' || Platform.OS === 'android';

const DAYS_AHEAD = 14;
const CHANNEL = 'check-in';

if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function reminderPermission(): Promise<PermissionState> {
  if (!remindersSupported) return 'unsupported';
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionState;
}

export async function askReminderPermission(): Promise<PermissionState> {
  if (!remindersSupported) return 'unsupported';
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Daily check-in', importance: AndroidImportance.DEFAULT });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status as PermissionState;
}

/**
 * Schedules one reminder per day for the next two weeks at the chosen time, skipping
 * days that already have an answer, so a check-in done early means no nudge that night.
 * Called whenever the data changes and when the app opens.
 */
export async function syncReminders(data: Data, now: Date) {
  if (!remindersSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!data.onboarded || !data.reminderOn) return;
    if ((await reminderPermission()) !== 'granted') return;
    const mins = parseClock(data.reminder);
    const today = startOfDay(now);
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const day = addDays(today, i);
      const k = keyOf(day);
      if (data.log[k]) continue;
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(mins / 60), mins % 60);
      if (at <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: 'On Track', body: pick(REMINDER_LINES, k) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
      });
    }
  } catch {
    // Scheduling is best effort; the app works without reminders.
  }
}
