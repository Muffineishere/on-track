# On Track

A diet-adherence tracker for one person in Malaysia, with Tunas, a small plant creature that grows as good days add up.

Once a day you tell Tunas how it went: **Followed**, **Mostly** or **Missed**. Mostly still counts, a free miss arrives every Monday, and a bad day never takes away progress already made. The month grows into a little garden island, Tunas moves from seed to little tree, and outfits unlock along the way. Weight tracking is optional and shows a smoothed trend, not the daily number.

## What's in the app

| Tab        | What it does                                                                                                                                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Today**  | Tunas in a sky that follows the time of day (tap to say hi, hold for a cuddle, it watches your finger). One-tap check-in with a full-screen celebration, this week at a glance, today's rules as a checklist with a kitchen-cutoff countdown, and gentle nudges for a missed day or a weekly weigh-in.           |
| **Garden** | The month as an isometric garden: good days grow trees and flowers, a perfect week blossoms, a free miss leaves a resting stone. Switch to a calendar view; tap any day to edit it. Also Tunas's journey through five stages, the wardrobe and weekday patterns with a suggested rule for your most common slip. |
| **Weight** | Trend weight with a smooth chart you can scrub, the change since you started, an optional goal with a rough arrival month, and the full history.                                                                                                                                                                 |
| **Plan**   | Four plans (or your own), editable rules with suggestions, a daily reminder, light or dark appearance, backup and restore, sample data and start over.                                                                                                                                                           |

Reminders are real local notifications: one per day at your chosen time for the next two weeks, skipped on days you've already checked in.

Everything stays on the device. There is no account, no server and no analytics.

## Stack

- **TypeScript** (strict) on **React Native 0.88** with **Expo SDK 58** and the New Architecture
- **Expo Router** with the system tab bar (`NativeTabs`: Liquid Glass on iOS 26, Material on Android) and a custom tab bar on the web
- **Reanimated 4** and **Gesture Handler 3** for Tunas, sheets, confetti and the chart
- **react-native-svg** for Tunas, the sky, the garden island, icons and the chart
- **Zustand** with AsyncStorage for state that persists on the device
- **expo-notifications**, **expo-haptics**, **expo-file-system**, **expo-sharing**, **expo-document-picker**, **expo-clipboard**
- **Jest** (jest-expo) unit tests for all the app's rules, **ESLint** with the React Compiler rules, **Prettier**
- **GitHub Actions** CI and **EAS Build** for the iPhone and Android apps (no Mac needed)

## Run it

You need Node 22 or newer.

```sh
npm install
npm start
```

Then:

- **On your phone:** install **Expo Go** from the App Store or Play Store and scan the QR code. Notifications and haptics work best in a development build (below).
- **In a browser:** press `w`, or run `npm run web`.

### Scripts

| Command             | What it does                       |
| ------------------- | ---------------------------------- |
| `npm start`         | Start the dev server               |
| `npm run web`       | Start and open the web version     |
| `npm test`          | Unit tests                         |
| `npm run typecheck` | TypeScript                         |
| `npm run lint`      | ESLint                             |
| `npm run format`    | Prettier                           |
| `npm run check`     | Typecheck, lint and tests together |
| `npm run build:web` | Static web build in `dist/`        |

## Build the iPhone and Android apps

Builds run in Expo's cloud, so an iPhone build doesn't need a Mac.

1. Create a free Expo account, then link the project once:
   ```sh
   npx eas-cli@latest login
   npx eas-cli@latest init
   ```
2. Build:
   ```sh
   npx eas-cli@latest build --profile preview --platform android   # an APK you can install directly
   npx eas-cli@latest build --profile development --platform ios   # a dev build for your own iPhone
   ```
   Installing on an iPhone needs an Apple Developer account. `eas device:create` registers your phone.
3. To build from GitHub instead, add an `EXPO_TOKEN` repository secret (from expo.dev, Account settings, Access tokens) and run the **EAS build** workflow from the Actions tab.

Before publishing to a store, change `ios.bundleIdentifier` and `android.package` in `app.json` (now `com.ontrack.tunas`) to an identifier you own.

## Project layout

```
src/
  app/          Routes: Today (index), Garden, Weight, Plan, and the root layout
  domain/       The app's rules as plain TypeScript: streaks, free misses, cutoffs,
                weight trend, garden layout, recap, backups. Fully unit tested.
  store/        Zustand stores (saved data, sheets and toasts) and check-in flows
  components/   Tunas, the sky scene, the garden island, sheets, toasts, confetti, UI kit
  features/     Pieces of each tab
  sheets/       Bottom sheets, the celebration and onboarding
  theme/        Palette, type scale, spacing and radii (see DESIGN.md)
  lib/          Haptics, reminders, clock
```

`PRODUCT.md` describes who the app is for and why. `DESIGN.md` records the visual system.

## Notes

- **App icon:** the icon and splash are placeholders drawn from Tunas. Swap the files in `assets/images` when you have a final icon.
- **Backups** are plain JSON. Backups from the earlier single-file web version of On Track restore too.
- **License:** none chosen yet. The repository is private.
