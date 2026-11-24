# Product

<!-- impeccable:product-schema 1 -->

## Platform

Native app for iPhone and Android, built with Expo (React Native, TypeScript). The same code runs on the web for testing.

## Users

One person, the owner, keeping their own daily diet habit on their phone. Malaysian context: the plans and copy speak of teh tarik, kuih, nasi, mamak and kenduri. Confirmed 2026-11-24: "just me".

## Product Purpose

On Track helps the user stick to a chosen eating plan. Once a day they say how it went (Followed, Mostly or Missed), and they watch their consistency build through a streak, a weekly count and a garden of weekly plants. Weight tracking is optional and shows the trend, not the daily number. Success means the user keeps checking in, day after day, and sees good days add up.

## Positioning

Adherence, not calories. One tap a day, and forgiving by design: "Mostly" still counts, free misses build up week by week, and a bad day never takes away progress already made. Tunas, a plant creature, grows from seed to little tree as good days add up, so the record of the habit is something alive rather than a score.

## Operating Context

- The evening check-in is the core ritual, often in bed or late at night.
- During the day, the user glances at today's rules (for the default plan: small breakfast, proper lunch, last meal by 6pm).
- An optional weigh-in once a week, in the morning before breakfast.
- A weekly recap on Sunday evening or Monday.

## Capabilities and Constraints

- An Expo app (iOS, Android, web) in this repository. The earlier single-file HTML prototype is superseded; its backups restore into the app.
- Data stays on the device (AsyncStorage). No account, no server, no analytics. Backup and restore are plain JSON files or text.
- Daily reminders are local notifications, scheduled two weeks ahead and skipped on days already answered.
- Units: kilograms.
- Features: four plans with editable rules, the daily check-in with a celebration, a streak with free misses (one added each week, at most two saved), the month as a garden island and calendar, editable past days, slip reasons, weekday patterns, a weight log with a smoothed trend and an optional goal, the weekly recap, outfits unlocked by good days, onboarding, sample data and start over.

## Brand Commitments

- Name: On Track. Mascot: Tunas (Malay for a young shoot), a round green plant creature with leaves, cheeks and outfits (leaf crown, sunglasses, songkok, scarf, watering can). It grows in stages: seed, sprout, seedling, blooming, little tree.
- Voice: warm, short, encouraging, never shaming, with light Malay touches ("Mantap!").
- Keep Tunas, the time-of-day sky scene and the iPhone-style shell (large titles, the tab bar, bottom sheets).
- Premium, not cheap (user, 2026-11-24): the bright v2 palette read as cheap. The app uses warm linen neutrals, one deep evergreen and muted leaf, honey and clay status colours. The garden was redesigned as an isometric island after the user said the old garden did not look nice.
- Visual standard, binding (user, 2026-11-24): "simple, intuitive", like the popular character-led trackers that went viral on the App Store. Named references: Finch, Chick Focus and Forest (a character that grows as you keep the habit), plus Duolingo-style success screens. Tunas is the star and reacts to touch, the check-in is one big obvious tap, and everything else stays out of the way. The user rejected the first draft's mint-and-glass look as "vibe coded", and also rejected the seed packet, kuih tray, garden map, module board, circle catalog and departure board directions.

## Product Principles

1. One tap is enough. The daily check-in stays instant, and everything else is optional.
2. Forgiving by design. No shaming and no lost progress. A slip is information, not failure.
3. Glanceable. Today's state and the next step are visible without scrolling.
4. Private by default. Personal data stays with the user.

## Accessibility & Inclusion

No product-specific requirement was set. The baseline is WCAG AA contrast, keyboard and screen-reader support, and reduced-motion support. It is used one-handed on a phone, often in the dark.
