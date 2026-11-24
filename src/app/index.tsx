import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { Pressy, Txt } from '@/components/ui';
import { DOW, formatLong, fromKey, isEvening, keyOf, startOfDay } from '@/domain/dates';
import { baseMood, greeting, plural, tunasLine } from '@/domain/lines';
import { suggestion } from '@/domain/rules';
import { growth } from '@/domain/stage';
import { countGood } from '@/domain/state';
import { activeKey, missingDay, streak, weighDue } from '@/domain/streak';
import type { Status } from '@/domain/types';
import { CheckInCard, Nudge, PlanCard, WeekStrip } from '@/features/today/cards';
import { Hero } from '@/features/today/Hero';
import { useNow } from '@/lib/useNow';
import { store, useActive } from '@/store/data';
import { answerDay } from '@/store/flows';
import { ui } from '@/store/ui';
import { RADIUS, useTheme } from '@/theme';

export default function TodayScreen() {
  const data = useActive();
  const now = useNow();
  const { c } = useTheme();
  const [changing, setChanging] = useState(false);

  const ak = activeKey(data, now);
  const late = ak !== keyOf(startOfDay(now));
  const st = useMemo(() => streak(data, now), [data, now]);
  const good = countGood(data.log);
  const gr = growth(good);
  const evening = isEvening(now);
  const missing = missingDay(data, now);
  const weigh = weighDue(data, now);

  const answer = (s: Status) => {
    setChanging(false);
    answerDay(ak, s, { celebrate: true });
  };

  const sug = suggestion(data, ak);
  const hint = late
    ? `It’s after midnight, so this counts for ${DOW[fromKey(ak).getDay()]}.`
    : changing
      ? 'Pick the answer that fits best.'
      : sug === 'followed'
        ? 'Every rule ticked. Sounds like a Followed day!'
        : sug === 'mostly'
          ? 'Most rules ticked. Mostly still counts.'
          : evening
            ? 'One tap is all it takes.'
            : 'Done eating for the day? You can answer now.';

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Txt v="calloutBold" tone="ink2">
            {formatLong(now)}
          </Txt>
          <Txt v="display" accessibilityRole="header">
            {greeting(now)}
          </Txt>
        </View>
        <Pressy
          label={`${plural(st.cur, 'day')} streak. Show streak details`}
          onPress={() => ui.open({ kind: 'streak' })}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            height: 44,
            paddingHorizontal: 14,
            borderRadius: RADIUS.pill,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.line,
          }}
        >
          <Icon name="flame" size={20} color={st.cur ? c.flame : c.ink3} />
          <Txt v="headline" style={{ fontVariant: ['tabular-nums'] }}>
            {st.cur}
          </Txt>
        </Pressy>
      </View>

      <Hero stage={gr.stage} mood={baseMood(data, now)} outfit={data.outfit} line={tunasLine(data, now)} growth={gr} now={now} />

      <CheckInCard
        data={data}
        dayKey={ak}
        late={late}
        evening={evening}
        st={st}
        changing={changing}
        setChanging={setChanging}
        onAnswer={answer}
        hint={hint}
      />

      {missing ? (
        <Nudge
          icon="calendar"
          tint={c.mostlyText}
          title={`No answer for ${DOW[missing.getDay()]}`}
          sub="Fill it in so your streak stays fair."
          action="Answer now"
          onAction={() => ui.open({ kind: 'day', key: keyOf(missing) })}
        />
      ) : null}

      <WeekStrip data={data} now={now} st={st} />
      <PlanCard data={data} dayKey={ak} late={late} now={now} />

      {weigh.due ? (
        <Nudge
          icon="scale"
          title={weigh.first ? 'Track your weight too?' : 'Weekly weigh-in'}
          sub={weigh.first ? 'Optional. Once a week is enough.' : 'Best in the morning, before breakfast.'}
          action="Log weight"
          onAction={() => ui.open({ kind: 'weight' })}
          onDismiss={() => {
            store.snoozeWeigh(now);
            ui.toast('Okay, maybe later');
          }}
        />
      ) : null}
    </Screen>
  );
}
