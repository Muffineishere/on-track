import { OUTFITS, STAGES } from '@/domain/content';
import { formatShort, fromKey, keyOf, mondayOf } from '@/domain/dates';
import { recapDue } from '@/domain/recap';
import { stageOf } from '@/domain/stage';
import { countGood, isGood } from '@/domain/state';
import { activeKey, streak, weekInfo } from '@/domain/streak';
import type { DayKey, Status } from '@/domain/types';
import { haptic } from '@/lib/haptics';

import { getActive, snapshot, store, useDataStore } from './data';
import { ui } from './ui';

function stats(now: Date) {
  const d = getActive();
  const good = countGood(d.log);
  const st = streak(d, now);
  return { good, stage: stageOf(good), streak: st.cur, best: st.best };
}

/**
 * Records an answer for a day and plays the right response: the full celebration for the
 * day being checked in, a quiet toast for an edited past day, plus any outfit it unlocked.
 */
export function answerDay(key: DayKey, status: Status | null, opts: { celebrate?: boolean } = {}) {
  const now = new Date();
  const before = stats(now);
  const mon = mondayOf(fromKey(key));
  const wasPerfect = weekInfo(getActive(), mon).perfect;
  const isActive = key === activeKey(getActive(), now);
  const snap = snapshot();
  store.setDay(key, status);
  const after = stats(now);
  const nowPerfect = weekInfo(getActive(), mon).perfect;
  const grew = isGood(status) && after.stage > before.stage;
  const flowered = isGood(status) && nowPerfect && !wasPerfect;

  if (status === 'followed') haptic.success();
  else haptic.tap();

  if (opts.celebrate && status) {
    ui.open({
      kind: 'celebrate',
      spec: {
        key,
        status,
        before: { good: before.good, streak: before.streak, stage: before.stage },
        grew,
        flowered,
        bestStreak: after.streak > before.best && after.streak >= 7,
      },
    });
  } else {
    let line: string | undefined;
    if (grew)
      line =
        after.stage === 1
          ? 'I sprouted! Thank you!'
          : after.stage === 3
            ? 'Look, I bloomed!'
            : `Look, I’m a ${STAGES[after.stage].name.toLowerCase()} now!`;
    else if (flowered) line = 'Seven for seven! A flower bloomed in the garden.';
    if (isActive && status) ui.tunas({ anim: isGood(status) ? 'nod' : undefined, line });
    if (!isActive && line) ui.toast(line);
    else ui.toast(status ? `Saved for ${formatShort(fromKey(key))}` : 'Answer removed', () => store.restore(snap));
  }

  for (const o of OUTFITS) {
    if (before.good < o.at && after.good >= o.at && !getActive().seenOutfits.includes(o.id)) ui.enqueue({ kind: 'unlock', outfit: o.id });
  }
  maybeRecap(now);
}

/** Opens the weekly recap once, when a finished week has answers and has not been shown. */
export function maybeRecap(now: Date) {
  if (useDataStore.getState().demo) return;
  const mon = recapDue(getActive(), now);
  if (mon) ui.enqueue({ kind: 'recap', mon: keyOf(mon), auto: true });
}
