import { ScrollView, View } from 'react-native';

import { cellLabel } from '@/components/garden/Island';
import { Icon } from '@/components/Icon';
import { StatusDisc } from '@/components/StatusDisc';
import { TunasStill } from '@/components/tunas/Tunas';
import { Button, Card, Pressy, SectionTitle, Txt } from '@/components/ui';
import { OUTFITS, STAGES, slipOf } from '@/domain/content';
import { WEEK_LETTERS } from '@/domain/dates';
import { PATTERN_MIN, weekdayName, type MonthGarden, type Patterns } from '@/domain/garden';
import { plural } from '@/domain/lines';
import type { DayKey, OutfitId } from '@/domain/types';
import { addRule } from '@/features/plan/ruleActions';
import { store } from '@/store/data';
import { ui } from '@/store/ui';
import { RADIUS, useTheme } from '@/theme';

/* ---------- Calendar view of the month ---------- */

export function MonthCalendar({ garden, onPressDay }: { garden: MonthGarden; onPressDay: (k: DayKey) => void }) {
  const { c } = useTheme();
  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {WEEK_LETTERS.map((l, i) => (
          <Txt key={i} v="label" tone="ink3" center style={{ flex: 1 }} accessibilityElementsHidden importantForAccessibility="no">
            {l}
          </Txt>
        ))}
      </View>
      {Array.from({ length: garden.rows }, (_, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {garden.cells.slice(r * 7, r * 7 + 7).map((cell) => (
            <View key={cell.key} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
              {cell.inMonth ? (
                <Pressy
                  disabled={cell.future}
                  label={cellLabel(cell)}
                  onPress={() => onPressDay(cell.key)}
                  style={{ alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}
                >
                  {cell.status ? (
                    <StatusDisc status={cell.status} forgiven={cell.forgiven} size={38} />
                  ) : (
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: cell.future ? 'transparent' : c.surface2,
                        borderWidth: cell.today ? 2 : 0,
                        borderColor: c.brandText,
                        borderStyle: 'dashed',
                      }}
                    >
                      <Txt v="calloutBold" tone={cell.future ? 'ink3' : 'ink2'}>
                        {cell.date.getDate()}
                      </Txt>
                    </View>
                  )}
                  {cell.hasNote ? (
                    <View
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: c.ink2,
                        borderWidth: 1.5,
                        borderColor: c.surface,
                      }}
                    />
                  ) : null}
                </Pressy>
              ) : (
                <View style={{ width: 44, height: 44 }} />
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/* ---------- Legend with this month's counts ---------- */

export function Legend({ garden }: { garden: MonthGarden }) {
  const { counts } = garden;
  const total = counts.followed + counts.mostly + counts.missed;
  if (!total) {
    return (
      <Txt v="callout" tone="ink2" center>
        No check-ins this month yet. Tap a past day to fill it in.
      </Txt>
    );
  }
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', columnGap: 18, rowGap: 8 }}>
      {(['followed', 'mostly', 'missed'] as const).map((s) => (
        <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <StatusDisc status={s} size={20} />
          <Txt v="calloutBold">
            {counts[s]}{' '}
            <Txt v="callout" tone="ink2">
              {s}
            </Txt>
          </Txt>
        </View>
      ))}
    </View>
  );
}

/* ---------- Tunas's journey through the stages ---------- */

export function Journey({ good, stage, outfit }: { good: number; stage: number; outfit: OutfitId | null }) {
  const { c } = useTheme();
  const next = STAGES[stage + 1];
  return (
    <Card>
      <SectionTitle title="Tunas’s journey" aside={plural(good, 'good day')} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {STAGES.map((s, i) => {
          const reached = i <= stage;
          const current = i === stage;
          return (
            <View
              key={s.name}
              accessible
              accessibilityLabel={`${s.name}, at ${plural(s.at, 'good day')}. ${current ? 'Tunas is here now.' : reached ? 'Reached.' : 'Not yet.'}`}
              style={{
                alignItems: 'center',
                flex: 1,
                paddingVertical: 8,
                borderRadius: RADIUS.tile,
                backgroundColor: current ? c.brandSoft : 'transparent',
              }}
            >
              <View style={{ opacity: reached ? 1 : 0.3 }}>
                <TunasStill stage={i} mood={current ? 'followed' : 'none'} outfit={current ? outfit : null} size={54} />
              </View>
              <Txt
                v="label"
                tone={current ? 'brand' : reached ? 'ink' : 'ink3'}
                center
                numberOfLines={2}
                style={{ fontSize: 12, marginTop: 4 }}
              >
                {s.name}
              </Txt>
              <Txt v="footnote" tone="ink3" style={{ fontSize: 11, lineHeight: 14 }}>
                {s.at === 0 ? 'Start' : plural(s.at, 'day')}
              </Txt>
            </View>
          );
        })}
      </View>
      <Txt v="callout" tone="ink2" style={{ marginTop: 12 }}>
        {next
          ? `${plural(next.at - good, 'more good day')} until Tunas can ${STAGES[stage].next}.`
          : 'Tunas is fully grown. Every good day keeps it thriving.'}
      </Txt>
    </Card>
  );
}

/* ---------- Wardrobe ---------- */

export function Wardrobe({ good, current }: { good: number; current: OutfitId | null }) {
  const { c } = useTheme();
  const unlocked = OUTFITS.filter((o) => good >= o.at).length;
  const items = [{ id: null, name: 'Nothing', at: 0 } as { id: OutfitId | null; name: string; at: number }, ...OUTFITS];
  return (
    <Card style={{ paddingHorizontal: 0 }}>
      <View style={{ paddingHorizontal: 18 }}>
        <SectionTitle title="Wardrobe" aside={`${unlocked} of ${OUTFITS.length}`} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 18 }}>
        {items.map((o) => {
          const locked = good < o.at;
          const on = current === o.id;
          return (
            <Pressy
              key={o.id ?? 'none'}
              label={`${o.name}${locked ? `, unlocks at ${o.at} good days` : on ? ', wearing' : ''}`}
              state={{ selected: on, disabled: locked }}
              onPress={() => {
                if (locked) {
                  ui.toast(`${plural(o.at - good, 'more good day')} to unlock`);
                  return;
                }
                store.wear(o.id);
              }}
              style={{
                width: 108,
                alignItems: 'center',
                paddingTop: 8,
                paddingBottom: 12,
                borderRadius: RADIUS.tile,
                backgroundColor: on ? c.brandSoft : c.surface2,
                borderWidth: 2,
                borderColor: on ? c.brandText : 'transparent',
              }}
            >
              <View style={{ opacity: locked ? 0.35 : 1 }}>
                <TunasStill stage={2} mood="none" outfit={o.id} size={80} />
              </View>
              <Txt v="label" center numberOfLines={1}>
                {o.name}
              </Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                {locked ? <Icon name="lock" size={12} color={c.ink3} /> : null}
                <Txt v="footnote" tone={on ? 'brand' : 'ink3'} style={{ fontSize: 12 }}>
                  {locked ? `At ${o.at} days` : on ? 'Wearing' : 'Tap to wear'}
                </Txt>
              </View>
            </Pressy>
          );
        })}
      </ScrollView>
    </Card>
  );
}

/* ---------- Weekday patterns ---------- */

export function PatternsCard({ p }: { p: Patterns }) {
  const { c } = useTheme();
  if (p.answered < PATTERN_MIN) {
    return (
      <Card>
        <SectionTitle title="Patterns" />
        <Txt v="callout" tone="ink2">
          Your best and hardest days of the week show up here after two weeks of check-ins.{' '}
          {plural(PATTERN_MIN - p.answered, 'more check-in')} to go.
        </Txt>
      </Card>
    );
  }
  const slip = slipOf(p.topSlip);
  const summary = p.pct.map((x, i) => `${weekdayName(i)} ${x == null ? 'no data' : x + '%'}`).join(', ');
  return (
    <Card>
      <SectionTitle title="Patterns" aside="Last 8 weeks" />
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Share of good days by weekday: ${summary}`}
        style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 120 }}
      >
        {p.pct.map((x, i) => {
          const best = i === p.bestDay && !p.even;
          const hard = i === p.hardDay && !p.even;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <Txt v="label" tone={best ? 'brand' : 'ink3'} style={{ fontSize: 11, fontVariant: ['tabular-nums'] }}>
                {x == null ? '' : `${x}%`}
              </Txt>
              <View
                style={{
                  width: '100%',
                  maxWidth: 30,
                  height: x == null ? 6 : Math.max(8, Math.round(x * 0.7)),
                  borderRadius: 8,
                  backgroundColor: best ? c.followed : hard ? c.mostly : c.surface3,
                }}
              />
              <Txt v="label" tone="ink2">
                {WEEK_LETTERS[i]}
              </Txt>
            </View>
          );
        })}
      </View>
      {p.bestDay != null ? (
        <Txt v="callout" tone="ink2" style={{ marginTop: 14 }}>
          {p.even ? (
            'Every day of the week is going about the same. That’s real consistency.'
          ) : (
            <>
              Your best day is <Txt v="calloutBold">{weekdayName(p.bestDay)}</Txt>. <Txt v="calloutBold">{weekdayName(p.hardDay ?? 0)}</Txt>{' '}
              is the hardest: {p.hardGood} of {p.hardAnswered} good.
            </>
          )}
        </Txt>
      ) : null}
      {slip ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 14,
            padding: 12,
            borderRadius: RADIUS.tile,
            backgroundColor: c.surface2,
          }}
        >
          <View
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name={slip.icon} size={20} color={c.ink2} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="calloutBold">Top slip: {slip.label.toLowerCase()}</Txt>
            <Txt v="footnote" tone="ink2">
              {plural(p.topSlipCount, 'time')} in 8 weeks{p.fix ? `. Try “${p.fix}”.` : '.'}
            </Txt>
          </View>
          {p.fix ? (
            <Button
              small
              title="Add rule"
              label={`Add rule: ${p.fix}`}
              onPress={() => {
                addRule(p.fix!);
              }}
            />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
