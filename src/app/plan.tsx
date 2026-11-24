import { useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { TunasStill } from '@/components/tunas/Tunas';
import { Button, Card, Chip, Pressy, Row, SectionTitle, Segmented, Txt } from '@/components/ui';
import { SUGGESTED_RULES } from '@/domain/content';
import { formatTime, parseClock } from '@/domain/dates';
import { planCutoff } from '@/domain/rules';
import { stageOf } from '@/domain/stage';
import { countGood, rulesFor } from '@/domain/state';
import type { ThemePref } from '@/domain/types';
import { DietList } from '@/features/plan/DietList';
import { WidgetsCard } from '@/features/plan/WidgetsCard';
import { addRule, removeRule, switchDiet } from '@/features/plan/ruleActions';
import { remindersSupported } from '@/lib/reminders';
import { store, useActive, useIsDemo } from '@/store/data';
import { ui } from '@/store/ui';
import { RADIUS, useTheme } from '@/theme';

export default function PlanScreen() {
  const data = useActive();
  const demo = useIsDemo();
  const { c } = useTheme();
  const [editing, setEditing] = useState(false);
  const list = rulesFor(data);
  const cutoff = planCutoff(list);
  const have = list.map((x) => x.toLowerCase());
  const sugg = SUGGESTED_RULES.filter((x) => !have.includes(x.toLowerCase())).slice(0, 6);
  const isEditing = editing && list.length > 0;

  const tip = isEditing
    ? 'Tap a rule to reword it, or the minus to remove it.'
    : !list.length
      ? 'Add a few simple rules and I’ll check them with you each evening.'
      : cutoff != null
        ? `Tick rules off on Today as you go. I’ll count down to ${formatTime(cutoff)} for you.`
        : 'Tick rules off on Today as you go. Simple rules work best.';

  return (
    <Screen title="Plan">
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
        <TunasStill stage={Math.min(2, stageOf(countGood(data.log)))} mood="none" outfit={data.outfit} size={64} />
        <Txt v="callout" tone="ink2" style={{ flex: 1 }}>
          {tip}
        </Txt>
      </Card>

      <View>
        <SectionTitle title="Your plan" />
        <DietList value={data.diet} onChange={switchDiet} data={data} />
      </View>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Txt v="headline" accessibilityRole="header">
            Rules{' '}
            {list.length ? (
              <Txt v="headline" tone="ink3">
                {list.length}
              </Txt>
            ) : null}
          </Txt>
          {list.length ? (
            <Button
              small
              kind="quiet"
              title={isEditing ? 'Done' : 'Edit'}
              label={isEditing ? 'Done editing rules' : 'Edit rules'}
              onPress={() => setEditing(!editing)}
            />
          ) : null}
        </View>
        {list.length ? (
          list.map((rule, i) => (
            <View
              key={rule}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}
            >
              {isEditing ? (
                <Pressy
                  label={`Remove rule: ${rule}`}
                  onPress={() => removeRule(i)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: c.missed,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="minus" size={18} color={c.onMissed} />
                </Pressy>
              ) : null}
              <Pressy
                label={`${rule}. Edit rule`}
                squash={0.985}
                onPress={() => ui.open({ kind: 'rule', index: i })}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingVertical: 10 }}
              >
                <Txt v="body" style={{ flex: 1 }}>
                  {rule}
                </Txt>
                <Icon name="chevron-right" size={18} color={c.ink3} />
              </Pressy>
            </View>
          ))
        ) : (
          <Txt v="callout" tone="ink2" style={{ paddingVertical: 8 }}>
            No rules yet. Write your own, or tap a suggestion below.
          </Txt>
        )}
        <Pressy
          label="Add a rule"
          onPress={() => {
            setEditing(false);
            ui.open({ kind: 'rule', index: -1 });
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            minHeight: 50,
            marginTop: 6,
            paddingHorizontal: 12,
            borderRadius: RADIUS.control,
            backgroundColor: c.brandSoft,
          }}
        >
          <Icon name="plus" size={20} color={c.brandText} />
          <Txt v="bodyBold" tone="brand">
            Add a rule
          </Txt>
        </Pressy>
        {sugg.length ? (
          <View style={{ marginTop: 16, gap: 10 }}>
            <Txt v="label" tone="ink2">
              Ideas that work for many people
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {sugg.map((x) => (
                <Chip key={x} label={x} icon="plus" a11y={`Add rule: ${x}`} onPress={() => addRule(x)} />
              ))}
            </View>
          </View>
        ) : null}
      </Card>

      <WidgetsCard />

      <Card style={{ paddingVertical: 6 }}>
        <Row
          icon="bell"
          title="Daily reminder"
          sub={
            !remindersSupported
              ? 'Reminders work in the phone app'
              : data.reminderOn
                ? `${formatTime(parseClock(data.reminder))}, skipped once you’ve checked in`
                : 'Off'
          }
          onPress={() => ui.open({ kind: 'reminder' })}
        />
        <View style={{ paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: c.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                backgroundColor: c.surface2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="palette" size={19} color={c.ink2} />
            </View>
            <Txt v="bodyBold">Appearance</Txt>
          </View>
          <Segmented<ThemePref>
            label="Appearance"
            value={data.theme}
            onChange={store.setTheme}
            options={[
              { id: 'system', label: 'Automatic', a11y: 'Match the phone' },
              { id: 'light', label: 'Light' },
              { id: 'dark', label: 'Dark' },
            ]}
          />
          <Txt v="label" tone="ink2" style={{ marginTop: 4 }}>
            Tunas moving
          </Txt>
          <Segmented
            label="Tunas moving"
            value={data.calm ? 'still' : 'lively'}
            onChange={(v) => store.setCalm(v === 'still')}
            options={[
              { id: 'lively', label: 'Lively', a11y: 'Tunas breathes and blinks' },
              { id: 'still', label: 'Still', a11y: 'Tunas stays still' },
            ]}
          />
        </View>
        <Row icon="file" title="Backup and restore" sub="Keep a copy, or move to a new phone" onPress={() => ui.open({ kind: 'backup' })} />
        {demo ? (
          <Row
            icon="eye"
            title="Leave sample data"
            sub="Back to your own check-ins"
            onPress={() => {
              store.exitDemo();
              ui.toast('Back to your own data');
            }}
          />
        ) : (
          <Row
            icon="eye"
            title="Try sample data"
            sub="See seven weeks in, without touching your own"
            onPress={() => {
              store.enterDemo(new Date());
              ui.toast('Showing sample data');
            }}
          />
        )}
        <Row
          icon="restart"
          title="Start over"
          sub="Clear every answer and weigh-in"
          tint={c.danger}
          onPress={() => ui.open({ kind: 'reset' })}
          last
        />
      </Card>

      <Txt v="footnote" tone="ink3" center style={{ paddingHorizontal: 20 }}>
        Everything stays on this device. On Track has no account and sends nothing anywhere.
      </Txt>
    </Screen>
  );
}
