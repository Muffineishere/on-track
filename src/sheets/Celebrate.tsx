import { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Confetti } from '@/components/Confetti';
import { Icon } from '@/components/Icon';
import { Sheet, useSheet } from '@/components/Sheet';
import { Tunas } from '@/components/tunas/Tunas';
import { Button, ProgressBar, Txt } from '@/components/ui';
import { STAGES } from '@/domain/content';
import { pick, plural } from '@/domain/lines';
import { growth } from '@/domain/stage';
import { countGood } from '@/domain/state';
import { streak } from '@/domain/streak';
import { store, useActive } from '@/store/data';
import type { CelebrationSpec } from '@/store/ui';
import { ui } from '@/store/ui';
import { pickLineFor } from '@/features/today/lineFor';
import { RADIUS, useTheme } from '@/theme';

import { SlipChips, useCountUp } from './common';

const BG = {
  light: { followed: '#E6F2E8', mostly: '#FAF1DD', missed: '#EEF0F2' },
  dark: { followed: '#12241A', mostly: '#272013', missed: '#171C22' },
};

/**
 * The success screen after a check-in: Tunas jumps, the numbers count up, the growth bar
 * fills. A missed day gets a calm grey version with no confetti and no red.
 */
export function Celebrate({ spec, onClosed }: { spec: CelebrationSpec; onClosed: () => void }) {
  const { dark } = useTheme();
  const bg = (dark ? BG.dark : BG.light)[spec.status];
  return (
    <Sheet full fullBackground={bg} label="Check-in saved" onClosed={onClosed} onDismiss={() => afterClose(spec)}>
      <Body spec={spec} />
    </Sheet>
  );
}

function afterClose(spec: CelebrationSpec) {
  const s = spec.status;
  ui.tunas({ anim: s === 'followed' ? 'jump' : s === 'mostly' ? 'nod' : undefined, line: pickLineFor(s, spec.key + s) });
}

function Body({ spec }: { spec: CelebrationSpec }) {
  const { c } = useTheme();
  const sheet = useSheet();
  const data = useActive();
  const reduce = useReducedMotion();
  const { width } = useWindowDimensions();
  const [burst, setBurst] = useState(0);
  const now = new Date();
  const s = spec.status;
  const good = countGood(data.log);
  const st = streak(data, now);
  const gr = growth(good);
  const stage = STAGES[gr.stage];
  const streakShown = useCountUp(spec.before.streak, st.cur);
  const goodShown = useCountUp(spec.before.good, good);

  useEffect(() => {
    if (s === 'followed' || spec.grew || spec.flowered) {
      const t = setTimeout(() => setBurst(1), 280);
      return () => clearTimeout(t);
    }
  }, [s, spec.grew, spec.flowered]);

  const title = spec.grew
    ? `Tunas grew into a ${stage.name.toLowerCase()}!`
    : spec.flowered
      ? 'A perfect week!'
      : s === 'followed'
        ? pick(['Great job!', 'Nailed it!', 'Mantap!'], spec.key)
        : s === 'mostly'
          ? 'Mostly counts!'
          : 'That’s okay';
  const sub = spec.flowered
    ? 'Seven good days in a row. A flower bloomed in your garden.'
    : s === 'followed'
      ? spec.bestStreak
        ? 'That’s your best streak yet.'
        : 'Another good day for you and Tunas.'
      : s === 'mostly'
        ? 'Not perfect, still a good day. Tunas grew a little.'
        : st.forgiven[spec.key]
          ? 'A free miss kept your streak safe. Tomorrow is a fresh start.'
          : 'One day doesn’t undo the rest. Tomorrow is a fresh start.';

  const done = () => {
    afterClose(spec);
    sheet.close();
  };
  const enter = (i: number) => (reduce ? undefined : FadeInDown.delay(120 + i * 90).duration(380));

  return (
    <View style={{ flex: 1, justifyContent: 'space-between', gap: 22 }}>
      <View style={{ alignItems: 'center', gap: 14, paddingTop: 12 }}>
        <Tunas
          stage={gr.stage}
          mood={s === 'missed' ? 'missed' : s === 'mostly' ? 'mostly' : 'followed'}
          outfit={data.outfit}
          size={Math.min(200, width * 0.5)}
          action={s === 'missed' ? null : { kind: 'jump', id: 1 }}
        />
        <Animated.View entering={enter(0)} style={{ alignItems: 'center', gap: 6 }}>
          <Txt v="display" center accessibilityRole="header" style={{ fontSize: 34, lineHeight: 40 }}>
            {title}
          </Txt>
          <Txt v="body" tone="ink2" center style={{ maxWidth: 320 }}>
            {sub}
          </Txt>
        </Animated.View>

        <Animated.View entering={enter(1)} style={{ flexDirection: 'row', gap: 12, alignSelf: 'stretch' }}>
          <Stat icon="flame" color={c.flame} value={streakShown} label="day streak" a11y={`${plural(st.cur, 'day')} streak`} />
          {s === 'missed' ? (
            <Stat
              icon="shield"
              color={c.forgiven}
              value={st.tokens}
              label={st.tokens === 1 ? 'free miss left' : 'free misses left'}
              a11y={`${plural(st.tokens, 'free miss', 'free misses')} left`}
            />
          ) : (
            <Stat
              icon="sprout"
              color={c.followed}
              value={goodShown}
              label={good === 1 ? 'good day' : 'good days'}
              a11y={plural(good, 'good day')}
            />
          )}
        </Animated.View>

        <Animated.View
          entering={enter(2)}
          style={{ alignSelf: 'stretch', padding: 16, borderRadius: RADIUS.card, backgroundColor: c.surface, gap: 10 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Txt v="bodyBold">{stage.label}</Txt>
            <Txt v="calloutBold" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>
              {gr.nextAt ? `${good} / ${gr.nextAt}` : plural(good, 'good day')}
            </Txt>
          </View>
          <ProgressBar value={gr.progress} height={12} label="Growth toward the next stage" />
          {gr.nextAt ? (
            <Txt v="footnote" tone="ink2">
              {plural(gr.toNext, 'more good day')} until Tunas can {stage.next}.
            </Txt>
          ) : null}
        </Animated.View>

        {s !== 'followed' ? (
          <Animated.View entering={enter(3)} style={{ alignSelf: 'stretch', gap: 10 }}>
            <Txt v="calloutBold" tone="ink2">
              What tripped you up? Optional, but it helps you spot patterns.
            </Txt>
            <SlipChips value={data.slips[spec.key]} onPick={(id) => store.toggleSlip(spec.key, id)} />
          </Animated.View>
        ) : null}
      </View>

      <Button title="Continue" onPress={done} />
      <Confetti burst={burst} x={width / 2 - 22} y={140} count={spec.grew || spec.flowered ? 80 : 56} />
    </View>
  );
}

function Stat({
  icon,
  color,
  value,
  label,
  a11y,
}: {
  icon: 'flame' | 'shield' | 'sprout';
  color: string;
  value: number;
  label: string;
  a11y: string;
}) {
  const { c } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={a11y}
      style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.card, backgroundColor: c.surface, gap: 2 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name={icon} size={24} color={color} />
        <Txt v="stat">{value}</Txt>
      </View>
      <Txt v="footnote" tone="ink2">
        {label}
      </Txt>
    </View>
  );
}
