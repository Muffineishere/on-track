import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { StatusDisc, useStatusColors } from '@/components/StatusDisc';
import { TunasStill } from '@/components/tunas/Tunas';
import { Button, Card, IconButton, Pressy, SectionTitle, Txt } from '@/components/ui';
import { STATUSES, STATUS_LABEL, slipOf } from '@/domain/content';
import { DOW, WEEK_LETTERS, addDays, formatLong, fromKey, keyOf, mondayOf, startOfDay } from '@/domain/dates';
import { cutoffInfo, ruleCutoff } from '@/domain/rules';
import { rulesFor } from '@/domain/state';
import type { StreakResult } from '@/domain/streak';
import type { Data, DayKey, Status } from '@/domain/types';
import { haptic } from '@/lib/haptics';
import { store } from '@/store/data';
import { ui } from '@/store/ui';
import { RADIUS, useTheme } from '@/theme';

import { pickLineFor } from './lineFor';

/* ---------- The three big answers ---------- */

export function AnswerTiles({ current, onAnswer }: { current?: Status | null; onAnswer: (s: Status) => void }) {
  const sc = useStatusColors();
  return (
    <View style={{ flexDirection: 'row', gap: 10 }} accessibilityRole="radiogroup">
      {STATUSES.map((s) => {
        const on = current === s;
        return (
          <Pressy
            key={s}
            role="radio"
            label={STATUS_LABEL[s]}
            state={{ checked: on, selected: on }}
            feedback="none"
            squash={0.94}
            onPress={() => onAnswer(s)}
            style={{
              flex: 1,
              minHeight: 128,
              paddingTop: 6,
              paddingBottom: 12,
              borderRadius: RADIUS.tile + 4,
              backgroundColor: sc[s].soft,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              borderWidth: 2.5,
              borderColor: on ? sc[s].fill : 'transparent',
            }}
          >
            {/* Tunas's face says the answer: beaming, content, or sleepy. The same faces are on the home screen widget. */}
            <TunasStill stage={1} mood={s} outfit={null} size={80} />
            <Txt v="bodyBold" color={on ? sc[s].text : undefined}>
              {STATUS_LABEL[s]}
            </Txt>
          </Pressy>
        );
      })}
    </View>
  );
}

/* ---------- Check-in card ---------- */

export function CheckInCard({
  data,
  dayKey,
  late,
  evening,
  st,
  changing,
  setChanging,
  onAnswer,
  hint,
}: {
  data: Data;
  dayKey: DayKey;
  late: boolean;
  evening: boolean;
  st: StreakResult;
  changing: boolean;
  setChanging: (v: boolean) => void;
  onAnswer: (s: Status) => void;
  hint: string;
}) {
  const s = data.log[dayKey];
  const dayName = DOW[fromKey(dayKey).getDay()];

  if (!s || changing) {
    const head = late ? `How did ${dayName} go?` : evening ? 'How did today go?' : 'Check in tonight';
    return (
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Txt v="title" accessibilityRole="header">
            {head}
          </Txt>
          {changing ? <Button small kind="quiet" title="Cancel" onPress={() => setChanging(false)} /> : null}
        </View>
        <Txt v="callout" tone="ink2" style={{ marginBottom: 16 }}>
          {hint}
        </Txt>
        <AnswerTiles current={changing ? s : null} onAnswer={onAnswer} />
      </Card>
    );
  }

  const when = late ? ` on ${dayName}` : ' today';
  const title = s === 'followed' ? `Followed${when}` : s === 'mostly' ? 'Mostly on track' : `Off plan${when}`;
  const sub =
    s === 'followed'
      ? 'Tunas grew a little. Nice one!'
      : s === 'mostly'
        ? 'Mostly still counts. Tunas grew a little.'
        : st.forgiven[dayKey]
          ? 'A free miss kept your streak safe.'
          : 'Tomorrow is a fresh start.';
  const slip = slipOf(data.slips[dayKey]);
  const note = data.notes[dayKey];
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <StatusDisc status={s} forgiven={s === 'missed' && !!st.forgiven[dayKey]} size={52} />
        <View style={{ flex: 1 }}>
          <Txt v="headline">{title}</Txt>
          <Txt v="callout" tone="ink2">
            {sub}
          </Txt>
        </View>
        <Button small kind="secondary" title="Change" label="Change today’s answer" onPress={() => setChanging(true)} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {s !== 'followed' ? (
          <Tag
            icon={slip ? slip.icon : 'plus'}
            text={slip ? slip.label : 'What tripped you up?'}
            filled={!!slip}
            onPress={() => ui.open({ kind: 'day', key: dayKey })}
            label={slip ? `Tripped up by ${slip.label}. Edit` : 'Add what tripped you up'}
          />
        ) : null}
        <Tag
          icon="note"
          text={note ?? 'Add a note'}
          filled={!!note}
          onPress={() => ui.open({ kind: 'day', key: dayKey, focusNote: true })}
          label={note ? `Note: ${note}. Edit` : 'Add a note'}
        />
      </View>
    </Card>
  );
}

function Tag({
  icon,
  text,
  filled,
  onPress,
  label,
}: {
  icon: IconName;
  text: string;
  filled: boolean;
  onPress: () => void;
  label: string;
}) {
  const { c } = useTheme();
  return (
    <Pressy
      onPress={onPress}
      label={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        minHeight: 44,
        maxWidth: '100%',
        paddingHorizontal: 12,
        borderRadius: RADIUS.pill,
        backgroundColor: filled ? c.surface2 : 'transparent',
        borderWidth: filled ? 0 : 1.5,
        borderColor: c.line,
        borderStyle: filled ? 'solid' : 'dashed',
      }}
    >
      <Icon name={icon} size={17} color={c.ink2} />
      <Txt v="calloutBold" tone={filled ? 'ink' : 'ink2'} numberOfLines={1} style={{ flexShrink: 1 }}>
        {text}
      </Txt>
    </Pressy>
  );
}

/* ---------- Week strip ---------- */

export function WeekStrip({ data, now, st }: { data: Data; now: Date; st: StreakResult }) {
  const { c } = useTheme();
  const today = startOfDay(now);
  const mon = mondayOf(today);
  const tk = keyOf(today);
  let good = 0;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(mon, i);
    const k = keyOf(d);
    const s = data.log[k] ?? null;
    if (s === 'followed' || s === 'mostly') good++;
    return { d, k, s, future: d > today, today: k === tk, forgiven: s === 'missed' && !!st.forgiven[k] };
  });
  return (
    <Card>
      <SectionTitle title="This week" aside={`${good} of 7 good`} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {days.map((x, i) => {
          const label = `${formatLong(x.d)}${x.s ? `, ${STATUS_LABEL[x.s]}${x.forgiven ? ', free miss used' : ''}` : x.future ? '' : ', no answer yet'}`;
          return (
            <Pressy
              key={x.k}
              disabled={x.future}
              label={label}
              onPress={() => ui.open({ kind: 'day', key: x.k })}
              style={{ alignItems: 'center', gap: 6, minWidth: 44, paddingVertical: 2 }}
            >
              <Txt v="label" tone={x.today ? 'brand' : 'ink3'}>
                {WEEK_LETTERS[i]}
              </Txt>
              {x.s ? (
                <StatusDisc status={x.s} forgiven={x.forgiven} size={38} />
              ) : (
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: x.future ? 'transparent' : c.surface2,
                    borderWidth: x.today ? 2 : 0,
                    borderColor: c.brandText,
                    borderStyle: 'dashed',
                  }}
                >
                  <Txt v="calloutBold" tone={x.future ? 'ink3' : 'ink2'}>
                    {x.d.getDate()}
                  </Txt>
                </View>
              )}
            </Pressy>
          );
        })}
      </View>
    </Card>
  );
}

/* ---------- Today's plan ---------- */

export function PlanCard({ data, dayKey, late, now }: { data: Data; dayKey: DayKey; late: boolean; now: Date }) {
  const { c } = useTheme();
  const list = rulesFor(data);
  const ticks = data.ticks[dayKey] ?? [];
  const title = late ? `${DOW[fromKey(dayKey).getDay()]}’s plan` : 'Today’s plan';
  if (!list.length) {
    return (
      <Card>
        <SectionTitle title={title} />
        <Txt v="callout" tone="ink2" style={{ marginBottom: 14 }}>
          No rules yet. Add a few simple ones and Tunas will check them with you each evening.
        </Txt>
        <Button title="Write your rules" icon="pencil" onPress={() => router.navigate('/plan')} />
      </Card>
    );
  }
  const kept = list.filter((x) => ticks.includes(x)).length;
  const all = kept === list.length;
  return (
    <Card>
      <SectionTitle title={title} aside={all ? 'All kept' : `${kept} of ${list.length}`} asideTone={all ? 'brand' : 'ink2'} />
      <View accessibilityRole="list">
        {list.map((rule, i) => {
          const on = ticks.includes(rule);
          const cut = late ? null : ruleCutoff(rule);
          const info = cut != null ? cutoffInfo(cut, now) : null;
          const toneBg = info?.tone === 'soon' ? c.mostlySoft : info?.tone === 'open' ? c.followedSoft : c.surface2;
          const toneFg = info?.tone === 'soon' ? c.mostlyText : info?.tone === 'open' ? c.followedText : c.ink2;
          return (
            <Pressy
              key={rule}
              role="checkbox"
              state={{ checked: on }}
              label={rule + (info ? `. ${info.text}` : '')}
              feedback="none"
              squash={0.985}
              onPress={() => {
                const done = store.toggleTick(dayKey, rule);
                if (done) {
                  haptic.success();
                  ui.tunas({ anim: 'boing', line: pickLineFor('ticked', dayKey), hearts: 3 });
                } else haptic.select();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 14,
                paddingVertical: 11,
                borderTopWidth: i ? 1 : 0,
                borderTopColor: c.line,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  marginTop: -1,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: on ? c.brand : 'transparent',
                  borderWidth: on ? 0 : 2,
                  borderColor: c.surface3,
                }}
              >
                {on ? <Icon name="check" size={17} color={c.onBrand} /> : null}
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Txt v="body" tone={on ? 'ink2' : 'ink'} style={on && { textDecorationLine: 'line-through', textDecorationColor: c.ink3 }}>
                  {rule}
                </Txt>
                {info ? (
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      paddingHorizontal: 9,
                      paddingVertical: 3,
                      borderRadius: RADIUS.pill,
                      backgroundColor: toneBg,
                    }}
                  >
                    <Icon name="clock" size={14} color={toneFg} />
                    <Txt v="label" color={toneFg}>
                      {info.text}
                    </Txt>
                  </View>
                ) : null}
              </View>
            </Pressy>
          );
        })}
      </View>
    </Card>
  );
}

/* ---------- Nudges ---------- */

export function Nudge({
  icon,
  tint,
  title,
  sub,
  action,
  onAction,
  onDismiss,
}: {
  icon: IconName;
  tint?: string;
  title: string;
  sub: string;
  action: string;
  onAction: () => void;
  onDismiss?: () => void;
}) {
  const { c } = useTheme();
  return (
    <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
      <View
        style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name={icon} size={22} color={tint ?? c.brandText} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt v="bodyBold">{title}</Txt>
        <Txt v="callout" tone="ink2">
          {sub}
        </Txt>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Button small title={action} onPress={onAction} />
        </View>
      </View>
      {onDismiss ? <IconButton icon="close" label="Not now" size={36} onPress={onDismiss} bg="transparent" tint={c.ink3} /> : null}
    </Card>
  );
}
