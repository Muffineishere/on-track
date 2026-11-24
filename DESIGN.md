# Design

On Track is a character-led habit app in the spirit of the trackers people love on the App Store: simple, intuitive, and centred on a creature that grows with you. This file records the system as it ships. Values live in `src/theme`.

Design read: a personal habit tracker for one person in Malaysia, warm and character-led with premium restraint. Dials: ENERGY 2, RHYTHM 2, MOTION 2 (Tunas and the celebration carry the motion; the rest of the interface stays calm).

## Principles

1. **Tunas is the star.** One focal point per screen: Tunas on Today, the island on Garden, the trend number on Weight.
2. **One tap is enough.** The check-in is three large tiles. Everything else is optional.
3. **Forgiving.** Missed days are never red alarms: a cross on a muted clay, a resting stone in the garden, a grey (not red) celebration screen.
4. **Restraint reads as premium.** Warm neutrals, one deep brand green, muted status colours, soft depth instead of hard outlines.

## Colour

Warm linen neutrals and a deep evergreen carry the brand. The three answers each get one muted colour, used for fills, soft tints and text. Every text pairing below meets WCAG AA (checked with a contrast script).

| Role       | Light                       | Dark                        | Use                           |
| ---------- | --------------------------- | --------------------------- | ----------------------------- |
| Background | `#FAF5EC`                   | `#0E1311`                   | App canvas, sheets            |
| Surface    | `#FFFFFF`                   | `#161D1A`                   | Cards                         |
| Surface 2  | `#EEEAE2`                   | `#1F2824`                   | Tracks, inset controls, chips |
| Ink        | `#1D2621` (13.9:1)          | `#EDF1EE` (16.5:1)          | Primary text                  |
| Ink 2      | `#4F5A53` (6.4:1)           | `#B3BDB6` (8.9:1)           | Secondary text                |
| Ink 3      | `#5F685F` (5.2:1)           | `#8E9890` (5.8:1)           | Labels, captions              |
| Brand      | `#1F5A45`, white text 8.1:1 | `#2E7656`, white text 5.5:1 | Primary buttons, selection    |
| Brand text | `#1F5A45`                   | `#9FD5B4` (10.3:1)          | Links, selected labels        |
| Followed   | `#2F7D52`, white icon 5.0:1 | `#5DB07D`, dark icon 7.1:1  | Leaf green                    |
| Mostly     | `#D9A23A`, dark icon 6.1:1  | `#E2B04F`, dark icon 9.4:1  | Honey                         |
| Missed     | `#B85C46`, white icon 4.5:1 | `#D7765D`, dark icon 5.9:1  | Clay, never alarm red         |
| Free miss  | `#55728F`, white icon 5.0:1 | `#7E9CBB`, dark icon 6.6:1  | Slate blue shield             |
| Flame      | `#D9731F`                   | `#EE9548`                   | Streak icon only              |

Why: the earlier bright mint and saturated status colours read as cheap. Lowering saturation, warming the neutrals and anchoring on one deep green gives the calm, expensive feel of a well-made wellness app while keeping the three answers distinct.

### Scenes

The Today sky follows the clock: peach morning, clear day, dusky evening and a starry night, each with three layered hills. Tunas keeps the same greens in both themes so the character is always recognisable.

The garden island uses grass greens with a soil edge, plus flower colours (honey, rose, butter, pink) drawn only on plants.

## Type

Nunito, because it is rounded like Tunas and stays warm at heavy weights. One family, four weights.

| Style    | Font          | Size / line            | Use                                 |
| -------- | ------------- | ---------------------- | ----------------------------------- |
| Display  | Black 900     | 33 / 39, tracking -0.6 | Screen titles, celebration headline |
| Title    | Black 900     | 24 / 30                | Sheet titles, the check-in question |
| Headline | ExtraBold 800 | 18 / 24                | Card titles                         |
| Body     | SemiBold 600  | 16 / 23                | Text                                |
| Callout  | SemiBold 600  | 15 / 21                | Supporting text                     |
| Footnote | SemiBold 600  | 13 / 18                | Captions                            |
| Label    | Bold 700      | 13 / 17                | Small labels, tab labels            |
| Number   | Black 900     | 44 / 50, tabular       | Trend weight, streak                |

No uppercase labels with wide tracking.

## Space, shape, depth

- 4-point spacing; screens use 20 side padding and 18 between cards.
- Radius steps: sheet 32, card 28, tile 20, control 16, small 12. Soft and round like Tunas. Only chips and the toast are pills.
- Light mode cards get a hairline and a soft two-step shadow. Dark mode drops shadows and uses lighter surfaces for elevation. Floating layers (sheets, toast, web tab bar) get the only strong shadows.

## Components

- **Answer tiles:** three soft-tinted tiles, each with Tunas's face showing the answer (beaming, content, sleepy) and its label. Pressed: a spring squash and a haptic. The same faces are the buttons on the home screen widget, so the app and the widget feel like one thing.
- **Widgets:** drawn from SVG strings of the same Tunas (src/widgets/art.ts) on the time-of-day sky. The check-in widget drops the sun and moon so nothing competes with its title.
- **Status disc:** check (Followed), wave (Mostly), cross (Missed), shield (a free miss covered it).
- **Sheets:** slide up in their own modal layer, swipe the handle down or tap outside to close, Escape and the Android back button work too.
- **Celebration:** full screen, tinted by the answer. Tunas jumps, streak and good-day counts tick up, the growth bar fills, confetti for good days and new stages.
- **Toast:** dark pill at the top, with Undo for reversible changes.
- **Icons:** a custom set on a 24 grid with a 2.2 stroke and round ends, matching Nunito and Tunas. The native tab bar uses SF Symbols on iOS and Material Symbols on Android.

## Motion

| Element     | Motion                                                       | Why                                                 |
| ----------- | ------------------------------------------------------------ | --------------------------------------------------- |
| Tunas idle  | Breathing, leaf sway, blinking, glancing around              | Feels alive without demanding attention             |
| Tunas touch | Eyes follow the finger; tap squashes, hold waves with hearts | The character responds, which invites a daily visit |
| Check-in    | Jump, count-up, growth bar, confetti                         | The reward that keeps the habit going               |
| Sheets      | 340 ms slide with a soft ease-out                            | Clear spatial origin                                |
| Press       | Spring squash to 96%                                         | Physical feedback                                   |

All of it respects Reduce Motion: idle loops, actions and confetti stop, counts jump to their final values. Plan, Appearance, "Tunas moving: Still" stops the idle loops for anyone who prefers a still Tunas.

## Accessibility

- Every control has a role and an accessible name; Tunas, the garden and the chart have descriptive labels.
- Screen readers on phones get the calendar view of the garden, where each day is its own button.
- Keyboard on the web: every control is reachable with Tab, shows a focus ring, and sheets close with Escape.
- Tap targets are at least 44 points.
