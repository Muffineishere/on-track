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

const NUNITO = './node_modules/@expo-google-fonts/nunito';

/** Android home screen widgets. Names match src/widgets/widgets.tsx. */
const widgets: [string, Record<string, unknown>] = [
  'react-native-android-widget',
  {
    fonts: [`${NUNITO}/700Bold/Nunito_700Bold.ttf`, `${NUNITO}/800ExtraBold/Nunito_800ExtraBold.ttf`],
    widgets: [
      {
        name: 'CheckIn',
        label: 'Tunas check-in',
        description: 'Log your day with one tap on Tunas’s face.',
        minWidth: '250dp',
        minHeight: '110dp',
        targetCellWidth: 4,
        targetCellHeight: 2,
        maxResizeWidth: '420dp',
        maxResizeHeight: '220dp',
        resizeMode: 'horizontal|vertical',
        previewImage: './assets/widgets/checkin.png',
        updatePeriodMillis: 1800000,
      },
      {
        name: 'Tunas',
        label: 'Tunas',
        description: 'Tunas and your streak at a glance.',
        minWidth: '110dp',
        minHeight: '110dp',
        targetCellWidth: 2,
        targetCellHeight: 2,
        resizeMode: 'horizontal|vertical',
        previewImage: './assets/widgets/tunas.png',
        updatePeriodMillis: 1800000,
      },
      {
        name: 'Week',
        label: 'This week',
        description: 'Your week of check-ins.',
        minWidth: '250dp',
        minHeight: '50dp',
        targetCellWidth: 4,
        targetCellHeight: 1,
        resizeMode: 'horizontal',
        previewImage: './assets/widgets/week.png',
        updatePeriodMillis: 1800000,
      },
    ],
  },
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
    plugins: [...(config.plugins ?? []), widgets],
  };
};
