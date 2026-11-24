import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Button, Card, Pressy, ProgressBar, SectionTitle, Segmented, Txt } from '@/components/ui';
import { daysBetween, formatShort, formatShortDay, fromKey, keyOf } from '@/domain/dates';
import { deltaTone, formatKg, formatSigned, goalProgress, projectGoal, slope, trendSeries } from '@/domain/weight';
import { WeightChart, type Range } from '@/features/weight/WeightChart';
import { useNow } from '@/lib/useNow';
import { useActive } from '@/store/data';
import { ui } from '@/store/ui';
import { RADIUS, useTheme } from '@/theme';

export default function WeightScreen() {
  const data = useActive();
  const now = useNow();
  const { c } = useTheme();
  const [range, setRange] = useState<Range>('3m');
  const [all, setAll] = useState(false);
  const [width, setWidth] = useState(0);
  const ws = data.weights;
  const series = useMemo(() => trendSeries(ws), [ws]);
  const loggedToday = ws.length > 0 && ws[ws.length - 1].d === keyOf(now);

  const logButton = (
    <Button
      small
      icon="plus"
      title={loggedToday ? 'Update' : 'Log'}
      label={loggedToday ? 'Update today’s weight' : 'Log weight'}
      onPress={() => ui.open({ kind: 'weight' })}
    />
  );

  if (!ws.length) {
    return (
      <Screen title="Weight" action={logButton}>
        <Card style={{ alignItems: 'center', paddingVertical: 30, gap: 10 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              backgroundColor: c.brandSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            <Icon name="scale" size={32} color={c.brandText} />
          </View>
          <Txt v="title" center>
            Start your trend
          </Txt>
          <Txt v="callout" tone="ink2" center style={{ maxWidth: 300 }}>
            Optional, and once a week is plenty. After two weigh-ins a trend line appears here, smoothed so one salty dinner doesn’t look
            like a setback.
          </Txt>
          <Button
            title="Log your first weigh-in"
            onPress={() => ui.open({ kind: 'weight' })}
            style={{ alignSelf: 'stretch', marginTop: 8 }}
          />
        </Card>
        <GoalCard />
      </Screen>
    );
  }

  const last = series[series.length - 1];
  const first = ws[0];
  const spanDays = daysBetween(fromKey(first.d), fromKey(last.d));
  const delta = last.tr - first.kg;
  const sl = slope(series, 42);
  const tone = deltaTone(delta, data.goal, first.kg);
  const toneColor = tone === 'good' ? c.followedText : tone === 'away' ? c.mostlyText : c.ink2;
  const rev = [...ws].reverse();
  const shown = all ? rev : rev.slice(0, 6);

  return (
    <Screen title="Weight" action={logButton}>
      <Card style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <View>
            <Txt v="label" tone="ink2">
              {ws.length > 1 ? 'Trend weight' : 'Weight'}
            </Txt>
            <Txt v="number" accessibilityLabel={`${formatKg(ws.length > 1 ? last.tr : last.kg)} kilograms`}>
              {formatKg(ws.length > 1 ? last.tr : last.kg)}
              <Txt v="headline" tone="ink2">
                {' '}
                kg
              </Txt>
            </Txt>
          </View>
          {ws.length > 1 && spanDays > 31 ? (
            <View style={{ width: 150, marginTop: 4 }}>
              <Segmented
                label="Chart range"
                value={range}
                onChange={setRange}
                options={[
                  { id: '1m', label: '1M', a11y: 'Last month' },
                  { id: '3m', label: '3M', a11y: 'Last three months' },
                  { id: 'all', label: 'All', a11y: 'All time' },
                ]}
              />
            </View>
          ) : null}
        </View>
        <Txt v="callout" tone="ink2">
          {ws.length === 1 ? (
            'Your first weigh-in. Log again next week to start a trend.'
          ) : (
            <>
              <Txt v="calloutBold" color={toneColor}>
                {formatSigned(delta)} kg
              </Txt>{' '}
              since {formatShort(fromKey(first.d))}
              {sl != null && Math.abs(sl * 7) >= 0.05 ? `, about ${formatKg(Math.abs(sl * 7))} kg a week` : ''}.
            </>
          )}
        </Txt>
        {ws.length > 1 ? (
          <View style={{ marginTop: 10 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
            {width ? (
              <WeightChart series={series} goal={data.goal} range={range} width={width} now={now} />
            ) : (
              <View style={{ height: 224 }} />
            )}
          </View>
        ) : null}
      </Card>

      <GoalCard />

      <Card>
        <SectionTitle title="History" aside={`${ws.length} weigh-ins`} />
        {shown.map((e, i) => {
          const prev = rev[(all ? i : i) + 1];
          const diff = prev ? e.kg - prev.kg : null;
          const label = `${formatShortDay(fromKey(e.d))}: ${formatKg(e.kg)} kilograms${diff == null ? '' : Math.abs(diff) < 0.05 ? ', no change' : diff < 0 ? `, down ${formatKg(-diff)}` : `, up ${formatKg(diff)}`}. Edit`;
          return (
            <Pressy
              key={e.d}
              label={label}
              squash={0.985}
              onPress={() => ui.open({ kind: 'weight', date: e.d })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                minHeight: 50,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: c.line,
                gap: 12,
              }}
            >
              <Txt v="body" style={{ flex: 1 }}>
                {formatShortDay(fromKey(e.d))}
              </Txt>
              {diff != null && Math.abs(diff) >= 0.05 ? (
                <Txt v="calloutBold" color={diff < 0 ? c.followedText : c.ink2} style={{ fontVariant: ['tabular-nums'] }}>
                  {formatSigned(diff)}
                </Txt>
              ) : null}
              <Txt v="bodyBold" style={{ fontVariant: ['tabular-nums'], minWidth: 68, textAlign: 'right' }}>
                {formatKg(e.kg)} kg
              </Txt>
            </Pressy>
          );
        })}
        {rev.length > 6 ? (
          <Button
            kind="quiet"
            small
            title={all ? 'Show fewer' : `Show all ${rev.length}`}
            onPress={() => setAll(!all)}
            style={{ marginTop: 6 }}
          />
        ) : null}
      </Card>
    </Screen>
  );
}

function GoalCard() {
  const data = useActive();
  const now = useNow();
  const { c } = useTheme();
  const ws = data.weights;
  const series = useMemo(() => trendSeries(ws), [ws]);
  if (data.goal == null) {
    return (
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt v="headline">Goal</Txt>
          <Button small kind="quiet" title="Set a goal" onPress={() => ui.open({ kind: 'goal' })} />
        </View>
        <Txt v="callout" tone="ink2">
          Optional. A goal adds a progress bar and a rough idea of when you’ll get there.
        </Txt>
      </Card>
    );
  }
  const g = goalProgress(ws, series, data.goal);
  const eta = projectGoal(series, data.goal, now);
  const note = !ws.length
    ? 'Log a weigh-in to start tracking toward it.'
    : g.reached
      ? 'You reached your goal! Keep the habit going, or set a new one.'
      : eta
        ? `At your recent pace you’d get there around ${eta}.`
        : ws.length < 3
          ? 'A few more weigh-ins and an estimate appears here.'
          : 'No estimate while the trend is flat or moving the other way. That’s normal from week to week.';
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt v="headline">Goal {formatKg(data.goal)} kg</Txt>
        <Button small kind="quiet" title="Edit" label="Edit goal" onPress={() => ui.open({ kind: 'goal' })} />
      </View>
      <ProgressBar value={g.progress} height={10} color={c.mostly} label="Progress to goal" />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt v="footnote" tone="ink2">
          {ws.length ? `Start ${formatKg(g.startKg)} kg` : 'No weigh-ins yet'}
        </Txt>
        <Txt v="label" tone="ink2">
          {ws.length ? (g.reached ? 'Goal reached' : `${formatKg(g.left)} kg to go`) : ''}
        </Txt>
      </View>
      <View style={{ padding: 12, borderRadius: RADIUS.control, backgroundColor: c.surface2 }}>
        <Txt v="callout" tone="ink2">
          {note}
        </Txt>
      </View>
    </Card>
  );
}
