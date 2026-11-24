import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Island } from '@/components/garden/Island';
import { Screen } from '@/components/Screen';
import { Button, Card, IconButton, Segmented, Txt } from '@/components/ui';
import { MONTHS, keyOf, mondayOf } from '@/domain/dates';
import { firstMonth, monthGarden, patterns, perfectWeeks } from '@/domain/garden';
import { plural } from '@/domain/lines';
import { recapTarget } from '@/domain/recap';
import { stageOf } from '@/domain/stage';
import { countGood } from '@/domain/state';
import { streak, weekInfo } from '@/domain/streak';
import { Journey, Legend, MonthCalendar, PatternsCard, Wardrobe } from '@/features/garden/parts';
import { useNow } from '@/lib/useNow';
import { useActive } from '@/store/data';
import { ui } from '@/store/ui';
import { useTheme } from '@/theme';

export default function GardenScreen() {
  const data = useActive();
  const now = useNow();
  const { dark, c } = useTheme();
  const [view, setView] = useState<'garden' | 'calendar'>('garden');
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [width, setWidth] = useState(0);

  // Screen reader users get the calendar, where every day is its own button.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    AccessibilityInfo.isScreenReaderEnabled().then((on) => on && setView('calendar'));
  }, []);

  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lo = firstMonth(data, now);
  const shown = month > thisMonth ? thisMonth : month < lo ? lo : month;
  const st = useMemo(() => streak(data, now), [data, now]);
  const garden = useMemo(() => monthGarden(data, shown.getFullYear(), shown.getMonth(), now, st), [data, shown, now, st]);
  const pats = useMemo(() => patterns(data, now), [data, now]);
  const good = countGood(data.log);
  const flowers = perfectWeeks(data, now);
  const stage = stageOf(good);
  const canPrev = shown > lo;
  const canNext = shown < thisMonth;
  const title = MONTHS[shown.getMonth()] + (shown.getFullYear() !== now.getFullYear() ? ` ${shown.getFullYear()}` : '');

  const openRecap = () => {
    const m = recapTarget(now);
    ui.open({ kind: 'recap', mon: keyOf(weekInfo(data, m).answered ? m : mondayOf(now)), auto: false });
  };
  const openDay = (key: string) => ui.open({ kind: 'day', key });

  return (
    <Screen title="Garden" action={<Button small kind="secondary" icon="calendar" title="Weekly recap" onPress={openRecap} />}>
      <Txt v="callout" tone="ink2" style={{ marginTop: -10 }}>
        {good
          ? `${plural(good, 'good day')} so far${flowers ? `, ${plural(flowers, 'perfect week')}` : ''}.`
          : 'Every good day plants something here.'}
      </Txt>

      <Card style={{ paddingHorizontal: 14, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton
            icon="chevron-left"
            label="Previous month"
            onPress={() => canPrev && setMonth(new Date(shown.getFullYear(), shown.getMonth() - 1, 1))}
            bg={canPrev ? c.surface2 : 'transparent'}
            tint={canPrev ? c.ink : c.surface3}
          />
          <Txt v="title" accessibilityRole="header" accessibilityLiveRegion="polite">
            {title}
          </Txt>
          <IconButton
            icon="chevron-right"
            label="Next month"
            onPress={() => canNext && setMonth(new Date(shown.getFullYear(), shown.getMonth() + 1, 1))}
            bg={canNext ? c.surface2 : 'transparent'}
            tint={canNext ? c.ink : c.surface3}
          />
        </View>

        <Segmented
          label="Show the month as"
          value={view}
          onChange={setView}
          options={[
            { id: 'garden', label: 'Garden' },
            { id: 'calendar', label: 'Calendar' },
          ]}
        />

        <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {view === 'garden' ? (
            width ? (
              <Animated.View key={keyOf(shown)} entering={FadeIn.duration(300)}>
                <Island garden={garden} width={width} dark={dark} onPressDay={openDay} />
              </Animated.View>
            ) : null
          ) : (
            <MonthCalendar garden={garden} onPressDay={openDay} />
          )}
        </View>

        <Legend garden={garden} />
        <Txt v="footnote" tone="ink3" center>
          {view === 'garden'
            ? 'Good days grow a plant. A perfect week blossoms. A free miss leaves a resting stone. Tap a day to change it.'
            : 'Tap a day to see or change it.'}
        </Txt>
      </Card>

      <Journey good={good} stage={stage} outfit={data.outfit} />
      <Wardrobe good={good} current={data.outfit} />
      <PatternsCard p={pats} />
    </Screen>
  );
}
