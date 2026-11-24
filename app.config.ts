import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Extends app.json.
 *
 * The APK published on GitHub is built with ON_TRACK_OFFLINE=1. That build drops the
 * internet permission, so Android itself stops the app from reaching any server: your
 * data can only live on your phone. It also drops permissions the app never uses.
 * Development builds keep them so they can talk to the dev server.
 */
const OFFLINE_BLOCKED = [
  'android.permission.INTERNET',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

export default ({ config }: ConfigContext): ExpoConfig => {
  const offline = process.env.ON_TRACK_OFFLINE === '1';
  return {
    ...config,
    name: config.name ?? 'On Track',
    slug: config.slug ?? 'on-track',
    android: {
      ...config.android,
      blockedPermissions: offline ? OFFLINE_BLOCKED : [],
    },
  };
};
